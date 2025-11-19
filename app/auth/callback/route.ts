import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  console.log('[OAuth Callback] Received callback with code:', !!code);
  console.log('[OAuth Callback] Next URL:', next);

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: undefined, // Server-side doesn't need storage
      },
    });

    try {
      console.log('[OAuth Callback] Exchanging code for session...');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('[OAuth Callback] Error exchanging code:', error);
        return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
      }

      console.log('[OAuth Callback] Session exchange successful');
      console.log('[OAuth Callback] User:', data.user?.email);

      // Successfully authenticated, redirect to dashboard
      const redirectUrl = new URL(next, requestUrl.origin);
      const response = NextResponse.redirect(redirectUrl);

      // Set session cookies
      if (data.session) {
        response.cookies.set('sb-access-token', data.session.access_token, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });

        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });
      }

      return response;
    } catch (err) {
      console.error('[OAuth Callback] Exception:', err);
      return NextResponse.redirect(new URL('/login?error=server_error', requestUrl.origin));
    }
  }

  // No code present, redirect to login
  console.log('[OAuth Callback] No code present, redirecting to login');
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
