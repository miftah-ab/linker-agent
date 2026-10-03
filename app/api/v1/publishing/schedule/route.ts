/**
 * Job Scheduling API Route Handler — Linker
 *
 * Spec: §17 Scheduling, §18 API Routes
 * Schedules a post or background job for future execution.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { JobScheduler } from "@/lib/publishing/scheduler";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const scheduleSchema = z.object({
  jobType: z.enum(["publish_post", "collect_analytics", "opportunity_scan", "brain_update", "telegram_notify"]),
  entityId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  scheduledAt: z.string().datetime(),
  payload: z.record(z.string(), z.any()).optional(),
  idempotencyKey: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const validated = scheduleSchema.parse(body);

    const scheduler = new JobScheduler(auth.context.accountId);
    const jobId = await scheduler.scheduleJob(validated);

    return NextResponse.json({ ok: true, jobId }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "validation_error", details: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "schedule_failed", message }, { status: 400 });
  }
}
