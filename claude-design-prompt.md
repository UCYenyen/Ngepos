# Ngepos — Claude Design Prompt Pack

A copy-pasteable design prompt pack for generating Ngepos UI in a design tool
(Claude artifacts, v0, Figma Make, etc.). Grounded in the real codebase:
design tokens from `src/app/globals.css`, the data model in `src/types/`, plan
tiers in `src/lib/plans.ts`, and the shadcn primitives in `src/components/ui/`.

**How to use:** Always paste **Part 0 (Master Design Brief)** first — it's the
shared design-system context. Then append the one screen section you want to
design. Each screen prompt is self-contained below that brief.

---

## PART 0 — Master Design Brief (paste at the top of EVERY design prompt)

```
You are designing screens for "Ngepos", a multi-tenant SaaS POS (Point of Sale)
platform for F&B and retail businesses in Indonesia. One user can own multiple
businesses; features are gated by plan (Starter / Pro / Enterprise). Build with
React + Tailwind CSS v4 + shadcn/ui (style: "base-nova", icons: lucide-react).

=== DESIGN LANGUAGE ===
Intercom-inspired, calm, minimalist, editorial. Generous whitespace. NO drop
shadows — express depth by lifting white surfaces off a warm cream canvas, with
thin "hairline" borders. Confident charcoal type, one warm orange accent used
sparingly for primary actions only. Feels premium, trustworthy, and uncluttered.

=== COLOR TOKENS (use these EXACT values) ===
Backgrounds:
  --canvas        #f5f1ec   (warm cream — default page background)
  --canvas-dark   #e8e3db   (hover on canvas)
  --surface-1     #ffffff   (cards, inputs, floating panels)
  --surface-2     #ebe7e1   (secondary surface / hover)
Text (ink):
  --ink           #111111   (headlines, body, primary buttons)
  --ink-muted     #626260   (secondary text)
  --ink-subtle    #7b7b78   (tertiary)
  --ink-tertiary  #9c9fa5   (disabled / faint)
Borders:
  --hairline      #d3cec6   (default 1px borders)
  --hairline-soft #ebe7e1   (subtle dividers)
Accent (use ONLY for primary CTAs / key highlights):
  --accent-orange        #ff5600
  --accent-orange-hover  #e64c00
  --accent-orange-active  #cc4400
Semantic:
  error #c41c1c / error-light #f5d5d5
  success #0bdf50 / success-light #d4f5e0
Chart palette (data viz only):
  #65b5ff (blue), #0bdf50 (green), #ff2067 (pink), #b3e01c (lime), #03b2cb (cyan)

=== TYPOGRAPHY ===
Font: system-ui, -apple-system, sans-serif.
  Display: weight 500, 40–72px, NEGATIVE letter-spacing (tight).
  Body: weight 400, 14–18px, line-height 1.5.
  Mono: numeric/data displays (prices, SKUs, receipts).
Currency is Indonesian Rupiah, format "Rp 1.250.000" (dot thousands separators).

=== SPACING (8px base — use only these multiples) ===
4, 8, 12, 16, 24, 32, 48 px. Marketing section gaps: 96px.

=== RADIUS ===
buttons/inputs 8px · cards 12px · large media 16px · modals 16–24px · pills 9999px.

=== BUTTONS (4 variants only) ===
  Primary  → charcoal bg (#111111), white text  (default action)
  Accent   → orange bg (#ff5600), white text     (single most important CTA on a view)
  Secondary→ white bg, hairline border, ink text
  Tertiary → transparent, ink-muted text (low-emphasis)
  Icon     → 40px square, transparent, surface-2 on hover

=== shadcn/ui PRIMITIVES AVAILABLE (compose from these) ===
button, card, dialog, drawer, sheet, alert-dialog, popover, dropdown-menu,
context-menu, command, input, input-group, textarea, select, checkbox,
radio-group, toggle, toggle-group, switch, slider, label, table, pagination,
scroll-area, collapsible, tabs, badge, avatar, breadcrumb, calendar, separator,
skeleton (loading), progress, alert, hover-card, tooltip, spinner, sidebar,
chart (Recharts: ChartContainer/ChartTooltip/ChartLegend), sonner (toasts).

=== RULES ===
- No drop shadows. Depth = white surface on cream + hairline borders.
- Orange is rare: at most one accent button per view; everything else is charcoal/secondary.
- Every screen needs: loading (skeletons), empty, and error states.
- Mobile-first and touch-friendly — the POS screen especially is used on tablets.
- Indonesian-market copy: clear, plain Bahasa-friendly English labels.
```

