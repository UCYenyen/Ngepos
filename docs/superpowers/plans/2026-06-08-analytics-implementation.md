# Analytics & Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Build the sales analytics dashboard (animated charts), manual CSV/PDF transaction exports, and automated monthly reports delivered by email (Resend) or WhatsApp (Fonnte) via Supabase pg_cron + Edge Function.

**Architecture:** Pure aggregation functions (`src/lib/analytics.ts`) transform raw transactions+items into dashboard metrics — fully unit-testable. A gated `/api/analytics` route fetches data and returns metrics; client chart components render them with shadcn/Recharts. Manual exports reuse the aggregation/query layer. Automated reports live in a Deno Edge Function triggered by pg_cron, reading per-business config from new columns on `businesses`.

**Tech Stack:** Next.js 16 (App Router), Supabase (Postgres + RLS + pg_cron + Edge Functions/Deno), Recharts 3.8 via shadcn `chart.tsx`, Resend (email), Fonnte (WhatsApp HTTP API), jsPDF (client PDF), TypeScript strict, Vitest.

**Plan gating:** Analytics dashboard + automated reports are Pro/Enterprise only (`getPlanConfig(plan).features.analytics` / `.automatedReports`). Manual exports require `canViewReports` (owner/manager). All analytics/report APIs require auth + business membership + role/plan checks.

---

## Scope notes

- **Table utilization rate is OUT OF SCOPE.** The spec lists "F&B only: table utilization rate," but table management (`table_orders` flow) was never implemented in Sub-project 3, so there is no data to aggregate. Omit this metric. All other dashboard metrics are in scope.
- **Currency:** IDR formatting is currently duplicated inline (`toLocaleString('id-ID')`). Task 1 creates a shared `formatCurrency` helper; new code uses it. Do NOT refactor existing POS components (YAGNI — out of scope).
- **Admin client:** `createAdminClient()` exists in `src/lib/supabase.ts` for resolving cashier display names from `auth.users` (used after permission checks only).

---

## Existing data shapes (reference — do not redefine)

```
transactions: id, business_id, cashier_id, table_id, subtotal, discount_amount,
  tax_amount, total, payment_method ('cash'|'qris'|'gateway'),
  payment_status ('pending'|'paid'|'cancelled'), gateway_reference, notes, created_at
transaction_items: id, transaction_id, product_id, variant_id, name, price,
  quantity, discount_amount, subtotal, created_at
categories: id, business_id, name, color, created_at
products: id, business_id, category_id, name, sku, price, has_variants,
  track_stock, stock_qty, low_stock_threshold, created_at
businesses: id, owner_id, name, type ('retail'|'fnb'), logo_url, address,
  timezone, currency, created_at
```

Permissions (`@/lib/permissions`): `canViewAnalytics(role)` (owner/manager), `canViewReports(role)` (owner/manager). Plan (`@/lib/plans`): `getPlanConfig(plan).features.analytics`, `.automatedReports`.

---

## File Structure

