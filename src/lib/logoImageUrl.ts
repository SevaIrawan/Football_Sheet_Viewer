/**
 * True jika string kemungkinan besar URL langsung ke aset gambar.
 * URL cuma origin (tanpa path file) → false → pakai `logoKey` di `public/logos/`.
 */
export function isLikelyDirectImageUrl(url: string): boolean {
  const t = url.trim();
  if (!t) return false;
  try {
    const u = new URL(t);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    const path = (u.pathname || "/").replace(/\/+$/, "") || "/";
    if (path === "/") return false;
    const lower = path.toLowerCase();
    if (/\.(png|webp|svg|jpe?g)(\?.*)?$/.test(lower)) return true;
    // Pola umum CDN (Flashscore, dll.) tanpa mengandalkan ekstensi di ujung path
    if (
      lower.includes("/res/image/") ||
      lower.includes("/image/data/") ||
      lower.includes("/img/")
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
