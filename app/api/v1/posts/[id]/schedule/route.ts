/**
 * Post Schedule Action Route Handler — Linker
 *
 * Spec: §18.0 REST API Contract (POST /posts/:id/schedule), §17 Scheduling
 * Schedules a specific approved draft post for future publication.
 * The :id parameter is the content_draft ID to schedule.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { JobScheduler } from "@/lib/publishing/scheduler";
import { ContentService } from "@/lib/content/service";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const scheduleBodySchema = z.object({
  scheduledAt: z.string().datetime({ message: "scheduledAt must be a valid ISO 8601 datetime" }),
  idempotencyKey: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { id: draftId } = await context.params;

  try {
    const body = await request.json();
    const validated = scheduleBodySchema.parse(body);

    // Verify the draft exists and is in an approvable state
    const contentService = new ContentService(auth.context.accountId);
    const draft = await contentService.getDraft(draftId);

    if (!draft) {
      return NextResponse.json({ error: "not_found", message: "Draft not found." }, { status: 404 });
    }

    if (draft.stage === "published") {
      return NextResponse.json(
        { error: "invalid_state", message: "Draft has already been published." },
        { status: 400 }
      );
    }

    if (draft.stage === "discarded") {
      return NextResponse.json(
        { error: "invalid_state", message: "Cannot schedule a discarded draft." },
        { status: 400 }
      );
    }

    // Schedule a persistent publish_post job
    const scheduler = new JobScheduler(auth.context.accountId);
    const jobId = await scheduler.scheduleJob({
      jobType: "publish_post",
      entityId: draftId,
      entityType: "content_draft",
      scheduledAt: validated.scheduledAt,
      payload: { draftId },
      idempotencyKey: validated.idempotencyKey || `schedule:${auth.context.accountId}:${draftId}:${validated.scheduledAt}`,
    });

    // Transition draft stage to 'scheduled'
    await contentService.updateDraft(draftId, { stage: "scheduled", reason: "Scheduled for publication" });

    return NextResponse.json({ ok: true, data: { jobId, scheduledAt: validated.scheduledAt } }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "validation_error", details: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "schedule_failed", message }, { status: 400 });
  }
}
