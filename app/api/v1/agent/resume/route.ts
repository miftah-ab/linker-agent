/**
 * Agent Resume Route Handler — Linker
 *
 * Spec: §10 Agent Contract
 * Resumes paused agent execution.
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

  await supabase.from("agent_rules").upsert(
    {
      account_id: auth.context.accountId,
      rule_type: "execution_paused",
      value: { paused: false, resumedAt: new Date().toISOString() },
      enabled: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "account_id,rule_type" }
  );

  await logAudit({
    accountId: auth.context.accountId,
    actorType: "user",
    actorId: auth.context.userId,
    action: "agent.resumed",
    resourceType: "agent",
    resourceId: auth.context.accountId,
    result: "success",
    status: "success",
  });

  return NextResponse.json({ ok: true, paused: false, message: "Agent execution resumed." });
}
