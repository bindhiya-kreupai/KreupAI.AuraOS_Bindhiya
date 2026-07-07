'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  History,
  MapPin,
  Smartphone,
  Monitor,
  ShieldCheck,
  AlertOctagon,
  Globe,
  Users,
} from 'lucide-react';
import { APIClient } from '@/lib/api-client';

interface LoginEvent {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  success: boolean;
  timestamp: string;
}

interface LoginSummary {
  totalLogins: number;
  failedLogins: number;
  activeSessions: number;
  uniqueUsers: number;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function actionLabel(action: string): { label: string; ok: boolean } {
  switch (action) {
    case 'USER_LOGIN':
      return { label: 'Login', ok: true };
    case 'USER_LOGOUT':
      return { label: 'Logout', ok: true };
    case 'USER_LOGIN_FAILED':
      return { label: 'Failed', ok: false };
    default:
      return { label: action, ok: true };
  }
}

export default function LoginHistoryPage() {
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [summary, setSummary] = useState<LoginSummary>({
    totalLogins: 0,
    failedLogins: 0,
    activeSessions: 0,
    uniqueUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await APIClient.get('/api/security/login-logs');
      setEvents(APIClient.unwrapList<LoginEvent>(res));
      const s = res?.meta?.summary;
      if (s) {
        setSummary({
          totalLogins: s.totalLogins ?? 0,
          failedLogins: s.failedLogins ?? 0,
          activeSessions: s.activeSessions ?? 0,
          uniqueUsers: s.uniqueUsers ?? 0,
        });
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load login logs');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-500" />
            Login History
          </h1>
          <p className="text-slate-500 text-sm">
            Monitor user sessions, device types, and suspicious login attempts.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100 dark:border-emerald-800/30">
          <ShieldCheck className="w-4 h-4" /> {summary.activeSessions} Active Sessions
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
        {/* Summary */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{summary.totalLogins}</div>
              <div className="text-xs text-slate-500 font-bold uppercase">Successful Logins</div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center text-rose-600">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{summary.failedLogins}</div>
              <div className="text-xs text-slate-500 font-bold uppercase">Failed Attempts</div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{summary.activeSessions}</div>
              <div className="text-xs text-slate-500 font-bold uppercase">Active Sessions</div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{summary.uniqueUsers}</div>
              <div className="text-xs text-slate-500 font-bold uppercase">Unique Users</div>
            </div>
          </div>
        </div>

        {/* Event List */}
        <div className="lg:col-span-3 overflow-y-auto pb-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="py-3 pl-6">Time</th>
                  <th className="py-3">User</th>
                  <th className="py-3">IP Address</th>
                  <th className="py-3">Device</th>
                  <th className="py-3 text-right pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400 text-sm">
                      Loading login events...
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-rose-500 text-sm">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && events.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400 text-sm">
                      No login events recorded yet.
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  events.map((row) => {
                    const meta = actionLabel(row.action);
                    const isMobile = (row.userAgent || '').toLowerCase().includes('mobile');
                    return (
                      <tr
                        key={row.id}
                        className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="py-4 pl-6 text-slate-500 font-mono text-xs font-bold">
                          {formatWhen(row.timestamp)}
                        </td>
                        <td className="py-4 font-bold text-slate-700 dark:text-slate-300">
                          {row.userEmail || row.userId || 'Unknown'}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <MapPin className="w-3 h-3 text-slate-400" /> {row.ipAddress || '-'}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            {isMobile ? (
                              <Smartphone className="w-3 h-3 text-slate-400" />
                            ) : (
                              <Monitor className="w-3 h-3 text-slate-400" />
                            )}
                            {isMobile ? 'Mobile' : 'Desktop'}
                          </div>
                        </td>
                        <td className="py-4 text-right pr-6">
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded ${
                              meta.ok && row.success
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-rose-100 text-rose-600'
                            }`}
                          >
                            {meta.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
