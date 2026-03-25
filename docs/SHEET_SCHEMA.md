# Skema Google Sheet — jadwal & hasil (multi-liga)

Satu **baris** = **satu pertandingan** = satu slot di urutan papan (setelah di-pagination ke grup 4).

## Opsi A: Meta liga di setiap baris (paling fleksibel)

Cocok kalau satu sheet bisa berisi banyak liga atau kamu copy-paste blok per pekan.

| Kolom | Wajib | Contoh | Keterangan |
|--------|------|--------|------------|
| `league_name` | disarankan | Premier League | Judul di header layar |
| `league_logo_key` | opsional | epl | File: `leagues/epl.png` |
| `matchweek` | opsional | 28 | Teks kecil di header |
| `home_logo_key` | disarankan | arsenal | File: `teams/arsenal.png` |
| `away_logo_key` | disarankan | chelsea | File: `teams/chelsea.png` |
| `home_name` | ya | Arsenal | Teks tampilan |
| `away_name` | ya | Chelsea | Teks tampilan |
| `home_score` | opsional | 2 | Kosong atau `-` jika belum FT |
| `away_score` | opsional | 1 | |
| `kickoff` | opsional | 2025-03-24 20:00 | Jadwal / status |
| `status` | opsional | FT / LIVE / NS | NS = not started |

**Urutan baris** = urutan tampilan global: baris 1–4 → layar 1, baris 5–8 → layar 2, …

## Opsi B: Satu sheet per pekan per liga

Baris pertama (atau sheet terpisah `Meta`) hanya berisi:

- `league_name`, `league_logo_key`, `season`, `date_from`, `date_to`

Baris berikutnya hanya kolom pertandingan (`home_*`, `away_*`, skor, dll.) tanpa ulang `league_name` — bisa diisi app dari meta sekali.

## Konvensi file logo

- Tim: `public/logos/teams/{home_logo_key}.png` (atau `.webp`).
- Liga: `public/logos/leagues/{league_logo_key}.png`.
- Fallback jika file tidak ada: inisial atau placeholder abu-abu.

## Pagination (implementasi nanti)

- `pageSize = 4`
- `page = 0` → slice baris `[0..3]`, `page = 1` → `[4..7]`, …
- Tombol Next: `page + 1` sampai habis data; Prev: `page - 1`.

## Niche lain (contoh: harga emas)

Pola sama: **satu baris** = **satu “papan”** atau **satu tanggal**; kolom berbeda (tanggal, harga beli, harga jual, sumber). Template UI beda file/proyek, konsep Sheet → refresh → rekam tetap sama.
