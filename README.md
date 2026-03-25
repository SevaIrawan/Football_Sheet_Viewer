# Football Sheet Viewer — ringkasan proyek

Folder ini **bukan** bagian dari Dashboard-Mobile. Isinya dokumentasi agar diskusi sebelumnya tidak perlu dijelaskan ulang saat lanjut development (bisa buka folder ini sebagai workspace Cursor terpisah).

## Tujuan

- **Template visual** untuk konten pendek (YouTube Shorts / TikTok): satu desain tetap, **isi dari data**.
- **Sumber data:** Google Sheet (mudah di-update non-dev). Isi sheet → refresh halaman web → tampilan ikut → **rekam layar** sebagai video.
- Pola yang sama bisa dipakai niche lain (harga emas harian, dll.) dengan **template + skema sheet** berbeda.

## Sepak bola — perilaku UI

| Fitur | Deskripsi |
|--------|-----------|
| **4 papan per layar** | Satu “layar” menampilkan 4 pertandingan (papan 1–4). |
| **Mapping baris ↔ papan** | Halaman 1 = **baris 1–4** di sheet. Halaman 2 = **baris 5–8**, dst. |
| **Tombol Next** (dan idealnya **Prev**) | Pagination: geser ke batch 4 pertandingan berikutnya. |
| **Satu pekan** | Banyak baris dalam satu sheet (atau filter matchweek); semua jadwal/hasil pekan itu bisa di-pagination. |
| **Liga apa saja** | Semua identitas dari data: **judul liga**, **logo liga**, **logo tim**, **nama tim**, **skor** (hasil). Ganti liga = ganti isi sheet + aset logo. |

## Logo & nama tim

- **Nama tim** (tampilan) dari kolom sheet per baris (home/away).
- **Logo tim** tidak disimpan di sel gambar; pakai **kunci/slug** di sheet (mis. `manchester-united`) → app memuat file dari folder publik, contoh: `/logos/teams/{slug}.png`.
- **Logo liga** sama: kolom `league_logo_key` → `/logos/leagues/{key}.png`.

## Alur operasional

1. Update baris di Google Sheet (nama, skor, kunci logo, meta liga).
2. Buka website viewer → refresh.
3. Rekam layar untuk konten short.

Lihat **`docs/SHEET_SCHEMA.md`** untuk usulan nama kolom dan contoh baris.

## File di repo ini

- `README.md` — file ini (brief lengkap).
- `docs/SHEET_SCHEMA.md` — skema kolom Google Sheet.
- `docs/CURSOR_CONTEXT.md` — teks singkat untuk paste ke chat AI di project ini.

## App Next.js (viewer)

```bash
cd FootballSheetViewer
npm install
cp .env.example .env.local
# isi SHEET_CSV_URL (opsional — tanpa itu pakai data demo)
npm run dev
```

Buka **http://localhost:3333** — 4 papan per layar, **Prev / Next**. Muat ulang data: refresh halaman browser.

### Google Sheet → CSV

1. Baris 1 = header (lihat `docs/SHEET_SCHEMA.md`).
2. **File → Share → Publish to web** → format **CSV**, salin URL **atau** pakai:
   `https://docs.google.com/spreadsheets/d/<ID>/export?format=csv&gid=<GID>`
3. Tempel ke `SHEET_CSV_URL` di `.env.local`.

### Animasi papan (voice-over / slow motion)

Default: **±3 detik** per papan sampai tampil penuh, lalu **±3 detik jeda** sebelum papan berikutnya mulai. Atur di `src/lib/panelAnimation.ts` (`PANEL_ENTER_DURATION_MS`, `PANEL_GAP_BETWEEN_MS`). Durasi CSS ikut `globals.css` (`--panel-enter-duration`, default **3s**).

### Logo

Letakkan file di:

- `public/logos/teams/{home_logo_key}.png` (atau `.webp` / `.svg`)
- `public/logos/leagues/{league_logo_key}.png`

**Logo akun (kanan atas header, bulat):**

- Folder: **`public/logos/account/`**
- Nama file: **`avatar.png`** (disarankan, persegi minimal ~256×256). Alternatif otomatis: **`avatar.webp`**, lalu **`avatar.svg`**.
- Tanpa file: tampil ikon siluet pengguna.

### Langkah lanjut

- Buka folder ini sebagai workspace Cursor terpisah dari Dashboard-Mobile.
- `docs/CURSOR_CONTEXT.md` untuk paste ke chat AI.
