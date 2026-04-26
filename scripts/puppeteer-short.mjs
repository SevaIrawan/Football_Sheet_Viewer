/**
 * Capture halaman Short 9:16 dengan viewport tetap (Puppeteer).
 *
 * Prasyarat: `npm run dev` (atau server) jalan di URL bawah.
 *
 *   SHORTS_PAGE_URL=http://127.0.0.1:3333 npm run screenshot:short
 *
 * Viewport: default 430×932; ganti ke 393×852 dengan env VIEWPORT=alt
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SHORTS_VIEWPORT_ALT,
  SHORTS_VIEWPORT_PRIMARY,
} from "./shorts-viewport.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "screenshots");
const outFile = path.join(outDir, "shorts-viewport.png");

const pageUrl =
  process.env.SHORTS_PAGE_URL?.trim() || "http://127.0.0.1:3333/";

const viewport =
  process.env.VIEWPORT === "alt"
    ? SHORTS_VIEWPORT_ALT
    : SHORTS_VIEWPORT_PRIMARY;

async function main() {
  let puppeteer;
  try {
    puppeteer = (await import("puppeteer")).default;
  } catch {
    console.error(
      "Puppeteer belum terpasang. Jalankan: npm install (devDependency puppeteer).",
    );
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(viewport);
    await page.goto(pageUrl, { waitUntil: "load", timeout: 60_000 });
    await page.screenshot({ path: outFile, type: "png" });
    console.log(
      `OK: ${outFile} (${viewport.width}×${viewport.height}, dpr ${viewport.deviceScaleFactor})`,
    );
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
