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
