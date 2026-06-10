import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { extractStorefrontSlug } from '@/lib/site';

const PROTECTED_PREFIXES = ['/dashboard', '/billing', '/onboarding', '/account'];

export async function proxy(request: NextRequest) {
  const storefrontSlug = extractStorefrontSlug(request.headers.get('host') ?? '');
  if (storefrontSlug) {
    if (request.nextUrl.pathname.startsWith('/store/')) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    const rest = url.pathname === '/' ? '' : url.pathname;
    url.pathname = `/store/${storefrontSlug}${rest}`;
    return NextResponse.rewrite(url);
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  const redirectTo = (target: string) => {
    const url = request.nextUrl.clone();
    url.pathname = target;
    const response = NextResponse.redirect(url);
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => response.cookies.set(cookie));
    return response;
  };

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && isProtected) {
      return redirectTo('/login');
    }

    if (user && (pathname === '/login' || pathname === '/signup')) {
      return redirectTo('/dashboard');
    }
  } catch (error) {
    console.error('Middleware auth error:', error);
    if (isProtected) {
      return redirectTo('/login');
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
