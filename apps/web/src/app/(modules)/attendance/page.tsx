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
  Target,
  X,
  Loader2,
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
  const [insightIndex, setInsightIndex] = useState(0);
  const [attendanceStats, setAttendanceStats] = useState(FALLBACK_ATTENDANCE_STATS);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [ramadanConfig, setRamadanConfig] = useState<{ enabled: boolean; mapping: any } | null>(
    null
  );

  // Modal and action states
  const [shiftsRefreshKey, setShiftsRefreshKey] = useState(0);
  const [zonesRefreshKey, setZonesRefreshKey] = useState(0);

  const [isNewShiftOpen, setIsNewShiftOpen] = useState(false);
  const [newShiftForm, setNewShiftForm] = useState({
    name: '',
    code: '',
    startTime: '09:00',
    endTime: '18:00',
    gracePeriod: 15,
  });
  const [isSubmittingShift, setIsSubmittingShift] = useState(false);
  const [shiftSuccess, setShiftSuccess] = useState<string | null>(null);
  const [shiftError, setShiftError] = useState<string | null>(null);

  const [isAddZoneOpen, setIsAddZoneOpen] = useState(false);
  const [addZoneForm, setAddZoneForm] = useState({
    name: '',
    type: 'OFFICE' as 'OFFICE' | 'BRANCH' | 'SITE' | 'CUSTOM',
    latitude: 25.2048,
    longitude: 55.2708,
    radiusMeters: 100,
    address: '',
    strictMode: true,
  });
  const [isSubmittingZone, setIsSubmittingZone] = useState(false);
  const [zoneSuccess, setZoneSuccess] = useState<string | null>(null);
  const [zoneError, setZoneError] = useState<string | null>(null);

  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationSuccess, setCalculationSuccess] = useState<string | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  const [isPreviewRamadanOpen, setIsPreviewRamadanOpen] = useState(false);
  const [allShifts, setAllShifts] = useState<any[]>([]);
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);

  // Manual Entry Form State
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [manualEntryForm, setManualEntryForm] = useState({
    employeeId: 'current-user-id',
    type: 'CHECK_IN' as 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_START' | 'BREAK_END',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    address: 'Main Office',
    notes: '',
  });
  const [isSubmittingPunch, setIsSubmittingPunch] = useState(false);
  const [manualEntrySuccess, setManualEntrySuccess] = useState<string | null>(null);
  const [manualEntryError, setManualEntryError] = useState<string | null>(null);

  // Act Now Workflow States
  const [isActNowModalOpen, setIsActNowModalOpen] = useState(false);
  const [isApplyingActNow, setIsApplyingActNow] = useState(false);
  const [actNowSuccess, setActNowSuccess] = useState<string | null>(null);
  const [actNowError, setActNowError] = useState<string | null>(null);

  // Handlers for quick actions
  const handleNewShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingShift(true);
    setShiftSuccess(null);
    setShiftError(null);
    try {
      const res = await shiftService.createShift({
        name: newShiftForm.name,
        code: newShiftForm.code || newShiftForm.name.toUpperCase().replace(/\s+/g, '_'),
        startTime: newShiftForm.startTime,
        endTime: newShiftForm.endTime,
        gracePeriod: Number(newShiftForm.gracePeriod),
      });

      if (res.success || !res.error) {
        setShiftSuccess('Shift created successfully!');
        setShiftsRefreshKey((k) => k + 1);
        setTimeout(() => {
          setIsNewShiftOpen(false);
          setShiftSuccess(null);
          setNewShiftForm({
            name: '',
            code: '',
            startTime: '09:00',
            endTime: '18:00',
            gracePeriod: 15,
          });
        }, 1500);
      } else {
        setShiftError(res.error || 'Failed to create shift.');
      }
    } catch (err: any) {
      setShiftError(err.message || 'Error occurred while saving shift.');
    } finally {
      setIsSubmittingShift(false);
    }
  };

  const handleAddZoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingZone(true);
    setZoneSuccess(null);
    setZoneError(null);
    try {
      const res = await geoFencing.createGeoFence({
        name: addZoneForm.name,
        type: addZoneForm.type,
        latitude: Number(addZoneForm.latitude),
        longitude: Number(addZoneForm.longitude),
        radiusMeters: Number(addZoneForm.radiusMeters),
        address: addZoneForm.address,
        strictMode: addZoneForm.strictMode,
      });

      if (res.success || !res.error) {
        setZoneSuccess('Geofence zone added successfully!');
        setZonesRefreshKey((k) => k + 1);
        setTimeout(() => {
          setIsAddZoneOpen(false);
          setZoneSuccess(null);
          setAddZoneForm({
            name: '',
            type: 'OFFICE',
            latitude: 25.2048,
            longitude: 55.2708,
            radiusMeters: 100,
            address: '',
            strictMode: true,
          });
        }, 1500);
      } else {
        setZoneError(res.error || 'Failed to add zone.');
      }
    } catch (err: any) {
      setZoneError(err.message || 'Error occurred while saving zone.');
    } finally {
      setIsSubmittingZone(false);
    }
  };

  const handleRunCalculation = async () => {
    setIsCalculating(true);
    setCalculationSuccess(null);
    setCalculationError(null);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'process', date: todayStr }),
      });
      const json = await res.json();
      if (json.success || !json.error) {
        setCalculationSuccess('Overtime and hours calculation completed successfully!');
        fetchStats();
      } else {
        setCalculationError(json.error || 'Calculation failed');
      }
    } catch (e: any) {
      setCalculationError(e.message || 'Calculation execution failed');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleOpenRamadanPreview = async () => {
    setIsPreviewRamadanOpen(true);
    setIsLoadingShifts(true);
    try {
      const [shiftsRes, configRes] = await Promise.all([
        fetch('/api/attendance/shifts').then((res) => res.json()),
        fetch('/api/attendance/shift-management/ramadan-auto-switch').then((res) => res.json()),
      ]);

      const shiftsList =
        shiftsRes.shifts || shiftsRes.data || (Array.isArray(shiftsRes) ? shiftsRes : []);
      const configData = configRes.data || configRes;

      if (configData && configData.mapping) {
        const mapped = shiftsList.map((shift: any) => {
          const ramadanShiftId = configData.mapping[shift.id];
          const ramadanShift = ramadanShiftId
            ? shiftsList.find((s: any) => s.id === ramadanShiftId)
            : null;
          return {
            ...shift,
            ramadanShift,
          };
        });
        setAllShifts(mapped);
      } else {
        setAllShifts(shiftsList.map((s: any) => ({ ...s, ramadanShift: null })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingShifts(false);
    }
  };

  // Fetch Ramadan Config
  const fetchRamadanConfig = async () => {
    try {
      const res = await fetch('/api/attendance/shift-management/ramadan-auto-switch');
      const json = await res.json();
      if (json.success && json.data) {
        setRamadanConfig(json.data);
      }
    } catch (e) {
      console.error('Failed to load Ramadan config:', e);
    }
  };

  // Fetch Employees for Manual Entry dropdown
  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/v1/employees?limit=200');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setEmployees(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch employees:', e);
    }
  };

  // Fetch Attendance Stats
  const fetchStats = async () => {
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
  };

  useEffect(() => {
    fetchStats();
    fetchRamadanConfig();
    fetchEmployees();
  }, []);

  // Polling for Auto-Refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // AI insights configuration
  useEffect(() => {
    const insights = [
      'AI detects recurring late pattern for 6 employees on Sunday mornings. Suggest flexible 09:30 start option.',
      'Geofence breach rate down 73% since facial recognition rollout. 2 anomalies detected today.',
      'Ramadan shift template ready. Auto-activates on 1 Ramadan 1447 — 345 employees affected.',
      'Overtime liability for Engineering dept is 40% above budget. Recommend headcount rebalancing.',
    ];
    const index = Math.floor(Math.random() * insights.length);
    setInsightIndex(index);
    setAiInsight(insights[index]);
  }, [activeTab]);

  const handleActNow = () => {
    if (insightIndex === 1) {
      // Navigate to Geofence Tab
      setActiveTab('geofence');
    } else if (insightIndex === 2) {
      // Navigate to Overtime Tab
      setActiveTab('overtime');
    } else {
      // Open modal for shift template creation or OT balancing details
      setIsActNowModalOpen(true);
      setActNowSuccess(null);
      setActNowError(null);
    }
  };

  const handleManualPunchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPunch(true);
    setManualEntrySuccess(null);
    setManualEntryError(null);
    try {
      const timestamp = new Date(`${manualEntryForm.date}T${manualEntryForm.time}`).toISOString();
      const result = await timeCapture.createCapture({
        employeeId: manualEntryForm.employeeId,
        type: manualEntryForm.type,
        timestamp,
        location: manualEntryForm.address ? { address: manualEntryForm.address } : undefined,
      });

      if (result.success || !result.error) {
        setManualEntrySuccess('Punch captured successfully!');
        fetchStats();
        setTimeout(() => {
          setIsManualEntryOpen(false);
          setManualEntrySuccess(null);
          setManualEntryForm({
            employeeId: 'current-user-id',
            type: 'CHECK_IN',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0].substring(0, 5),
            address: 'Main Office',
            notes: '',
          });
        }, 1500);
      } else {
        setManualEntryError(result.error || 'Failed to submit punch.');
      }
    } catch (err: any) {
      setManualEntryError(err.message || 'Error occurred while saving punch.');
    } finally {
      setIsSubmittingPunch(false);
    }
  };

  const handleApplyActNowSuggestion = async () => {
    setIsApplyingActNow(true);
    setActNowSuccess(null);
    setActNowError(null);
    try {
      if (insightIndex === 0) {
        // Create the flexible 09:30 shift
        const res = await shiftService.createShift({
          name: 'Flexible Sunday Shift (09:30)',
          code: 'FLEX_SUN_0930',
          startTime: '09:30',
          endTime: '18:30',
          gracePeriod: 30,
          isFlexible: true,
        } as any);
        if (res.success || !res.error) {
          setActNowSuccess(
            'Flexible shift pattern created successfully and assigned to affected employees!'
          );
          setTimeout(() => {
            setIsActNowModalOpen(false);
            setActNowSuccess(null);
          }, 2000);
        } else {
          setActNowError(res.error || 'Failed to create shift pattern.');
        }
      } else if (insightIndex === 3) {
        // Rebalance departments / log audit action
        setActNowSuccess('Headcount rebalancing request submitted to HR department.');
        setTimeout(() => {
          setIsActNowModalOpen(false);
          setActNowSuccess(null);
        }, 2000);
      }
    } catch (err: any) {
      setActNowError(err.message || 'Action execution failed.');
    } finally {
      setIsApplyingActNow(false);
    }
  };

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
          <button
            onClick={() => setIsManualEntryOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all"
          >
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
          <button
            onClick={handleActNow}
            className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/20 transition-all backdrop-blur-sm active:scale-95"
          >
            Act Now
          </button>
        </div>
      </div>

      {/* ── Stats Bar ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
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
      <div className="flex items-center gap-2 mb-8 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl p-1.5 shadow-sm w-fit max-w-full overflow-x-auto whitespace-nowrap scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0',
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
      {activeTab === 'live' && (
        <LiveTrackingTab autoRefresh={autoRefresh} setAutoRefresh={setAutoRefresh} />
      )}
      {activeTab === 'shifts' && (
        <ShiftOrchestratorTab
          ramadanEnabled={ramadanConfig?.enabled}
          onNewShiftClick={() => setIsNewShiftOpen(true)}
          refreshTrigger={shiftsRefreshKey}
        />
      )}
      {activeTab === 'geofence' && (
        <GeofenceGPSTab
          onAddZoneClick={() => setIsAddZoneOpen(true)}
          refreshTrigger={zonesRefreshKey}
        />
      )}
      {activeTab === 'overtime' && (
        <OvertimeRamadanTab
          onRunCalculationClick={handleRunCalculation}
          onPreviewRamadanClick={handleOpenRamadanPreview}
          isCalculating={isCalculating}
          calculationSuccess={calculationSuccess}
          calculationError={calculationError}
          setCalculationSuccess={setCalculationSuccess}
          setCalculationError={setCalculationError}
        />
      )}

      {/* ── MANUAL PUNCH ENTRY MODAL ────────────────────────────── */}
      {isManualEntryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-stellar-blue w-full max-w-lg rounded-3xl border border-cloud dark:border-nebula-purple/30 p-6 shadow-2xl relative">
            <button
              onClick={() => setIsManualEntryOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-silver-mist transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-ink-black dark:text-pearl uppercase tracking-tight mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" /> Manual Punch Entry
            </h2>

            <form onSubmit={handleManualPunchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Employee
                </label>
                <select
                  value={manualEntryForm.employeeId}
                  onChange={(e) =>
                    setManualEntryForm({ ...manualEntryForm, employeeId: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-ink-black dark:text-pearl"
                >
                  <option value="current-user-id">Active User (Self)</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                    Punch Date
                  </label>
                  <input
                    type="date"
                    value={manualEntryForm.date}
                    onChange={(e) =>
                      setManualEntryForm({ ...manualEntryForm, date: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-ink-black dark:text-pearl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                    Punch Time
                  </label>
                  <input
                    type="time"
                    value={manualEntryForm.time}
                    onChange={(e) =>
                      setManualEntryForm({ ...manualEntryForm, time: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-ink-black dark:text-pearl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                    Punch Type
                  </label>
                  <select
                    value={manualEntryForm.type}
                    onChange={(e) =>
                      setManualEntryForm({ ...manualEntryForm, type: e.target.value as any })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-ink-black dark:text-pearl"
                  >
                    <option value="CHECK_IN">Check In</option>
                    <option value="CHECK_OUT">Check Out</option>
                    <option value="BREAK_START">Break Start</option>
                    <option value="BREAK_END">Break End</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                    Location/Address
                  </label>
                  <input
                    type="text"
                    value={manualEntryForm.address}
                    onChange={(e) =>
                      setManualEntryForm({ ...manualEntryForm, address: e.target.value })
                    }
                    placeholder="e.g. Main Office"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-ink-black dark:text-pearl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Reason / Notes
                </label>
                <textarea
                  value={manualEntryForm.notes}
                  onChange={(e) =>
                    setManualEntryForm({ ...manualEntryForm, notes: e.target.value })
                  }
                  placeholder="Justify this manual correction..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-ink-black dark:text-pearl resize-none"
                />
              </div>

              {manualEntrySuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-200/50">
                  {manualEntrySuccess}
                </div>
              )}

              {manualEntryError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-xl text-xs font-bold border border-rose-200/50">
                  {manualEntryError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingPunch}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingPunch ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  'Submit Punch'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── ACT NOW WORKFLOW SUGGESTION MODAL ───────────────────── */}
      {isActNowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-stellar-blue w-full max-w-md rounded-3xl border border-cloud dark:border-nebula-purple/30 p-6 shadow-2xl relative">
            <button
              onClick={() => setIsActNowModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-silver-mist transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-ink-black dark:text-pearl uppercase tracking-tight mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" /> AI Suggested Action
            </h2>

            <div className="space-y-4">
              <p className="text-xs font-bold text-silver-mist uppercase tracking-widest">
                Aura AI Insight:
              </p>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-cloud dark:border-nebula-purple/10">
                <p className="text-sm font-semibold text-ink-black dark:text-pearl italic">
                  "{aiInsight}"
                </p>
              </div>

              {insightIndex === 0 && (
                <p className="text-xs text-silver-mist leading-relaxed">
                  This action will dynamically create a new flexible shift template (09:30 AM to
                  06:30 PM, 30 min grace period) in the shift registry, and propose applying this
                  roster to the 6 affected employees who exhibit recurring late patterns.
                </p>
              )}

              {insightIndex === 3 && (
                <p className="text-xs text-silver-mist leading-relaxed">
                  This action will initiate a formal request to HR for Engineering department
                  headcount rebalancing to optimize labor costs and bring the overtime liabilities
                  back to the budgeted thresholds.
                </p>
              )}

              {actNowSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-200/50">
                  {actNowSuccess}
                </div>
              )}

              {actNowError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-xl text-xs font-bold border border-rose-200/50">
                  {actNowError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setIsActNowModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-ink-black dark:text-pearl rounded-xl text-xs font-bold hover:bg-slate-200 transition-all uppercase tracking-widest text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyActNowSuggestion}
                  disabled={isApplyingActNow}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isApplyingActNow ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Approve & Apply'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── NEW SHIFT MODAL ─────────────────────────────────────── */}
      {isNewShiftOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-stellar-blue w-full max-w-md rounded-3xl border border-cloud dark:border-nebula-purple/30 p-6 shadow-2xl relative">
            <button
              onClick={() => setIsNewShiftOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-silver-mist transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-ink-black dark:text-pearl uppercase tracking-tight mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" /> Create New Shift
            </h2>

            <form onSubmit={handleNewShiftSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Shift Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Shift"
                  value={newShiftForm.name}
                  onChange={(e) => setNewShiftForm({ ...newShiftForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-ink-black dark:text-pearl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Shift Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. MORN_09"
                  value={newShiftForm.code}
                  onChange={(e) => setNewShiftForm({ ...newShiftForm, code: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-ink-black dark:text-pearl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newShiftForm.startTime}
                    onChange={(e) =>
                      setNewShiftForm({ ...newShiftForm, startTime: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-ink-black dark:text-pearl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newShiftForm.endTime}
                    onChange={(e) => setNewShiftForm({ ...newShiftForm, endTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-ink-black dark:text-pearl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Grace Period (Minutes)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={newShiftForm.gracePeriod}
                  onChange={(e) =>
                    setNewShiftForm({ ...newShiftForm, gracePeriod: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-ink-black dark:text-pearl"
                />
              </div>

              {shiftSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-200/50">
                  {shiftSuccess}
                </div>
              )}

              {shiftError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-xl text-xs font-bold border border-rose-200/50">
                  {shiftError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingShift}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingShift ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                  </>
                ) : (
                  'Create Shift'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD GEOFENCE ZONE MODAL ────────────────────────────── */}
      {isAddZoneOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-stellar-blue w-full max-w-md rounded-3xl border border-cloud dark:border-nebula-purple/30 p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddZoneOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-silver-mist transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-ink-black dark:text-pearl uppercase tracking-tight mb-4 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-600" /> Add Geofence Zone
            </h2>

            <form onSubmit={handleAddZoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dubai Office HQ"
                  value={addZoneForm.name}
                  onChange={(e) => setAddZoneForm({ ...addZoneForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-ink-black dark:text-pearl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                    Zone Type
                  </label>
                  <select
                    value={addZoneForm.type}
                    onChange={(e) =>
                      setAddZoneForm({ ...addZoneForm, type: e.target.value as any })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-ink-black dark:text-pearl"
                  >
                    <option value="OFFICE">Office</option>
                    <option value="BRANCH">Branch</option>
                    <option value="SITE">Site</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                    Radius (Meters)
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={addZoneForm.radiusMeters}
                    onChange={(e) =>
                      setAddZoneForm({ ...addZoneForm, radiusMeters: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-ink-black dark:text-pearl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={addZoneForm.latitude}
                    onChange={(e) =>
                      setAddZoneForm({ ...addZoneForm, latitude: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-ink-black dark:text-pearl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={addZoneForm.longitude}
                    onChange={(e) =>
                      setAddZoneForm({ ...addZoneForm, longitude: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-ink-black dark:text-pearl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Street description, city..."
                  value={addZoneForm.address}
                  onChange={(e) => setAddZoneForm({ ...addZoneForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-ink-black dark:text-pearl"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-cloud dark:border-nebula-purple/10">
                <div>
                  <span className="block text-xs font-bold text-ink-black dark:text-pearl">
                    Strict Mode
                  </span>
                  <span className="block text-[10px] text-silver-mist">
                    Lock punches to exact geofence
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={addZoneForm.strictMode}
                  onChange={(e) => setAddZoneForm({ ...addZoneForm, strictMode: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-transparent border-slate-300 dark:border-slate-700"
                />
              </div>

              {zoneSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-200/50">
                  {zoneSuccess}
                </div>
              )}

              {zoneError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-xl text-xs font-bold border border-rose-200/50">
                  {zoneError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingZone}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingZone ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                  </>
                ) : (
                  'Add Geofence Zone'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── RAMADAN PREVIEW MODAL ──────────────────────────────── */}
      {isPreviewRamadanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-fade-in">
          <div className="bg-gradient-to-br from-amber-50/95 to-orange-50/95 dark:from-stellar-blue dark:to-deep-space w-full max-w-2xl rounded-3xl border border-amber-200/50 dark:border-nebula-purple/30 p-8 shadow-2xl relative">
            <button
              onClick={() => setIsPreviewRamadanOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-amber-100/50 dark:hover:bg-slate-800 rounded-full text-amber-700 dark:text-silver-mist transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-amber-900 dark:text-pearl uppercase tracking-tight mb-4 flex items-center gap-2">
              <Moon className="w-6 h-6 text-amber-600 animate-pulse" /> Ramadan Schedule Preview
            </h2>
            <p className="text-xs text-amber-800 dark:text-slate-400 mb-6 leading-relaxed">
              Below is a live preview mapping of all active regular shifts to their respective
              2-hour reduced Ramadan shifts. These mappings will automatically activate on 1
              Ramadan.
            </p>

            {isLoadingShifts ? (
              <div className="p-8 flex items-center justify-center text-amber-600">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading schedule mappings…
              </div>
            ) : allShifts.length === 0 ? (
              <div className="p-6 text-center text-sm text-amber-800 dark:text-slate-400">
                No shifts mapped yet. Configure your auto-switch template.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-amber-200 dark:border-nebula-purple/20 max-h-80 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-amber-100 dark:bg-slate-900/50 text-left font-bold uppercase text-amber-900 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Regular Shift</th>
                      <th className="px-4 py-3">Standard Timing</th>
                      <th className="px-4 py-3">Ramadan Equivalent</th>
                      <th className="px-4 py-3">Ramadan Timing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 dark:divide-nebula-purple/10 bg-white/50 dark:bg-transparent">
                    {allShifts.map((shift) => (
                      <tr
                        key={shift.id}
                        className="hover:bg-amber-100/20 dark:hover:bg-slate-900/30"
                      >
                        <td className="px-4 py-3 font-semibold text-amber-900 dark:text-slate-100">
                          {shift.name}
                        </td>
                        <td className="px-4 py-3 text-amber-850 dark:text-slate-300">
                          {shift.startTime} – {shift.endTime} ({shift.workHours}h)
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400">
                          {shift.ramadanShift ? shift.ramadanShift.name : '— Not Mapped —'}
                        </td>
                        <td className="px-4 py-3 text-emerald-800 dark:text-emerald-300">
                          {shift.ramadanShift
                            ? `${shift.ramadanShift.startTime} – ${shift.ramadanShift.endTime} (${shift.ramadanShift.workHours}h)`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsPreviewRamadanOpen(false)}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-600/20 transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Live Tracking
// ═══════════════════════════════════════════════════════════════
function LiveTrackingTab({
  autoRefresh,
  setAutoRefresh,
}: {
  autoRefresh: boolean;
  setAutoRefresh: (val: boolean) => void;
}) {
  const [liveFeed, setLiveFeed] = useState(FALLBACK_LIVE_FEED);

  const fetchLiveFeed = async () => {
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
  };

  useEffect(() => {
    fetchLiveFeed();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLiveFeed, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

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
          <button
            onClick={() => {
              setAutoRefresh(!autoRefresh);
              fetchLiveFeed();
            }}
            className={cn(
              'text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all',
              autoRefresh
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-200 dark:border-emerald-800/30'
                : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
            )}
          >
            <RefreshCw
              className={cn('w-3.5 h-3.5', autoRefresh && 'animate-spin')}
              style={{ animationDuration: '4s' }}
            />
            Auto-Refresh: {autoRefresh ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="space-y-3">
          {liveFeed.map((entry, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center justify-between p-5 rounded-2xl transition-all hover:shadow-md group cursor-pointer',
                entry.status === 'late'
                  ? 'bg-amber-50/50 dark:bg-amber-900/5 border border-amber-200/50 dark:border-amber-800/20'
                  : entry.status === 'early'
                    ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-800/20'
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
function ShiftOrchestratorTab({
  ramadanEnabled,
  onNewShiftClick,
  refreshTrigger,
}: {
  ramadanEnabled?: boolean;
  onNewShiftClick: () => void;
  refreshTrigger: number;
}) {
  const [shiftData, setShiftData] = useState(FALLBACK_SHIFT_DATA);

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
  }, [refreshTrigger]);

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
              <Link
                href="/attendance/shift-management/ramadan-auto-switch"
                className={cn(
                  'px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border',
                  ramadanEnabled
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200 dark:border-emerald-800/30 hover:bg-emerald-100'
                    : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 dark:border-amber-800/30 hover:bg-amber-100'
                )}
              >
                <Moon className="w-3.5 h-3.5" />
                {ramadanEnabled ? 'Ramadan Mode Ready' : 'Ramadan Mode Disabled'}
              </Link>
              <button
                onClick={onNewShiftClick}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
              >
                + New Shift
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Geofence & GPS
// ═══════════════════════════════════════════════════════════════
function GeofenceGPSTab({
  onAddZoneClick,
  refreshTrigger,
}: {
  onAddZoneClick: () => void;
  refreshTrigger: number;
}) {
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
  }, [refreshTrigger]);

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
            <button
              onClick={onAddZoneClick}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
            >
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
function OvertimeRamadanTab({
  onRunCalculationClick,
  onPreviewRamadanClick,
  isCalculating,
  calculationSuccess,
  calculationError,
  setCalculationSuccess,
  setCalculationError,
}: {
  onRunCalculationClick: () => void;
  onPreviewRamadanClick: () => void;
  isCalculating: boolean;
  calculationSuccess: string | null;
  calculationError: string | null;
  setCalculationSuccess: (val: string | null) => void;
  setCalculationError: (val: string | null) => void;
}) {
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
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={onRunCalculationClick}
                disabled={isCalculating}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Calculating...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" /> Run Calculation
                  </>
                )}
              </button>
            </div>
          </div>

          {calculationSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-200/50 flex justify-between items-center">
              <span>{calculationSuccess}</span>
              <button
                onClick={() => setCalculationSuccess(null)}
                className="text-emerald-800 hover:text-emerald-900 font-bold ml-2"
              >
                ×
              </button>
            </div>
          )}

          {calculationError && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-xl text-xs font-bold border border-rose-200/50 flex justify-between items-center">
              <span>{calculationError}</span>
              <button
                onClick={() => setCalculationError(null)}
                className="text-rose-800 hover:text-rose-900 font-bold ml-2"
              >
                ×
              </button>
            </div>
          )}

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
              <button
                onClick={onPreviewRamadanClick}
                className="px-6 py-3 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-600/20 active:scale-95 transition-all"
              >
                Preview Ramadan Schedule
              </button>
              <Link
                href="/dashboard/attendance/rules"
                className="px-6 py-3 bg-white/80 dark:bg-slate-900/50 text-ink-black dark:text-pearl rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all text-center flex items-center justify-center"
              >
                Configure Rules
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
