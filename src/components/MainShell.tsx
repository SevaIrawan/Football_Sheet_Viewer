"use client";

import { CalendarDays, Trophy } from "lucide-react";
import { useState } from "react";
import { ResultViewer } from "@/components/ResultViewer";
import { ScheduleViewer } from "@/components/ScheduleViewer";

type MainPage = "schedule" | "result";

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
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          {page === "schedule" ? <ScheduleViewer /> : <ResultViewer />}
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
                  ? "bg-brand-500/92 text-slate-950 shadow-md shadow-brand-500/30"
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
                  ? "bg-brand-500/92 text-slate-950 shadow-md shadow-brand-500/30"
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
