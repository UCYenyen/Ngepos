# Ngepos — POS System Design Spec

**Date:** 2026-06-08  
**Status:** Approved  

---

## Overview

Ngepos is a versatile multi-tenant SaaS POS (Point of Sale) system targeting both F&B and retail businesses in Indonesia. A single user account can own and manage multiple businesses. Features and business limits are gated by subscription plan.

**Architecture:** Monolithic Next.js 16 (App Router) + Supabase. Multi-tenancy enforced via Supabase Row Level Security (RLS). One codebase, one database.

---

## System Decomposition

Built in 4 sequential sub-projects:

1. **Foundation** — Auth, multi-tenancy, subscription plans, billing
2. **POS Core** — Products, cart, transactions, payments, receipts
3. **Operations** — Inventory, table management (F&B), staff roles
4. **Analytics & Automation** — Sales dashboard, reports, automated monthly delivery

---

## Sub-project 1: Foundation

### Data Model

```sql
-- Supabase Auth handles users (id, email, full_name, avatar_url)

businesses
  id uuid PK
  owner_id uuid → auth.users
  name text
  type text CHECK (type IN ('retail', 'fnb'))
  logo_url text
  address text
  timezone text DEFAULT 'Asia/Jakarta'
  currency text DEFAULT 'IDR'
  created_at timestamptz

subscriptions
  id uuid PK
  user_id uuid → auth.users
  plan text CHECK (plan IN ('starter', 'pro', 'enterprise'))
  billing_cycle text CHECK (billing_cycle IN ('monthly', 'yearly'))
  status text CHECK (status IN ('active', 'past_due', 'cancelled'))
  period_start timestamptz
  period_end timestamptz
  payment_provider text CHECK (payment_provider IN ('midtrans', 'xendit', 'manual'))

business_members
  id uuid PK
  business_id uuid → businesses
  user_id uuid → auth.users
  role text CHECK (role IN ('owner', 'manager', 'cashier'))
  created_at timestamptz

invitations
  id uuid PK
  business_id uuid → businesses
  email text
  role text
  token text UNIQUE
  expires_at timestamptz
  accepted_at timestamptz
```

### Plan Limits (static config in code)

| Feature                | Starter | Pro    | Enterprise  |
|------------------------|---------|--------|-------------|
| Businesses             | 1       | 5      | Unlimited   |
| Products per business  | 100     | 1,000  | Unlimited   |
| Staff per business     | 2       | 10     | Unlimited   |
| Inventory management   | ❌      | ✅     | ✅          |
| Table management       | ❌      | ✅     | ✅          |
| Analytics dashboard    | ❌      | ✅     | ✅          |
| Automated reports      | ❌      | ✅     | ✅          |
| Payment gateway (POS)  | ❌      | ✅     | ✅          |

### Auth & Onboarding

- **Providers:** Email/password + Google OAuth — both via Supabase Auth
- **Onboarding flow** (first login only):
  1. Choose plan (Starter/Pro/Enterprise) + billing cycle (monthly/yearly)
  2. Create first business (name, type: retail or F&B)
  3. Land on business dashboard
- **Adding more businesses:** gated by plan limit; shows upgrade prompt if limit reached
- **Staff invitation:** owner/manager invites by email → invite token → staff creates account or logs in → joins business with assigned role

### Subscription & Billing

- **Yearly discount:** 2 months free (pay 10 months, get 12)
- **Payment options for subscription:**
  - Midtrans (Indonesian gateway)
  - Xendit (Indonesian gateway)
  - Manual (bank transfer, admin confirms)
- **Lifecycle:** active → past_due (payment failed, grace period 3 days) → cancelled
- **Upgrade:** instant, prorated
- **Downgrade:** takes effect at end of current billing period
- **Plan enforcement:** every feature action checks plan config before proceeding; shows upgrade modal if limit exceeded

---

## Sub-project 2: POS Core

### Additional Tables

```sql
categories
  id, business_id, name, color, created_at

products
  id, business_id, category_id, name, sku, price, image_url
  has_variants bool, track_stock bool, created_at

product_variants
  id, product_id, name (e.g. "Large / Red"), price_modifier, sku, stock_qty

transactions
  id, business_id, cashier_id, table_id (nullable)
  subtotal, discount_amount, tax_amount, total
  payment_method text (cash|qris|gateway)
  payment_status text (pending|paid|cancelled)
  gateway_reference text
  notes text, created_at

transaction_items
  id, transaction_id, product_id, variant_id (nullable)
  name (snapshot), price (snapshot), quantity, discount_amount, subtotal

-- F&B only
tables
  id, business_id, name, capacity, status (available|occupied|reserved)

table_orders
  id, table_id, transaction_id (nullable), status (pending|in_progress|served|paid)
  opened_at, closed_at
```

