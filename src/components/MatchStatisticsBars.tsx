"use client";

import type { MatchStatistics } from "@/lib/types";

const ROWS: { key: keyof MatchStatistics; label: string }[] = [
  { key: "shotsOnTarget", label: "Shots on target" },
  { key: "possessionPct", label: "Possession (%)" },
  { key: "cornerKicks", label: "Corner kicks" },
  { key: "fouls", label: "Fouls" },
  { key: "yellowCards", label: "Yellow cards" },
  { key: "redCards", label: "Red cards" },
];

function StatBarRow({
  label,
  home,
  away,
}: {
  label: string;
  home: number;
  away: number;
}) {
  const total = home + away;
  const homeR = total > 0 ? home / total : 0;
  const awayR = total > 0 ? away / total : 0;
  const homeWins = home > away;
  const awayWins = away > home;
  const tie = home === away;

  const leftBar =
    tie ? "bg-brand-400/50" : homeWins ? "bg-brand-400" : "bg-white/18";
  const rightBar =
    tie ? "bg-brand-400/50" : awayWins ? "bg-brand-400" : "bg-white/18";

  return (
    <div className="grid w-full grid-cols-[2rem_minmax(0,1fr)_minmax(5.25rem,7.75rem)_minmax(0,1fr)_2rem] items-center gap-x-2 py-2 sm:grid-cols-[2.25rem_minmax(0,1fr)_minmax(5.75rem,8.25rem)_minmax(0,1fr)_2.25rem] sm:gap-x-2.5 sm:py-2.5">
      <span
        className={`text-right text-sm font-bold tabular-nums leading-none sm:text-base ${
          homeWins && !tie ? "text-white" : "text-slate-500"
        }`}
      >
        {home}
      </span>
      <div className="flex h-[5px] min-h-[5px] items-stretch justify-end overflow-hidden rounded-l-full bg-white/[0.08] sm:h-[6px]">
        <div
          className={`h-full max-w-full rounded-l-full ${leftBar} transition-[width] duration-500 ease-out`}
          style={{ width: `${homeR * 100}%` }}
        />
      </div>
      <span className="hyphens-auto px-0.5 text-center text-[10.5px] font-semibold leading-tight text-slate-300 [overflow-wrap:anywhere] sm:text-[11.5px]">
        {label}
      </span>
      <div className="flex h-[5px] min-h-[5px] items-stretch justify-start overflow-hidden rounded-r-full bg-white/[0.08] sm:h-[6px]">
        <div
          className={`h-full max-w-full rounded-r-full ${rightBar} transition-[width] duration-500 ease-out`}
          style={{ width: `${awayR * 100}%` }}
        />
      </div>
      <span
        className={`text-left text-sm font-bold tabular-nums leading-none sm:text-base ${
          awayWins && !tie ? "text-white" : "text-slate-500"
        }`}
      >
        {away}
      </span>
    </div>
  );
}

/** 6 rows — border/padding kartu dari `ResultBookmarkCard` (MatchPanel). */
export function MatchStatisticsBars({
  statistics,
}: {
  statistics: MatchStatistics;
}) {
  return (
    <ul
      className="flex w-full flex-col"
      lang="en"
      role="list"
      aria-label="Match statistics"
    >
      {ROWS.map(({ key, label }) => {
        const { home, away } = statistics[key];
        return (
          <li
            key={key}
            className="border-b border-white/[0.05] last:border-b-0"
          >
            <StatBarRow label={label} home={home} away={away} />
          </li>
        );
      })}
    </ul>
  );
}
