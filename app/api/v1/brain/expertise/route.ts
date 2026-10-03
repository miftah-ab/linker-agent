/**
 * Brain Expertise API Route Handler — Linker
 *
 * Spec: §9 Professional Brain Contract
 * Lists and adds verified skills/expertise for the authenticated account.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { BrainStore } from "@/lib/brain/store";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const addExpertiseSchema = z.object({
  skill: z.string().min(1),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]).default("intermediate"),
  confidence: z.number().min(0).max(1).default(1.0),
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const brain = new BrainStore(auth.context.accountId);
  const items = await brain.listExpertise();

  return NextResponse.json({ ok: true, data: items });
}

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const validated = addExpertiseSchema.parse(body);

    const brain = new BrainStore(auth.context.accountId);
    const id = await brain.addExpertise(
      validated.skill,
      validated.level,
      validated.confidence,
      "user_stated"
    );

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "validation_error", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "server_error", message: "Failed to add expertise." }, { status: 500 });
  }
}
