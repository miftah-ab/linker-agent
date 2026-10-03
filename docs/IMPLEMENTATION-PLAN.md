# Linker — Implementation Plan
> Derived exclusively from: `LINKER — ENGINEERING SPEC v1.0`
> Hosting sealed decision applied: **Vercel = production. Oracle Cloud = removed.**
> Status: **AWAITING APPROVAL — Do not begin implementation**
> Author: Lead Implementation Engineer

---

## A. Architecture Understanding

### System Boundary (§4)

```
Dashboard / Telegram / MCP
          │
          ▼
  Linker API / Core  (Next.js Route Handlers /api/v1)
  ├── Authentication & Authorization (Supabase Auth + RLS)
  ├── Professional Brain (persistent structured context)
  ├── Agent Loop (OBSERVE → … → LEARN → REPEAT)
  ├── Opportunity Engine
  ├── Content Intelligence
  ├── Publishing / Scheduling / Idempotency
  ├── Analytics
  ├── LinkedIn Adapter (owns all LinkedIn API surface)
  ├── Telegram Handler (routes through Core)
  └── MCP Server (thin authenticated interface over Core)
          │
          ▼
    LinkedIn (data source + execution environment)
```

**Key invariants:**
- Frontend **never** calls AI providers directly.
- Agent/business logic **never** receives OAuth tokens; the LinkedIn Adapter owns them.
- MCP is a thin layer; all policy/autonomy enforcement lives in Linker Core.
- Every consequential action is audited.
- Every tenant query is account-scoped + RLS-enforced.

### Hosting (SEALED — Opening declaration, lines 3–6 of spec)
- **Production hosting**: Vercel
- **Database/Auth**: Supabase Free Plan
- Oracle Cloud is **removed** from the Linker architecture completely
- Architecture is deployed to Vercel; do not reintroduce Oracle or any other host

### Sealed Technology Decisions

| Concern | Decision |
|---|---|
| Hosting | Vercel (production) |
| Runtime | Node.js 24.21.0 LTS |
| Framework | Next.js 16.3.8 Active LTS |
| React | Version required by Next.js 16.3.x (do not independently upgrade) |
| Language | TypeScript 6.0.x stable (compatible with Next.js 16.3.x) |
| Package manager | pnpm |
| Database | Supabase PostgreSQL Free Plan |
| Auth | Supabase Auth + `@supabase/ssr` |
| Data access | Supabase JS/TS client + raw SQL migrations (no ORM) |
| Validation | Zod 4.x |
| Styling | Tailwind CSS 4.x |
| Components | shadcn/ui |
| Icons | Lucide |
| Typography | Inter |
| Forms | React Hook Form + Zod for complex forms; native/Server Actions for simple |
| Client state | React state/context first; no global state library unless concrete need arises |
| Data fetching | Next.js Server Components by default; Server Actions where appropriate |
| Background jobs | Supabase pg_cron + pg_net → Edge Functions |
| Job secrets | Supabase Vault |
| MCP SDK | Official MCP TypeScript SDK v2 stable |
| Testing | Vitest (unit/integration) + Playwright (E2E) |
| CI | GitHub Actions (free public repo allowance) |
| Error monitoring | Sentry free Developer tier |
| AI provider | Groq Free tier initially (provider-agnostic model router) |
| Billing | Polar.sh Starter (free plan, transaction fees) |
| Oracle Cloud | **Removed — do not reintroduce** |
| Repository | GitHub |

---

## B. Implementation Sequence

Per §28, strictly in this order:

1. **Foundation** — database, account, auth/session/cookies, secrets, authorization, RLS, CSRF/security baseline
2. **LinkedIn Adapter** — verified OAuth/API capabilities, state validation, token lifecycle
3. **Professional Brain** — persistence and retrieval
4. **Core Agent Loop + Context Engine**
5. **Opportunity Engine**
6. **Content Intelligence**
7. **Publishing / Scheduling / Idempotency**
8. **Analytics Foundation**
9. **Telegram Agent**
10. **Dashboard**
11. **MCP Server** — with its own auth/authorization contract
12. **Billing** — Polar checkout, webhooks, subscription state, entitlements, cancellation, payment-state, idempotent events
13. **Hardening, Evaluation, Observability, Privacy/Data Lifecycle, Security Tests**
14. **MVP Ship Gate Evidence Collection**

---

## C. Detailed Phase-by-Phase Task Plan

---

### Phase 1: Foundation

**Goal:** A running Next.js app with Supabase Auth, all core database tables, RLS, session/cookie security, CSRF baseline, and the security headers baseline.

#### 1.1 Repository Bootstrap
- Initialize Next.js 16.3.8 with pnpm (`pnpm create next-app`)
  - Pin exact version; do not use canary
  - Enable TypeScript 6.0.x compatible with the Next.js version
- Configure `pnpm-lock.yaml` committed to Git
- Configure `.nvmrc` / `.node-version` to Node.js 24.21.0 LTS
- Configure ESLint + Prettier (project-consistent, not AI-invented)
- Configure `tsconfig.json` with strict mode
- Add `tailwind.config.ts` (Tailwind CSS 4.x)
- Install shadcn/ui, Lucide, Inter font via Google Fonts
- Install Zod 4.x
- Set up basic folder structure:
  ```
  /app           — Next.js App Router pages and layouts
  /app/api/v1    — Route Handlers (API)
  /components    — shadcn/ui + custom components
  /lib           — Linker Core modules
  /lib/auth      — Auth utilities (server-side only)
  /lib/db        — Supabase client factories
  /lib/adapters  — External integrations (LinkedIn, Telegram)
  /lib/brain     — Professional Brain
  /lib/agent     — Agent loop
  /lib/mcp       — MCP server
  /supabase      — SQL migrations + seed
  /supabase/migrations
  /tests         — Vitest + Playwright
  ```

#### 1.2 Environment and Secrets Baseline
- Define `.env.local.example` (no real secrets committed)
- Environment variable schema validated via Zod at startup
- Topology: local / preview-staging / production environments
  - Each environment gets its own Supabase project credentials
  - No production credentials in `.env.local`
  - Documented: production topology = Vercel + Supabase production project
- Add `.gitignore` for all `.env*` files

