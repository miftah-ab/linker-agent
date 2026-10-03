/**
 * Content Draft Critique Route Handler — Linker
 *
 * Spec: §12 Content Intelligence Contract
 * Generates an automated multi-criteria critique of a draft.
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
    const critique = await service.generateCritique(id);

    return NextResponse.json({ ok: true, data: critique });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "server_error", message }, { status: 500 });
  }
}
