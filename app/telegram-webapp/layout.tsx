import type { Metadata, Viewport } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "ដាក់ស្នើតម្លៃអាហារបន្លៃ - CAREP",
  description: "ដាក់ស្នើតម្លៃអាហារបន្លៃតាម Telegram",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function TelegramWebAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
