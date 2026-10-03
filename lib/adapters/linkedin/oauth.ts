/**
 * LinkedIn OAuth Handler — Linker
 *
 * Spec: §16 LinkedIn Adapter Contract, §31–§39 LinkedIn OAuth / Token Lifecycle
 *
 * Rules:
 *   - Client Secret stays server-side only (§31)
 *   - State parameter: cryptographically random, single-use, stored with TTL (§33)
 *   - Scopes: openid, profile, email, w_member_social (§34)
 *   - Exchange auth code for access token via LinkedIn OAuth 2.0 endpoint
 *   - Fetch LinkedIn member identity via OpenID UserInfo endpoint
 */

import { randomBytes } from "crypto";
import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { LINKEDIN_SCOPES, type LinkedInTokenResponse, type LinkedInUserInfo, LinkedInApiError } from "./types";

const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo";

const STATE_TTL_MINUTES = 15;

/**
 * Generates the LinkedIn OAuth authorization URL with a cryptographically secure,
 * single-use state stored in oauth_states table.
 */
export async function generateAuthorizationUrl(accountId: string): Promise<string> {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("LinkedIn OAuth is not configured in environment variables.");
  }

  const state = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + STATE_TTL_MINUTES * 60 * 1000).toISOString();

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("oauth_states").insert({
    account_id: accountId,
    state,
    provider: "linkedin",
    used: false,
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error(`Failed to record OAuth state: ${error.message}`);
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: LINKEDIN_SCOPES.join(" "),
  });

  return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
}

/**
 * Validates the state parameter against the oauth_states table.
 * Enforces single-use and expiration (§33).
 */
export async function validateOAuthState(
  state: string,
  accountId: string
): Promise<boolean> {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("oauth_states")
    .select("id, account_id, used, expires_at")
    .eq("state", state)
    .eq("provider", "linkedin")
    .single();

  if (error || !data) {
    return false;
  }

  if (data.used) {
    return false;
  }

  if (data.account_id && data.account_id !== accountId) {
    return false;
  }

  if (new Date(data.expires_at) < new Date()) {
    return false;
  }

  // Mark state as used (single-use constraint)
  await supabase
    .from("oauth_states")
    .update({ used: true })
    .eq("id", data.id);

  return true;
}

/**
 * Exchanges the LinkedIn authorization code for tokens.
 * Server-to-server only; client secret never exposed.
 */
export async function exchangeCodeForTokens(code: string): Promise<LinkedInTokenResponse> {
  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI!;

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new LinkedInApiError(
      `LinkedIn token exchange failed: HTTP ${response.status}`,
      response.status,
      errorBody
    );
  }

  return (await response.json()) as LinkedInTokenResponse;
}

/**
 * Fetches the authenticated LinkedIn user's identity via OpenID userinfo endpoint.
 */
export async function fetchLinkedInUserInfo(accessToken: string): Promise<LinkedInUserInfo> {
  const response = await fetch(LINKEDIN_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new LinkedInApiError(
      `Failed to fetch LinkedIn user info: HTTP ${response.status}`,
      response.status,
      errorBody
    );
  }

  return (await response.json()) as LinkedInUserInfo;
}
