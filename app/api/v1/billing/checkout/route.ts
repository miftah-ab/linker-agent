/**
 * Billing Checkout Route Handler — Linker
 *
 * Spec: §12 Billing Contract (Polar.sh)
 * Generates an authenticated checkout session URL for Pro plan upgrades.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { BillingService } from "@/lib/billing/polar";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const service = new BillingService(auth.context.accountId);
    const checkoutUrl = await service.createCheckoutUrl();

    return NextResponse.json({ ok: true, checkoutUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "server_error", message }, { status: 500 });
  }
}
