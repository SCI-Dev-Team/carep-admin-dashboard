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
  // allow unauthenticated in dev, but if Authorization header present enforce it
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
  // list all diseases; choose table by crop query param
  try {
    const url = new URL(request.url);
    const crop = (url.searchParams.get("crop") || "cauliflower").toLowerCase();
    const table = crop === "cucumber" ? "cucumber_diseases" : "cauliflower_diseases";
    const rows = await withPool(async (pool) => {
      const [r] = await pool.query(
        `SELECT id, disease_code, disease_en, dieseas_km, cure, symptom, reference, status FROM \`${table}\` ORDER BY id ASC`
      );
      return r;
    });
    return NextResponse.json(rows);
  } catch (err) {
    console.error("cauli GET error", err);
    return new Response("DB error", { status: 500 });
  }
}

export async function POST(request: Request) {
  // create
  if (requiresAuth(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const url = new URL(request.url);
    const crop = (url.searchParams.get("crop") || "cauliflower").toLowerCase();
    const table = crop === "cucumber" ? "cucumber_diseases" : "cauliflower_diseases";
    const body = await request.json();
    const { id, disease_code, disease_en, dieseas_km, cure, symptom, reference, status } = body;
    await withPool(async (pool) => {
      await pool.query(
        `INSERT INTO \`${table}\` (id, disease_code, disease_en, dieseas_km, cure, symptom, reference, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, disease_code, disease_en, dieseas_km, cure, symptom, reference, status ?? 1]
      );
    });
    return new Response("Created", { status: 201 });
  } catch (err) {
    console.error("cauli POST error", err);
    return new Response("DB error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  // update
  if (requiresAuth(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const url = new URL(request.url);
    const crop = (url.searchParams.get("crop") || "cauliflower").toLowerCase();
    const table = crop === "cucumber" ? "cucumber_diseases" : "cauliflower_diseases";
    const body = await request.json();
    const { id, disease_code, disease_en, dieseas_km, cure, symptom, reference, status } = body;
    await withPool(async (pool) => {
      await pool.query(
        `UPDATE \`${table}\` SET disease_code = ?, disease_en = ?, dieseas_km = ?, cure = ?, symptom = ?, reference = ?, status = ? WHERE id = ?`,
        [disease_code, disease_en, dieseas_km, cure, symptom, reference, status ?? 1, id]
      );
    });
    return new Response("Updated", { status: 200 });
  } catch (err) {
    console.error("cauli PUT error", err);
    return new Response("DB error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // delete by id in query ?id=#
  if (requiresAuth(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const crop = (url.searchParams.get("crop") || "cauliflower").toLowerCase();
    const table = crop === "cucumber" ? "cucumber_diseases" : "cauliflower_diseases";
    if (!id) return new Response("Missing id", { status: 400 });
    await withPool(async (pool) => {
      await pool.query(`DELETE FROM \`${table}\` WHERE id = ?`, [id]);
    });
    return new Response("Deleted", { status: 200 });
  } catch (err) {
    console.error("cauli DELETE error", err);
    return new Response("DB error", { status: 500 });
  }
}


