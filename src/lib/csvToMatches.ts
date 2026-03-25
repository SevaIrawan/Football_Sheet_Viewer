import Papa from "papaparse";
import type { MatchRow } from "@/lib/types";

/** Kolom sheet CSV (bukan objek `statistics` — itu dari API/DB). */
type MatchRowCsvKey = Exclude<keyof MatchRow, "statistics">;

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
  matchweek: "matchweek",
  pekan: "matchweek",
  gw: "matchweek",
  home_logo_key: "home_logo_key",
  homelogo: "home_logo_key",
  away_logo_key: "away_logo_key",
  awaylogo: "away_logo_key",
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
};

function emptyRow(): MatchRow {
  return {
    league_name: "",
    league_logo_key: "",
    matchweek: "",
    home_logo_key: "",
    away_logo_key: "",
    home_name: "",
    away_name: "",
    home_score: "",
    away_score: "",
    kickoff: "",
    status: "",
  };
}

function recordToMatch(row: Record<string, string>): MatchRow {
  const out = emptyRow();
  for (const [rawKey, value] of Object.entries(row)) {
    const nk = normalizeHeaderKey(rawKey);
    const field = FIELD_ALIASES[nk];
    if (field) {
      out[field] = (value ?? "").trim();
    }
  }
  return out;
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
