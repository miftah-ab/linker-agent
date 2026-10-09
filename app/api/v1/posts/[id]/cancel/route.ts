/**
 * Post Cancel Schedule Action Route Handler — Linker
 *
 * Spec: §18.0 REST API Contract (POST /posts/:id/cancel), §17 Scheduling
 * Cancels a pending scheduled publication job for the given draft.
 * The :id parameter is the content_draft ID whose scheduled job should be cancelled.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { JobScheduler } from "@/lib/publishing/scheduler";
import { ContentService } from "@/lib/content/service";
import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";

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
    // Verify draft belongs to account
    const contentService = new ContentService(auth.context.accountId);
    const draft = await contentService.getDraft(draftId);

    if (!draft) {
      return NextResponse.json({ error: "not_found", message: "Draft not found." }, { status: 404 });
    }

    if (draft.stage !== "scheduled") {
      return NextResponse.json(
        { error: "invalid_state", message: "Draft is not currently scheduled." },
        { status: 400 }
      );
    }

    // Find and cancel the pending publish_post scheduled job for this draft
    const supabase = createSupabaseServiceClient();
    const { data: jobs } = await supabase
      .from("scheduled_jobs")
      .select("id")
      .eq("account_id", auth.context.accountId)
      .eq("entity_id", draftId)
      .eq("job_type", "publish_post")
      .eq("status", "pending");

    if (!jobs || jobs.length === 0) {
      return NextResponse.json(
        { error: "not_found", message: "No pending scheduled job found for this draft." },
        { status: 404 }
      );
    }

    const scheduler = new JobScheduler(auth.context.accountId);
    for (const job of jobs) {
      await scheduler.cancelJob(job.id);
    }

    // Revert draft stage back to 'final' (was approved before scheduling)
    await contentService.updateDraft(draftId, {
      stage: "final",
      reason: "Schedule cancelled by user",
    });

    return NextResponse.json({
      ok: true,
      message: "Scheduled publication cancelled. Draft reverted to approved state.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "cancel_failed", message }, { status: 400 });
  }
}
