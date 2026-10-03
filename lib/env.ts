/**
 * Environment Variable Schema — Linker
 *
 * Spec: §1.2 Environment and Secrets Baseline
 * All environment variables are validated at startup via Zod 4.x.
 * Missing or malformed vars throw at startup — fail fast, fail loud.
 *
 * Rules:
 *   - No secrets committed to Git (§1.2)
 *   - Each environment (local/staging/production) has isolated credentials
 *   - Production topology: Vercel + Supabase production project
 *   - NEVER expose these values to the browser bundle
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Server-only environment schema
// These are never exposed to the browser.
// ---------------------------------------------------------------------------
const serverEnvSchema = z.object({
  // Runtime
  NODE_ENV: z.enum(["development", "test", "production"]),

  // Supabase — Database & Auth (§2 Technology Constraints)
  NEXT_PUBLIC_SUPABASE_URL: z.url({ message: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL" }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),

  // LinkedIn OAuth (§31–39 LinkedIn OAuth / Token Lifecycle)
  // Client secret MUST stay server-side. Never in browser, logs, or AI context.
  LINKEDIN_CLIENT_ID: z.string().min(1, "LINKEDIN_CLIENT_ID is required"),
  LINKEDIN_CLIENT_SECRET: z.string().min(1, "LINKEDIN_CLIENT_SECRET is required"),
  // Must be absolute HTTPS, exactly matching LinkedIn Developer App config (§32)
  LINKEDIN_REDIRECT_URI: z.url({ message: "LINKEDIN_REDIRECT_URI must be an absolute HTTPS URL" }),

  // Telegram Bot (§14 Telegram)
  // Bot token MUST stay server-side. Never in browser, logs, AI context, or MCP responses (§306).
  TELEGRAM_BOT_TOKEN: z.string().min(1, "TELEGRAM_BOT_TOKEN is required"),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(1, "TELEGRAM_WEBHOOK_SECRET is required"),

  // Polar.sh Billing (§12 Billing — Polar.sh)
  POLAR_ACCESS_TOKEN: z.string().min(1, "POLAR_ACCESS_TOKEN is required"),
  POLAR_WEBHOOK_SECRET: z.string().min(1, "POLAR_WEBHOOK_SECRET is required"),
  POLAR_ORGANIZATION_ID: z.string().min(1, "POLAR_ORGANIZATION_ID is required"),

  // AI Provider — Groq Free Tier initially (§5 AI Infrastructure)
  // Provider name must never appear in product UX (§116).
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),

  // Sentry (§10 Observability)
  SENTRY_DSN: z.url({ message: "SENTRY_DSN must be a valid URL" }).optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Application
  NEXT_PUBLIC_APP_URL: z.url({ message: "NEXT_PUBLIC_APP_URL must be a valid URL" }),
  // Used to verify post-auth redirect allowlist (§55 — prevent open redirects)
  ALLOWED_REDIRECT_ORIGINS: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Client-safe environment schema (only NEXT_PUBLIC_ vars)
// These are intentionally public and appear in the browser bundle.
// ---------------------------------------------------------------------------
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.url(),
});

// ---------------------------------------------------------------------------
// Parse and export — throws ZodError at startup if invalid
// ---------------------------------------------------------------------------
function parseServerEnv() {
  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `❌ Invalid/missing environment variables:\n${errors}\n\nCheck .env.local.example for required variables.`
    );
  }
  return result.data;
}

function parseClientEnv() {
  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
  if (!result.success) {
    throw new Error(
      `❌ Invalid client environment variables: ${result.error.message}`
    );
  }
  return result.data;
}

// Server env — only call on the server
export const serverEnv = parseServerEnv();

// Client env — safe for browser
export const clientEnv = parseClientEnv();

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
