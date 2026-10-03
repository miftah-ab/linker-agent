/**
 * Brain Goals API Route Handler — Linker
 *
 * Spec: §9 Professional Brain Contract
 * Lists and creates goals for the authenticated account.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { BrainStore } from "@/lib/brain/store";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const addGoalSchema = z.object({
  goalType: z.string().min(1),
  description: z.string().min(1),
  priority: z.number().int().min(1).max(10).default(5),
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const brain = new BrainStore(auth.context.accountId);
  const items = await brain.listGoals();

  return NextResponse.json({ ok: true, data: items });
}

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const validated = addGoalSchema.parse(body);

    const brain = new BrainStore(auth.context.accountId);
    const id = await brain.addGoal(
      validated.goalType,
      validated.description,
      validated.priority,
      "user_stated"
    );

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "validation_error", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "server_error", message: "Failed to add goal." }, { status: 500 });
  }
}
