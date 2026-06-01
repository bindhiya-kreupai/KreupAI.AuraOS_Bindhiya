'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  BarChart3,
  RefreshCw,
  Zap,
  Bot,
  Sparkles,
  ShieldCheck,
  Sun,
  Moon,
  Palmtree,
  Globe,
  Timer,
  FileText,
  Calculator,
  Layers,
} from 'lucide-react';
import { cn } from '@aura/ui/utils';
import Link from 'next/link';
import {
  LeaveAnalyticsService,
  LeaveRequestService,
  LeaveBalanceService,
  HolidayService,
} from '@/app/dashboard/leave/services';

// ── Fallback Data (used until API responds) ──────────────────────────
const FALLBACK_LEAVE_STATS = [
  { title: 'Pending Requests', value: '—', icon: Clock, color: 'amber', alert: true },
  { title: 'Approved Today', value: '—', icon: CheckCircle2, color: 'emerald' },
  { title: 'Active on Leave', value: '—', icon: Palmtree, color: 'blue' },
  { title: 'Utilization Rate', value: '—', icon: BarChart3, color: 'indigo' },
  { title: 'Carry-Forward Risk', value: '—', icon: AlertCircle, color: 'rose', alert: true },
];

const FALLBACK_ACCRUAL_ENGINES: any[] = [];

const COUNTRY_RULES = [
  {
    country: 'UAE',
    flag: '🇦🇪',
    annual: '30 days',
    sick: '90 days',
    maternity: '45 days',
    hajj: '30 days',
    calendar: 'Hijri + Gregorian',
    status: 'Compliant',
  },
  {
    country: 'KSA',
    flag: '🇸🇦',
    annual: '21-30 days',
    sick: '120 days',
    maternity: '70 days',
    hajj: '10-15 days',
    calendar: 'Umm al-Qura',
    status: 'Compliant',
  },
  {
    country: 'India',
    flag: '🇮🇳',
    annual: '15 days (EL)',
    sick: '12 days',
    maternity: '26 weeks',
    hajj: 'N/A',
    calendar: 'Gregorian',
    status: 'Review Needed',
  },
  {
    country: 'Bahrain',
    flag: '🇧🇭',
    annual: '30 days',
    sick: '55 days',
    maternity: '60 days',
    hajj: '14 days',
    calendar: 'Hijri + Gregorian',
    status: 'Compliant',
  },
];

const FALLBACK_CALENDAR_EVENTS: any[] = [];