#### 1.3 Supabase Project Setup (Schema Migration 0001)
- Create migration `0001_initial_schema.sql`
- Tables to define (§20.2 core entities, fully typed with correct constraints):

  **Authentication / Accounts**
  ```
  accounts (id uuid PK, created_at, updated_at, status)
  connections (id, account_id FK, provider text, provider_account_id, 
               encrypted_token_ref text, status, expires_at, scopes, 
               created_at, updated_at)
    UNIQUE(account_id, provider)
    CHECK status IN ('connected','authorization_required','expired','revoked',
                     'permission_changed','temporarily_unavailable','disconnected')
  ```

  **Professional Brain**
  ```
  professional_identity, expertise, goals, preferences, voice_signals,
  projects, experiences, memories, strategies, strategy_versions
  ```
  All with: account_id FK, source, confidence, status, timestamps  
  Memory lifecycle statuses: detected|candidate|validated|active|updated|superseded|archived  
  Information class column: FACT|USER_PREFERENCE|INFERENCE|GOAL|MEMORY|UNCERTAINTY

  **Opportunities**
  ```
  opportunities (id, account_id FK, type, status, relevance_score, evidence jsonb,
                 lifecycle: detected|evaluated|presented|accepted|rejected|ignored|acted|measured|learned|archived,
                 created_at, evaluated_at, presented_at, acted_at)
  ```

  **Content**
  ```
  content_ideas, content_drafts, content_versions
  ```

  **Publishing / Jobs**
  ```
  published_posts (id, account_id FK, platform_post_id, platform, status, published_at,
                   idempotency_key UNIQUE per account+platform scope)
    UNIQUE(account_id, platform, platform_post_id)
  scheduled_jobs (id, account_id FK, job_type, entity_id, scheduled_at, status,
                  attempts, max_attempts, idempotency_key UNIQUE, last_error,
                  started_at, completed_at)
    UNIQUE(idempotency_key) within execution scope
  ```

  **Analytics**
  ```
  analytics_snapshots (id, account_id FK, post_id FK, snapshot_at, data jsonb)
  -- Snapshots, not overwrites (§26 constraint)
  ```

  **Agent**
  ```
  agent_rules (id, account_id FK, rule_type, value, enabled, created_at, updated_at)
  agent_activity (id, account_id FK, actor, action, resource, trigger, permission_rule,
                  result, status, external_id, error, retry_info, created_at)
  ```

  **Telegram**
  ```
  telegram_connections (id, account_id FK UNIQUE, telegram_user_id UNIQUE, linked_at,
                        link_token text, link_token_expires_at, status)
  telegram_messages (id, account_id FK, direction, message_id, content_ref, created_at)
  ```

  **MCP**
  ```
  mcp_clients (id, account_id FK, client_name, client_id UNIQUE, created_at, revoked_at)
  mcp_permissions (id, mcp_client_id FK, scope, granted_at, revoked_at)
  ```

  **Billing**
  ```
  billing_customers (id, account_id FK UNIQUE, polar_customer_id UNIQUE, created_at)
  billing_subscriptions (id, account_id FK, polar_subscription_id UNIQUE,
                         product_id, price_id, status, current_period_start,
                         current_period_end, cancel_at_period_end, cancelled_at,
                         created_at, updated_at)
  billing_entitlements (id, account_id FK, plan text, feature text, enabled bool,
                        updated_at)
  billing_webhook_events (id, polar_event_id UNIQUE, event_type, processed_at,
                          status, payload jsonb)
  ```

  **Audit**
  ```
  audit_logs (id, account_id FK nullable, actor_type, actor_id, action, resource_type,
              resource_id, result, status, metadata jsonb, created_at)
  ```

- **RLS Policies** — mandatory on every account-owned table:
  - `ENABLE ROW LEVEL SECURITY` on all account-scoped tables
  - `USING (account_id = auth.uid()::uuid)` (or via `accounts` join)
  - Service-role bypass only where explicitly required and documented
- **Critical DB constraints** (§20.2):
  - UNIQUE on `connections(account_id, provider)`
  - UNIQUE on `published_posts(account_id, platform, platform_post_id)`
  - UNIQUE on `scheduled_jobs(idempotency_key)`
  - UNIQUE on `billing_webhook_events(polar_event_id)`
  - FK with ON DELETE behavior explicitly documented per table
  - CHECK constraints on all status/enum columns
  - Indexes on frequently queried FK columns

#### 1.4 Supabase Auth + Session Contract
- Install `@supabase/ssr` (as per §13 sealed decision)
- Create server-side Supabase client factory (`lib/db/supabase-server.ts`)
- Create browser-side Supabase client factory (`lib/db/supabase-client.ts`)
- Implement `proxy.ts` (Next.js 16 Supabase session refresh proxy pattern)
  - Proxy must propagate refreshed cookies
  - Use `supabase.auth.getClaims()` for identity verification; never trust cookie contents
- Auth cookies: `SameSite=Lax`, `Secure` (HTTPS only), `HttpOnly`
- No `localStorage` token storage
- Authenticated/user-specific responses: `Cache-Control: no-store` or equivalent
- Protected Server Components: resolve authenticated account before reading account data
- Logout: use Supabase `signOut()` only; no parallel session table

