/**
 * Account Profile API Route Handler — Linker
 *
 * Spec: §18.0 REST API Contract (GET /me), §7 Authentication and Accounts
 * Returns authenticated account metadata and connected provider status.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const supabase = createSupabaseServiceClient();

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id, status, created_at, updated_at")
    .eq("id", auth.context.accountId)
    .single();

  if (accountError || !account) {
    return NextResponse.json({ error: "not_found", message: "Account not found." }, { status: 404 });
  }

  // Connections summary without secrets
  const { data: connections } = await supabase
    .from("connections")
    .select("id, provider, provider_account_id, status, scopes, token_expires_at, created_at, updated_at")
    .eq("account_id", auth.context.accountId);

  return NextResponse.json({
    ok: true,
    data: {
      account,
      connections: connections ?? [],
    },
  });
}
