# QR Table Ordering — Design Spec

**Date:** 2026-06-10
**Status:** Approved (pending implementation plan)

## 1. Overview

Let dine-in customers scan a per-table QR code, browse the restaurant's menu on
their own phone, add orders into a single table session (tab), and pay at the
end with **Xendit** (online) or **Cash** (staff-confirmed). Customer order rounds
auto-accept into the same `table_orders` session staff already see in the POS,
with staff able to void lines and confirm cash.

This builds on the existing BYO-Xendit payment integration: online payments go
directly to the merchant's own connected Xendit account. The platform never
custodies funds — cash is reported but settled physically, Xendit balances are
withdrawn by the merchant via Xendit's own dashboard.

## 2. Goals & non-goals

### Goals
- Anonymous customers (no login) order from a table QR.
- One open session per table; multiple rounds; **auto-accept** into the tab.
- Staff void capability; live updates via Supabase Realtime.
- Pay-at-end with **Xendit** or **Cash**.
- Cash is tracked as revenue but is non-withdrawable; owner sees cash vs Xendit
  totals.

### Non-goals (v1 — explicit YAGNI)
- Per-item customer notes / special requests.
- Bill splitting, tipping, customer accounts/history.
- Rate-limiting, QR rotation/expiry (flagged as follow-ups).
- Kitchen Display System — staff use the existing POS/Tables screens.

## 3. Decisions (from brainstorming)

