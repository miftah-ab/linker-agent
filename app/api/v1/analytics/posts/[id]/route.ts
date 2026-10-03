/**
 * Post Analytics Snapshots API Route Handler — Linker
 *
 * Spec: §20.2 Database Contract
 * Returns historical snapshot timeseries for a published post.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { AnalyticsCollector } from "@/lib/analytics/collector";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  const collector = new AnalyticsCollector(auth.context.accountId);
  const snapshots = await collector.getPostSnapshots(id);

  return NextResponse.json({ ok: true, data: snapshots });
}
