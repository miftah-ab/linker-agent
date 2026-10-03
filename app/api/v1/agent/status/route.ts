/**
 * Agent Status Route Handler — Linker
 *
 * Spec: §10 Agent Contract, §18 API Routes
 * Returns real-time operational status, autonomy mode, and queue counters.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { AgentStateMachine } from "@/lib/agent/state-machine";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const stateMachine = new AgentStateMachine(auth.context.accountId);
  const status = await stateMachine.getStatus();

  return NextResponse.json({ ok: true, data: status });
}
