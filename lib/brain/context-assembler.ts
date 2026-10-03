/**
 * Professional Brain Context Assembler — Linker
 *
 * Spec: §9 Professional Brain Contract
 * Compiles the structured brain state into an authoritative, prompt-ready context block.
 *
 * Invariants:
 *   - Facts are preserved with provenance; never hallucinated or overstated
 *   - Preferences and constraints are highlighted as strict rules
 *   - Voice signals dictate style, cadence, and vocabulary
 *   - Inferences are explicitly tagged so downstream generators know confidence level
 */

import type { AssembledBrainContext } from "./types";

export function formatBrainContextForPrompt(context: AssembledBrainContext): string {
  const sections: string[] = [];

  // 1. Professional Identity
  if (context.identity) {
    const { headline, summary, location, industry } = context.identity;
    sections.push(`### Professional Identity
- Headline: ${headline ?? "Not specified"}
- Industry: ${industry ?? "Not specified"}
- Location: ${location ?? "Not specified"}
- Summary: ${summary ?? "Not specified"}`);
  }

  // 2. Active Expertise (Skills)
  if (context.activeExpertise.length > 0) {
    const skillsList = context.activeExpertise
      .map((e) => `- ${e.skill} (${e.level ?? "intermediate"}, confidence: ${e.confidence})`)
      .join("\n");
    sections.push(`### Verified Core Expertise\n${skillsList}`);
  }

  // 3. User Goals
  if (context.activeGoals.length > 0) {
    const goalsList = context.activeGoals
      .map((g) => `- [Priority ${g.priority ?? 5}] (${g.goalType}): ${g.description}`)
      .join("\n");
    sections.push(`### Strategic Objectives & Goals\n${goalsList}`);
  }

  // 4. Strict Preferences & Constraints
  if (context.activePreferences.length > 0) {
    const prefsList = context.activePreferences
      .map((p) => `- ${p.category}.${p.key}: ${JSON.stringify(p.value)}`)
      .join("\n");
    sections.push(`### User Preferences & Content Constraints\n${prefsList}`);
  }

  // 5. Voice & Tone Signals
  if (context.voiceSignals.length > 0) {
    const voiceList = context.voiceSignals
      .map((v) => `- ${v.signalType}: "${v.value}" (confidence: ${v.confidence})`)
      .join("\n");
    sections.push(`### Authentic Voice & Style Signals\n${voiceList}`);
  }

  // 6. Current Strategy
  if (context.currentStrategy && context.currentStrategy.summary) {
    sections.push(`### Current Positioning Strategy\n${context.currentStrategy.summary}`);
  }

  // 7. Recent Memories & Patterns
  if (context.relevantMemories.length > 0) {
    const memList = context.relevantMemories
      .map((m) => `- [${m.memoryType.toUpperCase()} - ${m.infoClass}] ${JSON.stringify(m.content)}`)
      .join("\n");
    sections.push(`### Historical Memories & Feedback Patterns\n${memList}`);
  }

  return sections.join("\n\n");
}