**New files:**
- `src/lib/format.ts` — `formatCurrency`, `formatDate` helpers
- `src/types/analytics.ts` — metric/report types
- `src/lib/analytics.ts` — pure aggregation functions
- `src/app/api/analytics/route.ts` — dashboard metrics endpoint (GET)
- `src/components/features/analytics/MetricCards/MetricCards.tsx` (+ `types.ts`)
- `src/components/features/analytics/RevenueChart/RevenueChart.tsx` (+ `types.ts`)
- `src/components/features/analytics/TopProductsChart/TopProductsChart.tsx` (+ `types.ts`)
- `src/components/features/analytics/CategorySalesChart/CategorySalesChart.tsx` (+ `types.ts`)
- `src/components/features/analytics/PaymentBreakdownChart/PaymentBreakdownChart.tsx` (+ `types.ts`)
- `src/components/features/analytics/StaffPerformance/StaffPerformance.tsx` (+ `types.ts`)
- `src/components/features/analytics/AnalyticsClient/AnalyticsClient.tsx` (+ `types.ts`) — orchestrator with date-range selector
- `src/app/(dashboard)/[businessId]/analytics/page.tsx`
- `src/lib/export/csv.ts` — transactions → CSV string
- `src/app/api/reports/export/route.ts` — CSV download (GET)
- `src/components/features/reports/ExportReports/ExportReports.tsx` (+ `types.ts`) — date range + CSV/PDF buttons
- `src/lib/export/pdf.ts` — client jsPDF report generator
- `src/app/(dashboard)/[businessId]/reports/page.tsx`
- `src/components/features/settings/ReportSettings/ReportSettings.tsx` (+ `types.ts`)
- `src/app/(dashboard)/[businessId]/settings/page.tsx`
- `src/app/api/businesses/[id]/report-settings/route.ts` — GET/PATCH report config (owner-only)
- `supabase/migrations/006_report_settings.sql` — report config columns on `businesses`
- `supabase/functions/monthly-report/index.ts` — Deno Edge Function
- `supabase/migrations/007_monthly_report_cron.sql` — pg_cron schedule
- Tests under `src/tests/` mirroring the above (analytics lib, csv lib, format lib)

**Modified files:**
- `src/lib/navigation.ts` — add Analytics, Reports, Settings nav items (gated)
- `src/tests/lib/navigation.test.ts` — update for new nav items

---

## Task 1: Currency/date formatting helpers + analytics types

**Files:** Create `src/lib/format.ts`, `src/types/analytics.ts`, `src/tests/lib/format.test.ts`.

**`src/lib/format.ts`:**
```typescript
export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
}
```

**TDD:** `src/tests/lib/format.test.ts` — assert `formatCurrency(1500000)` contains `'1.500.000'` and `'Rp'`; `formatCurrency(0)` works; `formatDate('2026-06-08')` returns a non-empty localized string. Write tests → fail → implement → pass.

**`src/types/analytics.ts`** (define ALL types later tasks reference — names are contracts):
```typescript
export type DateRangePreset = 'today' | 'week' | 'month' | 'custom';

export interface DateRange {
  start: string;
  end: string;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  transactions: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface CategorySalesSlice {
  categoryId: string | null;
  name: string;
  revenue: number;
}

export interface PaymentBreakdownSlice {
  method: 'cash' | 'qris' | 'gateway';
  revenue: number;
  count: number;
}

export interface StaffPerformanceRow {
  cashierId: string;
  name: string;
  revenue: number;
  transactions: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  transactionCount: number;
  averageOrderValue: number;
}

export interface DashboardMetrics {
  summary: AnalyticsSummary;
  revenueSeries: RevenuePoint[];
  topProducts: TopProduct[];
  categorySales: CategorySalesSlice[];
  paymentBreakdown: PaymentBreakdownSlice[];
  staffPerformance: StaffPerformanceRow[];
}

export interface MonthlyReportData {
  businessName: string;
  periodLabel: string;
  totalRevenue: number;
  transactionCount: number;
  topProducts: TopProduct[];
  lowStockCount: number;
}
```
No `any`, no comments.

**Commit:** `feat: add formatting helpers and analytics types`.

---

## Task 2: Analytics aggregation library (TDD)

**Files:** Create `src/lib/analytics.ts`, `src/tests/lib/analytics.test.ts`.

Define an input row type the lib consumes (so the API maps DB rows to it):
```typescript
import type {
  DashboardMetrics, RevenuePoint, TopProduct, CategorySalesSlice,
  PaymentBreakdownSlice, StaffPerformanceRow, AnalyticsSummary,
} from '@/types/analytics';

export interface AnalyticsItemRow {
  product_id: string;
  name: string;
  quantity: number;
  subtotal: number;
  category_id: string | null;
  category_name: string | null;
}

export interface AnalyticsTransactionRow {
  id: string;
  cashier_id: string;
  cashier_name: string;
  total: number;
  payment_method: 'cash' | 'qris' | 'gateway';
  created_at: string;
  items: AnalyticsItemRow[];
}
```

