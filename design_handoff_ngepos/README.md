# Handoff: Ngepos UI — implementasi ke Next.js app

## Ringkasan
Paket ini berisi **desain referensi** untuk seluruh UI Ngepos (POS multi-tenant untuk
F&B & retail): landing page, auth, dashboard, POS, produk, inventaris, meja, staf,
analitik, laporan, pengaturan, dan billing — lengkap dengan **light & dark mode** dan
varian **F&B vs Retail** serta state **Pro-locked** (Starter).

## PENTING — baca dulu
File di folder `references/` adalah **prototipe desain yang dibuat dengan HTML + React (Babel in-browser)**.
Itu **bukan kode produksi untuk di-copy mentah-mentah**. Tugasnya adalah **membuat ulang
tampilan & perilaku ini di codebase kamu yang sudah ada** (Next.js + Tailwind v4 + shadcn/ui),
memakai komponen & pola yang sudah kamu punya — bukan menyalin HTML-nya.

Alur kerja yang benar untuk Claude Code:
1. **Baca dulu** struktur project kamu: `src/app/`, `src/components/ui/` (shadcn),
   `src/components/features/`, `src/lib/plans.ts`, `src/types/`, dan `globals.css`.
2. **Pasang design tokens** dari `tokens-tailwind-v4.css` ke `globals.css` kamu (sekali saja).
3. **Implementasi per halaman**, satu per satu, cocokkan ke screenshot/HTML referensi,
   pakai komponen shadcn yang sudah ada (`button`, `card`, `table`, `dialog`, `sheet`, dst).
4. **Sambungkan ke backend** yang sudah ada — jangan pakai data dummy dari referensi.

## Fidelity: HIGH-FIDELITY
Mockup ini pixel-level: warna, tipografi, spacing, dan radius sudah final. Recreate
se-akurat mungkin, tapi **pakai library & pola yang sudah ada di codebase** (jangan
nambah dependency baru kalau shadcn sudah cukup).

---

