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
      // Dashboard runs on a different host (e.g. Vercel): proxy from the bot/server that has the files.
      // Production checklist: UPLOADS_SERVE_URL set in Vercel; GCP firewall allows tcp:9000 from 0.0.0.0/0;
      // on GCP run: python3 -m http.server 9000 --bind 0.0.0.0 (from the dir that contains uploads/).
      let pathPart = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
      if (pathPart.toLowerCase().startsWith("uploads/")) pathPart = pathPart.slice(8);
      const remoteUrl = `${baseUrl}/${pathPart}`;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        const res = await fetch(remoteUrl, {
          cache: "no-store",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
          console.error("Image proxy upstream not ok:", remoteUrl, res.status);
          return new Response("Image not found", { status: 404 });
        }
        const contentType = res.headers.get("content-type") || "image/jpeg";
        const body = await res.arrayBuffer();
        return new Response(body, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const name = err instanceof Error ? err.name : "";
        const cause = err instanceof Error ? (err as Error & { cause?: { code?: string } }).cause : null;
        const code = cause && typeof cause === "object" && "code" in cause ? (cause as { code: string }).code : "";
        console.error("Image proxy failed:", remoteUrl, name, msg, code ? `(${code})` : "", cause ?? "");
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
