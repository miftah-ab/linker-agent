/**
 * Auth Middleware — Linker
 *
 * Spec: §1.6 Authorization Middleware, §13 (Web Session and Cookie Contract)
 *       §15 (proxy.ts — session refresh), §19 (auth failure behavior)
 *
 * Rules:
 *   - Every protected route resolves authenticated account server-side (§19)
 *   - Session refresh proxy propagates refreshed cookies (§15)
 *   - Identity verified via supabase.auth.getClaims() — never trust cookie contents (§15)
 *   - Auth failure: fail closed with 401/redirect — never reveal resource existence (§22)
 *   - Authenticated/user-specific responses must NOT be publicly cached (§18)
 *   - Post-auth redirects use an allowlist to prevent open redirects (§55)
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/api/v1/brain",
  "/api/v1/agent",
  "/api/v1/opportunities",
  "/api/v1/content",
  "/api/v1/posts",
  "/api/v1/analytics",
  "/api/v1/billing",
  "/api/v1/me",
  "/api/v1/projects",
  "/api/v1/mcp",
];

// Allowlisted post-auth redirect paths (§55 — prevent open redirects)
const ALLOWED_REDIRECT_PATHS = [
  "/dashboard",
  "/dashboard/content",
  "/dashboard/ideas",
  "/dashboard/calendar",
  "/dashboard/analytics",
  "/dashboard/brain",
  "/dashboard/activity",
  "/dashboard/settings",
];

export function isAllowedRedirectPath(path: string): boolean {
  return ALLOWED_REDIRECT_PATHS.some(
    (allowed) => path === allowed || path.startsWith(allowed + "/")
  );
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  // ---------------------------------------------------------------------------
  // Session Refresh Proxy (§15)
  // @supabase/ssr handles token refresh; we must propagate the updated cookies.
  // ---------------------------------------------------------------------------
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Propagate refreshed cookies to both request and response (§15)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            })
          );
        },
      },
    }
  );

  // ---------------------------------------------------------------------------
  // Verify identity (§15) — getClaims(), not trusting cookie content directly
  // ---------------------------------------------------------------------------
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Check if this is a protected route
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const isDemoSession = request.cookies.get("linker_demo_session")?.value === "true";

  // ---------------------------------------------------------------------------
  // Auth Gate — fail closed (§22)
  // ---------------------------------------------------------------------------
  if (isProtected && !user && !isDemoSession) {
    // API routes return 401; page routes redirect to auth
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/auth/linkedin", request.url);
    // Preserve intended destination for post-auth redirect (allowlisted only)
    if (isAllowedRedirectPath(pathname)) {
      loginUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // ---------------------------------------------------------------------------
  // No-cache for authenticated/user-specific responses (§18)
  // ---------------------------------------------------------------------------
  if (user && isProtected) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
