"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MatchRow } from "@/lib/types";
import {
  AccountAvatar,
  HEADER_LOGO_MATCH_SIZE,
} from "@/components/AccountAvatar";
import { LogoImg } from "@/components/LogoImg";
import {
  hasScore,
  MatchDetailTabContent,
  MatchDetailTabNav,
  MatchScoreEmptySlide,
  MatchScoreSlide,
  SCORE_PANEL_COUNT,
  type ResultTabId,
} from "@/components/MatchPanel";

const AUTO_ADVANCE_MS = 9000;
const PAUSE_AUTO_AFTER_INTERACTION_MS = 12000;

/** Nama akun tampilan (statis) — sejajar caption pertandingan aktif */
const ACCOUNT_DISPLAY_NAME = "Alzam Pro";

type ApiResponse = {
  rows: MatchRow[];
  source: "sample" | "sheet";
  error?: string;
};

function normalizeDateText(input?: string): string {
  const raw = (input ?? "").trim();
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(d);
}

function normalizeMatchweekText(input?: string): string {
  const raw = (input ?? "").trim();
  if (!raw) return "";
  const m = raw.match(/^pekan\s*(\d+)$/i);
  if (m?.[1]) return `GW ${m[1]}`;
  return raw;
}

function headerLeagueSubtitleParts(m: MatchRow): string[] {
  const parts: string[] = [];
  const season = (m.season ?? "").trim();
  const matchweek = normalizeMatchweekText(m.matchweek);
  const dateText = normalizeDateText(m.match_date);

  if (season) parts.push(season);
  if (matchweek) parts.push(matchweek);
  if (dateText) parts.push(dateText);
  if (parts.length === 0 && m.kickoff.trim()) parts.push(m.kickoff.trim());

  return parts.length > 0 ? parts : ["\u2014"];
}

function getSlideStepPx(el: HTMLDivElement): number {
  const first = el.firstElementChild as HTMLElement | null;
  if (!first) return el.clientWidth;
  return first.offsetWidth;
}

function readActiveSlideIndex(el: HTMLDivElement): number {
  const step = getSlideStepPx(el);
  if (step <= 0) return 0;
  const idx = Math.round(el.scrollLeft / step);
  return Math.min(Math.max(0, idx), SCORE_PANEL_COUNT - 1);
}

function buildScoreSlides(results: MatchRow[]): (MatchRow | null)[] {
  const filled = results.slice(0, SCORE_PANEL_COUNT);
  const out: (MatchRow | null)[] = [...filled];
  while (out.length < SCORE_PANEL_COUNT) {
    out.push(null);
  }
  return out;
}

