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

```plaintext
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
- **Tests:** All unit tests live in the `src/tests/` folder, which mirrors the rest of the `src/` directory tree — never colocated with source (see [Testing Organization](#testing-organization)). Vitest runs in happy-dom.

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

Feature components are organized by feature with each component in its own folder in `src/components/features/<feature_name>/<component_name>/`. Shared `common` and `layout` components stay at the top level of `src/components/` since they are not feature-specific:

```plaintext
src/components/
├── features/
│   ├── auth/
│   │   ├── LoginForm/
│   │   │   ├── LoginForm.tsx
│   │   │   └── types.ts
│   │   └── SignupForm/
│   │       ├── SignupForm.tsx
│   │       └── types.ts
│   ├── pos/
│   │   ├── TransactionCart/
│   │   │   ├── TransactionCart.tsx
│   │   │   └── types.ts
│   │   └── PaymentMethod/
│   │       ├── PaymentMethod.tsx
│   │       └── types.ts
│   ├── products/
│   │   ├── ProductCard/
│   │   │   ├── ProductCard.tsx
│   │   │   └── types.ts
│   │   └── CategoryFilter/
│   │       ├── CategoryFilter.tsx
│   │       └── types.ts
│   ├── inventory/
│   ├── tables/
│   ├── staff/
│   ├── analytics/
│   ├── reports/
│   └── settings/
├── common/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── types.ts
│   ├── Input/
│   │   ├── Input.tsx
│   │   └── types.ts
│   ├── Modal/
│   │   ├── Modal.tsx
│   │   └── types.ts
│   └── Card/
│       ├── Card.tsx
│       └── types.ts
└── layout/
    ├── Sidebar/
    │   ├── Sidebar.tsx
    │   └── types.ts
    └── Header/
        ├── Header.tsx
        └── types.ts
```

**Component Folder Structure Rules:**

- Feature components live under `features/`: `src/components/features/<FeatureName>/<ComponentName>/`
- Shared components live at the top level: `src/components/common/<ComponentName>/` and `src/components/layout/<ComponentName>/`
- Each component gets its own folder containing `ComponentName.tsx` and `types.ts` (component-specific types)
- Unit tests do **not** live beside the component — they go in the `src/tests/` folder (see [Testing Organization](#testing-organization))
- Component file should be the primary export
- Keep types colocated with the component for context

### Hooks Organization

Custom hooks are organized by feature in `src/hooks/<feature_name>/`:

```plaintext
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

### Validation Organization

All validation logic is centralized in `src/validation/` using **Zod** for schema validation:

```plaintext
src/validation/
├── common.ts            # Shared Zod schemas (email, password, currency, etc.)
├── auth.ts              # Auth schemas: loginSchema, signupSchema, resetPasswordSchema
├── business.ts          # Business schemas: createBusinessSchema, businessSettingsSchema
├── product.ts           # Product schemas: productSchema, categorySchema, bulkProductSchema
├── pos.ts               # POS schemas: transactionSchema, refundSchema, paymentMethodSchema
├── staff.ts             # Staff schemas: staffMemberSchema, staffPermissionsSchema, staffRoleSchema
└── index.ts             # Clean exports
```

**Validation with Zod:**

Each validation domain exports:

- **Schemas:** Zod `z.object()` definitions (e.g., `loginSchema`, `productSchema`)
- **Types:** Automatically inferred types using `z.infer<typeof schema>` (e.g., `LoginInput`)
- **Validate functions:** Async functions that return `{ success: boolean; data?: T; errors?: FieldErrors }`

**Example Usage:**

```typescript
import { loginSchema, validateLogin, type LoginInput } from '@/validation/auth';

const handleSubmit = async (formData: LoginInput) => {
  const result = await validateLogin(formData);
  
  if (!result.success) {
    setErrors(result.errors);
    return;
  }
  
  await submitLogin(result.data);
};
```

**Validation Rules:**

- Use Zod schemas for all form data validation
- Type-safe validation through `z.infer<typeof schema>`
- Compose schemas using common patterns (`.email()`, `.min()`, `.max()`, `.refine()`)
- Validate on both client (UX) and server (security) sides
- Custom validation logic via `.refine()` or `.superRefine()` for cross-field validation
- Async validation functions handle Zod errors and return structured results

### Testing Organization

All unit tests live in the `src/tests/` folder, which mirrors the rest of the `src/` directory tree. Tests are **never** colocated with source files. Import the unit under test through the `@/` alias so a test's location stays decoupled from the source it covers:

