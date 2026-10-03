/**
 * Supabase Auth Signout Route Handler — Linker
 *
 * Spec: §13 Web Session and Cookie Contract
 * Signs out the current user session and clears all authentication cookies.
 */

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { logAudit } from "@/lib/audit/logger";
import { verifyCsrf } from "@/lib/security/csrf";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // CSRF validation on mutating signout request
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await logAudit({
      accountId: user.id,
      actorType: "user",
      actorId: user.id,
      action: "auth.sign_out",
      resourceType: "session",
      resourceId: user.id,
      result: "success",
      status: "success",
    });
  }

  await supabase.auth.signOut();

  return NextResponse.json({ ok: true, message: "Signed out successfully." });
}
