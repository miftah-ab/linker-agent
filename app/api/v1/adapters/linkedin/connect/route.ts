/**
 * LinkedIn Connect Route Handler — Linker
 *
 * Spec: §16 LinkedIn Adapter Contract, §31–§39 LinkedIn OAuth
 * Initiates the LinkedIn OAuth 2.0 flow:
 *   - Verifies server-side user session
 *   - Generates cryptographically secure state with TTL bound to accountId
 *   - Redirects user to LinkedIn authorization endpoint
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { generateAuthorizationUrl } from "@/lib/adapters/linkedin/oauth";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const authUrl = await generateAuthorizationUrl(auth.context.accountId);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("[LinkedInConnect] Failed to generate auth URL:", error);
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=linkedin_connect_failed", request.url)
    );
  }
}
