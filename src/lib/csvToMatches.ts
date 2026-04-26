import Papa from "papaparse";
import type { GoalScorer, MatchRow, MatchStatistics } from "@/lib/types";

/** Kolom sheet CSV (bukan objek `statistics` — itu dari API/DB). */
type MatchRowCsvKey = Exclude<
  keyof MatchRow,
  "statistics" | "goal_scorers" | "home_goal_scorers_text" | "away_goal_scorers_text"
>;

function normalizeHeaderKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

/** Alias header sheet → field internal */
const FIELD_ALIASES: Record<string, MatchRowCsvKey> = {
  league_name: "league_name",
  leaguename: "league_name",
  liga: "league_name",
  league_logo_key: "league_logo_key",
  leaguelogo: "league_logo_key",
  league_logo_url: "league_logo_url",
  leagueurl: "league_logo_url",
  season: "season",
  musim: "season",
  matchweek: "matchweek",
  pekan: "matchweek",
  gw: "matchweek",
  match_date: "match_date",
  date: "match_date",
  tanggal: "match_date",
  home_logo_key: "home_logo_key",
  homelogo: "home_logo_key",
  home_logo_url: "home_logo_url",
  homeurl: "home_logo_url",
  away_logo_key: "away_logo_key",
  awaylogo: "away_logo_key",
  away_logo_url: "away_logo_url",
  awayurl: "away_logo_url",
  home_name: "home_name",
  homename: "home_name",
  home: "home_name",
  away_name: "away_name",
  awayname: "away_name",
  away: "away_name",
  home_score: "home_score",
  homescore: "home_score",
  away_score: "away_score",
  awayscore: "away_score",
  kickoff: "kickoff",
  jadwal: "kickoff",
  status: "status",
  generate_video: "generate_video",
  /** Alias header sheet (sama isi dengan `generate_video`). */
  video_generate: "generate_video",
  /** Standing: satu nama header sheet kanonik (normalisasi → snake_case). */
  home_league_rank: "home_league_rank",
  away_league_rank: "away_league_rank",
};

function emptyRow(): MatchRow {
  return {
    league_name: "",
    league_logo_key: "",
    league_logo_url: "",
    matchweek: "",
    home_logo_key: "",
    away_logo_key: "",
    home_logo_url: "",
    away_logo_url: "",
    home_name: "",
    away_name: "",
    home_score: "",
    away_score: "",
    kickoff: "",
    status: "",
  };
}

/** Satu kunci snake_case per kolom — sama logika dengan header CSV / baris 1 grid Sheets. */
function normalizeRecordKeys(row: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    const nk = normalizeHeaderKey(k);
    if (!nk) continue;
    out[nk] = v === undefined || v === null ? "" : String(v).trim();
  }
  return out;
}

function recordToMatch(row: Record<string, string>): MatchRow {
  const r = normalizeRecordKeys(row);
  const out = emptyRow();
  for (const [nk, value] of Object.entries(r)) {
    const field = FIELD_ALIASES[nk];
    if (field) {
      out[field] = value;
    }
  }
  out.statistics = parseStatistics(r);
  out.goal_scorers = parseGoalScorers(r);
  const hgs = readFirst(r, ["home_goal_scorers", "home_scorers"]);
  const ags = readFirst(r, ["away_goal_scorers", "away_scorers"]);
  if (hgs) out.home_goal_scorers_text = hgs;
  if (ags) out.away_goal_scorers_text = ags;
  out.generate_video = normalizeGenerateVideoStatus(
    readFirst(r, ["generate_video", "video_generate"]),
  );
  /** Standing — kolom sheet `home_league_rank` / `away_league_rank` (sumber kanonik). */
  const homeRank = readFirst(r, ["home_league_rank"]);
  const awayRank = readFirst(r, ["away_league_rank"]);
  if (homeRank) out.home_league_rank = homeRank;
  if (awayRank) out.away_league_rank = awayRank;
  return out;
}

function normalizeGenerateVideoStatus(value: string): string {
  const v = value.trim().toUpperCase();
  if (v === "YES" || v === "PENDING" || v === "DONE") return v;
  return v;
}

function readFirst(row: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    const nk = normalizeHeaderKey(k);
    const v = row[nk];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return "";
}

function parseIntSafe(value: string): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^\d-]/g, "");
  if (!cleaned) return null;
  const n = Number.parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : null;
}

function parsePairText(value: string): { home: number; away: number } | null {
  if (!value) return null;
  const m = value.match(/(-?\d+)\s*[-:\/]\s*(-?\d+)/);
  if (!m) return null;
  const home = Number.parseInt(m[1] ?? "", 10);
  const away = Number.parseInt(m[2] ?? "", 10);
  if (!Number.isFinite(home) || !Number.isFinite(away)) return null;
  return { home, away };
}

function readStatPair(
  row: Record<string, string>,
  homeKeys: string[],
  awayKeys: string[],
  pairKeys: string[],
): { home: number; away: number } | null {
  const homeRaw = readFirst(row, homeKeys);
  const awayRaw = readFirst(row, awayKeys);
  const home = parseIntSafe(homeRaw);
  const away = parseIntSafe(awayRaw);
  if (home != null && away != null) return { home, away };

  const pairRaw = readFirst(row, pairKeys);
  return parsePairText(pairRaw);
}

