'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        if (requireAuth) {
          router.push('/login?redirect=' + window.location.pathname);
        }
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setUser(user);
      setIsAuthenticated(true);

      // Fetch profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (profile) {
        setProfile(profile);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      if (requireAuth) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
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
