'use client';

import { useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase/client';
import { FILE_SIZE_LIMITS, PLANS } from '@/lib/utils/constants';

export function useToolAccess() {
  const { profile, isAuthenticated, loading, refreshProfile } = useAuth(true);
  const [processing, setProcessing] = useState(false);

  // Check if user can access a specific tool
  const canAccessTool = (toolId: string): { allowed: boolean; reason?: string } => {
    if (!isAuthenticated || !profile) {
      return { allowed: false, reason: 'Please login to use this tool' };
    }

    const planType = profile.plan_type || 'free';

    // All tools available for all users (free tier gets all 27 tools)
    // Only credit limit applies

    // Check credits
    if (planType !== 'enterprise' && profile.credits_remaining <= 0) {
      return {
        allowed: false,
        reason: 'You have no credits remaining. Please upgrade your plan or wait for the next billing cycle.'
      };
    }

    return { allowed: true };
  };

  // Check file size limit
  const checkFileSize = (fileSize: number): { allowed: boolean; reason?: string } => {
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
  };

  // Track usage when a tool is used
  const trackUsage = async (toolName: string, fileSize: number, success: boolean, errorMessage?: string) => {
    if (!profile) return;

    try {
      // Log usage
      await supabase.from('usage_logs').insert({
        user_id: profile.id,
        tool_name: toolName,
        file_size: fileSize,
        success,
        error_message: errorMessage || null,
      });

      // Deduct credit if successful and not enterprise
      if (success && profile.plan_type !== 'enterprise') {
        const newCreditsRemaining = Math.max(0, profile.credits_remaining - 1);
        const newCreditsUsed = (profile.credits_used || 0) + 1;

        await supabase
          .from('profiles')
          .update({
            credits_remaining: newCreditsRemaining,
            credits_used: newCreditsUsed,
          })
          .eq('id', profile.id);

        // Refresh the profile to update UI with new credits
        await refreshProfile();
      }
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  };

  // Process tool with proper checks
  const processTool = async (
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

    try {
      const result = await processFunction();
      success = true;
      return result;
    } catch (error: any) {
      success = false;
      errorMessage = error.message || 'Processing failed';
      throw error;
    } finally {
      setProcessing(false);

      // Track usage
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      await trackUsage(toolName, totalSize, success, errorMessage);
    }
  };

  return {
    profile,
    isAuthenticated,
    loading,
    processing,
    canAccessTool,
    checkFileSize,
    trackUsage,
    processTool,
  };
}
