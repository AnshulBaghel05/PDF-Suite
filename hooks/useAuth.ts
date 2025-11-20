'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  plan_type: 'free' | 'pro' | 'enterprise';
  credits_remaining: number;
  credits_used: number;
  created_at: string;
  updated_at?: string;
  subscription_id?: string | null;
}

/**
 * Legacy useAuth hook - now wraps AuthContext for backward compatibility
 * @param requireAuth - If true, redirects to login when not authenticated
 */
export function useAuth(requireAuth = true) {
  const router = useRouter();
  const { user, profile, loading, isAuthenticated, signOut, refreshProfile } = useAuthContext();

  useEffect(() => {
    // Only redirect if requireAuth is true and user is not authenticated
    if (!requireAuth || loading) {
      return;
    }

    if (!isAuthenticated) {
      // Don't redirect if already on auth pages
      const currentPath = window.location.pathname;
      if (currentPath === '/login' || currentPath === '/signup' || currentPath === '/forgot-password') {
        return;
      }

      // Redirect to login with return URL
      const timeout = setTimeout(() => {
        router.push('/login?redirect=' + encodeURIComponent(currentPath));
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [requireAuth, loading, isAuthenticated, router]);

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    signOut,
    refreshProfile,
  };
}
