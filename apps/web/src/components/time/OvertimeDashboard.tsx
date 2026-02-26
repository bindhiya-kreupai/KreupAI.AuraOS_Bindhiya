'use client';

/**
 * @component OvertimeDashboard
 * @description Comprehensive overtime management dashboard covering jurisdiction-specific
 *   OT policies (FLSA, California, UAE, KSA, India, EU), pre-approval workflows,
 *   OT forecasting with driver analysis, budget vs actual tracking, and detailed
 *   department-level reporting with per-employee breakdowns and compliance flags.
 *
 * @project AURA HCM Platform
 * @section 12.2 — Overtime Management
 *
 * @legal
 *  FLSA (US): 29 U.S.C. § 207 — 1.5x after 40 hours/week
 *  California: Cal. Lab. Code § 510 — daily and weekly OT thresholds
 *  UAE: Federal Decree-Law No. 33/2021, Art. 19 — 25%/50% premiums
 *  KSA: Saudi Labour Law Art. 107 — 50% premium for OT hours
 *  India: Factories Act 1948 § 59 — 2x rate for OT hours
 *  EU: Directive 2003/88/EC — 48h max average working week
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  BarChart2,
  Loader2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Calendar,
  Globe,
  ShieldCheck,
  Minus,
} from 'lucide-react';
import type {
  OvertimePolicy,
  OvertimeApprovalRequest,
  OvertimeForecast,
  OvertimeBudget,
  OvertimeReport,
  OTJurisdiction,
  OTApprovalStatus,
} from '@/services/overtimeService';
import { overtimeService } from '@/services/overtimeService';

// ── Tab definition ─────────────────────────────────────────────────────────────

type TabId = 'policy' | 'approvals' | 'forecast' | 'budget' | 'reports';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'policy', label: 'Policy', icon: <Globe className="w-4 h-4" /> },
  { id: 'approvals', label: 'Approvals', icon: <CheckCircle className="w-4 h-4" /> },
  { id: 'forecast', label: 'Forecast', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'budget', label: 'Budget', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'reports', label: 'Reports', icon: <BarChart2 className="w-4 h-4" /> },
];

// ── Jurisdiction options ────────────────────────────────────────────────────────

const JURISDICTION_OPTIONS: { value: OTJurisdiction; label: string }[] = [
  { value: 'FLSA_FEDERAL', label: 'US Federal FLSA' },
  { value: 'CA', label: 'California' },
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
  { value: 'EU_GENERAL', label: 'EU (General)' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'UAE', label: 'UAE' },
  { value: 'KSA', label: 'Saudi Arabia' },
  { value: 'INDIA', label: 'India' },
  { value: 'AUSTRALIA', label: 'Australia' },
];

// ── Status style maps ──────────────────────────────────────────────────────────

const APPROVAL_STATUS_STYLES: Record<OTApprovalStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  APPROVED: 'bg-green-100 text-green-800 border border-green-200',
  DENIED: 'bg-red-100 text-red-800 border border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border border-gray-200',
  EXPIRED: 'bg-orange-100 text-orange-700 border border-orange-200',
  PROCESSED: 'bg-blue-100 text-blue-800 border border-blue-200',
};

const ALERT_LEVEL_STYLES: Record<string, { card: string; icon: React.ReactNode; label: string }> = {
  GREEN: {
    card: 'border-green-200 bg-green-50',
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    label: 'On Track',
  },
  YELLOW: {
    card: 'border-yellow-200 bg-yellow-50',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    label: 'Caution',
  },
  RED: {
    card: 'border-red-200 bg-red-50',
    icon: <AlertCircle className="w-5 h-5 text-red-600" />,
    label: 'Over Budget',
  },
};

const DRIVER_IMPACT_STYLES: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700 border border-red-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  LOW: 'bg-blue-100 text-blue-700 border border-blue-200',
};

const RISK_STYLES: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700 border border-red-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  LOW: 'bg-green-100 text-green-700 border border-green-200',
};

// ── Helper ─────────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDec(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ApprovalStatusBadge({ status }: { status: OTApprovalStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${APPROVAL_STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

function TrendBadge({ value, suffix = '' }: { value: number; suffix?: string }) {
  if (value === 0)
    return (
      <span className="inline-flex items-center gap-1 text-gray-500 text-xs font-medium">
        <Minus className="w-3 h-3" />0{suffix}
      </span>
    );
  if (value > 0)
    return (
      <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
        <TrendingUp className="w-3 h-3" />+{value}
        {suffix}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
      <TrendingDown className="w-3 h-3" />
      {value}
      {suffix}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function OvertimeDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('policy');

  // Policy tab state
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<OTJurisdiction>('FLSA_FEDERAL');
  const [policy, setPolicy] = useState<OvertimePolicy | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);

  // Approvals tab state
  const [approvals, setApprovals] = useState<OvertimeApprovalRequest[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState(false);
  const [approvalsLoaded, setApprovalsLoaded] = useState(false);
  const [filterStatus, setFilterStatus] = useState<OTApprovalStatus | 'ALL'>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  // Forecast tab state
  const [forecast, setForecast] = useState<OvertimeForecast | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastLoaded, setForecastLoaded] = useState(false);

  // Budget tab state
  const [budget, setBudget] = useState<OvertimeBudget | null>(null);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetLoaded, setBudgetLoaded] = useState(false);

  // Reports tab state
  const [report, setReport] = useState<OvertimeReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportLoaded, setReportLoaded] = useState(false);

  // ── Load policy whenever jurisdiction changes ────────────────────────────────

  const loadPolicy = useCallback(async (jurisdiction: OTJurisdiction) => {
    setPolicyLoading(true);
    try {
      const data = await overtimeService.getOvertimePolicy(jurisdiction);
      setPolicy(data);
    } finally {
      setPolicyLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPolicy(selectedJurisdiction);
  }, [selectedJurisdiction, loadPolicy]);

  // ── Lazy-load per tab ────────────────────────────────────────────────────────

  const loadApprovals = useCallback(async () => {
    if (approvalsLoaded) return;
    setApprovalsLoading(true);
    try {
      const data = await overtimeService.getOvertimeApprovals('admin');
      setApprovals(data);
      setApprovalsLoaded(true);
    } finally {
      setApprovalsLoading(false);
    }
  }, [approvalsLoaded]);

  const loadForecast = useCallback(async () => {
    if (forecastLoaded) return;
    setForecastLoading(true);
    try {
      const data = await overtimeService.getOvertimeForecast('dept-eng');
      setForecast(data);
      setForecastLoaded(true);
    } finally {
      setForecastLoading(false);
    }
  }, [forecastLoaded]);

  const loadBudget = useCallback(async () => {
    if (budgetLoaded) return;
    setBudgetLoading(true);
    try {
      const data = await overtimeService.getOvertimeBudget('dept-eng');
      setBudget(data);
      setBudgetLoaded(true);
    } finally {
      setBudgetLoading(false);
    }
  }, [budgetLoaded]);

  const loadReport = useCallback(async () => {
    if (reportLoaded) return;
    setReportLoading(true);
    try {
      const data = await overtimeService.getOvertimeReport('dept-eng', '2026-02');
      setReport(data);
      setReportLoaded(true);
    } finally {
      setReportLoading(false);
    }
  }, [reportLoaded]);

  useEffect(() => {
    if (activeTab === 'approvals') loadApprovals();
    if (activeTab === 'forecast') loadForecast();
    if (activeTab === 'budget') loadBudget();
    if (activeTab === 'reports') loadReport();
  }, [activeTab, loadApprovals, loadForecast, loadBudget, loadReport]);

  // ── Action handlers ──────────────────────────────────────────────────────────

  const handleApprove = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const updated = await overtimeService.approveOvertime(requestId, { approved: true });
      setApprovals((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeny = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const updated = await overtimeService.approveOvertime(requestId, {
        approved: false,
        reason: 'Denied by manager — insufficient justification or staffing available',
      });
      setApprovals((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
    } finally {
      setActionLoading(null);
    }
  };

  // ── Filtered approvals ───────────────────────────────────────────────────────

  const filteredApprovals = approvals.filter((r) =>
    filterStatus === 'ALL' ? true : r.status === filterStatus
  );

  // ── Render helpers ───────────────────────────────────────────────────────────

  function renderSpinner() {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // ── Tab: Policy ──────────────────────────────────────────────────────────────

  function renderPolicy() {
    return (
      <div className="space-y-6">
        {/* Jurisdiction selector */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Jurisdiction
          </label>
          <select
            value={selectedJurisdiction}
            onChange={(e) => setSelectedJurisdiction(e.target.value as OTJurisdiction)}
            className="block w-full md:w-80 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {JURISDICTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {policyLoading
          ? renderSpinner()
          : policy && (
              <>
                {/* Policy header card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {policy.jurisdictionLabel}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 font-mono">
                        {policy.legalReference}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      {policy.preApprovalRequired && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Pre-Approval Required
                        </span>
                      )}
                      {policy.compTimeAllowed && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Comp Time Allowed ({policy.compTimeRatio}:1)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick facts grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                    {[
                      {
                        label: 'Weekly Max Hours',
                        value:
                          policy.weeklyMaxHours === 168 ? 'No Limit' : `${policy.weeklyMaxHours}h`,
                      },
                      {
                        label: 'Daily Max OT',
                        value: policy.dailyMaxHours ? `${policy.dailyMaxHours}h` : 'No Limit',
                      },
                      {
                        label: 'Daily Rest Required',
                        value:
                          policy.dailyRestRequired > 0 ? `${policy.dailyRestRequired}h` : 'None',
                      },
                      {
                        label: 'Weekly Rest Required',
                        value:
                          policy.weeklyRestRequired > 0 ? `${policy.weeklyRestRequired}h` : 'None',
                      },
                    ].map((item) => (
                      <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Differentials */}
                  {(policy.nightDifferential ||
                    policy.weekendDifferential ||
                    policy.holidayDifferential) && (
                    <div className="flex flex-wrap gap-3 mb-5">
                      {policy.nightDifferential !== null && (
                        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          <span className="text-xs font-medium text-indigo-700">
                            Night Differential: +{policy.nightDifferential}%
                          </span>
                        </div>
                      )}
                      {policy.weekendDifferential !== null && (
                        <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          <span className="text-xs font-medium text-purple-700">
                            Weekend Differential: +{policy.weekendDifferential}%
                          </span>
                        </div>
                      )}
                      {policy.holidayDifferential !== null && (
                        <div className="flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-lg px-3 py-2">
                          <AlertTriangle className="w-4 h-4 text-pink-500" />
                          <span className="text-xs font-medium text-pink-700">
                            Holiday Differential: +{policy.holidayDifferential}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-gray-600 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                    {policy.notes}
                  </p>
                </div>

                {/* OT Thresholds table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">
                    Overtime Thresholds & Pay Rates
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide rounded-tl-lg">
                            Threshold Type
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Hours Trigger
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Pay Type
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Multiplier
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide rounded-tr-lg">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {policy.thresholds.map((t, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                                {t.thresholdType}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {t.hoursThreshold > 0
                                ? `After ${t.hoursThreshold}h`
                                : 'Applicable condition'}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  t.payType === 'DOUBLE_TIME'
                                    ? 'bg-red-100 text-red-700'
                                    : t.payType === 'TIME_AND_HALF'
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {t.payType.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-900">
                              {t.multiplier}x
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-xs">{t.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
      </div>
    );
  }

  // ── Tab: Approvals ───────────────────────────────────────────────────────────

  function renderApprovals() {
    if (approvalsLoading) return renderSpinner();

    const pendingCount = approvals.filter((r) => r.status === 'PENDING').length;
    const urgentCount = approvals.filter((r) => r.isUrgent && r.status === 'PENDING').length;

    return (
      <div className="space-y-6">
        {/* Summary bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Requests',
              value: approvals.length,
              icon: <Clock className="w-5 h-5 text-indigo-500" />,
              bg: 'bg-indigo-50',
            },
            {
              label: 'Pending Approval',
              value: pendingCount,
              icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
              bg: 'bg-yellow-50',
            },
            {
              label: 'Urgent Requests',
              value: urgentCount,
              icon: <AlertCircle className="w-5 h-5 text-red-500" />,
              bg: 'bg-red-50',
            },
            {
              label: 'Approved This Month',
              value: approvals.filter((r) => r.status === 'APPROVED').length,
              icon: <CheckCircle className="w-5 h-5 text-green-500" />,
              bg: 'bg-green-50',
            },
          ].map((item) => (
            <div key={item.label} className={`${item.bg} rounded-xl border border-gray-100 p-4`}>
              <div className="flex items-center gap-3">
                {item.icon}
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-xl font-bold text-gray-900">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-600">Filter:</span>
          {(['ALL', 'PENDING', 'APPROVED', 'DENIED', 'PROCESSED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filterStatus === s
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Requests table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {filteredApprovals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <CheckCircle className="w-10 h-10 mb-2 text-gray-300" />
              <p className="text-sm">No requests match this filter</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredApprovals.map((req) => (
                <div key={req.id} className="hover:bg-gray-50 transition-colors">
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-900 text-sm">
                              {req.employeeName}
                            </span>
                            <span className="text-xs text-gray-400">{req.employeeCode}</span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              {req.department}
                            </span>
                            {req.isUrgent && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                                <AlertCircle className="w-3 h-3" />
                                URGENT
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-md">
                            {req.reason}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {req.requestedHours}h
                          </p>
                          <p className="text-xs text-gray-500">{req.overtimeDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {fmtDec(req.estimatedCost)}
                          </p>
                          <p className="text-xs text-gray-500">Est. cost</p>
                        </div>
                        <ApprovalStatusBadge status={req.status} />

                        {req.status === 'PENDING' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(req.id)}
                              disabled={actionLoading === req.id}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              {actionLoading === req.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleDeny(req.id)}
                              disabled={actionLoading === req.id}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Deny
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() =>
                            setExpandedRequest(expandedRequest === req.id ? null : req.id)
                          }
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {expandedRequest === req.id ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {expandedRequest === req.id && (
                      <div className="mt-4 ml-11 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Request Details
                          </p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <span className="text-gray-500">Time window</span>
                            <span className="text-gray-800 font-medium">
                              {req.startTime} – {req.endTime}
                            </span>
                            <span className="text-gray-500">Manager</span>
                            <span className="text-gray-800 font-medium">{req.managerName}</span>
                            <span className="text-gray-500">Project Code</span>
                            <span className="text-gray-800 font-medium">
                              {req.projectCode ?? 'N/A'}
                            </span>
                            <span className="text-gray-500">Request Date</span>
                            <span className="text-gray-800 font-medium">{req.requestDate}</span>
                            <span className="text-gray-500">Expiry</span>
                            <span className="text-gray-800 font-medium">{req.expiryDate}</span>
                            {req.requiresSecondApproval && (
                              <>
                                <span className="text-gray-500">2nd Approval</span>
                                <span className="text-orange-600 font-medium">Required</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Work Description
                          </p>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {req.workDescription}
                          </p>
                          {req.denialReason && (
                            <div className="mt-2 bg-red-50 border border-red-100 rounded p-2">
                              <p className="text-xs text-red-700">
                                <span className="font-semibold">Denial reason:</span>{' '}
                                {req.denialReason}
                              </p>
                            </div>
                          )}
                          {req.actualHoursWorked !== null && (
                            <p className="text-xs text-gray-500">
                              Actual hours worked:{' '}
                              <span className="font-semibold text-gray-800">
                                {req.actualHoursWorked}h
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Tab: Forecast ────────────────────────────────────────────────────────────

  function renderForecast() {
    if (forecastLoading) return renderSpinner();
    if (!forecast) return null;

    const alertStyle = ALERT_LEVEL_STYLES[forecast.alertLevel];
    const budgetVariance = forecast.projectedMonthOTCost - forecast.budgetedMonthOTCost;

    return (
      <div className="space-y-6">
        {/* Alert banner */}
        <div className={`rounded-xl border p-4 ${alertStyle.card}`}>
          <div className="flex items-start gap-3">
            {alertStyle.icon}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {alertStyle.label} — {forecast.period}
                </span>
                <span className="text-xs text-gray-500">
                  Forecast accuracy: {forecast.forecastAccuracy}%
                </span>
              </div>
              <ul className="mt-1 space-y-0.5">
                {forecast.alerts.map((alert, i) => (
                  <li key={i} className="text-xs text-gray-700">
                    • {alert}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Current Week OT Hours', value: `${forecast.currentWeekOTHours}h` },
            { label: 'Projected Month OT Hours', value: `${forecast.projectedMonthOTHours}h` },
            { label: 'Projected Month OT Cost', value: fmt(forecast.projectedMonthOTCost) },
            {
              label: 'Budget Variance',
              value: `${budgetVariance >= 0 ? '+' : ''}${fmt(budgetVariance)}`,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
            >
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Weekly trend */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">
            Weekly OT Trend (Actual vs Budget)
          </h4>
          <div className="space-y-3">
            {forecast.weeklyTrend.map((week) => {
              const maxH =
                Math.max(
                  ...forecast.weeklyTrend.map((w) => Math.max(w.actualOTHours, w.budgetedOTHours))
                ) || 1;
              return (
                <div
                  key={week.weekStart}
                  className="grid grid-cols-[120px_1fr_80px] items-center gap-3"
                >
                  <span className="text-xs text-gray-500">Wk {week.weekStart.slice(5)}</span>
                  <div className="relative h-6 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-indigo-400 rounded transition-all duration-500"
                      style={{ width: `${(week.actualOTHours / maxH) * 100}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 border-r-2 border-dashed border-gray-400"
                      style={{ width: `${(week.budgetedOTHours / maxH) * 100}%` }}
                    />
                    <span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-white">
                      {week.actualOTHours}h actual
                    </span>
                  </div>
                  <TrendBadge value={week.variance} suffix="h" />
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-2 rounded bg-indigo-400 inline-block" />
              Actual
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0 border-t-2 border-dashed border-gray-400 inline-block" />
              Budget
            </span>
          </div>
        </div>

        {/* Driver analysis */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">OT Driver Analysis</h4>
          <div className="space-y-3">
            {forecast.driverAnalysis.map((driver, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <span
                  className={`mt-0.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${DRIVER_IMPACT_STYLES[driver.impact]}`}
                >
                  {driver.impact}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{driver.driver}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    ~{driver.estimatedHoursImpact}h impact · {fmt(driver.estimatedCostImpact)} est.
                    cost
                  </p>
                  <p className="text-xs text-indigo-600 mt-1">
                    Mitigation: {driver.mitigationOption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Employee forecast */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900">Employee-Level OT Projection</h4>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  'Employee',
                  'Hrs This Week',
                  'Projected OT Hours',
                  'Projected OT Cost',
                  'Risk',
                  'Driving Factor',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {forecast.employeeForecasts.map((emp) => (
                <tr key={emp.employeeId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{emp.employeeName}</td>
                  <td className="px-4 py-3 text-gray-700">{emp.currentHoursThisWeek}h</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{emp.projectedOTHours}h</td>
                  <td className="px-4 py-3 text-gray-900">{fmt(emp.projectedOTCost)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${RISK_STYLES[emp.riskLevel]}`}
                    >
                      {emp.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{emp.drivingFactor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── Tab: Budget ──────────────────────────────────────────────────────────────

  function renderBudget() {
    if (budgetLoading) return renderSpinner();
    if (!budget) return null;

    const ytdPercent = Math.min(100, budget.percentUsed);
    const isOverBudget = budget.projectedOverBudget;

    return (
      <div className="space-y-6">
        {/* Top-level KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-sm text-gray-500">Annual OT Budget — {budget.departmentName}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{fmt(budget.annualOTBudget)}</p>
            <p className="text-xs text-gray-400 mt-1">FY {budget.fiscalYear}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-sm text-gray-500">YTD OT Spend</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{fmt(budget.ytdOTSpend)}</p>
            <p className="text-xs text-gray-400 mt-1">
              {budget.ytdOTHours}h worked · {budget.percentUsed}% of annual budget
            </p>
          </div>
          <div
            className={`rounded-xl border shadow-sm p-5 ${isOverBudget ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}
          >
            <p className="text-sm text-gray-500">Projected Year-End Spend</p>
            <p
              className={`text-3xl font-bold mt-1 ${isOverBudget ? 'text-red-700' : 'text-green-700'}`}
            >
              {fmt(budget.projectedYearEndSpend)}
            </p>
            {isOverBudget ? (
              <p className="text-xs text-red-600 mt-1 font-medium">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                {fmt(budget.projectedOverBudgetAmount)} over annual budget
              </p>
            ) : (
              <p className="text-xs text-green-600 mt-1 font-medium">
                <CheckCircle className="w-3 h-3 inline mr-1" />
                Within annual budget
              </p>
            )}
          </div>
        </div>

        {/* YTD utilization bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900">YTD Budget Utilization</h4>
            <span className="text-sm font-bold text-gray-700">{ytdPercent}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${ytdPercent > 80 ? 'bg-red-500' : ytdPercent > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${ytdPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>$0</span>
            <span>{fmt(budget.annualOTBudget)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Remaining budget:{' '}
            <span className="font-semibold text-gray-700">{fmt(budget.remainingBudget)}</span>
          </p>
        </div>

        {/* Monthly actuals table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900">Monthly Budget vs Actual</h4>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Month', 'Budgeted', 'Actual', 'Variance', 'Variance %', 'OT Hours'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {budget.monthlyActuals.map((month) => (
                <tr key={month.month} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{month.month}</td>
                  <td className="px-4 py-3 text-gray-700">{fmt(month.budgeted)}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{fmt(month.actual)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-medium ${month.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {month.variance >= 0 ? '+' : ''}
                      {fmt(month.variance)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <TrendBadge value={parseFloat(month.variancePercent.toFixed(1))} suffix="%" />
                  </td>
                  <td className="px-4 py-3 text-gray-700">{month.hours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── Tab: Reports ─────────────────────────────────────────────────────────────

  function renderReports() {
    if (reportLoading) return renderSpinner();
    if (!report) return null;

    const hasFlags = report.complianceFlags.length > 0;

    return (
      <div className="space-y-6">
        {/* Compliance flags */}
        {hasFlags && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h4 className="text-sm font-semibold text-red-800">
                Compliance Flags — Action Required
              </h4>
            </div>
            <ul className="space-y-1">
              {report.complianceFlags.map((flag, i) => (
                <li key={i} className="text-xs text-red-700">
                  • {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total OT Hours', value: `${report.totalOTHours}h` },
            { label: 'Total OT Cost', value: fmt(report.totalOTCost) },
            { label: 'Avg OT / Employee', value: `${report.avgOTHoursPerEmployee}h` },
            {
              label: 'Budget Variance',
              value: `${report.budgetSummary.variance >= 0 ? '+' : ''}${fmt(report.budgetSummary.variance)}`,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
            >
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Employee breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900">
              Employee OT Breakdown — {report.period}
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    'Employee',
                    'Code',
                    'Classification',
                    'Total Hours',
                    'OT Hours',
                    'OT Cost',
                    'Pre-Approved',
                    'Unapproved',
                    'Flags',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.employeeBreakdown.map((emp) => (
                  <tr key={emp.employeeId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {emp.employeeName}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{emp.employeeCode}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          emp.classification === 'EXEMPT'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {emp.classification}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{emp.totalHoursWorked}h</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{emp.overtimeHours}h</td>
                    <td className="px-4 py-3 text-gray-900">{fmt(emp.overtimeCost)}</td>
                    <td className="px-4 py-3 text-green-700 font-medium">
                      {emp.preApprovedHours}h
                    </td>
                    <td className="px-4 py-3">
                      {emp.unapprovedOTHours > 0 ? (
                        <span className="text-red-600 font-semibold">{emp.unapprovedOTHours}h</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {emp.weeklyMaxExceeded && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                            Max Exceeded
                          </span>
                        )}
                        {emp.unapprovedOTHours > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                            Unapproved OT
                          </span>
                        )}
                        {emp.overtimeHours === 0 && (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top OT reasons */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Top Overtime Reasons</h4>
          <div className="space-y-3">
            {report.topOTReasons.map((reason, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-indigo-600">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {reason.reason}
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {reason.percentOfTotal}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                      style={{ width: `${reason.percentOfTotal}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{reason.occurrences} occurrences</span>
                    <span className="text-xs text-gray-500">{reason.totalHours}h total</span>
                    <span className="text-xs font-medium text-gray-700">
                      {fmt(reason.totalCost)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget summary footer */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Budgeted</p>
              <p className="text-base font-semibold text-gray-900">
                {fmt(report.budgetSummary.budgeted)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Actual</p>
              <p className="text-base font-semibold text-gray-900">
                {fmt(report.budgetSummary.actual)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Variance</p>
              <p
                className={`text-base font-semibold ${report.budgetSummary.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}
              >
                {report.budgetSummary.variance >= 0 ? '+' : ''}
                {fmt(report.budgetSummary.variance)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  const TAB_CONTENT: Record<TabId, () => React.ReactNode> = {
    policy: renderPolicy,
    approvals: renderApprovals,
    forecast: renderForecast,
    budget: renderBudget,
    reports: renderReports,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            Overtime Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Jurisdiction-specific OT policies · Pre-approval workflows · Forecasting · Budget
            tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-xs font-medium text-indigo-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            FLSA · CA · UAE · KSA · India · EU
          </span>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-white text-indigo-700 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {TAB_CONTENT[activeTab]()}
    </div>
  );
}
