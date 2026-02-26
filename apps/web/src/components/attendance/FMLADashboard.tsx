'use client';

/**
 * @component FMLADashboard
 * @description FMLA leave management dashboard — active cases, eligibility checker,
 *   balance tracker, intermittent calendar, pending approvals, required notices,
 *   year calculation method selector.
 * @project AURA HCM Platform
 * @section 22.3 — FMLA Management
 *
 * Legal References:
 *  FMLA: 29 U.S.C. § 2601 et seq.
 *  Eligibility: 12 months + 1,250 hours + 50 employees/75 miles
 *  Entitlement: 12 weeks (26 weeks military caregiver) per 29 U.S.C. § 2612(a)
 *  Notices: 29 C.F.R. §§ 825.300–825.301
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  RefreshCw,
  Info,
  Search,
  User,
  Mail,
  Plus,
} from 'lucide-react';
import type {
  FMLARequest,
  FMLAStatus,
  FMLAReason,
  FMLAEligibilityResult,
  FMLAYearMethod,
} from '@/services/fmlaService';
import { FMLAService } from '@/services/fmlaService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const REASON_LABELS: Record<FMLAReason, string> = {
  serious_health_condition_employee: 'Employee Serious Health Condition',
  serious_health_condition_family: 'Family Member Serious Health Condition',
  birth_adoption: 'Birth, Adoption, or Foster Care',
  military_qualifying_exigency: 'Military Qualifying Exigency',
  military_caregiver: 'Military Caregiver (26 wks)',
};

const STATUS_STYLES: Record<
  FMLAStatus,
  { bg: string; text: string; label: string; icon: React.ElementType }
> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending', icon: Clock },
  approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Approved', icon: CheckCircle2 },
  denied: { bg: 'bg-red-100', text: 'text-red-700', label: 'Denied', icon: XCircle },
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active', icon: CheckCircle2 },
  exhausted: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    label: 'Exhausted',
    icon: AlertTriangle,
  },
  completed: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Completed', icon: CheckCircle2 },
  withdrawn: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Withdrawn', icon: XCircle },
};

const YEAR_METHOD_DESCRIPTIONS: Record<FMLAYearMethod, string> = {
  calendar: 'Jan 1 – Dec 31 fixed calendar year',
  rolling_forward: '12-month period measured forward from first FMLA date',
  rolling_backward: '12-month period measured back from current request date',
  fixed: 'Fixed 12-month period starting on employee anniversary date',
};

// ── Usage Bar ──────────────────────────────────────────────────────────────────

function FMLAUsageBar({ used, total }: { used: number; total: number }) {
  const percent = Math.min(100, (used / total) * 100);
  const color = percent >= 100 ? 'bg-red-500' : percent >= 75 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-500">Weeks Used</span>
        <span
          className={`font-bold ${percent >= 100 ? 'text-red-600' : percent >= 75 ? 'text-amber-600' : 'text-emerald-600'}`}
        >
          {used.toFixed(1)} / {total} weeks
        </span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1 text-slate-400">
        <span>0</span>
        <span>{total / 2} wks</span>
        <span>{total} wks</span>
      </div>
    </div>
  );
}

// ── Request Card ───────────────────────────────────────────────────────────────

function RequestCard({
  request,
  onApprove,
}: {
  request: FMLARequest;
  onApprove?: (id: string) => void;
}) {
  const s = STATUS_STYLES[request.status];
  const SIcon = s.icon;
  const maxWeeks = request.reason === 'military_caregiver' ? 26 : 12;
  const _usagePercent = (request.weeksUsed / maxWeeks) * 100;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {request.employeeName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{request.employeeName}</p>
            <p className="text-xs text-slate-500">{request.department}</p>
          </div>
        </div>
        <span
          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.text}`}
        >
          <SIcon className="w-3 h-3" />
          {s.label}
        </span>
      </div>

      <div className="space-y-1.5 text-xs mb-3">
        <div className="flex justify-between">
          <span className="text-slate-500">Reason</span>
          <span className="font-medium text-slate-700 text-right max-w-[60%]">
            {REASON_LABELS[request.reason]}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Leave Type</span>
          <span className="font-medium text-slate-700 capitalize">
            {request.leaveType.replace('_', ' ')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Start Date</span>
          <span className="font-medium text-slate-700">{fmtDate(request.startDate)}</span>
        </div>
        {request.endDate && (
          <div className="flex justify-between">
            <span className="text-slate-500">End Date</span>
            <span className="font-medium text-slate-700">{fmtDate(request.endDate)}</span>
          </div>
        )}
      </div>

      {/* Usage Bar for active/approved */}
      {(request.status === 'active' ||
        request.status === 'approved' ||
        request.status === 'exhausted') && (
        <div className="mb-3">
          <FMLAUsageBar used={request.weeksUsed} total={request.totalWeeksApproved ?? maxWeeks} />
        </div>
      )}

      {/* Notices Checklist */}
      <div className="space-y-1 mb-3">
        {[
          {
            label: 'Eligibility Notice',
            done: request.eligibilityNoticeIssued,
            date: request.eligibilityNoticeDate,
          },
          {
            label: 'Designation Notice',
            done: request.designationNoticeIssued,
            date: request.designationNoticeDate,
          },
          {
            label: 'Medical Certification',
            done: request.medicalCertificationReceived,
            required: request.medicalCertificationRequired,
            due: request.medicalCertificationDue,
          },
        ].map((item) =>
          item.required !== false ? (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                {item.done ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Clock className="w-3 h-3 text-amber-500" />
                )}
                <span className={item.done ? 'text-slate-600' : 'text-amber-700'}>
                  {item.label}
                </span>
              </div>
              <span className="text-slate-400">
                {item.done
                  ? item.date
                    ? fmtDate(item.date)
                    : 'Done'
                  : item.due
                    ? `Due ${fmtDate(item.due)}`
                    : 'Pending'}
              </span>
            </div>
          ) : null
        )}
      </div>

      {request.status === 'pending' && onApprove && (
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => onApprove(request.id)}
            className="flex-1 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
          >
            Approve
          </button>
          <button className="flex-1 py-1.5 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium">
            Deny
          </button>
        </div>
      )}

      {request.denialReason && (
        <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="font-semibold">Denied: </span>
          {request.denialReason}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type Tab = 'active' | 'pending' | 'eligibility' | 'all';

export default function FMLADashboard() {
  const [requests, setRequests] = useState<FMLARequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [yearMethod, setYearMethod] = useState<FMLAYearMethod>('calendar');
  const [eligibilitySearch, setEligibilitySearch] = useState('');
  const [eligibilityResult, setEligibilityResult] = useState<FMLAEligibilityResult | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  useEffect(() => {
    FMLAService.getFMLARequests().then((r) => {
      setRequests(r);
      setLoading(false);
    });
  }, []);

  async function handleApprove(requestId: string) {
    const updated = await FMLAService.approveFMLA(requestId);
    setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
  }

  async function checkEligibility() {
    if (!eligibilitySearch) return;
    setCheckingEligibility(true);
    try {
      const result = await FMLAService.checkEligibility('emp-0445');
      setEligibilityResult(result);
    } finally {
      setCheckingEligibility(false);
    }
  }

  const activeRequests = requests.filter((r) => r.status === 'active');
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const totalWeeksActive = activeRequests.reduce((s, r) => s + r.weeksUsed, 0);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'active', label: 'Active Cases', count: activeRequests.length },
    { id: 'pending', label: 'Pending Approval', count: pendingRequests.length },
    { id: 'eligibility', label: 'Eligibility Checker' },
    { id: 'all', label: 'All Requests', count: requests.length },
  ];

  let displayedRequests = requests;
  if (activeTab === 'active') displayedRequests = activeRequests;
  else if (activeTab === 'pending') displayedRequests = pendingRequests;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">FMLA Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Family and Medical Leave Act — 29 U.S.C. § 2601 et seq.
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700">
          <Plus className="w-4 h-4" /> New FMLA Request
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Active FMLA Cases',
            value: activeRequests.length,
            icon: Calendar,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Pending Approval',
            value: pendingRequests.length,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Total Weeks Used',
            value: `${totalWeeksActive.toFixed(1)} wks`,
            icon: Users,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
          },
          {
            label: 'Notices Overdue',
            value: requests.filter((r) => !r.eligibilityNoticeIssued && r.status !== 'withdrawn')
              .length,
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50',
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">{card.label}</p>
              <div className={`p-1.5 rounded-lg ${card.bg}`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Year Method Selector */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <p className="text-sm font-medium text-slate-700">FMLA Year Calculation Method:</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['calendar', 'rolling_forward', 'rolling_backward', 'fixed'] as FMLAYearMethod[]).map(
            (method) => (
              <button
                key={method}
                onClick={() => setYearMethod(method)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${yearMethod === method ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {method.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            )
          )}
        </div>
        <p className="text-xs text-slate-400 sm:ml-2 italic">
          {YEAR_METHOD_DESCRIPTIONS[yearMethod]}
        </p>
      </div>

      {/* Legal Notice */}
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800">
          <strong>FMLA Requirements:</strong> Eligible employees are entitled to 12 workweeks of
          unpaid, job-protected leave (26 weeks for military caregiver). Employer must issue
          Eligibility Notice within 5 business days of learning of potentially FMLA-qualifying leave
          (29 C.F.R. § 825.300).
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700 bg-blue-50'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-600'}`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading FMLA cases...
            </div>
          ) : (
            <>
              {/* Active / All / Pending Tabs */}
              {activeTab !== 'eligibility' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {displayedRequests.length === 0 ? (
                    <div className="lg:col-span-2 text-center py-10 text-slate-400">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No {activeTab} FMLA cases</p>
                    </div>
                  ) : (
                    displayedRequests.map((req) => (
                      <RequestCard
                        key={req.id}
                        request={req}
                        onApprove={activeTab === 'pending' ? handleApprove : undefined}
                      />
                    ))
                  )}
                </div>
              )}

              {/* Eligibility Checker */}
              {activeTab === 'eligibility' && (
                <div className="max-w-lg">
                  <p className="text-sm text-slate-600 mb-4">
                    Check if an employee meets FMLA eligibility criteria: 12 months employed, 1,250
                    hours worked in past 12 months, and 50+ employees within 75 miles.
                  </p>
                  <div className="flex gap-3 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={eligibilitySearch}
                        onChange={(e) => setEligibilitySearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && checkEligibility()}
                        placeholder="Enter employee name or ID..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                    <button
                      onClick={checkEligibility}
                      disabled={checkingEligibility}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
                    >
                      {checkingEligibility ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      Check
                    </button>
                  </div>

                  {eligibilityResult && (
                    <div
                      className={`rounded-xl border p-4 ${eligibilityResult.isEligible ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        {eligibilityResult.isEligible ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <p
                          className={`font-bold ${eligibilityResult.isEligible ? 'text-emerald-800' : 'text-red-800'}`}
                        >
                          {eligibilityResult.isEligible ? 'FMLA ELIGIBLE' : 'NOT ELIGIBLE FOR FMLA'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {eligibilityResult.criteriaChecks.map((c) => (
                          <div key={c.criterion} className="flex items-center gap-3 text-sm">
                            {c.met ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-slate-700">{c.criterion}</p>
                              <p className="text-xs text-slate-500">
                                Required: {c.required} · Actual:{' '}
                                <span className={c.met ? 'text-emerald-700' : 'text-red-700'}>
                                  {c.actual}
                                </span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {eligibilityResult.isEligible && (
                        <div className="mt-3 pt-3 border-t border-emerald-200 text-xs text-emerald-800">
                          Available FMLA: <strong>{eligibilityResult.availableWeeks} weeks</strong>
                          {eligibilityResult.militaryEligible &&
                            ' · 26 weeks for military caregiver'}
                        </div>
                      )}
                      {!eligibilityResult.isEligible &&
                        eligibilityResult.ineligibilityReasons.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {eligibilityResult.ineligibilityReasons.map((reason, i) => (
                              <p key={i} className="text-xs text-red-700">
                                • {reason}
                              </p>
                            ))}
                          </div>
                        )}
                      {eligibilityResult.isEligible && (
                        <div className="mt-3 flex gap-2">
                          <button className="flex-1 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center justify-center gap-1">
                            <Mail className="w-3.5 h-3.5" /> Issue Eligibility Notice
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Intermittent Leave Calendar Preview */}
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-slate-700 mb-3">
                      Intermittent Leave Calendar
                    </p>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-2">
                        February 2026 — Active intermittent leave days highlighted
                      </p>
                      <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                          <div key={d} className="text-slate-400 font-medium py-1">
                            {d}
                          </div>
                        ))}
                        {/* Padding for Feb 1 = Sunday */}
                        {Array.from({ length: 0 }, (_, i) => (
                          <div key={`pad-${i}`} />
                        ))}
                        {Array.from({ length: 28 }, (_, i) => {
                          const day = i + 1;
                          const isIntermittent = [3, 7, 10, 17, 21, 24].includes(day);
                          const isWeekend = [1, 2, 8, 9, 15, 16, 22, 23].includes(day);
                          return (
                            <div
                              key={day}
                              className={`py-1 rounded font-medium ${
                                isIntermittent
                                  ? 'bg-amber-300 text-amber-900'
                                  : isWeekend
                                    ? 'text-slate-300'
                                    : 'text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {day}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <div className="w-3 h-3 bg-amber-300 rounded" />
                        <span className="text-slate-500">FMLA intermittent day</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
