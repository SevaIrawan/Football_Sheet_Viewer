# Context untuk AI / developer (paste ke chat baru)

Saya lanjutkan project **FootballSheetViewer** (folder ini, BUKAN Dashboard-Mobile).

**Produk:** Web viewer untuk konten short (Shorts/TikTok). Template UI tetap; **semua teks/logo referensi/skor** dari **Google Sheet**. Update sheet → refresh browser → rekam layar.

**UI sepak bola:**
- **4 papan** pertandingan per layar.
- **Pagination:** baris sheet 1–4 = layar 1, 5–8 = layar 2, … Tombol **Next** / **Prev**.
- **Multi-liga:** judul liga, logo liga, logo tim (via key → file di `/logos/...`), nama tim, skor — semua dari data.
- Satu baris sheet = satu match; urutan baris = urutan tampilan.

**Detail kolom:** lihat `docs/SHEET_SCHEMA.md`.

**Tidak perlu** mengubah repo Dashboard-Mobile. Implementasi ada di folder ini (Next.js: `npm run dev` → port **3333**).

**Env:** `SHEET_CSV_URL` di `.env.local` (lihat `.env.example`). Tanpa URL → data demo.
