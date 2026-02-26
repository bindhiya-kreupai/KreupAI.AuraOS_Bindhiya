'use client';

import React, { useState, useEffect } from 'react';
import {
  LogOut,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Plus,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Users,
  FileText,
  Info,
} from 'lucide-react';
import type { ExitProcess, ExitAnalytics, ExitType, ExitStatus } from '@/services/exitService';
import { ExitService } from '@/services/exitService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EXIT_TYPE_COLORS: Record<ExitType, { bg: string; text: string; border: string }> = {
  Resignation: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  Termination: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
  Retirement: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  'End of Contract': { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300' },
  'Mutual Separation': {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300',
  },
  Redundancy: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
  'Death in Service': { bg: 'bg-slate-200', text: 'text-slate-600', border: 'border-slate-400' },
};

const STATUS_COLORS: Record<ExitStatus, { bg: string; text: string }> = {
  Initiated: { bg: 'bg-slate-100', text: 'text-slate-600' },
  'Notice Period': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Clearance In Progress': { bg: 'bg-sky-100', text: 'text-sky-700' },
  'Exit Interview Pending': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'Final Settlement Pending': { bg: 'bg-orange-100', text: 'text-orange-700' },
  Completed: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Cancelled: { bg: 'bg-slate-100', text: 'text-slate-400' },
};

