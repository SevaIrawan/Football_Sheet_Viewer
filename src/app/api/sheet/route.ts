import { NextResponse } from "next/server";
import { SAMPLE_MATCHES } from "@/data/sample-matches";
import { parseMatchesCsv } from "@/lib/csvToMatches";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.SHEET_CSV_URL?.trim();

  if (!url) {
    return NextResponse.json({
      rows: SAMPLE_MATCHES,
      source: "sample" as const,
    });
  }

  try {
    const res = await fetch(url, {
      next: { revalidate: 0 },
      headers: { Accept: "text/csv,*/*" },
    });
    if (!res.ok) {
      return NextResponse.json(
        {
          rows: SAMPLE_MATCHES,
          source: "sample" as const,
          error: `Gagal fetch sheet: HTTP ${res.status}`,
        },
        { status: 200 },
      );
    }
    const text = await res.text();
    const rows = parseMatchesCsv(text);
    if (rows.length === 0) {
      return NextResponse.json({
        rows: SAMPLE_MATCHES,
        source: "sample" as const,
        error: "CSV tidak berisi baris pertandingan yang valid.",
      });
    }
    return NextResponse.json({ rows, source: "sheet" as const });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({
      rows: SAMPLE_MATCHES,
      source: "sample" as const,
      error: message,
    });
  }
}
