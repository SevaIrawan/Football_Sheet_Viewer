/** Statistik pertandingan — 6 baris tetap. Isi dari DB/API/sheet. */
export type MatchStatistics = {
  shotsOnTarget: { home: number; away: number };
  possessionPct: { home: number; away: number };
  cornerKicks: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
};

export type MatchRow = {
  league_name: string;
  league_logo_key: string;
  matchweek: string;
  home_logo_key: string;
  away_logo_key: string;
  home_name: string;
  away_name: string;
  home_score: string;
  away_score: string;
  kickoff: string;
  status: string;
  /** Opsional — dari database / API; tanpa ini bar tampil 0. */
  statistics?: MatchStatistics | null;
};
