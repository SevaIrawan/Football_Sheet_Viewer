"use client";

import { CalendarDays, Trophy } from "lucide-react";
import { useState } from "react";
import { MatchViewer } from "@/components/MatchViewer";

type MainPage = "schedule" | "result";

function SchedulePlaceholder() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden px-2 pb-1 pt-2 sm:px-2.5">
      <header className="mb-3 shrink-0 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0c1220] px-3 py-3.5 sm:px-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] sm:h-14 sm:w-14">
          <CalendarDays className="h-6 w-6 text-amber-400/90 sm:h-7 sm:w-7" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-bold text-white sm:text-lg">Schedule</h1>
          <p className="truncate text-xs text-slate-500">Jadwal pertandingan</p>
        </div>
      </header>

      <article className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12151c] px-4 py-10 text-center shadow-lg shadow-black/20 sm:px-6">
        <p className="text-base font-semibold text-white">Coming soon</p>
        <p className="mx-auto mt-3 max-w-[min(100%,260px)] text-sm leading-relaxed text-slate-500">
          Halaman jadwal sedang disiapkan. Konten dari sheet akan tampil di sini.
        </p>
      </article>
    </div>
  );
}

export function MainShell() {
  const [page, setPage] = useState<MainPage>("result");

  return (
    <div className="shorts-safe-gutter box-border flex min-h-0 h-[100dvh] w-full flex-col bg-[#030508]">
      <div
        className="mx-auto flex min-h-0 w-full max-w-[min(430px,100%)] flex-1 flex-col overflow-hidden rounded-2xl border-2 border-white/[0.16] bg-[#070d14] shadow-[0_0_48px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.07)]"
        role="application"
        aria-label="Football Sheet Viewer"
      >
        <main
          id="main-content"
          className="min-h-0 flex-1 overflow-hidden"
        >
          {page === "schedule" ? <SchedulePlaceholder /> : <MatchViewer />}
        </main>

        <nav
          className="shrink-0 border-t border-white/[0.1] bg-[#0c1220]/95 px-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-2 backdrop-blur-md supports-[backdrop-filter]:bg-[#0c1220]/88 sm:px-3"
          aria-label="Pindah halaman"
        >
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage("schedule")}
              aria-current={page === "schedule" ? "page" : undefined}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition sm:py-3.5 ${
                page === "schedule"
                  ? "bg-orange-500/90 text-slate-900 shadow-md shadow-orange-500/20"
                  : "bg-white/[0.08] text-slate-300 hover:bg-white/[0.12]"
              }`}
            >
              <CalendarDays className="h-4 w-4 shrink-0 opacity-90" />
              Schedule
            </button>
            <button
              type="button"
              onClick={() => setPage("result")}
              aria-current={page === "result" ? "page" : undefined}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition sm:py-3.5 ${
                page === "result"
                  ? "bg-orange-500/90 text-slate-900 shadow-md shadow-orange-500/20"
                  : "bg-white/[0.08] text-slate-300 hover:bg-white/[0.12]"
              }`}
            >
              <Trophy className="h-4 w-4 shrink-0 opacity-90" />
              Result
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
