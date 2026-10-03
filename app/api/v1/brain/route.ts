/**
 * Brain API Route Handler — Linker
 *
 * Spec: §9 Professional Brain Contract, §18 API Routes
 * Returns full assembled brain context for the authenticated account.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { BrainStore } from "@/lib/brain/store";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const brain = new BrainStore(auth.context.accountId);
  const context = await brain.assembleContext();

  return NextResponse.json({ ok: true, data: context });
}
