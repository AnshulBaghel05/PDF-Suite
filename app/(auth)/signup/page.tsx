'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Mail, Lock, User, AlertCircle, CheckCircle, Loader2, Check, X } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Check if user is already logged in - removed to prevent redirect loop

  // Password validation
  const validatePassword = (pwd: string) => {
    setPasswordStrength({
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    });
  };

  const isPasswordStrong = () => {
    return Object.values(passwordStrength).every(v => v === true);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDebugInfo('');

    // Validate password strength
    if (!isPasswordStrong()) {
      setError('Password does not meet all requirements. Please check the criteria below.');
      return;
    }

    setLoading(true);

    try {
      setDebugInfo('Creating your account...');
      console.log('[Signup] Starting signup attempt...');

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      console.log('[Signup] Signup response:', { hasUser: !!data.user, error: signUpError });

      if (signUpError) {
        console.error('[Signup] Signup error:', signUpError);
        throw signUpError;
      }

      if (!data.user) {
        throw new Error('No user returned from signup');
      }

      setSuccess(true);
      console.log('[Signup] User created:', data.user.email);

      // Check if email confirmation is required
      if (data.user.confirmed_at) {
        setDebugInfo('Account verified! Setting up your session...');
        console.log('[Signup] User already confirmed');
      } else {
        setDebugInfo('Account created! Checking session...');
        console.log('[Signup] Email confirmation may be required');
      }

      // Wait for session to establish
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[Signup] Session check:', { hasSession: !!session, email: session?.user?.email });

      if (session) {
        console.log('[Signup] Session created, navigating to dashboard');
        setDebugInfo('Session ready. Redirecting to dashboard...');

        // Additional delay to ensure session is persisted
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('[Signup] Navigating to dashboard...');
        router.push('/dashboard');
      } else {
        // No session means email confirmation is required
        console.log('[Signup] No session, email confirmation required');
        setDebugInfo('Please check your email to verify your account, then login.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }

    } catch (err: any) {
      console.error('[Signup] Signup failed:', err);
      setError(err.message || 'Failed to create account. Please try again.');
      setDebugInfo('');
      setLoading(false);
      setSuccess(false);
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-md mx-auto">
        <div className="glass rounded-xl p-8 space-y-6 border border-gray-800">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gradient">Create Account</h1>
            <p className="text-gray-400">Start transforming your PDFs today</p>
          </div>

          {/* Debug Info */}
          {debugInfo && (
            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 flex items-start space-x-3">
              <Loader2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 animate-spin" />
              <p className="text-sm text-blue-500">{debugInfo}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-500 font-medium">Account created successfully!</p>
                <p className="text-xs text-green-500/70 mt-1">Setting up your profile...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-500">{error}</p>
                {error.includes('already registered') && (
                  <p className="text-xs text-red-400 mt-1">
                    Already have an account?{' '}
                    <Link href="/login" className="underline hover:text-red-300">
                      Login here
                    </Link>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 px-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="John Doe"
                  required
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
            </div>

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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 px-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              {/* Password Strength Indicators */}
              {password && (
                <div className="mt-3 space-y-2 p-3 bg-gray-900/30 border border-gray-700 rounded-lg">
                  <p className="text-xs text-gray-400 font-medium mb-2">Password must contain:</p>
                  <div className="space-y-1">
                    <div className={`flex items-center gap-2 text-xs ${passwordStrength.length ? 'text-green-500' : 'text-gray-500'}`}>
                      {passwordStrength.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordStrength.uppercase ? 'text-green-500' : 'text-gray-500'}`}>
                      {passwordStrength.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>One uppercase letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordStrength.lowercase ? 'text-green-500' : 'text-gray-500'}`}>
                      {passwordStrength.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>One lowercase letter (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordStrength.number ? 'text-green-500' : 'text-gray-500'}`}>
                      {passwordStrength.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>One number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordStrength.special ? 'text-green-500' : 'text-gray-500'}`}>
                      {passwordStrength.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>One special character (!@#$%^&*...)</span>
                    </div>
                  </div>
                  {isPasswordStrong() && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Strong password!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                className="mt-1 rounded border-gray-700 bg-gray-900/50 text-primary focus:ring-primary focus:ring-offset-0"
                required
                disabled={loading}
              />
              <span className="text-sm text-gray-400">
                I agree to the{' '}
                <Link href="/terms" className="text-primary hover:text-primary-light">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary hover:text-primary-light">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 glow-red"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary-light font-medium transition-colors">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
