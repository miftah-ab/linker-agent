/**
 * Telegram Webhook Route Handler — Linker
 *
 * Spec: §14 Telegram Agent Contract, §1.6 Webhooks Security Baseline
 *
 * Rules:
 *   - Verifies X-Telegram-Bot-Api-Secret-Token header
 *   - Processes /start <link_token> for account linking
 *   - Routes through Linker Core with audit logging
 */

import { TelegramService } from "@/lib/adapters/telegram/service";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Validate secret token header
  const secretHeader = request.headers.get("x-telegram-bot-api-secret-token");
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (expectedSecret && secretHeader !== expectedSecret) {
    console.warn("[TelegramWebhook] Unauthorized secret token header.");
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const update = (await request.json()) as {
      message?: {
        text?: string;
        from?: { id: number; username?: string };
        chat?: { id: number };
      };
    };

    const text = update.message?.text?.trim();
    const chatId = update.message?.chat?.id;

    if (text && chatId && text.startsWith("/start link_")) {
      const token = text.replace("/start ", "").trim();
      const service = new TelegramService();
      const linked = await service.completeLinking(token, String(chatId));

      if (linked) {
        // Send confirmation back
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (botToken) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "✅ *Linker Connected Successfully!*\n\nYour Telegram account is now securely linked to Linker. You will receive draft approvals, high-priority notifications, and opportunity digests right here.",
              parse_mode: "Markdown",
            }),
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[TelegramWebhook] Error processing webhook update:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
