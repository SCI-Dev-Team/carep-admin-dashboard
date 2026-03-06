// app/api/users/route.ts
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

function requiresAuth(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader) return false;
  if (!authHeader.startsWith("Basic ")) return true;
  const encoded = authHeader.split(" ")[1] || "";
  const decoded = Buffer.from(encoded, "base64").toString();
  const [user, pass] = decoded.split(":");
  const ADMIN_USER = process.env.ADMIN_USER ?? "admin";
  const ADMIN_PASS = process.env.ADMIN_PASS ?? "password";
  return user !== ADMIN_USER || pass !== ADMIN_PASS;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const search = url.searchParams.get("search") || "";
    const role = url.searchParams.get("role") || "";
    const limit = Number(url.searchParams.get("limit") ?? 50);
    const offset = Number(url.searchParams.get("offset") ?? 0);

    // Get top price contributors (farmer leads with most approved responses)
    if (action === "top_price_contributors") {
      const topPriceContributors = await withPool(async (pool) => {
        const [rows] = await pool.query(`
          SELECT 
            fr.telegram_user_id as user_id,
            fr.sender_name,
            u.gender,
            u.location,
            COUNT(*) as total_submissions,
            SUM(CASE WHEN fr.approval_status = 'approved' THEN 1 ELSE 0 END) as approved_submissions
          FROM farmer_responses fr
          LEFT JOIN users u ON fr.telegram_user_id = u.user_id
          GROUP BY fr.telegram_user_id, fr.sender_name, u.gender, u.location
          ORDER BY approved_submissions DESC, total_submissions DESC
          LIMIT 10
        `);
        return rows;
      });

      return NextResponse.json({ contributors: topPriceContributors });
    }

    const rows = await withPool(async (pool) => {
      let query = `
        SELECT 
          u.user_id,
          u.gender,
          u.age_range,
          u.location,
          u.created_at,
          u.role,
          COALESCE(us.images_uploaded, 0) as total_uploads,
          COALESCE(us.streak_best, 0) as best_streak
        FROM users u
        LEFT JOIN user_stats us ON u.user_id = us.user_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (search) {
        query += ` AND u.user_id LIKE ?`;
        params.push(`%${search}%`);
      }

      if (role && role !== "all") {
        query += ` AND u.role = ?`;
        params.push(role);
      }

      query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const [r] = await pool.query(query, params);
      return r;
    });

    return NextResponse.json(rows);
  } catch (err) {
    console.error("users GET error", err);
    return new Response("DB error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (requiresAuth(request)) return new Response("Unauthorized", { status: 401 });

  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("user_id");
    const body = await request.json();
    const { role } = body;

    if (!userId) return new Response("Missing user_id", { status: 400 });
    if (!role || !["normal_user", "farmer_lead"].includes(role)) {
      return new Response("Invalid role. Must be 'normal_user' or 'farmer_lead'", { status: 400 });
    }

    await withPool(async (pool) => {
      await pool.query(`UPDATE users SET role = ? WHERE user_id = ?`, [role, userId]);
    });

    return new Response("Updated", { status: 200 });
  } catch (err) {
    console.error("users PUT error", err);
    return new Response("DB error", { status: 500 });
  }
}

// Get user stats summary
export async function POST(request: Request) {
  try {
    const stats = await withPool(async (pool) => {
      const [total] = await pool.query(`SELECT COUNT(*) as count FROM users`);
      const [normalUsers] = await pool.query(`SELECT COUNT(*) as count FROM users WHERE role = 'normal_user' OR role IS NULL`);
      const [farmerLeads] = await pool.query(`SELECT COUNT(*) as count FROM users WHERE role = 'farmer_lead'`);
      
      return {
        total: total[0].count,
        normal_users: normalUsers[0].count,
        farmer_leads: farmerLeads[0].count,
      };
    });

    return NextResponse.json(stats);
  } catch (err) {
    console.error("users stats error", err);
    return new Response("DB error", { status: 500 });
  }
}
