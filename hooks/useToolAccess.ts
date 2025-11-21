'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase/client';
import { FILE_SIZE_LIMITS, PLANS } from '@/lib/utils/constants';

export function useToolAccess() {
  const { profile, isAuthenticated, loading, refreshProfile } = useAuth(true);
  const [processing, setProcessing] = useState(false);
  const [optimisticCredits, setOptimisticCredits] = useState<number | null>(null);

  // Get current credits (optimistic or actual)
  const currentCredits = optimisticCredits !== null ? optimisticCredits : (profile?.credits_remaining ?? 0);

  // Check if user can access a specific tool
  const canAccessTool = useCallback((toolId: string): { allowed: boolean; reason?: string } => {
    if (!isAuthenticated || !profile) {
      return { allowed: false, reason: 'Please login to use this tool' };
    }

    const planType = profile.plan_type || 'free';

    // All tools available for all users (free tier gets all 27 tools)
    // Only credit limit applies

    // Check credits (use optimistic value if available)
    const creditsToCheck = optimisticCredits !== null ? optimisticCredits : profile.credits_remaining;
    if (planType !== 'enterprise' && creditsToCheck <= 0) {
      return {
        allowed: false,
        reason: 'You have no credits remaining. Please upgrade your plan or wait for the next billing cycle.'
      };
    }

    return { allowed: true };
  }, [isAuthenticated, profile, optimisticCredits]);

  // Check file size limit
  const checkFileSize = useCallback((fileSize: number): { allowed: boolean; reason?: string } => {
    if (!profile) {
      return { allowed: false, reason: 'Please login to upload files' };
    }

    const planType = profile.plan_type || 'free';
    const maxSize = FILE_SIZE_LIMITS[planType as keyof typeof FILE_SIZE_LIMITS];

    if (fileSize > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return {
        allowed: false,
        reason: `File size exceeds ${maxSizeMB}MB limit for ${planType} plan. Please upgrade to increase file size limit.`
      };
    }

    return { allowed: true };
  }, [profile]);

  // Track usage when a tool is used (NON-BLOCKING - fire and forget)
  const trackUsage = useCallback(async (toolName: string, fileSize: number, success: boolean, errorMessage?: string) => {
    if (!profile) return;

    // Fire and forget - don't await these operations
    // This makes the UI feel much faster

    // Log usage (non-blocking)
    supabase.from('usage_logs').insert({
      user_id: profile.id,
      tool_name: toolName,
      file_size: fileSize,
      success,
      error_message: errorMessage || null,
    }).then(({ error }) => {
      if (error) console.error('Error logging usage:', error);
    });

    // Deduct credit if successful and not enterprise
    if (success && profile.plan_type !== 'enterprise') {
      const newCreditsRemaining = Math.max(0, (optimisticCredits !== null ? optimisticCredits : profile.credits_remaining) - 1);
      const newCreditsUsed = (profile.credits_used || 0) + 1;

      // Update database (non-blocking)
      supabase
        .from('profiles')
        .update({
          credits_remaining: newCreditsRemaining,
          credits_used: newCreditsUsed,
        })
        .eq('id', profile.id)
        .then(({ error }) => {
          if (error) {
            console.error('Error updating credits:', error);
            // Reset optimistic update on failure
            setOptimisticCredits(null);
          }
        });

      // Refresh profile in background (don't block UI)
      refreshProfile().catch(console.error);
    }
  }, [profile, optimisticCredits, refreshProfile]);

  // Process tool with proper checks
  const processTool = useCallback(async (
    toolId: string,
    toolName: string,
    files: File[],
    processFunction: () => Promise<any>
  ) => {
    // Check tool access
    const accessCheck = canAccessTool(toolId);
    if (!accessCheck.allowed) {
      throw new Error(accessCheck.reason);
    }

    // Check file sizes
    for (const file of files) {
      const sizeCheck = checkFileSize(file.size);
      if (!sizeCheck.allowed) {
        throw new Error(sizeCheck.reason);
      }
    }

    setProcessing(true);
    let success = false;
    let errorMessage: string | undefined;

    // Optimistic credit deduction (instant UI update)
    if (profile && profile.plan_type !== 'enterprise') {
      setOptimisticCredits(Math.max(0, (profile.credits_remaining || 0) - 1));
    }

    try {
      const result = await processFunction();
      success = true;
      return result;
    } catch (error: any) {
      success = false;
      errorMessage = error.message || 'Processing failed';

      // Rollback optimistic update on failure
      setOptimisticCredits(null);
      throw error;
    } finally {
      setProcessing(false);

      // Track usage in background (NON-BLOCKING)
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      trackUsage(toolName, totalSize, success, errorMessage);

      // Clear optimistic credits after a delay (let actual profile refresh happen)
      setTimeout(() => setOptimisticCredits(null), 5000);
    }
  }, [profile, canAccessTool, checkFileSize, trackUsage]);

  return {
    profile,
    isAuthenticated,
    loading,
    processing,
    currentCredits, // Use this for displaying credits in UI
    canAccessTool,
    checkFileSize,
    trackUsage,
    processTool,
  };
}