function parseStatistics(row: Record<string, string>): MatchStatistics | null {
  const shots = readStatPair(
    row,
    ["shots_on_target_home", "shot_on_target_home", "sot_home"],
    ["shots_on_target_away", "shot_on_target_away", "sot_away"],
    ["shots_on_target", "shot_on_target", "sot"],
  );
  const possession = readStatPair(
    row,
    ["possession_pct_home", "possession_home"],
    ["possession_pct_away", "possession_away"],
    ["possession_pct", "possession"],
  );
  const corners = readStatPair(
    row,
    ["corner_kicks_home", "corners_home", "corner_home"],
    ["corner_kicks_away", "corners_away", "corner_away"],
    ["corner_kicks", "corners", "corner"],
  );
  const fouls = readStatPair(
    row,
    ["fouls_home", "foul_home"],
    ["fouls_away", "foul_away"],
    ["fouls", "foul"],
  );
  const yellow = readStatPair(
    row,
    ["yellow_cards_home", "yellow_home"],
    ["yellow_cards_away", "yellow_away"],
    ["yellow_cards", "yellow"],
  );
  const red = readStatPair(
    row,
    ["red_cards_home", "red_home"],
    ["red_cards_away", "red_away"],
    ["red_cards", "red"],
  );

  const hasAny = shots || possession || corners || fouls || yellow || red;
  if (!hasAny) return null;

  return {
    shotsOnTarget: shots ?? { home: 0, away: 0 },
    possessionPct: possession ?? { home: 0, away: 0 },
    cornerKicks: corners ?? { home: 0, away: 0 },
    fouls: fouls ?? { home: 0, away: 0 },
    yellowCards: yellow ?? { home: 0, away: 0 },
    redCards: red ?? { home: 0, away: 0 },
  };
}

function parseSideScorers(text: string, team: "home" | "away"): GoalScorer[] {
  if (!text) return [];
  return text
    .split(/[|;\n]+/g)
    .flatMap((chunk) => chunk.split(/\s*,\s*/))
    .map((s) => s.trim())
    .filter(Boolean)
    .map((token) => {
      const minuteMatch = token.match(/(\d{1,3}(?:\+\d{1,2})?)\s*'?/);
      const minute = minuteMatch?.[1]?.trim();
      const player = token
        .replace(/(\d{1,3}(?:\+\d{1,2})?)\s*'?/g, "")
        .replace(/^[-:,\s]+|[-:,\s]+$/g, "")
        .trim();
      return {
        team,
        player,
        minute,
      };
    })
    .filter((x) => x.player.length > 0);
}

function parseCombinedScorers(text: string): GoalScorer[] {
  if (!text) return [];
  return text
    .split(/[|;\n]+/g)
    .flatMap((chunk) => chunk.split(/\s*,\s*/))
    .map((s) => s.trim())
    .filter(Boolean)
    .map((token) => {
      const normalized = token.trim();
      const sideMatch = normalized.match(/^(home|h|away|a)\s*[:\-]\s*/i);
      const teamRaw = sideMatch?.[1]?.toLowerCase();
      const team: "home" | "away" =
        teamRaw === "away" || teamRaw === "a" ? "away" : "home";
      const body = normalized.replace(/^(home|h|away|a)\s*[:\-]\s*/i, "").trim();
      const minuteMatch = body.match(/(\d{1,3}(?:\+\d{1,2})?)\s*'?/);
      const minute = minuteMatch?.[1]?.trim();
      const player = body
        .replace(/(\d{1,3}(?:\+\d{1,2})?)\s*'?/g, "")
        .replace(/^[-:,\s]+|[-:,\s]+$/g, "")
        .trim();
      return { team, player, minute };
    })
    .filter((x) => x.player.length > 0);
}

function parseGoalScorers(row: Record<string, string>): GoalScorer[] | null {
  // Format utama yang disepakati: 2 kolom terpisah per sisi.
  const homeText = readFirst(row, ["home_goal_scorers", "home_scorers"]);
  const awayText = readFirst(row, ["away_goal_scorers", "away_scorers"]);
  // Fallback kompatibilitas lama (opsional).
  const combined = readFirst(row, ["goal_scorers", "scorers"]);

  const out: GoalScorer[] = [
    ...parseSideScorers(homeText, "home"),
    ...parseSideScorers(awayText, "away"),
    ...parseCombinedScorers(combined),
  ];

  return out.length > 0 ? out : null;
}

export function parseMatchesCsv(text: string): MatchRow[] {
  const clean = text.replace(/^\uFEFF/, "");
  const parsed = Papa.parse<Record<string, string>>(clean, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => normalizeHeaderKey(h),
  });

  if (parsed.errors.length > 0 && !parsed.data?.length) {
    throw new Error(parsed.errors.map((e) => e.message).join("; "));
  }

  const rows: MatchRow[] = [];
  for (const raw of parsed.data) {
    if (!raw || typeof raw !== "object") continue;
    const m = recordToMatch(raw);
    if (!m.home_name && !m.away_name) continue;
    rows.push(m);
  }
  return rows;
}

/**
 * Baris pertama = header (sama seperti CSV), baris berikutnya = data.
 * Dipakai Google Sheets API `values.get` (matriks string).
 */
export function parseMatchesGrid(grid: string[][]): MatchRow[] {
  if (!grid.length) return [];
  const headerCells = grid[0]!.map((h) => String(h ?? ""));
  const headers = headerCells.map((h) => normalizeHeaderKey(h));
  const rows: MatchRow[] = [];
  for (let i = 1; i < grid.length; i++) {
    const cells = grid[i] ?? [];
    const record: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c]!;
      if (!key) continue;
      const raw = cells[c];
      record[key] =
        raw === null || raw === undefined ? "" : String(raw).trim();
    }
    const m = recordToMatch(record);
    if (!m.home_name && !m.away_name) continue;
    rows.push(m);
  }
  return rows;
}
