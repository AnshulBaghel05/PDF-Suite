'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Grid3x3,
  Settings,
  BarChart3,
  Menu,
  X,
  FileText,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AuthNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/tools',
      label: 'All Tools',
      icon: Grid3x3,
    },
    {
      href: '/analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-primary p-2 rounded-lg group-hover:glow-red transition-all">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">PDFSuit</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    active
                      ? 'bg-primary text-white shadow-lg shadow-primary/50'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {profile && (
              <div className="glass rounded-lg px-3 py-1.5 border border-gray-700">
                <span className="text-sm text-gray-400">Credits: </span>
                <span className="text-sm font-bold text-primary">
                  {profile.plan_type === 'enterprise' ? '∞' : profile.credits_remaining}
                </span>
              </div>
            )}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 glass rounded-lg px-3 py-2 border border-gray-700 hover:border-primary/50 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-gray-300 max-w-[150px] truncate">
                  {profile?.full_name || user?.email?.split('@')[0]}
                </span>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 glass rounded-lg border border-gray-800 shadow-xl overflow-hidden">
                  <div className="p-3 border-b border-gray-800">
                    <p className="text-sm text-gray-400">Signed in as</p>
                    <p className="text-sm text-white font-medium truncate">{user?.email}</p>
                    <p className="text-xs text-gray-500 capitalize mt-1">
                      {profile?.plan_type} Plan
                    </p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 transition-all font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-800">
            {/* User Info */}
            <div className="glass rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-400">Signed in as</p>
              <p className="text-sm text-white font-medium truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary capitalize">
                  {profile?.plan_type}
                </span>
                <span className="text-xs text-gray-400">
                  Credits: <span className="text-primary font-bold">
                    {profile?.plan_type === 'enterprise' ? '∞' : profile?.credits_remaining}
                  </span>
                </span>
              </div>
            </div>

            {/* Nav Items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* Sign Out */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleSignOut();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
