/**
 * Account Data Export API Route Handler — Linker
 *
 * Spec: §18.0 REST API Contract (POST /me/export), §13.5 Data Lifecycle & Privacy
 * Generates and returns a complete, structured JSON export of all account-scoped data.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { logAudit } from "@/lib/audit/logger";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const accountId = auth.context.accountId;
  const supabase = createSupabaseServiceClient();

  try {
    // Parallel retrieval of account-scoped tables
    const [
      accountRes,
      connectionsRes,
      identityRes,
      expertiseRes,
      goalsRes,
      preferencesRes,
      voiceRes,
      projectsRes,
      experiencesRes,
      memoriesRes,
      opportunitiesRes,
      ideasRes,
      draftsRes,
      versionsRes,
      postsRes,
      analyticsRes,
      rulesRes,
    ] = await Promise.all([
      supabase.from("accounts").select("id, status, created_at, updated_at").eq("id", accountId).single(),
      supabase.from("connections").select("id, provider, provider_account_id, status, scopes, created_at, updated_at").eq("account_id", accountId),
      supabase.from("professional_identity").select("*").eq("account_id", accountId),
      supabase.from("expertise").select("*").eq("account_id", accountId),
      supabase.from("goals").select("*").eq("account_id", accountId),
      supabase.from("preferences").select("*").eq("account_id", accountId),
      supabase.from("voice_signals").select("*").eq("account_id", accountId),
      supabase.from("projects").select("*").eq("account_id", accountId),
      supabase.from("experiences").select("*").eq("account_id", accountId),
      supabase.from("memories").select("*").eq("account_id", accountId),
      supabase.from("opportunities").select("*").eq("account_id", accountId),
      supabase.from("content_ideas").select("*").eq("account_id", accountId),
      supabase.from("content_drafts").select("*").eq("account_id", accountId),
      supabase.from("content_versions").select("*").eq("account_id", accountId),
      supabase.from("published_posts").select("*").eq("account_id", accountId),
      supabase.from("analytics_snapshots").select("*").eq("account_id", accountId),
      supabase.from("agent_rules").select("*").eq("account_id", accountId),
    ]);

    const exportData = {
      exportVersion: "1.0",
      exportedAt: new Date().toISOString(),
      account: accountRes.data,
      connections: connectionsRes.data ?? [],
      professionalBrain: {
        identity: identityRes.data ?? [],
        expertise: expertiseRes.data ?? [],
        goals: goalsRes.data ?? [],
        preferences: preferencesRes.data ?? [],
        voiceSignals: voiceRes.data ?? [],
        projects: projectsRes.data ?? [],
        experiences: experiencesRes.data ?? [],
        memories: memoriesRes.data ?? [],
      },
      opportunities: opportunitiesRes.data ?? [],
      content: {
        ideas: ideasRes.data ?? [],
        drafts: draftsRes.data ?? [],
        versions: versionsRes.data ?? [],
      },
      publishedPosts: postsRes.data ?? [],
      analyticsSnapshots: analyticsRes.data ?? [],
      agentRules: rulesRes.data ?? [],
    };

    await logAudit({
      accountId,
      actorType: "user",
      actorId: accountId,
      action: "account.data_exported",
      resourceType: "account",
      resourceId: accountId,
      result: "success",
      status: "success",
    });

    return NextResponse.json({
      ok: true,
      data: exportData,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "server_error", message }, { status: 500 });
  }
}
