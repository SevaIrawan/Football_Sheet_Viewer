import type { MatchRow } from "@/lib/types";

/**
 * Baris masuk pipeline slide/video short: nilai kolom sheet `generate_video` atau
 * `video_generate` (normalisasi ke field `generate_video`) = **YES** (case-insensitive).
 */
export function isGenerateVideoYes(
  m: Pick<MatchRow, "generate_video">,
): boolean {
  return (m.generate_video ?? "").toString().trim().toUpperCase() === "YES";
}
