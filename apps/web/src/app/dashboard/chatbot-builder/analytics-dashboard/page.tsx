'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, Users, ThumbsUp, MessageSquare, AlertTriangle } from 'lucide-react';
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

const mockTrends: Record<string, { value: string; positive: boolean }> = {
  totalConversations: { value: '+12%', positive: true },
  totalMessages: { value: '+8%', positive: true },
  totalIntents: { value: '+5%', positive: true },
  totalEntities: { value: '+3%', positive: true },
};

const barData = [
  { day: 'Mon', volume: 40, handoffs: 8 },
  { day: 'Tue', volume: 65, handoffs: 13 },
  { day: 'Wed', volume: 45, handoffs: 9 },
  { day: 'Thu', volume: 80, handoffs: 16 },
  { day: 'Fri', volume: 55, handoffs: 11 },
  { day: 'Sat', volume: 70, handoffs: 14 },
  { day: 'Sun', volume: 60, handoffs: 12 },
];

function formatNumber(n: number | undefined | null): string {
  if (n == null) return '—';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toLocaleString();
}

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

  const trend = (key: string) => mockTrends[key] || { value: '—', positive: true };

  const topIntents: { name: string; val: number }[] = analytics?.intentDistribution
    ? analytics.intentDistribution.slice(0, 5).map((i) => ({ name: i.intentName, val: i.count }))
    : [];

  const intentMax = topIntents.length > 0 ? Math.max(...topIntents.map((i) => i.val)) : 100;

  const statCards = [
    {
      label: 'Conversations',
      key: 'totalConversations',
      value: formatNumber((analytics as any)?.totalConversations),
      icon: MessageSquare,
      color: 'text-indigo-500',
    },
    {
      label: 'Messages',
      key: 'totalMessages',
      value: formatNumber((analytics as any)?.totalMessages),
      icon: MessageSquare,
      color: 'text-emerald-500',
    },
    {
      label: 'Intents',
      key: 'totalIntents',
      value: formatNumber((analytics as any)?.totalIntents),
      icon: ThumbsUp,
      color: 'text-amber-500',
    },
    {
      label: 'Entities',
      key: 'totalEntities',
      value: formatNumber((analytics as any)?.totalEntities),
      icon: Users,
      color: 'text-rose-500',
    },
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

      {!analytics && !loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No analytics data available.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((stat, i) => {
              const t = trend(stat.key);
              return (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${t.positive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}
                    >
                      {t.value}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                  <p className="text-slate-500 text-sm">{stat.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold mb-6">Volume vs. Handoffs</h3>
              <div className="h-64 flex items-end justify-between px-2 gap-2">
                {barData.map((d, i) => {
                  const maxVal = Math.max(...barData.map((x) => x.volume));
                  const hPct = (d.volume / maxVal) * 100;
                  const hoPct = (d.handoffs / maxVal) * 100;
                  return (
                    <div
                      key={i}
                      className="w-full flex flex-col items-center gap-1 relative"
                      style={{ height: '100%' }}
                    >
                      <div
                        className="w-full bg-indigo-100 dark:bg-indigo-900/20 rounded-t-lg relative flex-1 self-end"
                        style={{ height: `${hPct}%` }}
                      >
                        <div
                          className="absolute bottom-0 w-full bg-indigo-500 rounded-t-lg transition-all hover:opacity-80"
                          style={{ height: '100%' }}
                        />
                        <div
                          className="absolute bottom-0 w-full bg-rose-400 rounded-t-lg opacity-50 transition-all"
                          style={{ height: `${(d.handoffs / d.volume) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-4">
                {barData.map((d, i) => (
                  <span key={i}>{d.day}</span>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold mb-6">Top Intents</h3>
              {topIntents.length > 0 ? (
                <div className="space-y-4">
                  {topIntents.map((item, i) => {
                    const colors = [
                      'bg-indigo-500',
                      'bg-emerald-500',
                      'bg-amber-500',
                      'bg-cyan-500',
                      'bg-rose-300',
                    ];
                    const pct = Math.round((item.val / intentMax) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm font-medium mb-1">
                          <span>{item.name}</span>
                          <span>{item.val}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colors[i % colors.length]} transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                  No intent data available
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
