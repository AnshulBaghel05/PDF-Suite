'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { FileText, CreditCard, Activity, Settings, Clock, TrendingUp, Grid3x3 } from 'lucide-react';
import AuthNav from '@/components/layout/AuthNav';

interface UsageLog {
  id: string;
  tool_name: string;
  file_size: number;
  success: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading, isAuthenticated } = useAuth();
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (profile) {
      fetchUsageLogs();
    }
  }, [profile]);

  const fetchUsageLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching usage logs:', error);
      } else {
        setUsageLogs(data || []);
      }
    } catch (error) {
      console.error('Error fetching usage logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return null;
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatToolName = (toolName: string) => {
    return toolName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'pro':
        return 'text-blue-500';
      case 'enterprise':
        return 'text-purple-500';
      default:
        return 'text-gray-400';
    }
  };

  const getPlanBadge = (planType: string) => {
    switch (planType) {
      case 'pro':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/50';
      case 'enterprise':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/50';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <>
      <AuthNav />
      <main className="min-h-screen pt-24 pb-12">
        <div className="section-container">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gradient">Dashboard</h1>
                <p className="text-gray-400 mt-2">
                  Welcome back, {profile.full_name || user?.email?.split('@')[0]}
                </p>
              </div>
            </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Plan */}
            <div className="glass rounded-xl p-6 border border-gray-800 hover:border-primary/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Current Plan</p>
                  <div className="flex items-center gap-2">
                    <p className={`text-2xl font-bold capitalize ${getPlanColor(profile.plan_type)}`}>
                      {profile.plan_type}
                    </p>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPlanBadge(profile.plan_type)}`}>
                      Active
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            {/* Credits Remaining */}
            <div className="glass rounded-xl p-6 border border-gray-800 hover:border-primary/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Credits Remaining</p>
                  <p className="text-2xl font-bold text-white">
                    {profile.credits_remaining}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {profile.plan_type === 'free' && 'Renews monthly'}
                    {profile.plan_type === 'pro' && 'Renews monthly'}
                    {profile.plan_type === 'enterprise' && 'Unlimited'}
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            {/* Credits Used */}
            <div className="glass rounded-xl p-6 border border-gray-800 hover:border-primary/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Credits Used</p>
                  <p className="text-2xl font-bold text-white">
                    {profile.credits_used}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Total lifetime usage</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
              </div>
              <a
                href="/tools"
                className="flex items-center gap-2 text-primary hover:text-primary-light transition-colors text-sm font-medium"
              >
                <Grid3x3 className="w-4 h-4" />
                View All 26 Tools
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/tools/merge-pdf"
                className="btn-secondary text-center hover:glow-red transition-all"
              >
                Merge PDF
              </a>
              <a
                href="/tools/split-pdf"
                className="btn-secondary text-center hover:glow-red transition-all"
              >
                Split PDF
              </a>
              <a
                href="/tools/compress-pdf"
                className="btn-secondary text-center hover:glow-red transition-all"
              >
                Compress PDF
              </a>
              <a
                href="/tools/rotate-pdf"
                className="btn-secondary text-center hover:glow-red transition-all"
              >
                Rotate PDF
              </a>
              <a
                href="/tools/pdf-to-word"
                className="btn-secondary text-center hover:glow-red transition-all"
              >
                PDF to Word
              </a>
              <a
                href="/tools/protect-pdf"
                className="btn-secondary text-center hover:glow-red transition-all"
              >
                Protect PDF
              </a>
              <a
                href="/tools/image-to-pdf"
                className="btn-secondary text-center hover:glow-red transition-all"
              >
                Image to PDF
              </a>
              <a
                href="/pricing"
                className="btn-primary text-center glow-red"
              >
                Upgrade Plan
              </a>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            </div>

            {loadingLogs ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Loading activity...</p>
              </div>
            ) : usageLogs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No activity yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Start using tools to see your activity here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {usageLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${log.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="text-white font-medium">{formatToolName(log.tool_name)}</p>
                        <p className="text-gray-400 text-sm">
                          {formatBytes(log.file_size)} • {new Date(log.created_at).toLocaleDateString()} at{' '}
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      log.success
                        ? 'bg-green-500/10 text-green-500 border border-green-500/50'
                        : 'bg-red-500/10 text-red-500 border border-red-500/50'
                    }`}>
                      {log.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Settings */}
          <div className="glass rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-white">Account Settings</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Email Address</label>
                <p className="text-white font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Member Since</label>
                <p className="text-white font-medium">
                  {new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">User ID</label>
                <p className="text-white font-mono text-sm">{profile.id.slice(0, 20)}...</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Account Status</label>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/50 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Upgrade CTA for Free Users */}
          {profile.plan_type === 'free' && (
            <div className="glass rounded-xl p-8 border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-3">Unlock More Features</h3>
                <p className="text-gray-400 mb-6">
                  Upgrade to Pro and get 100 credits per month, larger file uploads, and priority support.
                </p>
                <a href="/pricing" className="btn-primary glow-red inline-block">
                  View Pricing Plans
                </a>
              </div>
            </div>
          )}
          </div>
        </div>
      </main>
    </>
  );
}
