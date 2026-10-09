/**
 * Content Draft Discard Route Handler — Linker
 *
 * Spec: §18.0 REST API Contract (POST /content/drafts/:id/discard), §12 Content Intelligence
 * Transitions a draft to 'discarded' stage and records reason.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { ContentService } from "@/lib/content/service";
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

  const { id } = await context.params;

  try {
    let reason = "User discarded draft";
    try {
      const body = await request.json();
      if (body?.reason) reason = String(body.reason);
    } catch {
      // Body is optional
    }

    const service = new ContentService(auth.context.accountId);
    const existing = await service.getDraft(id);

    if (!existing) {
      return NextResponse.json({ error: "not_found", message: "Draft not found." }, { status: 404 });
    }

    if (existing.stage === "published") {
      return NextResponse.json(
        { error: "invalid_state", message: "Cannot discard an already published draft." },
        { status: 400 }
      );
    }

    await service.updateDraft(id, {
      stage: "discarded",
      reason,
    });

    return NextResponse.json({
      ok: true,
      message: "Draft discarded successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "server_error", message }, { status: 500 });
  }
}
