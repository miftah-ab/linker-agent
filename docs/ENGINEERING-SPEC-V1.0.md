
LINKER — ENGINEERING SPEC v1.0
Hosting Decision — SEALED 2026-10-02
Production hosting: Vercel.
Oracle Cloud: REMOVED from the Linker architecture and budget plan.
Vercel is the user's explicit hosting decision. Do not reintroduce Oracle or substitute another production host unless the user explicitly changes this decision.
Hosting Constraint
Development/preview and production deployment use Vercel.
The selected Vercel plan/terms must be verified before commercial launch. If the current Vercel plan does not permit the intended commercial use or a required Linker capability, mark the specific issue as BLOCKED: VERCEL PLAN/CAPABILITY DECISION REQUIRED rather than silently switching infrastructure.
Architecture remains portable so hosting can change later if the user explicitly chooses to migrate.
No paid infrastructure may be added without explicit user approval.
Security & Authentication Hardening Addendum — SEALED 2026-10-02
Web Session and Cookie Contract
Use Supabase Auth with the documented Next.js SSR integration and @supabase/ssr; do not implement a custom session/token system.
Next.js 16 uses proxy.ts for Supabase session refresh. The proxy must propagate refreshed cookies and verify identity with supabase.auth.getClaims() rather than trusting cookie contents.
Production auth cookies use HTTPS/Secure transport and SameSite=Lax unless a documented integration requirement requires otherwise. Do not store auth tokens in localStorage.
Do not hand-roll cookie serialization, token refresh, refresh-token rotation, or session expiry behavior when Supabase's SSR client handles it.
Authenticated/user-specific responses must not be publicly cached. Preserve the cache-control behavior required by Supabase session refresh.
Every protected Server Component, Server Action, Route Handler, and user-triggered background action resolves the authenticated Linker account server-side before reading or mutating account data.
Authorization uses verified identity plus database RLS. Never accept a client-supplied account_id as authority.
Logout/revocation must use the auth provider's supported session mechanisms; do not create a parallel session table without a concrete requirement.
Authentication failures fail closed with safe 401/403 behavior and do not reveal another account/resource's existence.
Browser Request / CSRF Contract
Cookie-authenticated state-changing requests must be protected against CSRF.
Validate same-site browser mutations using an explicit Origin/Referer policy where applicable; cross-site browser flows require an explicit approved CSRF mechanism.
OAuth state is mandatory, unpredictable, bound to the initiating session/account, single-use, expiring, and validated before authorization-code exchange.
OAuth callback state mismatch/expiry/error fails closed and never exchanges the code.
GET requests must not perform consequential mutations.
CORS is deny-by-default; only explicitly required origins may be allowed.
LinkedIn OAuth / Token Lifecycle
Use the documented server-side 3-legged Authorization Code flow for the web application and request only the minimum permissions actually available to the application.
Production redirect_uri must be absolute HTTPS and exactly match the registered LinkedIn Developer App configuration.
Authorization state is unique per attempt, single-use, expiring, bound to the initiating session/account, and validated before code exchange.
Authorization-code exchange occurs server-side. Client secrets never reach browser, URL, logs, AI context, Telegram, or MCP.
Do not assume long-lived LinkedIn access tokens. Store expiry/status metadata and implement only the currently supported renewal/re-authorization path for the exact application capabilities.
Connection state must distinguish at minimum: connected, authorization_required, expired, revoked, permission_changed, temporarily_unavailable, disconnected.
Invalid/revoked LinkedIn credentials stop execution safely and trigger reconnect rather than endless retries.
Scope changes require reauthorization before using the new capability.
OAuth codes/tokens/secrets are encrypted or securely referenced and never stored in ordinary application fields or logs.
API Security Contract
Protected endpoints require verified authentication and account authorization.
Validate request bodies, query parameters, path parameters, and relevant headers at the API boundary.
Define exact request/response/error schemas before implementing each endpoint.
Use consistent 401, 403, 404, 409, 422, and 429 semantics where applicable.
Consequential mutations require idempotency keys when duplicate requests could create external side effects.
Error responses use stable machine-readable codes and safe messages; never expose stack traces, SQL details, provider tokens, secrets, or internal prompts.
Apply request-size, pagination, and query-complexity limits.
Browser cookie-authenticated mutations must satisfy the CSRF contract above.
API logs must redact cookies, Authorization headers, OAuth codes/tokens, webhook secrets, and unnecessary personal content.
Web Security Baseline
Production uses HTTPS; enable HSTS only on a verified permanent production hostname.
Set CSP, X-Content-Type-Options, Referrer-Policy, and clickjacking protection.
Escape/sanitize untrusted user and external content before rendering.
Never place OAuth codes/tokens/webhook secrets in URLs unless the external protocol explicitly requires it; remove transient OAuth query parameters after callback handling.
Post-auth/error redirects must use an allowlist to prevent open redirects.
Validate content type and request size before expensive processing.
Apply outbound request timeouts and bounded retries. Never retry consequential non-idempotent actions without idempotency protection.
Webhooks must use provider-supported signature verification plus duplicate/replay protection.
Privacy / Retention / Data Lifecycle — DECISION REQUIRED BEFORE MULTI-USER LAUNCH
Before production launch, explicitly define: deletion propagation, retention periods, data classification, export format/completeness, backup retention/deletion behavior, and retention for audit logs, Telegram messages, analytics snapshots, Agent Activity, rejected opportunities, and AI observability data. The coding agent must not invent arbitrary retention periods.
Final Stack Lock Corrections — SEALED
Node.js: 24.21.0 LTS.
Next.js: 16.3.8 Active LTS.
React: 19.3.0 stable.
TypeScript: 6.0.x stable line. Use the latest 6.0.x patch compatible with the locked Next.js toolchain; do not adopt TypeScript 7 native-port previews for MVP.
Package manager: pnpm.
Auth: Supabase Auth.
Database access: Supabase JS/TypeScript client + SQL migrations; no ORM.
Validation: Zod 4.x.
Testing: Vitest + Playwright.
Jobs: Supabase pg_cron + pg_net + Edge Functions.
MCP: official TypeScript SDK v2.
CI: GitHub Actions.
Monitoring: Sentry free Developer tier initially.
AI: provider abstraction, initially Groq Free tier where available; no hard dependency on a paid provider.
Production hosting under $0 budget: Oracle Cloud Always Free, subject to account/resource availability. Vercel Hobby is development/non-commercial only, not commercial Linker production.
Billing: Polar.sh Starter/free plan initially.
Conflict resolution with older sections
Where the earlier v1.0 text says Vercel is the production deployment target, this final lock supersedes it: Vercel is not the zero-budget commercial production host. The architecture must remain portable to Vercel Pro later if revenue justifies the cost.
Build status correction
Build has NOT started from this Engineering Spec. The purpose of this lock is to finish the engineering choices before Antigravity receives implementation tasks.
Zero-Budget Technology & Infrastructure — SEALED 2026-10-02
Constraint: Miftah's available software budget is $0. MVP architecture must minimize mandatory recurring spend and must not require paid infrastructure before revenue.
1. Runtime / Framework
Next.js: 16.3.x Active LTS line. Pin the latest patched 16.3.x release available at implementation time; do not use canary. Next.js published 16.3.8 as Active LTS on 2026-09-30.
React: use the React version required/validated by the selected Next.js 16.3.x release. Do not independently upgrade React.
TypeScript: current stable version compatible with the locked Next.js release.
Package manager: pnpm.
Repository: GitHub.
2. Database / Auth / Data Access
Database: Supabase PostgreSQL Free Plan for MVP/customer-zero.
Authentication: Supabase Auth.
Data access: official Supabase JavaScript/TypeScript client + direct SQL migrations. No ORM for MVP.
Validation: Zod 4.x for API boundaries, environment configuration, tool inputs, webhook payloads, and structured AI outputs.
RLS: mandatory on tenant-owned tables.
Supabase Free currently provides a 0.5 GB database-size limit per active project; this is sufficient for customer-zero/MVP if usage is actively monitored.
3. Web UI
Styling: Tailwind CSS 4.x.
Components: shadcn/ui.
Icons: Lucide.
Typography: Inter.
UI state: React state/context first; no global state library for MVP unless a concrete requirement appears.
Data fetching: Next.js Server Components/server-side data access by default; use native browser/server fetch patterns and Server Actions where appropriate. Do not add TanStack Query merely by default.
Forms: React Hook Form + Zod only where complex forms justify it; simple forms may use native form handling/Server Actions.
4. API Architecture
Primary application API: Next.js Route Handlers under /api/v1.
Server-side Linker Core is the authority.
No direct browser-to-AI-provider calls.
No second API framework unless a concrete requirement is approved.
5. AI Infrastructure
Architecture: provider-agnostic model router.
Initial zero-budget provider: Groq Free tier, subject to its current free-tier rate limits and availability.
Provider must remain replaceable behind an internal AI adapter.
AI provider usage must be metered internally by task/model/tokens/latency/cost where available.
The system must degrade safely when the free model limit is reached.
No provider name appears in Linker product UX.
No assumption that free inference is unlimited or suitable for every production workload.
6. Background Jobs / Scheduling
Scheduler: Supabase pg_cron.
Job invocation: Supabase pg_net → Supabase Edge Functions for scheduled/background work where practical.
Job state: persisted in scheduled_jobs and protected by idempotency keys.
Secrets for scheduled jobs: Supabase Vault.
No in-memory scheduler.
Do not introduce Redis, BullMQ, a paid queue, or a dedicated worker server for MVP unless the free architecture proves insufficient.
Supabase officially supports scheduling Edge Functions with pg_cron + pg_net and recommends Supabase Vault for secrets used by scheduled calls.
7. MCP
SDK: official MCP TypeScript SDK v2 stable line.
Runtime: Node.js-compatible deployment.
Implementation: MCP server remains a thin authenticated interface over Linker Core; no duplicated business logic.
MCP permissions remain enforced by Linker Core.
8. Testing
Unit/integration: Vitest.
Browser E2E: Playwright.
API/contract tests: Vitest + explicit fixtures/mocks.
External integrations: use mocks/fixtures in automated tests; use controlled real test accounts for final acceptance verification.
Tests must never publish to a real production LinkedIn account or charge real billing during automated CI.
9. CI/CD
GitHub Actions.
Public repository workflows use GitHub Actions' free standard runner allowance.
Required CI checks: typecheck, lint, unit/integration tests, build, and relevant E2E/contract checks.
Do not add paid CI services for MVP.
10. Observability
Application/error monitoring: Sentry Developer/free tier initially, only for data and usage that can safely be sent to the service.
Structured application logs: standard Node/server logs plus persisted Agent Activity/Audit Logs for consequential actions.
Do not log OAuth tokens, bot secrets, billing secrets, prompts containing unnecessary private data, or sensitive user data.
AI traces must be configured with data minimization/redaction.
11. Billing
Provider: Polar.sh.
MVP: Free + Linker Pro.
Polar plan: Starter/free plan initially. Current published pricing lists Starter at $0/month with transaction fees.
Checkout, subscription state, entitlement checks, webhooks, cancellation, upgrade/downgrade, and idempotent webhook processing are required.
Billing state is authoritative from verified server-side Polar/webhook data, never client state.
Do not pay for Polar Pro/Growth/Scale before revenue justifies it.
12. Hosting — Critical Zero-Budget Rule
Vercel Hobby is NOT the production commercial hosting plan for Linker. Vercel's current terms restrict Hobby use to personal/non-commercial use. Therefore:
Vercel Hobby may be used for non-commercial development/experiments only.
Do not launch a paid Linker SaaS on Vercel Hobby.
Zero-budget production target: Oracle Cloud Always Free for the application runtime when a publicly accessible commercial MVP is required without monthly infrastructure spend.
Host Next.js using Node.js on an Always Free compute instance.
Use a standard reverse proxy/TLS setup.
Keep deployment portable so moving to paid Vercel or another provider later is straightforward.
Supabase remains the managed database/auth layer.
Oracle signup may require a payment card for verification even though Always Free resources can remain free; this is an account-registration requirement, not an expected monthly infrastructure cost.
Important: If Oracle Always Free capacity or account availability prevents deployment, do not silently switch to a paid service. Mark BLOCKED: ZERO-BUDGET HOSTING DECISION REQUIRED.
13. Domains / HTTPS
No paid custom domain before revenue.
LinkedIn web OAuth requires an absolute HTTPS redirect URL for the server-side web flow, so a real public HTTPS hostname is required for production LinkedIn OAuth.
The production hosting decision must therefore include a stable HTTPS hostname before real multi-user OAuth launch.
Do not invent or rely on an unverified free-domain service. If a free hostname is needed, evaluate and explicitly approve one before implementation.
Local development may use the documented LinkedIn development flow appropriate to the application type.
14. Environment Topology
Local: local Next.js + local/test configuration; no production credentials.
Preview/Staging: isolated Supabase project/configuration where practical; test LinkedIn/Telegram/P﻿olar integrations; no production external actions.
Production: isolated secrets/configuration, production LinkedIn/Telegram/Polar integrations, real customer data.
Development and staging cannot share production OAuth secrets, Telegram bot credentials, Polar webhook secrets, or database credentials.
15. Storage
No separate file-storage product for MVP unless a concrete feature requires it.
Use Supabase Storage only when MVP media/file requirements actually need it.
Do not introduce S3/Cloudinary/etc. by default.
16. Rate Limiting
Application-level rate limits implemented in Linker Core using database-backed or provider-supported mechanisms appropriate to the endpoint.
No Redis solely for rate limiting in MVP.
Consequential endpoints must have stricter limits.
External provider limits must be respected and surfaced accurately.
17. Backups / Recovery
Supabase Free has limited platform capabilities compared with paid plans; therefore MVP must have a documented export/recovery procedure rather than assuming paid backup features.
Database schema migrations must be version-controlled in Git.
Before destructive migrations, export/backup required data and test restore procedures.
Production backup requirements must be upgraded when revenue supports paid infrastructure.
18. Zero-Budget Principle
The architecture intentionally prefers:
open source → free tier → existing infrastructure → usage-based only after revenue → paid infrastructure only when required by real scale/reliability.
Do not solve hypothetical scale problems with paid infrastructure now.
Do not trade away security or data isolation to save money.
Do not assume a free tier is permanent; provider limits and policies must be rechecked before launch.
19. Research Basis
These decisions were checked against current official documentation/pricing on 2026-10-02. Important current constraints include: Next.js 16.3.8 is Active LTS; Supabase provides a Free plan and supports pg_cron/pg_net scheduling; Polar Starter is free with transaction fees; Telegram Bot API is free; MCP TypeScript SDK v2 is the stable 2026 SDK line; Vercel Hobby is non-commercial; Oracle provides Always Free compute resources; and GitHub Actions provides free CI minutes for public repositories.
20. Final Decision Rule
These choices are sealed for MVP unless the user explicitly changes them or a verified platform constraint makes one impossible.
If a provider changes pricing, limits, API availability, or terms, do not silently substitute another technology. Surface the affected decision, verify the current official documentation, and update this specification before implementation.
Technology Decisions — SEALED
The following UI technology decisions are now locked for Linker MVP:
Styling: Tailwind CSS
Component system: shadcn/ui
Icons: Lucide
Typography: Inter
The coding AI must use these consistently and must not introduce competing styling, component, or icon libraries without an explicit product-owner decision.
Raw CSS is permitted only where genuinely necessary for a specific implementation that cannot reasonably be handled through the locked system.
v1.0 Completion Update — Technology, Infrastructure & Billing
Status: Added to v1.0 before build starts.
Locked
Billing is MVP and uses Polar.sh.
.vercel.app remains acceptable until revenue supports a custom domain.
MCP remains MVP.
Required technology decisions before Antigravity implementation
Exact Next.js and React versions
Package manager
Authentication mechanism
ORM/data-access approach
Migration convention
Validation library
UI component library
Icon library
Styling system
Forms approach
Client data fetching/state approach
MCP SDK/server deployment
Background jobs/queue
Scheduler/cron
Worker runtime
Logging and error monitoring
Product analytics
Unit/integration/E2E testing stack
CI/CD
Rate limiting
Storage/media handling
Secrets management
Polar billing/webhook implementation
LinkedIn development/production configuration
Telegram development/production configuration
Preview/staging topology
Backup/restore procedure
Rule: Required does not mean the AI may choose. Any item not explicitly decided is DECISION REQUIRED and must be resolved before the affected implementation begins.
Environment safety
Use separate Local → Preview/Staging → Production environments with isolated data and credentials. Development and tests must never accidentally publish to LinkedIn, send real Telegram actions, or perform production billing operations.
Billing MVP requirements
Free + Linker Pro, checkout, subscription state, entitlements, webhooks, upgrade/downgrade, cancellation, billing failure handling, account-scoped state, and idempotent webhook processing. Client-side state is never authoritative for entitlements.
UI consistency
An icon library, component library, styling system, forms approach, and data-fetching/state approach must be selected once and used consistently. The coding AI must not introduce competing libraries without approval.
Build gate: Do not start implementation from this spec until required blocking technology decisions are locked.
Purpose: Exact implementation contract for Linker. This translates the Master Product Bible into engineering constraints so AI coding agents implement decisions instead of inventing them.
1. Source of Truth
Primary authority: LINKER — MASTER PRODUCT BIBLE v1.0.
This Engineering Spec is subordinate to the Master Product Bible. If they conflict, stop implementation and resolve the conflict before coding.
Non-negotiable AI coding rule
AI must implement decisions, not invent decisions.
If an important behavior, security rule, API capability, data contract, permission, UI flow, failure behavior, or architecture decision is unspecified or ambiguous:
Do not guess.
Do not silently choose a reasonable default.
Mark it BLOCKED: DECISION REQUIRED.
Ask for the missing decision.
Resume only after the decision is recorded.
Code quality or convenience never overrides a product decision.
2. Change Control
For every requested change:
Identify affected Master Bible sections.
Identify affected Engineering Spec sections.
Identify affected database/API/UI/security/acceptance contracts.
Record the decision and rationale.
Update current specifications.
Update tests and acceptance criteria.
Identify migration and compatibility effects.
Only then implement.
3. Product Identity
Product: Linker
Agent: Linker Agent — SEALED
Category: Professional Presence Agent
Primary platform: LinkedIn
Agent interface: Telegram
Interoperability: MCP
Core promise: Turn your work into professional momentum.
Core idea: You do the work. Linker makes sure your professional world knows about it.
Linker is not a generic AI content generator, scheduler, chatbot, or LinkedIn automation wrapper.
4. System Boundary
Dashboard / Telegram / MCP → Linker API/Core → Professional Brain + Agent + Execution → LinkedIn
Dashboard: inspection and management.
Telegram: conversation and action.
MCP: external AI interface.
Linker Core: authentication, authorization, policies, state, workflows, memory, scheduling, execution control, audit.
Professional Brain: persistent professional context owned by Linker.
Models: reasoning, interpretation, research synthesis, writing, critique, classification, extraction.
LinkedIn Adapter: all LinkedIn-specific API behavior.
Workers: persistent background execution.
Database: durable application state.
Secret storage: OAuth/API/bot/provider secrets.
Frontend must never call AI providers directly.
5. Engineering Principles
Server-side authority controls consequential actions.
AI proposes/reasons; Linker controls permissions and execution.
Every tenant-scoped query must be account-scoped.
Every external integration is behind an adapter.
Every consequential action is auditable.
Every external event is untrusted input.
Every background job must be restart-safe and idempotent.
Never report an action as successful without verified execution confirmation.
Never expose secrets to models, clients, logs, Telegram, MCP, or ordinary database fields.
Built code is not ship-ready until acceptance evidence passes.
6. Technology Constraints
Preferred stack: Next.js, TypeScript, PostgreSQL/Supabase, LinkedIn OAuth/API, Telegram Bot API, MCP server, model router/provider abstraction, persistent background jobs, Vercel, Supabase, worker platform.
Do not introduce Kubernetes, microservice sprawl, multi-agent architecture, or unnecessary infrastructure without an explicit architecture decision.
Use existing project conventions when compatible. Do not rewrite working systems merely for stylistic preference.
7. Authentication and Accounts
Root tenant entity: accounts.
Connections initially: LinkedIn and Telegram.
Internal Linker identity is independent of provider identity.
OAuth credentials are encrypted secret references. AI components receive capabilities/results, never raw credentials.
Account authorization must occur before any account-owned resource is read or modified.
Cross-account access is a release-blocking defect.
8. First-Time User Flow
Exact flow: Landing → Continue with LinkedIn → LinkedIn authorization → Dashboard → Activate Agent → Connect Telegram → Agent starts
No email/password initially.
Telegram is mandatory for active agent operation.
After Telegram connection: activate immediately, no second onboarding, progressively build context, allow natural commands.
Optional setup may show current understanding and optional goals but must not create an unapproved blocking step.
9. Professional Brain Contract
Professional Brain is structured persistent data, not one giant prompt.
Components: Identity, Expertise Graph, Experience Memory, Voice Model, Goals, Audience Model, Content Memory, Preference Memory, Relationship Memory, Strategy Memory, Learned Patterns.
Memory metadata must preserve source, confidence, timestamp, status, and provenance.
Information classes: FACT, USER PREFERENCE, INFERENCE, GOAL, MEMORY, UNCERTAINTY.
Never convert inference into fact without evidence or validation.
Memory lifecycle: detected → candidate → validated → active → updated → superseded → archived.
User feedback is a learning signal for Linker's Professional Brain and strategy, not model training.
10. Agent Contract
Main loop: OBSERVE → UNDERSTAND → IDENTIFY OPPORTUNITIES → PROPOSE → CREATE → ASK/APPROVE → PUBLISH → MONITOR → ANALYZE → LEARN → REPEAT
State machine: IDLE → OBSERVING → ANALYZING → OPPORTUNITY_FOUND → PLANNING → WAITING_FOR_APPROVAL → EXECUTING → MONITORING → LEARNING → IDLE
Failure states: RETRYABLE_FAILURE, PERMANENT_FAILURE, USER_ACTION_REQUIRED.
UX modes: Manual, Assisted, Scheduled, Autonomous. Default: Assisted.
Never autonomously publish outside enabled rules, send private messages without explicit permission, follow/unfollow, send connections, make sensitive personal claims, create controversial/political content, make unverified claims, expose private information, make major positioning changes, or change autonomy settings.
Permission hierarchy: platform/safety constraints → explicit prohibition → explicit permission → autonomy mode → strategy → agent judgment.
11. Opportunity Engine
Purpose: Find things worth doing, not notify everything.
Inputs: user activity, LinkedIn activity, external world, own history, Professional Brain, performance, research, scheduled scans, MCP requests.
Types: content, engagement, relationship, trend, reputation, timing.
Evaluation: relevance, goal alignment, authenticity, audience value, timing, evidence, potential impact, with penalties for repetition, genericity, uncertainty, and noise.
Most signals should be discarded before becoming opportunities.
Lifecycle: Detected → Evaluated → Presented → Accepted/Rejected/Ignored → Acted → Measured → Learned → Archived.
12. Content Intelligence
Pipeline: Opportunity → Angle → Thesis → Evidence → Structure → Draft → Critique → User Feedback → Final → Schedule → Publish → Performance → Learn
Rules: thesis before drafting; weak thesis means do not write; ground content in real user evidence; never invent experiences; claims require evidence; distinguish fact, observation, opinion, and claim; check originality; preserve technical depth.
Anti-AI checks: generic intros, empty motivation, fake personal stories, corporate clichés, repetitive phrasing, unsupported claims, engagement bait, overexplaining, forced controversy, disconnected content, unnatural vocabulary, manufactured certainty.
Core rule: Never manufacture a post merely because the calendar says it is time.
13. Research
Pipeline: Trigger → Define Question → Search → Collect → Filter → Cross-check → Extract Facts → Connect to User → Insight → Opportunity
Source priority: 1) primary sources, 2) established high-quality reporting, 3) community signals for discovery/conversation, not automatic factual verification.
Externally sourced claims retain source/date/reliability context where applicable. Weak evidence is labeled unverified.
14. Telegram
Telegram is a core agent interface. No Telegram = no active agent.
Proactive messages are sent only when the user has something worth knowing or doing.
Priority: P0 critical account/security/platform; P1 important opportunities/comments/events; P2 useful drafts/performance/strategy; P3 digest.
No mandatory daily message.
Telegram handlers route through Linker Core and must not contain separate business logic that bypasses core policies.
15. Dashboard
Navigation: Home, Content, Ideas, Calendar, Analytics, Professional Brain, Agent Activity, Settings.
Telegram = conversation/action. Dashboard = inspection/management. MCP = external AI interface. LinkedIn = data source/execution environment.
16. LinkedIn Adapter
All LinkedIn API interaction passes through a dedicated adapter.
Agent/business logic uses high-level operations such as publish_post, schedule_post, get_profile, get_posts, and get_analytics.
The agent never receives OAuth tokens.
The adapter owns API versions, capabilities, permissions, request/response translation, migration logic, rate limits, and platform errors.
Current LinkedIn permissions/capabilities must be verified against official documentation before implementation claims. Never rely on stale examples.
Publishing: approved content → policy checks → validation → formatting/media preparation → adapter publish → verify result → store LinkedIn post ID → audit.
Never claim publish success without platform confirmation. Duplicate publishing must be prevented with idempotency.
Unavailable capabilities must be reported accurately. Never bypass platform controls.
17. Scheduling and Jobs
Scheduled execution uses persistent jobs.
Required properties: account, job type, entity, scheduled time, status, attempts, max attempts, idempotency key, last error, started/completed timestamps.
Jobs survive worker restart, execute once, retry safely, distinguish failure types, and record results.
No in-memory-only scheduler is acceptable for production publishing.
18. REST API Contract
Base: /api/v1
18.0 Account, Billing, and Data-Lifecycle Endpoints — REQUIRED
Account/data lifecycle: GET /me; GET /me/connections; DELETE /me/connections/:provider; POST /me/export; POST /me/delete (or an explicitly approved equivalent workflow).
Billing: GET /billing; POST /billing/checkout; POST /billing/portal; GET /billing/subscription; webhook endpoint for verified Polar events. Exact request/response schemas remain part of the endpoint implementation contract.
All lifecycle and billing mutations are authenticated/account-scoped, idempotent where appropriate, audited, and never authorized from client-side entitlement state.
Brain: GET /brain; GET /brain/identity; GET /brain/expertise; GET /brain/goals; GET /brain/voice; GET /brain/preferences; GET /brain/experiences; GET /brain/memories
Brain: GET /brain; GET /brain/identity; GET /brain/expertise; GET /brain/goals; GET /brain/voice; GET /brain/preferences; GET /brain/experiences; GET /brain/memories
Projects: GET /projects; POST /projects; GET /projects/:id; PATCH /projects/:id
Opportunities: GET /opportunities; GET /opportunities/:id; POST /opportunities/:id/accept; POST /opportunities/:id/reject
Content: GET /content/ideas; POST /content/ideas; GET /content/drafts; GET /content/drafts/:id; POST /content/drafts; PATCH /content/drafts/:id; POST /content/drafts/:id/approve; POST /content/drafts/:id/discard
Publishing: POST /posts/:id/publish; POST /posts/:id/schedule; POST /posts/:id/cancel
Analytics: GET /analytics/overview; GET /analytics/posts/:id; GET /analytics/history
Agent: GET /agent/status; POST /agent/pause; POST /agent/resume; GET /agent/activity; GET /agent/rules; PATCH /agent/rules
Every endpoint follows: authentication → account authorization → input validation → policy → autonomy → business logic → execution → audit.
Do not invent response schemas when an existing contract is not specified. Define and approve them first.
19. MCP Contract
MCP is MVP.
19.1 MCP Authorization Contract — REQUIRED
The MCP HTTP endpoint is a protected resource; do not treat an authenticated Linker web cookie as sufficient MCP authorization.
External MCP clients authenticate with an MCP-appropriate bearer/OAuth mechanism and receive only the scopes/permissions granted to that client/account.
Validate token issuer, audience/resource, signature, expiry, and required scopes before processing protected requests.
MCP authorization metadata/discovery and protected-resource behavior must follow the current MCP specification and the selected SDK v2 implementation; unauthorized protected requests fail at the HTTP authorization boundary rather than being converted into a tool-level success/error response.
MCP client identity, account scope, and permissions are independently auditable.
Tokens issued for one MCP resource/client context must not be accepted as generic Linker session credentials or LinkedIn credentials.
Tool calls still pass through Linker Core policy/autonomy checks. MCP cannot bypass approval, pause state, account scope, or execution restrictions.
Architecture: External AI → Linker MCP → Linker Core → Professional Brain / Agent / Execution → LinkedIn
Resources: profile://me, profile://expertise, profile://voice, profile://goals, content://history, content://recent, analytics://performance, strategy://current, agent://status, agent://activity.
Read: get_profile, get_expertise, get_goals, get_voice, get_content_history, get_recent_posts, get_post_performance, get_content_ideas, get_current_strategy, get_agent_activity, get_agent_status.
Create: create_idea, create_post_draft, create_comment_draft.
Modify: rewrite_post, update_idea, update_strategy.
Execute: schedule_post, publish_post.
Analyze: analyze_post, analyze_performance, find_opportunities, research_topic.
MCP clients authenticate separately, have account scope and permissions, cannot bypass Linker policy/autonomy, and approval-required actions return approval_required.
20. Database Contract
20.1 Billing Entities — REQUIRED FOR MVP
Billing is MVP and therefore durable billing state must be modeled explicitly rather than inferred from frontend state. Add the minimum entities required to represent:
Polar customer mapping to Linker account.
Subscription mapping, product/price, status, current period, cancellation state, and relevant external IDs.
Entitlements/plan access used by Linker Core authorization.
Processed Polar webhook/event identifiers and processing status for idempotency/replay protection.
Do not store payment-card data; Polar remains the payment processor/system handling payment details.
Server-side Polar/webhook state is authoritative for entitlements.
20.2 Critical Database Constraints — REQUIRED
At schema implementation, define and test critical uniqueness, foreign-key, nullability, status/check, and index constraints. At minimum prevent duplicate provider connections for the same account/provider, duplicate platform identities where provider rules require uniqueness, duplicate scheduled-job idempotency keys within their execution scope, duplicate published-post external IDs within a platform/account scope, duplicate billing webhook/event processing, and orphaned account-owned records. RLS is mandatory in addition to application authorization.
Core entities: accounts, connections, professional_identity, expertise, goals, preferences, voice_signals, projects, experiences, memories, opportunities, content_ideas, content_drafts, content_versions, published_posts, analytics_snapshots, strategies, strategy_versions, agent_rules, agent_activity, telegram_connections, telegram_messages, mcp_clients, mcp_permissions, scheduled_jobs, audit_logs, billing_customers, billing_subscriptions, billing_entitlements, billing_webhook_events.
Every account-owned table enforces tenant isolation.
Analytics are historical snapshots, not destructive overwrites.
OAuth credentials are secret references.
Do not add persistent entities merely because an AI agent or ORM suggests them. Every new entity requires a documented reason and relationship.
21. Security
Architecture: Identity → Permission → Policy → Action → Audit
Required: TLS, encryption at rest for sensitive data, secure key management, account-scoped authorization, database RLS/tenant isolation, minimum necessary AI context, MCP authentication/authorization, secure Telegram linking, audit logs, rate limits, monitoring, backup/restore testing, export/delete controls, access revocation.
Secrets must never appear in GitHub, frontend bundles, logs, prompts, model context, Telegram, MCP responses, or plaintext database fields.
External content is untrusted data. Prompt injection must not alter permissions, autonomy, account scope, rules, system instructions, or execution authority.
Approval tokens must be specific to the intended action/resource, not broad reusable permission.
22. Audit and Observability
Every consequential action records actor, account, action, resource, timestamp, trigger/intent, applicable permission/rule, result, status, external ID where relevant, and error/retry information where applicable.
Internal AI observability tracks task, model capability/provider, context references, output, latency, token usage, cost, confidence, validation, and final action.
Provider/model details are infrastructure data and must not appear in product UX.
23. Error Contract
SUCCESS = verified expected result.
RETRYABLE_FAILURE = temporary failure that can safely retry.
PERMANENT_FAILURE = retry will not resolve without code/configuration/state change.
USER_ACTION_REQUIRED = user must authorize, reconnect, resolve a platform issue, or provide missing information.
Never silently convert errors into success or silently change behavior after failure.
24. AI Coding Agent Rules
Before changing code, the coding agent must read relevant spec sections, inspect existing implementation, identify affected contracts, state ambiguities, avoid unrelated refactors, implement the smallest complete change, add/update tests, run relevant checks, and report what changed and what remains unverified.
It must not invent product features, change brand decisions, change core architecture without approval, weaken security, bypass LinkedIn permissions, expose secrets, add providers to UX, create fake user experiences, claim tests passed without running them, claim external API behavior without verification, remove acceptance tests to make a build pass, silently change API contracts, or silently migrate/delete production data.
25. Definition of Done
A feature is not done because code compiles.
Minimum: implementation complete; relevant tests added; authorization tested; failure states tested; tenant isolation tested where relevant; secrets exposure checked; external integration verified where relevant; audit behavior verified for consequential actions; acceptance criterion has concrete evidence; no unresolved blocking decision.
26. MVP Ship Gate
Release requires evidence for real LinkedIn OAuth; current LinkedIn capabilities/permissions; secure Telegram linking; immediate activation; accurate Professional Brain retrieval; accurate explanation of current understanding; relevant opportunity detection; grounded content; voice-match evaluation; learning from feedback; verified publishing; duplicate prevention; restart-safe scheduling; failure classification; historical analytics; Agent Activity/audit; pause/revoke behavior; MCP authentication/scope/permissions; MCP policy/autonomy enforcement; approval_required; cross-account isolation; RLS testing; secret isolation; prompt-injection resistance; customer-zero end-to-end loop; monitoring; backup/restore; emergency controls.
Evidence rule: every checked item needs a test, trace, log, screenshot, or other concrete evidence.
27. Open Decisions Rule
An unspecified implementation detail is not an invitation to guess.
Examples requiring an explicit decision when not already defined: exact API request/response schemas; exact database constraints; exact LinkedIn permissions; worker configuration; AI model/provider selection; billing behavior; UI copy; notification timing; retry counts; rate limits; analytics fields unavailable from the platform; media support; deletion/retention periods.
Material unknowns must be surfaced as decisions before implementation.
28. Implementation Order
Foundation: database, account, authentication/session/cookies, secrets, authorization, RLS, CSRF/security baseline.
LinkedIn Adapter and verified OAuth/API capabilities, including state validation and token lifecycle.
Professional Brain persistence/retrieval.
Core agent loop and context engine.
Opportunity Engine.
Content Intelligence.
Publishing/scheduling/idempotency.
Analytics foundation.
Telegram Agent.
Dashboard.
MCP server and its authentication/authorization contract.
Billing: Polar checkout, verified webhooks, subscription state, entitlements, cancellation, payment-state handling, and idempotent event processing.
Hardening, evaluation, observability, privacy/data lifecycle, and security tests.
MVP Ship Gate evidence collection.
29. Developer Handoff Format
Every major implementation task must state:
Task — what is being built.
Why — relevant product decision.
Scope — files/modules/contracts allowed to change.
Inputs — exact inputs.
Outputs — exact expected outputs.
State — database/state changes.
Permissions — required authorization.
AI behavior — what the model may decide.
Application behavior — what Linker Core controls.
Failure behavior — expected failure states.
Security — required protections.
Tests — required acceptance tests.
Non-goals — what must not change.
Unknowns — anything requiring a decision.
30. Source-of-Truth Hierarchy
When sources disagree:
Explicit current user decision
Master Product Bible
Engineering Spec
Approved feature/implementation specification
Existing code behavior
Framework/library defaults
AI coding-agent assumptions
Lower-level defaults never override higher-level decisions.
If a higher-level source is ambiguous, stop and request clarification.
31. Version and Status
Document: LINKER — ENGINEERING SPEC v1.0
v1.0 Audit Status — 2026-10-02
Deep audit completed against the current Engineering Spec and current official documentation for Supabase SSR/Auth, LinkedIn OAuth/API access, Polar subscriptions/webhooks, and MCP authorization. Security/session/OAuth/API/billing/MCP gaps identified by the audit have been incorporated into v1.0 without creating v1.1.
Remaining explicit decisions before multi-user production launch: product analytics approach; exact data-retention/deletion periods and backup retention policy; final production HTTPS hostname/domain; exact LinkedIn permissions/capabilities approved for the application; exact REST/MCP request/response schemas and rate-limit values; and any provider-specific limits discovered during acceptance testing.
Status: Engineering contract for implementation
Depends on: LINKER — MASTER PRODUCT BIBLE v1.0
Agent: Linker Agent — sealed
MVP: Build not started; ship validation pending implementation
