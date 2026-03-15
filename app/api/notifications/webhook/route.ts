// app/api/notifications/webhook/route.ts
// Telegram Webhook endpoint to receive farmer responses
import { NextResponse } from "next/server";
import { sendNotificationWithVoice } from "@/app/lib/telegram-tts";
import { getTelegramChatName } from "@/app/lib/telegram";

async function withPool<T>(fn: (pool: any) => Promise<T>) {
  const mysql = await import("mysql2/promise");
  const pool = mysql.createPool({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "",
    waitForConnections: true,
    connectionLimit: 5,
  });
  try {
    return await fn(pool);
  } finally {
    await pool.end();
  }
}

// Telegram Update types
interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: {
    id: number;
    type: string;
  };
  date: number;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

// Send acknowledgement message back to farmer
async function sendTelegramMessage(chatId: number, message: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN not configured");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    const result = await response.json();
    return result.ok === true;
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    return false;
  }
}

// Get file path from Telegram for a file_id (for photos sent as price response)
async function getTelegramFilePath(fileId: string): Promise<string | null> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return null;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${encodeURIComponent(fileId)}`
    );
    const data = await res.json();
    return data?.ok === true ? data.result?.file_path : null;
  } catch (e) {
    console.error("getTelegramFilePath error:", e);
    return null;
  }
}

// POST - Receive webhook updates from Telegram (text only; image submission is via Web App)
export async function POST(request: Request) {
  try {
    const update: TelegramUpdate = await request.json();
    const msg = update.message;
    if (!msg?.text || !msg?.from) return NextResponse.json({ ok: true });

    const fromUser = msg.from;
    const telegramUserId = fromUser.id;
    const chatId = msg.chat.id;
    const text = msg.text;
    const senderName = [fromUser.first_name, fromUser.last_name]
      .filter(Boolean)
      .join(" ") || fromUser.username || "Unknown";

    await withPool(async (pool) => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS farmer_responses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          telegram_user_id BIGINT NOT NULL,
          telegram_chat_id BIGINT NOT NULL,
          sender_name VARCHAR(255),
          message TEXT NOT NULL,
          received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_read BOOLEAN DEFAULT FALSE,
          INDEX idx_telegram_user_id (telegram_user_id),
          INDEX idx_received_at (received_at),
          INDEX idx_is_read (is_read)
        )
      `);
      await pool.query(
        `INSERT INTO farmer_responses (telegram_user_id, telegram_chat_id, sender_name, message) 
         VALUES (?, ?, ?, ?)`,
        [telegramUserId, chatId, senderName, text]
      );
    });

    const ackMessage = "សូមអរគុណសម្រាប់ការឆ្លើយតប! យើងបានទទួលសាររបស់អ្នកហើយ។";
    await sendTelegramMessage(chatId, ackMessage);
    await sendNotificationWithVoice(chatId, ackMessage);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}

