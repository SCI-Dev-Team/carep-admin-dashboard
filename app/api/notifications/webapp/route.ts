// app/api/notifications/webapp/route.ts
// API endpoint to receive price submissions from Telegram Web App
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

// Send confirmation message back to farmer via Telegram
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

interface PriceItem {
  name: string;
  price: string;
  unit: string;
}

interface PriceSubmission {
  telegram_user_id?: number;
  telegram_user_name?: string;
  location?: string;
  notes?: string;
  prices: PriceItem[];
  init_data?: string;
}

// POST - Receive price submission from Telegram Web App (JSON form or multipart image)
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Image upload (multipart): send to GCP price-images folder if PRICE_IMAGE_UPLOAD_URL set, else store base64
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("image") as File | null;
      const telegramUserId = formData.get("telegram_user_id");
      const telegramUserName = formData.get("telegram_user_name");
      const caption = (formData.get("caption") as string) || "";
      const location = (formData.get("location") as string) || "";

      if (!file || !(file instanceof File) || file.size === 0) {
        return NextResponse.json({ error: "No image provided" }, { status: 400 });
      }
      if (!location.trim()) {
        return NextResponse.json({ error: "សូមជ្រើសរើសខេត្ត/ក្រុង (Province is required)" }, { status: 400 });
      }

      const userId = telegramUserId ? Number(telegramUserId) : 0;
      const userName = (telegramUserName as string) || "Unknown";
      const locationTrim = location.trim();
      const message = caption.trim()
        ? `📷 [Image] 📍 ${locationTrim}\n${caption.trim()}`
        : `📷 [Image] 📍 ${locationTrim}`;

      let imageUrl: string | null = null;
      let imageData: string | null = null;

      // Optional: GCP upload endpoint that saves to price-images folder and returns { path } or { url }
      const uploadUrl = process.env.PRICE_IMAGE_UPLOAD_URL?.trim();
      if (uploadUrl) {
        try {
          const forwardForm = new FormData();
          forwardForm.append("image", file);
          const res = await fetch(uploadUrl, {
            method: "POST",
            body: forwardForm,
          });
          if (!res.ok) {
            const errText = await res.text();
            console.error("Price image upload to GCP failed:", res.status, errText);
            throw new Error("Upload to server failed");
          }
          const data = (await res.json()) as { url?: string; path?: string };
          if (data.url) {
            imageUrl = data.url;
          } else if (data.path) {
            const base = uploadUrl.replace(/\/upload-price-image\/?$/, "").replace(/\/$/, "");
            imageUrl = `${base}/${data.path.startsWith("/") ? data.path.slice(1) : data.path}`;
          }
        } catch (e) {
          console.error("Price image upload error:", e);
          return NextResponse.json(
            { error: "Failed to upload image to server. Please try again." },
            { status: 502 }
          );
        }
      }

      if (!imageUrl) {
        const buf = await file.arrayBuffer();
        imageData = Buffer.from(buf).toString("base64");
      }

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
            INDEX idx_received_at (received_at)
          )
        `);
        try {
          await pool.query(`ALTER TABLE farmer_responses ADD COLUMN image_data MEDIUMTEXT`);
        } catch (e: any) {
          if (e?.code !== "ER_DUP_FIELDNAME") throw e;
        }
        try {
          await pool.query(`ALTER TABLE farmer_responses ADD COLUMN image_file_id VARCHAR(255)`);
        } catch (e: any) {
          if (e?.code !== "ER_DUP_FIELDNAME") throw e;
        }
        try {
          await pool.query(`ALTER TABLE farmer_responses ADD COLUMN image_url VARCHAR(512)`);
        } catch (e: any) {
          if (e?.code !== "ER_DUP_FIELDNAME") throw e;
        }
        try {
          await pool.query(`ALTER TABLE farmer_responses ADD COLUMN location VARCHAR(255)`);
        } catch (e: any) {
          if (e?.code !== "ER_DUP_FIELDNAME") throw e;
        }
        await pool.query(
          `INSERT INTO farmer_responses (telegram_user_id, telegram_chat_id, sender_name, message, image_data, image_url, location) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userId, userId, userName, message, imageData, imageUrl, locationTrim]
        );
      });

      if (userId) {
        const confirmationMsg = "✅ សូមអរគុណ! យើងបានទទួលរូបថតតម្លៃរបស់អ្នកហើយ។";
        await sendTelegramMessage(userId, confirmationMsg);
        await sendNotificationWithVoice(userId, confirmationMsg);
      }

      return NextResponse.json({ success: true, message: "Image submitted successfully" });
    }

    const body: PriceSubmission = await request.json();
    const { telegram_user_id, telegram_user_name, location, notes, prices } = body;

    if (!prices || prices.length === 0) {
      return NextResponse.json({ error: "No prices provided" }, { status: 400 });
    }

    // Store the price report in database
    await withPool(async (pool) => {
      // Create price_reports table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS price_reports (
          id INT AUTO_INCREMENT PRIMARY KEY,
          telegram_user_id BIGINT,
          telegram_user_name VARCHAR(255),
          location VARCHAR(255),
          notes TEXT,
          submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_reviewed BOOLEAN DEFAULT FALSE,
          INDEX idx_telegram_user_id (telegram_user_id),
          INDEX idx_submitted_at (submitted_at)
        )
      `);

      // Create price_report_items table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS price_report_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          report_id INT NOT NULL,
          vegetable_name VARCHAR(100) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          unit VARCHAR(50) NOT NULL,
          FOREIGN KEY (report_id) REFERENCES price_reports(id) ON DELETE CASCADE,
          INDEX idx_report_id (report_id)
        )
      `);

      // Insert the price report
      const [reportResult]: any = await pool.query(
        `INSERT INTO price_reports (telegram_user_id, telegram_user_name, location, notes) 
         VALUES (?, ?, ?, ?)`,
        [telegram_user_id || null, telegram_user_name || null, location || null, notes || null]
      );

      const reportId = reportResult.insertId;

      // Insert price items
      for (const item of prices) {
        await pool.query(
          `INSERT INTO price_report_items (report_id, vegetable_name, price, unit) 
           VALUES (?, ?, ?, ?)`,
          [reportId, item.name, parseFloat(item.price) || 0, item.unit]
        );
      }
    });

    // Also store as farmer_response for unified inbox view
    const pricesSummary = prices
      .map((p) => `${p.name}: ${p.price} KHR/${p.unit}`)
      .join("\n");
    
    const fullMessage = [
      "📊 Price Report",
      location ? `📍 ${location}` : "",
      "",
      pricesSummary,
      notes ? `\n📝 Notes: ${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

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
        [telegram_user_id || 0, telegram_user_id || 0, telegram_user_name || "Unknown", fullMessage]
      );
    });

    // Send confirmation to user via Telegram (Khmer) + voice
    if (telegram_user_id) {
      const locationPart = location ? ` ពី${location}` : "";
      const confirmationMsg = `✅ សូមអរគុណសម្រាប់របាយការណ៍តម្លៃ!\n\nយើងបានទទួលតម្លៃអាហារបន្លៃ ${prices.length} ប្រកាស${locationPart}។`;
      await sendTelegramMessage(telegram_user_id, confirmationMsg);
      await sendNotificationWithVoice(telegram_user_id, confirmationMsg);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Price report submitted successfully",
      items_count: prices.length 
    });
  } catch (err) {
    console.error("WebApp submission error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET - Fetch price reports for admin dashboard
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 50);

    const reports = await withPool(async (pool) => {
      // Check if table exists first
      const [tables] = await pool.query(
        `SHOW TABLES LIKE 'price_reports'`
      );
      
      if ((tables as any[]).length === 0) {
        return [];
      }

      const [rows] = await pool.query(
        `SELECT 
          pr.*,
          GROUP_CONCAT(
            CONCAT(pri.vegetable_name, ':', pri.price, ':', pri.unit) 
            SEPARATOR '||'
          ) as items
        FROM price_reports pr
        LEFT JOIN price_report_items pri ON pr.id = pri.report_id
        GROUP BY pr.id
        ORDER BY pr.submitted_at DESC
        LIMIT ?`,
        [limit]
      );

      // Parse the items
      return (rows as any[]).map((row) => ({
        ...row,
        items: row.items
          ? row.items.split("||").map((item: string) => {
              const [name, price, unit] = item.split(":");
              return { name, price: parseFloat(price), unit };
            })
          : [],
      }));
    });

    return NextResponse.json({ reports });
  } catch (err) {
    console.error("GET price reports error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
