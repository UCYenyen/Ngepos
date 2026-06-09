'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { SubscriptionPlan } from '@/types/auth';
import type { BusinessType } from '@/types/business';
import { PLANS } from '@/lib/plans';
import type { OnboardingFormState } from './types';

export function OnboardingForm() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingFormState>({
    step: 'plan',
    selectedPlan: 'starter',
    billingCycle: 'monthly',
    businessName: '',
    businessType: 'retail',
    loading: false,
    error: '',
  });

  function handlePlanSelection() {
    setState((prev) => ({ ...prev, step: 'business' }));
  }

  async function handleCreateBusiness() {
    setState((prev) => ({ ...prev, loading: true, error: '' }));

    try {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: business } = await supabaseClient
        .from('businesses')
        .insert({
          owner_id: user.id,
          name: state.businessName,
          type: state.businessType,
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
      const periodEnd = new Date(now);
      if (state.billingCycle === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      await supabaseClient.from('subscriptions').insert({
        user_id: user.id,
        plan: state.selectedPlan,
        billing_cycle: state.billingCycle,
        status: 'active',
        period_start: now.toISOString(),
        period_end: periodEnd.toISOString(),
        payment_provider: 'manual',
      });

      router.push('/dashboard');
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to complete onboarding',
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }

  if (state.step === 'plan') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-slate-600">Select the plan that fits your business</p>
        </div>

        <RadioGroup
          value={state.selectedPlan}
          onValueChange={(v) => setState((prev) => ({ ...prev, selectedPlan: v as SubscriptionPlan }))}
        >
          {Object.entries(PLANS).map(([plan, config]) => (
            <Card
              key={plan}
              className="p-4 cursor-pointer hover:border-blue-500"
              onClick={() => setState((prev) => ({ ...prev, selectedPlan: plan as SubscriptionPlan }))}
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
          <RadioGroup
            value={state.billingCycle}
            onValueChange={(v) => setState((prev) => ({ ...prev, billingCycle: v as 'monthly' | 'yearly' }))}
          >
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

      {state.error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md">{state.error}</div>}

      <Input
        placeholder="Business Name"
        value={state.businessName}
        onChange={(e) => setState((prev) => ({ ...prev, businessName: e.target.value }))}
        required
      />

      <div className="space-y-2">
        <Label>Business Type</Label>
        <RadioGroup
          value={state.businessType}
          onValueChange={(v) => setState((prev) => ({ ...prev, businessType: v as BusinessType }))}
        >
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
        <Button
          variant="outline"
          onClick={() => setState((prev) => ({ ...prev, step: 'plan' }))}
          className="flex-1"
        >
          Back
        </Button>
        <Button onClick={handleCreateBusiness} disabled={state.loading || !state.businessName} className="flex-1">
          {state.loading ? 'Creating...' : 'Create Business'}
        </Button>
      </div>
    </div>
  );
}
