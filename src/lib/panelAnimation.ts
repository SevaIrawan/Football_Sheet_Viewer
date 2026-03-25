/**
 * Slow motion: satu papan butuh ±3 detik sampai tampil penuh.
 * Lalu jeda ±3 detik sebelum papan berikutnya mulai transisi.
 */
export const PANEL_ENTER_DURATION_MS = 3000;

/** Jeda setelah animasi papan selesai, baru papan berikut mulai */
export const PANEL_GAP_BETWEEN_MS = 3000;

/** Delay antar *mulai* animasi = durasi + jeda (ms) */
export const PANEL_STAGGER_MS =
  PANEL_ENTER_DURATION_MS + PANEL_GAP_BETWEEN_MS;
