// app/api/images/serve/route.ts
import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const imagePath = url.searchParams.get("path");

    if (!imagePath) {
      return new Response("Missing path parameter", { status: 400 });
    }

    const baseUrl = process.env.UPLOADS_SERVE_URL?.trim().replace(/\/$/, "");
    if (baseUrl) {
      // Dashboard runs on a different host (e.g. Vercel): proxy from the bot/server that has the files
      let pathPart = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
      // If the remote server was started inside uploads/ (root = uploads contents), strip "uploads/" prefix
      if (pathPart.toLowerCase().startsWith("uploads/")) pathPart = pathPart.slice(8);
      const remoteUrl = `${baseUrl}/${pathPart}`;
      try {
        const res = await fetch(remoteUrl, { cache: "no-store" });
        if (!res.ok) return new Response("Image not found", { status: 404 });
        const contentType = res.headers.get("content-type") || "image/jpeg";
        const body = await res.arrayBuffer();
        return new Response(body, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch (err) {
        console.error("Error proxying image:", remoteUrl, err);
        return new Response("Error loading image", { status: 502 });
      }
    }

    // Local filesystem: same host as the bot uploads
    const projectBasePath =
      process.env.UPLOADS_PATH?.replace(/\/uploads\/?$/, "") ??
      "/home/rileywalker1303591858/cucumber-tele-bot";

    let fullPath: string;
    if (imagePath.startsWith("uploads/")) {
      const relativePath = imagePath.substring("uploads/".length);
      fullPath = path.join(projectBasePath, "uploads", relativePath);
    } else if (imagePath.startsWith("/")) {
      fullPath = imagePath;
    } else {
      fullPath = path.join(projectBasePath, "uploads", imagePath);
    }

    if (!fs.existsSync(fullPath)) {
      return new Response("Image not found", { status: 404 });
    }

    const imageBuffer = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = "image/jpeg";
    if (ext === ".png") contentType = "image/png";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Error serving image:", err);
    return new Response("Error loading image", { status: 500 });
  }
}
