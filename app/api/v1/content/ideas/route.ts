/**
 * Content Ideas API Route Handler — Linker
 *
 * Spec: §12 Content Intelligence Contract, §18 API Routes
 * Lists and creates content ideas.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { ContentService } from "@/lib/content/service";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { ContentIdeaStatus } from "@/lib/db/types";

const createIdeaSchema = z.object({
  opportunityId: z.string().uuid().optional(),
  title: z.string().min(1),
  angle: z.string().optional(),
  thesis: z.string().optional(),
  evidence: z.record(z.string(), z.any()).optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const status = url.searchParams.get("status") as ContentIdeaStatus | null;

  const service = new ContentService(auth.context.accountId);
  const ideas = await service.listIdeas(status ?? undefined);

  return NextResponse.json({ ok: true, data: ideas });
}

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const validated = createIdeaSchema.parse(body);

    const service = new ContentService(auth.context.accountId);
    const id = await service.createIdea(validated);

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "validation_error", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "server_error", message: "Failed to create idea." }, { status: 500 });
  }
}
