/**
 * Publishing API Route Handler — Linker
 *
 * Spec: §16 LinkedIn Adapter Contract, §18 API Routes
 * Executes publication of an approved draft.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { PublishingService } from "@/lib/publishing/publisher";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const publishSchema = z.object({
  draftId: z.string().uuid(),
  idempotencyKey: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const validated = publishSchema.parse(body);

    const service = new PublishingService(auth.context.accountId);
    const result = await service.publishDraft(validated.draftId, validated.idempotencyKey);

    return NextResponse.json({ ok: true, data: result });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "validation_error", details: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "publish_failed", message }, { status: 400 });
  }
}
