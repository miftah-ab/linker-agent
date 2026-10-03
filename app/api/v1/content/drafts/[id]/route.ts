/**
 * Content Draft Detail & Update Route Handler — Linker
 *
 * Spec: §12 Content Intelligence Contract
 * Retrieves and updates a draft, automatically snapshotting immutable versions.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { ContentService } from "@/lib/content/service";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateDraftSchema = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
  stage: z.enum(["draft", "critique", "user_feedback", "final", "scheduled", "published", "discarded"]).optional(),
  userFeedback: z.string().optional(),
  reason: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  const service = new ContentService(auth.context.accountId);
  const draft = await service.getDraft(id);

  if (!draft) {
    return NextResponse.json({ error: "not_found", message: "Draft not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: draft });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const validated = updateDraftSchema.parse(body);

    const service = new ContentService(auth.context.accountId);
    await service.updateDraft(id, validated);

    return NextResponse.json({ ok: true, message: "Draft updated successfully." });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "validation_error", details: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "server_error", message }, { status: 500 });
  }
}