#### 1.5 Security Baseline (HTTP)
- `next.config.ts` security headers:
  - `Content-Security-Policy` (start restrictive; expand as features require)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Frame-Options: DENY` (clickjacking protection)
  - `Strict-Transport-Security` (HSTS — **only after** verified permanent production hostname)
- CORS: deny-by-default; explicit allowlist only for MCP and webhook endpoints
- All GET endpoints must not perform state mutations (§28 spec rule)
- POST/PATCH/DELETE endpoints validate `Origin` / `Referer`; Server Actions covered by Next.js CSRF handling; Route Handlers require explicit CSRF protection for cookie-authenticated mutations
- Post-auth/error redirects use an allowlist to prevent open redirects

#### 1.6 Authorization Middleware
- `lib/auth/require-auth.ts` — server-side helper: verifies Supabase session, resolves `account_id`, used by all protected Route Handlers and Server Components
- Authorization rule: `account_id` always from verified server-side session, never from client-supplied parameters
- 401/403 behavior: fail closed; do not reveal another account/resource existence
- Middleware (`middleware.ts`): protect all `/app/(protected)` routes, redirect unauthenticated to landing

#### 1.7 CI Pipeline (GitHub Actions)
- Workflow: `typecheck → lint → unit/integration tests → build → (E2E checks stub)`
- All checks run on PR and push to main
- No paid CI services

#### 1.8 Phase 1 Acceptance Tests
- Session cannot be forged via cookie manipulation
- Authenticated user cannot access another account's data (cross-account test)
- RLS blocks direct DB access without correct session
- Auth failure returns 401/403 without leaking resource existence
- Security headers present on all responses
- CSRF: cookie-authenticated mutation without correct origin is rejected
- Logout invalidates session

---

### Phase 2: LinkedIn Adapter + OAuth Lifecycle

**Goal:** Full server-side LinkedIn OAuth (3-legged Authorization Code flow) with secure token storage, connection state machine, and a verified adapter for approved capabilities.

#### 2.1 LinkedIn App Registration Verification
> ⚠️ **DECISION REQUIRED** (see Section E): Exact LinkedIn API permissions approved for the application must be verified against current official documentation before implementation. Do not assume permissions; do not rely on stale examples.

#### 2.2 OAuth Flow Implementation
- Route: `GET /api/v1/auth/linkedin` — initiates OAuth
  - Generates cryptographically random `state` (tied to session/account, single-use, expiring, stored in DB/encrypted)
  - Redirects to LinkedIn authorization URL with `response_type=code`, `client_id`, `redirect_uri` (absolute HTTPS), `scope`, `state`
- Route: `GET /api/v1/auth/linkedin/callback` — receives `code` and `state`
  - Validates `state`: match, single-use (delete after check), not expired, tied to initiating session/account
  - Mismatch/expiry/error → fail closed, no code exchange, safe error response
  - Code exchange occurs **server-side** only (client secret never leaves server)
  - Exchanges code for tokens via LinkedIn API
  - Stores tokens encrypted in `connections.encrypted_token_ref` (via Supabase Vault reference, not plaintext fields)
  - Stores `expires_at`, `scopes`, status (`connected`)
  - Removes OAuth `code` from URL after callback processing
  - Redirects to allowlisted post-auth destination
- State machine enforced:
  `connected → expired → revoked → authorization_required → permission_changed → temporarily_unavailable → disconnected`
- Token renewal: implement only currently supported LinkedIn refresh path (document and verify against official docs before implementing)
  > ⚠️ **DECISION REQUIRED**: LinkedIn token renewal mechanism must be verified against current official LinkedIn documentation before implementation.

#### 2.3 LinkedIn Adapter (`lib/adapters/linkedin/`)
- Adapter owns: API versions, capabilities, permissions, request/response translation, rate limits, platform errors, migration logic
- High-level operations (§16):
  - `publishPost(account_id, content)` → returns `platform_post_id` or throws typed error
  - `schedulePost(...)` → verify if LinkedIn native scheduling is available; if not, handled by Linker scheduler
  - `getProfile(account_id)` → returns normalized profile data
  - `getPosts(account_id, opts)` → returns post list
  - `getAnalytics(account_id, post_id)` → returns analytics data
- Adapter never returns raw OAuth tokens; agent/business logic never receives them
- Rate limit handling: respect limits, surface them accurately as `RETRYABLE_FAILURE` or `USER_ACTION_REQUIRED`
- All adapter calls have outbound request timeouts
- Unavailable capabilities reported accurately; never bypass platform controls

#### 2.4 LinkedIn API Capability Verification
> ⚠️ **DECISION REQUIRED**: Before implementing adapter operations, verify each capability against current official LinkedIn API documentation. Document:
> - Exact API endpoint and version
> - Exact permission/scope required
> - Exact response schema
> - Rate limit
> - Any known limitations

#### 2.5 Phase 2 Acceptance Tests
- OAuth state cannot be replayed (single-use)
- OAuth state tied to initiating session (state from session A rejected by session B)
- State mismatch → no code exchange
- Expired state → no code exchange
- Client secret never appears in logs, responses, or browser
- Connection status reflects actual LinkedIn state
- Revoked credentials stop execution and trigger reconnect
- Token never appears in AI context, Telegram, or MCP response
- Adapter rate limit surface is accurate
- Duplicate connection attempt (same account, same provider) rejected by DB UNIQUE constraint

---

### Phase 3: Professional Brain

**Goal:** Persistent, structured professional context with correct lifecycle management, information class distinctions, and account-scoped retrieval.

#### 3.1 Data Model
Already defined in Phase 1 schema. Verify all columns match §9 components:
- Identity, Expertise Graph, Experience Memory, Voice Model, Goals, Audience Model, Content Memory, Preference Memory, Relationship Memory, Strategy Memory, Learned Patterns

#### 3.2 Brain Service (`lib/brain/`)
- `brain.service.ts` — CRUD for all Brain components
  - `getBrainContext(account_id)` — assembles context for agent use
  - `upsertIdentity(account_id, data, source, confidence)`
  - `addMemory(account_id, memory, class, source, confidence)`
  - `transitionMemoryStatus(account_id, memory_id, newStatus)` — enforces lifecycle
  - `updateExpertise(account_id, skill, level, source, confidence)`
  - `updateVoiceSignal(account_id, signal, evidence)`
  - `updateGoals(account_id, goals)`
- Memory rules (§9):
  - Never convert `INFERENCE` → `FACT` without evidence/validation
  - Memory metadata must preserve source, confidence, timestamp, status, provenance
  - User feedback = learning signal, not model training
  - Lifecycle: `detected → candidate → validated → active → updated → superseded → archived`

#### 3.3 Brain API Endpoints
Per §18:
```
GET  /api/v1/brain
GET  /api/v1/brain/identity
GET  /api/v1/brain/expertise
GET  /api/v1/brain/goals
GET  /api/v1/brain/voice
GET  /api/v1/brain/preferences
GET  /api/v1/brain/experiences
GET  /api/v1/brain/memories
```
All endpoints: authentication → account authorization → validate query params → fetch → return

#### 3.4 Phase 3 Acceptance Tests
- `INFERENCE` cannot become `FACT` without evidence
- Cross-account: account A cannot read account B's brain
- Memory lifecycle transitions are enforced (can't go backwards without explicit supersede)
- Context assembled for agent never includes raw OAuth tokens
- Source, confidence, provenance preserved correctly

---

### Phase 4: Core Agent Loop + Context Engine

**Goal:** Persistent agent state machine with correct state transitions, policy enforcement, and a context engine that assembles the minimum necessary context for AI tasks.

#### 4.1 Agent State Machine (`lib/agent/state-machine.ts`)
States (§10):
```
IDLE → OBSERVING → ANALYZING → OPPORTUNITY_FOUND → PLANNING 
     → WAITING_FOR_APPROVAL → EXECUTING → MONITORING → LEARNING → IDLE
