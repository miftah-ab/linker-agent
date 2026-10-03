-- =============================================================================
-- LINKER — Initial Schema Migration
-- Migration: 0001_initial_schema.sql
-- Spec: LINKER — ENGINEERING SPEC v1.0 §20 (Database Contract)
-- =============================================================================
-- Rules:
--   • RLS is mandatory on every account-owned table (§20.2)
--   • No ORM — raw SQL only (§2 Technology Constraints)
--   • Snapshots are additive, never destructive overwrites (§20.2)
--   • OAuth credentials are secret references, not plaintext (§20.2)
--   • Every status column uses a CHECK constraint
--   • Every FK has explicit ON DELETE behavior
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_cron";   -- scheduled jobs (§6 Background Jobs)
CREATE EXTENSION IF NOT EXISTS "pg_net";    -- HTTP from DB (§6 Background Jobs)

-- ---------------------------------------------------------------------------
-- Helper: updated_at trigger function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 1. ACCOUNTS
-- Root tenant entity (§7 Authentication and Accounts)
-- =============================================================================
CREATE TABLE accounts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status      TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
-- accounts rows are accessed via auth.uid() join — no direct RLS SELECT needed
-- Service role bypasses RLS for admin operations

-- =============================================================================
-- 2. CONNECTIONS
-- OAuth provider connections (§7, §36 LinkedIn token lifecycle)
-- =============================================================================
CREATE TABLE connections (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id           UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  provider             TEXT NOT NULL
                         CHECK (provider IN ('linkedin', 'telegram')),
  provider_account_id  TEXT,
  -- encrypted_token_ref: Supabase Vault secret name/ID, NOT a raw token (§39)
  encrypted_token_ref  TEXT,
  status               TEXT NOT NULL DEFAULT 'disconnected'
                         CHECK (status IN (
                           'connected',
                           'authorization_required',
                           'expired',
                           'revoked',
                           'permission_changed',
                           'temporarily_unavailable',
                           'disconnected'
                         )),
  scopes               TEXT[],
  expires_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- §20.2: prevent duplicate provider connections for the same account/provider
  CONSTRAINT connections_account_provider_unique UNIQUE (account_id, provider)
);

CREATE INDEX connections_account_id_idx ON connections(account_id);
CREATE INDEX connections_status_idx ON connections(status);

CREATE TRIGGER connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY connections_account_isolation ON connections
  USING (account_id = (SELECT id FROM accounts WHERE id = auth.uid()::uuid));

-- =============================================================================
-- 3. PROFESSIONAL BRAIN
-- §9 Professional Brain Contract — structured persistent data, NOT one prompt
-- =============================================================================

-- 3a. Professional Identity
CREATE TABLE professional_identity (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  headline    TEXT,
  summary     TEXT,
  location    TEXT,
  industry    TEXT,
  raw_data    JSONB,
  -- Memory metadata (§9): source, confidence, timestamp, status, provenance
  source      TEXT NOT NULL DEFAULT 'linkedin_import',
  confidence  NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (confidence BETWEEN 0 AND 1),
  status      TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('detected','candidate','validated','active',
                                  'updated','superseded','archived')),
  info_class  TEXT NOT NULL DEFAULT 'FACT'
                CHECK (info_class IN ('FACT','USER_PREFERENCE','INFERENCE',
                                      'GOAL','MEMORY','UNCERTAINTY')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT professional_identity_account_unique UNIQUE (account_id)
);

CREATE TRIGGER professional_identity_updated_at
  BEFORE UPDATE ON professional_identity
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE professional_identity ENABLE ROW LEVEL SECURITY;
CREATE POLICY professional_identity_account_isolation ON professional_identity
  USING (account_id = auth.uid()::uuid);

