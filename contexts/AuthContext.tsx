'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  plan_type: string;
  credits_remaining: number;
  credits_used?: number;
  subscription_id?: string;
  created_at: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  profileLoading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Profile cache constants
const PROFILE_CACHE_KEY = 'pdfsuit_profile_cache';
const PROFILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper functions for profile caching
function getCachedProfile(userId: string): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    if (cached) {
      const { profile, userId: cachedUserId, timestamp } = JSON.parse(cached);
      // Check if cache is valid (same user and not expired)
      if (cachedUserId === userId && Date.now() - timestamp < PROFILE_CACHE_TTL) {
        return profile;
      }
    }
  } catch (err) {
    console.error('Error reading profile cache:', err);
  }
  return null;
}

function setCachedProfile(userId: string, profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({
      profile,
      userId,
      timestamp: Date.now(),
    }));
  } catch (err) {
    console.error('Error writing profile cache:', err);
  }
}

function clearCachedProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch (err) {
    console.error('Error clearing profile cache:', err);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile with caching - non-blocking
  const fetchProfile = useCallback(async (userId: string, forceRefresh = false) => {
    // Try to load from cache first (instant)
    if (!forceRefresh) {
      const cached = getCachedProfile(userId);
      if (cached) {
        setProfile(cached);
        // Still refresh in background for fresh data
        setProfileLoading(true);
      }
    }

    try {
      setProfileLoading(true);
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, plan_type, credits_remaining, credits_used, subscription_id, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setProfileLoading(false);
        return;
      }

      if (data) {
        setProfile(data);
        setCachedProfile(userId, data);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id, true); // Force refresh from database
    }
  }, [user, fetchProfile]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      clearCachedProfile(); // Clear cached profile on sign out
      // Redirect using window.location instead of Next.js router
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }, []);

  useEffect(() => {
    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          setLoading(false);
          return;
        }

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setLoading(false); // Set loading false BEFORE profile fetch
          fetchProfile(currentSession.user.id); // Let profile load in background
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener (SINGLE subscription for entire app)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('[AuthContext] Auth state changed:', event);

        if (event === 'SIGNED_IN' && currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setLoading(false); // UI renders immediately
          // Load cached profile instantly, then refresh in background
          const cached = getCachedProfile(currentSession.user.id);
          if (cached) {
            setProfile(cached);
          }
          // Fetch fresh profile in background (non-blocking)
          fetchProfile(currentSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          clearCachedProfile();
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        } else if (event === 'USER_UPDATED' && currentSession) {
          setUser(currentSession.user);
          // Refresh profile in background (non-blocking)
          fetchProfile(currentSession.user.id, true);
        }
      }
    );

    // Cleanup: unsubscribe on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Memoize context value to prevent unnecessary re-renders
  const value: AuthContextType = useMemo(() => ({
    user,
    session,
    profile,
    isAuthenticated: !!session && !!user,
    loading,
    profileLoading,
    error,
    signOut,
    refreshProfile,
  }), [user, session, profile, loading, profileLoading, error, signOut, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
