'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Mail, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-md mx-auto">
        <div className="glass rounded-xl p-8 space-y-6 border border-gray-800">
          {/* Back Link */}
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gradient">Reset Password</h1>
            <p className="text-gray-400">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-500 font-medium">Reset link sent!</p>
                <p className="text-xs text-green-500/70 mt-1">
                  Check your email for the password reset link.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Reset Form */}
          {!success && (
            <form onSubmit={handleResetPassword} className="space-y-4">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 glow-red"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>
          )}

          {/* Help Text */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>Remember your password?</p>
            <Link href="/login" className="text-primary hover:text-primary-light">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
