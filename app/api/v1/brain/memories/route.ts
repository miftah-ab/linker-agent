/**
 * Brain Memories API Route Handler — Linker
 *
 * Spec: §9 Professional Brain Contract (Learned Patterns, Interaction Memory)
 * Reads and records memories with explicit information classes and provenance.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { BrainStore } from "@/lib/brain/store";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const addMemorySchema = z.object({
  memoryType: z.enum(["experience", "content", "relationship", "pattern", "audience", "strategy"]),
  content: z.any(),
  infoClass: z.enum(["FACT", "USER_PREFERENCE", "INFERENCE", "GOAL", "MEMORY", "UNCERTAINTY"]).default("INFERENCE"),
  confidence: z.number().min(0).max(1).default(0.7),
  source: z.string().default("agent_observation"),
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const typeParam = url.searchParams.get("type") as
    | "experience"
    | "content"
    | "relationship"
    | "pattern"
    | "audience"
    | "strategy"
    | null;

  const brain = new BrainStore(auth.context.accountId);
  const items = await brain.listMemories(typeParam ?? undefined);

  return NextResponse.json({ ok: true, data: items });
}

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const validated = addMemorySchema.parse(body);

    const brain = new BrainStore(auth.context.accountId);
    const id = await brain.saveMemory(
      validated.memoryType,
      validated.content,
      validated.source,
      validated.infoClass,
      validated.confidence
    );

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "validation_error", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "server_error", message: "Failed to record memory." }, { status: 500 });
  }
}
