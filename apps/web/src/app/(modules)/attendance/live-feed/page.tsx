'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Fingerprint,
  Camera,
  Wifi,
  RefreshCw,
  Radio,
  Filter,
  Download,
  Search,
  Zap,
} from 'lucide-react';
import { cn } from '@aura/ui/utils';
import { timeCapture } from '@/lib/services/attendance-client';
import { SOCKET_EVENTS } from '@/lib/websocket/socket-events';
import type { AttendancePayload } from '@/lib/websocket/socket-events';

type FeedEntry = {
  id: string;
  name: string;
  time: string;
  method: string;
  location: string;
  status: 'on-time' | 'late' | 'early';
  avatar: string;
  employeeId: string;
  rawTimestamp: string;
};

type MethodStat = {
  icon: React.ElementType;
  label: string;
  count: number;
  color: string;
  desc: string;
};

const FALLBACK_METHODS: MethodStat[] = [
  {
    icon: Fingerprint,
    label: 'Biometric',
    count: 0,
    color: 'indigo',
    desc: 'ZKTeco / Suprema SDK',
  },
  { icon: Camera, label: 'Facial AI', count: 0, color: 'violet', desc: 'Liveness + Anti-Spoof' },
  { icon: MapPin, label: 'GPS Mobile', count: 0, color: 'emerald', desc: 'Geofenced Check-in' },
  { icon: Wifi, label: 'Wi-Fi Proximity', count: 0, color: 'cyan', desc: 'Office SSID Auto-Mark' },
];

function inferMethod(c: any): string {
  const type = (c.type || '').toUpperCase();
  if (type.includes('CHECK_IN')) return 'Manual';
  if (type.includes('CHECK_OUT')) return 'Manual';
  if (type.includes('BREAK')) return 'Manual';
  const dev = (c.deviceInfo?.deviceType || c.deviceType || '').toLowerCase();
  if (dev.includes('zkteco') || dev.includes('biometric') || dev.includes('finger'))
    return 'Biometric';
  if (dev.includes('facial') || dev.includes('face') || dev.includes('camera')) return 'Facial';
  if (dev.includes('gps') || dev.includes('mobile')) return 'GPS Mobile';
  if (dev.includes('wifi')) return 'Wi-Fi Proximity';
  return c.captureMethod || c.method || 'Manual';
}

function mapCaptureToEntry(c: any): FeedEntry {
  const t = new Date(c.timestamp || c.captureTime || c.createdAt);
  const name = c.employeeName || c.employee?.name || 'Unknown';
  return {
    id: c.id || c._id || Math.random().toString(36).slice(2),
    name,
    time: t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    rawTimestamp: t.toISOString(),
    method: inferMethod(c),
    location:
      typeof c.location === 'object' && c.location
        ? c.location.address || `${c.location.latitude},${c.location.longitude}` || '—'
        : c.locationName || '—',
    status: c.status === 'LATE' ? 'late' : c.status === 'EARLY' ? 'early' : 'on-time',
    avatar: name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    employeeId: c.employeeId || c.employee?.id || '',
  };
}

function methodColorClasses(color: string) {
  const map: Record<string, string> = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600',
  };
  return map[color] || map.indigo;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'late':
      return { bg: 'bg-amber-100 text-amber-700', pulse: true };
    case 'early':
      return { bg: 'bg-emerald-100 text-emerald-700', pulse: false };
    default:
      return { bg: 'bg-slate-100 text-slate-600', pulse: false };
  }
}

function getMethodBadge(method: string) {
  const m = method.toLowerCase();
  if (m.includes('facial') || m.includes('face')) return 'bg-violet-50 text-violet-600';
  if (m.includes('bio') || m.includes('finger')) return 'bg-indigo-50 text-indigo-600';
  if (m.includes('gps') || m.includes('mobile')) return 'bg-emerald-50 text-emerald-600';
  if (m.includes('wifi') || m.includes('wi-fi')) return 'bg-cyan-50 text-cyan-600';
  return 'bg-slate-50 text-slate-600';
}

