/**
 * Content Drafts API Route Handler — Linker
 *
 * Spec: §12 Content Intelligence Contract, §18 API Routes
 * Lists drafts and creates new drafts with anti-AI auditing.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { ContentService } from "@/lib/content/service";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { ContentDraftStage } from "@/lib/db/types";

const createDraftSchema = z.object({
  ideaId: z.string().uuid().optional(),
  title: z.string().min(1),
  body: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const stage = url.searchParams.get("stage") as ContentDraftStage | null;

  const service = new ContentService(auth.context.accountId);
  const drafts = await service.listDrafts(stage ?? undefined);

  return NextResponse.json({ ok: true, data: drafts });
}

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const validated = createDraftSchema.parse(body);

    const service = new ContentService(auth.context.accountId);
    const id = await service.createDraft(validated);

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "validation_error", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "server_error", message: "Failed to create draft." }, { status: 500 });
  }
}
