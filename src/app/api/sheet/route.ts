import { NextResponse } from "next/server";
import { SAMPLE_MATCHES } from "@/data/sample-matches";
import { parseMatchesCsv, parseMatchesGrid } from "@/lib/csvToMatches";
import {
  fetchSheetValuesMatrix,
  getGoogleSheetsConfigHint,
  isGoogleSheetsApiConfigured,
} from "@/lib/googleSheets";
import { isGenerateVideoYes } from "@/lib/matchVideo";
import type { MatchRow } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function filterGenerateVideoYes(rows: MatchRow[]): MatchRow[] {
  return rows.filter((r) => isGenerateVideoYes(r));
}

type SheetSource = "sheet_api" | "sheet_csv" | "sample";

export async function GET() {
  let lastError: string | undefined;

  if (isGoogleSheetsApiConfigured()) {
    try {
      const matrix = await fetchSheetValuesMatrix();
      if (matrix && matrix.values.length > 0) {
        const parsed = parseMatchesGrid(matrix.values);
        const rows = filterGenerateVideoYes(parsed);
        if (rows.length === 0) {
          return NextResponse.json({
            rows: [],
            source: "sheet_api" as const,
            range: matrix.range,
            error:
              "Tidak ada baris dengan generate_video / video_generate = YES.",
          });
        }
        return NextResponse.json({
          rows,
          source: "sheet_api" as const,
          range: matrix.range,
        });
      }
      lastError = "Sheet API: range kosong atau tidak ada baris.";
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Sheet API error";
    }
  }

  const url = process.env.SHEET_CSV_URL?.trim();
  if (url) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 0 },
        headers: { Accept: "text/csv,*/*" },
      });
      if (!res.ok) {
        return NextResponse.json(
          {
            rows: filterGenerateVideoYes(SAMPLE_MATCHES),
            source: "sample" as const,
            error: buildFallbackError(
              lastError,
              `Gagal fetch sheet CSV: HTTP ${res.status}`,
            ),
          },
          { status: 200 },
        );
      }
      const text = await res.text();
      const rows = filterGenerateVideoYes(parseMatchesCsv(text));
      if (rows.length === 0) {
        return NextResponse.json({
          rows: [],
          source: "sheet_csv" as const,
          error: buildFallbackError(
            lastError,
            "Tidak ada baris dengan generate_video / video_generate = YES.",
          ),
        });
      }
      const hint = getGoogleSheetsConfigHint();
      return NextResponse.json({
        rows,
        source: "sheet_csv" as const,
        ...(lastError && { warning: `API tidak dipakai: ${lastError}` }),
        ...(hint && { configHint: hint }),
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      return NextResponse.json({
        rows: filterGenerateVideoYes(SAMPLE_MATCHES),
        source: "sample" as const,
        error: buildFallbackError(lastError, message),
      });
    }
  }

  return jsonSample(lastError);
}

function buildFallbackError(apiErr: string | undefined, primary: string): string {
  if (apiErr) return `${primary} (API: ${apiErr})`;
  return primary;
}

function jsonSample(apiErr?: string) {
  const hint = getGoogleSheetsConfigHint();
  const payload: {
    rows: MatchRow[];
    source: SheetSource;
    error?: string;
    warning?: string;
    configHint?: string;
  } = {
    rows: filterGenerateVideoYes(SAMPLE_MATCHES),
    source: "sample",
  };
  if (apiErr) payload.warning = `Sheet API gagal: ${apiErr}`;
  if (hint) payload.configHint = hint;
  return NextResponse.json(payload);
}
