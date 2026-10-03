/**
 * Telegram Connect Route Handler — Linker
 *
 * Spec: §14 Telegram Agent Contract
 * Generates a one-time link token for the authenticated account.
 */

import { requireAuth } from "@/lib/auth/require-auth";
import { TelegramService } from "@/lib/adapters/telegram/service";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const service = new TelegramService(auth.context.accountId);
  const linkingData = await service.generateLinkingToken(auth.context.accountId);

  return NextResponse.json({ ok: true, data: linkingData });
}
