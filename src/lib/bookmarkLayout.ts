/**
 * Layout bookmark hasil: Statistics (6 bar + Rank) menjadi acuan tinggi minimum
 * area konten; tab lain mengikuti supaya ukuran “halaman” bookmark seragam.
 *
 * Scroll vertikal: host pakai overflow dinamis (`auto` vs `hidden`) setelah ukur
 * `scrollHeight` vs `clientHeight` — lihat `computeBookmarkYScrollNeeded`.
 */

/** Host scroll: tanpa overflow-y (ditoggle di komponen). Tanpa gaya scrollbar — supaya `hidden` benar-benar bersih. */
export const bookmarkPageScrollHostBaseClasses =
  "bookmark-page-scroll block min-h-0 w-full min-w-0 flex-1 overflow-x-hidden overscroll-y-contain";

/** Hanya dipakai bersama `overflow-y-auto` (scrollbar tipis). */
export const bookmarkPageScrollBarThumbClasses =
  "[scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600/50";

export const bookmarkPageScrollOverflowAuto = "overflow-y-auto";
export const bookmarkPageScrollOverflowHidden = "overflow-y-hidden";

/**
 * Nyalakan scroll vertikal: overflow lebih besar dari ambang ini (subpixel / border).
 * Matikan: overflow tidak lebih besar dari ambang mati — **harus** `<= ch + off`
 * supaya saat `sh === ch` tidak pernah tertahan `true` (bug `sh > ch - 2`).
 */
export const BOOKMARK_YSCROLL_ENABLE_EXTRA_PX = 8;
export const BOOKMARK_YSCROLL_DISABLE_EXTRA_PX = 1;

export function computeBookmarkYScrollNeeded(
  prev: boolean,
  scrollHeight: number,
  clientHeight: number,
): boolean {
  const sh = scrollHeight;
  const ch = clientHeight;
  if (!Number.isFinite(sh) || !Number.isFinite(ch) || ch <= 0) return false;
  if (prev) {
    return sh > ch + BOOKMARK_YSCROLL_DISABLE_EXTRA_PX;
  }
  return sh > ch + BOOKMARK_YSCROLL_ENABLE_EXTRA_PX;
}

/**
 * Min tinggi mengikuti Statistics, tapi tidak boleh melebihi tinggi area scroll —
 * `min(…rem, 100%)` cegah overflow dari min-height saja.
 */
export const bookmarkPageBodyMinClasses =
  "min-h-[min(18.5rem,100%)] sm:min-h-[min(20.5rem,100%)]";

export const bookmarkPageBodyClasses = `flex min-w-0 flex-col ${bookmarkPageBodyMinClasses}`;
