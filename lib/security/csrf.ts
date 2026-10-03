/**
 * CSRF Protection Utility — Linker
 *
 * Spec: §1.6 Security Baseline, §13 (Web Session and Cookie Contract)
 * Rules:
 *   - State-changing HTTP methods (POST, PUT, PATCH, DELETE) must verify origin
 *   - Disallow cross-origin requests unless explicitly allowlisted (e.g. verified webhooks)
 *   - Compares Origin/Referer against NEXT_PUBLIC_APP_URL and ALLOWED_REDIRECT_ORIGINS
 */

import { type NextRequest, NextResponse } from "next/server";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Validates the Origin/Referer of incoming requests against allowed origins.
 * Returns null if valid, or a 403 NextResponse if CSRF check fails.
 */
export function verifyCsrf(request: NextRequest): NextResponse | null {
  // Safe read-only methods do not modify server state
  if (SAFE_METHODS.has(request.method.toUpperCase())) {
    return null;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    // If not configured, allow in development but warn
    if (process.env.NODE_ENV === "development") {
      return null;
    }
  }

  const allowedOrigins = new Set<string>();
  if (appUrl) {
    try {
      allowedOrigins.add(new URL(appUrl).origin);
    } catch {
      // Invalid appUrl fallback
    }
  }

  const extraOrigins = process.env.ALLOWED_REDIRECT_ORIGINS;
  if (extraOrigins) {
    extraOrigins
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((origin) => {
        try {
          allowedOrigins.add(new URL(origin).origin);
        } catch {
          // Ignore invalid URL
        }
      });
  }

  // Check Origin header first (standard in fetch/XHR)
  const originHeader = request.headers.get("origin");
  if (originHeader) {
    try {
      const requestOrigin = new URL(originHeader).origin;
      if (allowedOrigins.has(requestOrigin)) {
        return null;
      }
    } catch {
      return createCsrfErrorResponse();
    }
    return createCsrfErrorResponse();
  }

  // Fallback to Referer header
  const refererHeader = request.headers.get("referer");
  if (refererHeader) {
    try {
      const refererOrigin = new URL(refererHeader).origin;
      if (allowedOrigins.has(refererOrigin)) {
        return null;
      }
    } catch {
      return createCsrfErrorResponse();
    }
    return createCsrfErrorResponse();
  }

  // If both Origin and Referer are absent on a mutating request in production:
  // Reject unless it has an explicit server-to-server webhook signature (handled by webhook routes)
  if (process.env.NODE_ENV === "production") {
    return createCsrfErrorResponse();
  }

  return null;
}

function createCsrfErrorResponse(): NextResponse {
  return NextResponse.json(
    {
      error: "forbidden",
      code: "CSRF_VERIFICATION_FAILED",
      message: "Cross-site request blocked.",
    },
    { status: 403 }
  );
}
