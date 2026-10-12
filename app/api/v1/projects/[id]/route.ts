/**
 * Project Detail & Update Route Handler — Linker
 *
 * Spec: §18.0 REST API Contract (GET /projects/:id, PATCH /projects/:id)
 * Retrieves and updates project records in the user's Professional Brain.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { logAudit } from "@/lib/audit/logger";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Database, Json } from "@/lib/db/types";

const updateProjectSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  role: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  outcomes: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(["detected", "candidate", "validated", "active", "updated", "superseded", "archived"]).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const supabase = createSupabaseServiceClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, name, description, role, start_date, end_date, outcomes, source, confidence, status, info_class, created_at, updated_at")
    .eq("id", id)
    .eq("account_id", auth.context.accountId)
    .single();

  if (error || !project) {
    return NextResponse.json({ error: "not_found", message: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: project });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const validated = updateProjectSchema.parse(body);

    const supabase = createSupabaseServiceClient();

    const updatePayload: Database["public"]["Tables"]["projects"]["Update"] = {
      updated_at: new Date().toISOString(),
    };

    if (validated.name !== undefined) updatePayload.name = validated.name;
    if (validated.description !== undefined) updatePayload.description = validated.description;
    if (validated.role !== undefined) updatePayload.role = validated.role;
    if (validated.startDate !== undefined) updatePayload.start_date = validated.startDate;
    if (validated.endDate !== undefined) updatePayload.end_date = validated.endDate;
    if (validated.outcomes !== undefined) updatePayload.outcomes = validated.outcomes as Json;
    if (validated.status !== undefined) updatePayload.status = validated.status;
    if (validated.confidence !== undefined) updatePayload.confidence = validated.confidence;

    const { error } = await supabase
      .from("projects")
      .update(updatePayload)
      .eq("id", id)
      .eq("account_id", auth.context.accountId);

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }

    await logAudit({
      accountId: auth.context.accountId,
      actorType: "user",
      actorId: auth.context.accountId,
      action: "brain.project_updated",
      resourceType: "project",
      resourceId: id,
      result: "success",
      status: "success",
    });

    return NextResponse.json({ ok: true, message: "Project updated successfully." });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "validation_error", details: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "server_error", message }, { status: 500 });
  }
}