| Topic | Decision |
|-------|----------|
| Session/payment lifecycle | One tab per table, pay once at the end |
| Payment methods | Xendit (online) **or** Cash |
| Cash settlement | Staff-confirmed: customer flags "bayar tunai", staff collect + confirm in POS |
| Cash vs Xendit | Both are revenue; cash non-withdrawable; withdrawal only via merchant Xendit |
| Order acceptance | Auto-accept into tab; staff can void lines |
| Staff updates | Live via Supabase Realtime |
| Variants | Supported (customer picks variant like staff do) |
| Out-of-stock | Shown disabled ("Habis") |
| Architecture | Public service-role API + per-table token; RLS untouched |
| Gating | F&B + plan that includes tables (Pro/Enterprise) |
| Xendit UX | Redirect customer straight to the Xendit invoice (they're on mobile) |

## 4. Architecture

**Approach A — Public service-role API + per-table token.**

Customers use a public, unauthenticated page (`/order/[token]`). All reads and
writes go through new `/api/public/...` endpoints that resolve the table token
server-side and use the service-role (admin) Supabase client. The multi-tenant
RLS boundary is **not modified**; the only public surface is these narrow,
validated endpoints.

Staff receive live updates through their existing authenticated Supabase client
subscribing to `table_orders` via Realtime (existing member RLS already governs
read access).

Rejected alternatives: anon-role RLS policies keyed on the table token (too
risky to get right across multi-tenant tables on a payments system); anonymous
Supabase Auth sessions (throwaway users + extra mapping for little gain).

## 5. Data model (migration 023)

```sql
-- Per-table opaque token for the QR URL.
ALTER TABLE tables
  ADD COLUMN IF NOT EXISTS public_token UUID UNIQUE DEFAULT gen_random_uuid();
-- Backfill existing rows (DEFAULT covers new rows; ensure existing get a value).

-- Customer checkout signalling on the open session.
ALTER TABLE table_orders
  ADD COLUMN IF NOT EXISTS pending_payment_method TEXT
    CHECK (pending_payment_method IN ('cash', 'xendit')),
  ADD COLUMN IF NOT EXISTS checkout_requested_at TIMESTAMPTZ;
-- Existing table_orders.transaction_id links the gateway transaction created at
-- Xendit checkout; existing status/items/opened_at/closed_at are reused.

-- Enable Realtime for staff live updates.
ALTER PUBLICATION supabase_realtime ADD TABLE table_orders;
```

Notes:
- `tables` already has: id, business_id, name, capacity, status.
- `table_orders` already has: id, table_id, transaction_id, status
  (`pending|in_progress|served|paid|cancelled`), items (jsonb), opened_at,
  closed_at. One-open-tab-per-table is enforced by `idx_table_orders_open`.

## 6. Customer flow (public, mobile-first)

New route group **outside** `(dashboard)` / auth — `src/app/order/[token]/`:

1. **Menu** — business name/logo + table name; products grouped by category;
   item cards (image, name, price); variant picker for variant products;
   out-of-stock items shown disabled ("Habis").
2. **Cart + submit round** — "Kirim pesanan" appends the round to the tab
   (auto-accept). A running list of all submitted rounds + total stays visible.
3. **Checkout** — "Selesai & Bayar" → choose:
   - **Xendit:** redirect to the Xendit invoice URL on the same device; on
     return, poll until paid → thank-you screen.
   - **Cash:** show "panggil staff untuk bayar tunai"; session flagged for staff.
4. **Done** — thank-you screen; session closed once paid.

Components live under `src/components/features/order/` (e.g. `OrderMenu`,
`OrderCart`, `OrderCheckout`, `OrderVariantPicker`), reusing variant logic from
the existing POS `VariantPicker` where practical.

## 7. Public API (`/api/public/...`, service-role)

All endpoints resolve the table via `public_token`, scope strictly to its
business, and **recompute item prices/totals from the database** — never trust
client-supplied prices (anti-tamper).

| Endpoint | Purpose |
|----------|---------|
| `GET /api/public/menu/[token]` | Business info + categories + products(+variants) + available payment methods (Xendit only if the business has a connected key) |
| `GET /api/public/session/[token]` | Current open tab: items, totals, status, pending_payment_method |
| `POST /api/public/session/[token]/items` | **Merge** a new round into the existing tab items (server reads current `items`, appends/combines, writes back); create `table_order` (status `in_progress`) if none. Note: unlike the existing staff `POST /api/table-orders` which *replaces* `items`, the public endpoint must merge so prior rounds are preserved |
| `POST /api/public/session/[token]/checkout` | `{method}`: cash → set `pending_payment_method='cash'` + `checkout_requested_at`; xendit → create pending gateway transaction + Xendit invoice (business key), link via `transaction_id`, return `invoiceUrl` |
| `POST /api/public/session/[token]/verify` | Poll the linked transaction's Xendit invoice; on paid → settle transaction (`paid`) and tab (`paid` + `closed_at`) |

Server-side totals must stay consistent with `create_pos_transaction` (tax rate,
discounts). Items submitted by the customer are `{product_id, variant_id?,
quantity}`; name/price are resolved server-side.

## 8. Staff / POS integration

- POS (`POSClient`) and Tables (`TablesClient`) subscribe to `table_orders`
  changes via Supabase Realtime (authenticated client). New rounds and
  "wants to pay cash" appear instantly without manual refresh.
- **Void:** existing open-tab editing (select table → load items → remove line →
  save tab) already covers staff removing lines.
- **Cash confirm:** when `pending_payment_method='cash'`, the table surfaces a
  "Terima pembayaran tunai" action that settles via the existing
  `POST /api/transactions` cash path (already links + marks the tab paid). On
  settle, clear `pending_payment_method` / `checkout_requested_at`.
- **Xendit:** settles automatically from the customer's payment; staff see the
  table flip to paid via Realtime.

## 9. Revenue visibility

Customer sales are ordinary `transactions` rows with `payment_method`
(`cash` / `gateway`), so they already feed the existing analytics
`PaymentBreakdownChart`. Ensure that chart clearly separates and labels
**Cash (non-withdrawable)** vs **Xendit** so owners see exactly what is
withdrawable. Withdrawal itself remains on the merchant's Xendit dashboard.

## 10. Security

- Per-table opaque UUID token; physical possession of the QR is the access
  control (acceptable for dine-in). Every public call validates the token and
  scopes to its business.
- RLS remains fully locked; the only public surface is the narrow
  `/api/public/...` endpoints, all using the service-role client server-side.
- Prices/totals are always recomputed server-side.
- Rate-limiting on public endpoints is a follow-up (note abuse vector: spamming
  order rounds). Consider a simple per-token throttle in a later iteration.

## 11. Dependencies / preconditions

- **Supabase Realtime** must be enabled on the self-hosted stack (standard
  bundle, behind Kong). If unavailable, fall back to short polling (~5–10s) on
  the staff side.
- A business must have **connected Xendit** (BYO key flow) for the online-pay
  option; otherwise the customer sees Cash only.
- F&B business type + a plan that includes tables (Pro/Enterprise).

## 12. Open follow-ups (post-v1)

- Rate-limiting / abuse protection on public endpoints.
- QR rotation / per-session expiry.
- Per-item notes, bill splitting, tipping.
- Optional customer-facing live order status (kitchen → served).
