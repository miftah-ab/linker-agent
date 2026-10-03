/**
 * Server-side Auth Helper — Linker
 *
 * Spec: §1.6 Authorization Middleware, §19–22 (Auth & Authorization rules)
 *
 * Rules:
 *   - account_id ALWAYS from verified server-side session, NEVER from client params (§20)
 *   - Authorization uses verified identity + database RLS (§20)
 *   - 401/403 fail closed; do not reveal another account/resource existence (§22)
 *   - Cross-account access is a release-blocking defect (§18 §7)
 *   - Every protected Route Handler and Server Component calls this before touching account data
 */

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { type NextRequest, NextResponse } from "next/server";

export interface AuthContext {
  userId: string;       // Supabase auth user ID (= accounts.id for this app)
  accountId: string;    // Linker account ID — ALWAYS server-verified
}

export type AuthResult =
  | { ok: true; context: AuthContext }
  | { ok: false; response: NextResponse };

/**
 * Resolves the authenticated Linker account for a Route Handler.
 *
 * Returns AuthContext on success, or a NextResponse (401/403) on failure.
 * Callers MUST check `result.ok` before proceeding.
 *
 * Usage in Route Handlers:
 *   const auth = await requireAuth(request);
 *   if (!auth.ok) return auth.response;
 *   const { accountId } = auth.context;
 */
export async function requireAuth(_request: NextRequest): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();

  // §15: Use getClaims() / getUser() — never trust cookie contents directly
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "unauthorized",
          code: "AUTH_REQUIRED",
          // §22: Safe message — never reveal resource existence
          message: "Authentication required.",
        },
        { status: 401 }
      ),
    };
  }

  return {
    ok: true,
    context: {
      userId: user.id,
      // In Linker: Supabase auth user ID maps 1:1 to accounts.id
      // The accounts table is created in the auth hook with the same ID.
      accountId: user.id,
    },
  };
}

/**
 * Asserts that a resource's account_id matches the authenticated account.
 * Call after requireAuth() when loading a resource that has an account_id field.
 *
 * Returns a 403 NextResponse if there is a mismatch.
 * Never reveals the resource's actual owner.
 *
 * §22: Cross-account access is a release-blocking defect.
 */
export function assertAccountOwnership(
  resourceAccountId: string,
  authContext: AuthContext
): NextResponse | null {
  if (resourceAccountId !== authContext.accountId) {
    // §22: Fail closed — return 404 (not 403) to not reveal resource existence
    return NextResponse.json(
      {
        error: "not_found",
        code: "RESOURCE_NOT_FOUND",
        message: "Resource not found.",
      },
      { status: 404 }
    );
  }
  return null;
}

/**
 * Server Component helper — resolves auth without returning NextResponse.
 * Throws or redirects if unauthenticated.
 * For use in Server Components and Server Actions.
 */
export async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    const { redirect } = await import("next/navigation");
    redirect("/auth/linkedin");
    throw new Error("Unauthorized");
  }

  return {
    userId: user.id,
    accountId: user.id,
  };
}