---

## PART 1 — Landing / Marketing Page (NEW — modern SaaS)

> ⚠️ This page does **not** exist yet — today `src/app/page.tsx` just redirects.
> This is the one to design from scratch. It should live at `/` for logged-out visitors.

```
Design a modern, conversion-focused SaaS marketing landing page for Ngepos using
the Master Design Brief above. Single long-scroll page, cream canvas, white
floating sections, charcoal type, sparing orange. Sections top-to-bottom:

1) STICKY NAV BAR (transparent over cream, hairline bottom border on scroll)
   - Left: "Ngepos" wordmark (charcoal, weight 600).
   - Center: links — Features, Pricing, For F&B, For Retail, FAQ.
   - Right: "Masuk / Log in" (tertiary) + "Mulai Gratis / Start free" (ACCENT button).

2) HERO (centered, lots of whitespace)
   - Eyebrow pill badge: "Kasir digital untuk UMKM Indonesia".
   - Display headline (56–72px, tight tracking): "Jualan jadi simpel.
     Satu aplikasi kasir untuk semua bisnismu."
   - Subhead (ink-muted, 18px): POS, stok, laporan & analitik dalam satu tempat —
     untuk F&B dan retail.
   - Two CTAs: Accent "Mulai gratis" + Secondary "Lihat demo" (with play icon).
   - Trust line under buttons: "Tanpa kartu kredit · Setup 5 menit".
   - Hero visual: a clean, rounded (16px) product mockup of the POS screen on a
     tablet, floating on white with a soft cream gradient halo (NO shadow).

3) TRUST BAR: muted row of small logo placeholders — "Dipakai 1.000+ usaha" with
   greyscale brand marks.

4) FEATURE GRID (3x2 cards, white cards on cream, 12px radius, hairline border)
   Each card = lucide icon in orange-tint circle + bold title + 1-line desc:
   - Kasir cepat (POS): transaksi cash, QRIS, payment gateway.
   - Manajemen produk & kategori, varian, SKU.
   - Inventaris real-time: stok, low-stock alert, riwayat pergerakan.
   - Manajemen meja (F&B): status meja & order.
   - Analitik penjualan: revenue, produk terlaris, kinerja kasir.
   - Laporan otomatis bulanan via Email & WhatsApp.

5) SEGMENTED SHOWCASE (alternating left/right image + text rows, 96px gaps)
   Row A "Untuk F&B" — table management + QRIS mockup.
   Row B "Untuk Retail" — inventory + variants mockup.
   Each: small label, headline, 2–3 checkmark bullets, text link "Pelajari →".

6) HOW IT WORKS (3 numbered steps in a row, connected by a thin hairline):
   1. Buat bisnis & pilih tipe  2. Tambah produk  3. Mulai transaksi.

7) ANALYTICS SHOWCASE: a wide white panel showing a dashboard mockup — area
   revenue chart + KPI cards — headline "Pahami bisnismu dengan data."

8) PRICING (3 cards; middle "Pro" highlighted with orange border + "Populer" badge)
   - Starter (Gratis): 1 bisnis, 100 produk, 2 staf, POS dasar.
   - Pro: 5 bisnis, 1.000 produk, 10 staf + Inventaris, Meja, Analitik,
     Laporan otomatis, Payment gateway. (Accent CTA)
   - Enterprise (Hubungi kami): bisnis/produk/staf tak terbatas, semua fitur.
   Each card: plan name, price, feature checklist (lucide check), CTA button.
   Add a monthly/yearly toggle (shadcn switch) above the cards.

9) TESTIMONIALS: 2–3 quote cards (avatar + name + business type + short quote).

10) FAQ: shadcn accordion (collapsible), 5–6 Q&A (pricing, data security/RLS,
    multi-business, payment methods, WhatsApp reports).

11) FINAL CTA BANNER: full-width charcoal (#111111) panel, white headline
    "Siap modernkan kasirmu?" + accent button "Mulai gratis sekarang".

12) FOOTER: cream, 4 columns (Produk, Perusahaan, Sumber daya, Legal) + wordmark
    + social icons + "© 2026 Ngepos". Hairline top border.

Components: use shadcn button, badge, card, accordion (collapsible), switch,
avatar, separator. Keep it airy, premium, conversion-optimized. No shadows.
```

---

## PART 2 — Auth & Onboarding

