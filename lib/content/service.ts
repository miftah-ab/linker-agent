/**
 * Content Intelligence Service — Linker
 *
 * Spec: §12 Content Intelligence Contract, §20 Database Contract
 *
 * Pipeline Stages:
 *   draft → critique → user_feedback → final → scheduled → published → discarded
 *
 * Invariants:
 *   - Every draft edit creates an immutable content_version snapshot
 *   - Anti-AI validation is run on creation and modification
 *   - Approvals are explicitly recorded with timestamp and approver ID
 */

import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { logAudit } from "@/lib/audit/logger";
import { runAntiAiAudit } from "./anti-ai";
import { completePrompt } from "@/lib/ai/model-router";
import type {
  ContentDraftStage,
  ContentIdeaStatus,
  Json,
} from "@/lib/db/types";

export interface CreateIdeaInput {
  opportunityId?: string;
  title: string;
  angle?: string;
  thesis?: string;
  evidence?: Record<string, unknown>;
}

export interface CreateDraftInput {
  ideaId?: string;
  title: string;
  body: string;
}

export interface UpdateDraftInput {
  title?: string;
  body?: string;
  stage?: ContentDraftStage;
  userFeedback?: string;
  reason?: string;
}

export class ContentService {
  constructor(private readonly accountId: string) {}

