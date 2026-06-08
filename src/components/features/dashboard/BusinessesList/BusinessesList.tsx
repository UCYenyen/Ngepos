'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Business } from '@/types/business';

type BusinessMemberWithBusiness = {
  business_id: string;
  businesses: Business;
};

type BusinessMemberRow = {
  business_id: string;
  businesses: Business | Business[] | null;
};

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

      setBusinesses(
        data?.map((m) => {
          const row = m as BusinessMemberRow;
          return row.businesses as Business;
        }) || []
      );
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
