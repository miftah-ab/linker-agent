import { describe, it, expect } from "vitest";
import { runAntiAiAudit } from "@/lib/content/anti-ai";

describe("Anti-AI Content Auditor (§12)", () => {
  it("rejects content containing banned AI clichés", () => {
    const aiGeneratedContent =
      "In today's fast-paced world, I am delighted to share a game changer that will unlock the potential of your engineering team.";

    const result = runAntiAiAudit(aiGeneratedContent);
    expect(result.passed).toBe(false);
    expect(result.flags.length).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(0.7);
  });

  it("flags excessive emoji usage", () => {
    const emojiSpam =
      "🚀 We are launching! 💥 Massive updates ahead! 🔥 Check out our new platform 🌟 Great work team 🎉";

    const result = runAntiAiAudit(emojiSpam);
    expect(result.flags.some((f) => f.includes("Excessive emoji"))).toBe(true);
  });

  it("passes authentic executive writing with empirical figures and zero clichés", () => {
    const authenticContent = `Most teams building distributed multi-tenant databases encounter connection pool exhaustion under 5,000 req/sec.

In our migration last month, we solved this by implementing tenant-scoped connection pooling:
1. Hard-capping per-tenant connection limits to 25.
2. Introducing asynchronous statement timeouts of 250ms.
3. Partitioning high-traffic audit logs into monthly tables.

Result: latency dropped by 42% with zero connection pool spikes.`;

    const result = runAntiAiAudit(authenticContent);
    expect(result.passed).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(0.9);
    expect(result.flags.length).toBe(0);
  });
});
