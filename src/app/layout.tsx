import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Football Sheet Viewer",
  description:
    "Jadwal & hasil dari Google Sheet — UI mobile 9:16 (referensi YouTube Short 1080×1920).",
};

/** Shorts / Reels / TikTok: area aman notch & home indicator */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-dvh overflow-hidden">
      <body className="h-dvh overflow-hidden antialiased">{children}</body>
    </html>
  );
}
