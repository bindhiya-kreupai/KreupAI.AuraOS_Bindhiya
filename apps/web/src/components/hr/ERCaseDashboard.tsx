// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  ChevronRight,
  RefreshCw,
  Lock,
  Search,
  TrendingUp,
  XCircle,
  Activity,
} from 'lucide-react';
import type {
  ERCase,
  ERCaseAnalytics,
  ERCaseType,
  ERCaseSeverity,
  ERCaseStatus,
} from '@/services/employeeRelationsService';
import { EmployeeRelationsService } from '@/services/employeeRelationsService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_COLORS: Record<ERCaseType, { bg: string; text: string; border: string }> = {
  Grievance: { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300' },
  Disciplinary: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  Harassment: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
  Discrimination: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  'Policy Violation': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  'Workplace Conflict': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
  },
  Whistleblower: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  'Performance Improvement': {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-300',
  },
};

const SEVERITY_COLORS: Record<ERCaseSeverity, { bg: string; text: string; border: string }> = {
  Low: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  Medium: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  High: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
  Critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500' },
};

const STATUS_COLORS: Record<
  ERCaseStatus,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  Open: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-300',
    icon: <Clock size={11} />,
  },
  'Under Investigation': {
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    border: 'border-sky-300',
    icon: <Activity size={11} />,
  },
  'Pending Review': {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300',
    icon: <Clock size={11} />,
  },
  Resolved: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    icon: <CheckCircle2 size={11} />,
  },
  Closed: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-300',
    icon: <CheckCircle2 size={11} />,
  },
  Escalated: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-400',
    icon: <AlertTriangle size={11} />,
  },
  Withdrawn: {
    bg: 'bg-slate-100',
    text: 'text-slate-400',
    border: 'border-slate-200',
    icon: <XCircle size={11} />,
  },
};

// ---------------------------------------------------------------------------
// New Case Modal
// ---------------------------------------------------------------------------

function NewCaseModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    type: 'Grievance' as ERCaseType,
    severity: 'Low' as ERCaseSeverity,
    title: '',
    description: '',
    complainantName: '',
    complainantDepartment: '',
    respondentName: '',
    isAnonymous: false,
    isConfidential: true,
    location: 'Dubai HQ',
    tags: '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await EmployeeRelationsService.createCase({
      ...form,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
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
          <h3 className="font-bold text-lg text-slate-800">New ER Case</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            All case information is treated as strictly confidential
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Case Type *</label>
              <select
                className={inputClass}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as ERCaseType })}
              >
                {(
                  [
                    'Grievance',
                    'Disciplinary',
                    'Harassment',
                    'Discrimination',
                    'Policy Violation',
                    'Workplace Conflict',
                    'Whistleblower',
                    'Performance Improvement',
                  ] as ERCaseType[]
                ).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Severity *</label>
              <select
                className={inputClass}
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value as ERCaseSeverity })}
              >
                {(['Low', 'Medium', 'High', 'Critical'] as ERCaseSeverity[]).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Case Title *</label>
            <input
              required
              className={inputClass}
              placeholder="Brief case summary"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              className={`${inputClass} h-24 resize-none`}
              placeholder="Describe the incident or issue..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Complainant Name
              </label>
              <input
                className={inputClass}
                placeholder={form.isAnonymous ? '[Anonymous]' : 'Employee name'}
                disabled={form.isAnonymous}
                value={form.complainantName}
                onChange={(e) => setForm({ ...form, complainantName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <input
                className={inputClass}
                placeholder="Department"
                value={form.complainantDepartment}
                onChange={(e) => setForm({ ...form, complainantDepartment: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Respondent (if known)
            </label>
            <input
              className={inputClass}
              placeholder="Name of respondent (if applicable)"
              value={form.respondentName}
              onChange={(e) => setForm({ ...form, respondentName: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isAnonymous}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isAnonymous: e.target.checked,
                    complainantName: e.target.checked ? '' : form.complainantName,
                  })
                }
                className="w-4 h-4 accent-slate-800"
              />
              <span className="text-sm text-slate-700">Anonymous complaint</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isConfidential}
                onChange={(e) => setForm({ ...form, isConfidential: e.target.checked })}
                className="w-4 h-4 accent-slate-800"
              />
              <span className="text-sm text-slate-700">Confidential</span>
            </label>
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
              {saving ? 'Creating...' : 'Create Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Case Card
// ---------------------------------------------------------------------------

function CaseCard({ erCase, onSelect }: { erCase: ERCase; onSelect: () => void }) {
  const typeStyle = TYPE_COLORS[erCase.type];
  const sevStyle = SEVERITY_COLORS[erCase.severity];
  const statusStyle = STATUS_COLORS[erCase.status];
  const hasOverdue = erCase.actionItems.some(
    (ai) => ai.status !== 'Completed' && ai.dueDate < new Date().toISOString().slice(0, 10)
  );

  return (
    <button
      onClick={onSelect}
      className="w-full flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-sm transition-all text-left"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-400">{erCase.caseNumber}</span>
          {erCase.isConfidential && <Lock size={11} className="text-slate-400" />}
          {erCase.isAnonymous && <span className="text-xs text-slate-400">(Anonymous)</span>}
          {hasOverdue && (
            <AlertTriangle size={12} className="text-amber-500" title="Overdue action items" />
          )}
        </div>
        <p className="font-semibold text-slate-800 text-sm mt-0.5 truncate">{erCase.title}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          Complainant: {erCase.complainantName} &bull; {erCase.complainantDepartment}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          Opened: {erCase.openedDate} &bull; {erCase.daysOpen} days open
          {erCase.assignedInvestigatorName &&
            ` &bull; Investigator: ${erCase.assignedInvestigatorName}`}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}
        >
          {erCase.type}
        </span>
        <span
          className={`inline-block px-2 py-1 rounded-lg border text-xs font-medium ${sevStyle.bg} ${sevStyle.text} ${sevStyle.border}`}
        >
          {erCase.severity}
        </span>
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
        >
          {statusStyle.icon}
          {erCase.status}
        </span>
        <ChevronRight size={16} className="text-slate-300" />
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ERCaseDashboard({
  onCaseSelect,
}: {
  onCaseSelect?: (caseId: string) => void;
}) {
  const [cases, setCases] = useState<ERCase[]>([]);
  const [analytics, setAnalytics] = useState<ERCaseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ERCaseType | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ERCaseStatus | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'active' | 'all' | 'analytics'>('active');
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [cs, anal] = await Promise.all([
      EmployeeRelationsService.getCases(),
      EmployeeRelationsService.getCaseAnalytics(),
    ]);
    setCases(cs);
    setAnalytics(anal);
    setLoading(false);
  }

  const activeCases = cases.filter((c) => !['Closed', 'Withdrawn'].includes(c.status));
  const filtered = (activeTab === 'active' ? activeCases : cases).filter((c) => {
    const matchType = typeFilter === 'All' || c.type === typeFilter;
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.complainantName.toLowerCase().includes(search.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Confidentiality Warning */}
      <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
        <Lock size={14} className="mt-0.5 flex-shrink-0" />
        <p>
          <strong>CONFIDENTIAL:</strong> ER case information is restricted to authorized HR
          personnel and assigned investigators. Unauthorised disclosure may violate privacy laws and
          company policy. All access is logged and audited.
        </p>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Employee Relations Cases</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {analytics?.openCases} open &bull; {analytics?.totalCases} total &bull; Avg resolution:{' '}
            {analytics?.avgResolutionDays} days
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
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            <Plus size={16} />
            New Case
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Open Cases',
            value: analytics?.openCases ?? 0,
            icon: <Clock size={18} className="text-amber-600" />,
            color: 'bg-amber-100',
          },
          {
            label: 'Escalated',
            value: analytics?.escalatedCases ?? 0,
            icon: <AlertTriangle size={18} className="text-red-600" />,
            color: 'bg-red-100',
          },
          {
            label: 'Resolved (Month)',
            value: analytics?.resolvedThisMonth ?? 0,
            icon: <CheckCircle2 size={18} className="text-emerald-600" />,
            color: 'bg-emerald-100',
          },
          {
            label: 'Overdue Actions',
            value: analytics?.overdueActionItems ?? 0,
            icon: <XCircle size={18} className="text-rose-600" />,
            color: 'bg-rose-100',
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

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1">
        {(
          [
            ['active', 'Active Cases'],
            ['all', 'All Cases'],
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
            {tab === 'active' && activeCases.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-600 text-xs rounded-full">
                {activeCases.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {(activeTab === 'active' || activeTab === 'all') && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-48 relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                placeholder="Search cases..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
            >
              <option value="All">All Types</option>
              {(
                [
                  'Grievance',
                  'Disciplinary',
                  'Harassment',
                  'Discrimination',
                  'Policy Violation',
                  'Workplace Conflict',
                  'Whistleblower',
                  'Performance Improvement',
                ] as ERCaseType[]
              ).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
            >
              <option value="All">All Status</option>
              {(
                [
                  'Open',
                  'Under Investigation',
                  'Pending Review',
                  'Resolved',
                  'Closed',
                  'Escalated',
                  'Withdrawn',
                ] as ERCaseStatus[]
              ).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
                No cases found.
              </div>
            ) : (
              filtered.map((c) => (
                <CaseCard key={c.id} erCase={c} onSelect={() => onCaseSelect?.(c.id)} />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* By Type */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Shield size={16} className="text-slate-500" />
              Cases by Type
            </h3>
            <div className="space-y-3">
              {analytics.byType
                .sort((a, b) => b.count - a.count)
                .map((item) => {
                  const style = TYPE_COLORS[item.type];
                  return (
                    <div key={item.type}>
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}
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

          {/* Monthly Trend */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-slate-500" />
              Monthly Trend
            </h3>
            <div className="space-y-3">
              {analytics.monthlyTrend.map((m) => (
                <div key={m.month} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-slate-500 flex-shrink-0">{m.month}</div>
                  <div className="flex-1 flex gap-1 items-center">
                    <div
                      className="h-5 bg-amber-200 rounded text-xs flex items-center justify-center text-amber-700 font-medium"
                      style={{ width: `${m.opened * 12}%`, minWidth: '24px' }}
                    >
                      {m.opened}
                    </div>
                    <div
                      className="h-5 bg-emerald-200 rounded text-xs flex items-center justify-center text-emerald-700 font-medium"
                      style={{ width: `${m.resolved * 12}%`, minWidth: '24px' }}
                    >
                      {m.resolved}
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex gap-4 pt-1 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-amber-200 rounded" /> Opened
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-emerald-200 rounded" /> Resolved
                </div>
              </div>
            </div>
          </div>

          {/* By Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Activity size={16} className="text-slate-500" />
              Cases by Status
            </h3>
            <div className="space-y-2">
              {analytics.byStatus.map((item) => {
                const style = STATUS_COLORS[item.status];
                return (
                  <div
                    key={item.status}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                  >
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-medium ${style.bg} ${style.text} ${style.border}`}
                    >
                      {style.icon}
                      {item.status}
                    </span>
                    <span className="text-sm font-bold text-slate-700">{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Severity breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-slate-500" />
              Cases by Severity
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {analytics.bySeverity.map((item) => {
                const style = SEVERITY_COLORS[item.severity];
                return (
                  <div
                    key={item.severity}
                    className={`p-4 rounded-xl border ${style.bg} ${style.border} text-center`}
                  >
                    <p className={`text-2xl font-bold ${style.text}`}>{item.count}</p>
                    <p className={`text-xs ${style.text}`}>{item.severity}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showNewModal && <NewCaseModal onClose={() => setShowNewModal(false)} onCreated={loadData} />}
    </div>
  );
}
