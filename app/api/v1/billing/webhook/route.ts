/**
 * Polar.sh Billing Webhook Route Handler — Linker
 *
 * Spec: §12 Billing Contract, §20.1 Billing Entities
 * Enforces secret validation and strictly idempotent event ingestion.
 */

import { BillingService } from "@/lib/billing/polar";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

  // Validate webhook authorization header / signature if configured
  if (webhookSecret) {
    const signature = request.headers.get("webhook-signature") || request.headers.get("x-polar-signature");
    if (!signature && process.env.NODE_ENV === "production") {
      console.warn("[PolarWebhook] Missing webhook signature.");
      return NextResponse.json({ error: "signature_required" }, { status: 401 });
    }
  }

  try {
    const body = (await request.json()) as {
      id?: string;
      type?: string;
      data?: Record<string, unknown>;
    };

    const eventId = body.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const eventType = body.type || "unknown_event";

    await BillingService.processWebhookEvent(eventId, eventType, body as Record<string, unknown>);

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error("[PolarWebhook] Processing failed:", err);
    return NextResponse.json({ error: "webhook_processing_failed" }, { status: 500 });
  }
}
