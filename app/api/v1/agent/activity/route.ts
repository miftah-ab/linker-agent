/**
 * Agent Activity Route Handler — Linker
 *
 * Spec: §10 Agent Contract, §22 Audit & Observability
 * Returns chronological agent activity entries for the authenticated account.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("agent_activity")
    .select("id, actor, action, resource_type, resource_id, trigger_source, permission_rule, result, status, external_id, error_message, created_at")
    .eq("account_id", auth.context.accountId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: "server_error", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: data ?? [] });
}
