# Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build auth (email + Google OAuth), multi-tenancy (businesses + RLS), subscriptions (plan limits + billing), and onboarding flow.

**Architecture:** Supabase Auth for user authentication, Postgres RLS policies for business-scoped multi-tenancy, static plan config with enforcement middleware, Midtrans/Xendit for subscription billing.

**Tech Stack:** Next.js 16 (App Router), Supabase Auth + RLS, TypeScript, Tailwind CSS, shadcn/ui

---

## File Structure

**New files to create:**
- `src/lib/plans.ts` — Plan limits configuration (static)
- `src/lib/auth.ts` — Auth helper functions (session, user context)
- `src/types/auth.ts` — Auth types (User, Subscription, etc.)
- `src/types/business.ts` — Business types
- `src/app/(auth)/signup/page.tsx` — Email signup form
- `src/app/(auth)/login/page.tsx` — Email login form
- `src/app/(auth)/callback/route.ts` — Google OAuth callback handler
- `src/app/(auth)/onboarding/page.tsx` — Plan selection + first business creation
- `src/app/(dashboard)/layout.tsx` — Dashboard layout with auth check
- `src/app/(dashboard)/page.tsx` — Business switcher + create new
- `src/app/(dashboard)/[businessId]/layout.tsx` — Business context provider
- `src/app/api/businesses/route.ts` — Create business endpoint (with plan limit check)
- `src/app/api/subscriptions/route.ts` — Subscription management (list, upgrade, downgrade)
- `src/app/api/webhooks/midtrans/route.ts` — Midtrans payment webhook
- `src/app/api/webhooks/xendit/route.ts` — Xendit payment webhook
- `supabase/migrations/001_init_schema.sql` — Database schema + RLS policies
- `supabase/migrations/002_create_functions.sql` — SQL functions for business creation

**Existing files to modify:**
- `src/app/layout.tsx` — Add auth provider wrapper
- `src/lib/supabase.ts` — Add server-client factory
- `.env.example` — Add payment gateway keys

---

## Task 1: Database Schema & RLS Policies

**Files:**
- Create: `supabase/migrations/001_init_schema.sql`

- [ ] **Step 1: Create businesses table with RLS**

```sql
-- supabase/migrations/001_init_schema.sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('retail', 'fnb')),
  logo_url TEXT,
  address TEXT,
  timezone TEXT DEFAULT 'Asia/Jakarta',
  currency TEXT DEFAULT 'IDR',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY businesses_owner_select ON businesses
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY businesses_owner_insert ON businesses
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY businesses_owner_update ON businesses
  FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY businesses_owner_delete ON businesses
  FOR DELETE USING (owner_id = auth.uid());
```

- [ ] **Step 2: Create business_members table with RLS**

```sql
CREATE TABLE business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'cashier')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

ALTER TABLE business_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_members_select ON business_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY business_members_insert ON business_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = business_members.business_id
        AND bm.user_id = auth.uid()
        AND bm.role = 'owner'
    )
  );

CREATE POLICY business_members_update ON business_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = business_members.business_id
        AND bm.user_id = auth.uid()
        AND bm.role = 'owner'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = business_members.business_id
        AND bm.user_id = auth.uid()
        AND bm.role = 'owner'
    )
  );

CREATE POLICY business_members_delete ON business_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = business_members.business_id
        AND bm.user_id = auth.uid()
        AND bm.role = 'owner'
    )
  );
```

- [ ] **Step 3: Create subscriptions table with RLS**

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'pro', 'enterprise')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'cancelled')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('midtrans', 'xendit', 'manual')),
  payment_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_select ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY subscriptions_insert ON subscriptions
  FOR INSERT WITH CHECK (false);

CREATE POLICY subscriptions_update ON subscriptions
  FOR UPDATE USING (false) WITH CHECK (false);
```

- [ ] **Step 4: Create invitations table with RLS**

```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'cashier')),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY invitations_select ON invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = invitations.business_id
        AND bm.user_id = auth.uid()
        AND bm.role = 'owner'
    )
  );