```plaintext
src/tests/
├── components/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── LoginForm.test.tsx
│   │   │   ├── OnboardingForm.test.tsx
│   │   │   └── SignupForm.test.tsx
│   │   ├── pos/
│   │   │   ├── Cart.test.tsx
│   │   │   ├── PaymentForm.test.tsx
│   │   │   └── POSClient.test.tsx
│   │   ├── inventory/
│   │   │   ├── StockList.test.tsx
│   │   │   └── StockAdjustment.test.tsx
│   │   └── staff/
│   │       ├── StaffList.test.tsx
│   │       └── InviteForm.test.tsx
│   ├── common/
│   │   └── Button.test.tsx
│   └── layout/
│       └── Sidebar.test.tsx
├── hooks/
│   ├── auth/
│   │   └── useAuth.test.ts
│   └── pos/
│       └── useCart.test.ts
└── validation/
    ├── auth.test.ts
    └── pos.test.ts
```

**Testing Rules:**

- One test file per unit, named `<Name>.test.ts(x)`, placed at the path under `src/tests/` that mirrors its source location under `src/`.
- Import the unit under test via the `@/` alias (e.g., `import { LoginForm } from '@/components/features/auth/LoginForm/LoginForm'`) — never reach into `src/` with a relative path.
- Component tests use React Testing Library; Vitest runs in happy-dom.
- Vitest auto-discovers `src/tests/` via its default glob and resolves `@/` to `src/` — no extra config needed.
- Run the full suite with `pnpm test`, or a single file with `pnpm test <path>`.

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

## Design System

### Brand Foundation

The design system is based on an Intercom-inspired minimalist aesthetic:

**Colors:**

- **Canvas:** Soft cream-white `#f5f1ec` — default page background
- **Surface:** Pure white `#ffffff` — floating cards, input fields
- **Primary Ink:** Charcoal `#111111` — headlines, body text, primary buttons
- **Muted Ink:** Medium gray `#626260` — secondary text, disabled states
- **Accent:** Brand orange `#ff5600` — CTAs, highlights
- **Error:** Red `#c41c1c` — validation errors, destructive states
- **Success:** Green `#0bdf50` — success states, confirmations

**Typography:**

- **Font Family:** `system-ui, -apple-system, sans-serif` (fallback to system fonts)
- **Display:** Weight 500 at 40–72px with negative letter-spacing
- **Body:** Weight 400 at 14–18px with 1.5 line-height
- **Mono:** For code snippets and data displays

**Spacing:**

- Base unit: 8px — all spacing uses multiples of 8px (4px, 8px, 12px, 16px, 24px, 32px, 48px)

**Border Radius:**

- Buttons & inputs: 8px
- Cards: 12px
- Product mockups: 16px
- Pill buttons: 9999px (full width)

**Elevation:**

- No drop shadows — depth via white-on-cream surface changes
- Cards lift from cream canvas onto white surface

### Design Tokens

All design tokens are defined in `src/styles/globals.css` as CSS custom properties and integrate with Tailwind configuration.

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

## Creating Components & Hooks

### Component Template

Every component follows this structure:

```typescript
"use client";

import { cn } from "@/lib/utils";
import type { ComponentProps } from "@/types/common";

interface ButtonProps extends ComponentProps {
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "btn",
        `btn-${variant}`,
        `btn-${size}`,
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}
```

### Hook Template

```typescript
import { useCallback, useState } from "react";
import type { ValidationResult } from "@/validation/common";

interface UseFormState {
  values: Record<string, string>;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

export function useForm(initialValues: Record<string, string>) {
  const [state, setState] = useState<UseFormState>({
    values: initialValues,
    errors: {},
    isSubmitting: false,
  });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setState((prev) => ({
        ...prev,
        values: { ...prev.values, [name]: value },
      }));
    },
    []
  );

  return { ...state, handleChange };
}
```

### Validation Usage

```typescript
import { validateLoginForm } from "@/validation/auth";
import type { LoginFormData } from "@/validation/auth";

function LoginForm() {
  const handleSubmit = (data: LoginFormData) => {
    const validation = validateLoginForm(data);
    
    if (!validation.success) {
      setErrors(validation.errors || {});
      return;
    }

    submitLogin(data);
  };
}
```

## Important Notes

1. **Next.js 16 has breaking changes** from earlier versions. Check `node_modules/next/dist/docs/` before assuming training data applies.
2. **RLS is mandatory** on every new table. No table should be readable without a policy.
3. **Business type matters:** `retail` and `fnb` businesses have different features. F&B gets table management; both get core POS. Always check `business.type` before rendering F&B-specific UI.
4. **Design system first:** Always reference the design tokens from globals.css — use semantic color classes (`text-ink`, `bg-surface-1`) instead of hardcoded values.
5. **Validation everywhere:** Validate on client (UX) and server (security). Use validation functions from `src/validation/` for consistency.
6. **Git:** Author: Ngepos / bfernando@student.ciputra.ac.id / Remote: [https://github.com/UCYenyen/Ngepos.git](https://github.com/UCYenyen/Ngepos.git)
