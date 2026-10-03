/**
 * Publishing Service — Linker
 *
 * Spec: §16 LinkedIn Adapter Contract, §20.2 Invariants (Idempotency & Platform Post Deduplication)
 * Publishes approved drafts to LinkedIn with strict idempotency keys.
 */

import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { LinkedInClient } from "@/lib/adapters/linkedin/client";
import { logAudit } from "@/lib/audit/logger";
import { ContentService } from "@/lib/content/service";
import { AgentRulesEngine } from "@/lib/agent/rules";

export interface PublishResult {
  publishedPostId: string;
  platformPostId: string;
  urn: string;
  publishedAt: string;
}

export class PublishingService {
  constructor(private readonly accountId: string) {}

  /**
   * Publishes an approved content draft to LinkedIn.
   * Enforces rules, approval verification, and idempotency.
   */
  async publishDraft(draftId: string, customIdempotencyKey?: string): Promise<PublishResult> {
    const contentService = new ContentService(this.accountId);
    const draft = await contentService.getDraft(draftId);

    if (!draft) {
      throw new Error("Draft not found.");
    }

    if (draft.stage === "published") {
      throw new Error("Draft has already been published.");
    }

    // Check rules: does this draft require approval?
    const rulesEngine = new AgentRulesEngine(this.accountId);
    const rules = await rulesEngine.getRules();

    if (rules.requireApprovalForPublish && draft.stage !== "final") {
      throw new Error(
        `Draft cannot be published: status is '${draft.stage}', but explicit approval is required before publishing.`
      );
    }

    // Formulate a deterministic idempotency key for this draft if not supplied
    const idempotencyKey = customIdempotencyKey || `pub:${this.accountId}:${draftId}:${draft.updated_at}`;

    const supabase = createSupabaseServiceClient();

    // Check connection provider_account_id (member URN)
    const { data: connection } = await supabase
      .from("connections")
      .select("provider_account_id, status")
      .eq("account_id", this.accountId)
      .eq("provider", "linkedin")
      .single();

    if (!connection || connection.status !== "connected" || !connection.provider_account_id) {
      throw new Error("LinkedIn connection is not active or authorized.");
    }

    const client = new LinkedInClient(this.accountId);
    const response = await client.publishPost(
      {
        authorUrn: connection.provider_account_id,
        text: draft.body,
        idempotencyKey,
      },
      draftId
    );

    // Update draft stage to 'published'
    await supabase
      .from("content_drafts")
      .update({
        stage: "published",
        updated_at: new Date().toISOString(),
      })
      .eq("id", draftId)
      .eq("account_id", this.accountId);

    await logAudit({
      accountId: this.accountId,
      actorType: "user",
      actorId: this.accountId,
      action: "publishing.post_executed",
      resourceType: "published_post",
      resourceId: response.platformPostId,
      result: "success",
      status: "success",
      metadata: {
        draftId,
        platformPostId: response.platformPostId,
        idempotencyKey,
      },
    });

    return {
      publishedPostId: draftId,
      platformPostId: response.platformPostId,
      urn: response.urn,
      publishedAt: response.publishedAt,
    };
  }
}