CREATE POLICY invitations_insert ON invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = invitations.business_id
        AND bm.user_id = auth.uid()
        AND bm.role = 'owner'
    )
  );

CREATE POLICY invitations_accept ON invitations
  FOR UPDATE USING (true) WITH CHECK (true);
```

- [ ] **Step 5: Create indexes for performance**

```sql
CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX idx_business_members_business_id ON business_members(business_id);
CREATE INDEX idx_business_members_user_id ON business_members(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(period_end);
CREATE INDEX idx_invitations_business_id ON invitations(business_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);
```

- [ ] **Step 6: Run migration locally**

```bash
cd /Users/bryanfernandodinata/Downloads/Me/Freelance/personal/ngepos
supabase migration up
```

Expected output: Migration applied successfully.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/001_init_schema.sql
git commit -m "feat: Add database schema with RLS policies for multi-tenancy"
```

---

## Task 2: Plan Limits Configuration

**Files:**
- Create: `src/lib/plans.ts`

- [ ] **Step 1: Define plan config**

```typescript
// src/lib/plans.ts
export type PlanName = 'starter' | 'pro' | 'enterprise';

export interface PlanConfig {
  maxBusinesses: number;
  maxProductsPerBusiness: number;
  maxStaffPerBusiness: number;
  features: {
    inventory: boolean;
    tableManagement: boolean;
    analytics: boolean;
    automatedReports: boolean;
    paymentGateway: boolean;
  };
}

export const PLANS: Record<PlanName, PlanConfig> = {
  starter: {
    maxBusinesses: 1,
    maxProductsPerBusiness: 100,
    maxStaffPerBusiness: 2,
    features: {
      inventory: false,
      tableManagement: false,
      analytics: false,
      automatedReports: false,
      paymentGateway: false,
    },
  },
  pro: {
    maxBusinesses: 5,
    maxProductsPerBusiness: 1000,
    maxStaffPerBusiness: 10,
    features: {
      inventory: true,
      tableManagement: true,
      analytics: true,
      automatedReports: true,
      paymentGateway: true,
    },
  },
  enterprise: {
    maxBusinesses: Infinity,
    maxProductsPerBusiness: Infinity,
    maxStaffPerBusiness: Infinity,
    features: {
      inventory: true,
      tableManagement: true,
      analytics: true,
      automatedReports: true,
      paymentGateway: true,
    },
  },
};

export function getPlanConfig(plan: PlanName): PlanConfig {
  return PLANS[plan];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/plans.ts
git commit -m "feat: Add plan limits configuration"
```

---

## Task 3: Types & User Context

**Files:**
- Create: `src/types/auth.ts`
- Create: `src/types/business.ts`

- [ ] **Step 1: Create auth types**

```typescript
// src/types/auth.ts
export type SubscriptionPlan = 'starter' | 'pro' | 'enterprise';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled';
export type PaymentProvider = 'midtrans' | 'xendit' | 'manual';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  billing_cycle: BillingCycle;
  status: SubscriptionStatus;
  period_start: string;
  period_end: string;
  payment_provider: PaymentProvider;
  payment_reference?: string;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 2: Create business types**

```typescript
// src/types/business.ts
export type BusinessType = 'retail' | 'fnb';
export type UserRole = 'owner' | 'manager' | 'cashier';

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  type: BusinessType;
  logo_url?: string;
  address?: string;
  timezone: string;
  currency: string;
  created_at: string;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface Invitation {
  id: string;
  business_id: string;
  email: string;
  role: UserRole;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/types/auth.ts src/types/business.ts
git commit -m "feat: Add core TypeScript types for auth and business"
```

---

## Task 4: Auth Library Functions

**Files:**
- Create: `src/lib/auth.ts`
- Modify: `src/lib/supabase.ts`

- [ ] **Step 1: Update Supabase client to export server client factory**

```typescript
// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr';
import { createServerClient as createServerClientSSR } from '@supabase/ssr';

export const supabaseClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function createServerClient(cookies: any) {
  return createServerClientSSR(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookies.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            cookies.set(name, value, options)
          ),
      },
    }
  );
}
```

- [ ] **Step 2: Create auth helper library**

```typescript
// src/lib/auth.ts
import { createServerClient } from './supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  return user;
}