Pure functions (each unit-tested):
- `computeSummary(txns): AnalyticsSummary` — totalRevenue = sum(total), transactionCount = length, averageOrderValue = count ? totalRevenue/count : 0.
- `computeRevenueSeries(txns): RevenuePoint[]` — group by calendar day (YYYY-MM-DD from `created_at`), sum revenue + count; sorted ascending by date.
- `computeTopProducts(txns, limit = 5): TopProduct[]` — aggregate items by `product_id` (sum quantity + subtotal as revenue), sort by revenue desc, take `limit`.
- `computeCategorySales(txns): CategorySalesSlice[]` — aggregate item subtotal by `category_id` (use `category_name` or `'Uncategorized'` when null), sort revenue desc.
- `computePaymentBreakdown(txns): PaymentBreakdownSlice[]` — group by `payment_method`, sum total + count; include only methods that appear.
- `computeStaffPerformance(txns): StaffPerformanceRow[]` — group by `cashier_id`, sum total + count, name from `cashier_name`, sort revenue desc.
- `computeDashboardMetrics(txns): DashboardMetrics` — composes all of the above.

**TDD:** Tests with a small fixture of 3-4 transactions across 2 days, 2 cashiers, 2 categories, mixed payment methods. Assert each function's output (e.g., summary AOV, top product ordering, category totals, payment grouping, per-cashier revenue). Empty input → zeros/empty arrays. Write → fail → implement → pass. No `any`, no comments.

**Commit:** `feat: add analytics aggregation library`.

---

## Task 3: Analytics API endpoint

**Files:** Create `src/app/api/analytics/route.ts`.

`GET /api/analytics?businessId=&start=&end=`:
1. Auth via `createServerClient(cookieStore)` + `auth.getUser()` → 401.
2. Validate `businessId` (400 if missing). Parse `start`/`end` ISO dates; default to current month start→now if absent.
3. Membership: query caller's own `business_members` row → 403 if none; `canViewAnalytics(member.role)` → 403 if false.
4. Plan gate: `getCurrentSubscription()`; if null or `!getPlanConfig(subscription.plan).features.analytics` → 403 `{ error: 'Analytics requires the Pro plan' }`.
5. Fetch `transactions` for the business with `payment_status = 'paid'` and `created_at` within [start, end], embedding `transaction_items(product_id, name, quantity, subtotal, products(category_id, categories(name)))`. Order by `created_at`.
6. Resolve cashier display names: collect distinct `cashier_id`, use `createAdminClient()` → `auth.admin.getUserById(id)` (name = `user_metadata.name ?? email`). (Only after the permission gate.)
7. Map rows to `AnalyticsTransactionRow[]` (flattening category name from the nested join; `category_name` from `products.categories.name`), call `computeDashboardMetrics(...)`, return the `DashboardMetrics` JSON.
8. try/catch → 500. No `any` (type the Supabase nested result with an interface + a single safe cast like the inventory routes do), no comments, `@/` imports.

**Commit:** `feat: add analytics metrics API`.

---

## Task 4: Dashboard chart components

**Files:** Create the six analytics component folders (each `Component.tsx` + `types.ts`).

All are `'use client'`, use shadcn `ChartContainer`/`ChartConfig` from `@/components/ui/chart` + Recharts, animate on load (Recharts default `isAnimationActive`), use `formatCurrency` for value labels, and design-system semantic classes. Props are the typed metric slices from `@/types/analytics`.