## Design language (aturan inti)
- **Tanpa drop shadow.** Kedalaman = surface putih di atas canvas krem hangat + border "hairline" 1px.
- **Charcoal type** (#111) untuk teks & tombol utama. **Orange dipakai sangat hemat** —
  maksimal SATU tombol accent per layar (CTA paling penting). Sisanya charcoal/secondary.
- Generous whitespace, editorial, tenang. Currency: `Rp 1.250.000` (titik ribuan).
- Font: `system-ui` stack. Angka/SKU/harga pakai mono + `font-variant-numeric: tabular-nums`.

## Design tokens
Lihat `tokens-tailwind-v4.css` untuk versi siap-tempel (Tailwind v4 `@theme` + dark mode).
Nilai mentah (light):

| Token | Hex | Pakai untuk |
|---|---|---|
| canvas | `#f5f1ec` | background halaman (krem) |
| canvas-dark | `#e8e3db` | hover di canvas |
| surface-1 | `#ffffff` | card, input, panel |
| surface-2 | `#ebe7e1` | secondary surface / hover |
| ink | `#111111` | headline, body, tombol primary |
| ink-muted | `#626260` | teks sekunder |
| ink-subtle | `#7b7b78` | tersier |
| ink-tertiary | `#9c9fa5` | disabled/faint |
| hairline | `#d3cec6` | border 1px default |
| hairline-soft | `#ebe7e1` | divider halus |
| accent | `#ff5600` | CTA utama SAJA |
| accent-hover | `#e64c00` | |
| error / error-light | `#c41c1c` / `#f5d5d5` | |
| success / success-light | `#119a48` / `#d4f5e0` | |
| chart | `#65b5ff #0bdf50 #ff2067 #b3e01c #03b2cb` | data-viz only |

**Dark mode**: canvas `#1a1a1a`, surface-1 `#2a2a2a`, surface-2 `#353532`, ink `#f5f5f5`,
hairline `#3b3b38`, accent `#ff6b1a`. (lengkap di `tokens-tailwind-v4.css`)

**Spacing** (kelipatan 8): 4, 8, 12, 16, 24, 32, 48 px · marketing gaps 96px.
**Radius**: button/input 8px · card 12px · media 16px · modal 20–24px · pill 9999px.
**Tombol (4 variant)**: Primary (charcoal), Accent (orange), Secondary (putih + hairline),
Tertiary (transparan, ink-muted). Tinggi default 40px, sm 32px, lg 48px.

---

## Daftar layar & catatan implementasi

> Tiap layar punya frame di `references/Ngepos.html` (buka di browser, klik frame untuk
> fullscreen). Komponen sumbernya disebut per section di bawah.

### 1. Landing `/` — `screens-landing.jsx`
Single long-scroll, logged-out. Section: sticky nav → hero (headline 56–72px, tracking
negatif) → trust bar → feature grid 3×2 → showcase F&B/Retail (selang-seling) → how-it-works
3 langkah → analytics showcase → pricing 3 kartu (Pro highlighted, toggle bulanan/tahunan)
→ testimonials → FAQ (accordion) → CTA banner charcoal → footer 4 kolom.

### 2. Auth `(auth)` — `screens-auth.jsx`
Split layout: panel brand charcoal (kiri) + form (kanan), card-only di mobile. Login
(+ error state pakai `alert`), Signup (password strength), Onboarding (nama bisnis +
2 kartu radio Retail/F&B + timezone + currency). Focus ring orange, validasi inline.

### 3. App shell + Dashboard — `screens-app.jsx` & `lib.jsx` (`Sidebar`, `PageShell`)
- **Sidebar 256px**, surface putih, border kanan hairline. Item aktif = teks ink +
  pill surface-2 + indikator orange tipis di kiri. Item Pro-gated (Inventaris, Meja,
  Analitik, Laporan) tampil badge "Pro" lock saat plan Starter (baca `src/lib/plans.ts`).
- **Business switcher** di atas sidebar (dropdown/command).
- **Meja** hanya render kalau `business.type === "fnb"`.
- **Dashboard `/dashboard`** (account-level, topbar bukan sidebar): grid kartu bisnis,
  empty state, tombol "Buat bisnis baru" (disabled + tooltip kalau limit plan tercapai).

### 4. POS `/[businessId]/pos` — `screens-pos.jsx`
Tablet-first, 2 panel. Kiri (~65%): search + chip kategori (toggle-group) + grid produk
(card 16px radius, badge "Menipis"/"varian"). Kanan (~35%): cart panel — header + table
selector (F&B only) + line items (qty stepper) + totals (Subtotal/Diskon/Pajak/TOTAL) +
tombol Bayar accent. Payment flow (dialog): Cash (uang diterima → kembalian besar),
QRIS (gambar QR dari Settings), Gateway (Pro-locked di Starter). Receipt mono + Cetak.

### 5. Produk `/[businessId]/products` — `screens-catalog.jsx`
Tabs Produk|Kategori. Tabel: image, nama, SKU (mono), kategori (badge berwarna), harga
(mono), indikator varian, stok, row actions. Add/Edit = **sheet** kanan (nama, SKU, harga,
upload foto, kategori, switch "lacak stok", switch "punya varian" → editor varian).
Counter "82 / 1.000 produk". Kategori: list + color swatch + inline add.

### 6. Inventaris `/[businessId]/inventory` (Pro) — `screens-catalog.jsx`
Starter → `NoticeCard` Pro-lock (jangan tampilkan data). Pro: tabel expandable (collapsible)
per varian, status badge (Aman/Stok menipis), dialog Sesuaikan stok (radio: Penjualan/
Restock/Penyesuaian/Rusak), drawer Riwayat (timeline StockMovement).

### 7. Meja `/[businessId]/tables` (F&B only, Pro) — `screens-ops.jsx`
Hanya `type==="fnb"`. Grid kartu meja + status (Kosong=success, Terisi=orange, Reservasi=muted)
+ legend. Tap meja terisi → drawer TableOrder + "Buka di POS". Starter → NoticeCard.

### 8. Staf `/[businessId]/staff` — `screens-ops.jsx`
Tabel member (avatar, role badge Owner/Manager/Cashier, tanggal gabung). Invite dialog
(email + radio role dengan ringkasan permission). Owner non-removable. Pending invitations.

### 9. Analitik `/[businessId]/analytics` (Pro) — `screens-data.jsx`
Pakai **shadcn chart (Recharts)** dengan chart palette. Date-range segmented (Hari/Minggu/
Bulan/Kustom). Row 1: 3 KPI card (Pendapatan/Transaksi/AOV + delta). Row 2: area chart
revenue (gradient orange). Row 3: bar produk terlaris + donut kategori. Row 4: pie metode
bayar + tabel kinerja kasir. Starter → NoticeCard.
> Di referensi chart digambar pakai SVG manual — **di app kamu pakai Recharts via shadcn chart**.

### 10. Laporan `/[businessId]/reports` (Pro) — `screens-data.jsx`
Period selector + preview card (revenue, top produk, low-stock count) + export PDF (accent)
/ CSV (secondary) dengan spinner + promo "Laporan otomatis". Starter → NoticeCard.

### 11. Pengaturan `/[businessId]/settings` — `screens-account.jsx`
Sectioned (tabs/anchor): Profil bisnis · Pembayaran QRIS (upload) · Laporan otomatis
(Pro: switch + radio Email/WhatsApp + recipient) · Zona berbahaya (hapus bisnis → alert-dialog).

### 12. Billing `/billing` — `screens-account.jsx`
Account-level. Current plan card + status badge + renewal date. Plan comparison 3 kartu
(current = "Paket aktif"). Usage meter (progress bar) bisnis/produk/staf. Metode pembayaran
(Midtrans/Xendit/Transfer manual) + invoice history.

---

## Interaksi & state (umum)
- Tiap layar butuh: **loading (skeleton)**, **empty state**, **error state**.
- Plan-gating konsisten: fitur Pro di Starter → `NoticeCard` (lock icon + "Fitur Pro" +
  tombol Upgrade accent) + tombol/limit disabled. Sumber kebenaran: `src/lib/plans.ts`.
- Dark mode: token sudah mendukung — pakai `class`/`data-theme` strategy yang sudah ada
  di project (atau `next-themes`).
- Toast sukses pakai `sonner`. Konfirmasi destruktif pakai `alert-dialog`.

## Assets
Semua imagery di referensi = **placeholder bergaris berlabel** (mis. "product shot",
"logo"). Ganti dengan asset/komponen upload nyata di app kamu. Icon = **lucide-react**
(di referensi path-nya di-inline di `lib.jsx`; di app pakai `lucide-react` langsung).

## Files di paket ini
- `README.md` — dokumen ini
- `tokens-tailwind-v4.css` — token siap tempel ke `globals.css` (Tailwind v4 `@theme` + dark)
- `CLAUDE_CODE_PROMPT.md` — prompt siap pakai untuk Claude Code
- `references/Ngepos.html` — buka di browser untuk lihat semua layar (light/dark, klik untuk fullscreen)
- `references/*.jsx`, `references/tokens.css` — sumber prototipe (referensi, bukan untuk di-copy)
