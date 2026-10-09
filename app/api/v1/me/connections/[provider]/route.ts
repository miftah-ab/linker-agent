/**
 * Delete / Disconnect Provider Connection Route Handler — Linker
 *
 * Spec: §18.0 REST API Contract (DELETE /me/connections/:provider), §36 Connection Lifecycle
 * Disconnects the external provider connection safely and records audit event.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import type { ConnectionProvider } from "@/lib/db/types";
import { logAudit } from "@/lib/audit/logger";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { provider } = await context.params;
  const normalizedProvider = provider.toLowerCase();

  const supabase = createSupabaseServiceClient();

  // Find existing connection
  const { data: connection } = await supabase
    .from("connections")
    .select("id, status")
    .eq("account_id", auth.context.accountId)
    .eq("provider", normalizedProvider as ConnectionProvider)
    .single();

  if (!connection) {
    return NextResponse.json(
      { error: "not_found", message: `No connection found for provider '${normalizedProvider}'.` },
      { status: 404 }
    );
  }

  // Update status to disconnected and clear secret ref
  const { error } = await supabase
    .from("connections")
    .update({
      status: "disconnected",
      encrypted_token_ref: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", connection.id)
    .eq("account_id", auth.context.accountId);

  if (error) {
    return NextResponse.json({ error: "server_error", message: error.message }, { status: 500 });
  }

  // If telegram, mark telegram_connections as unlinked as well
  if (normalizedProvider === "telegram") {
    await supabase
      .from("telegram_connections")
      .update({
        status: "unlinked",
        updated_at: new Date().toISOString(),
      })
      .eq("account_id", auth.context.accountId);
  }

  await logAudit({
    accountId: auth.context.accountId,
    actorType: "user",
    actorId: auth.context.accountId,
    action: `connection.disconnected.${normalizedProvider}`,
    resourceType: "connection",
    resourceId: connection.id,
    result: "success",
    status: "success",
    metadata: { provider: normalizedProvider },
  });

  return NextResponse.json({
    ok: true,
    message: `Provider '${normalizedProvider}' disconnected successfully.`,
  });
}