- `MetricCards` — props `{ summary: AnalyticsSummary }`. Three `card`s: Total Revenue (`formatCurrency`), Transactions (count), Avg Order Value (`formatCurrency`).
- `RevenueChart` — props `{ data: RevenuePoint[] }`. Recharts `AreaChart` (animated) of revenue over date; x = date, y = revenue. Empty-state message when no data.
- `TopProductsChart` — props `{ data: TopProduct[] }`. Horizontal `BarChart` (layout="vertical"), product name vs revenue.
- `CategorySalesChart` — props `{ data: CategorySalesSlice[] }`. Donut `PieChart` (inner radius) with legend; colors from `chart-1..5` tokens.
- `PaymentBreakdownChart` — props `{ data: PaymentBreakdownSlice[] }`. `BarChart` or donut of revenue by method (cash/qris/gateway labels).
- `StaffPerformance` — props `{ data: StaffPerformanceRow[] }`. A shadcn `Table` listing cashier name, revenue (`formatCurrency`), transactions.

Each component handles empty data gracefully (render an empty-state, not a crash). No `any`, no comments. React Compiler is on — do NOT use `memo`/`useMemo`.

**Commit:** `feat: add analytics dashboard chart components`.

---

## Task 5: Analytics dashboard page + AnalyticsClient + nav

**Files:** Create `src/components/features/analytics/AnalyticsClient/AnalyticsClient.tsx` (+ `types.ts`), `src/app/(dashboard)/[businessId]/analytics/page.tsx`. Modify `src/lib/navigation.ts` + `src/tests/lib/navigation.test.ts`.

**`AnalyticsClient`** (`'use client'`, props `{ businessId: string }`):
- Date-range selector: preset buttons (Today / This Week / This Month) + a custom range using shadcn `calendar`/`popover`. State holds `{ start, end }`.
- Fetches `/api/analytics?businessId=&start=&end=` on mount and when range changes (`useState` + `useEffect`, loading + error states).
- Renders `MetricCards`, `RevenueChart`, a grid of `TopProductsChart` + `CategorySalesChart`, `PaymentBreakdownChart`, `StaffPerformance` from the returned `DashboardMetrics`.

**`page.tsx`** (server component, mirror inventory page gating):
- `metadata` (title 'Analytics - Ngepos', description, openGraph siteName 'Ngepos').
- `params: Promise<{ businessId }>`; `requireBusinessAccess`; `getCurrentSubscription` → `features.analytics`.
- If no analytics feature → `<PageShell><NoticeCard title="Analytics requires the Pro plan" .../></PageShell>`.
- Else if `!canViewAnalytics(member.role)` → `NoticeCard` access-denied.
- Else `<PageShell title="Analytics" subtitle={business.name}><AnalyticsClient businessId={businessId} /></PageShell>`.

**Navigation:** In `getNavItems`, add (gated):
- Analytics (`/${businessId}/analytics`, key `'analytics'`) when `features.analytics && canViewAnalytics(role)`.
- Reports (`/${businessId}/reports`, key `'reports'`) when `canViewReports(role)`.
- Settings (`/${businessId}/settings`, key `'settings'`) when `canAccessBusinessSettings(role)` (owner-only).

Pass `features` already available in the layout. Update `navigation.test.ts`: owner+pro now expects `['pos','inventory','staff','analytics','reports','settings']`; cashier+pro expects `['pos']`; manager+pro expects `['pos','inventory','reports','analytics']` order per insertion — assert by set membership to avoid order brittleness; owner+starter excludes analytics (no feature) but includes reports+settings. Add Settings/Analytics/Reports lucide icons to `Sidebar.tsx` ICONS map (`BarChart3`, `FileText`, `Settings`).

**Commit:** `feat: add analytics dashboard page and navigation`.

---

## Task 6: Manual CSV export (lib TDD + API)

**Files:** Create `src/lib/export/csv.ts`, `src/tests/lib/export/csv.test.ts`, `src/app/api/reports/export/route.ts`.

**`src/lib/export/csv.ts`:**
```typescript
export interface CsvTransactionRow {
  id: string;
  created_at: string;
  cashier_name: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
}

export function transactionsToCsv(rows: CsvTransactionRow[]): string {
  const header = ['Transaction ID','Date','Cashier','Payment Method','Status','Subtotal','Discount','Tax','Total'];
  const escape = (value: string): string =>
    /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  const lines = rows.map((r) => [
    r.id, r.created_at, r.cashier_name, r.payment_method, r.payment_status,
    String(r.subtotal), String(r.discount_amount), String(r.tax_amount), String(r.total),
  ].map(escape).join(','));
  return [header.join(','), ...lines].join('\n');
}
```

