/**
 * Telegram Adapter Service — Linker
 *
 * Spec: §14 Telegram Agent Contract, §20 Database Contract
 *
 * Rules:
 *   - TELEGRAM_BOT_TOKEN stays server-side only (§306)
 *   - Webhook validated via secret token header
 *   - One-time expiring link tokens for secure user-account binding
 *   - Telegram messages route through Linker Core with audit logging
 */

import { randomBytes } from "crypto";
import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { logAudit } from "@/lib/audit/logger";

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

export class TelegramService {
  constructor(private readonly accountId?: string) {}

  /**
   * Generates a single-use deep-link token for linking a Telegram account to a Linker account.
   */
  async generateLinkingToken(accountId: string): Promise<{ token: string; botUrl: string }> {
    const supabase = createSupabaseServiceClient();

    const token = `link_${randomBytes(24).toString("hex")}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes TTL

    await supabase.from("telegram_connections").upsert(
      {
        account_id: accountId,
        link_token: token,
        link_token_expires_at: expiresAt,
        status: "pending",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "account_id" }
    );

    // Deep-link URL for Telegram
    const botUrl = `https://t.me/linker_agent_bot?start=${token}`;

    await logAudit({
      accountId,
      actorType: "user",
      actorId: accountId,
      action: "telegram.link_token_generated",
      resourceType: "telegram_connection",
      resourceId: accountId,
      result: "success",
      status: "success",
    });

    return { token, botUrl };
  }

  /**
   * Completes account linking when user clicks /start <token> in Telegram.
   */
  async completeLinking(token: string, telegramUserId: string): Promise<boolean> {
    const supabase = createSupabaseServiceClient();

    const { data: connection } = await supabase
      .from("telegram_connections")
      .select("id, account_id, link_token_expires_at, status")
      .eq("link_token", token)
      .eq("status", "pending")
      .single();

    if (!connection || !connection.link_token_expires_at) {
      return false;
    }

    if (new Date(connection.link_token_expires_at) < new Date()) {
      return false;
    }

    // Bind telegram_user_id and update status to 'linked'
    const { error } = await supabase
      .from("telegram_connections")
      .update({
        telegram_user_id: telegramUserId,
        status: "linked",
        linked_at: new Date().toISOString(),
        link_token: null,
        link_token_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", connection.id);

    if (error) {
      console.error("[Telegram] Failed to complete linking:", error.message);
      return false;
    }

    await logAudit({
      accountId: connection.account_id,
      actorType: "system",
      actorId: "telegram_adapter",
      action: "telegram.account_linked",
      resourceType: "telegram_connection",
      resourceId: connection.account_id,
      result: "success",
      status: "success",
      metadata: { telegramUserId },
    });

    return true;
  }

  /**
   * Sends an outbound notification message to the user's linked Telegram chat.
   */
  async sendMessage(text: string, priority: "p0" | "p1" | "p2" | "p3" = "p1"): Promise<boolean> {
    if (!this.accountId) throw new Error("AccountId required to send message.");

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.warn("[Telegram] Bot token not configured; message skipped.");
      return false;
    }

    const supabase = createSupabaseServiceClient();
    const { data: conn } = await supabase
      .from("telegram_connections")
      .select("telegram_user_id, status")
      .eq("account_id", this.accountId)
      .eq("status", "linked")
      .single();

    if (!conn || !conn.telegram_user_id) {
      return false;
    }

    const response = await fetch(`${TELEGRAM_API_BASE}${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: conn.telegram_user_id,
        text,
        parse_mode: "Markdown",
      }),
    });

    // Record outbound message in telegram_messages table
    await supabase.from("telegram_messages").insert({
      account_id: this.accountId,
      direction: "outbound",
      content_ref: `msg_${Date.now()}`,
      priority,
      processed: response.ok,
    });

    return response.ok;
  }
}