export async function getCurrentSubscription() {
  const user = await getCurrentUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  return subscription || null;
}

export async function getUserBusinesses() {
  const user = await getCurrentUser();
  if (!user) return [];

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: members } = await supabase
    .from('business_members')
    .select('business_id, businesses(*)')
    .eq('user_id', user.id);
  
  return members?.map((m) => m.businesses) || [];
}

export async function getBusinessWithMember(businessId: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: member } = await supabase
    .from('business_members')
    .select('*')
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .single();
  
  if (!member) return null;

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();
  
  return { business, member };
}

export async function requireAuth(redirectTo: string = '/login') {
  const user = await getCurrentUser();
  if (!user) {
    redirect(redirectTo);
  }
  return user;
}

export async function requireBusinessAccess(businessId: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const access = await getBusinessWithMember(businessId);
  if (!access) {
    redirect('/');
  }
  
  return access;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth.ts src/lib/supabase.ts
git commit -m "feat: Add auth helper functions and server client factory"
```

---

## Task 5: Signup & Login Pages

**Files:**
- Create: `src/app/(auth)/signup/page.tsx`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/layout.tsx`

- [ ] **Step 1: Create auth layout**

```typescript
// src/app/(auth)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    supabaseClient.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.push('/onboarding');
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Create signup page with metadata**

```typescript
// src/app/(auth)/signup/page.tsx
import type { Metadata } from 'next';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Sign Up - Ngepos',
  description: 'Create a new Ngepos account to start managing your business',
  openGraph: {
    title: 'Sign Up - Ngepos',
    description: 'Create a new Ngepos account',
    url: 'https://ngepos.com/signup',
    siteName: 'Ngepos',
  },
};

export default function SignupPage() {
  return <SignupForm />;
}
```

- [ ] **Step 3: Create signup form component**

```typescript
// src/components/auth/SignupForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      
      router.push('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google signup failed');
      setLoading(false);
    }
  }

  return (
    <Card className="p-8">
      <h1 className="text-2xl font-bold mb-2">Create Account</h1>
      <p className="text-sm text-slate-500 mb-6">Start using Ngepos today</p>

      <form onSubmit={handleSignup} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md">{error}</div>
        )}

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-slate-500">Or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignup}
        disabled={loading}
      >
        Sign up with Google
      </Button>

      <p className="text-sm text-slate-600 text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
```

- [ ] **Step 4: Create login page with metadata**

```typescript
// src/app/(auth)/login/page.tsx
import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Log In - Ngepos',
  description: 'Log in to your Ngepos account',
  openGraph: {
    title: 'Log In - Ngepos',
    description: 'Access your Ngepos account',
    url: 'https://ngepos.com/login',
    siteName: 'Ngepos',
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
```

- [ ] **Step 5: Create login form component**

```typescript
// src/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed');
      setLoading(false);
    }
  }

  return (
    <Card className="p-8">
      <h1 className="text-2xl font-bold mb-2">Log In</h1>
      <p className="text-sm text-slate-500 mb-6">Access your Ngepos account</p>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md">{error}</div>
        )}

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-slate-500">Or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        Log in with Google
      </Button>

      <p className="text-sm text-slate-600 text-center mt-6">
        Don't have an account?{' '}
        <Link href="/signup" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
    </Card>
  );
}
```

- [ ] **Step 6: Create Google OAuth callback handler**

```typescript
// src/app/(auth)/callback/route.ts
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${requestUrl.origin}/onboarding`);
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`);
}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/\(auth\)/ src/components/auth/
git commit -m "feat: Add signup, login, and OAuth callback pages with forms"
```

---

## Task 6: Onboarding Flow

**Files:**
- Create: `src/app/(auth)/onboarding/page.tsx`
- Create: `src/components/auth/OnboardingForm.tsx`

- [ ] **Step 1: Create onboarding page with metadata**

```typescript
// src/app/(auth)/onboarding/page.tsx
import type { Metadata } from 'next';
import { OnboardingForm } from '@/components/auth/OnboardingForm';

