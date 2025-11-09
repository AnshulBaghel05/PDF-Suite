'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Settings as SettingsIcon, User, Bell, Lock, CreditCard, Save } from 'lucide-react';
import AuthNav from '@/components/layout/AuthNav';

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, loading, isAuthenticated } = useAuth();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', profile.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AuthNav />
        <div className="min-h-screen flex items-center justify-center pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-400">Loading settings...</p>
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated || !profile) {
    return null;
  }

  return (
    <>
      <AuthNav />
      <main className="min-h-screen pt-24 pb-12">
        <div className="section-container">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gradient">Settings</h1>
              <p className="text-gray-400 mt-2">
                Manage your account settings and preferences
              </p>
            </div>

            {/* Profile Settings */}
            <div className="glass rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-white">Profile Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">User ID</label>
                  <input
                    type="text"
                    value={profile.id}
                    disabled
                    className="w-full px-4 py-3 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed font-mono text-sm"
                  />
                </div>

                {message.text && (
                  <div className={`p-4 rounded-lg border ${
                    message.type === 'success'
                      ? 'bg-green-500/10 border-green-500/50 text-green-500'
                      : 'bg-red-500/10 border-red-500/50 text-red-500'
                  }`}>
                    {message.text}
                  </div>
                )}

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Plan & Billing */}
            <div className="glass rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-white">Plan & Billing</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-400">Current Plan</p>
                    <p className="text-lg font-semibold text-white capitalize">{profile.plan_type}</p>
                  </div>
                  {profile.plan_type === 'free' && (
                    <a href="/pricing" className="btn-primary">
                      Upgrade Plan
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-400">Credits Remaining</p>
                    <p className="text-lg font-semibold text-white">
                      {profile.plan_type === 'enterprise' ? 'Unlimited' : profile.credits_remaining}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-400">Total Credits Used</p>
                    <p className="text-lg font-semibold text-white">{profile.credits_used}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications (Placeholder) */}
            <div className="glass rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-white">Notifications</h2>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900/70 transition-all">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-400">Receive updates about your account</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 rounded border-gray-600 text-primary focus:ring-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900/70 transition-all">
                  <div>
                    <p className="text-white font-medium">Marketing Emails</p>
                    <p className="text-sm text-gray-400">Receive promotional content and updates</p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-600 text-primary focus:ring-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900/70 transition-all">
                  <div>
                    <p className="text-white font-medium">Credit Alerts</p>
                    <p className="text-sm text-gray-400">Get notified when credits are running low</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 rounded border-gray-600 text-primary focus:ring-primary"
                  />
                </label>
              </div>
            </div>

            {/* Security (Placeholder) */}
            <div className="glass rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-white">Security</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-white font-medium mb-1">Password</p>
                  <p className="text-sm text-gray-400 mb-3">Last changed: Never</p>
                  <button className="btn-secondary text-sm">
                    Change Password
                  </button>
                </div>

                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-white font-medium mb-1">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-400 mb-3">Add an extra layer of security</p>
                  <button className="btn-secondary text-sm" disabled>
                    Enable 2FA (Coming Soon)
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="glass rounded-xl p-6 border border-red-500/30 bg-red-500/5">
              <h2 className="text-xl font-semibold text-red-500 mb-4">Danger Zone</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Delete Account</p>
                    <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
                  </div>
                  <button className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/50 rounded-lg hover:bg-red-500/20 transition-all">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
