// app/api/images/route.ts
import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

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
  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;
  return user !== ADMIN_USER || pass !== ADMIN_PASS;
}

/** Get path relative to uploads dir from any format (uploads/..., /app/uploads/..., or 2026/02/25/file.jpg). */
function getRelativeImagePath(imageFile: string): string | null {
  if (!imageFile || typeof imageFile !== "string") return null;
  const trimmed = imageFile.trim();
  if (!trimmed) return null;
  // Already relative: "uploads/2026/02/25/file.jpg" or "2026/02/25/file.jpg"
  if (trimmed.includes("uploads/")) {
    const after = trimmed.split("uploads/")[1];
    return after ? after.replace(/^\/+/, "") : null;
  }
  if (trimmed.startsWith("/")) {
    const parts = trimmed.split("/").filter(Boolean);
    const idx = parts.indexOf("uploads");
    return idx >= 0 ? parts.slice(idx + 1).join("/") : parts.join("/");
  }
  return trimmed;
}

function validateImageFile(imageFile: string, projectBasePath: string): boolean {
  const relativePath = getRelativeImagePath(imageFile);
  if (!relativePath) return false;
  const fullPath = path.join(projectBasePath, "uploads", relativePath);
  try {
    return fs.existsSync(fullPath) && fs.statSync(fullPath).isFile();
  } catch (err) {
    console.error("Error validating image file:", imageFile, "resolved:", fullPath, err);
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit") || "50";
    const offset = url.searchParams.get("offset") || "0";
    const labelFilter = url.searchParams.get("label");
    
    // Use project base path instead of uploads path
    const projectBasePath = process.env.UPLOADS_PATH?.replace('/uploads', '') ?? "/home/rileywalker1303591858/cucumber-tele-bot";
    
    const rows = await withPool(async (pool) => {
      // Simplified query without leaf_diseases table join
      let query = `
        SELECT 
          u.id, 
          u.user_id, 
          u.image_file, 
          u.image_id, 
          u.created_at, 
          u.processed, 
          u.error_message, 
          u.disease_code, 
          u.confidence,
          u.label
        FROM user_uploads u
      `;
      
      const params: any[] = [];
      
      if (labelFilter !== null) {
        query += " WHERE u.label = ?";
        params.push(labelFilter);
      }
      
      query += " ORDER BY u.created_at DESC LIMIT ? OFFSET ?";
      params.push(parseInt(limit), parseInt(offset));
      
      const [r] = await pool.query(query, params);
      return r;
    });
    
    // When UPLOADS_SERVE_URL is set, dashboard is not on the same host as uploads:
    // we can't check the filesystem, so assume exists and let the serve endpoint proxy (or 404).
    const useRemoteServe = !!process.env.UPLOADS_SERVE_URL;
    const rowsWithValidation = (rows as any[]).map((row) => ({
      ...row,
      image_exists: useRemoteServe || validateImageFile(row.image_file, projectBasePath),
      // Add placeholder disease names (will show disease_code if table doesn't exist)
      disease_name: row.disease_code || 'N/A',
      disease_name_km: null,
      username: null, // Users table doesn't have username column
    }));
    
    return NextResponse.json(rowsWithValidation);
  } catch (err) {
    console.error("images GET error", err);
    return new Response("DB error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (requiresAuth(request)) return new Response("Unauthorized", { status: 401 });
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const body = await request.json();
    const { label } = body;
    
    if (!id) return new Response("Missing id", { status: 400 });
    if (label === undefined) return new Response("Missing label", { status: 400 });
    
    await withPool(async (pool) => {
      await pool.query(
        `UPDATE user_uploads SET label = ? WHERE id = ?`,
        [label ? 1 : 0, id]
      );
    });
    
    return new Response("Updated", { status: 200 });
  } catch (err) {
    console.error("images PUT error", err);
    return new Response("DB error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (requiresAuth(request)) return new Response("Unauthorized", { status: 401 });
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return new Response("Missing id", { status: 400 });
    
    const projectBasePath = process.env.UPLOADS_PATH?.replace('/uploads', '') ?? "/home/rileywalker1303591858/cucumber-tele-bot";
    
    await withPool(async (pool) => {
      const [rows] = await pool.query(`SELECT image_file FROM user_uploads WHERE id = ?`, [id]);
      const upload = (rows as any[])[0];
      
      if (upload && upload.image_file) {
        // Construct full path the same way as validation
        let fullPath: string;
        const imageFile = upload.image_file;
        
        if (imageFile.startsWith('uploads/')) {
          const relativePath = imageFile.substring('uploads/'.length);
          fullPath = path.join(projectBasePath, 'uploads', relativePath);
        } else if (imageFile.startsWith('/')) {
          fullPath = imageFile;
        } else {
          fullPath = path.join(projectBasePath, 'uploads', imageFile);
        }
        
        try {
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`Deleted file: ${fullPath}`);
          }
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      }
      
      await pool.query(`DELETE FROM user_uploads WHERE id = ?`, [id]);
    });
    
    return new Response("Deleted", { status: 200 });
  } catch (err) {
    console.error("images DELETE error", err);
    return new Response("DB error", { status: 500 });
  }
}
