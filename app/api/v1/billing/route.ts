/**
 * Billing Overview Route Handler — Linker
 *
 * Spec: §18.0 REST API Contract (GET /billing), §12 Billing Contract (Polar.sh)
 * Returns current plan, entitlements, and subscription state for the authenticated account.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { BillingService } from "@/lib/billing/polar";
import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const supabase = createSupabaseServiceClient();
  const service = new BillingService(auth.context.accountId);

  const [entitlements, subResult] = await Promise.all([
    service.getEntitlements(),
    supabase
      .from("billing_subscriptions")
      .select("id, polar_subscription_id, product_id, status, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at")
      .eq("account_id", auth.context.accountId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    ok: true,
    data: {
      plan: entitlements.plan,
      isPro: entitlements.isPro,
      entitlements: {
        maxDailyPosts: entitlements.maxDailyPosts,
        canUseAutonomousMode: entitlements.canUseAutonomousMode,
        canUseMcp: entitlements.canUseMcp,
      },
      subscription: subResult.data ?? null,
    },
  });
}
