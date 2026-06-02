// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LogOut,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Users,
  FileText,
  RefreshCw,
  Plus,
  ChevronRight,
  TrendingDown,
  X,
  MessageSquare,
} from 'lucide-react';
import type {
  ExitRecord,
  ExitAnalytics,
  ExitType,
  ExitStatus,
  ExitDetail,
  ClearanceItemStatus,
  ExitInterviewQuestion,
} from '@/services/exitManagementService';
import { ExitManagementService } from '@/services/exitManagementService';

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = 'active-exits' | 'clearance' | 'exit-interviews' | 'analytics';

interface DashboardState {
  exits: ExitRecord[];
  analytics: ExitAnalytics | null;
  loading: boolean;
  activeTab: Tab;
  selectedExit: ExitRecord | null;
  exitDetail: ExitDetail | null;
  loadingDetail: boolean;
  interviewQuestions: ExitInterviewQuestion[];
  interviewAnswers: Record<string, string>;
  interviewSubmitted: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const EXIT_TYPE_COLORS: Record<ExitType, string> = {
  Resignation: 'bg-amber-100 text-amber-700 border border-amber-200',
  Termination: 'bg-red-100 text-red-700 border border-red-200',
  Retirement: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'End of Contract': 'bg-sky-100 text-sky-700 border border-sky-200',
  'Mutual Separation': 'bg-purple-100 text-purple-700 border border-purple-200',
  Redundancy: 'bg-slate-200 text-slate-600 border border-slate-300',
  'Death in Service': 'bg-slate-300 text-slate-700 border border-slate-400',
};

const STATUS_STYLES: Record<ExitStatus, string> = {
  Initiated: 'bg-slate-100 text-slate-600',
  'Notice Period': 'bg-amber-100 text-amber-700',
  'Clearance In Progress': 'bg-sky-100 text-sky-700',
  'Exit Interview Pending': 'bg-purple-100 text-purple-700',
  'Final Settlement Pending': 'bg-orange-100 text-orange-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-slate-100 text-slate-400',
};

const CLEARANCE_ITEM_DEPTS = [
  'IT Equipment',
  'System Access',
  'Finance Advances',
  'Final Settlement',
  'ID / Access Card',
  'Exit Interview',
  'Parking / Locker',
  'NDA Signed',
  'Knowledge Transfer',
  'HR Documents',
];

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

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

// ── Active Exits Tab ───────────────────────────────────────────────────────────

function ActiveExitsTab({
  exits,
  onSelect,
}: {
  exits: ExitRecord[];
  onSelect: (e: ExitRecord) => void;
}) {
  const [typeFilter, setTypeFilter] = useState<ExitType | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ExitStatus | 'All'>('All');

  const filtered = exits.filter((e) => {
    const type = typeFilter === 'All' || e.exitType === typeFilter;
    const status = statusFilter === 'All' || e.status === statusFilter;
    return type && status;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ExitType | 'All')}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="All">All Types</option>
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ExitStatus | 'All')}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="All">All Statuses</option>
          {(
            [
              'Initiated',
              'Notice Period',
              'Clearance In Progress',
              'Exit Interview Pending',
              'Final Settlement Pending',
            ] as ExitStatus[]
          ).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((exit) => {
          const daysLeft = daysUntil(exit.lastWorkingDate);
          const isUrgent = daysLeft <= 7 && !['Completed', 'Cancelled'].includes(exit.status);
          return (
            <button
              key={exit.id}
              onClick={() => onSelect(exit)}
              className={`w-full flex flex-wrap sm:flex-nowrap items-center gap-4 p-4 rounded-xl border text-left transition-all hover:shadow-sm ${
                isUrgent
                  ? 'border-red-300 bg-red-50/50'
                  : 'bg-white border-slate-200 hover:border-slate-400'
              }`}
            >
              {/* Avatar + Name */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
                  {exit.employeeName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{exit.employeeName}</p>
                  <p className="text-xs text-slate-400">
                    {exit.designation} &bull; {exit.department}
                  </p>
                </div>
              </div>
              {/* Exit Type */}
              <span
                className={`inline-block px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${EXIT_TYPE_COLORS[exit.exitType]}`}
              >
                {exit.exitType}
              </span>
              {/* Last Working Day */}
              <div className="text-center flex-shrink-0">
                <p
                  className={`text-sm font-semibold ${daysLeft <= 7 ? 'text-red-600' : 'text-slate-700'}`}
                >
                  {daysLeft > 0 ? `${daysLeft}d` : 'Overdue'}
                </p>
                <p className="text-xs text-slate-400">Last Day</p>
              </div>
              {/* Status */}
              <span
                className={`inline-block px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${STATUS_STYLES[exit.status]}`}
              >
                {exit.status}
              </span>
              {/* Clearance */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-20 bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: `${exit.clearancePercent}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500">{exit.clearancePercent}%</span>
              </div>
              {/* F&F */}
              {exit.settlementAmount !== null ? (
                <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex-shrink-0">
                  F&F Settled
                </span>
              ) : (
                <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex-shrink-0">
                  F&F Pending
                </span>
              )}
              <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            No exits match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Clearance Tab ──────────────────────────────────────────────────────────────

function ClearanceTab({
  exits,
  _onSelect,
}: {
  exits: ExitRecord[];
  onSelect: (e: ExitRecord) => void;
}) {
  const [selected, setSelected] = useState<ExitRecord | null>(exits[0] || null);

  // Mock clearance items since we need ExitDetail
  const mockClearanceItems: Array<{
    dept: string;
    status: ClearanceItemStatus;
    mandatory: boolean;
  }> = CLEARANCE_ITEM_DEPTS.map((dept, i) => ({
    dept,
    status: i < Math.floor((selected?.clearancePercent || 0) / 10) ? 'Cleared' : 'Pending',
    mandatory: [0, 1, 2, 3, 7, 8].includes(i),
  }));

  const cleared = mockClearanceItems.filter((c) => c.status === 'Cleared').length;
  const total = mockClearanceItems.length;

  return (
    <div className="flex gap-4">
      {/* Employee List */}
      <div className="w-64 flex-shrink-0 space-y-2">
        {exits
          .filter((e) => !['Completed', 'Cancelled'].includes(e.status))
          .map((exit) => (
            <button
              key={exit.id}
              onClick={() => setSelected(exit)}
              className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${
                selected?.id === exit.id
                  ? 'border-slate-800 bg-slate-800 text-white'
                  : 'border-slate-200 bg-white hover:border-slate-400 text-slate-700'
              }`}
            >
              <p className="font-medium truncate">{exit.employeeName}</p>
              <div className="flex items-center justify-between mt-1">
                <p
                  className={`text-xs ${selected?.id === exit.id ? 'text-slate-300' : 'text-slate-400'}`}
                >
                  {exit.clearancePercent}% cleared
                </p>
                <div className="w-12 bg-slate-200 rounded-full h-1">
                  <div
                    className="bg-emerald-400 h-1 rounded-full"
                    style={{ width: `${exit.clearancePercent}%` }}
                  />
                </div>
              </div>
            </button>
          ))}
      </div>

      {/* Clearance Checklist */}
      {selected && (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">Clearance: {selected.employeeName}</h3>
              <p className="text-sm text-slate-500">
                Last Working Day: {new Date(selected.lastWorkingDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800">
                {cleared}/{total}
              </p>
              <p className="text-xs text-slate-400">items cleared</p>
            </div>
          </div>

          {/* Overall progress */}
          <div className="w-full bg-slate-100 rounded-full h-2 mb-6">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${(cleared / total) * 100}%` }}
            />
          </div>

          <div className="space-y-2">
            {mockClearanceItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.status === 'Cleared'
                      ? 'bg-emerald-500'
                      : item.status === 'Blocked'
                        ? 'bg-red-500'
                        : item.status === 'NA'
                          ? 'bg-slate-300'
                          : 'bg-slate-200 border-2 border-slate-300'
                  }`}
                >
                  {item.status === 'Cleared' && <CheckCircle2 size={12} className="text-white" />}
                  {item.status === 'Blocked' && <X size={12} className="text-white" />}
                </div>
                <span className="text-sm text-slate-700 flex-1">{item.dept}</span>
                {item.mandatory && (
                  <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                    Mandatory
                  </span>
                )}
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    item.status === 'Cleared'
                      ? 'text-emerald-700 bg-emerald-50'
                      : item.status === 'Blocked'
                        ? 'text-red-700 bg-red-50'
                        : item.status === 'NA'
                          ? 'text-slate-400 bg-slate-100'
                          : 'text-amber-700 bg-amber-50'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Exit Interviews Tab ────────────────────────────────────────────────────────

const MOCK_QUESTIONS: ExitInterviewQuestion[] = [
  {
    id: 'q1',
    category: 'Role',
    question: 'What were the primary reasons for your decision to leave?',
    type: 'text',
    required: true,
  },
  {
    id: 'q2',
    category: 'Role',
    question: 'How satisfied were you with your role and responsibilities?',
    type: 'rating',
    required: true,
  },
  {
    id: 'q3',
    category: 'Culture',
    question: 'How would you rate the company culture?',
    type: 'rating',
    required: true,
  },
  {
    id: 'q4',
    category: 'Culture',
    question: 'Did you feel valued and recognized for your contributions?',
    type: 'multiple_choice',
    options: ['Yes, always', 'Mostly yes', 'Sometimes', 'Rarely', 'No'],
    required: true,
  },
  {
    id: 'q5',
    category: 'Management',
    question: 'How would you rate your relationship with your manager?',
    type: 'rating',
    required: true,
  },
  {
    id: 'q6',
    category: 'Management',
    question: 'Did your manager support your career development?',
    type: 'multiple_choice',
    options: ['Yes, actively', 'Somewhat', 'No'],
    required: false,
  },
  {
    id: 'q7',
    category: 'Compensation',
    question: 'Was compensation and benefits a factor in your decision?',
    type: 'multiple_choice',
    options: ['Yes, major factor', 'Minor factor', 'Not a factor'],
    required: true,
  },
  {
    id: 'q8',
    category: 'Future',
    question: 'Would you consider returning to the company in the future?',
    type: 'multiple_choice',
    options: ['Yes, definitely', 'Maybe', 'No'],
    required: false,
  },
  {
    id: 'q9',
    category: 'Feedback',
    question: 'What suggestions do you have for improving the workplace?',
    type: 'text',
    required: false,
  },
];

function ExitInterviewsTab({ exits }: { exits: ExitRecord[] }) {
  const [selected, setSelected] = useState<ExitRecord | null>(
    exits.find((e) => !e.exitInterviewDone) || exits[0] || null
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const pendingInterviews = exits.filter(
    (e) => !e.exitInterviewDone && !['Completed', 'Cancelled'].includes(e.status)
  );

  return (
    <div className="space-y-5">
      {/* Pending Interviews */}
      <div className="flex gap-2 flex-wrap">
        {pendingInterviews.map((exit) => (
          <button
            key={exit.id}
            onClick={() => {
              setSelected(exit);
              setAnswers({});
              setSubmitted(false);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
              selected?.id === exit.id
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
            }`}
          >
            <MessageSquare size={14} />
            {exit.employeeName}
          </button>
        ))}
        {pendingInterviews.length === 0 && (
          <p className="text-sm text-slate-400">All exit interviews are completed.</p>
        )}
      </div>

      {selected && !submitted && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="mb-5">
            <h3 className="font-semibold text-slate-800">
              Exit Interview: {selected.employeeName}
            </h3>
            <p className="text-sm text-slate-500">
              {selected.designation} &bull; Leaving:{' '}
              {new Date(selected.lastWorkingDate).toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-5">
            {Object.entries(
              MOCK_QUESTIONS.reduce(
                (acc, q) => {
                  if (!acc[q.category]) acc[q.category] = [];
                  acc[q.category].push(q);
                  return acc;
                },
                {} as Record<string, ExitInterviewQuestion[]>
              )
            ).map(([category, questions]) => (
              <div key={category}>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  {category}
                </h4>
                <div className="space-y-4">
                  {questions.map((q) => (
                    <div key={q.id}>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {q.question}
                        {q.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {q.type === 'text' && (
                        <textarea
                          value={answers[q.id] || ''}
                          onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                          rows={2}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 resize-none"
                          placeholder="Your response..."
                        />
                      )}
                      {q.type === 'rating' && (
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setAnswers((a) => ({ ...a, [q.id]: String(n) }))}
                              className={`w-9 h-9 rounded-lg border text-sm font-medium transition-colors ${
                                answers[q.id] === String(n)
                                  ? 'bg-slate-800 text-white border-slate-800'
                                  : 'border-slate-200 text-slate-600 hover:border-slate-400'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                          <span className="text-xs text-slate-400 self-center ml-1">
                            1=Poor, 5=Excellent
                          </span>
                        </div>
                      )}
                      {q.type === 'multiple_choice' && q.options && (
                        <div className="flex flex-wrap gap-2">
                          {q.options.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                                answers[q.id] === opt
                                  ? 'bg-slate-800 text-white border-slate-800'
                                  : 'border-slate-200 text-slate-600 hover:border-slate-400'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setSubmitted(true)}
              className="px-6 py-2.5 bg-slate-800 text-white text-sm rounded-xl hover:bg-slate-700"
            >
              Submit Interview
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
          <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">Interview Submitted</h3>
          <p className="text-sm text-slate-500 mt-1">
            Exit interview responses recorded successfully.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Analytics Tab ──────────────────────────────────────────────────────────────

function AnalyticsTab({
  analytics,
  exits,
}: {
  analytics: ExitAnalytics | null;
  exits: ExitRecord[];
}) {
  if (!analytics) return <div className="text-center py-12 text-slate-400">No analytics data.</div>;

  const regrettable = Math.round(exits.length * 0.35);
  const nonRegrettable = exits.length - regrettable;

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<TrendingDown size={18} className="text-red-600" />}
          label="Total Exits"
          value={analytics.totalExits}
          color="bg-red-100"
        />
        <StatCard
          icon={<Users size={18} className="text-amber-600" />}
          label="Avg Tenure at Exit"
          value={`${analytics.avgTenureYears.toFixed(1)}y`}
          color="bg-amber-100"
        />
        <StatCard
          icon={<Clock size={18} className="text-sky-600" />}
          label="Voluntary Rate"
          value={`${analytics.voluntaryRate.toFixed(1)}%`}
          color="bg-sky-100"
        />
        <StatCard
          icon={<BarChart3 size={18} className="text-purple-600" />}
          label="Involuntary Rate"
          value={`${analytics.involuntaryRate.toFixed(1)}%`}
          color="bg-purple-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Exit Reasons */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Top Exit Reasons</h3>
          <div className="space-y-3">
            {analytics.byReason.slice(0, 6).map(({ reason, count, percent }) => (
              <div key={reason} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-40 flex-shrink-0 truncate">{reason}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div className="bg-slate-700 h-2 rounded-full" style={{ width: `${percent}%` }} />
                </div>
                <span className="text-xs text-slate-500 w-16 text-right">
                  {count} ({percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Comparison */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">By Department</h3>
          <div className="space-y-3">
            {analytics.byDepartment.slice(0, 6).map(({ department, count, rate }) => (
              <div key={department} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-32 flex-shrink-0 truncate">
                  {department}
                </span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${rate > 20 ? 'bg-red-500' : rate > 10 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(rate * 3, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-20 text-right">
                  {count} ({rate.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tenure at Exit */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Tenure at Exit Distribution</h3>
          <div className="space-y-3">
            {analytics.byTenure.map(({ range, count, percent }) => (
              <div key={range} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-28 flex-shrink-0">{range}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${percent}%` }} />
                </div>
                <span className="text-xs text-slate-500 w-16 text-right">
                  {count} ({percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Regrettable vs Non-Regrettable */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">
            Regrettable vs Non-Regrettable Attrition
          </h3>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-700">{regrettable}</p>
              <p className="text-sm text-red-600 mt-1">Regrettable</p>
              <p className="text-xs text-red-400">
                {Math.round((regrettable / exits.length) * 100)}%
              </p>
            </div>
            <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">{nonRegrettable}</p>
              <p className="text-sm text-emerald-600 mt-1">Non-Regrettable</p>
              <p className="text-xs text-emerald-400">
                {Math.round((nonRegrettable / exits.length) * 100)}%
              </p>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div
              className="bg-red-500 h-3 rounded-l-full"
              style={{ width: `${Math.round((regrettable / exits.length) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Regrettable ({Math.round((regrettable / exits.length) * 100)}%)</span>
            <span>Non-Regrettable ({Math.round((nonRegrettable / exits.length) * 100)}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ExitManagementDashboard() {
  const [state, setState] = useState<DashboardState>({
    exits: [],
    analytics: null,
    loading: true,
    activeTab: 'active-exits',
    selectedExit: null,
    exitDetail: null,
    loadingDetail: false,
    interviewQuestions: MOCK_QUESTIONS,
    interviewAnswers: {},
    interviewSubmitted: false,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const [exitsResult, analytics] = await Promise.all([
        ExitManagementService.getExits(),
        ExitManagementService.getAnalytics(),
      ]);
      setState((s) => ({
        ...s,
        exits: exitsResult.exits || exitsResult,
        analytics,
        loading: false,
      }));
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { exits, analytics, loading, activeTab } = state;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'active-exits', label: 'Active Exits' },
    { id: 'clearance', label: 'Clearance' },
    { id: 'exit-interviews', label: 'Exit Interviews' },
    { id: 'analytics', label: 'Analytics' },
  ];

  const activeExitsCount = exits.filter(
    (e) => !['Completed', 'Cancelled'].includes(e.status)
  ).length;
  const pendingInterviewsCount = exits.filter(
    (e) => !e.exitInterviewDone && !['Completed', 'Cancelled'].includes(e.status)
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-slate-400" />
        <span className="ml-3 text-slate-500">Loading exit data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Exit Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Separation lifecycle, clearance, and exit interviews
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
          <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700">
            <Plus size={14} />
            Initiate Exit
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<LogOut size={18} className="text-red-600" />}
          label="Active Exits"
          value={activeExitsCount}
          sub="in progress"
          color="bg-red-100"
        />
        <StatCard
          icon={<AlertTriangle size={18} className="text-amber-600" />}
          label="Interviews Pending"
          value={pendingInterviewsCount}
          color="bg-amber-100"
        />
        <StatCard
          icon={<CheckCircle2 size={18} className="text-emerald-600" />}
          label="Completed"
          value={exits.filter((e) => e.status === 'Completed').length}
          color="bg-emerald-100"
        />
        <StatCard
          icon={<FileText size={18} className="text-sky-600" />}
          label="F&F Pending"
          value={
            exits.filter(
              (e) => e.settlementAmount === null && !['Completed', 'Cancelled'].includes(e.status)
            ).length
          }
          color="bg-sky-100"
        />
      </div>

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
        {activeTab === 'active-exits' && (
          <ActiveExitsTab
            exits={exits}
            onSelect={(e) => setState((s) => ({ ...s, selectedExit: e }))}
          />
        )}
        {activeTab === 'clearance' && (
          <ClearanceTab
            exits={exits}
            onSelect={(e) => setState((s) => ({ ...s, selectedExit: e }))}
          />
        )}
        {activeTab === 'exit-interviews' && <ExitInterviewsTab exits={exits} />}
        {activeTab === 'analytics' && <AnalyticsTab analytics={analytics} exits={exits} />}
      </div>
    </div>
  );
}