export default function LiveFeedPage() {
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [methods, setMethods] = useState<MethodStat[]>(FALLBACK_METHODS);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLiveFeed = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await timeCapture.getCaptures({ date: today });
      const raw =
        result?.data?.captures ||
        result?.items ||
        result?.data ||
        (Array.isArray(result) ? result : []);
      const captures = Array.isArray(raw) ? raw : [];
      if (captures.length > 0) {
        const entries = captures.slice(0, 50).map(mapCaptureToEntry);
        setFeed(entries);

        const bio = captures.filter((c: any) => inferMethod(c) === 'Biometric').length;
        const facial = captures.filter((c: any) => inferMethod(c) === 'Facial').length;
        const gps = captures.filter((c: any) => inferMethod(c) === 'GPS Mobile').length;
        const wifi = captures.filter((c: any) => inferMethod(c) === 'Wi-Fi Proximity').length;

        setMethods([
          {
            icon: Fingerprint,
            label: 'Biometric',
            count: bio,
            color: 'indigo',
            desc: 'ZKTeco / Suprema SDK',
          },
          {
            icon: Camera,
            label: 'Facial AI',
            count: facial,
            color: 'violet',
            desc: 'Liveness + Anti-Spoof',
          },
          {
            icon: MapPin,
            label: 'GPS Mobile',
            count: gps,
            color: 'emerald',
            desc: 'Geofenced Check-in',
          },
          {
            icon: Wifi,
            label: 'Wi-Fi Proximity',
            count: wifi,
            color: 'cyan',
            desc: 'Office SSID Auto-Mark',
          },
        ]);
      }
    } catch (e: any) {
      console.error('Live feed fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveFeed();
  }, [fetchLiveFeed]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLiveFeed, 15_000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLiveFeed]);

  const handleSocketEvent = useCallback((payload: unknown) => {
    const p = payload as AttendancePayload;
    if (!p?.employeeId) return;
    const newEntry: FeedEntry = {
      id: `socket-${Date.now()}-${p.employeeId}`,
      name: p.employeeName || 'Employee',
      time: new Date(p.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      rawTimestamp: p.timestamp,
      method: p.action === 'clock_in' ? 'GPS Mobile' : 'Manual',
      location: p.location || '—',
      status: 'on-time',
      avatar: (p.employeeName || 'Em')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      employeeId: p.employeeId,
    };
    setFeed((prev) => [newEntry, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    let socketModule: any;
    let unsubClockIn: (() => void) | undefined;
    let unsubClockOut: (() => void) | undefined;

    (async () => {
      try {
        socketModule = await import('@/lib/websocket/socket-client');
        const { SocketClient } = socketModule;
        const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
        const client = new SocketClient({ url });
        client.connect();

        unsubClockIn = client.on(SOCKET_EVENTS.ATTENDANCE_CLOCK_IN, (payload: unknown) => {
          handleSocketEvent(payload);
        });
        unsubClockOut = client.on(SOCKET_EVENTS.ATTENDANCE_CLOCK_OUT, (payload: unknown) => {
          handleSocketEvent(payload);
        });

        return () => {
          unsubClockIn?.();
          unsubClockOut?.();
          client.disconnect();
        };
      } catch {
        // Socket unavailable, poll-only mode
      }
    })();

    return () => {
      unsubClockIn?.();
      unsubClockOut?.();
    };
  }, [handleSocketEvent]);

  const filteredFeed = feed.filter((entry) => {
    if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!entry.name.toLowerCase().includes(q) && !entry.location.toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  const latestEntry = feed[0];
  const feedAge = latestEntry
    ? Math.round((Date.now() - new Date(latestEntry.rawTimestamp).getTime()) / 1000)
    : null;

  return (
    <div className="min-h-screen bg-ghost-white dark:bg-deep-space p-4 md:p-8 font-sans">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/20">
            <Radio className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-ink-black dark:text-pearl tracking-tight uppercase italic">
              Live Feed
            </h1>
            <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">
              Real-time Attendance Check-ins
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border',
              autoRefresh
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20'
                : 'bg-white dark:bg-stellar-blue text-silver-mist border-cloud dark:border-nebula-purple/30'
            )}
          >
            <RefreshCw className={cn('w-3.5 h-3.5', autoRefresh && 'animate-spin')} />
            {autoRefresh ? 'Auto' : 'Paused'}
          </button>
          <button
            onClick={fetchLiveFeed}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs font-bold text-ink-black dark:text-pearl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* ── Live Status Bar ─────────────────────────────────────── */}
      {feedAge !== null && (
        <div className="mb-6 flex items-center gap-3 px-5 py-3 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl shadow-sm">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-ink-black dark:text-pearl">Live</span>
          <span className="text-[10px] font-bold text-silver-mist">
            {feed.length} check-ins today &middot; Latest{' '}
            {feedAge < 60 ? `${feedAge}s ago` : `${Math.floor(feedAge / 60)}m ago`}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-[10px] font-bold text-silver-mist uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      )}

      {/* ── Capture Methods Stats ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {methods.map((method, i) => (
          <div
            key={i}
            className="bg-white dark:bg-stellar-blue rounded-2xl p-5 border border-cloud dark:border-nebula-purple/30 hover:shadow-lg transition-all group cursor-pointer"
          >
            <div
              className={cn('inline-flex p-2.5 rounded-xl mb-3', methodColorClasses(method.color))}
            >
              <method.icon className="w-5 h-5" />
            </div>
            <h3 className="font-black text-xs text-ink-black dark:text-pearl uppercase tracking-tight mb-0.5 group-hover:text-emerald-600 transition-colors">
              {method.label}
            </h3>
            <p className="text-[9px] text-silver-mist font-bold uppercase tracking-widest mb-2">
              {method.desc}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-ink-black dark:text-pearl">
                {method.count}
              </span>
              <span className="text-[9px] font-bold text-silver-mist uppercase">today</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search & Filter Bar ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs font-medium text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-silver-mist" />
          {['all', 'on-time', 'late', 'early'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all',
                statusFilter === s
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-stellar-blue text-silver-mist border border-cloud dark:border-nebula-purple/30 hover:border-emerald-300'
              )}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl text-[10px] font-bold text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-all">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* ── Feed List ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2rem] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-black text-ink-black dark:text-pearl uppercase tracking-tight">
              Live Attendance Feed
            </h2>
            <span className="text-[10px] font-bold text-silver-mist bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {filteredFeed.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-2">
                    <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-2 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredFeed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Radio className="w-12 h-12 text-silver-mist/40 mb-4" />
            <h3 className="text-sm font-black text-silver-mist uppercase tracking-tight mb-1">
              No Check-ins Yet
            </h3>
            <p className="text-[10px] font-bold text-silver-mist uppercase tracking-widest max-w-xs">
              Today's attendance feed will appear here as employees check in.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFeed.map((entry, i) => {
              const statusBadge = getStatusBadge(entry.status);
              return (
                <div
                  key={entry.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-xl transition-all hover:shadow-md group',
                    entry.status === 'late'
                      ? 'bg-amber-50/50 dark:bg-amber-900/5 border border-amber-200/50 dark:border-amber-800/20'
                      : entry.status === 'early'
                        ? 'bg-emerald-50/30 dark:bg-emerald-900/5 border border-emerald-200/50 dark:border-emerald-800/20'
                        : 'bg-slate-50/50 dark:bg-slate-900/20 border border-transparent'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-black text-emerald-600 shrink-0">
                      {entry.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-ink-black dark:text-pearl truncate group-hover:text-emerald-600 transition-colors">
                        {entry.name}
                      </p>
                      <p className="text-[10px] text-silver-mist font-bold uppercase tracking-widest truncate">
                        {entry.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span
                      className={cn(
                        'text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest',
                        getMethodBadge(entry.method)
                      )}
                    >
                      {entry.method}
                    </span>
                    <span className="text-sm font-black text-ink-black dark:text-pearl tabular-nums">
                      {entry.time}
                    </span>
                    <span
                      className={cn(
                        'text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1',
                        statusBadge.bg
                      )}
                    >
                      {statusBadge.pulse && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      )}
                      {entry.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
