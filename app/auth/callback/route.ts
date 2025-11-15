import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect') || '/dashboard';

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });

    try {
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code);

      // Redirect to the intended destination (dashboard or specified redirect)
      return NextResponse.redirect(new URL(redirectTo, request.url));
    } catch (error) {
      console.error('Error exchanging code for session:', error);
      // Redirect to login with error
      return NextResponse.redirect(
        new URL('/login?error=authentication_failed', request.url)
      );
    }
  }

  // If no code, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}
