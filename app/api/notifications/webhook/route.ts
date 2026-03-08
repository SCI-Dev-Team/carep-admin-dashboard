// app/api/notifications/webhook/route.ts
// Telegram Webhook endpoint to receive farmer responses
import { NextResponse } from "next/server";
import { sendNotificationWithVoice } from "@/app/lib/telegram-tts";

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

// POST - Receive webhook updates from Telegram
export async function POST(request: Request) {
  try {
    const update: TelegramUpdate = await request.json();
    
    console.log("Received Telegram update:", JSON.stringify(update, null, 2));

    // Only process text messages
    if (!update.message?.text || !update.message.from) {
      return NextResponse.json({ ok: true });
    }

    const { message } = update;
    const fromUser = message.from!;
    const telegramUserId = fromUser.id;
    const chatId = message.chat.id;
    const text = message.text;
    const senderName = [fromUser.first_name, fromUser.last_name]
      .filter(Boolean)
      .join(" ") || fromUser.username || "Unknown";

    // Store the response in database
    await withPool(async (pool) => {
      // Create farmer_responses table if it doesn't exist
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

      // Insert the response
      await pool.query(
        `INSERT INTO farmer_responses (telegram_user_id, telegram_chat_id, sender_name, message) 
         VALUES (?, ?, ?, ?)`,
        [telegramUserId, chatId, senderName, text]
      );
    });

    // Send acknowledgement to farmer (Khmer) + voice
    const ackMessage = "សូមអរគុណសម្រាប់ការឆ្លើយតប! យើងបានទទួលសាររបស់អ្នកហើយ។";
    await sendTelegramMessage(chatId, ackMessage);
    await sendNotificationWithVoice(chatId, ackMessage);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    // Always return 200 to Telegram to acknowledge receipt
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

        // Add approval columns if they don't exist (for existing tables)
        try {
          await pool.query(`ALTER TABLE farmer_responses ADD COLUMN IF NOT EXISTS approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'`);
          await pool.query(`ALTER TABLE farmer_responses ADD COLUMN IF NOT EXISTS edited_message TEXT`);
          await pool.query(`ALTER TABLE farmer_responses ADD COLUMN IF NOT EXISTS approved_at DATETIME`);
        } catch (e) {
          // Columns may already exist
        }

        const whereClause = unreadOnly ? "WHERE is_read = FALSE" : "";
        const [rows] = await pool.query(
          `SELECT * FROM farmer_responses ${whereClause} ORDER BY received_at DESC LIMIT ?`,
          [limit]
        );
        return rows;
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
      actions: ["setup", "info", "get_responses", "mark_read", "mark_all_read", "approve", "reject", "edit_approve"]
    });
  } catch (err) {
    console.error("Webhook GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
