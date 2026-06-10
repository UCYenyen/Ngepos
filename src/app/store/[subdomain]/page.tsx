import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase';
import { getBusinessPlanFeatures } from '@/lib/auth';
import { StorefrontClient } from '@/components/features/storefront/StorefrontClient/StorefrontClient';
import type { StorefrontBusiness } from '@/types/storefront';
import type { Category, Product, ProductVariant } from '@/types/product';

interface StorePageProps {
  params: Promise<{ subdomain: string }>;
}

async function loadStorefront(subdomain: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, type, logo_url, subdomain')
    .eq('subdomain', subdomain)
    .maybeSingle<StorefrontBusiness>();

  if (!business) return null;

  const features = await getBusinessPlanFeatures(business.id);
  if (!features.onlineStore) return null;

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('business_id', business.id)
      .order('name'),
    supabase
      .from('products')
      .select('*')
      .eq('business_id', business.id)
      .order('name'),
  ]);

  const productList = (products ?? []) as Product[];
  const variantProductIds = productList
    .filter((product) => product.has_variants)
    .map((product) => product.id);

  let variants: ProductVariant[] = [];
  if (variantProductIds.length > 0) {
    const { data } = await supabase
      .from('product_variants')
      .select('*')
      .in('product_id', variantProductIds);
    variants = (data ?? []) as ProductVariant[];
  }

  return {
    business,
    categories: (categories ?? []) as Category[],
    products: productList,
    variants,
  };
}

export async function generateMetadata({
  params,
}: StorePageProps): Promise<Metadata> {
  const { subdomain } = await params;
  const data = await loadStorefront(subdomain);
  const name = data?.business.name ?? 'Storefront';
  return {
    title: `${name} — Pesan Online`,
    description: `Lihat menu dan pesan langsung dari ${name}.`,
    robots: { index: false },
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const { subdomain } = await params;
  const data = await loadStorefront(subdomain);

  if (!data) {
    notFound();
  }

  return (
    <StorefrontClient
      subdomain={subdomain}
      business={data.business}
      categories={data.categories}
      products={data.products}
      variants={data.variants}
    />
  );
}
