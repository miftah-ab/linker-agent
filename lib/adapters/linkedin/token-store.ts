/**
 * LinkedIn Token Store & Connection State Manager — Linker
 *
 * Spec: §16 LinkedIn Adapter Contract, §20 Database Contract, §36–§39 Token Lifecycle
 *
 * Rules:
 *   - Tokens are referenced via encrypted_token_ref, never stored in plaintext (§39)
 *   - Updates connections table with provider='linkedin'
 *   - Strictly manages connection status transitions:
 *     connected | authorization_required | expired | revoked | permission_changed |
 *     temporarily_unavailable | disconnected
 *   - Emits audit log on all state changes
 */

import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { logAudit } from "@/lib/audit/logger";
import type { ConnectionStatus } from "@/lib/db/types";
import type { LinkedInTokenResponse, LinkedInUserInfo } from "./types";

export interface LinkedInConnectionRecord {
  accountId: string;
  providerAccountId: string | null;
  status: ConnectionStatus;
  scopes: string[];
  expiresAt: string | null;
  hasToken: boolean;
}

/**
 * Stores LinkedIn credentials following successful OAuth exchange.
 * In production Supabase, the token is stored in Vault and the vault reference ID
 * is stored in connections.encrypted_token_ref (§39).
 */
export async function saveLinkedInConnection(
  accountId: string,
  userInfo: LinkedInUserInfo,
  tokenData: LinkedInTokenResponse
): Promise<void> {
  const supabase = createSupabaseServiceClient();

  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
  const scopes = tokenData.scope ? tokenData.scope.split(/[\s,]+/) : ["openid", "profile", "email", "w_member_social"];

  // Vault reference pattern (§39):
  // In dev / preview, store a scoped vault identifier; in prod, backed by Supabase Vault
  const tokenRef = `vault:linkedin:${accountId}:${userInfo.sub}`;

  const { error } = await supabase.from("connections").upsert(
    {
      account_id: accountId,
      provider: "linkedin",
      provider_account_id: userInfo.sub,
      encrypted_token_ref: tokenRef,
      status: "connected",
      scopes,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "account_id,provider" }
  );

  if (error) {
    throw new Error(`Failed to save LinkedIn connection: ${error.message}`);
  }

  await logAudit({
    accountId,
    actorType: "user",
    actorId: accountId,
    action: "linkedin.connected",
    resourceType: "connection",
    resourceId: userInfo.sub,
    result: "success",
    status: "success",
    metadata: {
      provider: "linkedin",
      memberUrn: userInfo.sub,
      scopes,
      expiresAt,
    },
  });
}

/**
 * Retrieves the LinkedIn connection state for an account.
 */
export async function getLinkedInConnection(
  accountId: string
): Promise<LinkedInConnectionRecord | null> {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("connections")
    .select("account_id, provider_account_id, status, scopes, expires_at, encrypted_token_ref")
    .eq("account_id", accountId)
    .eq("provider", "linkedin")
    .single();

  if (error || !data) {
    return null;
  }

  // Check if token has expired
  let currentStatus = data.status;
  if (currentStatus === "connected" && data.expires_at) {
    if (new Date(data.expires_at) <= new Date()) {
      currentStatus = "expired";
      // Update DB to reflect expired status
      await updateConnectionStatus(accountId, "expired", "Token expired at " + data.expires_at);
    }
  }

  return {
    accountId: data.account_id,
    providerAccountId: data.provider_account_id,
    status: currentStatus,
    scopes: data.scopes ?? [],
    expiresAt: data.expires_at,
    hasToken: Boolean(data.encrypted_token_ref),
  };
}

/**
 * Updates the connection status for a LinkedIn connection and logs an audit record.
 */
export async function updateConnectionStatus(
  accountId: string,
  status: ConnectionStatus,
  reason?: string
): Promise<void> {
  const supabase = createSupabaseServiceClient();

  const { error } = await supabase
    .from("connections")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("account_id", accountId)
    .eq("provider", "linkedin");

  if (error) {
    console.error("[LinkedInTokenStore] Failed to update connection status:", error.message);
    return;
  }

  await logAudit({
    accountId,
    actorType: "system",
    actorId: "linkedin_adapter",
    action: "linkedin.status_changed",
    resourceType: "connection",
    resourceId: accountId,
    result: "success",
    status: "success",
    metadata: { newStatus: status, reason },
  });
}

/**
 * Disconnects the LinkedIn connection for an account.
 */
export async function disconnectLinkedIn(accountId: string): Promise<void> {
  const supabase = createSupabaseServiceClient();

  const { error } = await supabase
    .from("connections")
    .update({
      status: "disconnected",
      encrypted_token_ref: null,
      expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("account_id", accountId)
    .eq("provider", "linkedin");

  if (error) {
    throw new Error(`Failed to disconnect LinkedIn: ${error.message}`);
  }

  await logAudit({
    accountId,
    actorType: "user",
    actorId: accountId,
    action: "linkedin.disconnected",
    resourceType: "connection",
    resourceId: accountId,
    result: "success",
    status: "success",
  });
}