-- 3b. Expertise Graph
CREATE TABLE expertise (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  skill       TEXT NOT NULL,
  level       TEXT CHECK (level IN ('beginner','intermediate','advanced','expert')),
  evidence    JSONB,
  source      TEXT NOT NULL DEFAULT 'inferred',
  confidence  NUMERIC(3,2) NOT NULL DEFAULT 0.5 CHECK (confidence BETWEEN 0 AND 1),
  status      TEXT NOT NULL DEFAULT 'candidate'
                CHECK (status IN ('detected','candidate','validated','active',
                                  'updated','superseded','archived')),
  info_class  TEXT NOT NULL DEFAULT 'INFERENCE'
                CHECK (info_class IN ('FACT','USER_PREFERENCE','INFERENCE',
                                      'GOAL','MEMORY','UNCERTAINTY')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX expertise_account_id_idx ON expertise(account_id);
CREATE INDEX expertise_status_idx ON expertise(account_id, status);

CREATE TRIGGER expertise_updated_at
  BEFORE UPDATE ON expertise
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE expertise ENABLE ROW LEVEL SECURITY;
CREATE POLICY expertise_account_isolation ON expertise
  USING (account_id = auth.uid()::uuid);

-- 3c. Goals
CREATE TABLE goals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  goal_type   TEXT NOT NULL,
  description TEXT NOT NULL,
  priority    INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  source      TEXT NOT NULL DEFAULT 'user_stated',
  confidence  NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (confidence BETWEEN 0 AND 1),
  status      TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('detected','candidate','validated','active',
                                  'updated','superseded','archived')),
  info_class  TEXT NOT NULL DEFAULT 'GOAL'
                CHECK (info_class IN ('FACT','USER_PREFERENCE','INFERENCE',
                                      'GOAL','MEMORY','UNCERTAINTY')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX goals_account_id_idx ON goals(account_id);

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY goals_account_isolation ON goals
  USING (account_id = auth.uid()::uuid);

-- 3d. Preferences
CREATE TABLE preferences (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id     UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category       TEXT NOT NULL,
  preference_key TEXT NOT NULL,
  value          JSONB NOT NULL,
  source         TEXT NOT NULL DEFAULT 'user_stated',
  confidence     NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (confidence BETWEEN 0 AND 1),
  status         TEXT NOT NULL DEFAULT 'active'
                   CHECK (status IN ('detected','candidate','validated','active',
                                     'updated','superseded','archived')),
  info_class     TEXT NOT NULL DEFAULT 'USER_PREFERENCE'
                   CHECK (info_class IN ('FACT','USER_PREFERENCE','INFERENCE',
                                         'GOAL','MEMORY','UNCERTAINTY')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT preferences_account_key_unique UNIQUE (account_id, category, preference_key)
);

CREATE INDEX preferences_account_id_idx ON preferences(account_id);

CREATE TRIGGER preferences_updated_at
  BEFORE UPDATE ON preferences
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY preferences_account_isolation ON preferences
  USING (account_id = auth.uid()::uuid);

-- 3e. Voice Signals (§9 Voice Model)
CREATE TABLE voice_signals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  value       TEXT NOT NULL,
  evidence    JSONB,
  source      TEXT NOT NULL DEFAULT 'inferred',
  confidence  NUMERIC(3,2) NOT NULL DEFAULT 0.5 CHECK (confidence BETWEEN 0 AND 1),
  status      TEXT NOT NULL DEFAULT 'candidate'
                CHECK (status IN ('detected','candidate','validated','active',
                                  'updated','superseded','archived')),
  info_class  TEXT NOT NULL DEFAULT 'INFERENCE'
                CHECK (info_class IN ('FACT','USER_PREFERENCE','INFERENCE',
                                      'GOAL','MEMORY','UNCERTAINTY')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX voice_signals_account_id_idx ON voice_signals(account_id);

CREATE TRIGGER voice_signals_updated_at
  BEFORE UPDATE ON voice_signals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE voice_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY voice_signals_account_isolation ON voice_signals
  USING (account_id = auth.uid()::uuid);

-- 3f. Projects
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  role        TEXT,
  start_date  DATE,
  end_date    DATE,
  outcomes    JSONB,
  source      TEXT NOT NULL DEFAULT 'user_stated',
  confidence  NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (confidence BETWEEN 0 AND 1),
  status      TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('detected','candidate','validated','active',
                                  'updated','superseded','archived')),
  info_class  TEXT NOT NULL DEFAULT 'FACT'
                CHECK (info_class IN ('FACT','USER_PREFERENCE','INFERENCE',
                                      'GOAL','MEMORY','UNCERTAINTY')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX projects_account_id_idx ON projects(account_id);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY projects_account_isolation ON projects
  USING (account_id = auth.uid()::uuid);

-- 3g. Experiences
CREATE TABLE experiences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  company         TEXT,
  title           TEXT,
  description     TEXT,
  start_date      DATE,
  end_date        DATE,
  is_current      BOOLEAN NOT NULL DEFAULT FALSE,
  skills_used     TEXT[],
  achievements    JSONB,
  source          TEXT NOT NULL DEFAULT 'linkedin_import',
  confidence      NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (confidence BETWEEN 0 AND 1),
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('detected','candidate','validated','active',
                                      'updated','superseded','archived')),
  info_class      TEXT NOT NULL DEFAULT 'FACT'
                    CHECK (info_class IN ('FACT','USER_PREFERENCE','INFERENCE',
                                          'GOAL','MEMORY','UNCERTAINTY')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX experiences_account_id_idx ON experiences(account_id);

CREATE TRIGGER experiences_updated_at
  BEFORE UPDATE ON experiences
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY experiences_account_isolation ON experiences
  USING (account_id = auth.uid()::uuid);

-- 3h. Memories (§9 Experience Memory, Content Memory, Relationship Memory, Learned Patterns)
CREATE TABLE memories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id   UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  memory_type  TEXT NOT NULL
                 CHECK (memory_type IN ('experience','content','relationship',
                                        'pattern','audience','strategy')),
  content      JSONB NOT NULL,
  source       TEXT NOT NULL,
  confidence   NUMERIC(3,2) NOT NULL DEFAULT 0.5 CHECK (confidence BETWEEN 0 AND 1),
  provenance   JSONB,
  -- §9 lifecycle: detected → candidate → validated → active → updated → superseded → archived
  status       TEXT NOT NULL DEFAULT 'candidate'
                 CHECK (status IN ('detected','candidate','validated','active',
                                   'updated','superseded','archived')),
  info_class   TEXT NOT NULL DEFAULT 'INFERENCE'
                 CHECK (info_class IN ('FACT','USER_PREFERENCE','INFERENCE',
                                       'GOAL','MEMORY','UNCERTAINTY')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX memories_account_id_idx ON memories(account_id);
CREATE INDEX memories_type_status_idx ON memories(account_id, memory_type, status);

CREATE TRIGGER memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY memories_account_isolation ON memories
  USING (account_id = auth.uid()::uuid);

-- =============================================================================
-- 4. STRATEGIES
-- §9 Strategy Memory
-- =============================================================================
CREATE TABLE strategies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  is_current  BOOLEAN NOT NULL DEFAULT TRUE,
  summary     TEXT,
  goals       JSONB,
  tactics     JSONB,
  constraints JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX strategies_account_id_idx ON strategies(account_id);
CREATE INDEX strategies_current_idx ON strategies(account_id, is_current);

CREATE TRIGGER strategies_updated_at
  BEFORE UPDATE ON strategies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY strategies_account_isolation ON strategies
  USING (account_id = auth.uid()::uuid);

CREATE TABLE strategy_versions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  version     INTEGER NOT NULL,
  snapshot    JSONB NOT NULL,
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX strategy_versions_strategy_id_idx ON strategy_versions(strategy_id);

ALTER TABLE strategy_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY strategy_versions_account_isolation ON strategy_versions
  USING (account_id = auth.uid()::uuid);

-- =============================================================================
-- 5. OPPORTUNITIES
-- §11 Opportunity Engine lifecycle
-- =============================================================================
CREATE TABLE opportunities (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id       UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  opportunity_type TEXT NOT NULL
                     CHECK (opportunity_type IN ('content','engagement','relationship',
                                                  'trend','reputation','timing')),
  title            TEXT,
  description      TEXT,
  relevance_score  NUMERIC(4,3) CHECK (relevance_score BETWEEN 0 AND 1),
  evidence         JSONB,
  -- §11 lifecycle
  status           TEXT NOT NULL DEFAULT 'detected'
                     CHECK (status IN ('detected','evaluated','presented','accepted',
                                       'rejected','ignored','acted','measured',
                                       'learned','archived')),
  detected_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  evaluated_at     TIMESTAMPTZ,
  presented_at     TIMESTAMPTZ,
  acted_at         TIMESTAMPTZ,
  archived_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX opportunities_account_id_idx ON opportunities(account_id);
CREATE INDEX opportunities_status_idx ON opportunities(account_id, status);

CREATE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY opportunities_account_isolation ON opportunities
  USING (account_id = auth.uid()::uuid);

-- =============================================================================
-- 6. CONTENT
-- §12 Content Intelligence pipeline
-- =============================================================================

-- Content Ideas
CREATE TABLE content_ideas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  opportunity_id  UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  title           TEXT,
  angle           TEXT,
  thesis          TEXT,
  evidence        JSONB,
  status          TEXT NOT NULL DEFAULT 'idea'
                    CHECK (status IN ('idea','thesis_approved','drafting',
                                      'drafted','rejected','archived')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX content_ideas_account_id_idx ON content_ideas(account_id);

CREATE TRIGGER content_ideas_updated_at
  BEFORE UPDATE ON content_ideas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY content_ideas_account_isolation ON content_ideas
  USING (account_id = auth.uid()::uuid);

-- Content Drafts
CREATE TABLE content_drafts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  idea_id         UUID REFERENCES content_ideas(id) ON DELETE SET NULL,
  title           TEXT,
  body            TEXT NOT NULL,
  -- §12 pipeline stage
  stage           TEXT NOT NULL DEFAULT 'draft'
                    CHECK (stage IN ('draft','critique','user_feedback',
                                     'final','scheduled','published','discarded')),
  anti_ai_flags   JSONB,   -- output of anti-AI checks (§12)
  voice_score     NUMERIC(3,2) CHECK (voice_score BETWEEN 0 AND 1),
  critique        JSONB,
  user_feedback   TEXT,
  approved_at     TIMESTAMPTZ,
  approved_by     UUID,    -- account_id of approver
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX content_drafts_account_id_idx ON content_drafts(account_id);
CREATE INDEX content_drafts_stage_idx ON content_drafts(account_id, stage);

CREATE TRIGGER content_drafts_updated_at
  BEFORE UPDATE ON content_drafts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY content_drafts_account_isolation ON content_drafts
  USING (account_id = auth.uid()::uuid);

-- Content Versions (immutable version history)
CREATE TABLE content_versions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  draft_id    UUID NOT NULL REFERENCES content_drafts(id) ON DELETE CASCADE,
  version     INTEGER NOT NULL,
  body        TEXT NOT NULL,
  stage       TEXT NOT NULL,
  changed_by  TEXT,
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT content_versions_draft_version_unique UNIQUE (draft_id, version)
);

CREATE INDEX content_versions_draft_id_idx ON content_versions(draft_id);

ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY content_versions_account_isolation ON content_versions
  USING (account_id = auth.uid()::uuid);

-- =============================================================================
-- 7. PUBLISHED POSTS
-- §16 LinkedIn Adapter — publishing with idempotency (§20.2)
-- =============================================================================
CREATE TABLE published_posts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id       UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  draft_id         UUID REFERENCES content_drafts(id) ON DELETE SET NULL,
  platform         TEXT NOT NULL DEFAULT 'linkedin'
                     CHECK (platform IN ('linkedin')),
  -- §20.2: prevent duplicate published-post external IDs within platform/account scope
  platform_post_id TEXT,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','published','failed','cancelled')),
  idempotency_key  TEXT NOT NULL,
  body_snapshot    TEXT,          -- snapshot of content at publish time
  published_at     TIMESTAMPTZ,
  failure_reason   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- §20.2: prevent duplicate external IDs within platform/account
  CONSTRAINT published_posts_platform_post_unique
    UNIQUE (account_id, platform, platform_post_id),
  -- §45: idempotency key uniqueness
  CONSTRAINT published_posts_idempotency_unique
    UNIQUE (account_id, idempotency_key)
);

CREATE INDEX published_posts_account_id_idx ON published_posts(account_id);
CREATE INDEX published_posts_status_idx ON published_posts(account_id, status);

CREATE TRIGGER published_posts_updated_at
  BEFORE UPDATE ON published_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE published_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY published_posts_account_isolation ON published_posts
  USING (account_id = auth.uid()::uuid);

-- =============================================================================
-- 8. ANALYTICS SNAPSHOTS
-- §20.2: historical snapshots, NOT destructive overwrites
-- =============================================================================
CREATE TABLE analytics_snapshots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  post_id     UUID REFERENCES published_posts(id) ON DELETE CASCADE,
  platform    TEXT NOT NULL DEFAULT 'linkedin',
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data        JSONB NOT NULL,    -- platform-specific metrics
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Snapshots are additive; prevent exact duplicates for same post+time
  CONSTRAINT analytics_snapshot_unique UNIQUE (post_id, snapshot_at)
);

CREATE INDEX analytics_snapshots_account_id_idx ON analytics_snapshots(account_id);
CREATE INDEX analytics_snapshots_post_id_idx ON analytics_snapshots(post_id);
CREATE INDEX analytics_snapshots_at_idx ON analytics_snapshots(account_id, snapshot_at DESC);

ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_snapshots_account_isolation ON analytics_snapshots
  USING (account_id = auth.uid()::uuid);

-- =============================================================================
-- 9. SCHEDULED JOBS
-- §17 Scheduling — persistent, restart-safe, idempotent (§20.2)
-- =============================================================================
CREATE TABLE scheduled_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  job_type        TEXT NOT NULL
                    CHECK (job_type IN (
                      'publish_post',
                      'collect_analytics',
                      'opportunity_scan',
                      'brain_update',
                      'telegram_notify'
                    )),
  entity_id       UUID,           -- related entity (e.g. draft_id for publish_post)
  entity_type     TEXT,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','running','completed',
                                      'retryable_failure','permanent_failure',
                                      'cancelled')),
  attempts        INTEGER NOT NULL DEFAULT 0,
  max_attempts    INTEGER NOT NULL DEFAULT 3,
  -- §20.2: idempotency key uniqueness within execution scope
  idempotency_key TEXT NOT NULL,
  last_error      TEXT,
  payload         JSONB,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT scheduled_jobs_idempotency_unique UNIQUE (idempotency_key)
);

CREATE INDEX scheduled_jobs_account_id_idx ON scheduled_jobs(account_id);
CREATE INDEX scheduled_jobs_status_idx ON scheduled_jobs(status, scheduled_at);
CREATE INDEX scheduled_jobs_scheduled_at_idx ON scheduled_jobs(scheduled_at)
  WHERE status = 'pending';

CREATE TRIGGER scheduled_jobs_updated_at
  BEFORE UPDATE ON scheduled_jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY scheduled_jobs_account_isolation ON scheduled_jobs
  USING (account_id = auth.uid()::uuid);

-- =============================================================================
-- 10. AGENT RULES
-- §10 Agent Contract — autonomy mode, permission hierarchy
-- =============================================================================
CREATE TABLE agent_rules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  rule_type   TEXT NOT NULL,
  value       JSONB NOT NULL,
  enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT agent_rules_account_type_unique UNIQUE (account_id, rule_type)
);