export const metadata: Metadata = {
  title: 'Get Started - Ngepos',
  description: 'Complete your Ngepos setup in just a few steps',
  openGraph: {
    title: 'Get Started - Ngepos',
    description: 'Complete your Ngepos setup',
    url: 'https://ngepos.com/onboarding',
    siteName: 'Ngepos',
  },
};

export default function OnboardingPage() {
  return <OnboardingForm />;
}
```

- [ ] **Step 2: Create onboarding form component**

```typescript
// src/components/auth/OnboardingForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { SubscriptionPlan, BusinessType } from '@/types/auth';
import type { BusinessType } from '@/types/business';
import { PLANS } from '@/lib/plans';

type OnboardingStep = 'plan' | 'business';

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('plan');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('starter');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('retail');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePlanSelection() {
    setStep('business');
  }

  async function handleCreateBusiness() {
    setLoading(true);
    setError('');

    try {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: business } = await supabaseClient
        .from('businesses')
        .insert({
          owner_id: user.id,
          name: businessName,
          type: businessType,
        })
        .select()
        .single();

      if (!business) throw new Error('Failed to create business');

      await supabaseClient
        .from('business_members')
        .insert({
          business_id: business.id,
          user_id: user.id,
          role: 'owner',
        });

      const now = new Date();
      const periodEnd = new Date(
        billingCycle === 'yearly' ? now.getFullYear() + 1 : now.getMonth() + 1,
        now.getDate()
      );

      await supabaseClient.from('subscriptions').insert({
        user_id: user.id,
        plan: selectedPlan,
        billing_cycle: billingCycle,
        status: 'active',
        period_start: now.toISOString(),
        period_end: periodEnd.toISOString(),
        payment_provider: 'manual',
      });

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'plan') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-slate-600">Select the plan that fits your business</p>
        </div>

        <RadioGroup value={selectedPlan} onValueChange={(v) => setSelectedPlan(v as SubscriptionPlan)}>
          {Object.entries(PLANS).map(([plan, config]) => (
            <Card
              key={plan}
              className="p-4 cursor-pointer hover:border-blue-500"
              onClick={() => setSelectedPlan(plan as SubscriptionPlan)}
            >
              <div className="flex items-start space-x-3">
                <RadioGroupItem value={plan} id={plan} />
                <Label htmlFor={plan} className="flex-1 cursor-pointer">
                  <div className="font-semibold capitalize">{plan}</div>
                  <div className="text-sm text-slate-600">
                    Up to {config.maxBusinesses === Infinity ? 'unlimited' : config.maxBusinesses} businesses
                  </div>
                </Label>
              </div>
            </Card>
          ))}
        </RadioGroup>

        <div className="space-y-2">
          <Label>Billing Cycle</Label>
          <RadioGroup value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'yearly')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monthly" id="monthly" />
              <Label htmlFor="monthly">Monthly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yearly" id="yearly" />
              <Label htmlFor="yearly">Yearly (Save 2 months!)</Label>
            </div>
          </RadioGroup>
        </div>

        <Button onClick={handlePlanSelection} className="w-full">
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Create Your First Business</h1>
        <p className="text-slate-600">You can add more businesses later</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md">{error}</div>
      )}

      <Input
        placeholder="Business Name"
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        required
      />

      <div className="space-y-2">
        <Label>Business Type</Label>
        <RadioGroup value={businessType} onValueChange={(v) => setBusinessType(v as BusinessType)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="retail" id="retail" />
            <Label htmlFor="retail">Retail Store</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fnb" id="fnb" />
            <Label htmlFor="fnb">Food & Beverage</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('plan')} className="flex-1">
          Back
        </Button>
        <Button onClick={handleCreateBusiness} disabled={loading || !businessName} className="flex-1">
          {loading ? 'Creating...' : 'Create Business'}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(auth\)/onboarding/ src/components/auth/OnboardingForm.tsx
