# Storefront Subdomains + Anonymous Customer Ordering — Design

**Date:** 2026-06-10
**Status:** Approved (approval gate waived by owner — proceed without per-step sign-off)

## Goal

Let a business owner publish a public, customer-facing storefront at their own
subdomain. Customers browse the menu and place an order **without logging in**,
identifying themselves only with name, phone, and email. Orders flow into the
dashboard for staff to confirm.

## Subdomain scheme

- Format: **`ngepos-<slug>.thedevo.cloud`** (single DNS label).
- Rationale: production is self-hosted behind nginx-proxy-manager. A single
  wildcard DNS record `*.thedevo.cloud` + a single wildcard TLS cert covers
  every tenant with zero per-tenant DNS/cert operations. The literal 4-label
  form `ngepos.<biz>.thedevo.cloud` is rejected because a `*.thedevo.cloud`
  wildcard cert does not match a 4-label host (wildcards match one label only),
  which would force a separate cert per business.
- `<slug>` defaults to a slugified business name; owner can edit it.
- Constraints: lowercase, `[a-z0-9-]`, 3–30 chars, no leading/trailing/double
  dash. Stored **without** the `ngepos-` prefix or domain; the full host is
  derived. Globally unique. **Max 1 per business** (single nullable unique
  column on `businesses`).
- Reserved slugs blocked: `app`, `www`, `api`, `admin`, `dashboard`, `studio`,
  `supabase`, `mail`, `ngepos`.

## Plan gating

New feature flag `onlineStore` in `src/lib/plans.ts`: `false` on Starter,
`true` on Pro/Enterprise. Claiming/keeping a subdomain and serving the
storefront require the flag (checked server-side, not just UI).

## Data model (migration `025_storefront_subdomains.sql`)

1. `businesses.subdomain TEXT UNIQUE` (nullable), CHECK against the slug regex.
2. Anonymous read RLS so the public storefront can render a published menu:
   - `businesses`: anon `SELECT` allowed `WHERE subdomain IS NOT NULL`.
   - `products` / `categories` / `product_variants`: anon `SELECT` allowed when
     the parent business has a non-null subdomain and the product is active.
   (Reads use these policies via the anon key — no service role for reads.)
3. `online_orders` table:
   - `id, business_id, customer_name, customer_phone, customer_email,
     items jsonb NOT NULL, subtotal, total, note, status, created_at`.
   - `status` enum-like: `pending | confirmed | completed | cancelled`
     (default `pending`).
   - RLS: business members `SELECT`/`UPDATE` via membership join. **No** anon
     RLS insert — inserts happen server-side with the service-role client after
     Zod validation (keeps pricing authoritative server-side).
   - Index on `(business_id, status, created_at desc)`.

## Routing — `src/proxy.ts` (Next.js 16 renamed middleware → proxy)

- Folded into the existing `proxy.ts` auth proxy, BEFORE the auth check so
  public storefront requests are never redirected to `/login`.
- Read `Host`. If it ends with the storefront root domain
  (`NEXT_PUBLIC_STOREFRONT_DOMAIN`, default `thedevo.cloud`) and the first label
  matches `ngepos-<slug>` (and `<slug>` is not reserved), `rewrite` the request
  to `/store/<slug>` + original path.
- Requests on the primary app domain pass through unchanged (dashboard, auth).
- `/store/**` is public; middleware never gates it behind auth.

## Routes

- `src/app/store/[subdomain]/page.tsx` — menu browse (server component, anon
  read). Resolves business by subdomain; 404 if none / not on a paid plan.
- `src/app/store/[subdomain]/` client cart + checkout form (name/phone/email,
  Zod-validated). Submits via a server action → service-role insert into
  `online_orders`.
- `src/app/store/[subdomain]/success` — order confirmation.
- `src/app/dashboard/[businessId]/orders/` — incoming online orders list;
  confirm / complete / cancel actions. Added to dashboard nav, gated by
  `onlineStore`.
- `src/app/dashboard/[businessId]/settings` — new "Storefront" section to claim
  / edit the subdomain with live `ngepos-<slug>.thedevo.cloud` preview and
  availability check.

## Types / validation

- `src/types/storefront.ts`: `OnlineOrder`, `OnlineOrderItem`, `OrderStatus`,
  `StorefrontBusiness`.
- `src/validations/storefront.ts`: `subdomainSchema`, `checkoutSchema`
  (customer fields + items), with `validateSubdomain` / `validateCheckout`.

## Slices (each independently shippable)

1. **Foundation**: migration, `onlineStore` flag, types, validations, middleware
   host routing, storefront URL helpers in `src/lib/site.ts`.
2. **Owner claim UI**: settings Storefront section + availability API.
3. **Public storefront**: menu + cart + anonymous checkout + success.
4. **Dashboard orders**: incoming-order management + nav entry.

## Infra (owner runs once on the VPS — out of band)

1. DNS: `*.thedevo.cloud` A record → VPS IP (or CNAME to the app host).
2. NPM: wildcard proxy host `*.thedevo.cloud` → app container, with a wildcard
   Let's Encrypt cert (DNS-01 challenge).
3. App env: `NEXT_PUBLIC_STOREFRONT_DOMAIN=thedevo.cloud`,
   `NEXT_PUBLIC_APP_DOMAIN=<primary app host>`.

## Out of scope (later)

Online payment for storefront orders (QRIS/gateway), order status push to the
customer (WhatsApp/email), table selection for dine-in, menu theming.
