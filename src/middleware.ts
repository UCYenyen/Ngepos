import { createServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  try {
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
  } catch (error) {
    console.error('Middleware auth error:', error);
    // On auth error, redirect to login to force re-authentication
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