**TDD:** test header row present; a row renders all fields; a cashier name containing a comma/quote is escaped; empty rows → header only. Write → fail → implement → pass.

**`GET /api/reports/export?businessId=&start=&end=`:**
- Auth 401; `businessId` 400; membership 403; `canViewReports(member.role)` 403.
- Fetch paid transactions in range; resolve cashier names via `createAdminClient()`; map to `CsvTransactionRow[]`; `transactionsToCsv(...)`.
- Return `new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="transactions-<start>-<end>.csv"' } })`.
- No `any`, no comments.

**Commit:** `feat: add CSV transaction export`.

---

## Task 7: Manual PDF export (client jsPDF) + Reports page

**Files:** Run `pnpm add jspdf jspdf-autotable`. Create `src/lib/export/pdf.ts`, `src/components/features/reports/ExportReports/ExportReports.tsx` (+ `types.ts`), `src/app/(dashboard)/[businessId]/reports/page.tsx`.

**`src/lib/export/pdf.ts`** (client-only helper):
```typescript
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '@/lib/format';
import type { CsvTransactionRow } from '@/lib/export/csv';

export function generateTransactionsPdf(businessName: string, rows: CsvTransactionRow[]): jsPDF {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`${businessName} — Transactions`, 14, 18);
  autoTable(doc, {
    startY: 26,
    head: [['Date','Cashier','Method','Status','Total']],
    body: rows.map((r) => [r.created_at, r.cashier_name, r.payment_method, r.payment_status, formatCurrency(r.total)]),
  });
  return doc;
}
```

**`ExportReports`** (`'use client'`, props `{ businessId: string; businessName: string }`):
- Date-range selector (reuse the preset/custom pattern).
- "Export CSV" → `window.location.href = /api/reports/export?businessId=&start=&end=` (browser downloads).
- "Export PDF" → fetch the same data as JSON from a small `format=json` branch of the export API (add `format` param: `json` returns `CsvTransactionRow[]` + `businessName`; default returns CSV), then `generateTransactionsPdf(...).save('transactions.pdf')`.
  - Update Task 6's route to accept `&format=json` returning `{ businessName, rows }` JSON; default stays CSV.

**`reports/page.tsx`** (server component): metadata; `requireBusinessAccess`; if `!canViewReports(member.role)` → `NoticeCard`; else `<PageShell title="Reports" subtitle={business.name}><ExportReports businessId={businessId} businessName={business.name} /></PageShell>`.

**Commit:** `feat: add PDF export and reports page`.

---

## Task 8: Report settings — schema + API + UI + settings page

**Files:** Create `supabase/migrations/006_report_settings.sql`, `src/app/api/businesses/[id]/report-settings/route.ts`, `src/components/features/settings/ReportSettings/ReportSettings.tsx` (+ `types.ts`), `src/app/(dashboard)/[businessId]/settings/page.tsx`. Add a Zod schema in `src/validations/business.ts` if validation fits the existing pattern.

**`006_report_settings.sql`:**
```sql
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS report_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS report_channel TEXT DEFAULT 'email'
  CHECK (report_channel IN ('email', 'whatsapp'));
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS report_recipient TEXT;
```
(No new RLS — `businesses` already has owner-scoped update policy.)

**`/api/businesses/[id]/report-settings`** (`params: Promise<{ id }>`):
- `GET`: auth 401; membership 403; return `{ report_enabled, report_channel, report_recipient }` for the business (members may read).
- `PATCH`: auth 401; verify caller is the business **owner** (`canAccessBusinessSettings(member.role)`) → 403; validate body (`report_enabled: boolean`, `report_channel: 'email'|'whatsapp'`, `report_recipient: string`), update the `businesses` row, return updated config. No `any`, no comments.

