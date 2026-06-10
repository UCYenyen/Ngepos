export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ngepos.com';

export const STOREFRONT_DOMAIN =
  process.env.NEXT_PUBLIC_STOREFRONT_DOMAIN ?? 'thedevo.cloud';

export const STOREFRONT_PREFIX = 'ngepos-';

export function storefrontHost(subdomain: string): string {
  return `${STOREFRONT_PREFIX}${subdomain}.${STOREFRONT_DOMAIN}`;
}

export function storefrontUrl(subdomain: string): string {
  return `https://${storefrontHost(subdomain)}`;
}

export function extractStorefrontSlug(host: string): string | null {
  const hostname = host.split(':')[0].toLowerCase();
  const suffix = `.${STOREFRONT_DOMAIN}`;
  if (!hostname.endsWith(suffix)) return null;

  const label = hostname.slice(0, -suffix.length);
  if (!label.startsWith(STOREFRONT_PREFIX)) return null;

  const slug = label.slice(STOREFRONT_PREFIX.length);
  if (!slug || slug.includes('.')) return null;

  return slug;
}
