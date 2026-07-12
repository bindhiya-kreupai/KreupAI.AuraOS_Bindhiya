'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Fingerprint,
  Camera,
  CheckCircle2,
  AlertCircle,
  Zap,
  Plus,
  RefreshCw,
  Bot,
  Sparkles,
  Moon,
  Timer,
  Calendar,
  Radio,
  Layers,
  Navigation,
  Wifi,
  Settings2,
  Settings2,
  Target,
  Download,
  Filter,
  Search,
  Edit2,
  Trash2,
} from 'lucide-react';
import { cn } from '@aura/ui/utils';
import Link from 'next/link';
import { timeCapture, shifts as shiftService, geoFencing } from '@/lib/services/attendance-client';

// ── Fallback Data ──────────────────────────────────────────────────────
const FALLBACK_ATTENDANCE_STATS = [
  { title: 'Present Today', value: '—', total: '', icon: CheckCircle2, color: 'emerald', pct: 0 },
  { title: 'Late Arrivals', value: '—', icon: AlertCircle, color: 'amber', alert: true },
  { title: 'On Leave', value: '—', icon: Calendar, color: 'blue' },
  { title: 'Remote / GPS', value: '—', icon: MapPin, color: 'indigo' },
  { title: 'Overtime Hours', value: '—', icon: Timer, color: 'violet' },
];
const FALLBACK_LIVE_FEED: any[] = [];
const FALLBACK_SHIFT_DATA: any[] = [];
const FALLBACK_GEOFENCE_ZONES: any[] = [];

const OVERTIME_RULES = [
  {
    country: 'UAE',
    flag: '🇦🇪',
    rate: '1.25x (normal) / 1.5x (10pm-4am)',
    maxWeekly: '2 hrs/day',
    holiday: '1.5x base',
    ramadan: 'Reduced 2hrs',
  },
  {
    country: 'KSA',
    flag: '🇸🇦',
    rate: '1.5x base + allowance',
    maxWeekly: 'As per contract',
    holiday: '1.5x base',
    ramadan: 'Reduced 2hrs',
  },
  {
    country: 'India',
    flag: '🇮🇳',
    rate: '2x ordinary rate',
    maxWeekly: '50 hrs/qtr',
    holiday: '2x or comp-off',
    ramadan: 'N/A',
  },
  {
    country: 'Bahrain',
    flag: '🇧🇭',
    rate: '1.25x + 25% allowance',
    maxWeekly: 'Per MoL rules',
    holiday: '1.5x or day off',
    ramadan: 'Reduced 2hrs',
  },
];