```
Failure states: `RETRYABLE_FAILURE`, `PERMANENT_FAILURE`, `USER_ACTION_REQUIRED`

- State persisted in `agent_activity` / dedicated `agent_status` table
- State transitions are audit-logged
- Autonomy modes: `Manual`, `Assisted`, `Scheduled`, `Autonomous` (default: `Assisted`)

#### 4.2 Context Engine (`lib/agent/context-engine.ts`)
- Assembles minimum necessary context for each AI task
- Context is structured (not one giant prompt)
- Never includes: OAuth tokens, raw credentials, other account's data
- Prompt injection defense: external content is `untrusted data`; external content cannot alter permissions, autonomy, account scope, rules, system instructions, or execution authority
- AI receives capabilities/results, never raw credentials

#### 4.3 Model Router (`lib/ai/model-router.ts`)
- Provider-agnostic interface
- Initial provider: Groq Free tier
- Metered internally: task / model / tokens / latency / cost where available
- Safe degradation when free model limit is reached
- No provider name appears in product UX
- No AI provider direct calls from frontend

#### 4.4 Permission Hierarchy (§10)
Enforced in agent decision path:
```
platform/safety constraints
  → explicit prohibition
    → explicit permission
      → autonomy mode
        → strategy
          → agent judgment
```

#### 4.5 Agent API Endpoints
Per §18:
```
GET   /api/v1/agent/status
POST  /api/v1/agent/pause
POST  /api/v1/agent/resume
GET   /api/v1/agent/activity
GET   /api/v1/agent/rules
PATCH /api/v1/agent/rules
```

#### 4.6 Phase 4 Acceptance Tests
- Agent cannot autonomously publish without enabled rules
- Agent cannot send private messages without explicit permission
- Agent cannot follow/unfollow, send connections
- Agent cannot make sensitive personal claims, controversial/political content, unverified claims, expose private info
- External content cannot change agent permissions or autonomy settings (prompt injection)
- State transitions are audit-logged
- Model provider is never exposed in UX

---

### Phase 5: Opportunity Engine

**Goal:** Disciplined signal-to-opportunity pipeline that discards most signals and produces only evaluated, account-relevant opportunities.

#### 5.1 Opportunity Service (`lib/agent/opportunity-engine.ts`)
- Inputs (§11): user activity, LinkedIn activity, external world, own history, Professional Brain, performance, research, scheduled scans, MCP requests
- Types: content, engagement, relationship, trend, reputation, timing
- Evaluation scoring: relevance, goal alignment, authenticity, audience value, timing, evidence, potential impact
- Penalties: repetition, genericity, uncertainty, noise
- **Key rule**: most signals are discarded before becoming opportunities

#### 5.2 Opportunity Lifecycle
`Detected → Evaluated → Presented → Accepted/Rejected/Ignored → Acted → Measured → Learned → Archived`
- Lifecycle transitions persisted in `opportunities` table
- User feedback (Accept/Reject) is a learning signal

#### 5.3 Opportunity API Endpoints
```
GET  /api/v1/opportunities
GET  /api/v1/opportunities/:id
POST /api/v1/opportunities/:id/accept
POST /api/v1/opportunities/:id/reject
```

#### 5.4 Phase 5 Acceptance Tests
- Opportunity scoring is deterministic for the same inputs
- Rejected opportunities are stored (not silently deleted)
- Learned patterns from accepted/rejected feed back to evaluation
- MCP request can trigger opportunity detection without bypassing Core policies

---

### Phase 6: Content Intelligence

**Goal:** A disciplined content pipeline from opportunity to published post, with thesis-first drafting, anti-AI checks, and evidence-grounded writing.

#### 6.1 Content Pipeline (`lib/content/`)
Stages (§12):
```
Opportunity → Angle → Thesis → Evidence → Structure → Draft 
           → Critique → User Feedback → Final → Schedule → Publish 
           → Performance → Learn
```

- Thesis before drafting — weak thesis = do not write
- Ground content in real user evidence from Professional Brain
- Never invent experiences (§12 rule — hard constraint)
- Claims require evidence
- Distinguish fact, observation, opinion, claim
- Originality check (compare against `content_history`)
- Preserve technical depth

#### 6.2 Anti-AI Checks (§12)
Must run before finalization:
- Generic intros
- Empty motivation
- Fake personal stories
- Corporate clichés
- Repetitive phrasing
- Unsupported claims
- Engagement bait
- Overexplaining
- Forced controversy
- Disconnected content
- Unnatural vocabulary
- Manufactured certainty

#### 6.3 Content API Endpoints
```
GET   /api/v1/content/ideas
POST  /api/v1/content/ideas
GET   /api/v1/content/drafts
GET   /api/v1/content/drafts/:id
POST  /api/v1/content/drafts
PATCH /api/v1/content/drafts/:id
POST  /api/v1/content/drafts/:id/approve
POST  /api/v1/content/drafts/:id/discard
```

#### 6.4 Phase 6 Acceptance Tests
- Draft is never created without a passing thesis
- Draft with invented experience is caught and rejected
- Anti-AI check flags run and are recorded
- Content cannot be approved if anti-AI checks have unresolved critical flags
- Content history compared for originality
- Voice model is used and voice-match evaluated

---

### Phase 7: Publishing / Scheduling / Idempotency

**Goal:** Verified, duplicate-safe publishing with persistent job scheduling that survives restarts.

#### 7.1 Publishing Pipeline (§16)
```
Approved content → Policy checks → Validation → Formatting/media preparation 
                → LinkedIn Adapter publish → Verify result (platform confirmation)
                → Store platform_post_id → Audit
