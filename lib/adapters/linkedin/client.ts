/**
 * LinkedIn API Client — Linker
 *
 * Spec: §16 LinkedIn Adapter Contract, §20.2 Database Invariants (idempotency, unique post IDs)
 *
 * Rules:
 *   - The LinkedIn Adapter owns all LinkedIn API surface (§16)
 *   - Agent and business logic never receive raw OAuth tokens (§16)
 *   - Enforces idempotency key uniqueness before calling LinkedIn
 *   - Handles 429 rate limiting gracefully
 *   - Handles 401/403 by updating connection status to 'authorization_required'
 *   - Records published post in published_posts table
 */

import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { logAudit } from "@/lib/audit/logger";
import { getLinkedInConnection, updateConnectionStatus } from "./token-store";
import {
  type LinkedInPublishRequest,
  type LinkedInPublishResponse,
  LinkedInApiError,
} from "./types";

const LINKEDIN_API_BASE = "https://api.linkedin.com/v2";

export class LinkedInClient {
  constructor(private readonly accountId: string) {}

  /**
   * Publishes a post to LinkedIn with strict idempotency enforcement (§20.2).
   */
  async publishPost(
    request: LinkedInPublishRequest,
    draftId?: string
  ): Promise<LinkedInPublishResponse> {
    const supabase = createSupabaseServiceClient();

    // 1. Check idempotency: Has this post already been published?
    const { data: existingPost } = await supabase
      .from("published_posts")
      .select("id, platform_post_id, status, published_at")
      .eq("account_id", this.accountId)
      .eq("idempotency_key", request.idempotencyKey)
      .single();

    if (existingPost && existingPost.status === "published" && existingPost.platform_post_id) {
      // Idempotent return — return existing publication record without duplicate API call
      return {
        platformPostId: existingPost.platform_post_id,
        urn: `urn:li:share:${existingPost.platform_post_id}`,
        publishedAt: existingPost.published_at || new Date().toISOString(),
      };
    }

    // 2. Validate connection state
    const connection = await getLinkedInConnection(this.accountId);
    if (!connection || connection.status !== "connected") {
      throw new LinkedInApiError(
        `LinkedIn connection is not active (current status: ${connection?.status ?? "not_connected"}).`,
        401
      );
    }

    if (!connection.providerAccountId) {
      throw new LinkedInApiError("LinkedIn provider account ID (member URN) is missing.", 400);
    }

    // 3. Insert or update published_posts in 'pending' status
    const { data: postRecord, error: insertError } = await supabase
      .from("published_posts")
      .upsert(
        {
          account_id: this.accountId,
          draft_id: draftId ?? null,
          platform: "linkedin",
          status: "pending",
          idempotency_key: request.idempotencyKey,
          body_snapshot: request.text,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "account_id,idempotency_key" }
      )
      .select("id")
      .single();

    if (insertError) {
      throw new Error(`Failed to record publication intent: ${insertError.message}`);
    }

    const postId = postRecord.id;

    // 4. In development/testing when simulated or real token is present:
    // Make request to LinkedIn UGC post API
    const ugcPayload = {
      author: request.authorUrn.startsWith("urn:li:")
        ? request.authorUrn
        : `urn:li:person:${request.authorUrn}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: request.text,
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    let platformPostId = "";
    let urn = "";

    try {
      // We perform the API call with the token resolved server-side
      const response = await fetch(`${LINKEDIN_API_BASE}/ugcPosts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
          // Bearer token is injected here server-side, never exposed to caller
          Authorization: `Bearer ${process.env.LINKEDIN_CLIENT_SECRET}`,
        },
        body: JSON.stringify(ugcPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();

        if (response.status === 401 || response.status === 403) {
          await updateConnectionStatus(
            this.accountId,
            "authorization_required",
            `LinkedIn API returned HTTP ${response.status}: ${errorText}`
          );
        } else if (response.status === 429) {
          await updateConnectionStatus(
            this.accountId,
            "temporarily_unavailable",
            "Rate limited by LinkedIn API (HTTP 429)"
          );
        }

        // Record failure in published_posts
        await supabase
          .from("published_posts")
          .update({
            status: "failed",
            failure_reason: `HTTP ${response.status}: ${errorText}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", postId);

        throw new LinkedInApiError(
          `LinkedIn publication failed: HTTP ${response.status}`,
          response.status,
          errorText
        );
      }

      const result = (await response.json()) as { id?: string };
      urn = result.id || `urn:li:share:${Date.now()}`;
      platformPostId = urn.replace("urn:li:share:", "").replace("urn:li:ugcPost:", "");
    } catch (err: unknown) {
      if (err instanceof LinkedInApiError) {
        throw err;
      }
      const errorMessage = err instanceof Error ? err.message : String(err);
      await supabase
        .from("published_posts")
        .update({
          status: "failed",
          failure_reason: errorMessage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId);

      throw err;
    }

    const publishedAt = new Date().toISOString();

    // 5. Update published_posts with platform post ID and published status
    await supabase
      .from("published_posts")
      .update({
        platform_post_id: platformPostId,
        status: "published",
        published_at: publishedAt,
        updated_at: publishedAt,
      })
      .eq("id", postId);

    // 6. Record in audit log
    await logAudit({
      accountId: this.accountId,
      actorType: "agent",
      actorId: "linkedin_adapter",
      action: "linkedin.post_published",
      resourceType: "published_post",
      resourceId: postId,
      result: "success",
      status: "success",
      metadata: {
        platformPostId,
        urn,
        idempotencyKey: request.idempotencyKey,
      },
    });

    return {
      platformPostId,
      urn,
      publishedAt,
    };
  }
}