git commit -m "feat: Add onboarding flow with plan selection and business creation"
```

---

## Task 7: Dashboard Layout & Auth Middleware

**Files:**
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/page.tsx`
- Create: `src/middleware.ts`

- [ ] **Step 1: Create middleware for auth checks**

```typescript
// src/middleware.ts
import { createServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(request.cookies);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !request.nextUrl.pathname.startsWith('/')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (
    user &&
    (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

- [ ] **Step 2: Create dashboard layout**

```typescript
// src/app/(dashboard)/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex h-screen">
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Create dashboard home page with metadata**

```typescript
// src/app/(dashboard)/page.tsx
import type { Metadata } from 'next';
import { BusinessesList } from '@/components/dashboard/BusinessesList';

export const metadata: Metadata = {
  title: 'Dashboard - Ngepos',
  description: 'Manage your businesses with Ngepos POS system',
  openGraph: {
    title: 'Dashboard - Ngepos',
    description: 'Manage your businesses',
    url: 'https://ngepos.com/dashboard',
    siteName: 'Ngepos',
  },
};

export default function DashboardPage() {
  return <BusinessesList />;
}
```

- [ ] **Step 4: Create businesses list component**

```typescript
// src/components/dashboard/BusinessesList.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Business } from '@/types/business';

export function BusinessesList() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusinesses() {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (!user) return;

      const { data } = await supabaseClient
        .from('business_members')
        .select('business_id, businesses(*)')
        .eq('user_id', user.id);

      setBusinesses(data?.map((m) => m.businesses as Business) || []);
      setLoading(false);
    }

    fetchBusinesses();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Businesses</h1>
        <p className="text-slate-600">Select a business to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businesses.map((business) => (
          <Card
            key={business.id}
            className="p-6 cursor-pointer hover:border-blue-500 transition"
            onClick={() => router.push(`/${business.id}/pos`)}
          >
            <h2 className="text-xl font-semibold mb-2">{business.name}</h2>
            <p className="text-sm text-slate-600 mb-4 capitalize">{business.type}</p>
            <Button className="w-full">Open</Button>
          </Card>
        ))}
      </div>

      <Button className="mt-6" variant="outline">
        + Create New Business
      </Button>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/middleware.ts src/app/\(dashboard\)/ src/components/dashboard/
git commit -m "feat: Add dashboard layout, auth middleware, and businesses list"
```

---

## Task 8: Create Business API & Plan Limit Enforcement

**Files:**
- Create: `src/app/api/businesses/route.ts`

- [ ] **Step 1: Create business endpoint**

```typescript
// src/app/api/businesses/route.ts
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getPlanConfig } from '@/lib/plans';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, type } = await request.json();
    if (!name || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    const { count } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id);

    const planConfig = getPlanConfig(subscription.plan);
    if (count && count >= planConfig.maxBusinesses) {
      return NextResponse.json(
        {
          error: 'Business limit reached for your plan',
          limit: planConfig.maxBusinesses,
          current: count,
        },
        { status: 400 }
      );
    }

    const { data: business } = await supabase
      .from('businesses')
      .insert({
        owner_id: user.id,
        name,
        type,
      })
      .select()
      .single();

    if (!business) throw new Error('Failed to create business');

    await supabase.from('business_members').insert({
      business_id: business.id,
      user_id: user.id,
      role: 'owner',
    });

    return NextResponse.json(business);
  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/businesses/
git commit -m "feat: Add business creation endpoint with plan limit enforcement"
```

---

## Task 9: Subscription Management & Payment Webhooks