// GET - Setup webhook or get responses
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    // Setup webhook with Telegram
    if (action === "setup") {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const webhookUrl = url.searchParams.get("webhook_url");

      if (!botToken) {
        return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not configured" }, { status: 500 });
      }

      if (!webhookUrl) {
        return NextResponse.json({ error: "webhook_url parameter required" }, { status: 400 });
      }

      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/setWebhook`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: webhookUrl,
            allowed_updates: ["message"],
          }),
        }
      );

      const result = await response.json();
      return NextResponse.json(result);
    }

    // Get webhook info
    if (action === "info") {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      
      if (!botToken) {
        return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not configured" }, { status: 500 });
      }

      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/getWebhookInfo`
      );

      const result = await response.json();
      return NextResponse.json(result);
    }

    // Serve response image: by id (from DB image_data or legacy image_file_id) or by file_id (Telegram)
    if (action === "response_image") {
      const responseId = url.searchParams.get("id");
      const fileId = url.searchParams.get("file_id");

      if (responseId) {
        const rows = await withPool(async (pool) => {
          try {
            await pool.query(`ALTER TABLE farmer_responses ADD COLUMN IF NOT EXISTS image_data MEDIUMTEXT`);
            await pool.query(`ALTER TABLE farmer_responses ADD COLUMN image_url VARCHAR(512)`);
          } catch (e: any) {
            if (e?.code !== "ER_DUP_FIELDNAME") {}
          }
          const [rows] = await pool.query(
            `SELECT image_data, image_file_id, image_url FROM farmer_responses WHERE id = ?`,
            [responseId]
          );
          return rows as any[];
        });
        const row = rows?.[0];
        if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (row.image_url) {
          const imgRes = await fetch(row.image_url);
          if (!imgRes.ok) return NextResponse.json({ error: "Image not found" }, { status: 404 });
          const blob = await imgRes.arrayBuffer();
          return new NextResponse(blob, {
            headers: {
              "Content-Type": imgRes.headers.get("content-type") || "image/jpeg",
              "Cache-Control": "private, max-age=3600",
            },
          });
        }
        if (row.image_data) {
          const buf = Buffer.from(row.image_data, "base64");
          return new NextResponse(buf, {
            headers: {
              "Content-Type": "image/jpeg",
              "Cache-Control": "private, max-age=3600",
            },
          });
        }
        if (row.image_file_id) {
          const filePath = await getTelegramFilePath(row.image_file_id);
          if (filePath && process.env.TELEGRAM_BOT_TOKEN) {
            const telegramUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;
            const imageRes = await fetch(telegramUrl);
            if (imageRes.ok) {
              const blob = await imageRes.arrayBuffer();
              return new NextResponse(blob, {
                headers: {
                  "Content-Type": imageRes.headers.get("content-type") || "image/jpeg",
                  "Cache-Control": "private, max-age=3600",
                },
              });
            }
          }
        }
        return NextResponse.json({ error: "No image" }, { status: 404 });
      }

      if (fileId) {
        const filePath = await getTelegramFilePath(fileId);
        if (!filePath) return NextResponse.json({ error: "File not found" }, { status: 404 });
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) return NextResponse.json({ error: "Bot not configured" }, { status: 500 });
        const telegramUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
        const imageRes = await fetch(telegramUrl);
        if (!imageRes.ok) return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
        const blob = await imageRes.arrayBuffer();
        return new NextResponse(blob, {
          headers: {
            "Content-Type": imageRes.headers.get("content-type") || "image/jpeg",
            "Cache-Control": "private, max-age=3600",
          },
        });
      }

      return NextResponse.json({ error: "id or file_id required" }, { status: 400 });
    }

    // Get farmer responses
    if (action === "get_responses") {
      const limit = Number(url.searchParams.get("limit") ?? 50);
      const unreadOnly = url.searchParams.get("unread_only") === "true";

      const responses = await withPool(async (pool) => {
        // Create table if not exists with approval columns
        await pool.query(`
          CREATE TABLE IF NOT EXISTS farmer_responses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            telegram_user_id BIGINT NOT NULL,
            telegram_chat_id BIGINT NOT NULL,
            sender_name VARCHAR(255),
            message TEXT NOT NULL,
            received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_read BOOLEAN DEFAULT FALSE,
            approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            edited_message TEXT,
            approved_at DATETIME,
            INDEX idx_telegram_user_id (telegram_user_id),
            INDEX idx_received_at (received_at),
            INDEX idx_is_read (is_read),
            INDEX idx_approval_status (approval_status)
          )
        `);

        // Add columns if they don't exist (for existing tables)
        try {
          await pool.query(`ALTER TABLE farmer_responses ADD COLUMN IF NOT EXISTS approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'`);
          await pool.query(`ALTER TABLE farmer_responses ADD COLUMN IF NOT EXISTS edited_message TEXT`);
          await pool.query(`ALTER TABLE farmer_responses ADD COLUMN IF NOT EXISTS approved_at DATETIME`);
          await pool.query(`ALTER TABLE farmer_responses ADD COLUMN IF NOT EXISTS image_file_id VARCHAR(255)`);
          await pool.query(`ALTER TABLE farmer_responses ADD COLUMN IF NOT EXISTS image_data MEDIUMTEXT`);
          await pool.query(`ALTER TABLE farmer_responses ADD COLUMN IF NOT EXISTS image_url VARCHAR(512)`);
        } catch (e) {
          // Columns may already exist
        }
        try {
          await pool.query(`ALTER TABLE farmer_responses ADD COLUMN image_url VARCHAR(512)`);
        } catch (e: any) {
          if (e?.code !== "ER_DUP_FIELDNAME") throw e;
        }

        const whereClause = unreadOnly ? "WHERE is_read = FALSE" : "";
        const [rows] = await pool.query(
          `SELECT id, telegram_user_id, telegram_chat_id, sender_name, message, received_at, is_read,
                  approval_status, edited_message, approved_at, image_file_id, image_url,
                  (image_data IS NOT NULL OR image_file_id IS NOT NULL OR (image_url IS NOT NULL AND image_url != '')) AS has_image
           FROM farmer_responses ${whereClause} ORDER BY received_at DESC LIMIT ?`,
          [limit]
        );
        return rows as any[];
      });

      // Resolve "Unknown" sender names from Telegram when we have telegram_user_id
      const needsResolve = (r: any) =>
        r.telegram_user_id > 0 &&
        (!r.sender_name || String(r.sender_name).trim() === "" || String(r.sender_name) === "Unknown");
      const unknownIds = [...new Set((responses as any[]).filter(needsResolve).map((r: any) => r.telegram_user_id))];
      const nameByUserId: Record<number, string> = {};
      await Promise.all(
        unknownIds.map(async (id) => {
          const name = await getTelegramChatName(id);
          if (name) nameByUserId[id] = name;
        })
      );
      (responses as any[]).forEach((r: any) => {
        if (needsResolve(r) && nameByUserId[r.telegram_user_id]) {
          r.sender_name = nameByUserId[r.telegram_user_id];
        }
      });

      return NextResponse.json({ responses });
    }

    // Mark response as read
    if (action === "mark_read") {
      const responseId = url.searchParams.get("id");
      
      if (!responseId) {
        return NextResponse.json({ error: "Response ID required" }, { status: 400 });
      }

      await withPool(async (pool) => {
        await pool.query(
          `UPDATE farmer_responses SET is_read = TRUE WHERE id = ?`,
          [responseId]
        );
      });

      return NextResponse.json({ success: true });
    }

    // Mark all as read
    if (action === "mark_all_read") {
      await withPool(async (pool) => {
        await pool.query(`UPDATE farmer_responses SET is_read = TRUE WHERE is_read = FALSE`);
      });

      return NextResponse.json({ success: true });
    }

    // Approve a response
    if (action === "approve") {
      const responseId = url.searchParams.get("id");
      
      if (!responseId) {
        return NextResponse.json({ error: "Response ID required" }, { status: 400 });
      }

      await withPool(async (pool) => {
        await pool.query(
          `UPDATE farmer_responses SET approval_status = 'approved', approved_at = NOW(), is_read = TRUE WHERE id = ?`,
          [responseId]
        );
      });

      return NextResponse.json({ success: true });
    }

    // Reject a response
    if (action === "reject") {
      const responseId = url.searchParams.get("id");
      
      if (!responseId) {
        return NextResponse.json({ error: "Response ID required" }, { status: 400 });
      }

      await withPool(async (pool) => {
        await pool.query(
          `UPDATE farmer_responses SET approval_status = 'rejected', approved_at = NOW(), is_read = TRUE WHERE id = ?`,
          [responseId]
        );
      });

      return NextResponse.json({ success: true });
    }

    // Edit and approve a response
    if (action === "edit_approve") {
      const responseId = url.searchParams.get("id");
      const editedMessage = url.searchParams.get("edited_message");
      
      if (!responseId) {
        return NextResponse.json({ error: "Response ID required" }, { status: 400 });
      }

      await withPool(async (pool) => {
        await pool.query(
          `UPDATE farmer_responses SET edited_message = ?, approval_status = 'approved', approved_at = NOW(), is_read = TRUE WHERE id = ?`,
          [editedMessage || null, responseId]
        );
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({
      message: "Webhook endpoint",
      actions: ["setup", "info", "get_responses", "response_image", "mark_read", "mark_all_read", "approve", "reject", "edit_approve"],
    });
  } catch (err) {
    console.error("Webhook GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
