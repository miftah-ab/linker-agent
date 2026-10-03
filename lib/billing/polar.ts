/**
 * Polar.sh Billing Service — Linker
 *
 * Spec: §12 Billing Contract, §20.1 Billing Entities
 *
 * Rules:
 *   - Provider: Polar.sh Starter plan (SEALED §12)
 *   - Entitlements table is authoritative for feature gating
 *   - Webhook idempotency enforced via billing_webhook_events(polar_event_id)
 *   - Invariant: Zero duplicate event processing
 */

import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { logAudit } from "@/lib/audit/logger";
import type { BillingSubscriptionStatus, BillingPlan, Json } from "@/lib/db/types";

export interface Entitlements {
  plan: BillingPlan;
  isPro: boolean;
  maxDailyPosts: number;
  canUseAutonomousMode: boolean;
  canUseMcp: boolean;
}

export class BillingService {
  constructor(private readonly accountId: string) {}

  /**
   * Retrieves active entitlements for an account.
   */
  async getEntitlements(): Promise<Entitlements> {
    const supabase = createSupabaseServiceClient();

    const { data: sub } = await supabase
      .from("billing_subscriptions")
      .select("status")
      .eq("account_id", this.accountId)
      .eq("status", "active")
      .single();

    const isPro = Boolean(sub);

    return {
      plan: isPro ? "pro" : "free",
      isPro,
      maxDailyPosts: isPro ? 5 : 2,
      canUseAutonomousMode: isPro,
      canUseMcp: isPro,
    };
  }

  /**
   * Generates a Polar checkout URL for upgrading to Pro.
   */
  async createCheckoutUrl(): Promise<string> {
    const orgId = process.env.POLAR_ORGANIZATION_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Polar standard checkout link
    const checkoutUrl = `https://polar.sh/checkout?org=${orgId}&metadata[account_id]=${this.accountId}&success_url=${encodeURIComponent(
      `${appUrl}/dashboard/settings?billing=success`
    )}`;

    return checkoutUrl;
  }

  /**
   * Processes a Polar webhook event with strict idempotency protection (§20.1).
   */
  static async processWebhookEvent(
    eventId: string,
    eventType: string,
    payload: Record<string, unknown>
  ): Promise<boolean> {
    const supabase = createSupabaseServiceClient();

    // 1. Idempotency Check: Was this event already processed?
    const { data: existing } = await supabase
      .from("billing_webhook_events")
      .select("status")
      .eq("polar_event_id", eventId)
      .single();

    if (existing && existing.status === "processed") {
      return true; // Already processed idempotently
    }

    // Record pending event
    await supabase.from("billing_webhook_events").upsert(
      {
        polar_event_id: eventId,
        event_type: eventType,
        status: "pending",
        payload: payload as unknown as Json,
      },
      { onConflict: "polar_event_id" }
    );

    try {
      const dataObj = (payload.data as Record<string, unknown>) || {};
      const metadata = (dataObj.metadata as Record<string, string>) || {};
      const accountId = metadata.account_id;

      if (!accountId) {
        console.warn("[PolarWebhook] No account_id in webhook metadata; marking skipped.");
        await supabase
          .from("billing_webhook_events")
          .update({ status: "skipped", processed_at: new Date().toISOString() })
          .eq("polar_event_id", eventId);
        return true;
      }

      // Handle subscription lifecycle
      const subId = String(dataObj.id || eventId);
      const productId = String(dataObj.product_id || "pro_tier");
      let status: BillingSubscriptionStatus = "active";

      if (eventType.includes("canceled") || eventType.includes("revoked")) {
        status = "cancelled";
      }

      await supabase.from("billing_subscriptions").upsert(
        {
          account_id: accountId,
          polar_subscription_id: subId,
          product_id: productId,
          status,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "polar_subscription_id" }
      );

      // Update entitlements
      await supabase.from("billing_entitlements").upsert(
        {
          account_id: accountId,
          plan: status === "active" ? "pro" : "free",
          feature: "all_features",
          enabled: status === "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "account_id,feature" }
      );

      // Mark event as processed
      await supabase
        .from("billing_webhook_events")
        .update({
          status: "processed",
          processed_at: new Date().toISOString(),
        })
        .eq("polar_event_id", eventId);

      await logAudit({
        accountId,
        actorType: "webhook",
        actorId: "polar_webhook",
        action: `billing.${eventType}`,
        resourceType: "billing_subscription",
        resourceId: subId,
        result: "success",
        status: "success",
        metadata: { eventId, eventType, status },
      });

      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await supabase
        .from("billing_webhook_events")
        .update({
          status: "failed",
          error_message: errorMessage,
        })
        .eq("polar_event_id", eventId);
      throw err;
    }
  }
}
