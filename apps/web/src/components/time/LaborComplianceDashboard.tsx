'use client';

/**
 * @component LaborComplianceDashboard
 * @description Labor law compliance monitoring — FLSA classification, predictive scheduling,
 *   meal break rules, clopening checks, and aggregate compliance reporting.
 * @project AURA HCM Platform
 * @section 22.2 — Labor Compliance Engine
 * @legal FLSA: 29 U.S.C. §§ 201-219; CA Lab. Code § 512; NYC Fair Workweek Law;
 *   Oregon ORS 653.450; EU WTD 2003/88/EC.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Scale,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Globe,
  Clock,
  ChevronRight,
} from 'lucide-react';
import type {
  FLSAComplianceResult,
  PredictiveSchedulingCheck,
  MealBreakViolation,
  ClopeningViolation,
  LaborComplianceReport,
  Jurisdiction,
  ViolationSeverity,
} from '@/services/laborComplianceService';
import { laborComplianceService } from '@/services/laborComplianceService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n);
}

function fmtPercent(n: number, d = 1): string {
  return `${n.toFixed(d)}%`;
}

// ── Severity Badge ─────────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<ViolationSeverity, string> = {
  INFO: 'bg-blue-100 text-blue-700 border border-blue-200',
  WARNING: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  VIOLATION: 'bg-orange-100 text-orange-700 border border-orange-200',
  CRITICAL: 'bg-red-100 text-red-700 border border-red-200',
};

function SeverityBadge({ severity }: { severity: ViolationSeverity }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${SEVERITY_STYLES[severity]}`}
    >
      {severity}
    </span>
  );
}

const RISK_COLORS: Record<string, string> = {
  LOW: 'text-green-600 bg-green-100',
  MEDIUM: 'text-yellow-600 bg-yellow-100',
  HIGH: 'text-red-600 bg-red-100',
};

// ── Tab Types ──────────────────────────────────────────────────────────────────

type TabId = 'flsa' | 'predictive' | 'meal-breaks' | 'clopening' | 'report';

const TABS: { id: TabId; label: string }[] = [
  { id: 'flsa', label: 'FLSA' },
  { id: 'predictive', label: 'Predictive Scheduling' },
  { id: 'meal-breaks', label: 'Meal Breaks' },
  { id: 'clopening', label: 'Clopening' },
  { id: 'report', label: 'Compliance Report' },
];

const JURISDICTIONS: { value: Jurisdiction; label: string }[] = [
  { value: 'FEDERAL_FLSA', label: 'Federal (FLSA)' },
  { value: 'NY', label: 'New York City' },
  { value: 'OR', label: 'Oregon' },
  { value: 'IL', label: 'Illinois (Chicago)' },
  { value: 'WA', label: 'Washington (Seattle)' },
  { value: 'CA', label: 'California' },
];

const MOCK_EMPLOYEE_IDS = ['emp-001', 'emp-002', 'emp-003', 'emp-004', 'emp-005', 'emp-006'];

// ── Main Component ─────────────────────────────────────────────────────────────

export default function LaborComplianceDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('flsa');

  // FLSA states
  const [flsaResults, setFlsaResults] = useState<FLSAComplianceResult[]>([]);
  const [flsaLoading, setFlsaLoading] = useState(false);

  // Predictive Scheduling states
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('NY');
  const [predictiveResults, setPredictiveResults] = useState<PredictiveSchedulingCheck[]>([]);
  const [predictiveLoading, setPredictiveLoading] = useState(false);

  // Meal Break states
  const [mealBreakViolations, setMealBreakViolations] = useState<MealBreakViolation[]>([]);
  const [mealBreakLoading, setMealBreakLoading] = useState(false);

  // Clopening states
  const [clopeningViolations, setClopeningViolations] = useState<ClopeningViolation[]>([]);
  const [clopeningLoading, setClopeningLoading] = useState(false);

  // Report states
  const [complianceReport, setComplianceReport] = useState<LaborComplianceReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM

  const loadFLSA = useCallback(async () => {
    setFlsaLoading(true);
    try {
      const results = await Promise.all(
        MOCK_EMPLOYEE_IDS.map((id) => laborComplianceService.checkFLSACompliance(id, currentPeriod))
      );
      setFlsaResults(results);
    } catch (err) {
      console.error('FLSA error:', err);
    } finally {
      setFlsaLoading(false);
    }
  }, []);

  const loadPredictive = useCallback(async () => {
    setPredictiveLoading(true);
    try {
      const results = await Promise.all(
        MOCK_EMPLOYEE_IDS.slice(0, 3).map((id) =>
          laborComplianceService.checkPredictiveScheduling('sched-001', id, jurisdiction)
        )
      );
      setPredictiveResults(results);
    } catch (err) {
      console.error('Predictive scheduling error:', err);
    } finally {
      setPredictiveLoading(false);
    }
  }, [jurisdiction]);

  const loadMealBreaks = useCallback(async () => {
    setMealBreakLoading(true);
    try {
      const violations = await laborComplianceService.detectMealBreakViolations(
        MOCK_EMPLOYEE_IDS,
        currentPeriod,
        'CA'
      );
      setMealBreakViolations(violations);
    } catch (err) {
      console.error('Meal break error:', err);
    } finally {
      setMealBreakLoading(false);
    }
  }, []);

  const loadClopening = useCallback(async () => {
    setClopeningLoading(true);
    try {
      const violations = await laborComplianceService.checkClopeningViolation(
        MOCK_EMPLOYEE_IDS,
        currentPeriod
      );
      setClopeningViolations(violations);
    } catch (err) {
      console.error('Clopening error:', err);
    } finally {
      setClopeningLoading(false);
    }
  }, []);

  const loadReport = useCallback(async () => {
    setReportLoading(true);
    try {
      const report = await laborComplianceService.getLaborComplianceReport(currentPeriod);
      setComplianceReport(report);
    } catch (err) {
      console.error('Compliance report error:', err);
    } finally {
      setReportLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'flsa' && flsaResults.length === 0) loadFLSA();
    if (activeTab === 'predictive' && predictiveResults.length === 0) loadPredictive();
    if (activeTab === 'meal-breaks' && mealBreakViolations.length === 0) loadMealBreaks();
    if (activeTab === 'clopening' && clopeningViolations.length === 0) loadClopening();
    if (activeTab === 'report' && !complianceReport) loadReport();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Labor Compliance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            FLSA • Predictive Scheduling Laws • CA Meal Breaks • Clopening • EU WTD
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
          <Scale className="w-4 h-4 text-red-600" />
          <span className="text-xs font-semibold text-red-700">Compliance Monitor</span>
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
                    ? 'border-red-600 text-red-600 bg-red-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* ── FLSA Tab ───────────────────────────────────────────────────── */}
          {activeTab === 'flsa' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">
                  FLSA Employee Classification
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    Salary threshold: $1,128/wk (DOL 2024 rule)
                  </span>
                  <button
                    onClick={loadFLSA}
                    disabled={flsaLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${flsaLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {flsaLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-red-600 mr-2" />
                  <span className="text-sm text-gray-500">Loading FLSA compliance data...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500 text-left bg-gray-50">
                        <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">
                          Employee
                        </th>
                        <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">
                          Classification
                        </th>
                        <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-right">
                          Salary
                        </th>
                        <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-right">
                          Hours
                        </th>
                        <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-right">
                          OT Hours
                        </th>
                        <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-right">
                          OT Pay
                        </th>
                        <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">
                          Misclassification Risk
                        </th>
                        <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {flsaResults.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-3 py-2.5">
                            <p className="font-medium text-gray-900">{r.employeeName}</p>
                            <p className="text-gray-400">{r.period}</p>
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full font-medium ${r.classification === 'EXEMPT' ? 'bg-blue-100 text-blue-700' : r.classification === 'NON_EXEMPT' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}
                            >
                              {r.classification}
                            </span>
                            {r.exemptionBasis && (
                              <p className="text-gray-400 mt-0.5">{r.exemptionBasis}</p>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <p className="font-medium text-gray-800">{fmtCurrency(r.salary)}</p>
                            <p className="text-gray-400">
                              Threshold: {fmtCurrency(r.salaryThreshold)}/yr
                            </p>
                          </td>
                          <td className="px-3 py-2.5 text-right font-medium text-gray-800">
                            {r.hoursWorked}h
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span
                              className={`font-bold ${r.overtimeHours > 0 ? 'text-orange-600' : 'text-gray-600'}`}
                            >
                              {r.overtimeHours}h
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right font-medium text-gray-800">
                            {fmtCurrency(r.overtimePay)}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${RISK_COLORS[r.misclassificationRisk]}`}
                            >
                              {r.misclassificationRisk}
                            </span>
                            {r.misclassificationReasons.length > 0 && (
                              <p className="text-gray-400 mt-0.5 max-w-xs truncate">
                                {r.misclassificationReasons[0]}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            {r.isCompliant ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Compliant</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-600">
                                <XCircle className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">
                                  {r.violations.length} violation
                                  {r.violations.length !== 1 ? 's' : ''}
                                </span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Predictive Scheduling Tab ─────────────────────────────────── */}
          {activeTab === 'predictive' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">
                  Predictive Scheduling Compliance
                </h4>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <select
                    value={jurisdiction}
                    onChange={(e) => {
                      setJurisdiction(e.target.value as Jurisdiction);
                      setPredictiveResults([]);
                    }}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    {JURISDICTIONS.map((j) => (
                      <option key={j.value} value={j.value}>
                        {j.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={loadPredictive}
                    disabled={predictiveLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
                  >
                    {predictiveLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    Check Compliance
                  </button>
                </div>
              </div>

              {/* Jurisdiction Rules Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-blue-800 mb-1">
                  {JURISDICTIONS.find((j) => j.value === jurisdiction)?.label} — Predictive
                  Scheduling Requirements
                </p>
                <div className="text-xs text-blue-700 space-y-0.5">
                  {jurisdiction === 'NY' && (
                    <>
                      <p>
                        • NYC Fair Workweek Law (NYC Admin Code § 20-1201): 72-hour advance notice
                        required
                      </p>
                      <p>
                        • Late schedule changes: Predictability pay ($10-$75 per change depending on
                        notice given)
                      </p>
                      <p>
                        • Right to rest: Employees may decline shifts with less than 11 hours gap
                      </p>
                    </>
                  )}
                  {jurisdiction === 'OR' && (
                    <>
                      <p>
                        • Oregon Predictive Scheduling Law (ORS 653.450): 14-day advance notice
                        required
                      </p>
                      <p>
                        • Estimate of hours required at hire; changes require 1 hour-pay premium
                      </p>
                      <p>• Good faith estimate of minimum hours must be provided</p>
                    </>
                  )}
                  {jurisdiction === 'IL' && (
                    <>
                      <p>
                        • Chicago Fair Workweek Ordinance (Chicago Mun. Code §§ 1-24-010): 10-day
                        advance notice
                      </p>
                      <p>
                        • Right to input: Employees can request preferred hours; employers must
                        consider
                      </p>
                      <p>
                        • Predictability pay: 1 hour of additional pay for schedule changes with
                        less notice
                      </p>
                    </>
                  )}
                  {jurisdiction === 'WA' && (
                    <>
                      <p>
                        • Seattle Secure Scheduling Ordinance (SMC § 14.22): 14-day advance notice
                        required
                      </p>
                      <p>
                        • Good faith estimate at hire; access to additional hours before new hires
                      </p>
                      <p>
                        • Clopening protection: Minimum 10 hours between closing and opening shifts
                      </p>
                    </>
                  )}
                  {jurisdiction === 'CA' && (
                    <>
                      <p>
                        • California Reporting Time Pay: If sent home early, paid for half scheduled
                        time (min 2h)
                      </p>
                      <p>
                        • Split shift premium: 1 additional hour at minimum wage if shift split by
                        more than 1 hour
                      </p>
                    </>
                  )}
                  {jurisdiction === 'FEDERAL_FLSA' && (
                    <>
                      <p>
                        • FLSA (29 U.S.C. § 201-219): No federal predictive scheduling requirements
                      </p>
                      <p>
                        • Employers may modify schedules; only OT protections apply after 40h/week
                      </p>
                    </>
                  )}
                </div>
              </div>

              {predictiveLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-red-600 mr-2" />
                  <span className="text-sm text-gray-500">
                    Checking predictive scheduling compliance...
                  </span>
                </div>
              ) : predictiveResults.length > 0 ? (
                <div className="space-y-3">
                  {predictiveResults.map((result, i) => (
                    <div
                      key={i}
                      className={`bg-white border rounded-xl p-4 ${!result.isCompliant ? 'border-red-200' : 'border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {result.employeeName}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                            <span>
                              Advance Notice Given:{' '}
                              <span className="font-medium text-gray-700">
                                {result.advanceNoticeGiven} days
                              </span>
                            </span>
                            <span>
                              Required:{' '}
                              <span className="font-medium text-gray-700">
                                {result.requiredAdvanceNotice} days
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          {result.isCompliant ? (
                            <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2.5 py-1 rounded-full text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Compliant
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2.5 py-1 rounded-full text-xs font-semibold">
                              <XCircle className="w-3.5 h-3.5" />
                              Non-Compliant
                            </span>
                          )}
                          {result.premiumsOwed > 0 && (
                            <p className="text-xs text-red-600 font-semibold mt-1">
                              Predictability Pay Owed: {fmtCurrency(result.premiumsOwed)}
                            </p>
                          )}
                        </div>
                      </div>

                      {result.violations.length > 0 && (
                        <div className="space-y-2">
                          {result.violations.map((v, j) => (
                            <div
                              key={j}
                              className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-xs"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-red-800">{v.law}</span>
                                <SeverityBadge severity={v.severity} />
                              </div>
                              <p className="text-red-700">{v.description}</p>
                              {v.isPredictabilityPayRequired && (
                                <p className="text-red-600 font-medium mt-1">
                                  Predictability pay: {fmtCurrency(v.predictabilityPayAmount)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Globe className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">
                    Select a jurisdiction and click &quot;Check Compliance&quot;
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Meal Breaks Tab ───────────────────────────────────────────── */}
          {activeTab === 'meal-breaks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">
                  Meal Break Violations (California)
                </h4>
                <span className="text-xs text-gray-400">
                  Cal. Lab. Code § 512 — 30-min break by 5th hour; 2nd break by 10th hour
                </span>
              </div>

              {mealBreakLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-red-600 mr-2" />
                  <span className="text-sm text-gray-500">Loading meal break violations...</span>
                </div>
              ) : mealBreakViolations.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <p className="text-xs text-red-700">
                      <span className="font-semibold">
                        {mealBreakViolations.length} meal break violation
                        {mealBreakViolations.length !== 1 ? 's' : ''} detected
                      </span>
                      {' • '}Total premium owed:{' '}
                      <span className="font-bold">
                        {fmtCurrency(mealBreakViolations.reduce((s, v) => s + v.penaltyOwed, 0))}
                      </span>
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 text-left">
                          <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">
                            Employee
                          </th>
                          <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">
                            Date
                          </th>
                          <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">
                            Shift
                          </th>
                          <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">
                            Break Taken
                          </th>
                          <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">
                            Violation
                          </th>
                          <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-right">
                            Premium
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {mealBreakViolations.map((v, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2.5 font-medium text-gray-900">
                              {v.employeeName}
                            </td>
                            <td className="px-3 py-2.5 text-gray-600">{v.date}</td>
                            <td className="px-3 py-2.5 text-gray-600">
                              {v.shiftStartTime} – {v.shiftEndTime} ({v.shiftHours}h)
                            </td>
                            <td className="px-3 py-2.5">
                              {v.breakTaken ? (
                                <span className="text-yellow-600">
                                  Yes — {v.breakDurationMinutes}min at {v.breakTime}
                                </span>
                              ) : (
                                <span className="text-red-600 font-medium">No break taken</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5">
                              {v.violations
                                .filter((r) => r.violated)
                                .map((rule, j) => (
                                  <div key={j} className="text-red-600">
                                    <span>{rule.rule}</span>
                                    <p className="text-gray-400 text-xs">{rule.legalReference}</p>
                                  </div>
                                ))}
                            </td>
                            <td className="px-3 py-2.5 text-right font-bold text-red-600">
                              {fmtCurrency(v.penaltyOwed)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-800">
                    No meal break violations detected for this period.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Clopening Tab ─────────────────────────────────────────────── */}
          {activeTab === 'clopening' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">Clopening Violations</h4>
                <span className="text-xs text-gray-400">
                  Minimum 10-11 hours gap between closing and opening shifts
                </span>
              </div>

              {clopeningLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-red-600 mr-2" />
                  <span className="text-sm text-gray-500">Detecting clopening violations...</span>
                </div>
              ) : clopeningViolations.length > 0 ? (
                <div className="space-y-3">
                  {clopeningViolations.filter((v) => v.isViolation).length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-xs font-semibold text-red-700">
                        {clopeningViolations.filter((v) => v.isViolation).length} clopening
                        violation
                        {clopeningViolations.filter((v) => v.isViolation).length !== 1 ? 's' : ''}{' '}
                        detected
                        {' • '}Total premium:{' '}
                        <span className="font-bold">
                          {fmtCurrency(
                            clopeningViolations
                              .filter((v) => v.isViolation)
                              .reduce((s, v) => s + v.premiumOwed, 0)
                          )}
                        </span>
                      </p>
                    </div>
                  )}

                  {clopeningViolations.map((v, i) => (
                    <div
                      key={i}
                      className={`bg-white border rounded-xl p-4 ${v.isViolation ? 'border-red-200' : 'border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{v.employeeName}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>
                              Close: {v.closingShift.date} at {v.closingShift.endTime}
                            </span>
                            <ChevronRight className="w-3 h-3" />
                            <span>
                              Open: {v.openingShift.date} at {v.openingShift.startTime}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-xl font-bold ${v.gapHours < v.minimumGapRequired ? 'text-red-600' : 'text-green-600'}`}
                          >
                            {v.gapHours}h gap
                          </p>
                          <p className="text-xs text-gray-400">
                            Min required: {v.minimumGapRequired}h
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {v.isViolation ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" />
                              Clopening Violation
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              Compliant
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {v.jurisdiction} — {v.legalReference}
                          </span>
                        </div>
                        {v.premiumOwed > 0 && (
                          <p className="text-sm font-bold text-red-600">
                            {fmtCurrency(v.premiumOwed)} premium owed
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-800">
                    No clopening violations detected for this period.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Compliance Report Tab ─────────────────────────────────────── */}
          {activeTab === 'report' && (
            <div className="space-y-5">
              {reportLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-red-600 mr-2" />
                  <span className="text-sm text-gray-500">Generating compliance report...</span>
                </div>
              ) : complianceReport ? (
                <>
                  {/* Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        label: 'Total Violations',
                        value: complianceReport.totalViolations,
                        color:
                          complianceReport.totalViolations > 0 ? 'text-red-600' : 'text-green-600',
                      },
                      {
                        label: 'Affected Employees',
                        value: complianceReport.affectedEmployees,
                        color: 'text-orange-600',
                      },
                      {
                        label: 'Penalty Risk',
                        value: fmtCurrency(complianceReport.totalPenaltiesRisk),
                        color: 'text-red-700',
                        small: true,
                      },
                      {
                        label: 'Compliance Score',
                        value: `${complianceReport.complianceScore}%`,
                        color:
                          complianceReport.complianceScore >= 80
                            ? 'text-green-600'
                            : 'text-red-600',
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm"
                      >
                        <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                        <p
                          className={`${stat.small ? 'text-lg' : 'text-2xl'} font-bold ${stat.color}`}
                        >
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Violations by Severity */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Violations by Severity
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {Object.entries(complianceReport.violationsBySeverity).map(
                        ([severity, count]) => (
                          <div
                            key={severity}
                            className={`text-center rounded-xl p-3 border ${SEVERITY_STYLES[severity as ViolationSeverity]}`}
                          >
                            <p className="text-lg font-bold">{count}</p>
                            <p className="text-xs font-medium mt-0.5">{severity}</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Violations by Area */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Violations by Compliance Area
                    </p>
                    <div className="space-y-2">
                      {Object.entries(complianceReport.violationsByArea)
                        .filter(([, count]) => count > 0)
                        .sort(([, a], [, b]) => b - a)
                        .map(([area, count]) => {
                          const maxCount = Math.max(
                            ...Object.values(complianceReport.violationsByArea)
                          );
                          return (
                            <div key={area} className="flex items-center gap-3">
                              <span className="text-xs font-medium text-gray-700 w-40 flex-shrink-0">
                                {area.replace('_', ' ')}
                              </span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-red-500"
                                  style={{
                                    width: maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%',
                                  }}
                                />
                              </div>
                              <span className="text-xs font-bold text-red-600 w-6 text-right">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Remediation Plan */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Remediation Plan</p>
                    <div className="space-y-2">
                      {complianceReport.remediationPlan.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow"
                        >
                          <div
                            className={`px-2 py-1 rounded text-xs font-bold flex-shrink-0 ${
                              item.priority === 'IMMEDIATE'
                                ? 'bg-red-100 text-red-700'
                                : item.priority === 'SHORT_TERM'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {item.priority.replace('_', ' ')}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-800">{item.action}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Owner: {item.owner} • Deadline: {item.deadline}
                            </p>
                          </div>
                          {item.estimatedCostSavings > 0 && (
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs text-green-600 font-semibold">
                                Save {fmtCurrency(item.estimatedCostSavings)}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trend */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-xl border ${complianceReport.trendVsPriorPeriod <= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                  >
                    <div>
                      <p
                        className={`text-sm font-semibold ${complianceReport.trendVsPriorPeriod <= 0 ? 'text-green-800' : 'text-red-800'}`}
                      >
                        Trend vs. Prior Period
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Report Date: {complianceReport.reportDate}
                      </p>
                    </div>
                    <p
                      className={`text-xl font-bold ${complianceReport.trendVsPriorPeriod <= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {complianceReport.trendVsPriorPeriod > 0 ? '+' : ''}
                      {fmtPercent(complianceReport.trendVsPriorPeriod)} violations
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
