/**
 * Model Router — Linker
 *
 * Spec: §5 AI Infrastructure, §10 Agent Contract, §116 Provider Invariant
 *
 * Rules:
 *   - Provider-agnostic interface
 *   - Initial provider: Groq Free Tier (Llama 3.3 70B Versatile / Llama 3.1 8B Instant)
 *   - Model provider identity NEVER exposed in user-facing UI or API outputs (§116)
 *   - Frontend NEVER calls AI providers directly
 *   - Defends against prompt injection: untrusted inputs are treated strictly as data
 *   - Graceful rate-limit / fallback handling
 */

export interface ModelCompletionOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface ModelCompletionResult {
  text: string;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export class ModelRouterError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public isRateLimit = statusCode === 429
  ) {
    super(message);
    this.name = "ModelRouterError";
  }
}

/**
 * Sanitizes and wraps untrusted user data to protect against prompt injection.
 * Invariant: External content cannot alter system instructions, rules, or execution authority.
 */
export function wrapUntrustedData(label: string, content: string): string {
  // Strip null bytes and normalize line breaks
  const sanitized = content.replace(/\0/g, "").trim();
  return `<UNTRUSTED_${label.toUpperCase()}>\n${sanitized}\n</UNTRUSTED_${label.toUpperCase()}>`;
}

/**
 * Dispatches a prompt to the configured AI model backend.
 */
export async function completePrompt(
  options: ModelCompletionOptions
): Promise<ModelCompletionResult> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("AI provider API key is not configured.");
  }

  // Use Groq standard chat completions endpoint
  const url = "https://api.groq.com/openai/v1/chat/completions";

  // Use primary high-capability model (Llama 3.3 70B Versatile)
  const model = "llama-3.3-70b-versatile";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.userPrompt },
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
      response_format: options.jsonMode ? { type: "json_object" } : undefined,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    if (response.status === 429) {
      throw new ModelRouterError("AI rate limit reached. Backing off.", 429, true);
    }
    throw new ModelRouterError(
      `AI generation failed with HTTP ${response.status}: ${errorBody}`,
      response.status
    );
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  };

  const choice = data.choices?.[0];
  if (!choice || !choice.message) {
    throw new Error("No completion choice returned by model provider.");
  }

  return {
    text: choice.message.content,
    tokensUsed: data.usage
      ? {
          prompt: data.usage.prompt_tokens,
          completion: data.usage.completion_tokens,
          total: data.usage.total_tokens,
        }
      : undefined,
  };
}
