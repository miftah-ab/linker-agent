/**
 * Supabase Server Client Factory — Linker
 *
 * Spec: §13 (Web Session and Cookie Contract), §1.4
 *
 * Rules:
 *   - Use @supabase/ssr for Next.js App Router SSR integration (SEALED §13)
 *   - Auth cookies: SameSite=Lax, Secure (HTTPS), HttpOnly
 *   - Never store auth tokens in localStorage (§16)
 *   - Identity verified via supabase.auth.getClaims(), never trust cookie contents (§15)
 *   - Do NOT hand-roll cookie serialization or token refresh (§17)
 *   - Authenticated responses must not be publicly cached (§18)
 *
 * IMPORTANT: This module is SERVER-ONLY.
 * Never import from client components or expose to the browser.
 */

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/lib/db/types";

/**
 * Creates a Supabase client for use in Server Components, Route Handlers,
 * and Server Actions. Uses the anon key + user session cookie.
 *
 * RLS is enforced via the authenticated user's JWT.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                // Enforce security cookie attributes (§16 Web Session and Cookie Contract)
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
              })
            );
          } catch {
            // setAll called from a Server Component — cookies cannot be set.
            // This is expected during read-only server renders; session refresh
            // cookies are set in middleware/Route Handlers.
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase client with the service role key.
 * Bypasses RLS — use ONLY for:
 *   - Webhook handlers (billing, Telegram)
 *   - Scheduled job execution
 *   - Administrative operations with explicit account_id scoping
 *
 * NEVER use in user-facing request handlers without explicit account_id enforcement.
 * NEVER expose the service role key to the client.
 */
export function createSupabaseServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