CREATE INDEX agent_rules_account_id_idx ON agent_rules(account_id);

CREATE TRIGGER agent_rules_updated_at
  BEFORE UPDATE ON agent_rules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE agent_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY agent_rules_account_isolation ON agent_rules
  USING (account_id = auth.uid()::uuid);

-- =============================================================================
-- 11. AGENT ACTIVITY (Audit Log for Agent Actions)
-- §22 Audit and Observability — every consequential action recorded
-- =============================================================================
CREATE TABLE agent_activity (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  actor           TEXT NOT NULL,              -- 'agent' | 'user' | 'mcp_client' | 'system'
  action          TEXT NOT NULL,
  resource_type   TEXT,
  resource_id     UUID,
  trigger_source  TEXT,                       -- what initiated this action
  permission_rule TEXT,                       -- which rule/autonomy mode permitted this
  result          JSONB,
  status          TEXT NOT NULL DEFAULT 'success'
                    CHECK (status IN ('success','retryable_failure',
                                      'permanent_failure','user_action_required')),
  external_id     TEXT,                       -- e.g. LinkedIn post ID
  error_message   TEXT,
  retry_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- Immutable: no updated_at, no DELETE
);

CREATE INDEX agent_activity_account_id_idx ON agent_activity(account_id);
CREATE INDEX agent_activity_created_at_idx ON agent_activity(account_id, created_at DESC);
CREATE INDEX agent_activity_action_idx ON agent_activity(account_id, action);

