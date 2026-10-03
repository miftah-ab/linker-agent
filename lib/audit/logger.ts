/**
 * Audit Logger — Linker
 *
 * Spec: §22 Audit and Observability
 * Records every consequential action across Linker:
 *   - OAuth connections, token refreshes, revokes
 *   - LinkedIn publishing, draft approvals
 *   - Agent actions, tool invocations
 *   - MCP server requests and permission grants
 *   - Billing lifecycle events
 *
 * Invariant: Audit logs are append-only. Never updated or deleted.
 */

import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import type { AuditLogActorType, AuditLogResult, AgentActivityStatus, Json } from "@/lib/db/types";

export interface AuditLogEntry {
  accountId?: string | null;
  actorType: AuditLogActorType;
  actorId?: string | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  result: AuditLogResult;
  status: AgentActivityStatus;
  metadata?: Record<string, unknown> | null;
}

/**
 * Appends an entry to the audit_logs table using the service-role client.
 * Failures to write audit logs are logged to console.error but do not crash the caller.
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = createSupabaseServiceClient();

    const { error } = await supabase.from("audit_logs").insert({
      account_id: entry.accountId ?? null,
      actor_type: entry.actorType,
      actor_id: entry.actorId ?? null,
      action: entry.action,
      resource_type: entry.resourceType ?? null,
      resource_id: entry.resourceId ?? null,
      result: entry.result,
      status: entry.status,
      metadata: (entry.metadata as Json) ?? null,
    });

    if (error) {
      console.error("[AuditLog] Failed to persist audit entry:", error.message, entry);
    }
  } catch (err) {
    console.error("[AuditLog] Unexpected error persisting audit entry:", err);
  }
}
