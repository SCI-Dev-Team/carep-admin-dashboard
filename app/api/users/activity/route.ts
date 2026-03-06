// app/api/users/activity/route.ts
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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("user_id");
    const limit = Number(url.searchParams.get("limit") ?? 50);
    const offset = Number(url.searchParams.get("offset") ?? 0);

    if (!userId) {
      return new Response("Missing user_id", { status: 400 });
    }

    const result = await withPool(async (pool) => {
      // Get activities
      const [rows] = await pool.query(
        `SELECT id, user_id, event_type, event_data, timestamp 
         FROM analytics 
         WHERE user_id = ? 
         ORDER BY id DESC 
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );

      // Get total count
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM analytics WHERE user_id = ?`,
        [userId]
      );

      return {
        activities: rows,
        total: countResult[0].total,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("user activity GET error", err);
    return new Response("DB error", { status: 500 });
  }
}
