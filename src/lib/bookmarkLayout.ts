/**
 * Layout bookmark hasil: Statistics (6 bar + League rank) menjadi acuan tinggi minimum
 * area konten; tab lain mengikuti supaya ukuran “halaman” bookmark seragam.
 *
 * Scroll vertikal hanya pada lapisan `.bookmark-page-scroll` di MatchPanel —
 * bukan pada header, papan skor, atau caption.
 */
export const bookmarkPageScrollClasses =
  "bookmark-page-scroll flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600/50";

/** ≈ tinggi natural MatchStatisticsBars (7 baris grid + border). */
export const bookmarkPageBodyMinClasses =
  "min-h-[18.5rem] sm:min-h-[20.5rem]";

export const bookmarkPageBodyClasses = `flex min-w-0 flex-1 flex-col ${bookmarkPageBodyMinClasses}`;
