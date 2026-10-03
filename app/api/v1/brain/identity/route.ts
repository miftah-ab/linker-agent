/**
 * Brain Identity API Route Handler — Linker
 *
 * Spec: §9 Professional Brain Contract
 * Reads and updates professional identity for the authenticated account.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { BrainStore } from "@/lib/brain/store";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const identityUpdateSchema = z.object({
  headline: z.string().optional(),
  summary: z.string().optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const brain = new BrainStore(auth.context.accountId);
  const identity = await brain.getIdentity();

  return NextResponse.json({ ok: true, data: identity });
}

export async function PUT(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const validated = identityUpdateSchema.parse(body);

    const brain = new BrainStore(auth.context.accountId);
    await brain.upsertIdentity({
      ...validated,
      source: "user_stated",
      confidence: 1.0,
      status: "active",
    });

    return NextResponse.json({ ok: true, message: "Identity updated successfully." });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "validation_error", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "server_error", message: "Failed to update identity." }, { status: 500 });
  }
}
