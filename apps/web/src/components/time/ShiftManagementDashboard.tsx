// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

/**
 * @component ShiftManagementDashboard
 * @description Advanced shift management — shift patterns, swap requests, open shifts,
 *   differential rates, and labor cost analysis.
 * @project AURA HCM Platform
 * @section 12.1 — Advanced Shift Management
 * @legal UAE Labour Law Decree-Law No. 33/2021 Art. 17-19 (working hours);
 *   EU WTD 2003/88/EC — night work, 11h daily rest;
 *   FLSA: 29 U.S.C. § 207 — no federal differential mandate (employer discretion).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  ArrowLeftRight,
  Users,
  DollarSign,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Plus,
  Star,
  BadgeCheck,
  Filter,
  Moon,
  Zap,
} from 'lucide-react';
import type {
  ShiftPattern,
  ShiftSwapRequest,
  OpenShift,
  ShiftDifferential,
  ShiftLaborCost,
  ShiftSwapStatus,
  DifferentialType,
} from '@/services/shiftManagementService';
import { shiftManagementService } from '@/services/shiftManagementService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(n);
}

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Status Badge ───────────────────────────────────────────────────────────────

const SWAP_STATUS_STYLES: Record<ShiftSwapStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  APPROVED: 'bg-green-100 text-green-800 border border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border border-gray-200',
  EXPIRED: 'bg-gray-100 text-gray-500 border border-gray-200',
  COUNTER_PROPOSED: 'bg-blue-100 text-blue-700 border border-blue-200',
};

function SwapStatusBadge({ status }: { status: ShiftSwapStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${SWAP_STATUS_STYLES[status]}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

const DIFFERENTIAL_ICONS: Record<DifferentialType, React.ReactNode> = {
  NIGHT: <Moon className="w-3.5 h-3.5" />,
  WEEKEND: <Calendar className="w-3.5 h-3.5" />,
  HOLIDAY: <Star className="w-3.5 h-3.5" />,
  OVERTIME: <Clock className="w-3.5 h-3.5" />,
  HAZARD: <AlertTriangle className="w-3.5 h-3.5" />,
  BILINGUAL: <BadgeCheck className="w-3.5 h-3.5" />,
  LEAD: <Users className="w-3.5 h-3.5" />,
  ON_CALL: <Zap className="w-3.5 h-3.5" />,
};

const PATTERN_TYPE_COLORS: Record<string, string> = {
  FIXED: 'bg-blue-100 text-blue-700',
  ROTATING: 'bg-purple-100 text-purple-700',
  SPLIT: 'bg-orange-100 text-orange-700',
  COMPRESSED: 'bg-teal-100 text-teal-700',
  FLEXIBLE: 'bg-green-100 text-green-700',
  ON_CALL: 'bg-red-100 text-red-700',
};

// ── Tab Types ──────────────────────────────────────────────────────────────────

type TabId = 'patterns' | 'swaps' | 'open-shifts' | 'differentials' | 'cost-analysis';

const TABS: { id: TabId; label: string }[] = [
  { id: 'patterns', label: 'Shift Patterns' },
  { id: 'swaps', label: 'Swap Requests' },
  { id: 'open-shifts', label: 'Open Shifts' },
  { id: 'differentials', label: 'Differentials' },
  { id: 'cost-analysis', label: 'Cost Analysis' },
];

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ShiftManagementDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('patterns');
  const [loading, setLoading] = useState(true);

  // Patterns
  const [patterns, setPatterns] = useState<ShiftPattern[]>([]);
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);

  // Swaps
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([]);
  const [swapFilter, setSwapFilter] = useState<string>('ALL');
  const [approvingSwap, setApprovingSwap] = useState<string | null>(null);

  // Open Shifts
  const [openShifts, setOpenShifts] = useState<OpenShift[]>([]);
  const [claimingShift, setClaimingShift] = useState<string | null>(null);

  // Differentials
  const [differentials, setDifferentials] = useState<ShiftDifferential[]>([]);

  // Cost Analysis
  const [laborCost, setLaborCost] = useState<ShiftLaborCost | null>(null);

  const currentPeriod = new Date().toISOString().slice(0, 7);

  const loadData = useCallback(async () => {
    try {
      const [pats, swaps, shifts, diffs, cost] = await Promise.all([
        shiftManagementService.getShiftPatterns(),
        shiftManagementService.getShiftSwapRequests(),
        shiftManagementService.getOpenShifts({ status: ['AVAILABLE'] }),
        shiftManagementService.getShiftDifferentials(),
        shiftManagementService.calculateShiftCost('dept-ops', currentPeriod),
      ]);
      setPatterns(pats);
      setSwapRequests(swaps);
      setOpenShifts(shifts);
      setDifferentials(diffs);
      setLaborCost(cost);
    } catch (err: any) {
      console.error('ShiftManagementDashboard load error:', err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const handleApproveSwap = async (swapId: string) => {
    setApprovingSwap(swapId);
    try {
      await shiftManagementService.approveShiftSwap(swapId);
      await loadData();
    } catch (err: any) {
      console.error('Approve swap error:', err);
    } finally {
      setApprovingSwap(null);
    }
  };

  const handleClaimShift = async (shiftId: string) => {
    setClaimingShift(shiftId);
    try {
      await shiftManagementService.claimOpenShift(shiftId, 'emp-001');
      await loadData();
    } catch (err: any) {
      console.error('Claim shift error:', err);
    } finally {
      setClaimingShift(null);
    }
  };

  const filteredSwaps = swapRequests.filter((s) => swapFilter === 'ALL' || s.status === swapFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600 text-sm">Loading shift management...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shift Management Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Shift patterns, swap requests, open shifts, differentials, and labor cost tracking
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Active Patterns
            </span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {patterns.filter((p) => p.isActive).length}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{patterns.length} total patterns</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Pending Swaps
            </span>
            <ArrowLeftRight className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {swapRequests.filter((s) => s.status === 'PENDING').length}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Awaiting approval</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Open Shifts
            </span>
            <Users className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{openShifts.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Available to claim</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Monthly Labor Cost
            </span>
            <DollarSign className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {laborCost ? fmtCurrency(laborCost.totalLaborCost) : '—'}
          </p>
          {laborCost && (
            <p
              className={`text-xs mt-0.5 ${laborCost.budgetVariance > 0 ? 'text-red-500' : 'text-green-500'}`}
            >
              {laborCost.budgetVariance > 0 ? '+' : ''}
              {fmtCurrency(laborCost.budgetVariance)} vs budget
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 px-4 pt-4 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.id === 'swaps' &&
                  swapRequests.filter((s) => s.status === 'PENDING').length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-yellow-500 text-white rounded-full text-xs">
                      {swapRequests.filter((s) => s.status === 'PENDING').length}
                    </span>
                  )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* ── Shift Patterns Tab ─────────────────────────────────────────── */}
          {activeTab === 'patterns' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Shift Pattern Library</h4>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  New Pattern
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patterns.map((pat) => (
                  <div
                    key={pat.id}
                    className={`bg-white border rounded-xl overflow-hidden cursor-pointer hover:shadow-sm transition-shadow ${
                      expandedPattern === pat.id ? 'border-blue-300 shadow-sm' : 'border-gray-200'
                    }`}
                    onClick={() => setExpandedPattern(expandedPattern === pat.id ? null : pat.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{pat.name}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{pat.code}</p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${PATTERN_TYPE_COLORS[pat.type] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {pat.type}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 mb-3">{pat.description}</p>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-gray-50 rounded-lg py-1.5">
                          <p className="text-xs text-gray-400">Weekly Hours</p>
                          <p className="text-sm font-bold text-gray-900">{pat.totalWeeklyHours}h</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg py-1.5">
                          <p className="text-xs text-gray-400">Days On</p>
                          <p className="text-sm font-bold text-blue-600">{pat.daysOn}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg py-1.5">
                          <p className="text-xs text-gray-400">Days Off</p>
                          <p className="text-sm font-bold text-green-600">{pat.daysOff}</p>
                        </div>
                      </div>

                      {pat.rotationCycle && (
                        <p className="text-xs text-purple-600 mt-2">
                          Rotation: {pat.rotationCycle.replace('_', ' ')}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${pat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                        >
                          {pat.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-gray-400">
                          Effective {fmtDate(pat.effectiveDate)}
                        </span>
                      </div>
                    </div>

                    {/* Pattern Detail — Cycle Days */}
                    {expandedPattern === pat.id && (
                      <div className="border-t border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Shift Cycle
                        </p>
                        <div className="space-y-1">
                          {pat.shifts.map((shift) => (
                            <div
                              key={shift.dayInCycle}
                              className={`flex items-center gap-3 px-2 py-1 rounded text-xs ${shift.isOff ? 'text-gray-400' : 'text-gray-700'}`}
                            >
                              <span className="w-6 text-gray-400 font-mono text-center">
                                D{shift.dayInCycle}
                              </span>
                              <span
                                className={`w-16 font-mono ${shift.isOff ? 'text-gray-300' : 'text-blue-600'}`}
                              >
                                {shift.shiftCode}
                              </span>
                              {shift.isOff ? (
                                <span className="text-gray-300">— Day Off</span>
                              ) : (
                                <>
                                  <span>
                                    {shift.startTime} – {shift.endTime}
                                  </span>
                                  <span className="text-gray-400">({shift.netHours}h net)</span>
                                  {shift.isOvernight && (
                                    <span className="text-purple-500 font-medium">Overnight</span>
                                  )}
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Departments: {pat.applicableDepartments.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Swap Requests Tab ─────────────────────────────────────────── */}
          {activeTab === 'swaps' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">Shift Swap Requests</h4>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={swapFilter}
                    onChange={(e) => setSwapFilter(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {filteredSwaps.length > 0 ? (
                <div className="space-y-3">
                  {filteredSwaps.map((swap) => (
                    <div
                      key={swap.id}
                      className={`bg-white border rounded-xl p-4 ${swap.status === 'PENDING' ? 'border-yellow-200' : 'border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">
                              {swap.requesterName} → {swap.targetEmployeeName}
                            </p>
                            <SwapStatusBadge status={swap.status} />
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Requested: {fmtDate(swap.requestDate)}
                          </p>
                        </div>
                        {swap.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveSwap(swap.id)}
                              disabled={approvingSwap === swap.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
                            >
                              {approvingSwap === swap.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              Approve
                            </button>
                            <button className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors">
                              <XCircle className="w-3 h-3" />
                              Deny
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Shift Details */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-blue-50 rounded-lg p-2.5">
                          <p className="text-xs text-blue-500 font-medium mb-1">
                            Requester&apos;s Shift
                          </p>
                          <p className="text-xs font-semibold text-blue-800">
                            {swap.requesterShift.shiftName}
                          </p>
                          <p className="text-xs text-blue-600">
                            {fmtDate(swap.requesterShift.date)}
                          </p>
                          <p className="text-xs text-blue-500">
                            {swap.requesterShift.startTime}–{swap.requesterShift.endTime} (
                            {swap.requesterShift.hoursWorked}h)
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-2.5">
                          <p className="text-xs text-purple-500 font-medium mb-1">
                            Target&apos;s Shift
                          </p>
                          <p className="text-xs font-semibold text-purple-800">
                            {swap.targetShift.shiftName}
                          </p>
                          <p className="text-xs text-purple-600">
                            {fmtDate(swap.targetShift.date)}
                          </p>
                          <p className="text-xs text-purple-500">
                            {swap.targetShift.startTime}–{swap.targetShift.endTime} (
                            {swap.targetShift.hoursWorked}h)
                          </p>
                        </div>
                      </div>

                      {/* Validation Checks */}
                      <div className="flex flex-wrap gap-1.5">
                        {swap.validationChecks.map((check, i) => (
                          <span
                            key={i}
                            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                              check.passed
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                            title={check.detail}
                          >
                            {check.passed ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {check.check}
                          </span>
                        ))}
                      </div>

                      {swap.notes && (
                        <p className="text-xs text-gray-500 mt-2 italic">
                          &quot;{swap.notes}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <ArrowLeftRight className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No swap requests match the selected filter</p>
                </div>
              )}
            </div>
          )}

          {/* ── Open Shifts Tab ───────────────────────────────────────────── */}
          {activeTab === 'open-shifts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">Open Shift Board</h4>
                <span className="text-xs text-gray-400">
                  {openShifts.length} unfilled shift{openShifts.length !== 1 ? 's' : ''} available
                </span>
              </div>

              {openShifts.length > 0 ? (
                // Group by department
                Object.entries(
                  openShifts.reduce(
                    (groups, shift) => {
                      const dept = shift.departmentName;
                      if (!groups[dept]) groups[dept] = [];
                      groups[dept].push(shift);
                      return groups;
                    },
                    {} as Record<string, OpenShift[]>
                  )
                ).map(([dept, shifts]) => (
                  <div key={dept}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      {dept}
                    </p>
                    <div className="space-y-2">
                      {shifts.map((shift) => (
                        <div
                          key={shift.id}
                          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-gray-900">
                                  {shift.shiftName}
                                </p>
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                                  {shift.status}
                                </span>
                                {shift.differentialApplicable && (
                                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                                    <DollarSign className="w-3 h-3" />
                                    Differential
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {fmtDate(shift.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {shift.startTime}–{shift.endTime} ({shift.hoursRequired}h)
                                </span>
                              </div>

                              {shift.requiredSkills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {shift.requiredSkills.map((skill) => (
                                    <span
                                      key={skill}
                                      className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-200"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Applicant Queue */}
                              {shift.applicants.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-400 mb-1">
                                    Applicants ({shift.applicants.length})
                                  </p>
                                  <div className="flex gap-1.5">
                                    {shift.applicants.map((app) => (
                                      <div
                                        key={app.employeeId}
                                        className={`text-xs px-2 py-1 rounded-lg border ${
                                          app.status === 'SELECTED'
                                            ? 'bg-green-50 border-green-200 text-green-700'
                                            : app.status === 'REJECTED'
                                              ? 'bg-red-50 border-red-200 text-red-700'
                                              : 'bg-gray-50 border-gray-200 text-gray-700'
                                        }`}
                                        title={`Qualification: ${app.qualificationScore}% | Fatigue: ${app.fatigueScore}`}
                                      >
                                        <p className="font-medium">{app.employeeName}</p>
                                        <p className="text-xs opacity-75">
                                          Score: {app.qualificationScore}%
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="ml-4 text-right flex-shrink-0">
                              <p className="text-lg font-bold text-gray-900">
                                {fmtCurrency(shift.estimatedPay)}
                              </p>
                              <p className="text-xs text-gray-400">Est. pay</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Posted by {shift.postedBy}
                              </p>
                              <button
                                onClick={() => handleClaimShift(shift.id)}
                                disabled={claimingShift === shift.id}
                                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                              >
                                {claimingShift === shift.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Plus className="w-3 h-3" />
                                )}
                                Claim Shift
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No open shifts available</p>
                </div>
              )}
            </div>
          )}

          {/* ── Differentials Tab ─────────────────────────────────────────── */}
          {activeTab === 'differentials' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">Shift Differential Rates</h4>
                <span className="text-xs text-gray-400">
                  {differentials.filter((d) => d.isActive).length} active differentials
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 text-left">
                      <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">
                        Differential
                      </th>
                      <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">Type</th>
                      <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">Method</th>
                      <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-right">
                        Rate
                      </th>
                      <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">
                        Applicable When
                      </th>
                      <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">
                        Stackable
                      </th>
                      <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {differentials.map((diff) => (
                      <tr key={diff.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-500">{DIFFERENTIAL_ICONS[diff.type]}</span>
                            <div>
                              <p className="font-semibold text-gray-900">{diff.name}</p>
                              <p className="text-gray-400">{diff.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              diff.type === 'NIGHT'
                                ? 'bg-purple-100 text-purple-700'
                                : diff.type === 'WEEKEND'
                                  ? 'bg-blue-100 text-blue-700'
                                  : diff.type === 'HOLIDAY'
                                    ? 'bg-red-100 text-red-700'
                                    : diff.type === 'ON_CALL'
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {diff.type}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-gray-600">
                          {diff.calculationMethod.replace('_', ' ')}
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-gray-900">
                          {diff.calculationMethod === 'FLAT_RATE'
                            ? fmtCurrency(diff.value) + '/hr'
                            : diff.calculationMethod === 'PERCENT_BASE'
                              ? `${diff.value}%`
                              : `${diff.value}x`}
                        </td>
                        <td className="px-3 py-3 text-gray-600">
                          {diff.startTime && diff.endTime
                            ? `${diff.startTime}–${diff.endTime}`
                            : diff.applicableDays.length > 0
                              ? `Days: ${diff.applicableDays.map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}`
                              : 'All times'}
                          {diff.minimumHours > 0 && (
                            <span className="text-gray-400"> (min {diff.minimumHours}h)</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {diff.isStackable ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-300" />
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${diff.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                          >
                            {diff.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Cost Analysis Tab ─────────────────────────────────────────── */}
          {activeTab === 'cost-analysis' && laborCost && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">
                  Labor Cost Analysis — {laborCost.period}
                </h4>
                <p className="text-xs text-gray-400">Department: {laborCost.departmentId}</p>
              </div>

              {/* Cost Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    label: 'Regular Cost',
                    value: laborCost.regularCost,
                    color: 'text-blue-700',
                    bg: 'bg-blue-50',
                  },
                  {
                    label: 'Overtime Cost',
                    value: laborCost.overtimeCost,
                    color: 'text-orange-700',
                    bg: 'bg-orange-50',
                  },
                  {
                    label: 'Differential Cost',
                    value: laborCost.differentialCost,
                    color: 'text-purple-700',
                    bg: 'bg-purple-50',
                  },
                  {
                    label: 'Total Labor Cost',
                    value: laborCost.totalLaborCost,
                    color: 'text-gray-900',
                    bg: 'bg-gray-50',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`${item.bg} border border-gray-200 rounded-xl p-4 text-center`}
                  >
                    <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                    <p className={`text-lg font-bold ${item.color}`}>{fmtCurrency(item.value)}</p>
                  </div>
                ))}
              </div>

              {/* Hours Breakdown */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Hours Breakdown</p>
                <div className="space-y-2">
                  {[
                    {
                      label: 'Regular Hours',
                      value: laborCost.regularHours,
                      total: laborCost.totalShiftHours,
                      color: 'bg-blue-500',
                    },
                    {
                      label: 'Overtime Hours',
                      value: laborCost.overtimeHours,
                      total: laborCost.totalShiftHours,
                      color: 'bg-orange-500',
                    },
                    {
                      label: 'Night Hours',
                      value: laborCost.nightHours,
                      total: laborCost.totalShiftHours,
                      color: 'bg-purple-500',
                    },
                    {
                      label: 'Weekend Hours',
                      value: laborCost.weekendHours,
                      total: laborCost.totalShiftHours,
                      color: 'bg-indigo-500',
                    },
                    {
                      label: 'Holiday Hours',
                      value: laborCost.holidayHours,
                      total: laborCost.totalShiftHours,
                      color: 'bg-red-500',
                    },
                  ].map((item) => {
                    const pct = item.total > 0 ? (item.value / item.total) * 100 : 0;
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">{item.value}h</span>
                            <span className="text-gray-400">({pct.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${item.color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs">
                  <span className="text-gray-500">Cost per Hour</span>
                  <span className="font-bold text-gray-900">
                    {fmtCurrency(laborCost.costPerHour)}/hr avg
                  </span>
                </div>
              </div>

              {/* Headcount by Shift */}
              {laborCost.headcountByShift.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Headcount by Shift</p>
                  <div className="space-y-2">
                    {laborCost.headcountByShift.map((shift, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{shift.shiftName}</p>
                          <p className="text-xs text-gray-500">
                            {shift.employees} employees • {shift.totalHours}h total
                          </p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {fmtCurrency(shift.totalCost)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Budget Variance */}
              <div
                className={`flex items-center justify-between p-4 rounded-xl border ${laborCost.budgetVariance > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}
              >
                <div>
                  <p
                    className={`text-sm font-semibold ${laborCost.budgetVariance > 0 ? 'text-red-800' : 'text-green-800'}`}
                  >
                    Budget Variance
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${laborCost.budgetVariance > 0 ? 'text-red-600' : 'text-green-600'}`}
                  >
                    Budgeted: {fmtCurrency(laborCost.budgetedCost)} — Actual:{' '}
                    {fmtCurrency(laborCost.totalLaborCost)}
                  </p>
                </div>
                <p
                  className={`text-xl font-bold ${laborCost.budgetVariance > 0 ? 'text-red-700' : 'text-green-700'}`}
                >
                  {laborCost.budgetVariance > 0 ? '+' : ''}
                  {fmtCurrency(laborCost.budgetVariance)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
