/**
 * Account Connections API Route Handler — Linker
 *
 * Spec: §18.0 REST API Contract (GET /me/connections), §7 Authentication and Accounts
 * Returns external provider connections for the authenticated account.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const supabase = createSupabaseServiceClient();

  const { data: connections, error } = await supabase
    .from("connections")
    .select("id, provider, provider_account_id, status, scopes, token_expires_at, created_at, updated_at")
    .eq("account_id", auth.context.accountId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "server_error", message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    data: connections ?? [],
  });
}
