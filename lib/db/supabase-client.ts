/**
 * Supabase Browser Client Factory — Linker
 *
 * Spec: §13 (Web Session and Cookie Contract)
 *
 * Rules:
 *   - Use @supabase/ssr for client-side integration (SEALED §13)
 *   - Never store auth tokens in localStorage (§16)
 *   - This client uses cookies managed by the SSR layer
 *
 * SAFE for use in Client Components ('use client').
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/db/types";

/**
 * Creates a Supabase browser client. Uses @supabase/ssr which manages
 * cookies correctly without localStorage. Singleton-safe.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