ALTER TABLE agent_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY agent_activity_account_isolation ON agent_activity
  USING (account_id = auth.uid()::uuid);

-- =============================================================================
-- 12. TELEGRAM CONNECTIONS
-- §14 Telegram — secure linking (§9 first-time user flow)
-- =============================================================================
CREATE TABLE telegram_connections (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id             UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  telegram_user_id       TEXT,
  link_token             TEXT,                -- one-time linking token
  link_token_expires_at  TIMESTAMPTZ,
  status                 TEXT NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','linked','unlinked','blocked')),
  linked_at              TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One Linker account → one Telegram user (§20.2)
  CONSTRAINT telegram_connections_account_unique UNIQUE (account_id),
  -- One Telegram user → one Linker account
  CONSTRAINT telegram_connections_telegram_user_unique UNIQUE (telegram_user_id)
);

CREATE INDEX telegram_connections_link_token_idx ON telegram_connections(link_token)
  WHERE link_token IS NOT NULL;

CREATE TRIGGER telegram_connections_updated_at
  BEFORE UPDATE ON telegram_connections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE telegram_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY telegram_connections_account_isolation ON telegram_connections
  USING (account_id = auth.uid()::uuid);

-- Telegram Messages (store references, not full message content for PII reasons)
CREATE TABLE telegram_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  direction       TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  telegram_msg_id TEXT,                       -- platform message ID for dedup
  content_ref     TEXT,                       -- reference only, not raw content
  priority        TEXT CHECK (priority IN ('p0','p1','p2','p3')),
  processed       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT telegram_messages_msg_id_unique UNIQUE (account_id, telegram_msg_id)
);

