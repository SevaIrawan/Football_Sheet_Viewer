/**
 * Viewport Puppeteer untuk UI Short 9:16 (setara area konten aman di device).
 * Sumber rasio UI: 1080×1920; viewport logic CSS ≈ lebar × tinggi device.
 *
 * Ganti `SHORTS_VIEWPORT` sebelum import skrip capture jika perlu.
 */

/** Opsi umum (mis. iPhone Pro Max–class); cocok dengan frame 9:16 + safe area. */
export const SHORTS_VIEWPORT_PRIMARY = {
  width: 430,
  height: 932,
  deviceScaleFactor: 2,
};

/** Alternatif lebih sempit. */
export const SHORTS_VIEWPORT_ALT = {
  width: 393,
  height: 852,
  deviceScaleFactor: 2,
};

/** Default skrip capture — samakan dengan konstanta di `puppeteer-short.mjs`. */
export const SHORTS_VIEWPORT = SHORTS_VIEWPORT_PRIMARY;
