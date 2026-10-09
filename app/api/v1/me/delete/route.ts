/**
 * Account Deletion API Route Handler — Linker
 *
 * Spec: §18.0 REST API Contract (POST /me/delete), §13.5 Data Lifecycle & Privacy
 * Deletes or disables the account, invalidates credentials, and records an audit log.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { logAudit } from "@/lib/audit/logger";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const accountId = auth.context.accountId;
  const supabase = createSupabaseServiceClient();

  try {
    // 1. Audit before deletion
    await logAudit({
      accountId,
      actorType: "user",
      actorId: accountId,
      action: "account.deletion_initiated",
      resourceType: "account",
      resourceId: accountId,
      result: "success",
      status: "success",
    });

    // 2. Mark account as deleted
    await supabase
      .from("accounts")
      .update({
        status: "deleted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", accountId);

    // 3. Mark all connections disconnected and strip tokens
    await supabase
      .from("connections")
      .update({
        status: "disconnected",
        encrypted_token_ref: null,
        updated_at: new Date().toISOString(),
      })
      .eq("account_id", accountId);

    // 4. Mark telegram connections unlinked
    await supabase
      .from("telegram_connections")
      .update({
        status: "unlinked",
        updated_at: new Date().toISOString(),
      })
      .eq("account_id", accountId);

    // 5. Cancel any pending scheduled jobs
    await supabase
      .from("scheduled_jobs")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("account_id", accountId)
      .eq("status", "pending");

    return NextResponse.json({
      ok: true,
      message: "Account and associated credentials have been deleted/deactivated successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "server_error", message }, { status: 500 });
  }
}