function daysUntil(dateStr: string): number {
  const today = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function clearancePct(process: ExitProcess): number {
  const total = process.clearanceItems.length;
  if (total === 0) return 0;
  const cleared = process.clearanceItems.filter(
    (ci) => ci.status === 'Cleared' || ci.status === 'NA'
  ).length;
  return Math.round((cleared / total) * 100);
}

// ---------------------------------------------------------------------------
// Exit Process Card
// ---------------------------------------------------------------------------

function ExitProcessCard({ process, onSelect }: { process: ExitProcess; onSelect: () => void }) {
  const typeStyle = EXIT_TYPE_COLORS[process.exitType];
  const statusStyle = STATUS_COLORS[process.status];
  const clearPct = clearancePct(process);
  const daysLeft = daysUntil(process.lastWorkingDay);
  const isUrgent = daysLeft <= 7 && !['Completed', 'Cancelled'].includes(process.status);

  return (
    <button
      onClick={onSelect}
      className={`w-full flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white border rounded-xl hover:shadow-sm transition-all text-left ${
        isUrgent ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200 hover:border-slate-400'
      }`}
    >
      {/* Employee Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-slate-800">{process.employeeName}</p>
          <span className="text-xs text-slate-400">{process.employeeCode}</span>
          {isUrgent && <AlertTriangle size={12} className="text-amber-500" />}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {process.designation} &bull; {process.department} &bull; {process.location}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">Reason: {process.exitReasonCategory}</p>
      </div>

      {/* Exit Type */}
      <span
        className={`inline-block px-2 py-1 rounded-lg border text-xs font-medium flex-shrink-0 ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}
      >
        {process.exitType}
      </span>

      {/* Last Working Day */}
      <div className="text-center flex-shrink-0">
        <p className="text-xs text-slate-400">Last Day</p>
        <p className="text-sm font-bold text-slate-700">{process.lastWorkingDay}</p>
        <p
          className={`text-xs font-medium ${
            daysLeft < 0
              ? 'text-slate-400'
              : daysLeft <= 3
                ? 'text-rose-600'
                : daysLeft <= 7
                  ? 'text-amber-600'
                  : 'text-slate-500'
          }`}
        >
          {daysLeft < 0 ? 'Passed' : `${daysLeft}d left`}
        </p>
      </div>

      {/* Clearance Progress */}
      <div className="w-28 flex-shrink-0">
        <p className="text-xs text-slate-400 mb-1">Clearance</p>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${clearPct === 100 ? 'bg-emerald-400' : clearPct > 50 ? 'bg-sky-400' : 'bg-amber-400'}`}
            style={{ width: `${clearPct}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{clearPct}%</p>
      </div>

      {/* Status */}
      <span
        className={`px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${statusStyle.bg} ${statusStyle.text}`}
      >
        {process.status}
      </span>

      <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Initiate Exit Modal
// ---------------------------------------------------------------------------

function InitiateExitModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    employeeName: '',
    employeeCode: '',
    department: '',
    designation: '',
    exitType: 'Resignation' as ExitType,
    lastWorkingDay: '',
    exitReason: '',
    exitReasonCategory: 'Better Opportunity' as any,
    managerName: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await ExitService.initiateExit(`emp-new-${Date.now()}`, {
      ...form,
      noticePeriodDays: 30,
    });
    setSaving(false);
    onCreated();
    onClose();
  }

  const inputClass =
    'w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">Initiate Exit Process</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Employee Name *
              </label>
              <input
                required
                className={inputClass}
                placeholder="Full name"
                value={form.employeeName}
                onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Employee Code</label>
              <input
                className={inputClass}
                placeholder="EMP###"
                value={form.employeeCode}
                onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <input
                className={inputClass}
                placeholder="Department"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
              <input
                className={inputClass}
                placeholder="Job title"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Exit Type</label>
              <select
                className={inputClass}
                value={form.exitType}
                onChange={(e) => setForm({ ...form, exitType: e.target.value as ExitType })}
              >
                {(
                  [
                    'Resignation',
                    'Termination',
                    'Retirement',
                    'End of Contract',
                    'Mutual Separation',
                    'Redundancy',
                  ] as ExitType[]
                ).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Last Working Day
              </label>
              <input
                type="date"
                required
                className={inputClass}
                value={form.lastWorkingDay}
                onChange={(e) => setForm({ ...form, lastWorkingDay: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Exit Reason Category
            </label>
            <select
              className={inputClass}
              value={form.exitReasonCategory}
              onChange={(e) => setForm({ ...form, exitReasonCategory: e.target.value })}
            >
              {[
                'Better Opportunity',
                'Compensation',
                'Work-Life Balance',
                'Relocation',
                'Personal/Family',
                'Career Change',
                'Company Culture',
                'Management',
                'Contract End',
                'Performance',
                'Retirement',
                'Health',
                'Other',
              ].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Exit Reason</label>
            <textarea
              className={`${inputClass} h-20 resize-none`}
              placeholder="Employee's stated reason for leaving..."
              value={form.exitReason}
              onChange={(e) => setForm({ ...form, exitReason: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Manager Name</label>
              <input
                className={inputClass}
                placeholder="Direct manager"
                value={form.managerName}
                onChange={(e) => setForm({ ...form, managerName: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Initiating...' : 'Initiate Exit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ExitDashboard({
  onProcessSelect,
}: {
  onProcessSelect?: (exitId: string) => void;
}) {
  const [processes, setProcesses] = useState<ExitProcess[]>([]);
  const [analytics, setAnalytics] = useState<ExitAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'all' | 'analytics'>('active');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [procs, anal] = await Promise.all([
      ExitService.getExitProcesses(),
      ExitService.getExitAnalytics(),
    ]);
    setProcesses(procs);
    setAnalytics(anal);
    setLoading(false);
  }

  const activeProcesses = processes.filter((p) => !['Completed', 'Cancelled'].includes(p.status));
  const displayProcesses = activeTab === 'active' ? activeProcesses : processes;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Exit Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {analytics?.activeExits} active exits &bull; {analytics?.totalExitsYTD} YTD &bull;{' '}
            {analytics?.turnoverRate}% turnover rate
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={16} className="text-slate-500" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            <Plus size={16} />
            Initiate Exit
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Exits',
            value: analytics?.activeExits ?? 0,
            icon: <LogOut size={18} className="text-amber-600" />,
            color: 'bg-amber-100',
          },
          {
            label: 'Exits YTD',
            value: analytics?.totalExitsYTD ?? 0,
            icon: <Users size={18} className="text-slate-600" />,
            color: 'bg-slate-100',
          },
          {
            label: 'Avg Processing',
            value: `${analytics?.avgExitProcessingDays ?? 0}d`,
            icon: <Clock size={18} className="text-sky-600" />,
            color: 'bg-sky-100',
          },
          {
            label: 'Interview Rate',
            value: `${analytics?.exitInterviewCompletionRate ?? 0}%`,
            icon: <FileText size={18} className="text-emerald-600" />,
            color: 'bg-emerald-100',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3"
          >
            <div className={`p-2 rounded-xl ${item.color} flex-shrink-0`}>{item.icon}</div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{item.value}</p>
              <p className="text-xs text-slate-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Clearances Alert */}
      {(analytics?.pendingClearanceItems ?? 0) > 0 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
          <p>
            <strong>{analytics?.pendingClearanceItems}</strong> clearance items are pending across
            active exit processes. Unresolved clearances may delay final settlement and document
            issuance.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1">
        {(
          [
            ['active', 'Active Exits'],
            ['all', 'All Exits'],
            ['analytics', 'Analytics'],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-slate-800 text-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
            {tab === 'active' && activeProcesses.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-600 text-xs rounded-full">
                {activeProcesses.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {(activeTab === 'active' || activeTab === 'all') && (
        <div className="space-y-3">
          {displayProcesses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-2" />
              <p className="text-slate-600 font-medium">No active exit processes</p>
            </div>
          ) : (
            displayProcesses.map((p) => (
              <ExitProcessCard key={p.id} process={p} onSelect={() => onProcessSelect?.(p.id)} />
            ))
          )}
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Exit Type Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <LogOut size={16} className="text-slate-500" />
              Exit Type Distribution
            </h3>
            <div className="space-y-3">
              {analytics.byExitType
                .sort((a, b) => b.count - a.count)
                .map((item) => {
                  const style = EXIT_TYPE_COLORS[item.type];
                  return (
                    <div key={item.type}>
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${style.bg} ${style.text} ${style.border}`}
                        >
                          {item.type}
                        </span>
                        <span className="text-sm font-bold text-slate-700">
                          {item.count}{' '}
                          <span className="text-slate-400 font-normal text-xs">
                            ({item.percentage}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${style.bg.replace('100', '400')}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Exit Reasons */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-slate-500" />
              Exit Reason Categories
            </h3>
            <div className="space-y-2">
              {analytics.byReasonCategory
                .sort((a, b) => b.count - a.count)
                .slice(0, 8)
                .map((item) => (
                  <div key={item.category} className="flex items-center gap-3">
                    <div className="w-28 text-xs text-slate-600 flex-shrink-0 truncate">
                      {item.category}
                    </div>
                    <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-400 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-slate-500" />
              Monthly Exit Trend
            </h3>
            <div className="space-y-3">
              {analytics.monthlyTrend.map((m) => (
                <div key={m.month} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-slate-500 flex-shrink-0">{m.month}</div>
                  <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-300 rounded-full flex items-center pl-2"
                      style={{ width: `${m.exits * 15}%`, minWidth: '32px' }}
                    >
                      <span className="text-xs text-rose-800 font-medium">{m.exits}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Users size={16} className="text-slate-500" />
              Exits by Department
            </h3>
            <div className="space-y-2">
              {analytics.byDepartment
                .sort((a, b) => b.count - a.count)
                .map((item) => (
                  <div
                    key={item.department}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                  >
                    <p className="text-sm text-slate-700">{item.department}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{item.count} exits</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Legal note */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
        <Info size={14} className="mt-0.5 flex-shrink-0" />
        <p>
          Experience and Relieving letters must be issued within 14 days of last working day per UAE
          Labour Law. GOSI deregistration required within 30 days for KSA employees. Final
          settlement (F&F) must be completed per applicable country laws.
        </p>
      </div>

      {showModal && <InitiateExitModal onClose={() => setShowModal(false)} onCreated={loadData} />}
    </div>
  );
}
