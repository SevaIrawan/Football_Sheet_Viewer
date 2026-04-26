"use client";

import type { GoalScorer, MatchRow } from "@/lib/types";
import { MatchStatisticsBars } from "@/components/MatchStatisticsBars";
import { getMatchStatistics } from "@/lib/matchStatistics";
import { LogoImg } from "@/components/LogoImg";

export function hasScore(m: MatchRow): boolean {
  return (
    m.home_score.trim().length > 0 && m.away_score.trim().length > 0
  );
}

function statusSubtitle(m: MatchRow, scored: boolean): string {
  const s = m.status.trim().toUpperCase();
  if (s === "LIVE") return "Live";
  if (s === "NS" || s === "SCHEDULED") return "Belum dimulai";
  if (s === "FT" || s === "AET" || s === "PEN" || s === "FINISHED") {
    if (s === "AET") return "After Extra Time";
    if (s === "PEN") return "Penalties";
    return "Full Time";
  }
  if (scored && s) return m.status.trim();
  if (scored) return "Full Time";
  return "—";
}

/** Empat bookmark per papan skor: ikut pertandingan yang sedang aktif di carousel. */
const RESULT_TABS = [
  { id: "summary", label: "Summary" },
  { id: "lineup", label: "Line-up" },
  { id: "statistik", label: "Statistics" },
  { id: "table", label: "Table" },
] as const;

export type ResultTabId = (typeof RESULT_TABS)[number]["id"];

const BOOKMARK_SCROLL =
  "min-h-0 flex-1 overflow-y-auto overscroll-y-contain [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600/50";

/**
 * Kartu bookmark: tinggi = slot grid (bukan konten). Border tetap; isi scroll di dalam.
 */
function ResultBookmarkCard({
  noScroll = false,
  children,
}: {
  noScroll?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bookmark-card-field flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden rounded-lg border border-white/[0.08] sm:rounded-xl">
      <div
        className={`flex min-h-0 flex-1 flex-col ${noScroll ? "overflow-hidden" : BOOKMARK_SCROLL} px-2 py-2 sm:px-2.5 sm:py-2.5`}
      >
        {children}
      </div>
    </div>
  );
}

function ResultTabPlaceholder({
  tab,
  match,
}: {
  tab: ResultTabId;
  match: MatchRow;
}) {
  const { home_name: homeName, away_name: awayName } = match;
  let inner: React.ReactNode = null;
  switch (tab) {
    case "summary":
      inner = <SummaryPlaceholder />;
      break;
    case "lineup":
      inner = <LineupPlaceholder homeName={homeName} awayName={awayName} />;
      break;
    case "statistik":
      inner = (
        <div className="space-y-2">
          <MatchStatisticsBars statistics={getMatchStatistics(match)} />
          <GoalScorers scorers={match.goal_scorers} />
        </div>
      );
      break;
    case "table":
      inner = <KlasemenLongPlaceholder />;
      break;
    default:
      inner = null;
  }
  return <ResultBookmarkCard noScroll={tab === "statistik"}>{inner}</ResultBookmarkCard>;
}

type GoalScorerRow = {
  id: string;
  homeName?: string;
  minute?: string;
  awayName?: string;
};

