/**
 * Analytics Overview API Route Handler — Linker
 *
 * Spec: §20.2 Database Contract, §18 API Routes
 * Returns high-level metrics aggregation across all published posts.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { AnalyticsCollector } from "@/lib/analytics/collector";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const collector = new AnalyticsCollector(auth.context.accountId);
  const overview = await collector.getOverview();

  return NextResponse.json({ ok: true, data: overview });
}
