'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Users,
  ThumbsUp,
  MessageSquare,
  AlertTriangle,
  Download,
  RefreshCw,
  GitBranch,
  Clock,
  Zap,
  Activity,
  Target,
} from 'lucide-react';
import { useChatbot } from '../hooks/useChatbot';

function getDateRange(period: string) {
  const now = new Date();
  const end = now.toISOString();
  let start: Date;
  switch (period) {
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'quarter': {
      const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      start = qStart;
      break;
    }
    default:
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  return { startDate: start.toISOString(), endDate: end };
}

function formatNumber(n: number | undefined | null): string {
  if (n == null) return '—';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toLocaleString();
}

function formatPct(n: number | undefined | null): string {
  if (n == null) return '—';
  return n + '%';
}

function formatSecs(s: number | undefined | null): string {
  if (s == null) return '—';
  if (s < 60) return s.toFixed(1) + 's';
  return Math.floor(s / 60) + 'm ' + Math.round(s % 60) + 's';
}

const channelLabels: Record<string, string> = {
  web: 'Web Widget',
  slack: 'Slack',
  teams: 'Teams',
  whatsapp: 'WhatsApp',
  facebook: 'Messenger',
  mobile: 'Mobile App',
};

export default function ChatbotAnalyticsPage() {
  const { analytics, loading, loadAnalytics, addToast } = useChatbot();
  const [period, setPeriod] = useState('30d');

  const fetchAnalytics = useCallback(
    async (p: string) => {
      const { startDate, endDate } = getDateRange(p);
      try {
        await loadAnalytics(startDate, endDate);
      } catch {
        addToast({ type: 'error', message: 'Failed to load analytics' });
      }
    },
    [loadAnalytics, addToast]
  );

  useEffect(() => {
    fetchAnalytics(period);
  }, [period, fetchAnalytics]);

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value);
  };

  const handleRefresh = () => {
    fetchAnalytics(period);
  };

  const handleExport = () => {
    if (!analytics) return;
    const json = JSON.stringify(analytics, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-analytics-${period}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', message: 'Analytics exported' });
  };

  const topIntents: { name: string; val: number }[] = analytics?.intentDistribution
    ? analytics.intentDistribution.slice(0, 5).map((i) => ({ name: i.intentName, val: i.count }))
    : [];

  const intentMax = topIntents.length > 0 ? Math.max(...topIntents.map((i) => i.val)) : 100;

  const m = analytics?.conversationMetrics;
  const cm = [
    {
      label: 'Completion Rate',
      value: formatPct(m?.completionRate),
      icon: Target,
      color: 'text-emerald-500',
    },
    {
      label: 'Abandonment Rate',
      value: formatPct(m?.abandonmentRate),
      icon: Activity,
      color: 'text-rose-500',
    },
    {
      label: 'Handoff Rate',
      value: formatPct(m?.handoffRate),
      icon: Users,
      color: 'text-amber-500',
    },
    {
      label: 'Avg Turns',
      value: m?.averageTurns != null ? String(m.averageTurns) : '—',
      icon: MessageSquare,
      color: 'text-indigo-500',
    },
  ];

  const barColors = [
    'bg-indigo-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-cyan-500',
    'bg-rose-300',
  ];

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {loading && (
        <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 z-10 flex items-center justify-center rounded-2xl">
          <div className="flex items-center gap-3 text-slate-500">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading analytics...</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            Analytics Dashboard
          </h1>
          <p className="text-slate-500 text-sm">Monitor bot performance and user engagement.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={!analytics}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <select
            value={period}
            onChange={handlePeriodChange}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm outline-none"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {!analytics && !loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No analytics data available.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                label: 'Conversations',
                value: formatNumber(analytics?.totalConversations),
                icon: MessageSquare,
                color: 'text-indigo-500',
              },
              {
                label: 'Messages',
                value: formatNumber(analytics?.totalMessages),
                icon: MessageSquare,
                color: 'text-emerald-500',
              },
              {
                label: 'Intents',
                value: formatNumber(analytics?.totalIntents),
                icon: ThumbsUp,
                color: 'text-amber-500',
              },
              {
                label: 'Entities',
                value: formatNumber(analytics?.totalEntities),
                icon: Users,
                color: 'text-rose-500',
              },
              {
                label: 'Dialogue Flows',
                value: formatNumber(analytics?.totalFlows),
                icon: GitBranch,
                color: 'text-cyan-500',
              },
              {
                label: 'Avg Response',
                value: formatSecs(analytics?.averageResponseTime),
                icon: Clock,
                color: 'text-purple-500',
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4"
              >
                <div
                  className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} w-fit mb-3`}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold mb-0.5">{stat.value}</h3>
                <p className="text-slate-500 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <h3 className="font-bold mb-4">Conversation Metrics</h3>
              <div className="grid grid-cols-2 gap-3">
                {cm.map((item, i) => (
                  <div
                    key={i}
                    className="border border-slate-100 dark:border-slate-800 rounded-xl p-3"
                  >
                    <div className={`${item.color} mb-1`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold">{item.value}</p>
                    <p className="text-xs text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Zap className="w-3.5 h-3.5" />
                  Avg conversation length:{' '}
                  {analytics?.averageConversationLength != null
                    ? analytics.averageConversationLength + ' turns'
                    : '—'}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <h3 className="font-bold mb-4">Top Intents</h3>
              {topIntents.length > 0 ? (
                <div className="space-y-3">
                  {topIntents.map((item, i) => {
                    const pct = Math.round((item.val / intentMax) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm font-medium mb-1">
                          <span className="truncate mr-2">{item.name}</span>
                          <span className="text-slate-500 shrink-0">{item.val}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${barColors[i % barColors.length]} transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
                  No intent data available
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <h3 className="font-bold mb-4">Channel Breakdown</h3>
              {analytics?.channelBreakdown && analytics.channelBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {analytics.channelBreakdown.map((ch, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {channelLabels[ch.channelType] || ch.channelType}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span>{ch.conversationCount} conv</span>
                        <span>{ch.messageCount} msgs</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-slate-400 text-sm">
                  No channel data available
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <h3 className="font-bold mb-4">Failed Intents</h3>
              {analytics?.failedIntents && analytics.failedIntents.length > 0 ? (
                <div className="space-y-3">
                  {analytics.failedIntents.map((fi, i) => (
                    <div
                      key={i}
                      className="border border-slate-100 dark:border-slate-800 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{fi.intentName}</span>
                        <span className="text-xs text-rose-500 font-bold">
                          {formatPct(fi.failureRate)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{fi.failureCount} failures</p>
                      {fi.commonPhrases.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {fi.commonPhrases.slice(0, 3).map((p, j) => (
                            <span
                              key={j}
                              className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500"
                            >
                              &ldquo;{p}&rdquo;
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-slate-400 text-sm">
                  {analytics?.totalConversations ? 'No failed intents' : 'No intent data available'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
