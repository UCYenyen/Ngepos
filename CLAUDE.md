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

## Type System & Code Organization

### Strict Typing Rules

- **No `any` type** — ever. Use proper interfaces or types.
- All types must be placed in `src/types/` folder, organized by domain:

```plaintext
src/types/
├── auth.ts
├── business.ts
├── product.ts
├── pos.ts
└── common.ts
```

- Use `interface` for object contracts, `type` for unions and primitives.
- Generic types and shared utilities go in `src/types/common.ts`.

### Component Organization

Components are organized by feature in `src/components/<feature_name>/`:

```
src/components/
├── auth/                # Auth-related components
├── pos/                 # POS transaction components
├── products/            # Product management components
├── inventory/           # Inventory management components
├── tables/              # Table management components
├── staff/               # Staff management components
├── analytics/           # Analytics/dashboard components
├── reports/             # Report components
├── settings/            # Settings components
├── common/              # Shared UI components (buttons, inputs, modals, etc.)
└── layout/              # Layout wrappers (sidebar, header, etc.)
```

### Hooks Organization

Custom hooks are organized by feature in `src/hooks/<feature_name>/`:

```
src/hooks/
├── auth/
│   ├── useAuth.ts
│   └── useSession.ts
├── pos/
│   ├── useTransaction.ts
│   └── useCart.ts
├── products/
│   ├── useProducts.ts
│   └── useCategories.ts
├── business/
│   ├── useBusiness.ts
│   └── useBusinessMembers.ts
└── common/
    ├── useAsync.ts
    └── useLocalStorage.ts
```

- Each hook file should contain only one primary hook (small utility hooks can coexist).
- Hooks must have proper return types, never `any`.
- Hooks can import from `src/types/` for type safety.

### Code Quality Standards

- **No comments** — code should be self-documenting through clear naming and structure.
- Create components whenever logic can be isolated (threshold: ~20 lines of JSX or reusable logic).
- Extract hooks for repeated state or side-effect logic.
- Prefer composition over inheritance.
- Use TypeScript strict mode — all parameters and return types must be explicit.

### SEO & Metadata

Every page route must include metadata:

```typescript
// app/[businessId]/pos/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'POS - Ngepos',
  description: 'Point of Sale transaction management system',
  openGraph: {
    title: 'POS - Ngepos',
    description: 'Point of Sale transaction management system',
    url: 'https://ngepos.com/pos',
    siteName: 'Ngepos',
  },
};

export default function POSPage() {
  return (
    // page content
  );
}
```

- Every page needs `title` and `description`.
- Provide `openGraph` for social sharing.
- Use dynamic metadata where needed (e.g., business name in title).

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
