/**
 * LinkedIn OAuth Callback Route Handler — Linker
 *
 * Spec: §16 LinkedIn Adapter Contract, §31–§39 LinkedIn OAuth / Token Lifecycle
 * Handles the redirect from LinkedIn:
 *   - Verifies server-side user session
 *   - Validates state parameter (single-use, TTL, account-bound)
 *   - Exchanges authorization code for tokens
 *   - Fetches user identity (OpenID userinfo)
 *   - Stores encrypted token reference & status='connected'
 *   - Emits audit log
 */

import { requireAuth } from "@/lib/auth/require-auth";
import {
  validateOAuthState,
  exchangeCodeForTokens,
  fetchLinkedInUserInfo,
} from "@/lib/adapters/linkedin/oauth";
import { saveLinkedInConnection } from "@/lib/adapters/linkedin/token-store";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  const dashboardUrl = new URL("/dashboard/settings", request.url);

  if (error) {
    console.error("[LinkedInCallback] OAuth error from provider:", error, errorDescription);
    dashboardUrl.searchParams.set("error", "linkedin_denied");
    return NextResponse.redirect(dashboardUrl);
  }

  if (!code || !state) {
    dashboardUrl.searchParams.set("error", "missing_parameters");
    return NextResponse.redirect(dashboardUrl);
  }

  // Enforce state parameter validation (§33)
  const isValidState = await validateOAuthState(state, auth.context.accountId);
  if (!isValidState) {
    dashboardUrl.searchParams.set("error", "invalid_state");
    return NextResponse.redirect(dashboardUrl);
  }

  try {
    // Exchange code for tokens
    const tokenData = await exchangeCodeForTokens(code);

    // Retrieve userinfo
    const userInfo = await fetchLinkedInUserInfo(tokenData.access_token);

    // Save connection with encrypted token reference
    await saveLinkedInConnection(auth.context.accountId, userInfo, tokenData);

    dashboardUrl.searchParams.set("connected", "linkedin");
    return NextResponse.redirect(dashboardUrl);
  } catch (err) {
    console.error("[LinkedInCallback] Connection establishment failed:", err);
    dashboardUrl.searchParams.set("error", "connection_failed");
    return NextResponse.redirect(dashboardUrl);
  }
}