### Transaction Flow

1. Cashier selects products → builds cart (qty, variants, per-item discount)
2. Apply order-level discount and tax
3. Select payment method:
   - **Cash** — input amount received, system calculates change
   - **QRIS** — display merchant's uploaded static QRIS image; cashier confirms manually
   - **Gateway** — Midtrans/Xendit generates payment link or QR; auto-confirms on webhook (Pro/Enterprise only)
4. Transaction saved → receipt generated

### F&B Table Flow

- Cashier selects table → creates table order → adds items
- Kitchen view: read-only screen showing pending orders per table
- Actions: split bill, merge tables, transfer to another table
- Order status: pending → in progress → served → paid

### Receipt

- Contains: business name + logo, transaction ID, date/time, items, subtotal, discount, tax, total, payment method
- Share options: print, WhatsApp (wa.me link with pre-filled message), email

### QRIS Setup

- Per-business: owner uploads static QRIS image in business settings
- Displayed full-screen during QRIS payment step

---

## Sub-project 3: Operations

### Inventory (Pro/Enterprise only)

```sql
stock_movements
  id, business_id, product_id, variant_id (nullable)
  type text (sale|restock|adjustment|damage)
  quantity_change int
  note text, created_by, created_at

suppliers
  id, business_id, name, contact_phone, contact_email, address, notes
```

- Stock auto-decrements on each transaction
- Manual stock adjustment (restock, damage, audit correction)
- Low stock alert: configurable threshold per product; shown in dashboard and email alert
- Full stock movement history with actor and reason

### Staff Roles & Permissions

| Permission              | Owner | Manager | Cashier      |
|-------------------------|-------|---------|--------------|
| View analytics          | ✅    | ✅      | ❌           |
| Manage products         | ✅    | ✅      | ❌           |
| Manage inventory        | ✅    | ✅      | ❌           |
| Process transactions    | ✅    | ✅      | ✅           |
| Apply discounts         | ✅    | ✅      | Configurable |
| Manage staff            | ✅    | ❌      | ❌           |
| View reports            | ✅    | ✅      | ❌           |
| Business settings       | ✅    | ❌      | ❌           |

- A user can hold different roles in different businesses
- "Configurable" discount for cashier: owner can toggle on/off in business settings

---

## Sub-project 4: Analytics & Automation

### Sales Dashboard (Pro/Enterprise only)

Built with **shadcn/ui charts (Recharts)** with animations. All charts animate on load.

**Metrics displayed:**
- Revenue: today / this week / this month / custom range (animated area/bar chart)
- Transaction count & average order value
- Top 5 selling products (horizontal bar chart)
- Sales by category (pie/donut chart)
- Payment method breakdown (cash vs QRIS vs gateway)
- Staff performance: revenue per cashier
- F&B only: table utilization rate

### Manual Reports

- Export transactions as CSV or PDF for any custom date range
- Available to owner and manager

### Automated Monthly Reports (Pro/Enterprise only)

- Sent on the 1st of each month, covering the previous full month
- **Contents:** total revenue, total transactions, top 5 products, low stock summary
- **Delivery:** merchant chooses per business — **email** or **WhatsApp**
  - Email: via Supabase Edge Function + Resend (or SMTP)
  - WhatsApp: via Fonnte API (simple HTTP POST)
- **Configuration:** in business settings — toggle on/off, channel (email/WA), recipient address/number
- **Implementation:** Supabase cron job (pg_cron) triggers Edge Function on 1st of month

---

## Tech Stack Decisions

| Concern | Choice |
|---|---|
| Framework | Next.js 16 App Router |
| Database | Supabase (Postgres + RLS) |
| Auth | Supabase Auth (email + Google OAuth) |
| UI | shadcn/ui + Tailwind CSS 4 |
| Charts | shadcn/ui charts (Recharts) with animations |
| Indonesian Payment Gateway | Midtrans or Xendit |
| WhatsApp notifications | Fonnte API |
| Email notifications | Resend |
| Scheduled jobs | Supabase pg_cron + Edge Functions |
| Package manager | pnpm (strictly) |

---

## Verification Plan

After each sub-project:

1. **Foundation:** Sign up with email and Google, complete onboarding, create business, hit plan limit and verify upgrade prompt, invite staff member and verify role-scoped access
2. **POS Core:** Process cash/QRIS/gateway transactions, verify receipt, test F&B table flow (split, merge, transfer)
3. **Operations:** Add product with stock, process sale, verify stock decrements, trigger low-stock alert, test staff permission gates
4. **Analytics:** Verify all dashboard metrics match raw transaction data, trigger test monthly report via edge function, confirm email and WhatsApp delivery
