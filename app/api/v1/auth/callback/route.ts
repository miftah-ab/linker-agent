/**
 * Supabase Auth Callback Route Handler — Linker
 *
 * Spec: §13 Web Session and Cookie Contract, §1.6 Authorization, §55 Open Redirect Prevention
 * Exchanges auth code for session cookies.
 * Ensures an accounts row exists for the newly authenticated user.
 */

import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { logAudit } from "@/lib/audit/logger";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  // Prevent open redirect: must be a local relative path, cannot start with "//"
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/auth/error?reason=missing_code", request.url));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("[AuthCallback] Code exchange failed:", error?.message);
    return NextResponse.redirect(new URL("/auth/error?reason=auth_failed", request.url));
  }

  const userId = data.user.id;

  // Ensure accounts row exists (idempotent insert)
  const serviceClient = createSupabaseServiceClient();
  const { error: accountError } = await serviceClient
    .from("accounts")
    .upsert({ id: userId, status: "active" }, { onConflict: "id" });

  if (accountError) {
    console.error("[AuthCallback] Failed to ensure account row:", accountError.message);
  }

  await logAudit({
    accountId: userId,
    actorType: "user",
    actorId: userId,
    action: "auth.session_established",
    resourceType: "account",
    resourceId: userId,
    result: "success",
    status: "success",
    metadata: { email: data.user.email },
  });

  return NextResponse.redirect(new URL(safeNext, request.url));
}
