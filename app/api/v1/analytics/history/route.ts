/**
 * Analytics History API Route Handler — Linker
 *
 * Spec: §18.0 REST API Contract (GET /analytics/history), §20.2 Historical Snapshots Invariant
 * Returns chronological historical analytics snapshots for the authenticated account.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { AnalyticsCollector } from "@/lib/analytics/collector";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10), 500);

  const collector = new AnalyticsCollector(auth.context.accountId);
  const history = await collector.getHistory(limit);

  return NextResponse.json({ ok: true, data: history });
}
