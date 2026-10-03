# Linker — MVP Ship Gate Evidence Matrix
> Spec: `LINKER — ENGINEERING SPEC v1.0 §26`
> Architecture: Vercel (Production) + Supabase (PostgreSQL + Auth)
> Status: **VERIFIED & COLLECTED**

---

## 1. Cross-Account Access Denial & Tenant Isolation
- **Spec Invariant**: §20.2, §22, §18
- **Evidence**:
  - `middleware.ts`: Verifies session claims and refreshes session cookies on protected routes.
  - `lib/auth/require-auth.ts`: Resolves `accountId` exclusively from verified server-side JWT session (`auth.uid()`), never from client-supplied URL query or body parameters.
  - `supabase/migrations/0001_initial_schema.sql`: RLS is mandatory on every single tenant table with `USING (account_id = auth.uid()::uuid)`.
  - Non-existent or mismatched accounts fail closed with 401/404 to prevent resource existence leakage.

## 2. OAuth State Validation & CSRF Protection
- **Spec Invariant**: §26, §33
- **Evidence**:
  - `supabase/migrations/0001_initial_schema.sql`: `oauth_states` table with unique constraint `UNIQUE(state)` and TTL `expires_at`.
  - `lib/adapters/linkedin/oauth.ts`: Generates 32-byte cryptographically secure random tokens, binds to `accountId`, and marks `used = true` immediately upon first validation attempt. Replays and expired tokens are rejected.
  - `lib/security/csrf.ts`: Enforces Origin and Referer header checking against `ALLOWED_REDIRECT_ORIGINS` on mutating state changes.

## 3. Publishing Idempotency & Deduplication
- **Spec Invariant**: §16, §20.2
- **Evidence**:
  - `published_posts` table enforces two critical unique constraints:
    - `CONSTRAINT published_posts_platform_post_unique UNIQUE (account_id, platform, platform_post_id)`
    - `CONSTRAINT published_posts_idempotency_unique UNIQUE (account_id, idempotency_key)`
  - `lib/publishing/publisher.ts` & `lib/adapters/linkedin/client.ts`: Checks idempotency key prior to external API invocation. If existing post exists, returns cached reference without duplicating publication.

## 4. Job Restart Safety & Queuing
- **Spec Invariant**: §17, §20.2
- **Evidence**:
  - `scheduled_jobs` table: `UNIQUE(idempotency_key)`.
  - `lib/publishing/scheduler.ts`: Persistent job scheduling in PostgreSQL; survives process restarts and redeployments. Failed jobs record retry attempts up to `max_attempts`.

## 5. Prompt Injection Defense & Untrusted Data Isolation
- **Spec Invariant**: §4.2, §10
- **Evidence**:
  - `lib/ai/model-router.ts`: `wrapUntrustedData()` wraps external signals and third-party inputs in `<UNTRUSTED_...>` boundary tags and strips dangerous null bytes.
  - Context engine instructs the AI that untrusted signals cannot override system rules, account scope, or execution authorities.

## 6. Secret Isolation & Token Protection
- **Spec Invariant**: §1.2, §31, §39, §306
- **Evidence**:
  - `lib/env.ts`: Strict Zod schema validating server environment variables at startup; client-safe variables strictly prefixed with `NEXT_PUBLIC_`.
  - `connections.encrypted_token_ref`: Stores Vault secret references, never plaintext OAuth tokens in the application database.
  - LinkedIn and Telegram bot tokens are strictly isolated server-side and never forwarded to client bundles, logs, or MCP outputs.

## 7. MCP Authentication & Policy Boundary
- **Spec Invariant**: §19
- **Evidence**:
  - `lib/mcp/server.ts`: Authenticates incoming JSON-RPC 2.0 requests via Bearer token against `mcp_clients` table.
  - MCP is a thin interface; all autonomy checks, human approval gates, and RLS policies are enforced in Linker Core.

## 8. Billing Webhook Idempotency
- **Spec Invariant**: §12, §20.1, §20.2
- **Evidence**:
  - `billing_webhook_events` table enforces `UNIQUE(polar_event_id)`.
  - `lib/billing/polar.ts`: Checks if `polar_event_id` is already processed before handling; prevents duplicate credits, entitlement upgrades, or replay attacks.

## 9. Agent State Machine & Safety Hierarchy
- **Spec Invariant**: §10
- **Evidence**:
  - States: `IDLE` → `OBSERVING` → `ANALYZING` → `OPPORTUNITY_FOUND` → `PLANNING` → `WAITING_FOR_APPROVAL` → `EXECUTING` → `MONITORING` → `LEARNING`.
  - Permission Hierarchy strictly enforced: Platform constraints > Prohibitions > Permissions > Autonomy mode > Strategy > Judgment.
  - Emergency Pause/Resume controls implemented via `/api/v1/agent/pause` and `/api/v1/agent/resume`.

## 10. Memory Lifecycle & Information Classes
- **Spec Invariant**: §9
- **Evidence**:
  - Table `memories` tracks `info_class` (`FACT`, `USER_PREFERENCE`, `INFERENCE`, `GOAL`, `MEMORY`, `UNCERTAINTY`).
  - Strict lifecycle progression: `detected` → `candidate` → `validated` → `active` → `updated` → `superseded` → `archived`.
  - `INFERENCE` records cannot be converted to `FACT` without empirical evidence.
