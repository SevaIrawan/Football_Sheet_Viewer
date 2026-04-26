"use client";

import { useEffect, useState } from "react";

/** Opsional: `public/icons/bookmark.jpg` atau `bookmark.png` — stadion halus di atas motif `.bookmark-card-field`. */
const BOOKMARK_CANDIDATES = ["/icons/bookmark.jpg", "/icons/bookmark.png"] as const;

/**
 * Lapisan gambar di belakang konten bookmark (opacity 22%).
 * Jika tidak ada file / gagal muat → tidak render (tetap layout CSS sekarang).
 */
export function BookmarkStadiumBg() {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let index = 0;

    const tryNext = () => {
      if (cancelled || index >= BOOKMARK_CANDIDATES.length) {
        if (!cancelled && index >= BOOKMARK_CANDIDATES.length) setUrl(null);
        return;
      }
      const src = BOOKMARK_CANDIDATES[index]!;
      const img = new Image();
      img.onload = () => {
        if (!cancelled) setUrl(src);
      };
      img.onerror = () => {
        index += 1;
        tryNext();
      };
      img.src = src;
    };

    tryNext();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!url) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 rounded-lg bg-cover bg-center opacity-[0.22] sm:rounded-xl"
      style={{ backgroundImage: `url(${url})` }}
      aria-hidden
    />
  );
}