function GoalScorers({
  scorers,
  rows,
}: {
  scorers?: GoalScorer[] | null;
  /** Nanti isi dari database; sementara tampil 5 baris kosong bila tidak ada data. */
  rows?: GoalScorerRow[];
}) {
  const fromScorers = buildGoalRows(scorers);
  const safeRows: GoalScorerRow[] = rows && rows.length > 0 ? rows : fromScorers;

  return (
    <section
      className="rounded-md border border-white/[0.04] bg-white/[0.015]"
      aria-label="Goal scorers"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.04] px-2 py-1">
        <p className="text-[11px] font-semibold tracking-wide text-slate-300">
          Goal scorers
        </p>
      </div>

      <ul className="divide-y divide-white/[0.035]" role="list">
        {safeRows.map((r) => (
          <li
            key={r.id}
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-2 px-2 py-1.5"
          >
            <span className="min-w-0 truncate text-left text-[11px] font-medium text-slate-300">
              {r.homeName ?? ""}
            </span>
            <span className="rounded-full border border-white/[0.06] bg-black/10 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-slate-400">
              {r.minute ?? ""}
            </span>
            <span className="min-w-0 truncate text-right text-[11px] font-medium text-slate-300">
              {r.awayName ?? ""}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function buildGoalRows(scorers?: GoalScorer[] | null): GoalScorerRow[] {
  if (!scorers || scorers.length === 0) {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `empty-${i}`,
      homeName: "",
      minute: "",
      awayName: "",
    }));
  }

  const home = scorers.filter((s) => s.team === "home");
  const away = scorers.filter((s) => s.team === "away");
  const maxRows = Math.max(home.length, away.length, 5);

  return Array.from({ length: maxRows }, (_, i) => {
    const h = home[i];
    const a = away[i];
    const minute =
      h?.minute && a?.minute && h.minute !== a.minute
        ? `${h.minute}/${a.minute}`
        : h?.minute ?? a?.minute ?? "";
    return {
      id: `goal-${i}`,
      homeName: h?.player ?? "",
      awayName: a?.player ?? "",
      minute,
    };
  });
}

function SummaryPlaceholder() {
  return (
    <div
      className="min-h-[12rem] rounded-md bg-white/[0.03]"
      aria-label="Summary"
    />
  );
}

function LineupPlaceholder({
  homeName,
  awayName,
}: {
  homeName: string;
  awayName: string;
}) {
  const homeXI = Array.from({ length: 11 }, (_, i) => ({
    no: i + 1,
    name: `${homeName} #${i + 1}`,
    pos: ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "FW", "FW", "FW"][i] ?? "—",
  }));
  const awayXI = Array.from({ length: 11 }, (_, i) => ({
    no: i + 1,
    name: `${awayName} #${i + 1}`,
    pos: ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "FW", "FW", "FW"][i] ?? "—",
  }));

  return (
    <div className="space-y-4 text-xs">
      <div>
        <p className="mb-1.5 font-semibold text-brand-300/90">{homeName}</p>
        <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-md bg-white/[0.02]">
          {homeXI.map((p) => (
            <li
              key={p.no}
              className="flex items-center justify-between gap-2 px-2 py-1.5"
            >
              <span className="text-slate-500">{p.no}.</span>
              <span className="min-w-0 flex-1 truncate text-slate-300">{p.name}</span>
              <span className="shrink-0 text-slate-500">{p.pos}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-1.5 font-semibold text-brand-300/90">{awayName}</p>
        <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-md bg-white/[0.02]">
          {awayXI.map((p) => (
            <li
              key={p.no}
              className="flex items-center justify-between gap-2 px-2 py-1.5"
            >
              <span className="text-slate-500">{p.no}.</span>
              <span className="min-w-0 flex-1 truncate text-slate-300">{p.name}</span>
              <span className="shrink-0 text-slate-500">{p.pos}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function KlasemenLongPlaceholder() {
  const rows = Array.from({ length: 10 }, (_, i) => ({
    pos: i + 1,
    team: `Team ${i + 1}`,
    pld: "—",
    w: "—",
    d: "—",
    l: "—",
    pts: "—",
  }));

  return (
    <>
      <div className="grid shrink-0 grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-x-2 border-b border-white/[0.06] px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
        <span className="w-6 text-center">#</span>
        <span>Team</span>
        <span className="w-6 text-center">P</span>
        <span className="w-6 text-center">W</span>
        <span className="w-6 text-center">D</span>
        <span className="w-6 text-center">L</span>
        <span className="w-7 text-center">Pts</span>
      </div>
      <ul
        className="flex flex-col gap-px"
        lang="en"
        aria-label="Standings"
      >
        {rows.map((r) => (
          <li
            key={r.pos}
            className="border-b border-white/[0.05] last:border-b-0"
          >
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] items-center gap-x-2 px-2 py-0.5 text-[11px] sm:text-[12px]">
              <span className="w-6 text-center font-medium text-slate-500">
                {r.pos}
              </span>
              <span className="truncate text-slate-300">{r.team}</span>
              <span className="w-6 text-center tabular-nums text-slate-400">
                {r.pld}
              </span>
              <span className="w-6 text-center tabular-nums text-slate-400">
                {r.w}
              </span>
              <span className="w-6 text-center tabular-nums text-slate-400">
                {r.d}
              </span>
              <span className="w-6 text-center tabular-nums text-slate-400">
                {r.l}
              </span>
              <span className="w-7 text-center font-semibold tabular-nums text-white">
                {r.pts}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Jumlah papan skor tetap di carousel (hasil). */
export const SCORE_PANEL_COUNT = 6;

/** Papan skor kosong — slot tanpa data hasil di sheet. */
export function MatchScoreEmptySlide({ panelNumber }: { panelNumber: number }) {
  return (
    <article className="score-card-field-empty w-full min-w-0 overflow-hidden rounded-2xl border border-dashed border-white/20 shadow-lg shadow-black/25">
      <div className="px-4 pb-6 pt-6 sm:px-5">
        <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Papan {panelNumber}
        </p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 sm:gap-4">
          <div className="flex min-w-0 flex-col items-center gap-3 text-center">
            <div
              className="flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] ring-2 ring-white/[0.06]"
              aria-hidden
            />
            <p className="w-full text-[13px] font-medium text-slate-500 sm:text-sm">
              —
            </p>
          </div>

          <div className="flex min-w-[5.5rem] flex-col items-center justify-center gap-1 px-1 pt-1">
            <p className="text-center text-3xl font-bold tabular-nums tracking-tight text-slate-600 sm:text-4xl">
              <span>—</span>
              <span className="mx-1.5 font-semibold text-slate-600 sm:mx-2">-</span>
              <span>—</span>
            </p>
            <p className="text-center text-xs font-medium text-slate-500">
              Kosong
            </p>
          </div>

          <div className="flex min-w-0 flex-col items-center gap-3 text-center">
            <div
              className="flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] ring-2 ring-white/[0.06]"
              aria-hidden
            />
            <p className="w-full text-[13px] font-medium text-slate-500 sm:text-sm">
              —
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Hanya papan skor — satu slide per pertandingan (carousel). */
export function MatchScoreSlide({ m }: { m: MatchRow }) {
  const subtitle = statusSubtitle(m, true);

  return (
    <article className="score-card-field w-full min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] shadow-lg shadow-black/30">
      <div className="px-3 pb-5 pt-5 sm:px-4 sm:pb-6 sm:pt-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-1.5 sm:gap-3">
          <div className="flex min-w-0 flex-col items-center gap-2 text-center sm:gap-2.5">
            <LogoImg
              kind="teams"
              logoKey={m.home_logo_key}
              logoUrl={m.home_logo_url}
              label={m.home_name}
              className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white/[0.12] sm:h-[4.25rem] sm:w-[4.25rem]"
            />
            <p className="line-clamp-2 w-full min-w-0 break-words px-0.5 text-center text-[10px] font-bold leading-snug text-white sm:text-xs">
              {m.home_name}
            </p>
          </div>

          <div className="flex min-w-[4.75rem] flex-col items-center justify-center gap-0.5 px-0.5 pt-0.5 sm:min-w-[5.25rem] sm:gap-1 sm:px-1 sm:pt-1">
            <p className="text-center text-2xl font-bold tabular-nums tracking-tight text-white sm:text-3xl md:text-4xl">
              <span>{m.home_score.trim()}</span>
              <span className="mx-1.5 font-semibold text-slate-500 sm:mx-2">-</span>
              <span>{m.away_score.trim()}</span>
            </p>
            <p className="text-center text-xs font-medium text-slate-500">
              {subtitle}
            </p>
          </div>

          <div className="flex min-w-0 flex-col items-center gap-2 text-center sm:gap-2.5">
            <LogoImg
              kind="teams"
              logoKey={m.away_logo_key}
              logoUrl={m.away_logo_url}
              label={m.away_name}
              className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white/[0.12] sm:h-[4.25rem] sm:w-[4.25rem]"
            />
            <p className="line-clamp-2 w-full min-w-0 break-words px-0.5 text-center text-[10px] font-bold leading-snug text-white sm:text-xs">
              {m.away_name}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function MatchDetailTabNav({
  activeTab,
  onSelect,
  disabled = false,
}: {
  activeTab: ResultTabId | null;
  onSelect: (id: ResultTabId) => void;
  disabled?: boolean;
}) {
  /** `justify-evenly`: jarak tepi↔tombol = jarak tombol↔tombol (seragam). */
  return (
    <nav
      className="flex w-full flex-nowrap items-end justify-evenly overflow-x-auto px-2 py-1 [scrollbar-width:none] sm:px-3 [&::-webkit-scrollbar]:hidden"
      aria-label={
        disabled
          ? "Bookmark (papan kosong)"
          : "Bookmark konten per papan skor"
      }
    >
      {RESULT_TABS.map((t) => {
        const active = !disabled && activeTab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(t.id)}
            className={`min-h-[2.75rem] shrink-0 whitespace-nowrap rounded-t-lg px-2 pb-2 pt-1.5 text-center text-xs font-semibold transition-colors sm:min-h-[3rem] sm:px-2.5 sm:text-[13px] ${
              disabled
                ? "cursor-not-allowed border-b-2 border-transparent text-slate-600 opacity-50"
                : active
                  ? "border-b-[3px] border-brand-400 text-brand-400"
                  : "border-b-2 border-transparent text-slate-500 hover:border-white/10 hover:text-slate-300"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}

export function MatchDetailTabContent({
  tab,
  match,
}: {
  tab: ResultTabId;
  match: MatchRow;
}) {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
      <ResultTabPlaceholder tab={tab} match={match} />
    </div>
  );
}

/** Kartu jadwal (belum ada skor). */
function MatchScheduleCard({ m }: { m: MatchRow }) {
  const status = m.status.trim() || "—";
  return (
    <article className="rounded-2xl border border-white/[0.08] bg-[#0f1729] p-3 shadow-lg shadow-black/40">
      <div className="mb-2 flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2">
        <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-brand-300/90">
          {status}
        </span>
        {m.kickoff ? (
          <span className="truncate text-[10px] text-slate-400">{m.kickoff}</span>
        ) : null}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
          <LogoImg
            kind="teams"
            logoKey={m.home_logo_key}
            logoUrl={m.home_logo_url}
            label={m.home_name}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-white/[0.1]"
          />
          <p className="w-full truncate text-xs font-semibold text-white">
            {m.home_name}
          </p>
        </div>

        <div className="flex min-w-[3rem] flex-col items-center justify-center px-1">
          <p className="text-sm font-bold text-slate-400">vs</p>
        </div>

        <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
          <LogoImg
            kind="teams"
            logoKey={m.away_logo_key}
            logoUrl={m.away_logo_url}
            label={m.away_name}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-white/[0.1]"
          />
          <p className="w-full truncate text-xs font-semibold text-white">
            {m.away_name}
          </p>
        </div>
      </div>
    </article>
  );
}

export function MatchPanel({ m }: { m: MatchRow }) {
  const scored = hasScore(m);
  if (scored) {
    return (
      <div className="space-y-4">
        <MatchScoreSlide m={m} />
        <p className="text-center text-xs text-slate-500">
          Buka tab Result untuk layout penuh (4 bookmark + skor + scroll konten).
        </p>
      </div>
    );
  }
  return <MatchScheduleCard m={m} />;
}
