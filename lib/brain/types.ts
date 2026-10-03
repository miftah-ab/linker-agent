/**
 * Professional Brain Types — Linker
 *
 * Spec: §9 Professional Brain Contract
 * The Professional Brain is a persistent structured context layer, NOT a monolithic prompt.
 *
 * Information Classes:
 *   - FACT: Directly observed or user-confirmed empirical fact
 *   - USER_PREFERENCE: Explicit preference stated by user
 *   - INFERENCE: Deduced pattern with confidence < 1.0
 *   - GOAL: User objective with priority and target
 *   - MEMORY: Historical interaction or published content observation
 *   - UNCERTAINTY: Ambiguous signal requiring user clarification
 *
 * Lifecycle:
 *   detected → candidate → validated → active → updated → superseded → archived
 */

import type {
  InformationClass,
  MemoryLifecycleStatus,
  ExpertiseLevel,
  MemoryType,
  Json,
} from "@/lib/db/types";

export interface ProfessionalIdentityData {
  headline: string | null;
  summary: string | null;
  location: string | null;
  industry: string | null;
  source: string;
  confidence: number;
  status: MemoryLifecycleStatus;
}

export interface ExpertiseItem {
  id: string;
  skill: string;
  level: ExpertiseLevel | null;
  evidence: Json | null;
  source: string;
  confidence: number;
  status: MemoryLifecycleStatus;
  infoClass: InformationClass;
}

export interface GoalItem {
  id: string;
  goalType: string;
  description: string;
  priority: number | null;
  source: string;
  confidence: number;
  status: MemoryLifecycleStatus;
}

export interface PreferenceItem {
  id: string;
  category: string;
  key: string;
  value: Json;
  source: string;
  confidence: number;
  status: MemoryLifecycleStatus;
}

export interface VoiceSignalItem {
  id: string;
  signalType: string;
  value: string;
  evidence: Json | null;
  confidence: number;
  status: MemoryLifecycleStatus;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string | null;
  role: string | null;
  startDate: string | null;
  endDate: string | null;
  outcomes: Json | null;
  status: MemoryLifecycleStatus;
}

export interface ExperienceItem {
  id: string;
  company: string | null;
  title: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  skillsUsed: string[];
}

export interface MemoryRecord {
  id: string;
  memoryType: MemoryType;
  content: Json;
  source: string;
  confidence: number;
  provenance: Json | null;
  status: MemoryLifecycleStatus;
  infoClass: InformationClass;
}

export interface StrategyRecord {
  id: string;
  isCurrent: boolean;
  summary: string | null;
  goals: Json | null;
  tactics: Json | null;
  constraints: Json | null;
}

/**
 * Context payload assembled for the Agent Loop and Content Intelligence
 */
export interface AssembledBrainContext {
  identity: ProfessionalIdentityData | null;
  activeExpertise: ExpertiseItem[];
  activeGoals: GoalItem[];
  activePreferences: PreferenceItem[];
  voiceSignals: VoiceSignalItem[];
  recentExperiences: ExperienceItem[];
  currentStrategy: StrategyRecord | null;
  relevantMemories: MemoryRecord[];
}
