/**
 * Post Publish Action Route Handler — Linker
 *
 * Spec: §18.0 REST API Contract (POST /posts/:id/publish), §16 LinkedIn Adapter Contract
 * Publishes a specific approved draft post to LinkedIn immediately.
 * The :id parameter is the content_draft ID to publish.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { PublishingService } from "@/lib/publishing/publisher";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const publishBodySchema = z.object({
  idempotencyKey: z.string().optional(),
}).optional();

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
    let idempotencyKey: string | undefined;
    try {
      const body = await request.json();
      const validated = publishBodySchema?.parse(body);
      idempotencyKey = validated?.idempotencyKey;
    } catch {
      // Body is optional
    }

    const service = new PublishingService(auth.context.accountId);
    const result = await service.publishDraft(draftId, idempotencyKey);

    return NextResponse.json({ ok: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "publish_failed", message }, { status: 400 });
  }
}
