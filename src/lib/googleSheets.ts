import { readFileSync } from "fs";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

function loadServiceAccountCredentials(): Record<string, unknown> | null {
  const inline = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (inline) {
    try {
      const parsed = JSON.parse(inline) as unknown;
      if (parsed && typeof parsed === "object") {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }
  const keyPath =
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE?.trim() ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (!keyPath) return null;
  try {
    const parsed = JSON.parse(readFileSync(keyPath, "utf8")) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * ID spreadsheet untuk API: env eksplisit, atau dari `SHEET_CSV_URL` bentuk
 * `.../spreadsheets/d/<ID>/...` (bukan link publish `.../d/e/2PACX-...`).
 */
export function resolveSpreadsheetId(): string | null {
  const direct = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  if (direct) return direct;
  const csv = process.env.SHEET_CSV_URL?.trim();
  if (!csv) return null;
  if (csv.includes("/spreadsheets/d/e/")) return null;
  const m = csv.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)(?:\/|\?|$)/);
  const id = m?.[1];
  if (!id || id === "e") return null;
  return id;
}

/** True jika ID sheet + kredensial service account tersedia. */
export function isGoogleSheetsApiConfigured(): boolean {
  return Boolean(resolveSpreadsheetId() && loadServiceAccountCredentials());
}

/** Pesan singkat jika kredensial/ID tidak lengkap (untuk respons API / debugging). */
export function getGoogleSheetsConfigHint(): string | null {
  const creds = loadServiceAccountCredentials();
  const id = resolveSpreadsheetId();
  if (creds && !id) {
    return "Isi GOOGLE_SHEETS_SPREADSHEET_ID dari URL edit sheet (.../spreadsheets/d/<id>/edit). Link publish bertipe .../d/e/2PACX-... tidak berisi ID untuk Sheets API.";
  }
  if (id && !creds) {
    return "Isi GOOGLE_SERVICE_ACCOUNT_KEY_FILE (path ke .json) atau GOOGLE_SERVICE_ACCOUNT_JSON.";
  }
  return null;
}

function getReadRange(): string {
  return (
    process.env.GOOGLE_SHEETS_RANGE?.trim() ||
    "A1:ZZ"
  );
}

function coerceCell(cell: unknown): string {
  if (cell === null || cell === undefined) return "";
  if (typeof cell === "object") {
    try {
      return JSON.stringify(cell);
    } catch {
      return String(cell);
    }
  }
  return String(cell).trim();
}

/** Ambil matriks nilai dari spreadsheet (baris pertama = header). */
export async function fetchSheetValuesMatrix(): Promise<{
  range: string;
  values: string[][];
} | null> {
  const spreadsheetId = resolveSpreadsheetId();
  const creds = loadServiceAccountCredentials();
  if (!spreadsheetId || !creds) return null;

  const range = getReadRange();
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  const raw = res.data.values;
  if (!raw?.length) {
    return { range, values: [] };
  }

  const values = raw.map((row) =>
    (row ?? []).map((cell) => coerceCell(cell)),
  );
  return { range, values };
}

/**
 * Tulis/replace satu range (USER_ENTERED). Dipakai worker otomasi (bukan route publik).
 * `range` harus notasi A1 lengkap jika bukan sheet pertama, mis. `Data!A2:D10`.
 */
export async function updateSheetRange(
  range: string,
  values: (string | number | null | undefined)[][],
): Promise<void> {
  const spreadsheetId = resolveSpreadsheetId();
  const creds = loadServiceAccountCredentials();
  if (!spreadsheetId || !creds) {
    throw new Error("Google Sheets API belum dikonfigurasi (ID + kredensial).");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: SCOPES,
  });
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: values.map((row) =>
        row.map((cell) => (cell === null || cell === undefined ? "" : cell)),
      ),
    },
  });
}
