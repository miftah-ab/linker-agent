import { describe, it, expect } from "vitest";
import { DEFAULT_AGENT_RULES } from "@/lib/agent/types";

describe("Agent Permission Hierarchy & Rules (§10)", () => {
  it("enforces default assisted autonomy mode", () => {
    expect(DEFAULT_AGENT_RULES.autonomyMode).toBe("assisted");
    expect(DEFAULT_AGENT_RULES.requireApprovalForPublish).toBe(true);
    expect(DEFAULT_AGENT_RULES.allowDirectPublish).toBe(false);
  });

  it("caps daily post default to 2 to prevent feed fatigue", () => {
    expect(DEFAULT_AGENT_RULES.maxDailyPosts).toBe(2);
  });
});
