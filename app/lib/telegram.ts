/**
 * Shared Telegram API helpers (getChat name, etc.).
 */

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
