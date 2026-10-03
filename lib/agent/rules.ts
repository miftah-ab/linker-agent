/**
 * Agent Rules & Permission Engine — Linker
 *
 * Spec: §10 Agent Contract (Permission Hierarchy)
 *
 * Permission Hierarchy Evaluation:
 *   1. Platform & safety constraints (e.g., cannot publish if connection disconnected, cannot bypass approval if rules mandate it)
 *   2. Explicit prohibitions (forbidden topics)
 *   3. Explicit permissions (allowed topics)
 *   4. Autonomy mode (manual vs assisted vs autonomous)
 *   5. Strategy alignment
 *   6. Agent judgment
 */

import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import {
  type AgentRules,
  DEFAULT_AGENT_RULES,
  type PermissionCheckResult,
} from "./types";
import type { Json } from "@/lib/db/types";

export class AgentRulesEngine {
  constructor(private readonly accountId: string) {}

  /**
   * Loads current rules for the account, falling back to defaults.
   */
  async getRules(): Promise<AgentRules> {
    const supabase = createSupabaseServiceClient();
    const { data } = await supabase
      .from("agent_rules")
      .select("value, enabled")
      .eq("account_id", this.accountId)
      .eq("rule_type", "general_rules")
      .single();

    if (!data || !data.value) {
      return DEFAULT_AGENT_RULES;
    }

    const val = data.value as unknown as Partial<AgentRules>;
    return {
      autonomyMode: val.autonomyMode ?? DEFAULT_AGENT_RULES.autonomyMode,
      maxDailyPosts: val.maxDailyPosts ?? DEFAULT_AGENT_RULES.maxDailyPosts,
      requireApprovalForPublish: val.requireApprovalForPublish ?? DEFAULT_AGENT_RULES.requireApprovalForPublish,
      allowedTopics: val.allowedTopics ?? DEFAULT_AGENT_RULES.allowedTopics,
      forbiddenTopics: val.forbiddenTopics ?? DEFAULT_AGENT_RULES.forbiddenTopics,
      allowDirectPublish: val.allowDirectPublish ?? DEFAULT_AGENT_RULES.allowDirectPublish,
    };
  }

  /**
   * Updates agent rules.
   */
  async updateRules(updates: Partial<AgentRules>): Promise<AgentRules> {
    const current = await this.getRules();
    const updated: AgentRules = { ...current, ...updates };

    const supabase = createSupabaseServiceClient();
    await supabase.from("agent_rules").upsert(
      {
        account_id: this.accountId,
        rule_type: "general_rules",
        value: updated as unknown as Json,
        enabled: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "account_id,rule_type" }
    );

    return updated;
  }

  /**
   * Evaluates whether the agent is permitted to publish directly without human approval.
   */
  async canPublishDirectly(topic?: string): Promise<PermissionCheckResult> {
    const rules = await this.getRules();

    // 1. Platform / Safety constraints (§10)
    if (rules.requireApprovalForPublish) {
      return {
        allowed: false,
        reason: "Agent rule mandates explicit human approval for all publications.",
        level: "platform_constraint",
      };
    }

    // 2. Explicit prohibition (§10)
    if (topic && rules.forbiddenTopics.length > 0) {
      const isForbidden = rules.forbiddenTopics.some((t) =>
        topic.toLowerCase().includes(t.toLowerCase())
      );
      if (isForbidden) {
        return {
          allowed: false,
          reason: `Topic "${topic}" violates account explicit prohibition list.`,
          level: "explicit_prohibition",
        };
      }
    }

    // 3. Autonomy mode check (§10)
    if (rules.autonomyMode === "manual" || rules.autonomyMode === "assisted") {
      return {
        allowed: false,
        reason: `Current autonomy mode (${rules.autonomyMode}) requires user confirmation.`,
        level: "autonomy_mode",
      };
    }

    // 4. Allowed if in autonomous mode and direct publish is enabled
    if (rules.autonomyMode === "autonomous" && rules.allowDirectPublish) {
      return {
        allowed: true,
        reason: "Autonomous publishing permitted by verified rules.",
        level: "autonomy_mode",
      };
    }

    return {
      allowed: false,
      reason: "Publishing requires manual review.",
      level: "agent_judgment",
    };
  }
}
