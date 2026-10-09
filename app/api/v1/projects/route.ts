/**
 * Projects API Route Handler — Linker
 *
 * Spec: §18.0 REST API Contract (GET /projects, POST /projects), §9 Professional Brain (Projects Entity)
 * Manages professional projects tied to the user's Professional Brain.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { logAudit } from "@/lib/audit/logger";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Json } from "@/lib/db/types";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  role: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  outcomes: z.record(z.string(), z.unknown()).optional(),
  source: z.string().default("user_stated"),
  confidence: z.number().min(0).max(1).default(1.0),
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const supabase = createSupabaseServiceClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, description, role, start_date, end_date, outcomes, source, confidence, status, info_class, created_at, updated_at")
    .eq("account_id", auth.context.accountId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "server_error", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: projects ?? [] });
}

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    const supabase = createSupabaseServiceClient();

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        account_id: auth.context.accountId,
        name: validated.name,
        description: validated.description ?? null,
        role: validated.role ?? null,
        start_date: validated.startDate ?? null,
        end_date: validated.endDate ?? null,
        outcomes: (validated.outcomes as Json) ?? null,
        source: validated.source,
        confidence: validated.confidence,
        status: "active",
        info_class: "FACT",
      })
      .select("id")
      .single();

    if (error || !project) {
      throw new Error(`Failed to create project: ${error?.message || "Unknown error"}`);
    }

    await logAudit({
      accountId: auth.context.accountId,
      actorType: "user",
      actorId: auth.context.accountId,
      action: "brain.project_created",
      resourceType: "project",
      resourceId: project.id,
      result: "success",
      status: "success",
    });

    return NextResponse.json({ ok: true, data: { id: project.id } }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "validation_error", details: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "server_error", message }, { status: 500 });
  }
}