export default function LeaveCommandCenter() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'accruals' | 'country-rules' | 'calendar'
  >('overview');
  const [calendarMode, setCalendarMode] = useState<'gregorian' | 'hijri'>('gregorian');
  const [aiInsight, setAiInsight] = useState('');

  useEffect(() => {
    const insights = [
      'AI detects 14 employees at risk of losing 340+ carry-forward days by Q4. Recommend proactive encashment.',
      'Hajj leave eligibility window opens in 45 days. 8 employees have pending requests.',
      'GOSI-linked sick leave accruals are 12% above benchmark. Review policy thresholds.',
      "Country-rule sync: India's new Labour Code 2025 requires maternity leave update to 26 weeks.",
    ];
    setAiInsight(insights[Math.floor(Math.random() * insights.length)]);
  }, [activeTab]);

  const tabs = [
    { id: 'overview', label: 'Command Center', icon: BarChart3 },
    { id: 'accruals', label: 'Accrual Engine', icon: Calculator },
    { id: 'country-rules', label: 'Country Rules', icon: Globe },
    { id: 'calendar', label: 'Hijri Calendar', icon: Moon },
  ];

  return (
    <div className="min-h-screen bg-ghost-white dark:bg-deep-space p-8 font-sans">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-ink-black dark:text-pearl tracking-tight uppercase italic">
                Leave Command Center
              </h1>
              <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">
                Smart Absence Orchestration • Multi-Jurisdiction • Hijri Native
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/leave/balances"
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs font-bold text-ink-black dark:text-pearl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Layers className="w-4 h-4" /> Balances
          </Link>
          <Link
            href="/leave/policies"
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs font-bold text-ink-black dark:text-pearl hover:bg-slate-50 transition-all shadow-sm"
          >
            <FileText className="w-4 h-4" /> Policies
          </Link>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all">
            <Plus className="w-4 h-4" /> New Request
          </button>
        </div>
      </div>

      {/* ── AI Sentinel ──────────────────────────────────────────── */}
      <div className="mb-8 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-[2rem] p-6 shadow-xl shadow-indigo-600/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Bot className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-1">
              Aura Leave Intelligence
            </h3>
            <p className="text-sm text-white font-medium leading-relaxed">{aiInsight}</p>
          </div>
          <button className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/20 transition-all backdrop-blur-sm">
            Act Now
          </button>
        </div>
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
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-slate-50 dark:hover:bg-slate-800'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ──────────────────────────────────────────── */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'accruals' && <AccrualEngineTab />}
      {activeTab === 'country-rules' && <CountryRulesTab />}
      {activeTab === 'calendar' && (
        <HijriCalendarTab calendarMode={calendarMode} setCalendarMode={setCalendarMode} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Overview
// ═══════════════════════════════════════════════════════════════
function OverviewTab() {
  const [leaveStats, setLeaveStats] = useState(FALLBACK_LEAVE_STATS);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [stats, requests] = await Promise.all([
          LeaveAnalyticsService.getStats(),
          LeaveRequestService.getRequests({ status: 'pending_manager_approval' }),
        ]);

        if (stats) {
          const totalBal =
            stats.totalAccruedDays > 0
              ? Math.round((stats.totalAvailedDays / stats.totalAccruedDays) * 100)
              : 0;
          setLeaveStats([
            {
              title: 'Pending Requests',
              value: String(stats.pendingRequests || 0),
              icon: Clock,
              color: 'amber',
              alert: (stats.pendingRequests || 0) > 0,
            },
            {
              title: 'Approved Today',
              value: String(stats.onLeaveToday || 0),
              icon: CheckCircle2,
              color: 'emerald',
            },
            {
              title: 'Active on Leave',
              value: String(stats.onLeaveToday || 0),
              icon: Palmtree,
              color: 'blue',
            },
            { title: 'Utilization Rate', value: `${totalBal}%`, icon: BarChart3, color: 'indigo' },
            {
              title: 'Lapsed Days',
              value: String(stats.totalLapsedDays || 0),
              icon: AlertCircle,
              color: 'rose',
              alert: (stats.totalLapsedDays || 0) > 0,
            },
          ]);
        }

        if (requests?.length > 0) {
          setPendingRequests(
            requests.slice(0, 6).map((r: any) => ({
              name: r.employeeName || 'Employee',
              type: r.leaveTypeName || 'Leave',
              days: r.totalDays || 1,
              from: new Date(r.fromDate).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
              }),
              to: new Date(r.toDate).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
              }),
              dept: r.department || '',
              priority: r.isEmergencyLeave ? 'urgent' : 'normal',
            }))
          );
        }
      } catch (e) {
        console.error('Leave stats fetch error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {leaveStats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Requests */}
        <div className="xl:col-span-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-ink-black dark:text-pearl uppercase tracking-tight">
              Pending Approvals
            </h2>
            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {(pendingRequests.length > 0
              ? pendingRequests
              : [
                  {
                    name: 'No pending requests',
                    type: '',
                    days: 0,
                    from: '',
                    to: '',
                    dept: '',
                    priority: 'normal',
                  },
                ]
            )
              .filter((r) => r.days > 0 || pendingRequests.length === 0)
              .map((req, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-black text-indigo-600">
                      {req.name
                        .split(' ')
                        .map((n: any) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="font-bold text-ink-black dark:text-pearl text-sm group-hover:text-indigo-600 transition-colors">
                        {req.name}
                      </p>
                      <p className="text-[10px] text-silver-mist font-bold uppercase tracking-widest">
                        {req.dept} • {req.from} → {req.to}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        'text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest',
                        req.priority === 'urgent'
                          ? 'bg-rose-50 text-rose-600'
                          : req.priority === 'special'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-indigo-50 text-indigo-600'
                      )}
                    >
                      {req.type}
                    </span>
                    <span className="text-sm font-black text-ink-black dark:text-pearl">
                      {req.days}d
                    </span>
                    <div className="flex gap-2">
                      <button className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all text-xs font-black">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all text-xs font-black">
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Quick Insights Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-silver-mist uppercase tracking-widest mb-4">
              Leave Type Distribution
            </h3>
            <div className="space-y-4">
              {[
                { type: 'Annual', pct: 45, color: 'bg-indigo-500' },
                { type: 'Sick', pct: 20, color: 'bg-amber-500' },
                { type: 'Maternity/Paternity', pct: 15, color: 'bg-emerald-500' },
                { type: 'Hajj / Religious', pct: 12, color: 'bg-violet-500' },
                { type: 'Comp-Off', pct: 8, color: 'bg-rose-500' },
              ].map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-ink-black dark:text-pearl">
                      {item.type}
                    </span>
                    <span className="text-xs font-black text-silver-mist">{item.pct}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-1000', item.color)}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-silver-mist uppercase tracking-widest mb-4 flex items-center justify-between">
              Encashment Liability{' '}
              <span className="text-rose-500 animate-pulse text-[9px]">Live</span>
            </h3>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-black text-ink-black dark:text-pearl">₹4.2M</p>
                <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest">
                  Total Encashment Liability
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center">
                  <p className="text-lg font-black text-ink-black dark:text-pearl">340</p>
                  <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest leading-none">
                    Days at Risk
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center">
                  <p className="text-lg font-black text-ink-black dark:text-pearl">14</p>
                  <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest leading-none">
                    Employees
                  </p>
                </div>
              </div>
              <Link
                href="/leave/requests"
                className="block w-full py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest text-center hover:bg-indigo-100 transition-all"
              >
                Manage Encashment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Accrual Engine
// ═══════════════════════════════════════════════════════════════
function AccrualEngineTab() {
  const [accrualData, setAccrualData] = useState(FALLBACK_ACCRUAL_ENGINES);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const balances = await LeaveBalanceService.getBalances();
        if (balances?.length > 0) {
          setAccrualData(
            balances.map((b: any) => ({
              name: b.leaveTypeName || 'Leave',
              rate: b.accrualPerMonth ? `${b.accrualPerMonth} days/mo` : '—',
              accrued: String(b.accrued ?? 0),
              used: String(b.availed ?? 0),
              balance: String(b.availableBalance ?? 0),
              status: Number(b.availableBalance) > 0 ? 'Active' : 'Exhausted',
            }))
          );
        }
      } catch (e) {
        console.error('Accrual fetch error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      {/* Engine Status */}
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <Calculator className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">
                Accrual Processing Engine
              </h2>
              <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">
                Real-Time Entitlement Computation • Rule-Based Automation
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Engine Online
              </button>
              <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                Run Batch Accrual
              </button>
            </div>
          </div>

          {/* Accrual Table */}
          <div className="overflow-hidden rounded-2xl border border-cloud dark:border-nebula-purple/20">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Leave Type
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Accrual Rate
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Total Accrued
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Used
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Balance
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud dark:divide-nebula-purple/10">
                {accrualData.map((eng, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-bold text-sm text-ink-black dark:text-pearl">
                        {eng.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-silver-mist">{eng.rate}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-ink-black dark:text-pearl">
                        {eng.accrued}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-rose-600">{eng.used}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-emerald-600">{eng.balance}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest',
                          eng.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600'
                            : eng.status === 'Eligible'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-slate-100 text-silver-mist'
                        )}
                      >
                        {eng.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Accrual Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-cloud dark:border-nebula-purple/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <Timer className="w-4 h-4 text-indigo-600" />
                </div>
                <h4 className="font-black text-sm text-ink-black dark:text-pearl uppercase tracking-tight">
                  Frequency
                </h4>
              </div>
              <p className="text-xs text-silver-mist leading-relaxed">
                Monthly batch processing on the 1st. Mid-cycle adjustments for new joiners and
                separations.
              </p>
            </div>
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-cloud dark:border-nebula-purple/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <h4 className="font-black text-sm text-ink-black dark:text-pearl uppercase tracking-tight">
                  Carry Forward
                </h4>
              </div>
              <p className="text-xs text-silver-mist leading-relaxed">
                Configurable per jurisdiction. UAE: Max 50% carry. KSA: Full carry with encashment
                option.
              </p>
            </div>
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-cloud dark:border-nebula-purple/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                </div>
                <h4 className="font-black text-sm text-ink-black dark:text-pearl uppercase tracking-tight">
                  Pro-Rata Logic
                </h4>
              </div>
              <p className="text-xs text-silver-mist leading-relaxed">
                Auto-calculated for mid-year joiners. Supports calendar year and anniversary-based
                entitlement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Country Rules
// ═══════════════════════════════════════════════════════════════
function CountryRulesTab() {
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <Globe className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">
                Jurisdiction Rules Engine
              </h2>
              <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">
                Multi-Country Labour Law Compliance • Auto-Sync
              </p>
            </div>
            <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> Sync Rules
            </button>
          </div>

          {/* Country Rules Grid */}
          <div className="overflow-hidden rounded-2xl border border-cloud dark:border-nebula-purple/20">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Country
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Annual
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Sick
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Maternity
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Hajj
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Calendar
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud dark:divide-nebula-purple/10">
                {COUNTRY_RULES.map((rule, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group/row cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{rule.flag}</span>
                        <span className="font-extrabold text-ink-black dark:text-pearl group-hover/row:text-indigo-600 transition-colors">
                          {rule.country}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-ink-black dark:text-pearl">
                      {rule.annual}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-ink-black dark:text-pearl">
                      {rule.sick}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-ink-black dark:text-pearl">
                      {rule.maternity}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-ink-black dark:text-pearl">
                      {rule.hajj}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full uppercase tracking-widest">
                        {rule.calendar}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={cn(
                          'text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest',
                          rule.status === 'Compliant'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-amber-50 text-amber-600'
                        )}
                      >
                        {rule.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hajj Leave Special Section */}
          <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-3xl p-8 border border-amber-200/50 dark:border-amber-800/20">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
                <Palmtree className="w-8 h-8 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-ink-black dark:text-pearl uppercase tracking-tight mb-2">
                  Hajj Leave Management
                </h3>
                <p className="text-xs text-silver-mist leading-relaxed mb-4 max-w-xl">
                  Automated Hajj leave eligibility based on UAE Article 87 (30 days once per
                  service) and KSA Article 65 (10-15 days). Integrates with Hijri calendar for
                  accurate date computation.
                </p>
                <div className="flex gap-4">
                  <div className="px-4 py-2 bg-white/80 dark:bg-slate-900/50 rounded-xl">
                    <p className="text-lg font-black text-ink-black dark:text-pearl">8</p>
                    <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">
                      Eligible
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-white/80 dark:bg-slate-900/50 rounded-xl">
                    <p className="text-lg font-black text-ink-black dark:text-pearl">3</p>
                    <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">
                      Pending
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-white/80 dark:bg-slate-900/50 rounded-xl">
                    <p className="text-lg font-black text-ink-black dark:text-pearl">45d</p>
                    <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">
                      Until Season
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
// TAB: Hijri Calendar
// ═══════════════════════════════════════════════════════════════
function HijriCalendarTab({ calendarMode, setCalendarMode }: any) {
  const [calendarEvents, setCalendarEvents] = useState(FALLBACK_CALENDAR_EVENTS);

  useEffect(() => {
    (async () => {
      try {
        const holidays = await HolidayService.getHolidays(new Date().getFullYear());
        if (holidays?.length > 0) {
          setCalendarEvents(
            holidays.map((h: any) => {
              const d = new Date(h.date);
              return {
                date: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
                hijri: '',
                type: 'holiday',
                label: h.name,
                days: 1,
              };
            })
          );
        }
      } catch (e) {
        console.error('Calendar fetch error:', e);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">
              Unified Calendar
            </h2>
            <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">
              Gregorian + Hijri (Umm al-Qura) • Synchronized
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 rounded-xl p-1">
            <button
              onClick={() => setCalendarMode('gregorian')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                calendarMode === 'gregorian'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-silver-mist'
              )}
            >
              <Sun className="w-3.5 h-3.5" /> Gregorian
            </button>
            <button
              onClick={() => setCalendarMode('hijri')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                calendarMode === 'hijri' ? 'bg-indigo-600 text-white shadow-lg' : 'text-silver-mist'
              )}
            >
              <Moon className="w-3.5 h-3.5" /> Hijri
            </button>
          </div>
        </div>

        {/* Calendar Events Stream */}
        <div className="space-y-4">
          {calendarEvents.map((event, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-6 p-5 rounded-2xl border transition-all hover:shadow-md group cursor-pointer',
                event.type === 'holiday'
                  ? 'bg-amber-50/50 dark:bg-amber-900/5 border-amber-200/50 dark:border-amber-800/20'
                  : 'bg-white dark:bg-stellar-blue border-cloud dark:border-nebula-purple/20 hover:border-indigo-500/50'
              )}
            >
              <div className="text-center min-w-[80px]">
                <p className="text-lg font-black text-ink-black dark:text-pearl leading-none">
                  {event.date}
                </p>
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-1">
                  {event.hijri}
                </p>
              </div>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1">
                <p className="font-bold text-ink-black dark:text-pearl text-sm group-hover:text-indigo-600 transition-colors">
                  {event.label}
                </p>
                <p className="text-[10px] text-silver-mist font-bold uppercase tracking-widest">
                  {event.type === 'holiday' ? '🕌 Public Holiday' : '🏖️ Employee Leave'} •{' '}
                  {event.days} {event.days === 1 ? 'day' : 'days'}
                </p>
              </div>
              <div
                className={cn(
                  'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest',
                  event.type === 'holiday'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-indigo-50 text-indigo-600'
                )}
              >
                {event.type}
              </div>
            </div>
          ))}
        </div>

        {/* Ramadan Hours Notice */}
        <div className="mt-8 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/10 dark:to-indigo-900/10 rounded-3xl p-8 border border-violet-200/50 dark:border-violet-800/20">
          <div className="flex items-start gap-6">
            <div className="p-4 bg-violet-100 dark:bg-violet-900/30 rounded-2xl">
              <Moon className="w-8 h-8 text-violet-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-ink-black dark:text-pearl uppercase tracking-tight mb-2">
                Ramadan Working Hours
              </h3>
              <p className="text-xs text-silver-mist leading-relaxed mb-4 max-w-xl">
                UAE Federal Decree-Law No. 33 mandates reduced working hours (6hrs/day) during
                Ramadan for all private sector employees. AuraOS automatically adjusts shift
                templates and overtime calculations.
              </p>
              <div className="flex gap-3">
                <span className="px-4 py-2 bg-white/80 dark:bg-slate-900/50 rounded-xl text-[10px] font-black text-violet-600 uppercase tracking-widest">
                  Starts: 1 Ramadan 1447
                </span>
                <span className="px-4 py-2 bg-white/80 dark:bg-slate-900/50 rounded-xl text-[10px] font-black text-silver-mist uppercase tracking-widest">
                  Auto-Shift Enabled
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Shared Components
// ═══════════════════════════════════════════════════════════════
function StatCard({ title, value, icon: Icon, color, alert }: any) {
  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    rose: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20',
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  };
  return (
    <div
      className={cn(
        'bg-white dark:bg-stellar-blue rounded-3xl p-5 border transition-all hover:shadow-xl group',
        alert
          ? 'border-rose-100 dark:border-rose-900/20'
          : 'border-cloud dark:border-nebula-purple/30'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn('inline-flex p-3 rounded-2xl', colorMap[color] || colorMap.indigo)}>
          <Icon className="w-5 h-5" />
        </div>
        {alert && <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />}
      </div>
      <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest leading-none mb-1">
        {title}
      </p>
      <div className="text-2xl font-black text-ink-black dark:text-pearl group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
        {value}
      </div>
    </div>
  );
}
