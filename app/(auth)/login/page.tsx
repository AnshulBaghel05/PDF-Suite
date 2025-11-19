'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  // Check if user is already logged in - removed to prevent redirect loop

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDebugInfo('');
    setLoading(true);

    try {
      setDebugInfo('Attempting to sign in...');
      console.log('[Login] Starting login attempt...');

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      console.log('[Login] Sign in response:', { hasSession: !!data.session, error: signInError });

      if (signInError) {
        console.error('[Login] Login error:', signInError);
        throw signInError;
      }

      if (!data.session) {
        throw new Error('No session returned from login');
      }

      console.log('[Login] Session created successfully');
      setDebugInfo('Login successful! Setting up your session...');

      // Wait for localStorage to be updated
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify the session was stored in localStorage
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[Login] Session verification:', { hasSession: !!session, email: session?.user?.email });

      if (!session) {
        console.error('[Login] Session not found in storage after login');
        throw new Error('Session not found after login');
      }

      console.log('[Login] Session verified in localStorage');
      setDebugInfo('Session ready. Redirecting to dashboard...');

      // Additional delay to ensure session is fully persisted
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('[Login] Navigating to dashboard...');

      // Use router.push instead of window.location to avoid full page reload
      router.push('/dashboard');

    } catch (err: any) {
      console.error('[Login] Login failed:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
      setDebugInfo('');
      setLoading(false);
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-md mx-auto">
        <div className="glass rounded-xl p-8 space-y-6 border border-gray-800">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gradient">Welcome Back</h1>
            <p className="text-gray-400">Login to access your PDF tools</p>
          </div>

          {/* Debug Info */}
          {debugInfo && (
            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 flex items-start space-x-3">
              <Loader2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 animate-spin" />
              <p className="text-sm text-blue-500">{debugInfo}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-500">{error}</p>
                {error.includes('Invalid login credentials') && (
                  <p className="text-xs text-red-400 mt-1">
                    Don't have an account?{' '}
                    <Link href="/signup" className="underline hover:text-red-300">
                      Sign up here
                    </Link>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 px-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 px-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-700 bg-gray-900/50 text-primary focus:ring-primary focus:ring-offset-0"
                  disabled={loading}
                />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary-light transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 glow-red"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:text-primary-light font-medium transition-colors">
              Sign up for free
            </Link>
          </p>

          {/* Help Text */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>Having trouble logging in?</p>
            <p>Make sure you've verified your email address.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
