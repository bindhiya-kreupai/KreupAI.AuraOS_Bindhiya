'use client';

/**
 * @component COBRAAdministration
 * @description COBRA administration dashboard — qualifying events, active enrollments,
 *   generated notices, and compliance audit with violation tracking.
 * @project AURA HCM Platform
 * @section 18.2 — COBRA Management
 * @legal ERISA §§ 601-608; 26 U.S.C. § 4980B; 29 U.S.C. §§ 1161-1168
 *   Employer must notify plan admin within 30 days; admin must send election notice within 14 days;
 *   employee has 60 days to elect; first premium due 45 days after election.
 *   IRS excise tax penalty: up to $110/day per beneficiary for late notices.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  FileText,
  Bell,
  DollarSign,
  RefreshCw,
  Loader2,
  ChevronRight,
  BadgeAlert,
  Mail,
  Filter,
  Eye,
  Plus,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import type {
  CobraEnrollment,
  CobraQualifyingEventDetail,
  CobraNoticeRecord,
  CobraComplianceAudit,
  CobraStatus,
} from '@/services/cobraService';
import { cobraService } from '@/services/cobraService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n);
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

// ── Status Badge ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<CobraStatus, string> = {
  ELIGIBLE: 'bg-blue-100 text-blue-800 border border-blue-200',
  NOTICE_PENDING: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  NOTICE_SENT: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  ELECTED: 'bg-purple-100 text-purple-800 border border-purple-200',
  ACTIVE: 'bg-green-100 text-green-800 border border-green-200',
  GRACE_PERIOD: 'bg-orange-100 text-orange-800 border border-orange-200',
  EXPIRED: 'bg-gray-100 text-gray-700 border border-gray-200',
  DECLINED: 'bg-red-100 text-red-800 border border-red-200',
  CONVERTED: 'bg-teal-100 text-teal-800 border border-teal-200',
};

function StatusBadge({ status }: { status: CobraStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

const SEVERITY_COLORS: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${SEVERITY_COLORS[severity] ?? 'bg-gray-100 text-gray-700'}`}
    >
      {severity}
    </span>
  );
}

// ── Tab Types ──────────────────────────────────────────────────────────────────

type TabId = 'qualifying-events' | 'active-enrollments' | 'notices' | 'compliance-audit';

const TABS: { id: TabId; label: string }[] = [
  { id: 'qualifying-events', label: 'Qualifying Events' },
  { id: 'active-enrollments', label: 'Active Enrollments' },
  { id: 'notices', label: 'Notices' },
  { id: 'compliance-audit', label: 'Compliance Audit' },
];

// ── Main Component ─────────────────────────────────────────────────────────────

export default function COBRAAdministration() {
  const [activeTab, setActiveTab] = useState<TabId>('qualifying-events');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [qualifyingEvents, setQualifyingEvents] = useState<CobraQualifyingEventDetail[]>([]);
  const [enrollments, setEnrollments] = useState<CobraEnrollment[]>([]);
  const [notices, setNotices] = useState<CobraNoticeRecord[]>([]);
  const [audit, setAudit] = useState<CobraComplianceAudit | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedEnrollment, setSelectedEnrollment] = useState<CobraEnrollment | null>(null);
  const [initiatingId, setInitiatingId] = useState<string | null>(null);
  const [generatingNotice, _setGeneratingNotice] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [evts, enrs, ntcs, adt] = await Promise.all([
        cobraService.getCobraEligibleEvents(),
        cobraService.getCobraEnrollments(),
        cobraService.getCobraNotices(),
        cobraService.checkCobraCompliance(),
      ]);
      setQualifyingEvents(evts);
      setEnrollments(enrs);
      setNotices(ntcs);
      setAudit(adt);
    } catch (err) {
      console.error('COBRAAdministration load error:', err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleInitiateCOBRA = async (enrollmentId: string) => {
    setInitiatingId(enrollmentId);
    try {
      await cobraService.generateCobraNotice(enrollmentId);
      await loadData();
    } catch (err) {
      console.error('Initiate COBRA error:', err);
    } finally {
      setInitiatingId(null);
    }
  };

  const filteredEnrollments = enrollments.filter(
    (e) => statusFilter === 'ALL' || e.status === statusFilter
  );

  const activeCount = enrollments.filter((e) => e.status === 'ACTIVE').length;
  const pendingCount = enrollments.filter((e) =>
    ['ELIGIBLE', 'NOTICE_PENDING', 'NOTICE_SENT'].includes(e.status)
  ).length;
  const totalPremium = enrollments
    .filter((e) => e.status === 'ACTIVE')
    .reduce((s, e) => s + e.totalMonthlyPremium, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600 text-sm">Loading COBRA administration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">COBRA Administration</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            ERISA §§ 601-608 — Qualifying events, election notices, premium tracking, and compliance
            audit
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Active Enrollees
            </span>
            <div className="p-1.5 bg-green-100 rounded-lg">
              <Shield className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Currently on COBRA coverage</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Pending Action
            </span>
            <div className="p-1.5 bg-yellow-100 rounded-lg">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Awaiting notice or election</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Monthly Premium
            </span>
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmtCurrency(totalPremium)}</p>
          <p className="text-xs text-gray-500 mt-0.5">102% of group rate (active)</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Compliance Score
            </span>
            <div
              className={`p-1.5 rounded-lg ${(audit?.complianceScore ?? 0) >= 90 ? 'bg-green-100' : 'bg-red-100'}`}
            >
              <BarChart3
                className={`w-4 h-4 ${(audit?.complianceScore ?? 0) >= 90 ? 'text-green-600' : 'text-red-600'}`}
              />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{audit?.complianceScore ?? '—'}%</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {audit?.violations.length ?? 0} violation{audit?.violations.length !== 1 ? 's' : ''}{' '}
            detected
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 px-4 pt-4" aria-label="COBRA tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* ── Qualifying Events Tab ──────────────────────────────────────────── */}
          {activeTab === 'qualifying-events' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">
                  COBRA Qualifying Event Types
                </h3>
                <span className="text-xs text-gray-400">
                  ERISA § 603 — Defined qualifying events
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-100">
                      <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Event Type
                      </th>
                      <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Duration
                      </th>
                      <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Covers
                      </th>
                      <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Employer Notify
                      </th>
                      <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Election Period
                      </th>
                      <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {qualifyingEvents.map((ev) => {
                      const eligible = enrollments.filter(
                        (e) => e.qualifyingEvent === ev.eventType && e.status === 'ELIGIBLE'
                      );
                      return (
                        <tr key={ev.eventType} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 pr-4">
                            <p className="font-medium text-gray-900">{ev.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{ev.description}</p>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="font-semibold text-gray-800">
                              {ev.maxDurationMonths} months
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                ev.coversBeneficiary === 'BOTH'
                                  ? 'bg-purple-100 text-purple-700'
                                  : ev.coversBeneficiary === 'EMPLOYEE'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-indigo-100 text-indigo-700'
                              }`}
                            >
                              {ev.coversBeneficiary === 'BOTH'
                                ? 'Employee & Dependents'
                                : ev.coversBeneficiary.charAt(0) +
                                  ev.coversBeneficiary.slice(1).toLowerCase()}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-gray-600">{ev.employerNotifyDays} days</td>
                          <td className="py-3 pr-4 text-gray-600">{ev.electionDays} days</td>
                          <td className="py-3">
                            {eligible.length > 0 ? (
                              <button
                                onClick={() => handleInitiateCOBRA(eligible[0].id)}
                                disabled={initiatingId === eligible[0].id}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                              >
                                {initiatingId === eligible[0].id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Plus className="w-3 h-3" />
                                )}
                                Initiate COBRA ({eligible.length})
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">No pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pending Enrollments needing action */}
              {enrollments.some((e) => e.status === 'ELIGIBLE') && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-800">Action Required</p>
                      <p className="text-xs text-yellow-700 mt-0.5">
                        {enrollments.filter((e) => e.status === 'ELIGIBLE').length} employee(s) have
                        qualifying events requiring COBRA notice generation. Employer must notify
                        plan administrator within 30 days per ERISA § 606(a)(2).
                      </p>
                      <div className="mt-2 space-y-1">
                        {enrollments
                          .filter((e) => e.status === 'ELIGIBLE')
                          .map((e) => (
                            <div
                              key={e.id}
                              className="flex items-center justify-between bg-white rounded-lg p-2 border border-yellow-200"
                            >
                              <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-gray-500" />
                                <span className="text-xs font-medium text-gray-800">
                                  {e.employeeName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  • {e.qualifyingEvent.replace(/_/g, ' ')} —{' '}
                                  {fmtDate(e.qualifyingEventDate)}
                                </span>
                              </div>
                              <button
                                onClick={() => handleInitiateCOBRA(e.id)}
                                disabled={initiatingId === e.id}
                                className="text-xs px-2.5 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-60"
                              >
                                {initiatingId === e.id ? 'Sending...' : 'Send Notice'}
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Active Enrollments Tab ────────────────────────────────────────── */}
          {activeTab === 'active-enrollments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">COBRA Enrollments</h3>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ELECTED">Elected</option>
                    <option value="NOTICE_SENT">Notice Sent</option>
                    <option value="ELIGIBLE">Eligible</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="DECLINED">Declined</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-100">
                      <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Employee
                      </th>
                      <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Event
                      </th>
                      <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Election Deadline
                      </th>
                      <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Monthly Premium
                      </th>
                      <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Payment Status
                      </th>
                      <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredEnrollments.map((en) => {
                      const days = daysUntil(en.electionDeadline);
                      const latestPayment = en.payments[en.payments.length - 1];
                      return (
                        <tr key={en.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-semibold text-blue-700">
                                  {en.employeeName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{en.employeeName}</p>
                                <p className="text-xs text-gray-500">{en.department}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <p className="text-gray-700 font-medium text-xs">
                              {en.qualifyingEvent.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-gray-400">
                              {fmtDate(en.qualifyingEventDate)}
                            </p>
                          </td>
                          <td className="py-3 pr-4">
                            <StatusBadge status={en.status} />
                          </td>
                          <td className="py-3 pr-4">
                            <p className="text-gray-700">{fmtDate(en.electionDeadline)}</p>
                            {en.status !== 'ACTIVE' && en.status !== 'EXPIRED' && (
                              <p
                                className={`text-xs mt-0.5 ${days < 14 ? 'text-red-600 font-medium' : days < 30 ? 'text-orange-500' : 'text-gray-400'}`}
                              >
                                {days > 0 ? `${days} days left` : `${Math.abs(days)} days overdue`}
                              </p>
                            )}
                            {en.coverageEndDate && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                Ends {fmtDate(en.coverageEndDate)}
                              </p>
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            <p className="font-semibold text-gray-900">
                              {en.totalMonthlyPremium > 0
                                ? fmtCurrency(en.totalMonthlyPremium)
                                : '—'}
                            </p>
                            {en.totalMonthlyPremium > 0 && (
                              <p className="text-xs text-gray-400">102% group rate</p>
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            {latestPayment ? (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  latestPayment.status === 'PAID'
                                    ? 'bg-green-100 text-green-700'
                                    : latestPayment.status === 'PENDING'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : latestPayment.status === 'OVERDUE'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {latestPayment.status} — {latestPayment.period}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">No payments yet</span>
                            )}
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() =>
                                setSelectedEnrollment(selectedEnrollment?.id === en.id ? null : en)
                              }
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredEnrollments.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No enrollments match the selected filter</p>
                </div>
              )}

              {/* Enrollment Detail Panel */}
              {selectedEnrollment && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">
                      COBRA Detail — {selectedEnrollment.employeeName}
                    </h4>
                    <button
                      onClick={() => setSelectedEnrollment(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Elected Plans
                      </p>
                      {selectedEnrollment.electedPlans.length > 0 ? (
                        selectedEnrollment.electedPlans.map((plan) => (
                          <div
                            key={plan.planId}
                            className="bg-white rounded-lg border border-gray-200 p-3 mb-2"
                          >
                            <p className="text-sm font-medium text-gray-800">{plan.planName}</p>
                            <p className="text-xs text-gray-500">
                              {plan.carrier} • {plan.coverageLevel}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-500">COBRA Premium (102%)</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {fmtCurrency(plan.cobraMonthlyPremium)}/mo
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400">No plans elected yet</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Payment History
                      </p>
                      {selectedEnrollment.payments.length > 0 ? (
                        selectedEnrollment.payments.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0"
                          >
                            <div>
                              <span className="text-xs font-medium text-gray-700">{p.period}</span>
                              <span className="text-xs text-gray-400 ml-2">
                                Due {fmtDate(p.dueDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-900">
                                {fmtCurrency(p.amount)}
                              </span>
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                  p.status === 'PAID'
                                    ? 'bg-green-100 text-green-700'
                                    : p.status === 'PENDING'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {p.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400">No payments recorded</p>
                      )}
                    </div>
                  </div>
                  {selectedEnrollment.beneficiaries.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Beneficiaries
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEnrollment.beneficiaries.map((b, i) => (
                          <div
                            key={i}
                            className="bg-white rounded-lg border border-gray-200 px-3 py-1.5"
                          >
                            <p className="text-xs font-medium text-gray-800">{b.name}</p>
                            <p className="text-xs text-gray-500">{b.relationship}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Notices Tab ───────────────────────────────────────────────────── */}
          {activeTab === 'notices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Generated COBRA Notices</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {notices.length} notice{notices.length !== 1 ? 's' : ''} generated
                  </span>
                </div>
              </div>

              {notices.length > 0 ? (
                <div className="space-y-3">
                  {notices.map((n) => (
                    <div
                      key={n.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-indigo-50 rounded-lg flex-shrink-0">
                            <FileText className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {n.noticeType.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Recipient:{' '}
                              <span className="font-medium text-gray-700">{n.recipient}</span>
                              <span className="mx-1.5">•</span>
                              {n.recipientAddress}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                Sent {fmtDate(n.sentDate)}
                              </span>
                              <span
                                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                                  n.deliveryMethod === 'EMAIL'
                                    ? 'bg-blue-100 text-blue-700'
                                    : n.deliveryMethod === 'CERTIFIED_MAIL'
                                      ? 'bg-purple-100 text-purple-700'
                                      : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                <Mail className="w-3 h-3" />
                                {n.deliveryMethod.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          {n.deliveryConfirmed ? (
                            <div className="flex items-center gap-1 text-xs font-medium text-green-700">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Delivery Confirmed
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs font-medium text-orange-600">
                              <Clock className="w-3.5 h-3.5" />
                              Pending Confirmation
                            </div>
                          )}
                          {n.confirmationNumber && (
                            <p className="text-xs text-gray-400 mt-1">
                              Conf: {n.confirmationNumber}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">By: {n.generatedBy}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No notices have been generated yet</p>
                  <p className="text-xs mt-1">
                    Initiate COBRA from the Qualifying Events tab to generate notices
                  </p>
                </div>
              )}

              {/* Enrollments with pending notices */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Enrollments Requiring Notice
                </p>
                {enrollments
                  .filter(
                    (e) =>
                      e.notices.length === 0 && e.status !== 'EXPIRED' && e.status !== 'DECLINED'
                  )
                  .map((en) => (
                    <div
                      key={en.id}
                      className="flex items-center justify-between py-2 px-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-2"
                    >
                      <div className="flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-yellow-600" />
                        <span className="text-xs font-medium text-gray-800">{en.employeeName}</span>
                        <span className="text-xs text-gray-500">
                          — {en.qualifyingEvent.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <button
                        onClick={() => handleInitiateCOBRA(en.id)}
                        disabled={generatingNotice === en.id}
                        className="text-xs px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-60"
                      >
                        Generate Notice
                      </button>
                    </div>
                  ))}
                {enrollments.every(
                  (e) => e.notices.length > 0 || e.status === 'EXPIRED' || e.status === 'DECLINED'
                ) && (
                  <div className="flex items-center gap-2 py-2 text-xs text-green-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All eligible enrollments have notices generated
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Compliance Audit Tab ──────────────────────────────────────────── */}
          {activeTab === 'compliance-audit' && audit && (
            <div className="space-y-6">
              {/* Audit Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Total Eligible Events',
                    value: audit.totalEligibleEvents,
                    color: 'text-gray-900',
                  },
                  {
                    label: 'Notices On Time',
                    value: audit.noticesIssuedOnTime,
                    color: 'text-green-700',
                  },
                  { label: 'Elections Made', value: audit.electionsMade, color: 'text-blue-700' },
                  {
                    label: 'Active Enrollees',
                    value: audit.activeEnrollees,
                    color: 'text-purple-700',
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center"
                  >
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Compliance Score Bar */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Overall Compliance Score</p>
                  <span
                    className={`text-2xl font-bold ${audit.complianceScore >= 90 ? 'text-green-600' : audit.complianceScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}
                  >
                    {audit.complianceScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      audit.complianceScore >= 90
                        ? 'bg-green-500'
                        : audit.complianceScore >= 70
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${audit.complianceScore}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Audit Date: {fmtDate(audit.auditDate)}</p>
              </div>

              {/* Violations */}
              {audit.violations.length > 0 ? (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Compliance Violations ({audit.violations.length})
                  </h4>
                  <div className="space-y-3">
                    {audit.violations.map((v, i) => (
                      <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <SeverityBadge severity={v.severity} />
                              <span className="text-sm font-medium text-gray-800">
                                {v.violationType.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              Employee: <span className="font-medium">{v.employeeName}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Due: {fmtDate(v.dueDate)} —{' '}
                              <span className="text-red-600 font-medium">
                                {v.daysLate} days late
                              </span>
                            </p>
                            <p className="text-xs text-red-600 mt-1 font-medium">
                              {v.potentialPenalty}
                            </p>
                          </div>
                          <BadgeAlert
                            className={`w-5 h-5 flex-shrink-0 ml-3 ${
                              v.severity === 'CRITICAL'
                                ? 'text-red-500'
                                : v.severity === 'HIGH'
                                  ? 'text-orange-500'
                                  : 'text-yellow-500'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-800">
                    No compliance violations detected. All COBRA timelines are within required
                    deadlines.
                  </p>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Compliance Recommendations
                </h4>
                <ul className="space-y-2">
                  {audit.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-blue-700">
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