Lives in the `(auth)` route group — **no sidebar**, centered card on cream.

```
Design 3 auth screens for Ngepos (Master Design Brief applies). Centered layout:
cream canvas, a single white card (max-width ~440px, 12px radius, hairline border,
32px padding), Ngepos wordmark above the card. Left side optional: a muted brand
panel with a product mockup (split layout on desktop, card-only on mobile).

A) LOG IN  (/login)
   - Title "Masuk ke Ngepos" + subtitle.
   - Fields: Email, Password (shadcn input + label). "Lupa password?" tertiary link.
   - Accent submit button "Masuk" (full width).
   - Divider "atau" + Secondary "Lanjutkan dengan Google" (Google icon).
   - Footer line: "Belum punya akun? Daftar".
   - Error state: shadcn alert (error-light bg) above the form.

B) SIGN UP  (/signup)
   - Fields: Nama lengkap, Email, Password (with strength hint).
   - Accent "Buat akun" + Google option + terms microcopy.

C) ONBOARDING  (/onboarding) — first business setup, shown right after signup.
   - Title "Buat bisnis pertamamu".
   - Fields: Nama bisnis (input); Tipe bisnis = TWO large selectable cards
     (radio-group styled as cards): "Retail" (store icon) vs "F&B / Restoran"
     (utensils icon) — selected card gets orange border; Timezone (select);
     Mata uang (select, default IDR).
   - A subtle progress indicator (step 1 of 1) at top.
   - Accent "Lanjutkan" button.

All forms: inline field validation (Zod-style), 8px radius inputs, orange focus
ring, ink-muted helper text, disabled/loading button states (spinner).
```

---

## PART 3 — App Shell, Dashboard & Business Switcher

```
Design the authenticated app shell + business dashboard (Master Design Brief).

APP SHELL (wraps all /[businessId]/* pages):
- Fixed LEFT SIDEBAR, 256px wide, white surface, hairline right border.
  - Top: business name + small type badge (Retail/F&B) + a switcher chevron
    (opens a shadcn dropdown/command to switch between businesses).
  - Nav items (lucide icon + label, active item = ink text + subtle surface-2
    pill + thin orange left indicator):
      POS (shopping-cart), Produk (package), Inventaris (boxes),
      Meja (utensils — F&B only), Staf (users), Analitik (bar-chart),
      Laporan (file-text), Pengaturan (settings).
  - Bottom: user avatar + name + dropdown (Akun, Billing, Keluar).
  - Plan-gated items (Inventaris, Meja, Analitik, Laporan) on Starter show a
    small "Pro" lock badge and route to an upgrade modal.
- MAIN AREA: cream canvas. A "PageShell" header per page = page title (28–32px),
  subtitle (ink-muted), and a right-aligned primary action slot.

BUSINESS DASHBOARD / SWITCHER  (/dashboard):
- Heading "Bisnismu" + Accent "Buat bisnis baru" (top-right; disabled with
  tooltip + upgrade modal if plan business-limit reached).
- Grid of business cards (white, 12px radius, hairline): logo/initial avatar,
  business name, type badge, member count, role badge, "Buka →" button.
- Empty state: centered illustration + "Belum ada bisnis" + create CTA.
- "Create business" = a shadcn dialog reusing the onboarding fields.
```

---

## PART 4 — Core Feature Screens

### 4.1 POS / Point of Sale — `/[businessId]/pos`

```
Design the POS transaction screen (Master Design Brief). Tablet-first, touch-
friendly, fast. TWO-PANEL layout:

LEFT (≈65%) — PRODUCT SELECTOR:
- Sticky top: search input + horizontal category filter chips (toggle-group;
  active chip = charcoal). Categories show their color dot.
- Responsive grid of product cards (white, 16px radius, hairline): product image,
  name, price (mono), low-stock badge if applicable. Tap adds to cart.
- Products with variants open a popover/sheet to pick the variant first.

RIGHT (≈35%) — CART (white panel, hairline left border, full height):
- Header "Pesanan" + table selector (F&B only) + clear-cart icon button.
- Line items (scroll-area): name + variant, qty stepper (−/+), line price,
  per-item discount, remove.
- Totals block: Subtotal, Diskon, Pajak (tax_rate), and big bold TOTAL (mono).
- Sticky footer: Accent "Bayar" button (full width).
- Empty cart state: muted cart icon + "Keranjang kosong".

PAYMENT FLOW (shadcn dialog/drawer over the screen):
- Payment method selector (3 large radio cards): Cash, QRIS, Gateway
  (Gateway disabled with Pro lock on Starter).
- Cash: "uang diterima" input → auto-calculated change (kembalian, mono, large).
- QRIS: show the business's uploaded QR image + amount + "Tandai lunas".
- Gateway: pending state with spinner awaiting webhook confirmation.
- On success: RECEIPT modal — printable layout, mono font, order items, totals,
  payment method, timestamp, business name; buttons "Cetak" + "Transaksi baru".

States: loading skeletons for product grid; success toast (sonner) on completed sale.
```

