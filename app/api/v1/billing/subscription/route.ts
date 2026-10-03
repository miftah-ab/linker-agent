/**
 * Billing Subscription Route Handler — Linker
 *
 * Spec: §12 Billing Contract, §20.1 Billing Entities
 * Returns active subscription and entitlement tier for the authenticated account.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { BillingService } from "@/lib/billing/polar";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const service = new BillingService(auth.context.accountId);
  const entitlements = await service.getEntitlements();

  return NextResponse.json({ ok: true, data: entitlements });
}