CREATE INDEX telegram_messages_account_id_idx ON telegram_messages(account_id);
CREATE INDEX telegram_messages_processed_idx ON telegram_messages(account_id, processed);

ALTER TABLE telegram_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY telegram_messages_account_isolation ON telegram_messages
  USING (account_id = auth.uid()::uuid);

-- =============================================================================
-- 13. MCP CLIENTS + PERMISSIONS
-- §19 MCP Contract — independent auth/authorization
-- =============================================================================
CREATE TABLE mcp_clients (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id   UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  client_name  TEXT NOT NULL,
  -- client_id is the MCP client identifier used in token validation
  client_id    TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at   TIMESTAMPTZ,
  CONSTRAINT mcp_clients_client_id_unique UNIQUE (client_id)
);

CREATE INDEX mcp_clients_account_id_idx ON mcp_clients(account_id);

ALTER TABLE mcp_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY mcp_clients_account_isolation ON mcp_clients
  USING (account_id = auth.uid()::uuid);

CREATE TABLE mcp_permissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  mcp_client_id UUID NOT NULL REFERENCES mcp_clients(id) ON DELETE CASCADE,
  scope         TEXT NOT NULL,
  granted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at    TIMESTAMPTZ,
  CONSTRAINT mcp_permissions_client_scope_unique UNIQUE (mcp_client_id, scope)
);

