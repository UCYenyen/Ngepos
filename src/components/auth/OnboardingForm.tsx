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
      const periodEnd = new Date(now);
      if (billingCycle === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

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