export function MatchViewer() {
  const [rows, setRows] = useState<MatchRow[] | null>(null);
  const [source, setSource] = useState<"sample" | "sheet" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [detailTab, setDetailTab] = useState<ResultTabId>("statistik");

  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;
  const pauseAutoRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRafRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sheet", { cache: "no-store" });
      const data = (await res.json()) as ApiResponse;
      setRows(data.rows);
      setSource(data.source);
      if (data.error) setError(data.error);
      setActiveIndex(0);
    } catch {
      setError("Gagal memuat data.");
      setRows([]);
      setSource(null);
      setActiveIndex(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const results = useMemo(
    () => (rows ?? []).filter((m) => hasScore(m)),
    [rows],
  );

  const slides = useMemo(() => buildScoreSlides(results), [results]);

  useEffect(() => {
    setDetailTab("statistik");
  }, [activeIndex]);

  const scheduleResumeAuto = useCallback(() => {
    pauseAutoRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pauseAutoRef.current = false;
      resumeTimerRef.current = null;
    }, PAUSE_AUTO_AFTER_INTERACTION_MS);
  }, []);

  const snapCarouselToIndex = useCallback((index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = getSlideStepPx(el);
    if (step <= 0) return;
    const clamped = Math.min(Math.max(0, index), SCORE_PANEL_COUNT - 1);
    el.scrollTo({ left: clamped * step, behavior: "auto" });
    setActiveIndex(clamped);
  }, []);

  useLayoutEffect(() => {
    const max = SCORE_PANEL_COUNT - 1;
    const clamped = Math.min(Math.max(0, activeIndex), max);
    if (clamped !== activeIndex) {
      setActiveIndex(clamped);
      requestAnimationFrame(() => {
        snapCarouselToIndex(clamped);
      });
    }
  }, [activeIndex, snapCarouselToIndex]);

  const syncIndexFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setActiveIndex(readActiveSlideIndex(el));
  }, []);

  const onScrollCarousel = useCallback(() => {
    if (scrollRafRef.current != null) cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      syncIndexFromScroll();
    });
  }, [syncIndexFromScroll]);

  useLayoutEffect(() => {
    if (loading) return;
    requestAnimationFrame(() => {
      snapCarouselToIndex(activeIndexRef.current);
    });
  }, [loading, snapCarouselToIndex]);

  useLayoutEffect(() => {
    if (loading) return;
    const id = requestAnimationFrame(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const idx = readActiveSlideIndex(el);
      setActiveIndex((prev) => (prev !== idx ? idx : prev));
    });
    return () => cancelAnimationFrame(id);
  }, [loading]);

  useEffect(
    () => () => {
      if (scrollRafRef.current != null) cancelAnimationFrame(scrollRafRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    },
    [],
  );

  const goToSlide = useCallback(
    (index: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      const step = getSlideStepPx(el);
      const clamped = Math.min(
        Math.max(0, index),
        SCORE_PANEL_COUNT - 1,
      );
      el.scrollTo({ left: clamped * step, behavior: "smooth" });
      setActiveIndex(clamped);
      scheduleResumeAuto();
    },
    [scheduleResumeAuto],
  );

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const id = window.setInterval(() => {
      if (pauseAutoRef.current) return;
      const el = scrollerRef.current;
      if (!el) return;
      const step = getSlideStepPx(el);
      if (step <= 0) return;
      const idx = readActiveSlideIndex(el);
      const next = (idx + 1) % SCORE_PANEL_COUNT;
      el.scrollTo({ left: next * step, behavior: "smooth" });
      setActiveIndex(next);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(id);
  }, []);

  const activeMatch = slides[activeIndex];

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden px-2 pb-1 pt-2 sm:px-2.5">
      <header className="mb-3 shrink-0 flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#0c1220] px-3 pb-3 pt-3.5 sm:gap-3 sm:px-4 sm:pb-3.5 sm:pt-4">
        {activeMatch ? (
          <LogoImg
            kind="leagues"
            logoKey={activeMatch.league_logo_key}
            label={activeMatch.league_name || "Liga"}
            className={`${HEADER_LOGO_MATCH_SIZE} rounded-full object-cover ring-2 ring-white/[0.12]`}
          />
        ) : (
          <div
            className={`${HEADER_LOGO_MATCH_SIZE} shrink-0 rounded-full border border-white/10 bg-white/[0.04] ring-2 ring-white/[0.06]`}
            aria-hidden
          />
        )}
        <div className="min-w-0 flex-1">
          <h1 className="line-clamp-2 break-words text-base font-bold leading-tight text-white sm:text-lg">
            {activeMatch
              ? activeMatch.league_name.trim() || "Liga"
              : "Football Sheet Viewer"}
          </h1>
          {activeMatch ? (
            <div className="mt-1 flex min-w-0 items-center gap-1.5 overflow-hidden">
              {headerLeagueSubtitleParts(activeMatch).map((part, idx) => (
                <div key={`${part}-${idx}`} className="flex min-w-0 items-center gap-1.5">
                  {idx > 0 ? (
                    <span className="h-1 w-1 shrink-0 rounded-full bg-brand-400/70" aria-hidden />
                  ) : null}
                  <span className="truncate rounded-full border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-slate-300 sm:text-[11px]">
                    {part}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="truncate text-xs text-slate-400">
              {source === "sample"
                ? `Papan ${activeIndex + 1} kosong — data demo`
                : source === "sheet"
                  ? `Papan ${activeIndex + 1} kosong — isi dari Sheet`
                  : `Papan ${activeIndex + 1}`}
            </p>
          )}
        </div>
        <AccountAvatar />
      </header>

      {error ? (
        <p className="mb-2 shrink-0 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          {error}
        </p>
      ) : null}

      {loading && !rows ? (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="text-sm text-slate-500">Memuat…</p>
        </div>
      ) : (
        <section
          className="result-panel-field grid min-h-0 flex-1 content-start grid-rows-[auto_auto_auto_auto] overflow-hidden rounded-2xl border border-white/[0.08]"
          aria-label="Hasil pertandingan"
        >
          {/* 2) Papan skor: logo & nama H/A, skor, caption (Full Time); geser + auto-slide; dot di bawahnya */}
          <div className="min-w-0 min-h-0 border-b border-white/[0.06] px-0 pb-2 pt-2">
            <div
              className="min-w-0 touch-pan-x"
              onTouchStart={scheduleResumeAuto}
              onPointerDown={(e) => {
                if (e.pointerType === "mouse") scheduleResumeAuto();
              }}
            >
              <div
                ref={scrollerRef}
                role="region"
                aria-roledescription="carousel"
                aria-label="Geser untuk papan skor lain"
                onScroll={onScrollCarousel}
                className="flex w-full min-w-0 snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {slides.map((m, i) => (
                  <div
                    key={
                      m
                        ? `${m.home_name}-${m.away_name}-${m.kickoff}-${i}`
                        : `empty-${i}`
                    }
                    className="box-border flex w-full min-w-0 shrink-0 grow-0 basis-full snap-start snap-always flex-col items-stretch justify-center px-2 sm:px-3"
                  >
                    {m ? (
                      <MatchScoreSlide m={m} />
                    ) : (
                      <MatchScoreEmptySlide panelNumber={i + 1} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="mt-2 flex flex-wrap items-center justify-center gap-2 px-2"
              aria-label="Indeks papan skor"
            >
              <span className="text-xs font-medium text-slate-500">
                {activeIndex + 1} / {SCORE_PANEL_COUNT}
              </span>
              <div className="flex max-w-full gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Papan skor ${i + 1}`}
                    aria-current={i === activeIndex ? "true" : undefined}
                    onClick={() => goToSlide(i)}
                    className={`h-2 w-2 shrink-0 rounded-full transition-all ${
                      i === activeIndex
                        ? "w-6 bg-brand-400"
                        : "bg-white/25 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 3) Caption pertandingan aktif (kiri) + nama akun (kanan); lalu 4 bookmark */}
          <div className="min-h-0 px-2 pt-2 sm:px-3">
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <p className="min-w-0 flex-1 text-left text-[11px] font-medium leading-snug text-slate-300">
                {activeMatch ? (
                  <span className="line-clamp-2 break-words">
                    {activeMatch.home_name}
                    <span className="font-normal text-slate-500"> vs </span>
                    {activeMatch.away_name}
                  </span>
                ) : (
                  <span className="text-slate-500">Belum ada pertandingan</span>
                )}
              </p>
              <span
                className="shrink-0 text-right text-[11px] font-bold tracking-tight text-brand-400 drop-shadow-[0_0_14px_var(--accent-glow)]"
                aria-label="Nama akun"
              >
                {ACCOUNT_DISPLAY_NAME}
              </span>
            </div>
            <MatchDetailTabNav
              activeTab={activeMatch ? detailTab : null}
              onSelect={setDetailTab}
              disabled={!activeMatch}
            />
          </div>
          <div className="h-px min-h-0 bg-white/[0.08]" aria-hidden />

          {/* 4) Card bookmark dibatasi tinggi tetap; sisa area sengaja kosong sebelum tombol bawah */}
          <div
            className="flex h-[clamp(17.5rem,44dvh,23rem)] min-h-0 min-w-0 flex-col overflow-hidden px-2 py-2 sm:h-[clamp(18.5rem,46dvh,24.5rem)] sm:px-3"
            role="region"
            aria-label="Tab content"
          >
            {activeMatch ? (
              <MatchDetailTabContent tab={detailTab} match={activeMatch} />
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">
                Tambahkan skor di sheet untuk mengaktifkan tombol dan konten di papan
                ini.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
