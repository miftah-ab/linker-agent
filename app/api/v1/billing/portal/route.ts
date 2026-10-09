/**
 * Billing Portal Route Handler — Linker
 *
 * Spec: §18.0 REST API Contract (POST /billing/portal), §12 Billing Contract (Polar.sh)
 * Returns a Polar customer portal URL so the user can manage their subscription.
 * The portal URL is constructed from the POLAR_ORGANIZATION_ID environment variable.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const orgId = serverEnv.POLAR_ORGANIZATION_ID;

    // Polar customer portal URL for the organisation
    // The portal resolves the customer by the authenticated session through Polar.sh
    const portalUrl = `https://polar.sh/${orgId}/portal`;

    return NextResponse.json({ ok: true, portalUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "server_error", message }, { status: 500 });
  }
}
