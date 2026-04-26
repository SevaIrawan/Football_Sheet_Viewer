/** Statistik pertandingan — 6 baris tetap. Isi dari DB/API/sheet. */
export type MatchStatistics = {
  shotsOnTarget: { home: number; away: number };
  possessionPct: { home: number; away: number };
  cornerKicks: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
};

/** Pencetak gol per sisi, siap ditulis dari sheet/API. */
export type GoalScorer = {
  team: "home" | "away";
  player: string;
  minute?: string;
};

export type GenerateVideoStatus = "PENDING" | "YES" | "DONE";

export type MatchRow = {
  league_name: string;
  league_logo_key: string;
  league_logo_url?: string;
  /** Contoh: 2025/26 */
  season?: string;
  matchweek: string;
  /** Contoh: 2026-04-26 (opsional dari sheet). */
  match_date?: string;
  home_logo_key: string;
  away_logo_key: string;
  home_logo_url?: string;
  away_logo_url?: string;
  home_name: string;
  away_name: string;
  home_score: string;
  away_score: string;
  kickoff: string;
  status: string;
  /** Kontrol pipeline render video short. */
  generate_video?: GenerateVideoStatus | string;
  /** Opsional — dari database / API; tanpa ini bar tampil 0. */
  statistics?: MatchStatistics | null;
  /** Opsional — daftar pencetak gol untuk tab Statistics. */
  goal_scorers?: GoalScorer[] | null;
};