```
- **Never** claim publish success without platform confirmation
- Duplicate publishing prevented by idempotency key in `published_posts`
- `platform_post_id` stored immediately on confirmed publish

#### 7.2 Scheduled Jobs (`lib/jobs/`)
Job schema already defined in Phase 1.  
Properties required (§17): account, job_type, entity, scheduled_time, status, attempts, max_attempts, idempotency_key, last_error, started_at, completed_at

- Jobs survive worker restart
- Execute once (idempotency key)
- Retry safely (distinguish `RETRYABLE_FAILURE` from `PERMANENT_FAILURE`)
- Record all results
- Implementation: pg_cron + pg_net → Supabase Edge Functions
- No in-memory scheduler

#### 7.3 Scheduling API Endpoints
```
POST /api/v1/posts/:id/publish   — immediate publish (idempotency key required)
POST /api/v1/posts/:id/schedule  — schedule for later (idempotency key required)
POST /api/v1/posts/:id/cancel    — cancel scheduled post
```

#### 7.4 Phase 7 Acceptance Tests
- Publishing the same post twice with the same idempotency key produces exactly one LinkedIn post
- Restarting a job mid-execution does not double-publish
- Failed publish is classified correctly (RETRYABLE vs PERMANENT vs USER_ACTION_REQUIRED)
- Unverified publish (no platform confirmation) is recorded as failure, not success
- Scheduled job cancellation works before execution

---

### Phase 8: Analytics Foundation

**Goal:** Historical snapshot-based analytics that accurately reflect LinkedIn performance data.

#### 8.1 Analytics Service (`lib/analytics/`)
- `fetchAndStoreSnapshot(account_id, post_id)` — calls LinkedIn Adapter, stores immutable snapshot
- `getOverview(account_id)` — aggregates across snapshots
- `getPostAnalytics(account_id, post_id)` — returns timeline of snapshots for a post
- Analytics are historical snapshots, never destructive overwrites (§20.2 constraint)

#### 8.2 Analytics API Endpoints
```
GET /api/v1/analytics/overview
GET /api/v1/analytics/posts/:id
GET /api/v1/analytics/history
```

> ⚠️ **DECISION REQUIRED**: Exact analytics fields available from LinkedIn API must be verified before implementation. Do not claim fields are available without verification.

#### 8.3 Scheduled Analytics Sync
- pg_cron job: periodic snapshot collection
- Job is idempotent (re-running does not create duplicates for same snapshot period)

#### 8.4 Phase 8 Acceptance Tests
- Analytics snapshots are additive, not overwritten
- Analytics endpoint returns 404 for another account's post (cross-account isolation)
- Analytics sync job is idempotent

---

### Phase 9: Telegram Agent

**Goal:** Secure, conversation-capable Telegram interface that routes all actions through Linker Core with no separate business logic.

#### 9.1 Telegram Bot Setup
- Register Telegram Bot (via BotFather) — separate bots for dev/staging/production
- Bot secrets stored in Supabase Vault
- Webhook endpoint: `POST /api/v1/telegram/webhook`

#### 9.2 Secure Telegram Linking Flow
- Generate one-time, expiring link token stored in `telegram_connections.link_token`
- User sends token to bot → bot verifies → links `telegram_user_id` to `account_id`
- Link token is single-use, expiring
- `telegram_connections.telegram_user_id` UNIQUE enforced at DB level

#### 9.3 Webhook Handler (`lib/adapters/telegram/`)
- Verify Telegram webhook signature before processing
- Duplicate/replay protection (track `message_id`)
- Handler routes through Linker Core — **no** separate business logic that bypasses Core
- Priority message routing (§14):
  - P0: critical account/security/platform
  - P1: important opportunities/comments/events
  - P2: useful drafts/performance/strategy
  - P3: digest
- No mandatory daily message
- Proactive messages only when user has something worth knowing/doing

#### 9.4 Phase 9 Acceptance Tests
- Telegram link token cannot be replayed (single-use)
- Telegram link token expires correctly
- Webhook without valid signature is rejected
- Telegram message cannot bypass Linker Core policy
- Two accounts cannot share the same `telegram_user_id`
- Test mode prevents real production Telegram messages during CI

---

### Phase 10: Dashboard

**Goal:** Web UI for inspection and management (not the primary action interface — that's Telegram).

#### 10.1 Dashboard Navigation (§15)
Pages:
1. **Home** — agent status, recent activity summary
2. **Content** — drafts, approved content, published posts
3. **Ideas** — content ideas / opportunities
4. **Calendar** — scheduled posts
5. **Analytics** — post performance
6. **Professional Brain** — current Brain state (read + guided update)
7. **Agent Activity** — audit log / activity feed
8. **Settings** — connections (LinkedIn, Telegram), autonomy mode, agent rules, billing

#### 10.2 First-Time User Flow (§8)
```
Landing → Continue with LinkedIn → LinkedIn authorization → Dashboard 
       → Activate Agent → Connect Telegram → Agent starts
```
- No email/password
- After Telegram connection: activate immediately
- No second onboarding step
- Progressive context building
- Natural commands enabled

#### 10.3 UI Components
- shadcn/ui components throughout
- Lucide icons
- Inter typography
- Tailwind CSS 4.x
- React state/context (no global state library unless justified)
- Server Components for data-heavy pages; Server Actions for mutations
- Client Components only where interactivity is required

#### 10.4 Phase 10 Acceptance Tests
- Dashboard never shows another account's data
- User cannot reach protected dashboard pages without active session
- LinkedIn disconnect removes `connections` record and stops agent execution
- Telegram disconnect disables agent active state

---

### Phase 11: MCP Server

**Goal:** Thin, authenticated MCP interface over Linker Core with its own independent authorization mechanism and full policy/autonomy enforcement.

#### 11.1 MCP Architecture
```
External AI client → MCP HTTP endpoint (authentication boundary)
                   → Linker Core (policy/autonomy enforcement)
                   → Professional Brain / Agent / Execution
                   → LinkedIn
```

#### 11.2 MCP Authorization (§19.1)
- MCP HTTP endpoint is a **protected resource**
- Web cookie is **not** sufficient MCP authorization
- External MCP clients authenticate via MCP-appropriate bearer/OAuth mechanism
- Validate: token issuer, audience/resource, signature, expiry, required scopes
- Authorization fails at HTTP boundary (not tool-level success/error)
- Tokens for one MCP resource/client cannot be used as generic Linker session credentials
- MCP client identity, account scope, and permissions are independently auditable

#### 11.3 MCP Implementation (`lib/mcp/`)
- MCP TypeScript SDK v2 stable
- Thin layer — no duplicated business logic
- Resources (§19):
  - `profile://me`, `profile://expertise`, `profile://voice`, `profile://goals`
  - `content://history`, `content://recent`
  - `analytics://performance`
  - `strategy://current`
  - `agent://status`, `agent://activity`