### 4.2 Products & Categories — `/[businessId]/products`

```
Design the product management screen (Master Design Brief).
- Header "Produk" + Accent "Tambah produk" (disabled + upgrade modal at plan
  product-limit; show "82 / 100 produk" counter).
- Tabs: "Produk" | "Kategori".
- PRODUCTS tab: search + category filter + a shadcn table (or card grid toggle):
  columns = image, nama, SKU (mono), kategori (colored badge), harga (mono),
  "punya varian" indicator, stock if tracked, row actions (edit/delete dropdown).
- Add/Edit product = shadcn sheet (right slide-in): name, SKU, price, image
  upload (dropzone, 16px radius preview), category select, "lacak stok" switch,
  "punya varian" switch → reveals a repeatable variant editor (name,
  price_modifier, SKU, stock_qty).
- KATEGORI tab: list with name + color swatch picker + inline add row.
- Empty state + loading skeleton rows + delete confirm (alert-dialog).
```

### 4.3 Inventory — `/[businessId]/inventory` *(Pro/Enterprise)*

```
Design the inventory screen (Master Design Brief). If plan = Starter, show a
locked "Inventaris" state: a NoticeCard with lock icon, "Fitur Pro", and an
"Upgrade" accent button — do NOT show the data.

PRO/ENTERPRISE layout:
- Header "Inventaris" + "Sesuaikan stok" (primary) + "Riwayat" (secondary).
- Filter bar: search, sort (nama/stok/kategori), filter toggle (Semua / Stok menipis).
- Stock table: expandable rows (collapsible) — product shows name, SKU, category,
  current_stock vs low_stock_threshold with a colored status badge
  (success >= threshold, error below = "Stok menipis"); expanding reveals per-
  variant stock rows.
- STOCK ADJUSTMENT (dialog): pick product/variant, movement type (radio:
  Penjualan / Restock / Penyesuaian / Rusak), quantity change (+/−), note.
- STOCK HISTORY (sheet/drawer): vertical timeline of StockMovement entries —
  type badge, qty change (+green/−red mono), note, user, timestamp.
- Empty + loading states.
```

### 4.4 Tables — `/[businessId]/tables` *(F&B only, Pro/Enterprise)*

```
Design the table management screen for F&B businesses (Master Design Brief).
Only render for business.type === "fnb"; otherwise this nav item is hidden.
Starter F&B shows the Pro-locked NoticeCard.
- Header "Meja" + "Tambah meja" primary.
- Visual floor grid of table cards (white, 12px radius): table name, capacity
  (users icon), and a prominent STATUS badge:
    Available = success-light, Occupied = orange-tint, Reserved = surface-2/muted.
- Tap an occupied table → drawer showing its TableOrder (linked transaction,
  order status: pending/in_progress/served/paid) + "Buka di POS" action.
- Add/edit table = dialog (name, capacity).
- Legend row for status colors. Empty + loading states.
```

### 4.5 Staff — `/[businessId]/staff`

```
Design the staff management screen (Master Design Brief).
- Header "Staf" + Accent "Undang staf" (shows "8 / 10 staf"; disabled + upgrade
  modal at plan staff-limit).
- shadcn table of members: avatar + name, email, ROLE badge (Owner / Manager /
  Cashier — distinct subtle colors), tanggal bergabung, row actions (edit role /
  remove). Owner row is non-removable.
- INVITE form (dialog/sheet): email input + role radio-group with a short
  permission summary per role:
    Owner = akses penuh · Manager = semua kecuali staf & pengaturan ·
    Cashier = hanya transaksi.
  Accent "Kirim undangan" → success toast.
- Optional pending-invitations list (email, role, "Menunggu" badge, resend/cancel).
- Remove member = alert-dialog confirm. Empty + loading states.
```

### 4.6 Analytics — `/[businessId]/analytics` *(Pro/Enterprise)*