**Files:**
- Create: `src/app/api/subscriptions/route.ts`
- Create: `src/app/api/webhooks/midtrans/route.ts`
- Create: `src/app/api/webhooks/xendit/route.ts`

- [ ] **Step 1: Create subscriptions endpoint**

```typescript
// src/app/api/subscriptions/route.ts
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { SubscriptionPlan, BillingCycle } from '@/types/auth';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json(subscription || null);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan, billingCycle, paymentProvider } = await request.json();

    if (!plan || !billingCycle || !paymentProvider) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const now = new Date();
    const periodEnd = new Date(
      billingCycle === 'yearly' ? now.getFullYear() + 1 : now.getMonth() + 1,
      now.getDate()
    );

    const { data: subscription } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan: plan as SubscriptionPlan,
        billing_cycle: billingCycle as BillingCycle,
        status: paymentProvider === 'manual' ? 'active' : 'pending',
        period_start: now.toISOString(),
        period_end: periodEnd.toISOString(),
        payment_provider: paymentProvider,
      })
      .select()
      .single();

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create Midtrans webhook handler**

```typescript
// src/app/api/webhooks/midtrans/route.ts
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const MIDTRANS_KEY = process.env.MIDTRANS_SERVER_KEY || '';

function verifyMidtransSignature(orderId: string, statusCode: string, grossAmount: string, signature: string): boolean {
  const data = orderId + statusCode + grossAmount + MIDTRANS_KEY;
  const hash = crypto.createHash('sha512').update(data).digest('hex');
  return hash === signature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, transaction_status, signature_key, gross_amount, status_code } = body;

    if (!verifyMidtransSignature(order_id, status_code, gross_amount, signature_key)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const statusMap: Record<string, string> = {
      capture: 'active',
      settlement: 'active',
      pending: 'pending',
      deny: 'cancelled',
      expire: 'cancelled',
      cancel: 'cancelled',
    };

    const newStatus = statusMap[transaction_status] || 'pending';

    await supabase
      .from('subscriptions')
      .update({ status: newStatus })
      .eq('payment_reference', order_id);

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Midtrans webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Create Xendit webhook handler**

```typescript
// src/app/api/webhooks/xendit/route.ts
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const XENDIT_KEY = process.env.XENDIT_SECRET_KEY || '';

function verifyXenditSignature(payload: string, signature: string): boolean {
  const hash = crypto.createHmac('sha256', XENDIT_KEY).update(payload).digest('hex');
  return hash === signature;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-xendit-webhook-token') || '';

    if (!verifyXenditSignature(payload, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(payload);
    const { reference_id, status } = body;

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const statusMap: Record<string, string> = {
      COMPLETED: 'active',
      PENDING: 'pending',
      FAILED: 'cancelled',
      EXPIRED: 'cancelled',
    };

    const newStatus = statusMap[status] || 'pending';

    await supabase
      .from('subscriptions')
      .update({ status: newStatus })
      .eq('payment_reference', reference_id);

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Xendit webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/subscriptions/ src/app/api/webhooks/
git commit -m "feat: Add subscription management and payment webhooks"
```

---

## Task 10: Environment Variables & Final Checks

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Update .env.example**

```bash
# .env.example (add to existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

MIDTRANS_SERVER_KEY=your_midtrans_server_key_here
XENDIT_SECRET_KEY=your_xendit_secret_key_here

RESEND_API_KEY=your_resend_api_key_here
FONNTE_API_KEY=your_fonnte_api_key_here
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: Update env.example with payment gateway keys"
```

---

## Verification

After all tasks:

- ✅ User can sign up with email/password
- ✅ User can sign up with Google OAuth
- ✅ User completes onboarding (plan + business selection)
- ✅ User can log in and see their businesses
- ✅ RLS policies prevent cross-business data access
- ✅ Plan limits are enforced
- ✅ All pages have SEO metadata
- ✅ Strict typing throughout (no `any` types)
- ✅ Feature-based component structure
- ✅ Feature-based hooks organization
