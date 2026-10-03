/**
 * Brain Experiences API Route Handler — Linker
 *
 * Spec: §9 Professional Brain Contract (Experience Memory)
 * Reads career experiences for the authenticated account.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { BrainStore } from "@/lib/brain/store";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const brain = new BrainStore(auth.context.accountId);
  const items = await brain.listExperiences();

  return NextResponse.json({ ok: true, data: items });
}
