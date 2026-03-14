#!/usr/bin/env node
/**
 * Run on your GCP instance to receive price images from the Vercel webapp and save
 * them to a "price-images" folder. The dashboard (Vercel) will forward uploads here.
 *
 * Usage on GCP:
 *   1. Create folder: mkdir -p /path/to/cucumber-tele-bot/price-images
 *   2. Set port: export PORT=9001
 *   3. Run: node scripts/price-image-upload-server.js
 *   4. Open firewall for tcp:9001
 *   5. In Vercel env set: PRICE_IMAGE_UPLOAD_URL=http://YOUR_GCP_IP:9001/upload-price-image
 *
 * Expects: POST /upload-price-image with multipart form field "image".
 * Returns: JSON { path: "price-images/<filename>" }
 * Serves: GET /price-images/<filename> for viewing.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 9001;
const DIR = process.env.PRICE_IMAGES_DIR || path.join(__dirname, "..", "price-images");

function ensureDir() {
  if (!fs.existsSync(DIR)) {
    fs.mkdirSync(DIR, { recursive: true });
  }
}

function parseMultipart(body, boundary) {
  const parts = [];
  const b = Buffer.from(`--${boundary}`);
  let i = 0;
  while (i < body.length) {
    const start = body.indexOf(b, i);
    if (start === -1) break;
    const next = body.indexOf(b, start + b.length);
    const chunk = next === -1 ? body.slice(start + b.length) : body.slice(start + b.length, next - 2);
    i = next === -1 ? body.length : next;
    const headerEnd = chunk.indexOf(Buffer.from("\r\n\r\n"));
    if (headerEnd === -1) continue;
    const headers = chunk.slice(0, headerEnd).toString();
    const nameMatch = headers.match(/name="([^"]+)"/);
    const fileMatch = headers.match(/filename="([^"]+)"/);
    const value = chunk.slice(headerEnd + 4);
    parts.push({
      name: nameMatch ? nameMatch[1] : null,
      filename: fileMatch ? fileMatch[1] : null,
      value,
    });
  }
  return parts;
}

const server = http.createServer(async (req, res) => {
  const url = req.url || "/";
  const method = req.method;

  if (method === "GET" && url.startsWith("/price-images/")) {
    const name = path.basename(url.split("?")[0]);
    if (!name || name === "price-images") {
      res.writeHead(400);
      res.end("Bad request");
      return;
    }
    const filePath = path.join(DIR, name);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(name).toLowerCase();
    const ct = ext === ".png" ? "image/png" : ext === ".gif" ? "image/gif" : ext === ".webp" ? "image/webp" : "image/jpeg";
    res.writeHead(200, { "Content-Type": ct });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  if (method === "POST" && (url === "/upload-price-image" || url === "/upload-price-image/")) {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Expected multipart/form-data" }));
      return;
    }
    const boundary = contentType.split("boundary=")[1]?.trim().replace(/[";]/g, "") || "";
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    const parts = parseMultipart(body, boundary);
    const imagePart = parts.find((p) => p.name === "image" && p.value.length > 0);
    if (!imagePart || !imagePart.value.length) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No image field" }));
      return;
    }
    ensureDir();
    const ext = path.extname(imagePart.filename || "") || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext.toLowerCase()) ? ext : ".jpg";
    const filename = `price-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`;
    const filePath = path.join(DIR, filename);
    fs.writeFileSync(filePath, imagePart.value);
    const pathUrl = `price-images/${filename}`;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ path: pathUrl }));
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

ensureDir();
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Price image upload server: http://0.0.0.0:${PORT}`);
  console.log(`  POST /upload-price-image  -> saves to ${DIR}`);
  console.log(`  GET  /price-images/<file>  -> serve file`);
});
