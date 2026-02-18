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
    
    // Get project base path
    const projectBasePath = process.env.UPLOADS_PATH?.replace('/uploads', '') ?? 
      "/home/rileywalker1303591858/cucumber-tele-bot";
    
    // Construct full file path
    let fullPath: string;
    
    if (imagePath.startsWith('uploads/')) {
      const relativePath = imagePath.substring('uploads/'.length);
      fullPath = path.join(projectBasePath, 'uploads', relativePath);
    } else if (imagePath.startsWith('/')) {
      fullPath = imagePath;
    } else {
      fullPath = path.join(projectBasePath, 'uploads', imagePath);
    }
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return new Response("Image not found", { status: 404 });
    }
    
    // Read the file
    const imageBuffer = fs.readFileSync(fullPath);
    
    // Determine content type based on file extension
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = 'image/jpeg';
    
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    
    // Return the image
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error("Error serving image:", err);
    return new Response("Error loading image", { status: 500 });
  }
}
