/**
 * Analytics Collector & Aggregator — Linker
 *
 * Spec: §20.2 Database Contract (Historical Snapshots Invariant)
 * Invariant:
 *   - Metrics are recorded as immutable snapshots, NEVER destructive overwrites (§20.2)
 *   - Aggregations compute trends across time without data loss
 */

import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { logAudit } from "@/lib/audit/logger";
import type { Json } from "@/lib/db/types";

export interface PostMetricsData {
  impressions: number;
  reactions: number;
  comments: number;
  reposts: number;
  clicks?: number;
  engagementRate?: number;
}

export interface AnalyticsOverview {
  totalPublishedPosts: number;
  totalImpressions: number;
  totalReactions: number;
  totalComments: number;
  totalReposts: number;
  averageEngagementRate: number;
}

export class AnalyticsCollector {
  constructor(private readonly accountId: string) {}

  /**
   * Records an immutable snapshot of metrics for a published post.
   */
  async recordSnapshot(
    postId: string,
    metrics: PostMetricsData,
    snapshotTime?: string
  ): Promise<string> {
    const supabase = createSupabaseServiceClient();
    const snapshotAt = snapshotTime || new Date().toISOString();

    // Verify post belongs to account
    const { data: post } = await supabase
      .from("published_posts")
      .select("id")
      .eq("id", postId)
      .eq("account_id", this.accountId)
      .single();

    if (!post) {
      throw new Error("Post not found or does not belong to this account.");
    }

    const { data, error } = await supabase
      .from("analytics_snapshots")
      .insert({
        account_id: this.accountId,
        post_id: postId,
        platform: "linkedin",
        snapshot_at: snapshotAt,
        data: metrics as unknown as Json,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Failed to record analytics snapshot: ${error.message}`);
    }

    await logAudit({
      accountId: this.accountId,
      actorType: "system",
      actorId: "analytics_collector",
      action: "analytics.snapshot_recorded",
      resourceType: "analytics_snapshot",
      resourceId: data.id,
      result: "success",
      status: "success",
      metadata: { postId, metrics },
    });

    return data.id;
  }

  /**
   * Retrieves the historical snapshot series for a specific post.
   */
  async getPostSnapshots(postId: string) {
    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("analytics_snapshots")
      .select("id, post_id, snapshot_at, data, created_at")
      .eq("account_id", this.accountId)
      .eq("post_id", postId)
      .order("snapshot_at", { ascending: true });

    if (error || !data) return [];
    return data;
  }

  /**
   * Computes high-level overview metrics across the account's latest post snapshots.
   */
  async getOverview(): Promise<AnalyticsOverview> {
    const supabase = createSupabaseServiceClient();

    // Count published posts
    const { data: posts } = await supabase
      .from("published_posts")
      .select("id")
      .eq("account_id", this.accountId)
      .eq("status", "published");

    const postIds = (posts ?? []).map((p) => p.id);
    if (postIds.length === 0) {
      return {
        totalPublishedPosts: 0,
        totalImpressions: 0,
        totalReactions: 0,
        totalComments: 0,
        totalReposts: 0,
        averageEngagementRate: 0,
      };
    }

    // Retrieve snapshots for these posts
    const { data: snapshots } = await supabase
      .from("analytics_snapshots")
      .select("post_id, data, snapshot_at")
      .eq("account_id", this.accountId)
      .order("snapshot_at", { ascending: false });

    // Deduplicate to get the latest snapshot per post
    const latestPerPost = new Map<string, PostMetricsData>();
    for (const snap of snapshots ?? []) {
      if (!latestPerPost.has(snap.post_id)) {
        latestPerPost.set(snap.post_id, snap.data as unknown as PostMetricsData);
      }
    }

    let totalImpressions = 0;
    let totalReactions = 0;
    let totalComments = 0;
    let totalReposts = 0;

    for (const m of latestPerPost.values()) {
      totalImpressions += m.impressions || 0;
      totalReactions += m.reactions || 0;
      totalComments += m.comments || 0;
      totalReposts += m.reposts || 0;
    }

    const totalEngagements = totalReactions + totalComments + totalReposts;
    const avgRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0;

    return {
      totalPublishedPosts: postIds.length,
      totalImpressions,
      totalReactions,
      totalComments,
      totalReposts,
      averageEngagementRate: Number(avgRate.toFixed(2)),
    };
  }
}
