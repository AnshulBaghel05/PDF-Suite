'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { Loader2, Lock, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ProtectedToolProps {
  children: React.ReactNode;
  toolId: string;
  toolName: string;
}

// Skeleton loading component for tool pages
function ToolSkeleton({ toolName }: { toolName: string }) {
  return (
    <div className="section-container animate-pulse">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="text-center space-y-4">
          <div className="h-10 bg-gray-700/50 rounded-lg w-64 mx-auto"></div>
          <div className="h-6 bg-gray-700/30 rounded w-96 mx-auto"></div>
        </div>

        {/* Upload area skeleton */}
        <div className="glass rounded-xl p-8 space-y-6">
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-700/50 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-700/30 rounded w-48 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-700/20 rounded w-64 mx-auto"></div>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Loading {toolName}...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProtectedTool({ children, toolId, toolName }: ProtectedToolProps) {
  const { isAuthenticated, loading, profile, profileLoading, refreshProfile } = useAuthContext();
  const [profileTimeout, setProfileTimeout] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Set timeout for profile loading (10 seconds)
  useEffect(() => {
    if (isAuthenticated && !profile && !profileLoading) {
      const timeout = setTimeout(() => {
        setProfileTimeout(true);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    } else if (profile) {
      setProfileTimeout(false);
    }
  }, [isAuthenticated, profile, profileLoading]);

  // Handle retry
  const handleRetry = async () => {
    setProfileTimeout(false);
    setRetryCount(prev => prev + 1);
    await refreshProfile();
  };

  // Show skeleton while checking auth status
  if (loading) {
    return <ToolSkeleton toolName={toolName} />;
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
              <li>✓ Access all 27 PDF tools</li>
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

  // Show timeout error with retry option
  if (profileTimeout && !profile) {
    return (
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex p-6 bg-yellow-500/10 rounded-full">
            <AlertCircle className="w-16 h-16 text-yellow-500" />
          </div>

          <h1 className="text-3xl font-bold text-white">Loading Taking Too Long</h1>

          <p className="text-gray-400">
            We're having trouble loading your profile. This might be a connection issue.
          </p>

          <div className="glass rounded-xl p-6 space-y-4">
            <p className="text-sm text-gray-400">
              Retry attempts: {retryCount}
            </p>
            <button
              onClick={handleRetry}
              className="btn-primary flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          </div>

          <p className="text-sm text-gray-500">
            If this keeps happening, try refreshing the page or checking your internet connection.
          </p>
        </div>
      </div>
    );
  }

  // Show skeleton while profile is loading (non-blocking - show content structure)
  if (!profile) {
    return <ToolSkeleton toolName={toolName} />;
  }

  // Show tool content if authenticated and profile loaded
  return <>{children}</>;
}
