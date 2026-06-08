# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ngepos** is a multi-tenant SaaS POS (Point of Sale) system targeting F&B and retail businesses in Indonesia. A single user can own multiple businesses. Features are gated by subscription plan (Starter / Pro / Enterprise).

Full system design spec: `docs/superpowers/specs/2026-06-08-pos-system-design.md`

## Tech Stack

- **Framework:** Next.js 16.2.7 (App Router, React 19)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + PostCSS
- **UI Components:** shadcn/ui (Base Nova style) + Lucide React icons
- **Charts:** shadcn/ui charts (Recharts) with animations
- **Database/Backend:** Supabase (Postgres + RLS for multi-tenancy)
- **Auth:** Supabase Auth (email/password + Google OAuth)
- **Testing:** Vitest 4 + React Testing Library
- **Linting:** ESLint 9
- **React Compiler:** Enabled — do not manually use `memo()` or `useMemo()`

## Commands

**Only use `pnpm` — never use `npm`, `yarn`, or `bun`.**

```shell
pnpm dev              # Start dev server on http://localhost:3000
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm test             # Run all tests in watch mode
pnpm test:ui          # Interactive test UI dashboard
pnpm test:coverage    # Coverage report
pnpm test <filename>  # Run single test file
```

Add shadcn/ui components: `pnpm dlx shadcn-ui@latest add <component-name>`

## Architecture

### Multi-tenancy Model

The core data hierarchy is: `user → subscription → businesses → business_members`. Every business-scoped table has a `business_id` column. Supabase RLS policies enforce tenant isolation using `auth.uid()` joined through `business_members`. Never fetch cross-business data — always scope queries by `business_id`.

### Plan Enforcement

Plan limits (max businesses, max products, max staff, feature flags) are defined as a static config in `src/lib/plans.ts` (to be created). Every action that touches a limited feature must check the plan config before proceeding and show an upgrade modal if the limit is exceeded. Never enforce limits only in the UI — check server-side too.

### Route Structure (App Router)

```
src/app/
├── (auth)/              # Login, signup, onboarding — no sidebar
├── (dashboard)/
│   ├── [businessId]/
│   │   ├── pos/         # POS transaction screen
│   │   ├── products/    # Product & category management
│   │   ├── inventory/   # Stock management (Pro/Enterprise)
│   │   ├── tables/      # Table management (F&B, Pro/Enterprise)
│   │   ├── staff/       # Staff roles & invitations
│   │   ├── analytics/   # Sales dashboard (Pro/Enterprise)
│   │   ├── reports/     # Export & automated reports
│   │   └── settings/    # Business settings, QRIS upload
│   └── businesses/      # Business switcher / create new
├── billing/             # Subscription management
└── api/                 # Route handlers (webhooks, reports)
```

### Supabase Patterns

- Client singleton: `src/lib/supabase.ts` — use for client components
- For Server Components and Route Handlers, create a server-side client using `createServerClient` from `@supabase/ssr`
- RLS is the security boundary — always write migrations with RLS policies alongside table creation
- Database migrations go in `supabase/migrations/`

### Payment Integrations

- **Subscription billing:** Midtrans or Xendit (merchant's choice); also manual bank transfer
- **POS transactions:** Cash (manual), QRIS (static image upload per business), or gateway (Midtrans/Xendit webhook auto-confirm — Pro/Enterprise only)
- Webhook handlers live in `src/app/api/webhooks/`

### Automated Reports

- Triggered by Supabase `pg_cron` on the 1st of each month
- Edge Function generates report and dispatches via **Resend** (email) or **Fonnte API** (WhatsApp)
- Edge Functions live in `supabase/functions/`

## Key Patterns

- **Path alias:** `@/` resolves to `src/`. Always use `@/` for internal imports.
- **Class merging:** Use `cn()` from `src/lib/utils.ts` for all Tailwind class merges.
- **Server vs Client Components:** Default to Server Components. Add `"use client"` only when needed (interactivity, hooks, browser APIs).
- **Tests:** Write alongside code (`Component.test.tsx` next to `Component.tsx`). Vitest runs in happy-dom.

## Environment Variables

```shell
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # Server-only, never expose to browser
MIDTRANS_SERVER_KEY=            # Server-only
XENDIT_SECRET_KEY=              # Server-only
RESEND_API_KEY=                 # Server-only
FONNTE_API_KEY=                 # Server-only
```

Create `.env.local` from `.env.example`. Restart dev server after changes. Variables without `NEXT_PUBLIC_` prefix are server-only.

## Important Notes

1. **Next.js 16 has breaking changes** from earlier versions. Check `node_modules/next/dist/docs/` before assuming training data applies.
2. **RLS is mandatory** on every new table. No table should be readable without a policy.
3. **Business type matters:** `retail` and `fnb` businesses have different features. F&B gets table management; both get core POS. Always check `business.type` before rendering F&B-specific UI.
4. **Git:** Author: Ngepos / bfernando@student.ciputra.ac.id / Remote: <https://github.com/UCYenyen/Ngepos.git>
