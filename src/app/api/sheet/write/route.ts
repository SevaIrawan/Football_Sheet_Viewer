import { NextResponse } from "next/server";
import { isGoogleSheetsApiConfigured, updateSheetRange } from "@/lib/googleSheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WriteBody = {
  range?: string;
  values?: unknown;
};

function isRowsMatrix(v: unknown): v is (string | number | null | undefined)[][] {
  if (!Array.isArray(v)) return false;
  return v.every(
    (row) =>
      Array.isArray(row) &&
      row.every(
        (cell) =>
          cell === null ||
          cell === undefined ||
          typeof cell === "string" ||
          typeof cell === "number",
      ),
  );
}

/**
 * Tulis ke Google Sheet (otomasi / worker). Wajib env `SHEET_WRITE_SECRET` + header sama.
 */
export async function POST(req: Request) {
  const secret = process.env.SHEET_WRITE_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "Route nonaktif: set SHEET_WRITE_SECRET di .env." },
      { status: 503 },
    );
  }
  if (req.headers.get("x-sheet-write-secret") !== secret) {
    return NextResponse.json({ error: "Tidak sah." }, { status: 401 });
  }
  if (!isGoogleSheetsApiConfigured()) {
    return NextResponse.json(
      { error: "Google Sheets API belum dikonfigurasi." },
      { status: 503 },
    );
  }

  let body: WriteBody;
  try {
    body = (await req.json()) as WriteBody;
  } catch {
    return NextResponse.json({ error: "Body bukan JSON." }, { status: 400 });
  }

  const range = body.range?.trim();
  if (!range) {
    return NextResponse.json({ error: "Field `range` wajib (notasi A1)." }, { status: 400 });
  }
  if (!isRowsMatrix(body.values)) {
    return NextResponse.json(
      { error: "Field `values` wajib berupa matriks (array of array) string/number." },
      { status: 400 },
    );
  }

  try {
    await updateSheetRange(range, body.values);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
