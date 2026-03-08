/**
 * Shared TTS + Telegram voice for all notifications (dashboard, weather alerts, webhook, webapp).
 */
import { readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import FormData from "form-data";

export function stripHtmlForTTS(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Text-to-speech: Edge TTS first, then Google TTS fallback. Returns MP3 buffer or null. */
export async function textToSpeech(plainText: string): Promise<Buffer | null> {
  if (!plainText || plainText.length > 4000) return null;

  const voices = ["km-KH-SreymomNeural", "en-US-AriaNeural"];
  for (const voice of voices) {
    try {
      const { MsEdgeTTS, OUTPUT_FORMAT } = await import("edge-tts-node");
      const tmpPath = join(tmpdir(), `tts-${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`);
      const tts = new MsEdgeTTS({});
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      await tts.toFile(tmpPath, plainText);
      const buffer = await readFile(tmpPath);
      await unlink(tmpPath).catch(() => {});
      return buffer;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const cause = err instanceof Error && (err as Error & { cause?: unknown }).cause;
      if (voice === voices[voices.length - 1]) {
        console.warn("TTS (Edge) failed, trying Google fallback:", msg, cause ?? "");
      }
    }
  }

  try {
    const getAudioUrl = (await import("google-tts-api")).getAudioUrl;
    const text = plainText.slice(0, 200);
    if (!text.trim()) return null;
    const url = getAudioUrl(text, { lang: "km", slow: false });
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TTS-Bot/1.0)" },
    });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("TTS (Google fallback) error:", msg);
    return null;
  }
}

/** Send voice/audio to Telegram (sendAudio). chatId can be string or number. */
export async function sendTelegramAudio(
  chatId: string | number,
  audioBuffer: Buffer,
  filename: string
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return false;
  try {
    const form = new FormData();
    form.append("chat_id", String(chatId));
    form.append("audio", audioBuffer, { filename, contentType: "audio/mpeg" });
    const bodyBuffer = form.getBuffer();
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendAudio`, {
      method: "POST",
      headers: form.getHeaders(),
      body: new Uint8Array(bodyBuffer),
    });
    const result = await response.json();
    if (!result.ok) {
      console.error("Telegram sendAudio error:", result);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Failed to send Telegram audio:", error);
    return false;
  }
}

/** Generate TTS for message and send as voice to chatId. No-op if TTS fails. */
export async function sendNotificationWithVoice(chatId: string | number, message: string): Promise<void> {
  const plain = stripHtmlForTTS(message);
  const buffer = await textToSpeech(plain);
  if (buffer) await sendTelegramAudio(chatId, buffer, "voice.mp3");
}
