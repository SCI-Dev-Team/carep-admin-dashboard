// app/api/notifications/route.ts
import { NextResponse } from "next/server";

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

// Send message to Telegram
async function sendTelegramMessage(
  chatId: string, 
  message: string, 
  options?: { includeWebApp?: boolean; webAppUrl?: string }
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN not configured");
    return false;
  }

  try {
    const payload: any = {
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    };

    // Add Web App button if requested (Khmer)
    if (options?.includeWebApp && options?.webAppUrl) {
      payload.reply_markup = {
        inline_keyboard: [
          [
            {
              text: "📝 ដាក់ស្នើតម្លៃ",
              web_app: { url: options.webAppUrl },
            },
          ],
        ],
      };
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    
    if (!result.ok) {
      console.error("Telegram API error:", result);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "get_farmer_leads") {
      // Get all farmer leads
      const farmers = await withPool(async (pool) => {
        const [rows] = await pool.query(`
          SELECT 
            u.user_id,
            u.gender,
            u.age_range,
            u.location,
            u.created_at,
            u.telegram_chat_id
          FROM users u
          WHERE u.role = 'farmer_lead'
          ORDER BY u.created_at DESC
        `);
        return rows;
      });

      return NextResponse.json({ farmers });
    }

    if (action === "get_all_users") {
      // Get all users (show which ones can receive notifications)
      const users = await withPool(async (pool) => {
        const [rows] = await pool.query(`
          SELECT 
            u.user_id,
            u.gender,
            u.age_range,
            u.location,
            u.role,
            u.created_at,
            u.telegram_chat_id
          FROM users u
          ORDER BY u.role DESC, u.created_at DESC
        `);
        return rows;
      });

      return NextResponse.json({ users });
    }

    if (action === "get_history") {
      const limit = Number(url.searchParams.get("limit") ?? 20);
      const offset = Number(url.searchParams.get("offset") ?? 0);
      
      const result = await withPool(async (pool) => {
        // Check if notifications table exists, create if not
        await pool.query(`
          CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            subject VARCHAR(255),
            message TEXT NOT NULL,
            sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
            INDEX idx_user_id (user_id),
            INDEX idx_sent_at (sent_at)
          )
        `);

        // Get total count
        const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM notifications`);
        const total = (countResult as any[])[0]?.total || 0;

        // Get paginated rows
        const [rows] = await pool.query(
          `SELECT * FROM notifications ORDER BY sent_at DESC LIMIT ? OFFSET ?`,
          [limit, offset]
        );
        return { history: rows, total };
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("notifications GET error", err);
    return new Response("DB error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_ids, subject, message, include_price_form } = body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json({ error: "No user IDs provided" }, { status: 400 });
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Format the message with subject
    let formattedMessage = subject 
      ? `<b>${subject}</b>\n\n${message}`
      : message;

    // Add instruction if price form is included (Khmer)
    if (include_price_form) {
      formattedMessage += "\n\n👇 ចុចប៊ូតុងខាងក្រោមដើម្បីដាក់ស្នើតម្លៃរបស់អ្នក៖";
    }

    // Build WebApp URL from environment variable or request origin
    const baseUrl = process.env.APP_URL || `${new URL(request.url).origin}`;
    const webAppUrl = `${baseUrl}/telegram-webapp`;

    const results = await withPool(async (pool) => {
      // Ensure notifications table exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          subject VARCHAR(255),
          message TEXT NOT NULL,
          sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
          INDEX idx_user_id (user_id),
          INDEX idx_sent_at (sent_at)
        )
      `);

      // Get telegram chat IDs for selected users (all users, not just farmer_leads)
      const placeholders = user_ids.map(() => "?").join(",");
      const [users] = await pool.query(
        `SELECT user_id, telegram_chat_id FROM users WHERE user_id IN (${placeholders})`,
        user_ids
      );

      const sendResults: { userId: number; status: string }[] = [];

      for (const user of users as any[]) {
        let status = "failed";
        
        // Use telegram_chat_id if available, otherwise use user_id (which is the Telegram user ID)
        const chatId = user.telegram_chat_id || user.user_id.toString();
        const success = await sendTelegramMessage(chatId, formattedMessage, {
          includeWebApp: include_price_form,
          webAppUrl: webAppUrl,
        });
        status = success ? "sent" : "failed";

        // Record the notification
        await pool.query(
          `INSERT INTO notifications (user_id, subject, message, status) VALUES (?, ?, ?, ?)`,
          [user.user_id, subject || null, message, status]
        );

        sendResults.push({ userId: user.user_id, status });
      }

      // Also record notifications for users without telegram_chat_id
      const usersWithTelegram = new Set((users as any[]).map(u => u.user_id));
      for (const userId of user_ids) {
        if (!usersWithTelegram.has(userId)) {
          await pool.query(
            `INSERT INTO notifications (user_id, subject, message, status) VALUES (?, ?, ?, 'failed')`,
            [userId, subject || null, message]
          );
          sendResults.push({ userId, status: "failed" });
        }
      }

      return sendResults;
    });

    const sentCount = results.filter((r) => r.status === "sent").length;
    const failedCount = results.filter((r) => r.status === "failed").length;

    return NextResponse.json({
      success: true,
      sent_count: sentCount,
      failed_count: failedCount,
      results,
    });
  } catch (err) {
    console.error("notifications POST error", err);
    return new Response("Server error", { status: 500 });
  }
}
