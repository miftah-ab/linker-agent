/**
 * Agent Rules Route Handler — Linker
 *
 * Spec: §10 Agent Contract (Autonomy Modes & Permission Hierarchy)
 * Reads and modifies agent behavioral rules, topics, and autonomy mode.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { AgentRulesEngine } from "@/lib/agent/rules";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateRulesSchema = z.object({
  autonomyMode: z.enum(["manual", "assisted", "scheduled", "autonomous"]).optional(),
  maxDailyPosts: z.number().int().min(1).max(10).optional(),
  requireApprovalForPublish: z.boolean().optional(),
  allowedTopics: z.array(z.string()).optional(),
  forbiddenTopics: z.array(z.string()).optional(),
  allowDirectPublish: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const rulesEngine = new AgentRulesEngine(auth.context.accountId);
  const rules = await rulesEngine.getRules();

  return NextResponse.json({ ok: true, data: rules });
}

export async function PATCH(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const validated = updateRulesSchema.parse(body);

    const rulesEngine = new AgentRulesEngine(auth.context.accountId);
    const updated = await rulesEngine.updateRules(validated);

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "validation_error", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "server_error", message: "Failed to update rules." }, { status: 500 });
  }
}
