/**
 * LinkedIn Status Route Handler — Linker
 *
 * Spec: §16 LinkedIn Adapter Contract
 * Returns the current LinkedIn connection state for the authenticated account.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { getLinkedInConnection } from "@/lib/adapters/linkedin/token-store";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const connection = await getLinkedInConnection(auth.context.accountId);

  if (!connection) {
    return NextResponse.json({
      status: "disconnected",
      provider: "linkedin",
      connected: false,
    });
  }

  return NextResponse.json({
    status: connection.status,
    provider: "linkedin",
    connected: connection.status === "connected",
    providerAccountId: connection.providerAccountId,
    expiresAt: connection.expiresAt,
    scopes: connection.scopes,
  });
}
