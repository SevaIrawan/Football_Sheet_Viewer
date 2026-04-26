"use client";

import { MatchViewer } from "@/components/MatchViewer";

/**
 * Result viewer (bookmark Summary/Line-up/Statistics/Table).
 * Dipisahkan supaya nanti mudah optimasi tanpa ganggu Schedule.
 */
export function ResultViewer() {
  return <MatchViewer />;
}

