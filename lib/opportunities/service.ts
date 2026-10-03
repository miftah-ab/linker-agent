/**
 * Opportunity Engine Service — Linker
 *
 * Spec: §11 Opportunity Engine Contract
 * Lifecycle:
 *   detected → evaluated → presented → accepted → rejected → ignored → acted → measured → learned → archived
 *
 * Invariant: Every opportunity is strictly account-isolated with verified relevance scoring.
 */

import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { logAudit } from "@/lib/audit/logger";
import type {
  OpportunityType,
  OpportunityLifecycleStatus,
  Json,
} from "@/lib/db/types";

export interface CreateOpportunityInput {
  opportunityType: OpportunityType;
  title: string;
  description?: string;
  relevanceScore: number;
  evidence?: Record<string, unknown>;
}

export interface OpportunityItem {
  id: string;
  opportunityType: OpportunityType;
  title: string | null;
  description: string | null;
  relevanceScore: number | null;
  evidence: Json | null;
  status: OpportunityLifecycleStatus;
  detectedAt: string;
  presentedAt: string | null;
  actedAt: string | null;
}

export class OpportunityService {
  constructor(private readonly accountId: string) {}

  /**
   * Lists opportunities for the account with optional status filtering.
   */
  async listOpportunities(
    status?: OpportunityLifecycleStatus,
    limit = 50
  ): Promise<OpportunityItem[]> {
    const supabase = createSupabaseServiceClient();

    let query = supabase
      .from("opportunities")
      .select("id, opportunity_type, title, description, relevance_score, evidence, status, detected_at, presented_at, acted_at")
      .eq("account_id", this.accountId)
      .order("relevance_score", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      opportunityType: row.opportunity_type,
      title: row.title,
      description: row.description,
      relevanceScore: row.relevance_score ? Number(row.relevance_score) : null,
      evidence: row.evidence,
      status: row.status,
      detectedAt: row.detected_at,
      presentedAt: row.presented_at,
      actedAt: row.acted_at,
    }));
  }

  /**
   * Creates a newly detected opportunity.
   */
  async createOpportunity(input: CreateOpportunityInput): Promise<string> {
    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("opportunities")
      .insert({
        account_id: this.accountId,
        opportunity_type: input.opportunityType,
        title: input.title,
        description: input.description ?? null,
        relevance_score: Math.min(Math.max(input.relevanceScore, 0), 1),
        evidence: (input.evidence as Json) ?? null,
        status: "detected",
        detected_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Failed to create opportunity: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Transitions an opportunity's lifecycle state with audit logging.
   */
  async transitionStatus(
    opportunityId: string,
    newStatus: OpportunityLifecycleStatus,
    reason?: string
  ): Promise<void> {
    const supabase = createSupabaseServiceClient();

    const now = new Date().toISOString();
    const updatePayload: import("@/lib/db/types").Database["public"]["Tables"]["opportunities"]["Update"] = {
      status: newStatus,
      updated_at: now,
    };

    if (newStatus === "presented") updatePayload.presented_at = now;
    if (newStatus === "acted") updatePayload.acted_at = now;
    if (newStatus === "archived") updatePayload.archived_at = now;

    const { error } = await supabase
      .from("opportunities")
      .update(updatePayload)
      .eq("id", opportunityId)
      .eq("account_id", this.accountId);

    if (error) {
      throw new Error(`Failed to update opportunity status: ${error.message}`);
    }

    await logAudit({
      accountId: this.accountId,
      actorType: "user",
      actorId: this.accountId,
      action: `opportunity.${newStatus}`,
      resourceType: "opportunity",
      resourceId: opportunityId,
      result: "success",
      status: "success",
      metadata: { newStatus, reason },
    });
  }
}
