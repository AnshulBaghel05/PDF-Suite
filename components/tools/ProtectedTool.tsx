'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import Link from 'next/link';

interface ProtectedToolProps {
  children: React.ReactNode;
  toolId: string;
  toolName: string;
}

export default function ProtectedTool({ children, toolId, toolName }: ProtectedToolProps) {
  const { isAuthenticated, loading, profile } = useAuth(false);
  const router = useRouter();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex p-6 bg-primary/10 rounded-full">
            <Lock className="w-16 h-16 text-primary" />
          </div>

          <h1 className="text-4xl font-bold text-white">Authentication Required</h1>

          <p className="text-xl text-gray-400">
            Please sign in to use <span className="text-primary font-semibold">{toolName}</span>
          </p>

          <div className="glass rounded-xl p-8 space-y-4">
            <h3 className="text-lg font-semibold text-white">Why sign in?</h3>
            <ul className="text-left text-gray-300 space-y-2">
              <li>✓ Track your usage and credits</li>
              <li>✓ Access all 26+ PDF tools</li>
              <li>✓ Keep your processing history</li>
              <li>✓ Enjoy free tier with 10 conversions/month</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href={`/login?redirect=/tools/${toolId}`}
              className="btn-primary"
            >
              Login to Continue
            </Link>
            <Link
              href={`/signup?redirect=/tools/${toolId}`}
              className="btn-secondary"
            >
              Create Free Account
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            No credit card required for free tier • Start processing PDFs instantly
          </p>
        </div>
      </div>
    );
  }

  // Check if user has a profile
  if (!profile) {
    return (
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-gray-400">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // Show tool content if authenticated
  return <>{children}</>;
}