```
Design the sales analytics dashboard (Master Design Brief). Starter = Pro-locked
NoticeCard. Use the shadcn chart (Recharts) component with the chart palette and
subtle entry animations.

- Header "Analitik" + a date-range control on the right: preset segmented control
  (Hari ini / Minggu ini / Bulan ini / Kustom); "Kustom" opens a calendar range picker.
- ROW 1 — KPI metric cards (3, white, 12px radius): Total Pendapatan (mono, large),
  Jumlah Transaksi, Rata-rata Order (AOV). Each with a small period-over-period delta.
- ROW 2 — REVENUE AREA CHART: revenue over time (x = date, y = revenue), orange/
  blue gradient fill, tooltip shows revenue + transaction count.
- ROW 3 (two columns):
  - Top Products: horizontal bar chart of best sellers (name, qty, revenue).
  - Category Sales: donut/pie chart by category (legend + % share).
- ROW 4 (two columns):
  - Payment Breakdown: pie/stacked bar by method (cash / QRIS / gateway).
  - Staff Performance: table — cashier name, revenue (mono), transaction count.
- Loading = skeleton chart blocks; empty = "Belum ada data untuk periode ini".
```

### 4.7 Reports — `/[businessId]/reports` *(Pro/Enterprise)*

```
Design the reports screen (Master Design Brief). Starter = Pro-locked NoticeCard.
- Header "Laporan".
- Period selector (month/year) + a summary preview card: business name, period
  label, total revenue (mono), top products list, low-stock count.
- EXPORT actions: card with format options — "Unduh PDF" (accent) and
  "Unduh CSV" (secondary), each with a file icon; show a generating spinner state.
- A short "Laporan otomatis" promo block linking to Settings → automated reports.
- Empty/loading states for the preview.
```

### 4.8 Settings — `/[businessId]/settings`

```
Design the business settings screen (Master Design Brief). Use a tabbed or
sectioned layout (shadcn tabs), each section a white card with hairline divider:

1) PROFIL BISNIS: name, type (read-only badge), address, timezone, currency,
   logo upload (16px rounded preview).
2) PEMBAYARAN — QRIS: upload static QRIS image (dropzone + preview); this image
   appears in the POS QRIS payment flow.
3) LAPORAN OTOMATIS (Pro/Enterprise; Starter shows Pro-lock):
   - "Aktifkan laporan otomatis" switch (report_enabled).
   - Channel radio: Email vs WhatsApp (report_channel).
   - Recipient input (email or phone, validated by channel) (report_recipient).
   - Helper text: "Dikirim otomatis tiap tanggal 1." + "Simpan" primary button.
4) ZONA BERBAHAYA: hairline-separated section with destructive
   "Hapus bisnis" (error button → alert-dialog double-confirm).
- Save = success toast; per-section save buttons; loading skeletons.
```

### 4.9 Billing — `/billing`

```
Design the subscription/billing page (Master Design Brief). Full-width (no
business sidebar; account-level).
- Current plan card: plan name badge (Starter/Pro/Enterprise), price, billing
  cycle (monthly/yearly), status badge (Active / Past due / Cancelled), renewal date.
- Plan comparison: 3 pricing cards (reuse landing pricing) with current plan
  marked "Paket aktif"; upgrade/downgrade CTAs.
- Usage meters (shadcn progress bars): businesses, products, staff vs plan limits.
- Payment method section: provider (Midtrans / Xendit / Transfer manual) + invoice
  history table (date, amount mono, status badge, download).
- Manual bank transfer instructions block for that payment path.
```

---

## Notes & gotchas

- **The landing page is genuinely new** — there's no existing marketing page to
  match, so Part 1 has the most creative latitude. Everything else should match
  patterns already in `src/components/features/`.
- **Plan-gating is a recurring UI pattern.** The Starter-locked `NoticeCard` +
  upgrade-modal behavior is baked into Inventory, Tables, Analytics, and Reports
  because that's how `src/lib/plans.ts` gates them. Keep it consistent.
- **F&B vs Retail divergence:** the Meja/Tables screen and the POS table-selector
  only render for `business.type === "fnb"`. State this explicitly each time so the
  design tool doesn't add table UI to retail mockups.
- **Dark mode** is supported by the tokens (`--canvas #1a1a1a`, `--surface-1 #2a2a2a`,
  `--ink #f5f5f5`, `--accent-orange #ff6b1a`). Add "include a dark-mode variant"
  to any prompt to get both.
