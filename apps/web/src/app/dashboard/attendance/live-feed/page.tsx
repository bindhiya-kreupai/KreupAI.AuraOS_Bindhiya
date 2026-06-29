'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AttendanceCheckService } from '@/app/dashboard/attendance/services';
import type { AttendanceCheck } from '@/app/dashboard/attendance/types';
import {
  MapPin,
  Camera,
  History,
  LogIn,
  LogOut,
  Coffee,
  RefreshCw,
  Radio,
  Filter,
  Search,
  Clock,
  Users,
} from 'lucide-react';

type FeedEntry = {
  id: string;
  employeeName: string;
  action: string;
  actionType: 'check_in' | 'check_out' | 'break_start' | 'break_end';
  time: string;
  location: string;
  deviceType?: string;
};

type MethodCount = {
  label: string;
  count: number;
  icon: React.ElementType;
  color: string;
};

const ACTION_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  check_in: { label: 'Check In', icon: LogIn, color: 'text-emerald-500 bg-emerald-50' },
  check_out: { label: 'Check Out', icon: LogOut, color: 'text-rose-500 bg-rose-50' },
  break_start: { label: 'Break Start', icon: Coffee, color: 'text-amber-500 bg-amber-50' },
  break_end: { label: 'Break End', icon: Coffee, color: 'text-amber-500 bg-amber-50' },
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function DashboardLiveFeedPage() {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [methodCounts, setMethodCounts] = useState<MethodCount[]>([
    { label: 'Today', count: 0, icon: Clock, color: 'indigo' },
    { label: 'Active', count: 0, icon: Users, color: 'emerald' },
    { label: 'Manual', count: 0, icon: History, color: 'amber' },
  ]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFeed = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const checks = await AttendanceCheckService.getChecks({ date: today });

      const feedEntries: FeedEntry[] = checks.map((c: AttendanceCheck) => ({
        id: c.id,
        employeeName: c.employeeName || 'Unknown',
        action: c.checkType,
        actionType: c.checkType as FeedEntry['actionType'],
        time: c.checkTime,
        location: c.location || '—',
        deviceType: c.deviceType,
      }));

      const recent = feedEntries.slice(-50).reverse();
      setEntries(recent);

      const total = feedEntries.length;
      const active = feedEntries.filter((e) => e.actionType === 'check_in').length;
      const manual = feedEntries.filter((e) => e.actionType === 'check_in').length;

      setMethodCounts([
        { label: 'Today', count: total, icon: Clock, color: 'indigo' },
        { label: 'Check-ins', count: active, icon: Users, color: 'emerald' },
        {
          label: 'Devices',
          count: new Set(checks.map((c: AttendanceCheck) => c.deviceType)).size,
          icon: Camera,
          color: 'violet',
        },
      ]);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchFeed, 15_000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchFeed]);

  const filteredEntries = entries.filter((e) => {
    if (statusFilter !== 'all' && e.actionType !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!e.employeeName.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const latestEntry = entries[0];

  return (
    <div className="pb-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Radio className="w-6 h-6 text-indigo-500" />
            Live Feed
          </h1>
          <p className="text-sm text-silver-mist mt-0.5">
            Real-time attendance check-ins across the organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border bg-white dark:bg-stellar-blue border-cloud dark:border-nebula-purple/50 shadow-sm hover:border-indigo-300"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${autoRefresh ? 'text-indigo-500' : 'text-silver-mist'}`}
            />
            <span className={autoRefresh ? 'text-indigo-600' : 'text-silver-mist'}>
              {autoRefresh ? 'Auto' : 'Paused'}
            </span>
          </button>
          <button
            onClick={fetchFeed}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-600 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {methodCounts.map((m, i) => (
          <div
            key={i}
            className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-silver-mist uppercase font-bold">{m.label}</p>
              <m.icon className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-ink-black dark:text-pearl">{m.count}</h3>
          </div>
        ))}
      </div>

      {/* ── Live Status Bar ──────────────────────────────────────── */}
      {latestEntry && (
        <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Live</span>
          <span className="text-xs text-silver-mist">
            {entries.length} entries today &middot; Latest: {formatTime(latestEntry.time)}
          </span>
        </div>
      )}

      {/* ── Search & Filter ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-xl text-xs font-medium text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-silver-mist" />
          {['all', 'check_in', 'check_out', 'break_start', 'break_end'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                statusFilter === s
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-white dark:bg-stellar-blue text-silver-mist border border-cloud dark:border-nebula-purple/50 hover:border-indigo-300'
              }`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Feed ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
        <div className="p-4 border-b border-cloud dark:border-nebula-purple/50 flex items-center justify-between">
          <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-500" /> Recent Activity
          </h3>
          <span className="text-xs text-silver-mist bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {filteredEntries.length}
          </span>
        </div>

        <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/20"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-2 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <Radio className="w-10 h-10 text-silver-mist/40 mx-auto mb-3" />
              <p className="text-sm font-bold text-silver-mist">No Activity Yet</p>
              <p className="text-xs text-silver-mist/60 mt-1">
                Today's check-ins will appear here in real time.
              </p>
            </div>
          ) : (
            filteredEntries.map((entry, i) => {
              const meta = ACTION_META[entry.actionType] || ACTION_META.check_in;
              return (
                <div
                  key={`${entry.id}-${i}`}
                  className="flex items-start gap-3 relative pb-2 pl-4 border-l-2 border-slate-100 dark:border-slate-800 last:border-0 last:pb-0 ml-2"
                >
                  <div
                    className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${meta.color} flex items-center justify-center`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-sm text-ink-black dark:text-pearl truncate">
                        {entry.employeeName}
                      </span>
                      <span className="text-xs font-mono text-silver-mist shrink-0">
                        {formatTime(entry.time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {meta.label}
                      </span>
                      {entry.location && entry.location !== '—' && (
                        <span className="text-xs text-silver-mist flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" /> {entry.location}
                        </span>
                      )}
                      {entry.deviceType && (
                        <span className="text-[9px] text-silver-mist uppercase tracking-wider shrink-0">
                          {entry.deviceType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
