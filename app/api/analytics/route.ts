import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.startsWith("Basic ")) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Analytics"' },
    });
  }

  const encoded = authHeader.split(" ")[1] || "";
  const decoded = Buffer.from(encoded, "base64").toString();
  const [user, pass] = decoded.split(":");

  const ADMIN_USER = process.env.ADMIN_USER ?? "admin";
  const ADMIN_PASS = process.env.ADMIN_PASS ?? "password";

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Analytics"' },
    });
  }

  const host = process.env.DB_HOST ?? "127.0.0.1";
  const port = Number(process.env.DB_PORT ?? 3306);
  const dbUser = process.env.DB_USER ?? "";
  const dbPassword = process.env.DB_PASSWORD ?? "";
  const database = process.env.DB_NAME ?? "";

  // dynamically import mysql2/promise so linting in environments without the
  // dependency installed won't fail during static analysis
  const mysql = await import("mysql2/promise");
  const pool = mysql.createPool({
    host,
    port,
    user: dbUser,
    password: dbPassword,
    database,
    waitForConnections: true,
    connectionLimit: 5,
  });

  try {
    // Create analytics table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT,
        event_type VARCHAR(100),
        event_data JSON,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_event_type (event_type),
        INDEX idx_timestamp (timestamp)
      )
    `);

    const [rows] = await pool.query(
      "SELECT id, user_id, event_type, event_data, timestamp FROM analytics ORDER BY id DESC LIMIT 1000"
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error("DB error", err);
    return new Response("Database error", { status: 500 });
  } finally {
    await pool.end();
  }
}


