// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  RefreshCw,
  ChevronRight,
  FileText,
  TrendingUp,
  X,
} from 'lucide-react';
import type {
  ERCase,
  ERCaseAnalytics,
  ERCaseType,
  ERCaseSeverity,
  ERCaseStatus,
  DisciplinaryAction,
} from '@/services/employeeRelationsService';
import { EmployeeRelationsService } from '@/services/employeeRelationsService';

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = 'active-cases' | 'new-case' | 'analytics' | 'disciplinary';

interface DashboardState {
  cases: ERCase[];
  analytics: ERCaseAnalytics | null;
  disciplinaryActions: DisciplinaryAction[];
  loading: boolean;
  activeTab: Tab;
  selectedCase: ERCase | null;
  showDetailPanel: boolean;
}

interface NewCaseForm {
  type: ERCaseType;
  severity: ERCaseSeverity;
  title: string;
  description: string;
  complainantId: string;
  respondentId: string;
  assignedInvestigatorId: string;
  isConfidential: boolean;
  isAnonymous: boolean;
  location: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<ERCaseSeverity, string> = {
  Low: 'bg-slate-100 text-slate-600 border border-slate-200',
  Medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  High: 'bg-orange-100 text-orange-700 border border-orange-200',
  Critical: 'bg-red-100 text-red-700 border border-red-200',
};

const STATUS_STYLES: Record<ERCaseStatus, string> = {
  Open: 'bg-sky-100 text-sky-700',
  'Under Investigation': 'bg-purple-100 text-purple-700',
  'Pending Review': 'bg-amber-100 text-amber-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
  Closed: 'bg-slate-100 text-slate-500',
  Escalated: 'bg-red-100 text-red-700',
  Withdrawn: 'bg-slate-100 text-slate-400',
};

const CASE_TYPES: ERCaseType[] = [
  'Grievance',
  'Disciplinary',
  'Harassment',
  'Discrimination',
  'Policy Violation',
  'Workplace Conflict',
  'Whistleblower',
  'Performance Improvement',
];

// ── Sub Components ─────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Case Detail Slide-out ──────────────────────────────────────────────────────

function CaseDetailPanel({ erCase, onClose }: { erCase: ERCase; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">{erCase.caseNumber}</h3>
            <p className="text-sm text-slate-500">{erCase.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Type</p>
              <p className="font-medium text-slate-700">{erCase.type}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Severity</p>
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_STYLES[erCase.severity]}`}
              >
                {erCase.severity}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Status</p>
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[erCase.status]}`}
              >
                {erCase.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Days Open</p>
              <p className="font-medium text-slate-700">{erCase.daysOpen} days</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Complainant</p>
              <p className="font-medium text-slate-700">
                {erCase.isAnonymous ? 'Anonymous' : erCase.complainantName}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Investigator</p>
              <p className="font-medium text-slate-700">
                {erCase.assignedInvestigatorName || 'Unassigned'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">Description</p>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">
              {erCase.description}
            </p>
          </div>

          {/* Timeline */}
          {erCase.timeline && erCase.timeline.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-3">Timeline</p>
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-100" />
                <div className="space-y-3">
                  {erCase.timeline.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex gap-3 pl-8 relative">
                      <div className="absolute left-1.5 w-3 h-3 rounded-full bg-slate-300 border-2 border-white mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">{event.eventType}</p>
                        <p className="text-xs text-slate-500">{event.description}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(event.timestamp).toLocaleString()} — {event.performedBy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          {erCase.documents && erCase.documents.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">
                Documents ({erCase.documents.length})
              </p>
              <div className="space-y-1">
                {erCase.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <FileText size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-700 flex-1">{doc.name}</span>
                    <span className="text-xs text-slate-400">{doc.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Items */}
          {erCase.actionItems && erCase.actionItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">Action Items</p>
              <div className="space-y-2">
                {erCase.actionItems.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        action.status === 'Completed'
                          ? 'bg-emerald-500'
                          : action.status === 'In Progress'
                            ? 'bg-sky-500'
                            : action.status === 'Overdue'
                              ? 'bg-red-500'
                              : 'bg-slate-300'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{action.title}</p>
                      <p className="text-xs text-slate-400">
                        {action.assignedToName} — Due{' '}
                        {new Date(action.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        action.status === 'Completed'
                          ? 'text-emerald-700 bg-emerald-50'
                          : action.status === 'Overdue'
                            ? 'text-red-700 bg-red-50'
                            : 'text-slate-500 bg-slate-100'
                      }`}
                    >
                      {action.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution */}
          {erCase.resolution && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-xs font-semibold text-emerald-700 mb-2">Resolution</p>
              <p className="text-sm text-slate-700 mb-1">{erCase.resolution.findings}</p>
              <p className="text-xs text-emerald-600">Outcome: {erCase.resolution.outcomeType}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Active Cases Tab ───────────────────────────────────────────────────────────

function ActiveCasesTab({
  cases,
  onSelectCase,
}: {
  cases: ERCase[];
  onSelectCase: (c: ERCase) => void;
}) {
  const [severityFilter, setSeverityFilter] = useState<ERCaseSeverity | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ERCaseStatus | 'All'>('All');

  const filtered = cases.filter((c) => {
    const sev = severityFilter === 'All' || c.severity === severityFilter;
    const stat = statusFilter === 'All' || c.status === statusFilter;
    return sev && stat;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as ERCaseSeverity | 'All')}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="All">All Severities</option>
          {(['Low', 'Medium', 'High', 'Critical'] as ERCaseSeverity[]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ERCaseStatus | 'All')}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="All">All Statuses</option>
          {(['Open', 'Under Investigation', 'Pending Review', 'Escalated'] as ERCaseStatus[]).map(
            (s) => (
              <option key={s} value={s}>
                {s}
              </option>
            )
          )}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left p-4 font-semibold text-slate-600">Case #</th>
              <th className="text-left p-4 font-semibold text-slate-600">Category</th>
              <th className="text-left p-4 font-semibold text-slate-600">Severity</th>
              <th className="text-left p-4 font-semibold text-slate-600">Complainant</th>
              <th className="text-left p-4 font-semibold text-slate-600">Investigator</th>
              <th className="text-left p-4 font-semibold text-slate-600">Status</th>
              <th className="text-right p-4 font-semibold text-slate-600">Days Open</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((erCase) => (
              <tr
                key={erCase.id}
                className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => onSelectCase(erCase)}
              >
                <td className="p-4">
                  <p className="font-mono text-sm font-medium text-slate-700">
                    {erCase.caseNumber}
                  </p>
                  <p className="text-xs text-slate-400 truncate max-w-[140px]">{erCase.title}</p>
                </td>
                <td className="p-4 text-slate-600">{erCase.type}</td>
                <td className="p-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_STYLES[erCase.severity]}`}
                  >
                    {erCase.severity}
                  </span>
                </td>
                <td className="p-4 text-slate-600">
                  {erCase.isAnonymous ? (
                    <span className="text-slate-400 italic">Anonymous</span>
                  ) : (
                    erCase.complainantName
                  )}
                </td>
                <td className="p-4 text-slate-600">
                  {erCase.assignedInvestigatorName || (
                    <span className="text-amber-600">Unassigned</span>
                  )}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${STATUS_STYLES[erCase.status]}`}
                  >
                    {erCase.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <span
                    className={`font-medium ${erCase.daysOpen > 30 ? 'text-red-600' : erCase.daysOpen > 14 ? 'text-amber-600' : 'text-slate-600'}`}
                  >
                    {erCase.daysOpen}
                  </span>
                </td>
                <td className="p-4">
                  <ChevronRight size={16} className="text-slate-300" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400">No cases found.</div>
        )}
      </div>
    </div>
  );
}

// ── New Case Tab ───────────────────────────────────────────────────────────────

function NewCaseTab({ onSubmit }: { onSubmit: (form: NewCaseForm) => Promise<void> }) {
  const [form, setForm] = useState<NewCaseForm>({
    type: 'Grievance',
    severity: 'Medium',
    title: '',
    description: '',
    complainantId: '',
    respondentId: '',
    assignedInvestigatorId: '',
    isConfidential: true,
    isAnonymous: false,
    location: '',
  });
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof NewCaseForm, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSubmit(form);
    setSaving(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
        <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
        <h3 className="text-lg font-semibold text-slate-800">Case Submitted</h3>
        <p className="text-sm text-slate-500 mt-1">
          A case number will be assigned and investigator notified.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-slate-200 p-6 space-y-5"
    >
      <h3 className="font-semibold text-slate-800">New ER Case Intake</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Case Category *</label>
          <select
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
          >
            {CASE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Severity</label>
          <select
            value={form.severity}
            onChange={(e) => update('severity', e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
          >
            {(['Low', 'Medium', 'High', 'Critical'] as ERCaseSeverity[]).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Case Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
            placeholder="Brief description of the issue"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={4}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 resize-none"
            placeholder="Describe the incident in detail..."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Complainant ID</label>
          <input
            type="text"
            value={form.complainantId}
            onChange={(e) => update('complainantId', e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
            placeholder="Employee ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Respondent ID</label>
          <input
            type="text"
            value={form.respondentId}
            onChange={(e) => update('respondentId', e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
            placeholder="Employee ID (if applicable)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Assigned Investigator
          </label>
          <input
            type="text"
            value={form.assignedInvestigatorId}
            onChange={(e) => update('assignedInvestigatorId', e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
            placeholder="HR User ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
            placeholder="Office / remote"
          />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isConfidential}
            onChange={(e) => update('isConfidential', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-slate-700">Mark as Confidential</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isAnonymous}
            onChange={(e) => update('isAnonymous', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-slate-700">Anonymous Complaint</span>
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-slate-800 text-white text-sm rounded-xl hover:bg-slate-700 disabled:opacity-50"
        >
          {saving ? 'Submitting...' : 'Submit Case'}
        </button>
      </div>
    </form>
  );
}

// ── Case Analytics Tab ─────────────────────────────────────────────────────────

function CaseAnalyticsTab({ analytics }: { analytics: ERCaseAnalytics | null }) {
  if (!analytics)
    return <div className="text-center py-12 text-slate-400">No analytics data available.</div>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ShieldAlert size={18} className="text-red-600" />}
          label="Open Cases"
          value={analytics.openCases}
          color="bg-red-100"
        />
        <StatCard
          icon={<Clock size={18} className="text-amber-600" />}
          label="Avg Resolution"
          value={`${analytics.avgResolutionDays}d`}
          sub="days to close"
          color="bg-amber-100"
        />
        <StatCard
          icon={<AlertTriangle size={18} className="text-orange-600" />}
          label="Overdue Actions"
          value={analytics.overdueActionItems}
          color="bg-orange-100"
        />
        <StatCard
          icon={<TrendingUp size={18} className="text-purple-600" />}
          label="Escalated"
          value={analytics.escalatedCases}
          color="bg-purple-100"
        />
      </div>

      {/* By Type */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Cases by Category</h3>
        <div className="space-y-3">
          {analytics.byType.map(({ type, count, percentage }) => (
            <div key={type} className="flex items-center gap-3">
              <div className="w-36 text-sm text-slate-600 flex-shrink-0">{type}</div>
              <div className="flex-1 bg-slate-100 rounded-full h-2">
                <div
                  className="bg-slate-700 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="text-sm text-slate-600 w-16 text-right">
                {count} ({percentage}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Monthly Trend</h3>
        <div className="space-y-2">
          {analytics.monthlyTrend.map(({ month, opened, resolved }) => (
            <div key={month} className="flex items-center gap-3 text-sm">
              <span className="w-20 text-slate-500 flex-shrink-0">{month}</span>
              <div className="flex-1 flex gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-sky-400 rounded-sm flex-shrink-0" />
                  <span className="text-slate-600">Opened: {opened}</span>
                </div>
                <div className="flex items-center gap-1.5 ml-4">
                  <div className="w-3 h-3 bg-emerald-400 rounded-sm flex-shrink-0" />
                  <span className="text-slate-600">Resolved: {resolved}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By Severity */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-3">Cases by Severity</h3>
        <div className="flex flex-wrap gap-3">
          {analytics.bySeverity.map(({ severity, count }) => (
            <div
              key={severity}
              className={`rounded-xl p-4 flex-1 min-w-[100px] text-center ${SEVERITY_STYLES[severity as ERCaseSeverity]}`}
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs font-medium mt-1">{severity}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Disciplinary Actions Tab ───────────────────────────────────────────────────

function DisciplinaryActionsTab({ actions }: { actions: DisciplinaryAction[] }) {
  const ACTION_COLORS: Record<string, string> = {
    'Verbal Warning': 'bg-sky-100 text-sky-700',
    'Written Warning': 'bg-amber-100 text-amber-700',
    PIP: 'bg-orange-100 text-orange-700',
    Suspension: 'bg-red-100 text-red-700',
    Termination: 'bg-red-200 text-red-800',
    'Final Warning': 'bg-orange-200 text-orange-800',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left p-4 font-semibold text-slate-600">Employee</th>
            <th className="text-left p-4 font-semibold text-slate-600">Action Type</th>
            <th className="text-left p-4 font-semibold text-slate-600">Issued By</th>
            <th className="text-left p-4 font-semibold text-slate-600">Date</th>
            <th className="text-left p-4 font-semibold text-slate-600">Status</th>
            <th className="text-left p-4 font-semibold text-slate-600">Related Case</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action) => (
            <tr key={action.id} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="p-4">
                <p className="font-medium text-slate-800">{action.employeeName}</p>
                <p className="text-xs text-slate-400">{action.department}</p>
              </td>
              <td className="p-4">
                <span
                  className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${ACTION_COLORS[action.actionType] || 'bg-slate-100 text-slate-600'}`}
                >
                  {action.actionType}
                </span>
              </td>
              <td className="p-4 text-slate-600">{action.issuedBy}</td>
              <td className="p-4 text-slate-600">
                {new Date(action.issuedDate).toLocaleDateString()}
              </td>
              <td className="p-4">
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    action.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : action.status === 'Appealed'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {action.status}
                </span>
              </td>
              <td className="p-4">
                {action.relatedCaseId ? (
                  <span className="font-mono text-xs text-sky-600">{action.relatedCaseId}</span>
                ) : (
                  <span className="text-slate-400 text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {actions.length === 0 && (
        <div className="text-center py-10 text-slate-400">No disciplinary actions found.</div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function EmployeeRelationsDashboard() {
  const [state, setState] = useState<DashboardState>({
    cases: [],
    analytics: null,
    disciplinaryActions: [],
    loading: true,
    activeTab: 'active-cases',
    selectedCase: null,
    showDetailPanel: false,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const [cases, analytics, disciplinary] = await Promise.all([
        EmployeeRelationsService.getCases(),
        EmployeeRelationsService.getCaseAnalytics(),
        EmployeeRelationsService.getDisciplinaryActions
          ? EmployeeRelationsService.getDisciplinaryActions()
          : Promise.resolve([]),
      ]);
      setState((s) => ({
        ...s,
        cases: cases.cases || cases,
        analytics,
        disciplinaryActions: disciplinary,
        loading: false,
      }));
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const {
    cases,
    analytics,
    disciplinaryActions,
    loading,
    activeTab,
    selectedCase,
    showDetailPanel,
  } = state;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'active-cases', label: 'Active Cases' },
    { id: 'new-case', label: 'New Case' },
    { id: 'analytics', label: 'Case Analytics' },
    { id: 'disciplinary', label: 'Disciplinary Actions' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-slate-400" />
        <span className="ml-3 text-slate-500">Loading ER cases...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employee Relations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Case management, investigations, and disciplinary actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={() => setState((s) => ({ ...s, activeTab: 'new-case' }))}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700"
          >
            <Plus size={14} />
            New Case
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<ShieldAlert size={18} className="text-red-600" />}
            label="Total Cases"
            value={analytics.totalCases}
            color="bg-red-100"
          />
          <StatCard
            icon={<AlertTriangle size={18} className="text-amber-600" />}
            label="Open Cases"
            value={analytics.openCases}
            color="bg-amber-100"
          />
          <StatCard
            icon={<Clock size={18} className="text-sky-600" />}
            label="Avg Resolution"
            value={`${analytics.avgResolutionDays} days`}
            color="bg-sky-100"
          />
          <StatCard
            icon={<CheckCircle2 size={18} className="text-emerald-600" />}
            label="Resolved This Month"
            value={analytics.resolvedThisMonth}
            color="bg-emerald-100"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setState((s) => ({ ...s, activeTab: tab.id }))}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'active-cases' && (
          <ActiveCasesTab
            cases={cases}
            onSelectCase={(c) =>
              setState((s) => ({ ...s, selectedCase: c, showDetailPanel: true }))
            }
          />
        )}
        {activeTab === 'new-case' && (
          <NewCaseTab
            onSubmit={async (form) => {
              await EmployeeRelationsService.createCase(form);
              await load();
              setState((s) => ({ ...s, activeTab: 'active-cases' }));
            }}
          />
        )}
        {activeTab === 'analytics' && <CaseAnalyticsTab analytics={analytics} />}
        {activeTab === 'disciplinary' && <DisciplinaryActionsTab actions={disciplinaryActions} />}
      </div>

      {/* Detail Panel */}
      {showDetailPanel && selectedCase && (
        <CaseDetailPanel
          erCase={selectedCase}
          onClose={() => setState((s) => ({ ...s, showDetailPanel: false, selectedCase: null }))}
        />
      )}
    </div>
  );
}
