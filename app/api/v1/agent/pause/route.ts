/**
 * Agent Pause & Resume Route Handlers — Linker
 *
 * Spec: §10 Agent Contract (Emergency Pause Control)
 * Allows user to immediately pause or resume autonomous agent execution.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { logAudit } from "@/lib/audit/logger";
import { verifyCsrf } from "@/lib/security/csrf";
import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const supabase = createSupabaseServiceClient();

  // Record paused state in agent_rules
  await supabase.from("agent_rules").upsert(
    {
      account_id: auth.context.accountId,
      rule_type: "execution_paused",
      value: { paused: true, pausedAt: new Date().toISOString() },
      enabled: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "account_id,rule_type" }
  );

  await logAudit({
    accountId: auth.context.accountId,
    actorType: "user",
    actorId: auth.context.userId,
    action: "agent.paused",
    resourceType: "agent",
    resourceId: auth.context.accountId,
    result: "success",
    status: "success",
  });

  return NextResponse.json({ ok: true, paused: true, message: "Agent execution paused." });
}
