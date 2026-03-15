/**
 * Shared Telegram API helpers (getChat name, initData validation, etc.).
 */

import { createHmac } from "crypto";

export interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

/**
 * Validate Telegram Web App initData and extract user.
 * See https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * Returns user { id, first_name, last_name, username } or null if invalid/missing.
 */
export function parseAndValidateTelegramInitData(initData: string | null | undefined): TelegramWebAppUser | null {
  if (!initData || typeof initData !== "string" || !initData.trim()) return null;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  if (computedHash !== hash) return null;

  const userJson = params.get("user");
  if (!userJson) return null;
  try {
    const user = JSON.parse(userJson) as TelegramWebAppUser;
    if (typeof user?.id !== "number") return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Get display name for a Telegram chat/user via Bot API getChat.
 * Returns "First Last" or username, or null on failure.
 */
export async function getTelegramChatName(chatId: string | number): Promise<string | null> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getChat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    const result = await response.json();

    if (result?.ok && result?.result) {
      const r = result.result;
      const full = [r.first_name, r.last_name].filter(Boolean).join(" ").trim();
      return full || r.username || null;
    }
    return null;
  } catch {
    return null;
  }
}
