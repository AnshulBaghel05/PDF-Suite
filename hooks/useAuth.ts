'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

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

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [preventRedirect, setPreventRedirect] = useState(false);

  useEffect(() => {
    // Initial auth check
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('[useAuth] Auth state changed:', event, session?.user?.email);

        if (event === 'SIGNED_IN' && session) {
          console.log('[useAuth] User signed in via event');
          setPreventRedirect(true); // Prevent any pending redirect
          setUser(session.user);
          setIsAuthenticated(true);
          setInitialCheckDone(true);
          await fetchProfile(session.user.id);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          console.log('[useAuth] User signed out');
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
          setPreventRedirect(false);
          setLoading(false);
          if (requireAuth) {
            router.push('/login');
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('[useAuth] Token refreshed');
        } else if (event === 'INITIAL_SESSION' && session) {
          console.log('[useAuth] Initial session detected');
          setPreventRedirect(true);
          setUser(session.user);
          setIsAuthenticated(true);
          await fetchProfile(session.user.id);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [requireAuth]);

  // Separate effect to handle redirect after initial check
  useEffect(() => {
    // Don't redirect if preventRedirect flag is set (user just logged in)
    if (preventRedirect) {
      console.log('[useAuth] Redirect prevented - user authenticated');
      return;
    }

    if (initialCheckDone && !loading && !isAuthenticated && requireAuth) {
      console.log('[useAuth] Initial check done, not authenticated, will redirect to login');

      // Only redirect if we're not already on the login/signup page
      const currentPath = window.location.pathname;
      if (currentPath === '/login' || currentPath === '/signup') {
        console.log('[useAuth] Already on auth page, skipping redirect');
        return;
      }

      // Add a delay to prevent race condition with login redirect
      const timeout = setTimeout(() => {
        console.log('[useAuth] Executing redirect to login');
        router.push('/login?redirect=' + window.location.pathname);
      }, 2000); // Increased to 2 seconds
      return () => clearTimeout(timeout);
    }
  }, [initialCheckDone, loading, isAuthenticated, requireAuth, router, preventRedirect]);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('[useAuth] Fetching profile for user:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[useAuth] Error fetching profile:', error);
      } else if (profile) {
        console.log('[useAuth] Profile loaded:', profile.plan_type);
        setProfile(profile);
      }
    } catch (error) {
      console.error('[useAuth] Error fetching profile:', error);
    }
  };

  const checkAuth = async () => {
    try {
      console.log('[useAuth] Initial auth check...');

      // First try to get session from storage
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[useAuth] Session:', session?.user?.email);

      if (!session) {
        console.log('[useAuth] No session found');
        setIsAuthenticated(false);
        setLoading(false);
        setInitialCheckDone(true);
        return;
      }

      console.log('[useAuth] Session found:', session.user.email);
      setUser(session.user);
      setIsAuthenticated(true);

      // Fetch profile
      await fetchProfile(session.user.id);

      setLoading(false);
      setInitialCheckDone(true);
    } catch (error) {
      console.error('[useAuth] Auth check error:', error);
      setIsAuthenticated(false);
      setLoading(false);
      setInitialCheckDone(true);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    signOut,
    refreshProfile: checkAuth,
  };
}