  // -------------------------------------------------------------------------
  // Content Ideas
  // -------------------------------------------------------------------------
  async listIdeas(status?: ContentIdeaStatus, limit = 50) {
    const supabase = createSupabaseServiceClient();
    let query = supabase
      .from("content_ideas")
      .select("id, opportunity_id, title, angle, thesis, evidence, status, created_at, updated_at")
      .eq("account_id", this.accountId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data;
  }

  async createIdea(input: CreateIdeaInput): Promise<string> {
    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("content_ideas")
      .insert({
        account_id: this.accountId,
        opportunity_id: input.opportunityId ?? null,
        title: input.title,
        angle: input.angle ?? null,
        thesis: input.thesis ?? null,
        evidence: (input.evidence as Json) ?? null,
        status: "idea",
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Failed to create content idea: ${error.message}`);
    }

    return data.id;
  }

  // -------------------------------------------------------------------------
  // Content Drafts
  // -------------------------------------------------------------------------
  async listDrafts(stage?: ContentDraftStage, limit = 50) {
    const supabase = createSupabaseServiceClient();
    let query = supabase
      .from("content_drafts")
      .select("id, idea_id, title, body, stage, anti_ai_flags, voice_score, critique, user_feedback, approved_at, created_at, updated_at")
      .eq("account_id", this.accountId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (stage) {
      query = query.eq("stage", stage);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data;
  }

  async getDraft(draftId: string) {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("content_drafts")
      .select("*")
      .eq("id", draftId)
      .eq("account_id", this.accountId)
      .single();

    if (error || !data) return null;
    return data;
  }

  async createDraft(input: CreateDraftInput): Promise<string> {
    const supabase = createSupabaseServiceClient();

    // Run anti-AI audit
    const antiAiResult = runAntiAiAudit(input.body);

    const { data, error } = await supabase
      .from("content_drafts")
      .insert({
        account_id: this.accountId,
        idea_id: input.ideaId ?? null,
        title: input.title,
        body: input.body,
        stage: "draft",
        anti_ai_flags: antiAiResult.flags as unknown as Json,
        voice_score: antiAiResult.score,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Failed to create draft: ${error.message}`);
    }

    const draftId = data.id;

    // Snapshot version 1 in content_versions
    await supabase.from("content_versions").insert({
      account_id: this.accountId,
      draft_id: draftId,
      version: 1,
      body: input.body,
      stage: "draft",
      changed_by: "initial_creation",
      reason: "Initial draft creation",
    });

    await logAudit({
      accountId: this.accountId,
      actorType: "agent",
      actorId: "content_service",
      action: "content.draft_created",
      resourceType: "content_draft",
      resourceId: draftId,
      result: "success",
      status: "success",
    });

    return draftId;
  }

  async updateDraft(draftId: string, updates: UpdateDraftInput): Promise<void> {
    const supabase = createSupabaseServiceClient();

    const existing = await this.getDraft(draftId);
    if (!existing) {
      throw new Error("Draft not found.");
    }

    // Determine new version number
    const { data: latestVersion } = await supabase
      .from("content_versions")
      .select("version")
      .eq("draft_id", draftId)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    const nextVersion = (latestVersion?.version ?? 0) + 1;
    const newBody = updates.body ?? existing.body;
    const newStage = updates.stage ?? existing.stage;

    // Run anti-AI audit on new body
    const antiAi = runAntiAiAudit(newBody);

    const updatePayload: import("@/lib/db/types").Database["public"]["Tables"]["content_drafts"]["Update"] = {
      title: updates.title ?? existing.title,
      body: newBody,
      stage: newStage,
      user_feedback: updates.userFeedback ?? existing.user_feedback,
      anti_ai_flags: antiAi.flags as unknown as Json,
      voice_score: antiAi.score,
      updated_at: new Date().toISOString(),
    };

    if (newStage === "final" && existing.stage !== "final") {
      updatePayload.approved_at = new Date().toISOString();
      updatePayload.approved_by = this.accountId;
    }

    const { error } = await supabase
      .from("content_drafts")
      .update(updatePayload)
      .eq("id", draftId)
      .eq("account_id", this.accountId);

    if (error) {
      throw new Error(`Failed to update draft: ${error.message}`);
    }

    // Record immutable version
    if (updates.body && updates.body !== existing.body) {
      await supabase.from("content_versions").insert({
        account_id: this.accountId,
        draft_id: draftId,
        version: nextVersion,
        body: newBody,
        stage: newStage,
        changed_by: "user",
        reason: updates.reason ?? "Content revised",
      });
    }

    await logAudit({
      accountId: this.accountId,
      actorType: "user",
      actorId: this.accountId,
      action: `content.draft_updated.${newStage}`,
      resourceType: "content_draft",
      resourceId: draftId,
      result: "success",
      status: "success",
    });
  }

  /**
   * Generates a multi-dimensional AI critique for a draft.
   */
  async generateCritique(draftId: string): Promise<Record<string, unknown>> {
    const draft = await this.getDraft(draftId);
    if (!draft) throw new Error("Draft not found.");

    const systemPrompt = `You are Linker's Content Intelligence Critic.
Critique the provided LinkedIn draft rigorously against professional impact standards.
Analyze:
1. Hook strength: Does it stop the scroll in under 2 seconds?
2. Authenticity & Voice: Does it sound like an authentic human executive or synthetic AI?
3. Value density: Is there a clear, actionable takeaway?
4. Formatting & Flow: Are the line breaks and cadence optimized for mobile LinkedIn reading?

Respond in JSON format:
{
  "hookScore": number between 1 and 10,
  "hookFeedback": string,
  "voiceScore": number between 1 and 10,
  "voiceFeedback": string,
  "valueScore": number between 1 and 10,
  "overallVerdict": "needs_revision" | "approved",
  "suggestedRevisions": string[]
}`;

    const userPrompt = `Draft Title: ${draft.title ?? "Untitled"}\n\nDraft Content:\n${draft.body}`;

    const completion = await completePrompt({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      jsonMode: true,
    });

    let critiqueData: Record<string, unknown> = {};
    try {
      critiqueData = JSON.parse(completion.text);
    } catch {
      critiqueData = { rawCritique: completion.text };
    }

    // Save critique to draft
    const supabase = createSupabaseServiceClient();
    await supabase
      .from("content_drafts")
      .update({
        critique: critiqueData as unknown as Json,
        stage: "critique",
        updated_at: new Date().toISOString(),
      })
      .eq("id", draftId)
      .eq("account_id", this.accountId);

    return critiqueData;
  }
}