CREATE INDEX mcp_permissions_client_id_idx ON mcp_permissions(mcp_client_id);

ALTER TABLE mcp_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY mcp_permissions_account_isolation ON mcp_permissions
  USING (account_id = auth.uid()::uuid);

-- =============================================================================
-- 14. BILLING
-- §20.1 Billing Entities — required for MVP (§12 Billing)
-- =============================================================================

-- Polar customer → Linker account mapping
CREATE TABLE billing_customers (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id         UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  polar_customer_id  TEXT NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT billing_customers_account_unique UNIQUE (account_id),
  CONSTRAINT billing_customers_polar_id_unique UNIQUE (polar_customer_id)
);

ALTER TABLE billing_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY billing_customers_account_isolation ON billing_customers
  USING (account_id = auth.uid()::uuid);

-- Subscription state (§20.1)
CREATE TABLE billing_subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id             UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  polar_subscription_id  TEXT NOT NULL,
  product_id             TEXT NOT NULL,
  price_id               TEXT,
  status                 TEXT NOT NULL
                           CHECK (status IN ('active','trialing','past_due',
                                             'cancelled','unpaid','incomplete')),
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  cancel_at_period_end   BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled_at           TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT billing_subscriptions_polar_id_unique UNIQUE (polar_subscription_id)
);

