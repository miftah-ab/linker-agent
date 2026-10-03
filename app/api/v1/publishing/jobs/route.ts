/**
 * Scheduled Jobs List API Route Handler — Linker
 *
 * Spec: §17 Scheduling, §18 API Routes
 * Lists pending and recent background jobs for the authenticated account.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { JobScheduler } from "@/lib/publishing/scheduler";
import { type NextRequest, NextResponse } from "next/server";
import type { ScheduledJobStatus } from "@/lib/db/types";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const status = url.searchParams.get("status") as ScheduledJobStatus | null;

  const scheduler = new JobScheduler(auth.context.accountId);
  const jobs = await scheduler.listJobs(status ?? undefined);

  return NextResponse.json({ ok: true, data: jobs });
}
