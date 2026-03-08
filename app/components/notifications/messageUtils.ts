import type { PriceItem } from "./types";

export function parseMessageToStructured(
  msg: string
): { location: string; items: PriceItem[]; notes: string } {
  const lines = msg.split("\n").map((l) => l.trim()).filter(Boolean);
  let location = "";
  const items: PriceItem[] = [];
  let notes = "";
  let inNotes = false;

  for (const line of lines) {
    if (line.includes("Price Report") || line.includes("📊")) continue;
    if (line.startsWith("📍") || line.toLowerCase().includes("location:")) {
      location = line.replace("📍", "").replace(/location:/i, "").trim();
      continue;
    }
    if (line.toLowerCase().includes("notes:") || line.startsWith("📝")) {
      inNotes = true;
      notes = line.replace("📝", "").replace(/notes:/i, "").trim();
      continue;
    }
    if (inNotes) {
      notes += " " + line;
      continue;
    }
    const priceMatch = line.match(/^([^:]+):\s*([\d,]+)\s*(KHR|រៀល|USD|\$)?\/?(kg|g|lb|piece)?/i);
    if (priceMatch) {
      items.push({
        vegetable: priceMatch[1].trim(),
        price: priceMatch[2].replace(/,/g, ""),
        unit: priceMatch[4] || "kg",
      });
    }
  }

  return { location, items, notes: notes.trim() };
}

export function structuredToMessage(
  location: string,
  priceItems: PriceItem[],
  notes: string
): string {
  const lines: string[] = ["📊 Price Report"];
  if (location) lines.push(`📍 ${location}`);
  for (const item of priceItems) {
    if (item.vegetable && item.price) {
      lines.push(`${item.vegetable}: ${item.price} KHR/${item.unit || "kg"}`);
    }
  }
  if (notes) lines.push(`📝 Notes: ${notes}`);
  return lines.join("\n");
}

export function formatNotificationDate(dateStr?: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
