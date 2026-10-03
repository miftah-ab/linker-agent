/**
 * Brain Preferences API Route Handler — Linker
 *
 * Spec: §9 Professional Brain Contract (Preference Memory)
 * Reads and sets preferences and constraints for the authenticated account.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { BrainStore } from "@/lib/brain/store";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const setPreferenceSchema = z.object({
  category: z.string().min(1),
  key: z.string().min(1),
  value: z.any(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const brain = new BrainStore(auth.context.accountId);
  const items = await brain.listPreferences();

  return NextResponse.json({ ok: true, data: items });
}

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const validated = setPreferenceSchema.parse(body);

    const brain = new BrainStore(auth.context.accountId);
    await brain.setPreference(
      validated.category,
      validated.key,
      validated.value,
      "user_stated"
    );

    return NextResponse.json({ ok: true, message: "Preference updated." });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "validation_error", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "server_error", message: "Failed to update preference." }, { status: 500 });
  }
}