export default function AttendanceCommandCenter() {
  const [activeTab, setActiveTab] = useState<'live' | 'shifts' | 'geofence' | 'overtime'>('live');
  const [aiInsight, setAiInsight] = useState('');
  const [attendanceStats, setAttendanceStats] = useState(FALLBACK_ATTENDANCE_STATS);

  useEffect(() => {
    (async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const result = await timeCapture.getCaptures({ date: today });
        const captures = result?.items || result?.data || (Array.isArray(result) ? result : []);
        if (captures.length > 0) {
          const onTime = captures.filter(
            (c: any) => c.status === 'ON_TIME' || c.type === 'CHECK_IN'
          ).length;
          const late = captures.filter((c: any) => c.status === 'LATE').length;
          setAttendanceStats([
            {
              title: 'Present Today',
              value: String(onTime),
              total: '',
              icon: CheckCircle2,
              color: 'emerald',
              pct: 0,
            },
            {
              title: 'Late Arrivals',
              value: String(late),
              icon: AlertCircle,
              color: 'amber',
              alert: late > 0,
            },
            { title: 'On Leave', value: '—', icon: Calendar, color: 'blue' },
            {
              title: 'Remote / GPS',
              value: String(
                captures.filter(
                  (c: any) => c.captureMethod === 'GPS' || c.captureMethod === 'MOBILE_GPS'
                ).length
              ),
              icon: MapPin,
              color: 'indigo',
            },
            { title: 'Check-ins', value: String(captures.length), icon: Timer, color: 'violet' },
          ]);
        }
      } catch (e: any) {
        console.error('Attendance stats fetch error:', e);
      }
    })();
  }, []);

  useEffect(() => {
    const insights = [
      'AI detects recurring late pattern for 6 employees on Sunday mornings. Suggest flexible 09:30 start option.',
      'Geofence breach rate down 73% since facial recognition rollout. 2 anomalies detected today.',
      'Ramadan shift template ready. Auto-activates on 1 Ramadan 1447 — 345 employees affected.',
      'Overtime liability for Engineering dept is 40% above budget. Recommend headcount rebalancing.',
    ];
    setAiInsight(insights[Math.floor(Math.random() * insights.length)]);
  }, [activeTab]);

  const tabs = [
    { id: 'live', label: 'Live Tracking', icon: Radio },
    { id: 'shifts', label: 'Shift Orchestrator', icon: Layers },
    { id: 'geofence', label: 'Geofence & GPS', icon: Navigation },
    { id: 'overtime', label: 'Overtime & Ramadan', icon: Timer },
  ];

  return (
    <div className="min-h-screen bg-ghost-white dark:bg-deep-space p-8 font-sans">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/20">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-ink-black dark:text-pearl tracking-tight uppercase italic">
                Attendance & Time Center
              </h1>
              <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">
                Multi-Modal Capture • Geofenced • Facial Recognition • Ramadan-Ready
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/attendance/shift-management"
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs font-bold text-ink-black dark:text-pearl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Settings2 className="w-4 h-4" /> Shifts
          </Link>
          <Link
            href="/attendance/overtime-management"
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs font-bold text-ink-black dark:text-pearl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Timer className="w-4 h-4" /> Overtime
          </Link>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all">
            <Plus className="w-4 h-4" /> Manual Entry
          </button>
        </div>
      </div>

      {/* ── AI Sentinel ──────────────────────────────────────────── */}
      <div className="mb-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-[2rem] p-6 shadow-xl shadow-emerald-600/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Bot className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-1">
              Aura Attendance Intelligence
            </h3>
            <p className="text-sm text-white font-medium leading-relaxed">{aiInsight}</p>
          </div>
          <button className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/20 transition-all backdrop-blur-sm">
            Act Now
          </button>
        </div>
      </div>

      {/* ── Stats Bar ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {attendanceStats.map((stat, i) => (
          <div
            key={i}
            className={cn(
              'bg-white dark:bg-stellar-blue rounded-3xl p-5 border transition-all hover:shadow-xl group',
              stat.alert
                ? 'border-amber-100 dark:border-amber-900/20'
                : 'border-cloud dark:border-nebula-purple/30'
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={cn(
                  'p-2.5 rounded-2xl',
                  stat.color === 'emerald'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                    : stat.color === 'amber'
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                      : stat.color === 'blue'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                        : stat.color === 'indigo'
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                          : 'bg-violet-50 dark:bg-violet-900/20 text-violet-600'
                )}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              {stat.alert && <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />}
            </div>
            <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest leading-none mb-1">
              {stat.title}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-ink-black dark:text-pearl group-hover:text-emerald-600 transition-colors">
                {stat.value}
              </span>
              {stat.total && (
                <span className="text-xs text-silver-mist font-bold">/ {stat.total}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab Navigation ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-8 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl p-1.5 shadow-sm w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all',
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-slate-50 dark:hover:bg-slate-800'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ──────────────────────────────────────────── */}
      {activeTab === 'live' && <LiveTrackingTab />}
      {activeTab === 'shifts' && <ShiftOrchestratorTab />}
      {activeTab === 'geofence' && <GeofenceGPSTab />}
      {activeTab === 'overtime' && <OvertimeRamadanTab />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Live Tracking
// ═══════════════════════════════════════════════════════════════
function LiveTrackingTab() {
  const [liveFeed, setLiveFeed] = useState(FALLBACK_LIVE_FEED);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Name,Time,Method,Location,Status\n' +
      liveFeed.map((e) => `${e.name},${e.time},${e.method},${e.location},${e.status}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'live_attendance.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredFeed = liveFeed.filter((entry) => {
    const matchesSearch =
      entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    (async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const result = await timeCapture.getCaptures({ date: today });
        const captures = result?.items || result?.data || (Array.isArray(result) ? result : []);
        if (captures.length > 0) {
          setLiveFeed(
            captures.slice(0, 10).map((c: any) => {
              const t = new Date(c.timestamp || c.captureTime || c.createdAt);
              const name = c.employeeName || c.employee?.name || 'Employee';
              return {
                name,
                time: t.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                }),
                method: c.captureMethod || c.method || 'Manual',
                location: c.location?.address || c.locationName || '—',
                status: c.status === 'LATE' ? 'late' : c.status === 'EARLY' ? 'early' : 'on-time',
                avatar: name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .slice(0, 2),
              };
            })
          );
        }
      } catch (e: any) {
        console.error('Live feed fetch error:', e);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      {/* Capture Methods */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            icon: Fingerprint,
            label: 'Biometric',
            count: 156,
            color: 'indigo',
            desc: 'ZKTeco / Suprema SDK',
          },
          {
            icon: Camera,
            label: 'Facial AI',
            count: 89,
            color: 'violet',
            desc: 'Liveness + Anti-Spoof',
          },
          {
            icon: MapPin,
            label: 'GPS Mobile',
            count: 34,
            color: 'emerald',
            desc: 'Geofenced Check-in',
          },
          {
            icon: Wifi,
            label: 'Wi-Fi Proximity',
            count: 133,
            color: 'cyan',
            desc: 'Office SSID Auto-Mark',
          },
        ].map((method, i) => (
          <div
            key={i}
            className="bg-white dark:bg-stellar-blue rounded-3xl p-6 border border-cloud dark:border-nebula-purple/30 hover:shadow-xl transition-all group cursor-pointer"
          >
            <div
              className={cn(
                'inline-flex p-3 rounded-2xl mb-4',
                method.color === 'indigo'
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                  : method.color === 'violet'
                    ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600'
                    : method.color === 'emerald'
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                      : 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600'
              )}
            >
              <method.icon className="w-6 h-6" />
            </div>
            <h3 className="font-black text-sm text-ink-black dark:text-pearl uppercase tracking-tight mb-1 group-hover:text-emerald-600 transition-colors">
              {method.label}
            </h3>
            <p className="text-[10px] text-silver-mist font-bold uppercase tracking-widest mb-3">
              {method.desc}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-ink-black dark:text-pearl">
                {method.count}
              </span>
              <span className="text-[10px] font-bold text-silver-mist uppercase">
                check-ins today
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Live Feed */}
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg font-black text-ink-black dark:text-pearl uppercase tracking-tight">
              Live Attendance Feed
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-silver-mist" />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="on-time">On Time</option>
              <option value="late">Late</option>
              <option value="early">Early</option>
            </select>
            <button
              onClick={handleExport}
              className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl text-silver-mist hover:text-emerald-600 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Auto-Refresh
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredFeed.map((entry, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center justify-between p-5 rounded-2xl transition-all hover:shadow-md group cursor-pointer',
                entry.status === 'late'
                  ? 'bg-amber-50/50 dark:bg-amber-900/5 border border-amber-200/50 dark:border-amber-800/20'
                  : entry.status === 'early'
                    ? 'bg-emerald-50/30 dark:bg-emerald-900/5 border border-emerald-200/50 dark:border-emerald-800/20'
                    : 'bg-slate-50/50 dark:bg-slate-900/20 border border-transparent'
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-sm font-black text-emerald-600">
                  {entry.avatar}
                </div>
                <div>
                  <p className="font-bold text-sm text-ink-black dark:text-pearl group-hover:text-emerald-600 transition-colors">
                    {entry.name}
                  </p>
                  <p className="text-[10px] text-silver-mist font-bold uppercase tracking-widest">
                    {entry.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span
                  className={cn(
                    'text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest',
                    entry.method === 'Facial'
                      ? 'bg-violet-50 text-violet-600'
                      : entry.method === 'Biometric'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'bg-emerald-50 text-emerald-600'
                  )}
                >
                  {entry.method === 'Facial' && <span className="inline-block mr-1">📸</span>}
                  {entry.method === 'Biometric' && <span className="inline-block mr-1">👆</span>}
                  {entry.method === 'GPS' && <span className="inline-block mr-1">📍</span>}
                  {entry.method === 'Mobile GPS' && <span className="inline-block mr-1">📱</span>}
                  {entry.method}
                </span>
                <span className="text-sm font-black text-ink-black dark:text-pearl tabular-nums">
                  {entry.time}
                </span>
                <span
                  className={cn(
                    'text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest',
                    entry.status === 'late'
                      ? 'bg-amber-100 text-amber-700'
                      : entry.status === 'early'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {entry.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Shift Orchestrator
// ═══════════════════════════════════════════════════════════════
function ShiftOrchestratorTab() {
  const [shiftData, setShiftData] = useState(FALLBACK_SHIFT_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    time: '',
    mode: 'Standard',
    employees: 0,
    coverage: 100,
  });

  const handleOpenModal = (index: number | null = null) => {
    if (index !== null) {
      setFormData(shiftData[index]);
      setEditingIndex(index);
    } else {
      setFormData({ name: '', time: '', mode: 'Standard', employees: 0, coverage: 100 });
      setEditingIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingIndex !== null) {
      const updated = [...shiftData];
      updated[editingIndex] = formData;
      setShiftData(updated);
    } else {
      setShiftData([...shiftData, formData]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this shift?')) {
      const updated = shiftData.filter((_, i) => i !== index);
      setShiftData(updated);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const result = await shiftService.getShifts();
        const shifts = result?.items || result?.data || (Array.isArray(result) ? result : []);
        if (shifts.length > 0) {
          setShiftData(
            shifts.map((s: any) => ({
              name: s.name || s.code || 'Shift',
              time: `${s.startTime || '—'} - ${s.endTime || '—'}`,
              employees: s.employeeCount || 0,
              coverage: s.coveragePercent || 0,
              mode: s.isFlexible ? 'Flex' : 'Standard',
            }))
          );
        }
      } catch (e: any) {
        console.error('Shift fetch error:', e);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <Layers className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">
                Shift Orchestrator
              </h2>
              <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">
                Multi-Shift Roster • Ramadan Auto-Switch • Flex Hours
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Moon className="w-3.5 h-3.5" /> Ramadan Mode Ready
              </button>
              <button
                onClick={() => handleOpenModal(null)}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" /> New Shift
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-cloud dark:border-nebula-purple/20">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Shift
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Timing
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Employees
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Coverage
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Mode
                  </th>
                  <th className="text-right px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud dark:divide-nebula-purple/10">
                {shiftData.map((shift, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group/row cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <span className="font-bold text-sm text-ink-black dark:text-pearl group-hover/row:text-emerald-600 transition-colors">
                        {shift.name}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-ink-black dark:text-pearl tabular-nums">
                      {shift.time}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-ink-black dark:text-pearl">
                        {shift.employees}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-20 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              shift.coverage >= 95
                                ? 'bg-emerald-500'
                                : shift.coverage >= 85
                                  ? 'bg-amber-500'
                                  : 'bg-slate-300'
                            )}
                            style={{ width: `${shift.coverage}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-silver-mist">
                          {shift.coverage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={cn(
                          'text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest',
                          shift.mode === 'Standard'
                            ? 'bg-emerald-50 text-emerald-600'
                            : shift.mode === 'Seasonal'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-indigo-50 text-indigo-600'
                        )}
                      >
                        {shift.mode}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(i);
                        }}
                        className="p-2 text-silver-mist hover:text-indigo-600 transition-colors inline-block mr-2"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(i);
                        }}
                        className="p-2 text-silver-mist hover:text-red-600 transition-colors inline-block"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-stellar-blue p-8 rounded-3xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-black text-ink-black dark:text-pearl uppercase tracking-tight mb-6">
              {editingIndex !== null ? 'Edit Shift' : 'New Shift'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Shift Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Timing
                </label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl focus:border-emerald-500 outline-none"
                  placeholder="e.g. 09:00 AM - 05:00 PM"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Mode
                </label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl focus:border-emerald-500 outline-none"
                >
                  <option value="Standard">Standard</option>
                  <option value="Flex">Flex</option>
                  <option value="Seasonal">Seasonal</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-ink-black dark:text-pearl rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Geofence & GPS
// ═══════════════════════════════════════════════════════════════
function GeofenceGPSTab() {
  const [geofenceZones, setGeofenceZones] = useState(FALLBACK_GEOFENCE_ZONES);

  useEffect(() => {
    (async () => {
      try {
        const result = await geoFencing.getGeoFences();
        const zones = result?.items || result?.data || (Array.isArray(result) ? result : []);
        if (zones.length > 0) {
          setGeofenceZones(
            zones.map((z: any) => ({
              name: z.name || 'Zone',
              radius: z.radiusMeters ? `${z.radiusMeters}m` : '—',
              devices: z.deviceCount || 0,
              breaches: z.breachCount || 0,
              lat: String(z.latitude || ''),
              lng: String(z.longitude || ''),
            }))
          );
        }
      } catch (e: any) {
        console.error('Geofence fetch error:', e);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      {/* Geofence Zones */}
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <Target className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">
                Geofence Control
              </h2>
              <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">
                GPS Validation • Zone Management • Breach Alerting
              </p>
            </div>
            <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" /> Add Zone
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {geofenceZones.map((zone, i) => (
              <div
                key={i}
                className="p-6 bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border border-cloud dark:border-nebula-purple/10 hover:shadow-lg transition-all group/zone cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-ink-black dark:text-pearl group-hover/zone:text-emerald-600 transition-colors">
                        {zone.name}
                      </h3>
                      <p className="text-[9px] text-silver-mist font-bold uppercase tracking-widest">
                        {zone.lat}, {zone.lng}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest',
                      zone.breaches === 0
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                    )}
                  >
                    {zone.breaches === 0 ? 'Secure' : `${zone.breaches} Breaches`}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-center">
                    <p className="text-lg font-black text-ink-black dark:text-pearl">
                      {zone.radius}
                    </p>
                    <p className="text-[8px] font-black text-silver-mist uppercase tracking-widest">
                      Radius
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-center">
                    <p className="text-lg font-black text-ink-black dark:text-pearl">
                      {zone.devices}
                    </p>
                    <p className="text-[8px] font-black text-silver-mist uppercase tracking-widest">
                      Devices
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-center">
                    <p className="text-lg font-black text-emerald-600">Active</p>
                    <p className="text-[8px] font-black text-silver-mist uppercase tracking-widest">
                      Status
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Facial Recognition Module */}
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/10 dark:to-indigo-900/10 rounded-3xl p-8 border border-violet-200/50 dark:border-violet-800/20">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-violet-100 dark:bg-violet-900/30 rounded-2xl">
                <Camera className="w-8 h-8 text-violet-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-ink-black dark:text-pearl uppercase tracking-tight mb-2">
                  AI Facial Recognition
                </h3>
                <p className="text-xs text-silver-mist leading-relaxed mb-4 max-w-xl">
                  Liveness detection with anti-spoofing (3D depth + blink detection). ISO 19795
                  compliant. Sub-second recognition with 99.7% accuracy. Fully GDPR and UAE PDPL
                  compliant with on-device processing option.
                </p>
                <div className="flex gap-4">
                  <div className="px-4 py-2 bg-white/80 dark:bg-slate-900/50 rounded-xl">
                    <p className="text-lg font-black text-ink-black dark:text-pearl">89</p>
                    <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">
                      Scans Today
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-white/80 dark:bg-slate-900/50 rounded-xl">
                    <p className="text-lg font-black text-violet-600">99.7%</p>
                    <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">
                      Accuracy
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-white/80 dark:bg-slate-900/50 rounded-xl">
                    <p className="text-lg font-black text-ink-black dark:text-pearl">0</p>
                    <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">
                      Spoof Attempts
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-white/80 dark:bg-slate-900/50 rounded-xl">
                    <p className="text-lg font-black text-emerald-600">0.3s</p>
                    <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">
                      Avg Latency
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Overtime & Ramadan
// ═══════════════════════════════════════════════════════════════
function OvertimeRamadanTab() {
  return (
    <div className="space-y-8">
      {/* Overtime Rules Engine */}
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <Timer className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">
                Overtime Rules Engine
              </h2>
              <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">
                Multi-Jurisdiction Auto-Calculation • Holiday Multipliers
              </p>
            </div>
            <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" /> Run Calculation
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-cloud dark:border-nebula-purple/20">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Country
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    OT Rate
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Max Weekly
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Holiday OT
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Ramadan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud dark:divide-nebula-purple/10">
                {OVERTIME_RULES.map((rule, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{rule.flag}</span>
                        <span className="font-extrabold text-ink-black dark:text-pearl">
                          {rule.country}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-ink-black dark:text-pearl">
                      {rule.rate}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-ink-black dark:text-pearl">
                      {rule.maxWeekly}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-ink-black dark:text-pearl">
                      {rule.holiday}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={cn(
                          'text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest',
                          rule.ramadan !== 'N/A'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-slate-100 text-slate-400'
                        )}
                      >
                        {rule.ramadan}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ramadan Hours Module */}
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/10 dark:via-orange-900/10 dark:to-yellow-900/10 rounded-[2.5rem] p-10 border border-amber-200/50 dark:border-amber-800/20">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
            <Moon className="w-8 h-8 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-ink-black dark:text-pearl uppercase tracking-tight mb-2">
              Ramadan Working Hours Automation
            </h3>
            <p className="text-xs text-silver-mist leading-relaxed mb-6 max-w-xl">
              UAE Federal Decree-Law No. 33: Working hours reduced by 2 hours/day during Ramadan for
              all private sector employees. AuraOS automatically adjusts shift templates, overtime
              calculations, and attendance rules.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-white/80 dark:bg-slate-900/50 rounded-2xl text-center">
                <p className="text-2xl font-black text-ink-black dark:text-pearl">6h</p>
                <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">
                  Daily Max
                </p>
              </div>
              <div className="p-4 bg-white/80 dark:bg-slate-900/50 rounded-2xl text-center">
                <p className="text-2xl font-black text-ink-black dark:text-pearl">345</p>
                <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">
                  Affected Staff
                </p>
              </div>
              <div className="p-4 bg-white/80 dark:bg-slate-900/50 rounded-2xl text-center">
                <p className="text-2xl font-black text-amber-600">30d</p>
                <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">
                  Duration
                </p>
              </div>
              <div className="p-4 bg-white/80 dark:bg-slate-900/50 rounded-2xl text-center">
                <p className="text-2xl font-black text-emerald-600">Auto</p>
                <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">
                  Activation
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-600/20 active:scale-95 transition-all">
                Preview Ramadan Schedule
              </button>
              <button className="px-6 py-3 bg-white/80 dark:bg-slate-900/50 text-ink-black dark:text-pearl rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">
                Configure Rules
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
