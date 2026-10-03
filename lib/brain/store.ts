/**
 * Professional Brain Store — Linker
 *
 * Spec: §9 Professional Brain Contract, §20 Database Contract
 * Persistent, tenant-isolated data access layer for all brain entities.
 *
 * Rules:
 *   - Every query strictly scoped to account_id
 *   - Memory lifecycle states properly maintained
 *   - Confidence and source provenance tracked on all entries
 */

import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import type {
  ProfessionalIdentityData,
  ExpertiseItem,
  GoalItem,
  PreferenceItem,
  VoiceSignalItem,
  ExperienceItem,
  MemoryRecord,
  StrategyRecord,
  AssembledBrainContext,
} from "./types";
import type { MemoryLifecycleStatus, InformationClass, ExpertiseLevel, MemoryType, Json } from "@/lib/db/types";

export class BrainStore {
  constructor(private readonly accountId: string) {}

  // -------------------------------------------------------------------------
  // Identity
  // -------------------------------------------------------------------------
  async getIdentity(): Promise<ProfessionalIdentityData | null> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("professional_identity")
      .select("headline, summary, location, industry, source, confidence, status")
      .eq("account_id", this.accountId)
      .single();

    if (error || !data) return null;
    return {
      headline: data.headline,
      summary: data.summary,
      location: data.location,
      industry: data.industry,
      source: data.source,
      confidence: Number(data.confidence),
      status: data.status,
    };
  }

  async upsertIdentity(data: Partial<ProfessionalIdentityData>): Promise<void> {
    const supabase = createSupabaseServiceClient();
    await supabase.from("professional_identity").upsert(
      {
        account_id: this.accountId,
        headline: data.headline ?? null,
        summary: data.summary ?? null,
        location: data.location ?? null,
        industry: data.industry ?? null,
        source: data.source ?? "user_stated",
        confidence: data.confidence ?? 1.0,
        status: data.status ?? "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "account_id" }
    );
  }

  // -------------------------------------------------------------------------
  // Expertise
  // -------------------------------------------------------------------------
  async listExpertise(status: MemoryLifecycleStatus = "active"): Promise<ExpertiseItem[]> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("expertise")
      .select("id, skill, level, evidence, source, confidence, status, info_class")
      .eq("account_id", this.accountId)
      .eq("status", status)
      .order("confidence", { ascending: false });

    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      skill: row.skill,
      level: row.level as ExpertiseLevel | null,
      evidence: row.evidence,
      source: row.source,
      confidence: Number(row.confidence),
      status: row.status,
      infoClass: row.info_class,
    }));
  }

  async addExpertise(
    skill: string,
    level: ExpertiseLevel = "intermediate",
    confidence = 0.8,
    source = "user_stated"
  ): Promise<string> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("expertise")
      .insert({
        account_id: this.accountId,
        skill,
        level,
        confidence,
        source,
        status: "active",
        info_class: "FACT",
      })
      .select("id")
      .single();

    if (error) throw new Error(`Failed to add expertise: ${error.message}`);
    return data.id;
  }

  // -------------------------------------------------------------------------
  // Goals
  // -------------------------------------------------------------------------
  async listGoals(status: MemoryLifecycleStatus = "active"): Promise<GoalItem[]> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("goals")
      .select("id, goal_type, description, priority, source, confidence, status")
      .eq("account_id", this.accountId)
      .eq("status", status)
      .order("priority", { ascending: false });

    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      goalType: row.goal_type,
      description: row.description,
      priority: row.priority,
      source: row.source,
      confidence: Number(row.confidence),
      status: row.status,
    }));
  }

  async addGoal(
    goalType: string,
    description: string,
    priority = 5,
    source = "user_stated"
  ): Promise<string> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("goals")
      .insert({
        account_id: this.accountId,
        goal_type: goalType,
        description,
        priority,
        source,
        status: "active",
        info_class: "GOAL",
      })
      .select("id")
      .single();

    if (error) throw new Error(`Failed to add goal: ${error.message}`);
    return data.id;
  }

  // -------------------------------------------------------------------------
  // Preferences
  // -------------------------------------------------------------------------
  async listPreferences(): Promise<PreferenceItem[]> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("preferences")
      .select("id, category, preference_key, value, source, confidence, status")
      .eq("account_id", this.accountId)
      .eq("status", "active");

    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      category: row.category,
      key: row.preference_key,
      value: row.value,
      source: row.source,
      confidence: Number(row.confidence),
      status: row.status,
    }));
  }

  async setPreference(
    category: string,
    key: string,
    value: Json,
    source = "user_stated"
  ): Promise<void> {
    const supabase = createSupabaseServiceClient();
    await supabase.from("preferences").upsert(
      {
        account_id: this.accountId,
        category,
        preference_key: key,
        value,
        source,
        confidence: 1.0,
        status: "active",
        info_class: "USER_PREFERENCE",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "account_id,category,preference_key" }
    );
  }

  // -------------------------------------------------------------------------
  // Voice Signals
  // -------------------------------------------------------------------------
  async listVoiceSignals(): Promise<VoiceSignalItem[]> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("voice_signals")
      .select("id, signal_type, value, evidence, confidence, status")
      .eq("account_id", this.accountId)
      .in("status", ["active", "candidate"]);

    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      signalType: row.signal_type,
      value: row.value,
      evidence: row.evidence,
      confidence: Number(row.confidence),
      status: row.status,
    }));
  }

  // -------------------------------------------------------------------------
  // Experiences
  // -------------------------------------------------------------------------
  async listExperiences(): Promise<ExperienceItem[]> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("experiences")
      .select("id, company, title, description, start_date, end_date, is_current, skills_used")
      .eq("account_id", this.accountId)
      .eq("status", "active")
      .order("start_date", { ascending: false });

    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      company: row.company,
      title: row.title,
      description: row.description,
      startDate: row.start_date,
      endDate: row.end_date,
      isCurrent: row.is_current,
      skillsUsed: row.skills_used ?? [],
    }));
  }

  // -------------------------------------------------------------------------
  // Memories
  // -------------------------------------------------------------------------
  async listMemories(memoryType?: MemoryType, limit = 20): Promise<MemoryRecord[]> {
    const supabase = createSupabaseServiceClient();
    let query = supabase
      .from("memories")
      .select("id, memory_type, content, source, confidence, provenance, status, info_class")
      .eq("account_id", this.accountId)
      .in("status", ["active", "validated"])
      .order("created_at", { ascending: false })
      .limit(limit);

    if (memoryType) {
      query = query.eq("memory_type", memoryType);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      memoryType: row.memory_type,
      content: row.content,
      source: row.source,
      confidence: Number(row.confidence),
      provenance: row.provenance,
      status: row.status,
      infoClass: row.info_class,
    }));
  }

  async saveMemory(
    memoryType: MemoryType,
    content: Json,
    source: string,
    infoClass: InformationClass = "INFERENCE",
    confidence = 0.7
  ): Promise<string> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("memories")
      .insert({
        account_id: this.accountId,
        memory_type: memoryType,
        content,
        source,
        info_class: infoClass,
        confidence,
        status: "active",
      })
      .select("id")
      .single();

    if (error) throw new Error(`Failed to save memory: ${error.message}`);
    return data.id;
  }

  // -------------------------------------------------------------------------
  // Strategy
  // -------------------------------------------------------------------------
  async getCurrentStrategy(): Promise<StrategyRecord | null> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("strategies")
      .select("id, is_current, summary, goals, tactics, constraints")
      .eq("account_id", this.accountId)
      .eq("is_current", true)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      isCurrent: data.is_current,
      summary: data.summary,
      goals: data.goals,
      tactics: data.tactics,
      constraints: data.constraints,
    };
  }

  // -------------------------------------------------------------------------
  // Context Assembly for Agent
  // -------------------------------------------------------------------------
  async assembleContext(): Promise<AssembledBrainContext> {
    const [
      identity,
      activeExpertise,
      activeGoals,
      activePreferences,
      voiceSignals,
      recentExperiences,
      currentStrategy,
      relevantMemories,
    ] = await Promise.all([
      this.getIdentity(),
      this.listExpertise("active"),
      this.listGoals("active"),
      this.listPreferences(),
      this.listVoiceSignals(),
      this.listExperiences(),
      this.getCurrentStrategy(),
      this.listMemories(undefined, 15),
    ]);

    return {
      identity,
      activeExpertise,
      activeGoals,
      activePreferences,
      voiceSignals,
      recentExperiences,
      currentStrategy,
      relevantMemories,
    };
  }
}
