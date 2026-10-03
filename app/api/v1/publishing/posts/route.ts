/**
 * Published Posts API Route Handler — Linker
 *
 * Spec: §16 LinkedIn Adapter Contract, §18 API Routes
 * Lists published posts for the authenticated account.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("published_posts")
    .select("id, draft_id, platform, platform_post_id, status, idempotency_key, body_snapshot, published_at, failure_reason, created_at")
    .eq("account_id", auth.context.accountId)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: "server_error", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: data ?? [] });
}
