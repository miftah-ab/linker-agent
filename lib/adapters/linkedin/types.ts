/**
 * LinkedIn Adapter Types — Linker
 *
 * Spec: §16 LinkedIn Adapter Contract, §31–§39 LinkedIn OAuth & Token Lifecycle
 * Invariants:
 *   - Business/agent logic never receives raw OAuth tokens
 *   - The LinkedIn Adapter owns all LinkedIn API interactions
 *   - Scopes are explicitly defined and validated
 */

import type { ConnectionStatus } from "@/lib/db/types";

export const LINKEDIN_SCOPES = [
  "openid",
  "profile",
  "email",
  "w_member_social",
] as const;

export type LinkedInScope = (typeof LINKEDIN_SCOPES)[number];

export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope?: string;
  token_type: string;
  id_token?: string;
}

export interface LinkedInUserInfo {
  sub: string; // LinkedIn member URN ID
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
}

export interface LinkedInPublishRequest {
  authorUrn: string; // urn:li:person:...
  text: string;
  idempotencyKey: string;
}

export interface LinkedInPublishResponse {
  platformPostId: string;
  urn: string;
  publishedAt: string;
}

export interface LinkedInConnectionState {
  accountId: string;
  providerAccountId: string | null;
  status: ConnectionStatus;
  scopes: string[];
  expiresAt: string | null;
}

export class LinkedInApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseBody?: unknown,
    public isRateLimit = statusCode === 429,
    public isAuthError = statusCode === 401 || statusCode === 403
  ) {
    super(message);
    this.name = "LinkedInApiError";
  }
}