- Tools (§19):
  - **Read**: `get_profile`, `get_expertise`, `get_goals`, `get_voice`, `get_content_history`, `get_recent_posts`, `get_post_performance`, `get_content_ideas`, `get_current_strategy`, `get_agent_activity`, `get_agent_status`
  - **Create**: `create_idea`, `create_post_draft`, `create_comment_draft`
  - **Modify**: `rewrite_post`, `update_idea`, `update_strategy`
  - **Execute**: `schedule_post`, `publish_post`
  - **Analyze**: `analyze_post`, `analyze_performance`, `find_opportunities`, `research_topic`
- Approval-required actions return `approval_required` (never bypass approval flow)
- MCP cannot bypass: pause state, account scope, execution restrictions, autonomy mode

#### 11.4 Phase 11 Acceptance Tests
- MCP client authenticated with invalid token receives 401 at HTTP boundary
- MCP client from account A cannot access account B's resources
- Approval-required action via MCP returns `approval_required`, not silently executes
- MCP cannot bypass paused agent state
- MCP token cannot be used as Linker web session credential
- MCP client identity and scope are audited

---

### Phase 12: Billing (Polar.sh)

**Goal:** Full billing lifecycle with checkout, subscription state, entitlements, webhooks, cancellation, and idempotent event processing.

#### 12.1 Plans
- Free plan (default)
- Linker Pro

#### 12.2 Polar Integration (`lib/billing/`)
- Checkout: `POST /api/v1/billing/checkout` → creates Polar checkout session → return checkout URL
- Billing portal: `POST /api/v1/billing/portal` → return Polar customer portal URL
- Subscription state: `GET /api/v1/billing/subscription` → server-side verified state
- Billing overview: `GET /api/v1/billing` → plan, entitlements, payment state

#### 12.3 Polar Webhooks
- Endpoint: `POST /api/v1/billing/webhook` (public-facing, signature verified)
- Verify Polar webhook signature before processing
- Idempotency: check `billing_webhook_events(polar_event_id)` — skip if already processed
- Process events: subscription created, updated, cancelled, payment succeeded, payment failed
- Update `billing_subscriptions`, `billing_entitlements`
- Server-side Polar/webhook state is **authoritative** — never client state

#### 12.4 Entitlement Checks
- `lib/billing/entitlements.ts` — `hasEntitlement(account_id, feature)` — server-side DB check
- Never client-side entitlement state as authority
- Entitlement check required before access to Pro features

#### 12.5 Phase 12 Acceptance Tests
- Duplicate Polar webhook event is processed exactly once (idempotency)
- Client cannot claim Pro entitlement without server-verified subscription
- Cancellation correctly updates entitlements at period end
- Payment failure correctly restricts Pro features
- Checkout never uses client-supplied subscription state as confirmation
- Polar webhook secret never appears in logs or responses

---

### Phase 13: Hardening, Observability, Privacy, Security Tests

**Goal:** Ship-quality hardening across the full stack before MVP Ship Gate evidence collection.

#### 13.1 Rate Limiting
- Database-backed rate limits (§16, no Redis for MVP)
- Stricter limits on consequential endpoints (publish, schedule, MCP execute)
- LinkedIn/Polar/Telegram/AI rate limits respected and surfaced accurately
- Rate limit headers returned where applicable

#### 13.2 Sentry Integration
- Sentry free Developer tier
- Error monitoring configured
- Data minimization: no OAuth tokens, bot secrets, billing secrets, prompts containing unnecessary private data in Sentry events
- AI traces: data minimization/redaction configured

#### 13.3 Structured Logging
- Standard Node/server logs for application behavior
- Persisted Agent Activity / Audit Logs for consequential actions
- Log redaction: no cookies, Authorization headers, OAuth codes/tokens, webhook secrets, unnecessary personal content

#### 13.4 Privacy / Data Lifecycle
> ⚠️ **DECISION REQUIRED BEFORE MULTI-USER LAUNCH** (§59):
> Explicitly define: deletion propagation, retention periods, data classification, export format/completeness, backup retention/deletion behavior, and retention for audit logs, Telegram messages, analytics snapshots, Agent Activity, rejected opportunities, AI observability data.

#### 13.5 Export / Delete Endpoints
```
GET  /api/v1/me
GET  /api/v1/me/connections
DELETE /api/v1/me/connections/:provider
POST /api/v1/me/export
POST /api/v1/me/delete
```
- Data export completeness definition: **DECISION REQUIRED**
- Delete propagation: **DECISION REQUIRED**

#### 13.6 Security Tests (§21)
- Cross-account access: BLOCKED by RLS + application auth
- Prompt injection: external content cannot alter permissions, autonomy, rules
- Approval token specificity: approval for action A is not reusable for action B
- Secret isolation: no secrets in GitHub, frontend bundles, logs, prompts, model context, Telegram, MCP responses, DB plaintext
- TLS enforced on all production traffic
- HSTS enabled only after verified permanent production hostname

#### 13.7 Backup / Recovery
> ⚠️ **DECISION REQUIRED**: Supabase Free has limited backup capabilities. Document and test export/recovery procedure before launch. Production backup upgraded when revenue supports paid infrastructure.

#### 13.8 Phase 13 Acceptance Tests
- Rate limits block excess requests on consequential endpoints
- Sentry receives errors with redacted sensitive data
- Export endpoint returns complete account data
- Delete endpoint removes all account data with documented propagation
- Prompt injection attempt cannot change agent permissions in test

---

### Phase 14: MVP Ship Gate Evidence Collection

**Goal:** Collect concrete evidence (test, trace, log, screenshot, or other) for every Ship Gate item (§26).

Each item requires evidence — not just code:

