// app/api/badges/route.ts
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
    const rows = await withPool(async (pool) => {
      const [r] = await pool.query(`SELECT id, name, name_km, slug, criteria_type, criteria_value, description, icon, created_at FROM badges ORDER BY id ASC`);
      return r;
    });
    return NextResponse.json(rows);
  } catch (err) {
    console.error("badges GET error", err);
    return new Response("DB error", { status: 500 });
  }
}

export async function POST(request: Request) {
  if (requiresAuth(request)) return new Response("Unauthorized", { status: 401 });
  try {
    const body = await request.json();
    const { name, name_km, slug, criteria_type, criteria_value, description, icon } = body;
    await withPool(async (pool) => {
      await pool.query(
        `INSERT INTO badges (name, name_km, slug, criteria_type, criteria_value, description, icon) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, name_km, slug, criteria_type, criteria_value, description, icon]
      );
    });
    return new Response("Created", { status: 201 });
  } catch (err) {
    console.error("badges POST error", err);
    return new Response("DB error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (requiresAuth(request)) return new Response("Unauthorized", { status: 401 });
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const body = await request.json();
    const { name, name_km, slug, criteria_type, criteria_value, description, icon } = body;
    if (!id) return new Response("Missing id", { status: 400 });
    await withPool(async (pool) => {
      await pool.query(
        `UPDATE badges SET name = ?, name_km = ?, slug = ?, criteria_type = ?, criteria_value = ?, description = ?, icon = ? WHERE id = ?`,
        [name, name_km, slug, criteria_type, criteria_value, description, icon, id]
      );
    });
    return new Response("Updated", { status: 200 });
  } catch (err) {
    console.error("badges PUT error", err);
    return new Response("DB error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (requiresAuth(request)) return new Response("Unauthorized", { status: 401 });
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return new Response("Missing id", { status: 400 });
    await withPool(async (pool) => {
      await pool.query(`DELETE FROM badges WHERE id = ?`, [id]);
    });
    return new Response("Deleted", { status: 200 });
  } catch (err) {
    console.error("badges DELETE error", err);
    return new Response("DB error", { status: 500 });
  }
}