/**
 * Opportunity Reject Route Handler — Linker
 *
 * Spec: §11 Opportunity Engine Contract
 * Transitions opportunity to 'rejected' status.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { OpportunityService } from "@/lib/opportunities/service";
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
    const service = new OpportunityService(auth.context.accountId);
    await service.transitionStatus(id, "rejected");
    return NextResponse.json({ ok: true, status: "rejected" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "server_error", message }, { status: 500 });
  }
}