| Ship Gate Item | Evidence Type |
|---|---|
| Real LinkedIn OAuth | Integration test with controlled LinkedIn test account |
| Current LinkedIn capabilities/permissions | Verified API capability doc + integration test |
| Secure Telegram linking | Security test: token replay, expiry, wrong account |
| Immediate activation after Telegram | E2E test |
| Accurate Professional Brain retrieval | Unit test + integration test |
| Accurate explanation of current understanding | Agent output evaluation test |
| Relevant opportunity detection | Evaluation test with test fixture data |
| Grounded content | Content pipeline test: invented experience rejected |
| Voice-match evaluation | Voice model evaluation test |
| Learning from feedback | Brain update test after accept/reject |
| Verified publishing | Integration test: platform confirmation required |
| Duplicate prevention | Idempotency test: same post published once |
| Restart-safe scheduling | Job restart test |
| Failure classification | Error type test suite |
| Historical analytics | Snapshot immutability test |
| Agent Activity/audit | Audit log completeness test |
| Pause/revoke behavior | State machine test |
| MCP authentication/scope/permissions | MCP auth test suite |
| MCP policy/autonomy enforcement | MCP bypass attempt tests |
| `approval_required` | MCP approval flow test |
| Cross-account isolation | Security test suite |
| RLS testing | DB-level access test |
| Secret isolation | Secrets scan (no hardcoded secrets in repo) |
| Prompt-injection resistance | Injection test suite |
| Customer-zero E2E loop | Full end-to-end test |
| Monitoring | Sentry error confirmed received |
| Backup/restore | Restore procedure tested |
| Emergency controls | Agent pause, LinkedIn disconnect, account delete — all tested |

---

## D. Dependencies and Prerequisites

```
Phase 1: Foundation
  ↓
Phase 2: LinkedIn Adapter          [requires: Phase 1, LinkedIn App registered]
  ↓
Phase 3: Professional Brain        [requires: Phase 1]
  ↓
Phase 4: Agent Loop + Context      [requires: Phase 1, 2, 3]
  ↓
Phase 5: Opportunity Engine        [requires: Phase 4]
  ↓
Phase 6: Content Intelligence      [requires: Phase 5, Phase 3 (Brain context)]
  ↓
Phase 7: Publishing / Scheduling   [requires: Phase 2 (Adapter), Phase 6]
  ↓
Phase 8: Analytics                 [requires: Phase 2 (Adapter), Phase 7]
  ↓
Phase 9: Telegram Agent            [requires: Phase 4 (Core routes), Telegram Bot registered]
  ↓
Phase 10: Dashboard                [requires: Phase 1 (auth), Phases 3-8 for data]
  ↓
Phase 11: MCP                      [requires: Phase 4 (Core), MCP SDK v2]
  ↓
Phase 12: Billing                  [requires: Phase 1 (accounts), Polar.sh account]
  ↓
Phase 13: Hardening                [requires: all prior phases]
  ↓
Phase 14: Ship Gate                [requires: Phase 13]
```

**External prerequisites before implementation can start:**
- [ ] Supabase project created (Free plan, separate for dev/staging/production)
- [ ] GitHub repository created (public for free CI)
- [ ] Vercel account set up (production deployment target)
- [ ] LinkedIn Developer App registered
- [ ] Telegram Bot registered via BotFather (dev and production bots)
- [ ] Polar.sh Starter account created
- [ ] Sentry free Developer account created

**Prerequisite decisions that must be resolved (see Section E) before the affected phase begins.**

---

## E. Genuine Blockers / Decisions Required

The following are genuine blockers — implementation of the affected phase **must not start** until each is resolved. They are distinguished from implementation-time decisions that can be made during coding.

> **Hosting note:** All production deployment targets Vercel. Oracle Cloud is fully removed. Do not reintroduce it.

### 🔴 BLOCKER 1: LinkedIn API Permissions
**Affects:** Phase 2 (and every phase that uses LinkedIn data)
**Issue:** Exact LinkedIn permissions/capabilities approved for this application must be verified against current official LinkedIn API documentation. The spec explicitly warns against relying on stale examples.
**Required:** User must register the LinkedIn Developer App, identify the exact product memberships and permission scopes available, and record them before the adapter is implemented.
**Spec reference:** §27, §31, §36 (LinkedIn OAuth/Token), §16 (LinkedIn Adapter)

### 🔴 BLOCKER 2: LinkedIn Token Renewal Mechanism
**Affects:** Phase 2
**Issue:** Do not assume long-lived access tokens. Implement only the currently supported renewal/re-authorization path. This must be verified against current official LinkedIn documentation before implementation.
**Required:** Verify LinkedIn's current token refresh flow and document it.
**Spec reference:** §35

### 🔴 BLOCKER 3: Production HTTPS Hostname
**Affects:** Phase 2 (LinkedIn OAuth requires absolute HTTPS redirect_uri), Phase 9 (Telegram webhooks)
**Issue:** LinkedIn web OAuth requires a real public HTTPS hostname for production. The spec prohibits inventing or relying on an unverified free-domain service without explicit approval.
**Required:** Decide on the Oracle Always Free instance's public hostname/domain strategy before LinkedIn production OAuth is configured.
**Spec reference:** §165-169

### 🔴 BLOCKER 4: Privacy / Data Retention Periods
**Affects:** Phase 13, any data deletion/export implementation
**Issue:** The spec explicitly marks this DECISION REQUIRED BEFORE MULTI-USER LAUNCH. Retention periods, deletion propagation, backup retention policy, export format must be explicitly defined — the coding agent must not invent arbitrary periods.
**Required:** User must define these before multi-user launch (not required for single customer-zero testing).
**Spec reference:** §59

### 🔴 BLOCKER 5 (renumbered): LinkedIn Developer App Registration
**Affects:** Phases 2, 7, 8
**Issue:** LinkedIn OAuth requires a registered Developer App with approved products, verified redirect URIs, and exact scopes. This is a human prerequisite that cannot be automated.
**Required:** Register LinkedIn Developer App, note approved product memberships and scopes, configure `redirect_uri` for dev (localhost equivalent) and production (HTTPS).

### 🔴 BLOCKER 6: Exact REST API Request/Response Schemas
**Affects:** Every API phase
**Issue:** The spec states: "Do not invent response schemas when an existing contract is not specified. Define and approve them first." (§18, §27)
**Resolution approach:** This can be resolved incrementally — define and approve the schema for each endpoint immediately before implementing that endpoint. This is not a single pre-implementation blocker but a per-endpoint gate. Schemas for Phases 1-3 should be approved before Phase 4 begins.

