'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  LogIn,
  LogOut,
  Coffee,
  RefreshCw,
  MapPin,
  Clock,
  Smartphone,
  Radio,
  Activity,
} from 'lucide-react';
import {
  LiveTrackingService,
  type LiveCapture,
  type LiveTrackingSummary,
  type EmployeeStatus,
} from './live-tracking.service';

type SortField = 'name' | 'status' | 'time';
type SortDir = 'asc' | 'desc';

export default function LiveTrackingPage() {
  const [captures, setCaptures] = useState<LiveCapture[]>([]);
  const [summary, setSummary] = useState<LiveTrackingSummary>({
    total: 0,
    checkIns: 0,
    checkOuts: 0,
    breaks: 0,
    lastCheckIn: null,
    lastCheckOut: null,
    currentStatus: 'CHECKED_OUT',
  });
  const [employeeStatuses, setEmployeeStatuses] = useState<EmployeeStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('status');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const fetchData = useCallback(async () => {
    try {
      const data = await LiveTrackingService.getLiveTrackingData();
      setCaptures(data.captures);
      setSummary(data.summary);
      setEmployeeStatuses(LiveTrackingService.computeEmployeeStatuses(data.captures));
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to fetch live tracking data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'status' ? 'asc' : 'desc');
    }
  };

  const filteredStatuses = employeeStatuses
    .filter((e) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return e.employeeName.toLowerCase().includes(q) || e.employeeId.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'name') return a.employeeName.localeCompare(b.employeeName) * dir;
      if (sortField === 'time') {
        const aTime = a.lastCapture?.timestamp || '';
        const bTime = b.lastCapture?.timestamp || '';
        return aTime.localeCompare(bTime) * dir;
      }
      const order = { CHECKED_IN: 0, ON_BREAK: 1, CHECKED_OUT: 2, NO_DATA: 3 };
      return (order[a.status] - order[b.status]) * dir;
    });

  const formatTime = (iso: string | null) => {
    if (!iso) return '--';
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '--';
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const recentFeed = [...captures]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  const statusBadge = (status: EmployeeStatus['status']) => {
    const styles = {
      CHECKED_IN:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      CHECKED_OUT:
        'bg-slate-100 text-slate-600 dark:bg-slate-700/30 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      ON_BREAK:
        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      NO_DATA:
        'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-800',
    };
    const icons = {
      CHECKED_IN: LogIn,
      CHECKED_OUT: LogOut,
      ON_BREAK: Coffee,
      NO_DATA: Clock,
    };
    const Icon = icons[status];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${styles[status]}`}
      >
        <Icon className="w-3 h-3" />
        {status === 'CHECKED_IN'
          ? 'In'
          : status === 'CHECKED_OUT'
            ? 'Out'
            : status === 'ON_BREAK'
              ? 'Break'
              : 'No Data'}
      </span>
    );
  };

  const captureIcon = (type: string) => {
    switch (type) {
      case 'CHECK_IN':
        return <LogIn className="w-4 h-4 text-emerald-500" />;
      case 'CHECK_OUT':
        return <LogOut className="w-4 h-4 text-slate-500" />;
      case 'BREAK_START':
        return <Coffee className="w-4 h-4 text-amber-500" />;
      case 'BREAK_END':
        return <Coffee className="w-4 h-4 text-emerald-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const captureLabel = (type: string) => {
    switch (type) {
      case 'CHECK_IN':
        return 'Check In';
      case 'CHECK_OUT':
        return 'Check Out';
      case 'BREAK_START':
        return 'Break Start';
      case 'BREAK_END':
        return 'Break End';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Radio className="w-6 h-6 text-rose-500" />
            Live Tracking
          </h1>
          <p className="text-silver-mist text-sm">
            Real-time attendance status and employee activity feed.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-[11px] text-silver-mist flex items-center gap-1.5"
            suppressHydrationWarning
          >
            <Clock className="w-3 h-3" />
            {formatTime(lastRefreshed.toISOString())}
          </span>
          <button
            onClick={() => {
              setLoading(true);
              fetchData();
            }}
            className="flex items-center gap-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm hover:border-indigo-300"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <label className="flex items-center gap-2 text-sm text-silver-mist cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded border-cloud text-indigo-500 focus:ring-indigo-500"
            />
            Auto (30s)
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-y-auto lg:overflow-visible">
        {/* Left: Summary + Employee Grid */}
        <div className="lg:col-span-2 space-y-3 flex flex-col h-full">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <SummaryCard
              icon={Users}
              label="Total Captures"
              value={summary.total}
              color="text-indigo-500"
              bgColor="bg-indigo-50 dark:bg-indigo-900/20"
            />
            <SummaryCard
              icon={LogIn}
              label="Checked In"
              value={summary.checkIns}
              color="text-emerald-500"
              bgColor="bg-emerald-50 dark:bg-emerald-900/20"
              sub={summary.lastCheckIn ? formatTime(summary.lastCheckIn) : undefined}
            />
            <SummaryCard
              icon={Coffee}
              label="On Break"
              value={summary.breaks}
              color="text-amber-500"
              bgColor="bg-amber-50 dark:bg-amber-900/20"
            />
            <SummaryCard
              icon={LogOut}
              label="Checked Out"
              value={summary.checkOuts}
              color="text-slate-500"
              bgColor="bg-slate-50 dark:bg-slate-800/50"
              sub={summary.lastCheckOut ? formatTime(summary.lastCheckOut) : undefined}
            />
          </div>

          {/* Employee Status Grid */}
          <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-3 p-4 shrink-0 border-b border-cloud dark:border-nebula-purple/30">
              <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-indigo-500" />
                Employee Status ({filteredStatuses.length})
              </h3>
              <div className="relative max-w-xs">
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg outline-none focus:border-indigo-500 transition-colors text-sm"
                />
                <Users className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[11px] font-bold text-silver-mist uppercase tracking-wider border-b border-cloud dark:border-nebula-purple/20 shrink-0">
              <button
                onClick={() => toggleSort('name')}
                className="col-span-4 flex items-center gap-1 text-left hover:text-indigo-500 transition-colors"
              >
                Employee {sortField === 'name' && <SortArrow dir={sortDir} />}
              </button>
              <button
                onClick={() => toggleSort('status')}
                className="col-span-2 flex items-center gap-1 hover:text-indigo-500 transition-colors"
              >
                Status {sortField === 'status' && <SortArrow dir={sortDir} />}
              </button>
              <span className="col-span-3">Location / Device</span>
              <button
                onClick={() => toggleSort('time')}
                className="col-span-3 flex items-center gap-1 hover:text-indigo-500 transition-colors"
              >
                Last Activity {sortField === 'time' && <SortArrow dir={sortDir} />}
              </button>
            </div>

            {/* Rows */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-6 h-6 border-3 border-indigo-500 border-t-transparent rounded-full" />
                </div>
              ) : filteredStatuses.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-silver-mist text-sm">
                  {employeeStatuses.length === 0
                    ? 'No attendance data for today'
                    : 'No matching employees'}
                </div>
              ) : (
                filteredStatuses.map((emp) => (
                  <div
                    key={emp.employeeId}
                    className="grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-cloud dark:border-nebula-purple/10 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-sm"
                  >
                    <div className="col-span-4 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-rose-400 flex items-center justify-center text-white font-bold text-xs">
                        {emp.employeeName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-ink-black dark:text-pearl truncate">
                          {emp.employeeName}
                        </div>
                        <div className="text-[10px] text-silver-mist truncate">
                          {emp.employeeId}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">{statusBadge(emp.status)}</div>
                    <div className="col-span-3 text-xs text-silver-mist min-w-0">
                      {emp.latestLocation ? (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{emp.latestLocation}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">--</span>
                      )}
                      {emp.deviceType && (
                        <span className="flex items-center gap-1 mt-0.5">
                          <Smartphone className="w-3 h-3 shrink-0" />
                          <span className="truncate">{emp.deviceType}</span>
                        </span>
                      )}
                    </div>
                    <div className="col-span-3 text-xs text-silver-mist">
                      {emp.lastCapture ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          {formatDate(emp.lastCapture.timestamp)}
                        </span>
                      ) : (
                        '--'
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Feed */}
        <div className="lg:col-span-1 space-y-3 flex flex-col h-full">
          {/* Live Feed */}
          <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-cloud dark:border-nebula-purple/30">
              <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-rose-500" />
                Live Feed
              </h3>
              <span className="relative flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 p-3">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-6 h-6 border-3 border-indigo-500 border-t-transparent rounded-full" />
                </div>
              ) : recentFeed.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-silver-mist text-sm">
                  No activity yet today
                </div>
              ) : (
                recentFeed.map((cap, i) => (
                  <div
                    key={cap.id}
                    className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-rose-400 flex items-center justify-center text-white font-bold text-[10px]">
                        {cap.employeeName?.charAt(0) || '?'}
                      </div>
                      {i < recentFeed.length - 1 && (
                        <div className="w-px flex-1 bg-cloud dark:bg-slate-700 min-h-[8px]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-ink-black dark:text-pearl truncate">
                          {cap.employeeName}
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          {captureIcon(cap.type)}
                          <span className="text-[10px] font-bold text-silver-mist">
                            {captureLabel(cap.type)}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-silver-mist">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(cap.timestamp)}</span>
                      </div>
                      {cap.location?.address && (
                        <div className="flex items-center gap-1 mt-0.5 text-[11px] text-silver-mist">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{cap.location.address}</span>
                        </div>
                      )}
                      {cap.deviceInfo?.deviceType && (
                        <div className="flex items-center gap-1 mt-0.5 text-[11px] text-silver-mist">
                          <Smartphone className="w-3 h-3 shrink-0" />
                          <span>{cap.deviceInfo.deviceType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Status Legend */}
          <div className="bg-white dark:bg-stellar-blue p-4 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm shrink-0">
            <h4 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-2">
              Legend
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Checked In
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Checked Out
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> On Break
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> No Data
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  sub?: string;
}) {
  return (
    <div className="bg-white dark:bg-stellar-blue p-4 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-silver-mist uppercase tracking-wider">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-[10px] text-silver-mist mt-0.5">Latest: {sub}</div>}
    </div>
  );
}

function SortArrow({ dir }: { dir: SortDir }) {
  return <span className="text-indigo-500 text-[10px]">{dir === 'asc' ? '\u25B2' : '\u25BC'}</span>;
}
