/**
 * Anti-AI Detection & Voice Consistency Validator — Linker
 *
 * Spec: §12 Content Intelligence Contract
 * Enforces authentic human voice and rejects synthetic AI LinkedIn clichés.
 */

export interface AntiAiCheckResult {
  passed: boolean;
  score: number; // 0.0 (synthetic/cliché) to 1.0 (authentic human)
  flags: string[];
  suggestions: string[];
}

const FORBIDDEN_CLICHES = [
  "in today's fast-paced world",
  "delighted to share",
  "thrilled to announce",
  "humbled and honored",
  "game changer",
  "game-changer",
  "testament to",
  "dive deep",
  "let's unpack",
  "unlock the potential",
  "tapestry",
  "revolutionize",
  "delve into",
  "seamlessly",
  "supercharge",
  "beacon of",
  "foster collaboration",
  "paradigm shift",
  "thought leader",
  "synergy",
];

export function runAntiAiAudit(content: string): AntiAiCheckResult {
  const flags: string[] = [];
  const suggestions: string[] = [];
  const lower = content.toLowerCase();

  // 1. Cliché matching
  let clicheHits = 0;
  for (const phrase of FORBIDDEN_CLICHES) {
    if (lower.includes(phrase)) {
      clicheHits++;
      flags.push(`Forbidden AI cliché detected: "${phrase}"`);
      suggestions.push(`Replace or remove corporate/AI buzzword: "${phrase}"`);
    }
  }

  // 2. Excessive emoji check (more than 4 emojis in a professional post)
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu;
  const emojiCount = (content.match(emojiRegex) || []).length;
  if (emojiCount > 4) {
    flags.push(`Excessive emoji usage (${emojiCount} emojis) reduces executive credibility`);
    suggestions.push("Limit emojis to 1-2 contextual accents or none at all.");
  }

  // 3. Lack of concrete specific details (numbers, metrics, named outcomes)
  const hasNumbers = /\d+/.test(content);
  if (!hasNumbers && content.length > 300) {
    flags.push("Abstract narrative lacking specific empirical figures or concrete metrics.");
    suggestions.push("Ground the post with specific data, metrics, or concrete project outcomes.");
  }

  // Calculate score
  let score = 1.0;
  score -= clicheHits * 0.2;
  if (emojiCount > 4) score -= 0.15;
  if (!hasNumbers && content.length > 300) score -= 0.1;
  score = Math.max(0, Math.min(1, score));

  return {
    passed: score >= 0.7 && clicheHits === 0,
    score: Number(score.toFixed(2)),
    flags,
    suggestions,
  };
}
