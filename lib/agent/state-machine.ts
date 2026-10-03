/**
 * Agent State Machine — Linker
 *
 * Spec: §10 Agent Contract (Agent Lifecycle and OODA Loop)
 *
 * Lifecycle States:
 *   IDLE → OBSERVING → ANALYZING → OPPORTUNITY_FOUND → PLANNING
 *        → WAITING_FOR_APPROVAL → EXECUTING → MONITORING → LEARNING → IDLE
 *
 * Failure States:
 *   RETRYABLE_FAILURE | PERMANENT_FAILURE | USER_ACTION_REQUIRED
 */

import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { logAudit } from "@/lib/audit/logger";
import { AgentRulesEngine } from "./rules";
import type { AgentState, AgentFailureState, AgentStatusInfo } from "./types";

export class AgentStateMachine {
  constructor(private readonly accountId: string) {}

  /**
   * Retrieves the current agent operational status for this account.
   */
  async getStatus(): Promise<AgentStatusInfo> {
    const supabase = createSupabaseServiceClient();
    const rulesEngine = new AgentRulesEngine(this.accountId);
    const rules = await rulesEngine.getRules();

    // Query last activity
    const { data: lastActivity } = await supabase
      .from("agent_activity")
      .select("action, created_at")
      .eq("account_id", this.accountId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Query unreviewed opportunities
    const { count: oppCount } = await supabase
      .from("opportunities")
      .select("*", { count: "exact", head: true })
      .eq("account_id", this.accountId)
      .in("status", ["detected", "evaluated", "presented"]);

    // Query active drafts
    const { count: draftCount } = await supabase
      .from("content_drafts")
      .select("*", { count: "exact", head: true })
      .eq("account_id", this.accountId)
      .in("stage", ["draft", "critique", "user_feedback"]);

    return {
      state: "IDLE",
      isPaused: false,
      autonomyMode: rules.autonomyMode,
      lastRunAt: lastActivity?.created_at ?? null,
      lastAction: lastActivity?.action ?? null,
      activeDraftCount: draftCount ?? 0,
      unreviewedOpportunityCount: oppCount ?? 0,
    };
  }

  /**
   * Records an agent state transition in both agent_activity and audit_logs.
   */
  async transitionState(
    newState: AgentState | AgentFailureState,
    action: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const supabase = createSupabaseServiceClient();

    const isFailure =
      newState === "RETRYABLE_FAILURE" ||
      newState === "PERMANENT_FAILURE" ||
      newState === "USER_ACTION_REQUIRED";

    const activityStatus = isFailure
      ? (newState as "retryable_failure" | "permanent_failure" | "user_action_required")
      : "success";

    await supabase.from("agent_activity").insert({
      account_id: this.accountId,
      actor: "agent",
      action,
      trigger_source: "agent_loop",
      permission_rule: "state_transition",
      status: activityStatus,
      result: { state: newState, ...metadata },
    });

    await logAudit({
      accountId: this.accountId,
      actorType: "agent",
      actorId: "agent_state_machine",
      action: `agent.transition.${newState.toLowerCase()}`,
      resourceType: "agent_state",
      resourceId: this.accountId,
      result: isFailure ? "failure" : "success",
      status: activityStatus,
      metadata: { action, ...metadata },
    });
  }
}
