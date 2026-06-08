# Prompt siap pakai untuk Claude Code

Buka Claude Code **di root project Next.js kamu**, lalu copy folder `design_handoff_ngepos/`
ke dalam project (mis. di root). Kirim prompt di bawah. Kerjakan **satu halaman per sesi**
biar fokus dan mudah di-review — jangan minta semua sekaligus.

---

## Langkah 0 — setup tokens (sekali saja)

```
Baca design_handoff_ngepos/README.md dan design_handoff_ngepos/tokens-tailwind-v4.css.

Sebelum coding UI: integrasikan design token ini ke src/app/globals.css ku (Tailwind v4).
Jangan timpa konfigurasi yang sudah ada — merge token warna/radius/font ke @theme yang ada,
dan pastikan dark mode (.dark) jalan dengan setup theme yang sekarang. Tunjukkan diff-nya
dulu sebelum apply. Jangan tambah dependency baru.
```

## Langkah 1 — pahami codebase

```
Baca dulu struktur project ini sebelum bikin UI apa pun:
- src/app/ (routing & pages yang sudah ada)
- src/components/ui/ (komponen shadcn yang tersedia)
- src/components/features/ (pola komponen existing — IKUTI gaya ini)
- src/lib/plans.ts (aturan plan-gating)
- src/types/ (data model)
Lalu ringkas: komponen & pola apa yang sudah ada yang bisa kupakai ulang untuk UI Ngepos.
```

## Langkah 2 — implementasi per halaman (ulangi untuk tiap layar)

```
Implementasikan ulang halaman <NAMA HALAMAN, mis. POS /[businessId]/pos> agar tampilannya
PERSIS seperti desain referensi.

Referensi visual: buka design_handoff_ngepos/references/Ngepos.html (cari section
"<nama section>"). Spesifikasi detail ada di README.md bagian layar yang sama.

Aturan:
- Pakai komponen shadcn/ui & pola yang SUDAH ADA di codebase (button, card, table, dialog,
  sheet, tabs, badge, dst). Jangan copy HTML dari referensi mentah-mentah.
- Pakai design token yang sudah dipasang (bg-canvas, text-ink, border-hairline, bg-accent…).
- TANPA drop shadow — kedalaman = surface putih + border hairline. Orange (accent) cuma untuk
  SATU CTA utama per layar.
- Sambungkan ke data backend yang sudah ada — JANGAN pakai data dummy dari referensi.
- Sertakan loading (skeleton), empty state, dan error state.
- Hormati plan-gating dari src/lib/plans.ts (fitur Pro di Starter → NoticeCard + Upgrade).
- Currency format "Rp 1.250.000", angka pakai font-mono tabular-nums.
- Icon pakai lucide-react.

Kerjakan halaman ini saja dulu. Tunjukkan rencana komponen sebelum nulis kode.
```

## Urutan halaman yang disarankan
1. Tokens (langkah 0) → App shell + Sidebar + business switcher
2. Dashboard
3. POS (+ payment + receipt)  ← paling kompleks, paling berdampak
4. Produk & Kategori
5. Inventaris · Meja · Staf
6. Analitik · Laporan
7. Pengaturan · Billing
8. Landing page (terakhir — paling banyak kebebasan, paling sedikit logika backend)

## Tips
- Tiap selesai 1 halaman, screenshot dan bandingkan dengan referensi sebelum lanjut.
- Kalau Claude Code mulai bikin komponen yang sudah ada → ingatkan untuk pakai
  `src/components/ui/` dan `src/components/features/` yang existing.
- Untuk chart (Analitik), pakai shadcn `chart` (Recharts) + chart palette token —
  bukan SVG manual seperti di referensi.