**`ReportSettings`** (`'use client'`, props `{ businessId: string; planHasAutomatedReports: boolean }`):
- Fetches current config; renders a `switch` (enabled), a `select` (email/whatsapp), an `input` (recipient email or WA number). Save → PATCH. If `!planHasAutomatedReports`, render a `NoticeCard`-style upsell and disable the form.

**`settings/page.tsx`** (server component): metadata; `requireBusinessAccess`; if `!canAccessBusinessSettings(member.role)` → `NoticeCard` access-denied; else compute `features.automatedReports` and render `<PageShell title="Settings" subtitle={business.name}><ReportSettings businessId={businessId} planHasAutomatedReports={...} /></PageShell>`.

**Commit:** `feat: add report settings schema, API, and UI`.

---

## Task 9: Automated monthly report Edge Function + pg_cron

**Files:** Create `supabase/functions/monthly-report/index.ts`, `supabase/migrations/007_monthly_report_cron.sql`.

**`supabase/functions/monthly-report/index.ts`** (Deno; authored, not locally runtime-tested):
- Use `@supabase/supabase-js` with the service-role key (from `Deno.env`).
- Compute previous full month range `[firstOfPrevMonth, firstOfThisMonth)`.
- Select all `businesses WHERE report_enabled = true`.
- For each business: only proceed if the owner's subscription plan has `automatedReports` (join `subscriptions` by `owner_id`/`user_id`, plan in `('pro','enterprise')`). Aggregate previous-month paid transactions: total revenue, transaction count, top 5 products (by item subtotal), and low-stock count (`products` where `track_stock` and `stock_qty <= low_stock_threshold` and threshold not null). Build a `MonthlyReportData`-shaped summary.
- Deliver per `report_channel`:
  - `email`: POST to Resend API (`https://api.resend.com/emails`, `Authorization: Bearer ${RESEND_API_KEY}`) with an HTML body summarizing the metrics, `to: report_recipient`.
  - `whatsapp`: POST to Fonnte (`https://api.fonnte.com/send`, header `Authorization: ${FONNTE_API_KEY}`, body `target=<recipient>&message=<text summary>`).
- Wrap each business in try/catch so one failure doesn't abort the batch; return a JSON summary `{ processed, sent, failed }`. No `any`.

**`007_monthly_report_cron.sql`:**
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'monthly-report',
  '0 6 1 * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.edge_url', true) || '/functions/v1/monthly-report',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true), 'Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  $$
);
```
Add a header comment-free note in the plan (not the SQL): the deployer must set `app.settings.edge_url` and `app.settings.service_role_key` (or hardcode the project URL) and deploy the function via `supabase functions deploy monthly-report`. This task is authored and reviewed for correctness; it cannot be runtime-verified without a deployed Supabase project + Resend/Fonnte keys.

**Commit:** `feat: add automated monthly report edge function and cron schedule`.

---

## Verification

After completion:
- ✅ Analytics dashboard renders all metrics (revenue series, summary/AOV, top products, category sales, payment breakdown, staff performance) for a date range, gated to Pro/Enterprise + `canViewAnalytics`.
- ✅ Aggregation + CSV + format libs have passing unit tests (`pnpm test` green).
- ✅ CSV and PDF exports download for a custom range, gated to `canViewReports`.
- ✅ Report settings persist (`report_enabled`, `report_channel`, `report_recipient`), owner-only PATCH.
- ✅ Edge Function + cron authored; aggregates previous month and dispatches via Resend/Fonnte (verified by code review; runtime requires deployment).
- ✅ Nav shows Analytics/Reports/Settings gated by role + plan.
- ✅ `pnpm lint` / `tsc` introduce no new errors; no `any`, no comments.

**Deferred (documented, not in scope):** F&B table utilization metric (no table data); server-side total recompute (POS integrity follow-up); atomic manual stock-adjust (I2).
