import type { MatchRow, MatchStatistics } from "@/lib/types";

export const EMPTY_MATCH_STATISTICS: MatchStatistics = {
  shotsOnTarget: { home: 0, away: 0 },
  possessionPct: { home: 0, away: 0 },
  cornerKicks: { home: 0, away: 0 },
  fouls: { home: 0, away: 0 },
  yellowCards: { home: 0, away: 0 },
  redCards: { home: 0, away: 0 },
};

/** Mock statistik demo — Home A (menang tipis). */
export const SAMPLE_STATS_MOCK_A: MatchStatistics = {
  shotsOnTarget: { home: 8, away: 5 },
  possessionPct: { home: 58, away: 42 },
  cornerKicks: { home: 7, away: 3 },
  fouls: { home: 11, away: 9 },
  yellowCards: { home: 2, away: 1 },
  redCards: { home: 0, away: 0 },
};

/** Mock — Home B vs Away B (kalah kandang). */
export const SAMPLE_STATS_MOCK_B: MatchStatistics = {
  shotsOnTarget: { home: 3, away: 9 },
  possessionPct: { home: 44, away: 56 },
  cornerKicks: { home: 2, away: 6 },
  fouls: { home: 13, away: 10 },
  yellowCards: { home: 3, away: 2 },
  redCards: { home: 0, away: 0 },
};

/** Mock — seri 0-0. */
export const SAMPLE_STATS_MOCK_C: MatchStatistics = {
  shotsOnTarget: { home: 5, away: 5 },
  possessionPct: { home: 50, away: 50 },
  cornerKicks: { home: 4, away: 4 },
  fouls: { home: 9, away: 9 },
  yellowCards: { home: 1, away: 1 },
  redCards: { home: 0, away: 0 },
};

/** Mock — Home D (referensi layout asli). */
export const SAMPLE_STATS_HOME_D: MatchStatistics = {
  shotsOnTarget: { home: 10, away: 7 },
  possessionPct: { home: 52, away: 48 },
  cornerKicks: { home: 4, away: 1 },
  fouls: { home: 2, away: 15 },
  yellowCards: { home: 1, away: 4 },
  redCards: { home: 1, away: 0 },
};

/** Mock — kalah besar di kandang. */
export const SAMPLE_STATS_MOCK_E: MatchStatistics = {
  shotsOnTarget: { home: 4, away: 12 },
  possessionPct: { home: 41, away: 59 },
  cornerKicks: { home: 3, away: 8 },
  fouls: { home: 16, away: 7 },
  yellowCards: { home: 4, away: 1 },
  redCards: { home: 0, away: 0 },
};

/** Mock — seri 2-2. */
export const SAMPLE_STATS_MOCK_F: MatchStatistics = {
  shotsOnTarget: { home: 7, away: 7 },
  possessionPct: { home: 49, away: 51 },
  cornerKicks: { home: 5, away: 5 },
  fouls: { home: 12, away: 12 },
  yellowCards: { home: 2, away: 2 },
  redCards: { home: 0, away: 0 },
};

export function getMatchStatistics(row: MatchRow): MatchStatistics {
  if (row.statistics && typeof row.statistics === "object") {
    return row.statistics;
  }
  return EMPTY_MATCH_STATISTICS;
}
