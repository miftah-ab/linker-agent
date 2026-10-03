/**
 * Opportunities API Route Handler — Linker
 *
 * Spec: §11 Opportunity Engine Contract, §18 API Routes
 * Lists detected/evaluated opportunities and allows creating new ones.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { OpportunityService } from "@/lib/opportunities/service";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { OpportunityLifecycleStatus } from "@/lib/db/types";

const createOpportunitySchema = z.object({
  opportunityType: z.enum(["content", "engagement", "relationship", "trend", "reputation", "timing"]),
  title: z.string().min(1),
  description: z.string().optional(),
  relevanceScore: z.number().min(0).max(1),
  evidence: z.record(z.string(), z.any()).optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status") as OpportunityLifecycleStatus | null;

  const service = new OpportunityService(auth.context.accountId);
  const items = await service.listOpportunities(statusParam ?? undefined);

  return NextResponse.json({ ok: true, data: items });
}

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const validated = createOpportunitySchema.parse(body);

    const service = new OpportunityService(auth.context.accountId);
    const id = await service.createOpportunity(validated);

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "validation_error", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "server_error", message: "Failed to create opportunity." }, { status: 500 });
  }
}
