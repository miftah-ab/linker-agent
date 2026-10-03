/**
 * Scheduled Jobs Manager — Linker
 *
 * Spec: §17 Scheduling, §20.2 Database Contract
 *
 * Rules:
 *   - Persistent and restart-safe in PostgreSQL scheduled_jobs table
 *   - Idempotency key uniqueness prevents duplicate job registration (§20.2)
 *   - Exponential retry backoff on retryable failures
 */

import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { logAudit } from "@/lib/audit/logger";
import type { ScheduledJobType, ScheduledJobStatus, Json } from "@/lib/db/types";

export interface ScheduleJobInput {
  jobType: ScheduledJobType;
  entityId?: string;
  entityType?: string;
  scheduledAt: string; // ISO 8601 string
  payload?: Record<string, unknown>;
  idempotencyKey?: string;
}

export class JobScheduler {
  constructor(private readonly accountId: string) {}

  /**
   * Schedules a new background job.
   * If a job with the same idempotency key already exists, returns the existing job ID.
   */
  async scheduleJob(input: ScheduleJobInput): Promise<string> {
    const supabase = createSupabaseServiceClient();

    const idempotencyKey =
      input.idempotencyKey ||
      `job:${this.accountId}:${input.jobType}:${input.entityId || "none"}:${input.scheduledAt}`;

    // Check existing
    const { data: existing } = await supabase
      .from("scheduled_jobs")
      .select("id")
      .eq("idempotency_key", idempotencyKey)
      .single();

    if (existing) {
      return existing.id;
    }

    const { data, error } = await supabase
      .from("scheduled_jobs")
      .insert({
        account_id: this.accountId,
        job_type: input.jobType,
        entity_id: input.entityId ?? null,
        entity_type: input.entityType ?? null,
        scheduled_at: input.scheduledAt,
        status: "pending",
        attempts: 0,
        max_attempts: 3,
        idempotency_key: idempotencyKey,
        payload: (input.payload as Json) ?? null,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Failed to schedule job: ${error.message}`);
    }

    await logAudit({
      accountId: this.accountId,
      actorType: "user",
      actorId: this.accountId,
      action: `job.scheduled.${input.jobType}`,
      resourceType: "scheduled_job",
      resourceId: data.id,
      result: "success",
      status: "success",
      metadata: { scheduledAt: input.scheduledAt, idempotencyKey },
    });

    return data.id;
  }

  /**
   * Lists scheduled jobs for the account.
   */
  async listJobs(status?: ScheduledJobStatus, limit = 50) {
    const supabase = createSupabaseServiceClient();

    let query = supabase
      .from("scheduled_jobs")
      .select("id, job_type, entity_id, entity_type, scheduled_at, status, attempts, max_attempts, last_error, created_at")
      .eq("account_id", this.accountId)
      .order("scheduled_at", { ascending: true })
      .limit(limit);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data;
  }

  /**
   * Cancels a pending scheduled job.
   */
  async cancelJob(jobId: string): Promise<void> {
    const supabase = createSupabaseServiceClient();

    const { error } = await supabase
      .from("scheduled_jobs")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId)
      .eq("account_id", this.accountId)
      .eq("status", "pending");

    if (error) {
      throw new Error(`Failed to cancel job: ${error.message}`);
    }

    await logAudit({
      accountId: this.accountId,
      actorType: "user",
      actorId: this.accountId,
      action: "job.cancelled",
      resourceType: "scheduled_job",
      resourceId: jobId,
      result: "success",
      status: "success",
    });
  }
}
