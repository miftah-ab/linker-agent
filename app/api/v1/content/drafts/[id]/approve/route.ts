/**
 * Content Draft Approval Route Handler — Linker
 *
 * Spec: §18.0 REST API Contract (POST /content/drafts/:id/approve), §12 Content Intelligence
 * Transitions a draft to 'final' approved stage with recorded approver and timestamp.
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
    const service = new ContentService(auth.context.accountId);
    const existing = await service.getDraft(id);

    if (!existing) {
      return NextResponse.json({ error: "not_found", message: "Draft not found." }, { status: 404 });
    }

    if (existing.stage === "published") {
      return NextResponse.json(
        { error: "invalid_state", message: "Cannot approve an already published draft." },
        { status: 400 }
      );
    }

    await service.updateDraft(id, {
      stage: "final",
      reason: "Explicit user approval",
    });

    return NextResponse.json({
      ok: true,
      message: "Draft approved and ready for publishing or scheduling.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "server_error", message }, { status: 500 });
  }
}
