# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ngepos** is a Next.js 16 full-stack application with Supabase backend integration, styled with Tailwind CSS and shadcn/ui components. The project uses pnpm for package management exclusively.

## Tech Stack

- **Framework:** Next.js 16.2.7 (App Router, React 19)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + TailwindCSS PostCSS
- **UI Components:** shadcn/ui (Base Nova style) + Lucide React icons
- **Database/Backend:** Supabase (@supabase/supabase-js)
- **Testing:** Vitest 4 + React Testing Library
- **Linting:** ESLint 9
- **Build Tool:** Vite 8 (for testing)
- **React Compiler:** Enabled (babel-plugin-react-compiler)

## Commands

**Only use `pnpm` — never use `npm`, `yarn`, or `bun`.**

### Development

```bash
pnpm dev              # Start dev server on http://localhost:3000
pnpm build            # Build for production
pnpm start            # Start production server
```

### Testing

```bash
pnpm test             # Run all tests in watch mode
pnpm test:ui          # Run tests with interactive UI dashboard
pnpm test:coverage    # Run tests with coverage report
```

Individual test files: `pnpm test <filename>` (e.g., `pnpm test button.test.tsx`)

### Linting & Code Quality

```bash
pnpm lint             # Run ESLint on project
```

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx       # Root layout with font setup
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── supabase.ts      # Supabase client singleton
│   └── utils.ts         # Utility functions (cn() for class merging)
└── hooks/               # (create as needed)
```

## Architecture & Key Patterns

### Next.js App Router

- All routes use the App Router (src/app directory)
- Server Components by default; use `"use client"` at the top of files for Client Components
- Read `node_modules/next/dist/docs/` for documentation specific to this Next.js version—APIs may differ from your training data

### Supabase Integration

- Client initialized in `src/lib/supabase.ts` as a singleton
- Environment variables required:
  - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public API key
- These are public (NEXT_PUBLIC prefix) and safe to expose in the browser
- See `.env.example` for template

### Styling

- **Tailwind CSS 4** with PostCSS plugin
- **shadcn/ui** components in `src/components/ui/` (managed via CLI)
- Use `cn()` utility from `src/lib/utils.ts` to merge Tailwind class names safely
- Theme configured in `components.json`: Base Nova style, neutral base color, CSS variables

### Component Structure

- Path alias `@/` resolves to `src/`
- shadcn/ui component aliases configured:
  - `@/components` → components directory
  - `@/ui` → components/ui
  - `@/lib` → lib utilities
  - `@/hooks` → custom React hooks

### Testing

- Vitest configured in `vitest.config.ts` (happy-dom environment for DOM testing)
- Test setup file: `vitest.setup.ts` (loads @testing-library/jest-dom)
- Write tests alongside code (e.g., `Button.test.tsx` next to `Button.tsx`)
- Use React Testing Library for component tests

### React Compiler

- Enabled in `next.config.ts` (`reactCompiler: true`)
- Automatically optimizes component memoization; don't manually use `memo()` or `useMemo()` unless needed

## Adding Components

Add shadcn/ui components with:

```bash
pnpm dlx shadcn-ui@latest add <component-name>
```

Example: `pnpm dlx shadcn-ui@latest add button` (already included)

Components are copied into `src/components/ui/` and fully owned by your codebase—safe to customize.

## Important Notes

1. **This is NOT stock Next.js:** Version 16 has breaking changes. Always check `node_modules/next/dist/docs/` for API-specific behavior before assuming training data applies.

2. **Package Manager:** Strictly pnpm only. No npm, yarn, or bun. All scripts and CI/CD assume pnpm.

3. **Environment Variables:**
   - Create `.env.local` (gitignored) from `.env.example`
   - `NEXT_PUBLIC_*` variables are exposed to the browser (never put secrets here)
   - Restart dev server after changing env vars

4. **TypeScript Paths:** The `@/*` alias is configured in `tsconfig.json` and used throughout. Always use `@/` for imports from `src/`.

5. **Tailwind + shadcn/ui:** Use Tailwind classes directly on components. shadcn/ui components are unstyled by default and Tailwind-friendly. The `cn()` helper safely merges class conflicts.

6. **Test Coverage:** Tests run in happy-dom (lightweight DOM environment). For browser-specific features, tests may need adjustment.

7. **Git Configuration:**
   - Author: Ngepos
   - Email: bfernando@student.ciputra.ac.id
   - Remote: [https://github.com/UCYenyen/Ngepos.git](https://github.com/UCYenyen/Ngepos.git)