### 🟡 IMPLEMENTATION-TIME DECISION 1: Exact Analytics Fields
**Affects:** Phase 8
**Issue:** Analytics fields available from LinkedIn API must be verified before implementation. This is not a pre-implementation blocker but must be resolved before Phase 8 starts.

### 🟡 IMPLEMENTATION-TIME DECISION 2: LinkedIn Native Scheduling Availability
**Affects:** Phase 7
**Issue:** Whether LinkedIn native scheduling is available for this application type must be verified. If not, Linker handles all scheduling via pg_cron. This affects Phase 7 adapter implementation but not the overall architecture.

### 🟡 IMPLEMENTATION-TIME DECISION 3: Product Analytics Approach
**Affects:** Phase 13 / Dashboard
**Issue:** The spec notes "product analytics approach" as remaining undecided (§504). This must be decided before Dashboard instrumentation is added. No product analytics service may be added without explicit approval.

---

## F. Testing and Acceptance Strategy

### Testing Stack
- **Unit/Integration**: Vitest — for all service functions, Core modules, adapters (mocked), state machines
- **E2E Browser**: Playwright — for Auth flows, Dashboard flows, full user journeys
- **API/Contract**: Vitest + explicit fixtures/mocks — for all Route Handlers
- **Security tests**: Dedicated security test suite (cross-account, prompt injection, token isolation)

### Non-negotiable CI Rules (§8 spec / §136)
- Tests must never publish to a real production LinkedIn account during automated CI
- Tests must never charge real billing during automated CI
- Tests must never send real Telegram messages during automated CI
- External integrations: use mocks/fixtures in CI; controlled real test accounts for final acceptance only

### Acceptance Criterion Rule (§25)
A feature is **not done** because code compiles. Minimum evidence required:
1. Implementation complete
2. Relevant tests added
3. Authorization tested
4. Failure states tested
5. Tenant isolation tested where relevant
6. Secrets exposure checked
7. External integration verified where relevant
8. Audit behavior verified for consequential actions
9. Acceptance criterion has concrete evidence
10. No unresolved blocking decision

### Test Coverage Focus Areas (Ordered by Risk)
1. Cross-account data isolation (RLS + application auth)
2. OAuth state validation (single-use, expiry, session binding)
3. Publishing idempotency
4. Job restart safety
5. Prompt injection resistance
6. Secret isolation
7. MCP auth boundary
8. Billing webhook idempotency
9. Agent state machine correctness
10. Memory lifecycle enforcement

---

## G. MVP Ship Gate Mapping

Per §26, release requires evidence for each item. The table maps each Ship Gate item to its implementation phase and required evidence type.

| # | Ship Gate Item | Phase | Evidence |
|---|---|---|---|
| 1 | Real LinkedIn OAuth | 2 | Integration test (controlled test account) |
| 2 | Current LinkedIn capabilities/permissions | 2 | API verification doc + test |
| 3 | Secure Telegram linking | 9 | Security test: replay/expiry/cross-account |
| 4 | Immediate activation after Telegram | 9+10 | E2E test |
| 5 | Accurate Professional Brain retrieval | 3 | Unit + integration test |
| 6 | Accurate explanation of current understanding | 4 | Agent output evaluation |
| 7 | Relevant opportunity detection | 5 | Evaluation test with fixtures |
| 8 | Grounded content | 6 | Content pipeline test |
| 9 | Voice-match evaluation | 6 | Voice evaluation test |
| 10 | Learning from feedback | 3+5 | Brain update after accept/reject |
| 11 | Verified publishing | 7 | Integration test: confirmation required |
| 12 | Duplicate prevention | 7 | Idempotency test |
| 13 | Restart-safe scheduling | 7 | Job restart test |
| 14 | Failure classification | 4+7 | Error type test suite |
| 15 | Historical analytics | 8 | Snapshot immutability test |
| 16 | Agent Activity/audit | all | Audit log completeness test |
| 17 | Pause/revoke behavior | 4+10 | State machine test |
| 18 | MCP authentication/scope/permissions | 11 | MCP auth test suite |
| 19 | MCP policy/autonomy enforcement | 11 | MCP bypass attempt tests |
| 20 | `approval_required` returned | 11 | MCP approval flow test |
| 21 | Cross-account isolation | all | Security test suite |
| 22 | RLS testing | 1 | DB-level access test |
| 23 | Secret isolation | all | Secrets scan (git-secrets or equivalent) |
| 24 | Prompt-injection resistance | 4+6 | Injection test suite |
| 25 | Customer-zero E2E loop | 14 | Full E2E trace |
| 26 | Monitoring | 13 | Sentry error confirmed received |
| 27 | Backup/restore | 13 | Restore procedure tested and documented |
| 28 | Emergency controls | 10+13 | Agent pause, disconnect, delete — all tested |

---

## H. Recommended First Implementation Task

**Task: Phase 1.1-1.3 — Repository Bootstrap + Database Schema**

**Why first:** Everything else depends on the database schema, project structure, and auth foundation. The schema represents the most consequential early decision set — getting it right before any feature code is written prevents costly migrations.

**Exact first steps:**
1. Bootstrap Next.js 16.3.8 with pnpm in the repository root
2. Configure TypeScript, ESLint, Tailwind CSS 4.x, Inter font
3. Install shadcn/ui, Lucide, Zod 4.x
4. Validate the exact React version required by Next.js 16.3.8 before installing
5. Create environment variable schema with Zod validation
6. Write migration `0001_initial_schema.sql` covering all core entities, constraints, and RLS policies from §20.2
7. Apply migration to a local Supabase project
8. Write Phase 1.8 acceptance tests (RLS, cross-account, auth failure)
9. Set up GitHub Actions CI: typecheck → lint → unit test → build

**Before starting Step 1:** Confirm the following are available:
- Supabase project created (or local Supabase CLI configured)
- GitHub repository initialized (✅ already done)
- Vercel account connected to the GitHub repository
- Node.js 24.21.0 LTS available in the environment

---

## STOP

The implementation plan is complete. No code has been modified.
Awaiting explicit approval to begin implementation.

---

*Document version: Plan v1.0 | Derived from: LINKER — ENGINEERING SPEC v1.0 | Date: 2026-10-02*
