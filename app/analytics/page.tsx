'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Calendar,
} from 'lucide-react';
import AuthNav from '@/components/layout/AuthNav';

interface UsageLog {
  id: string;
  tool_name: string;
  file_size: number;
  success: boolean;
  created_at: string;
}

interface ToolUsage {
  tool_name: string;
  count: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { profile, loading, isAuthenticated } = useAuth();
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (profile) {
      fetchUsageLogs();
    }
  }, [profile, timeRange]);

  const fetchUsageLogs = async () => {
    try {
      setLoadingData(true);

      let query = supabase
        .from('usage_logs')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false });

      // Apply time filter
      if (timeRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('created_at', weekAgo.toISOString());
      } else if (timeRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('created_at', monthAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching usage logs:', error);
      } else {
        setUsageLogs(data || []);
      }
    } catch (error) {
      console.error('Error fetching usage logs:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading) {
    return (
      <>
        <AuthNav />
        <div className="min-h-screen flex items-center justify-center pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated || !profile) {
    return null;
  }

  // Calculate statistics
  const totalOperations = usageLogs.length;
  const successfulOperations = usageLogs.filter(log => log.success).length;
  const failedOperations = usageLogs.filter(log => log.success === false).length;
  const successRate = totalOperations > 0 ? Math.round((successfulOperations / totalOperations) * 100) : 0;
  const totalDataProcessed = usageLogs.reduce((sum, log) => sum + log.file_size, 0);

  // Get most used tools
  const toolUsageMap = usageLogs.reduce((acc, log) => {
    acc[log.tool_name] = (acc[log.tool_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topTools = Object.entries(toolUsageMap)
    .map(([tool_name, count]) => ({ tool_name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

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

  const getTimeRangeText = () => {
    switch (timeRange) {
      case 'week':
        return 'Last 7 Days';
      case 'month':
        return 'Last 30 Days';
      case 'all':
        return 'All Time';
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
                <h1 className="text-3xl md:text-4xl font-bold text-gradient">Analytics</h1>
                <p className="text-gray-400 mt-2">
                  Track your PDF processing activity and usage patterns
                </p>
              </div>

              {/* Time Range Filter */}
              <div className="flex gap-2">
                {(['week', 'month', 'all'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      timeRange === range
                        ? 'bg-primary text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {range === 'week' && '7 Days'}
                    {range === 'month' && '30 Days'}
                    {range === 'all' && 'All Time'}
                  </button>
                ))}
              </div>
            </div>

            {loadingData ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-400">Loading analytics data...</p>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Operations */}
                  <div className="glass rounded-xl p-6 border border-gray-800 hover:border-primary/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <Activity className="w-8 h-8 text-primary" />
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                        {getTimeRangeText()}
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{totalOperations}</p>
                    <p className="text-sm text-gray-400">Total Operations</p>
                  </div>

                  {/* Success Rate */}
                  <div className="glass rounded-xl p-6 border border-gray-800 hover:border-green-500/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                        Rate
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{successRate}%</p>
                    <p className="text-sm text-gray-400">Success Rate</p>
                  </div>

                  {/* Data Processed */}
                  <div className="glass rounded-xl p-6 border border-gray-800 hover:border-blue-500/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-500">
                        Volume
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{formatBytes(totalDataProcessed)}</p>
                    <p className="text-sm text-gray-400">Data Processed</p>
                  </div>

                  {/* Credits Used */}
                  <div className="glass rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <TrendingUp className="w-8 h-8 text-purple-500" />
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-500">
                        Total
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{profile.credits_used}</p>
                    <p className="text-sm text-gray-400">Credits Used</p>
                  </div>
                </div>

                {/* Top Tools */}
                <div className="glass rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-white">Most Used Tools</h2>
                  </div>

                  {topTools.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No tool usage data yet</p>
                      <p className="text-gray-500 text-sm mt-1">Start using tools to see analytics</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {topTools.map((tool, index) => {
                        const percentage = Math.round((tool.count / totalOperations) * 100);
                        return (
                          <div key={tool.tool_name} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-300 font-medium">
                                #{index + 1} {formatToolName(tool.tool_name)}
                              </span>
                              <span className="text-gray-400">
                                {tool.count} uses ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-primary to-primary-light h-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Success vs Failure */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center gap-2 mb-6">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <h2 className="text-xl font-semibold text-white">Successful Operations</h2>
                    </div>
                    <div className="text-center py-8">
                      <p className="text-5xl font-bold text-green-500 mb-2">{successfulOperations}</p>
                      <p className="text-gray-400">Operations completed successfully</p>
                    </div>
                  </div>

                  <div className="glass rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center gap-2 mb-6">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <h2 className="text-xl font-semibold text-white">Failed Operations</h2>
                    </div>
                    <div className="text-center py-8">
                      <p className="text-5xl font-bold text-red-500 mb-2">{failedOperations}</p>
                      <p className="text-gray-400">Operations that encountered errors</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Timeline */}
                <div className="glass rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
                  </div>

                  {usageLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No activity in this time range</p>
                      <p className="text-gray-500 text-sm mt-1">Try selecting a different time range</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {usageLogs.slice(0, 10).map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-all"
                        >
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{formatToolName(log.tool_name)}</p>
                            <p className="text-gray-400 text-sm">
                              {formatBytes(log.file_size)} • {new Date(log.created_at).toLocaleDateString()} at{' '}
                              {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs flex-shrink-0 ${
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
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
