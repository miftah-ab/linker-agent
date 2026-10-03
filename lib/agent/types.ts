/**
 * Agent Types & State Machine Definitions — Linker
 *
 * Spec: §10 Agent Contract
 * Defines the core state machine, autonomy modes, permission hierarchy, and rules schema.
 */

export type AgentState =
  | "IDLE"
  | "OBSERVING"
  | "ANALYZING"
  | "OPPORTUNITY_FOUND"
  | "PLANNING"
  | "WAITING_FOR_APPROVAL"
  | "EXECUTING"
  | "MONITORING"
  | "LEARNING";

export type AgentFailureState =
  | "RETRYABLE_FAILURE"
  | "PERMANENT_FAILURE"
  | "USER_ACTION_REQUIRED";

export type AutonomyMode = "manual" | "assisted" | "scheduled" | "autonomous";

export interface AgentRules {
  autonomyMode: AutonomyMode;
  maxDailyPosts: number;
  requireApprovalForPublish: boolean;
  allowedTopics: string[];
  forbiddenTopics: string[];
  allowDirectPublish: boolean;
}

export const DEFAULT_AGENT_RULES: AgentRules = {
  autonomyMode: "assisted",
  maxDailyPosts: 2,
  requireApprovalForPublish: true,
  allowedTopics: [],
  forbiddenTopics: [],
  allowDirectPublish: false,
};

export interface AgentStatusInfo {
  state: AgentState;
  isPaused: boolean;
  autonomyMode: AutonomyMode;
  lastRunAt: string | null;
  lastAction: string | null;
  activeDraftCount: number;
  unreviewedOpportunityCount: number;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason: string;
  level: "platform_constraint" | "explicit_prohibition" | "explicit_permission" | "autonomy_mode" | "strategy" | "agent_judgment";
}