CREATE INDEX billing_subscriptions_account_id_idx ON billing_subscriptions(account_id);

CREATE TRIGGER billing_subscriptions_updated_at
  BEFORE UPDATE ON billing_subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE billing_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY billing_subscriptions_account_isolation ON billing_subscriptions
  USING (account_id = auth.uid()::uuid);

-- Entitlements (§20.1) — authoritative for feature access
CREATE TABLE billing_entitlements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  plan        TEXT NOT NULL CHECK (plan IN ('free','pro')),
  feature     TEXT NOT NULL,
  enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT billing_entitlements_account_feature_unique UNIQUE (account_id, feature)
);

CREATE INDEX billing_entitlements_account_id_idx ON billing_entitlements(account_id);

ALTER TABLE billing_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY billing_entitlements_account_isolation ON billing_entitlements
  USING (account_id = auth.uid()::uuid);

-- Webhook events — idempotency/replay protection (§20.1)
CREATE TABLE billing_webhook_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- §20.2: prevent duplicate billing webhook/event processing
  polar_event_id  TEXT NOT NULL,
  event_type      TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','processed','failed','skipped')),
  payload         JSONB NOT NULL,
  processed_at    TIMESTAMPTZ,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT billing_webhook_events_polar_id_unique UNIQUE (polar_event_id)
);

CREATE INDEX billing_webhook_events_status_idx ON billing_webhook_events(status);
-- No RLS on webhook events — service-role only (not account-scoped)

-- =============================================================================
-- 15. AUDIT LOGS
-- §22 Audit and Observability — global audit for all consequential actions
-- =============================================================================
CREATE TABLE audit_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id     UUID REFERENCES accounts(id) ON DELETE SET NULL,  -- nullable for system events
  actor_type     TEXT NOT NULL
                   CHECK (actor_type IN ('user','agent','mcp_client','system','webhook')),
  actor_id       TEXT,
  action         TEXT NOT NULL,
  resource_type  TEXT,
  resource_id    TEXT,
  result         TEXT NOT NULL CHECK (result IN ('success','failure','partial')),
  status         TEXT NOT NULL
                   CHECK (status IN ('success','retryable_failure',
                                     'permanent_failure','user_action_required')),
  metadata       JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- Immutable: no updated_at, no DELETE
);

CREATE INDEX audit_logs_account_id_idx ON audit_logs(account_id);
CREATE INDEX audit_logs_created_at_idx ON audit_logs(created_at DESC);
CREATE INDEX audit_logs_action_idx ON audit_logs(action);
CREATE INDEX audit_logs_actor_idx ON audit_logs(actor_type, actor_id);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_account_isolation ON audit_logs
  USING (account_id = auth.uid()::uuid OR account_id IS NULL);

-- =============================================================================
-- 16. OAUTH STATE (CSRF protection for OAuth flows)
-- §26 OAuth state: unique, single-use, expiring, session-bound (§33)
-- =============================================================================
CREATE TABLE oauth_states (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID REFERENCES accounts(id) ON DELETE CASCADE,
  state       TEXT NOT NULL,
  provider    TEXT NOT NULL CHECK (provider IN ('linkedin')),
  used        BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT oauth_states_state_unique UNIQUE (state)
);

CREATE INDEX oauth_states_state_idx ON oauth_states(state);
CREATE INDEX oauth_states_expires_idx ON oauth_states(expires_at);

-- Cleanup expired states (run via pg_cron)
-- ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY; -- Service role only, no user RLS

-- =============================================================================
-- END OF MIGRATION 0001
-- =============================================================================
