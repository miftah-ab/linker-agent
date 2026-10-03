/**
 * Database Types — Linker
 *
 * Spec: §20 Database Contract
 * Mirrors the exact SQL schema in supabase/migrations/0001_initial_schema.sql.
 * Strictly typed, no guessing, no extra or missing columns.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AccountStatus = "active" | "suspended" | "deleted";

export type ConnectionProvider = "linkedin" | "telegram";

export type ConnectionStatus =
  | "connected"
  | "authorization_required"
  | "expired"
  | "revoked"
  | "permission_changed"
  | "temporarily_unavailable"
  | "disconnected";

export type InformationClass =
  | "FACT"
  | "USER_PREFERENCE"
  | "INFERENCE"
  | "GOAL"
  | "MEMORY"
  | "UNCERTAINTY";

export type MemoryLifecycleStatus =
  | "detected"
  | "candidate"
  | "validated"
  | "active"
  | "updated"
  | "superseded"
  | "archived";

export type ExpertiseLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type MemoryType =
  | "experience"
  | "content"
  | "relationship"
  | "pattern"
  | "audience"
  | "strategy";

export type OpportunityType =
  | "content"
  | "engagement"
  | "relationship"
  | "trend"
  | "reputation"
  | "timing";

export type OpportunityLifecycleStatus =
  | "detected"
  | "evaluated"
  | "presented"
  | "accepted"
  | "rejected"
  | "ignored"
  | "acted"
  | "measured"
  | "learned"
  | "archived";

export type ContentIdeaStatus =
  | "idea"
  | "thesis_approved"
  | "drafting"
  | "drafted"
  | "rejected"
  | "archived";

export type ContentDraftStage =
  | "draft"
  | "critique"
  | "user_feedback"
  | "final"
  | "scheduled"
  | "published"
  | "discarded";

export type PublishedPostStatus =
  | "pending"
  | "published"
  | "failed"
  | "cancelled";

export type ScheduledJobType =
  | "publish_post"
  | "collect_analytics"
  | "opportunity_scan"
  | "brain_update"
  | "telegram_notify";

export type ScheduledJobStatus =
  | "pending"
  | "running"
  | "completed"
  | "retryable_failure"
  | "permanent_failure"
  | "cancelled";

export type AgentActivityActor = "agent" | "user" | "mcp_client" | "system";

export type AgentActivityStatus =
  | "success"
  | "retryable_failure"
  | "permanent_failure"
  | "user_action_required";

export type TelegramConnectionStatus = "pending" | "linked" | "unlinked" | "blocked";

export type TelegramDirection = "inbound" | "outbound";

export type TelegramPriority = "p0" | "p1" | "p2" | "p3";

export type BillingSubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "cancelled"
  | "unpaid"
  | "incomplete";

export type BillingPlan = "free" | "pro";

export type BillingWebhookEventStatus = "pending" | "processed" | "failed" | "skipped";

export type AuditLogActorType = "user" | "agent" | "mcp_client" | "system" | "webhook";

export type AuditLogResult = "success" | "failure" | "partial";

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          status: AccountStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          status?: AccountStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          status?: AccountStatus;
          updated_at?: string;
        };
        Relationships: [];
      };

      connections: {
        Row: {
          id: string;
          account_id: string;
          provider: ConnectionProvider;
          provider_account_id: string | null;
          encrypted_token_ref: string | null;
          status: ConnectionStatus;
          scopes: string[] | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          provider: ConnectionProvider;
          provider_account_id?: string | null;
          encrypted_token_ref?: string | null;
          status?: ConnectionStatus;
          scopes?: string[] | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          provider_account_id?: string | null;
          encrypted_token_ref?: string | null;
          status?: ConnectionStatus;
          scopes?: string[] | null;
          expires_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      professional_identity: {
        Row: {
          id: string;
          account_id: string;
          headline: string | null;
          summary: string | null;
          location: string | null;
          industry: string | null;
          raw_data: Json | null;
          source: string;
          confidence: number;
          status: MemoryLifecycleStatus;
          info_class: InformationClass;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          headline?: string | null;
          summary?: string | null;
          location?: string | null;
          industry?: string | null;
          raw_data?: Json | null;
          source?: string;
          confidence?: number;
          status?: MemoryLifecycleStatus;
          info_class?: InformationClass;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          headline?: string | null;
          summary?: string | null;
          location?: string | null;
          industry?: string | null;
          raw_data?: Json | null;
          source?: string;
          confidence?: number;
          status?: MemoryLifecycleStatus;
          info_class?: InformationClass;
          updated_at?: string;
        };
        Relationships: [];
      };

      expertise: {
        Row: {
          id: string;
          account_id: string;
          skill: string;
          level: ExpertiseLevel | null;
          evidence: Json | null;
          source: string;
          confidence: number;
          status: MemoryLifecycleStatus;
          info_class: InformationClass;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          skill: string;
          level?: ExpertiseLevel | null;
          evidence?: Json | null;
          source?: string;
          confidence?: number;
          status?: MemoryLifecycleStatus;
          info_class?: InformationClass;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          skill?: string;
          level?: ExpertiseLevel | null;
          evidence?: Json | null;
          source?: string;
          confidence?: number;
          status?: MemoryLifecycleStatus;
          info_class?: InformationClass;
          updated_at?: string;
        };
        Relationships: [];
      };

      goals: {
        Row: {
          id: string;
          account_id: string;
          goal_type: string;
          description: string;
          priority: number | null;
          source: string;
          confidence: number;
          status: MemoryLifecycleStatus;
          info_class: InformationClass;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          goal_type: string;
          description: string;
          priority?: number | null;
          source?: string;
          confidence?: number;
          status?: MemoryLifecycleStatus;
          info_class?: InformationClass;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          goal_type?: string;
          description?: string;
          priority?: number | null;
          source?: string;
          confidence?: number;
          status?: MemoryLifecycleStatus;
          info_class?: InformationClass;
          updated_at?: string;
        };
        Relationships: [];
      };

      preferences: {
        Row: {
          id: string;
          account_id: string;
          category: string;
          preference_key: string;
          value: Json;
          source: string;
          confidence: number;
          status: MemoryLifecycleStatus;
          info_class: InformationClass;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          category: string;
          preference_key: string;
          value: Json;
          source?: string;
          confidence?: number;
          status?: MemoryLifecycleStatus;
          info_class?: InformationClass;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          preference_key?: string;
          value?: Json;
          source?: string;
          confidence?: number;
          status?: MemoryLifecycleStatus;
          info_class?: InformationClass;
          updated_at?: string;
        };
        Relationships: [];
      };

      voice_signals: {
        Row: {
          id: string;
          account_id: string;
          signal_type: string;
          value: string;
          evidence: Json | null;
          source: string;
          confidence: number;
          status: MemoryLifecycleStatus;
          info_class: InformationClass;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          signal_type: string;
          value: string;
          evidence?: Json | null;
          source?: string;
          confidence?: number;
          status?: MemoryLifecycleStatus;
          info_class?: InformationClass;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          signal_type?: string;
          value?: string;
          evidence?: Json | null;
          source?: string;
          confidence?: number;
          status?: MemoryLifecycleStatus;
          info_class?: InformationClass;
          updated_at?: string;
        };
        Relationships: [];
      };

      projects: {
        Row: {
          id: string;
          account_id: string;
          name: string;
          description: string | null;
          role: string | null;
          start_date: string | null;
          end_date: string | null;
          outcomes: Json | null;
          source: string;
          confidence: number;
          status: MemoryLifecycleStatus;
          info_class: InformationClass;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          name: string;
          description?: string | null;
          role?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          outcomes?: Json | null;
          source?: string;
          confidence?: number;
          status?: MemoryLifecycleStatus;
          info_class?: InformationClass;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          role?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          outcomes?: Json | null;
          source?: string;
          confidence?: number;
          status?: MemoryLifecycleStatus;
          info_class?: InformationClass;
          updated_at?: string;
        };
        Relationships: [];
      };

      experiences: {
        Row: {
          id: string;
          account_id: string;
          company: string | null;
          title: string | null;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
          is_current: boolean;
          skills_used: string[] | null;
          achievements: Json | null;
          source: string;
          confidence: number;
          status: MemoryLifecycleStatus;
          info_class: InformationClass;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          company?: string | null;
          title?: string | null;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_current?: boolean;
          skills_used?: string[] | null;
          achievements?: Json | null;
          source?: string;
          confidence?: number;
          status?: MemoryLifecycleStatus;
          info_class?: InformationClass;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          company?: string | null;
          title?: string | null;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_current?: boolean;
          skills_used?: string[] | null;
          achievements?: Json | null;
          source?: string;
          confidence?: number;
          status?: MemoryLifecycleStatus;
          info_class?: InformationClass;
          updated_at?: string;
        };
        Relationships: [];
      };

      memories: {
        Row: {
          id: string;
          account_id: string;
          memory_type: MemoryType;
          content: Json;
          source: string;
          confidence: number;
          provenance: Json | null;
          status: MemoryLifecycleStatus;
          info_class: InformationClass;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          memory_type: MemoryType;
          content: Json;
          source: string;
          confidence?: number;
          provenance?: Json | null;
          status?: MemoryLifecycleStatus;
          info_class?: InformationClass;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          memory_type?: MemoryType;
          content?: Json;
          source?: string;
          confidence?: number;
          provenance?: Json | null;
          status?: MemoryLifecycleStatus;
          info_class?: InformationClass;
          updated_at?: string;
        };
        Relationships: [];
      };

      strategies: {
        Row: {
          id: string;
          account_id: string;
          is_current: boolean;
          summary: string | null;
          goals: Json | null;
          tactics: Json | null;
          constraints: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          is_current?: boolean;
          summary?: string | null;
          goals?: Json | null;
          tactics?: Json | null;
          constraints?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          is_current?: boolean;
          summary?: string | null;
          goals?: Json | null;
          tactics?: Json | null;
          constraints?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      strategy_versions: {
        Row: {
          id: string;
          account_id: string;
          strategy_id: string;
          version: number;
          snapshot: Json;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          strategy_id: string;
          version: number;
          snapshot: Json;
          reason?: string | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };

      opportunities: {
        Row: {
          id: string;
          account_id: string;
          opportunity_type: OpportunityType;
          title: string | null;
          description: string | null;
          relevance_score: number | null;
          evidence: Json | null;
          status: OpportunityLifecycleStatus;
          detected_at: string;
          evaluated_at: string | null;
          presented_at: string | null;
          acted_at: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          opportunity_type: OpportunityType;
          title?: string | null;
          description?: string | null;
          relevance_score?: number | null;
          evidence?: Json | null;
          status?: OpportunityLifecycleStatus;
          detected_at?: string;
          evaluated_at?: string | null;
          presented_at?: string | null;
          acted_at?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          opportunity_type?: OpportunityType;
          title?: string | null;
          description?: string | null;
          relevance_score?: number | null;
          evidence?: Json | null;
          status?: OpportunityLifecycleStatus;
          evaluated_at?: string | null;
          presented_at?: string | null;
          acted_at?: string | null;
          archived_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      content_ideas: {
        Row: {
          id: string;
          account_id: string;
          opportunity_id: string | null;
          title: string | null;
          angle: string | null;
          thesis: string | null;
          evidence: Json | null;
          status: ContentIdeaStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          opportunity_id?: string | null;
          title?: string | null;
          angle?: string | null;
          thesis?: string | null;
          evidence?: Json | null;
          status?: ContentIdeaStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          opportunity_id?: string | null;
          title?: string | null;
          angle?: string | null;
          thesis?: string | null;
          evidence?: Json | null;
          status?: ContentIdeaStatus;
          updated_at?: string;
        };
        Relationships: [];
      };

      content_drafts: {
        Row: {
          id: string;
          account_id: string;
          idea_id: string | null;
          title: string | null;
          body: string;
          stage: ContentDraftStage;
          anti_ai_flags: Json | null;
          voice_score: number | null;
          critique: Json | null;
          user_feedback: string | null;
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          idea_id?: string | null;
          title?: string | null;
          body: string;
          stage?: ContentDraftStage;
          anti_ai_flags?: Json | null;
          voice_score?: number | null;
          critique?: Json | null;
          user_feedback?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          idea_id?: string | null;
          title?: string | null;
          body?: string;
          stage?: ContentDraftStage;
          anti_ai_flags?: Json | null;
          voice_score?: number | null;
          critique?: Json | null;
          user_feedback?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      content_versions: {
        Row: {
          id: string;
          account_id: string;
          draft_id: string;
          version: number;
          body: string;
          stage: string;
          changed_by: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          draft_id: string;
          version: number;
          body: string;
          stage: string;
          changed_by?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };

      published_posts: {
        Row: {
          id: string;
          account_id: string;
          draft_id: string | null;
          platform: "linkedin";
          platform_post_id: string | null;
          status: PublishedPostStatus;
          idempotency_key: string;
          body_snapshot: string | null;
          published_at: string | null;
          failure_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          draft_id?: string | null;
          platform?: "linkedin";
          platform_post_id?: string | null;
          status?: PublishedPostStatus;
          idempotency_key: string;
          body_snapshot?: string | null;
          published_at?: string | null;
          failure_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          platform_post_id?: string | null;
          status?: PublishedPostStatus;
          body_snapshot?: string | null;
          published_at?: string | null;
          failure_reason?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      analytics_snapshots: {
        Row: {
          id: string;
          account_id: string;
          post_id: string;
          platform: string;
          snapshot_at: string;
          data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          post_id: string;
          platform?: string;
          snapshot_at?: string;
          data: Json;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };

      scheduled_jobs: {
        Row: {
          id: string;
          account_id: string;
          job_type: ScheduledJobType;
          entity_id: string | null;
          entity_type: string | null;
          scheduled_at: string;
          status: ScheduledJobStatus;
          attempts: number;
          max_attempts: number;
          idempotency_key: string;
          last_error: string | null;
          payload: Json | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          job_type: ScheduledJobType;
          entity_id?: string | null;
          entity_type?: string | null;
          scheduled_at: string;
          status?: ScheduledJobStatus;
          attempts?: number;
          max_attempts?: number;
          idempotency_key: string;
          last_error?: string | null;
          payload?: Json | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: ScheduledJobStatus;
          attempts?: number;
          last_error?: string | null;
          payload?: Json | null;
          started_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      agent_rules: {
        Row: {
          id: string;
          account_id: string;
          rule_type: string;
          value: Json;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          rule_type: string;
          value: Json;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          rule_type?: string;
          value?: Json;
          enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };

      agent_activity: {
        Row: {
          id: string;
          account_id: string;
          actor: AgentActivityActor;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          trigger_source: string | null;
          permission_rule: string | null;
          result: Json | null;
          status: AgentActivityStatus;
          external_id: string | null;
          error_message: string | null;
          retry_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          actor: AgentActivityActor;
          action: string;
          resource_type?: string | null;
          resource_id?: string | null;
          trigger_source?: string | null;
          permission_rule?: string | null;
          result?: Json | null;
          status?: AgentActivityStatus;
          external_id?: string | null;
          error_message?: string | null;
          retry_count?: number;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };

      telegram_connections: {
        Row: {
          id: string;
          account_id: string;
          telegram_user_id: string | null;
          link_token: string | null;
          link_token_expires_at: string | null;
          status: TelegramConnectionStatus;
          linked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          telegram_user_id?: string | null;
          link_token?: string | null;
          link_token_expires_at?: string | null;
          status?: TelegramConnectionStatus;
          linked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          telegram_user_id?: string | null;
          link_token?: string | null;
          link_token_expires_at?: string | null;
          status?: TelegramConnectionStatus;
          linked_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      telegram_messages: {
        Row: {
          id: string;
          account_id: string;
          direction: TelegramDirection;
          telegram_msg_id: string | null;
          content_ref: string | null;
          priority: TelegramPriority | null;
          processed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          direction: TelegramDirection;
          telegram_msg_id?: string | null;
          content_ref?: string | null;
          priority?: TelegramPriority | null;
          processed?: boolean;
          created_at?: string;
        };
        Update: {
          processed?: boolean;
        };
        Relationships: [];
      };

      mcp_clients: {
        Row: {
          id: string;
          account_id: string;
          client_name: string;
          client_id: string;
          created_at: string;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          account_id: string;
          client_name: string;
          client_id: string;
          created_at?: string;
          revoked_at?: string | null;
        };
        Update: {
          client_name?: string;
          revoked_at?: string | null;
        };
        Relationships: [];
      };

      mcp_permissions: {
        Row: {
          id: string;
          account_id: string;
          mcp_client_id: string;
          scope: string;
          granted_at: string;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          account_id: string;
          mcp_client_id: string;
          scope: string;
          granted_at?: string;
          revoked_at?: string | null;
        };
        Update: {
          scope?: string;
          revoked_at?: string | null;
        };
        Relationships: [];
      };

      billing_customers: {
        Row: {
          id: string;
          account_id: string;
          polar_customer_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          polar_customer_id: string;
          created_at?: string;
        };
        Update: {
          polar_customer_id?: string;
        };
        Relationships: [];
      };

      billing_subscriptions: {
        Row: {
          id: string;
          account_id: string;
          polar_subscription_id: string;
          product_id: string;
          price_id: string | null;
          status: BillingSubscriptionStatus;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          polar_subscription_id: string;
          product_id: string;
          price_id?: string | null;
          status: BillingSubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          product_id?: string;
          price_id?: string | null;
          status?: BillingSubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          cancelled_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      billing_entitlements: {
        Row: {
          id: string;
          account_id: string;
          plan: BillingPlan;
          feature: string;
          enabled: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          plan: BillingPlan;
          feature: string;
          enabled?: boolean;
          updated_at?: string;
        };
        Update: {
          plan?: BillingPlan;
          feature?: string;
          enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };

      billing_webhook_events: {
        Row: {
          id: string;
          polar_event_id: string;
          event_type: string;
          status: BillingWebhookEventStatus;
          payload: Json;
          processed_at: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          polar_event_id: string;
          event_type: string;
          status?: BillingWebhookEventStatus;
          payload: Json;
          processed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          status?: BillingWebhookEventStatus;
          processed_at?: string | null;
          error_message?: string | null;
        };
        Relationships: [];
      };

      audit_logs: {
        Row: {
          id: string;
          account_id: string | null;
          actor_type: AuditLogActorType;
          actor_id: string | null;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          result: AuditLogResult;
          status: AgentActivityStatus;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id?: string | null;
          actor_type: AuditLogActorType;
          actor_id?: string | null;
          action: string;
          resource_type?: string | null;
          resource_id?: string | null;
          result: AuditLogResult;
          status: AgentActivityStatus;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };

      oauth_states: {
        Row: {
          id: string;
          account_id: string | null;
          state: string;
          provider: "linkedin";
          used: boolean;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id?: string | null;
          state: string;
          provider: "linkedin";
          used?: boolean;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          used?: boolean;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
