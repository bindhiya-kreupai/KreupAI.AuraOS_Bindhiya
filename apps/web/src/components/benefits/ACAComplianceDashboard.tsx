'use client';

/**
 * @component ACAComplianceDashboard
 * @description ACA/ERISA compliance dashboard — ALE status, FTE calculation, eligible employee
 *   tracking, Form 1095-C status, filing deadlines, safe harbor, nondiscrimination tests.
 * @project AURA HCM Platform
 * @section 18.5 — ACA/ERISA Compliance
 *
 * Legal References:
 *  ACA: 26 U.S.C. § 4980H — Employer Shared Responsibility Provisions
 *  ERISA: 29 U.S.C. § 1001 et seq.
 *  ADP/ACP Tests: IRC §§ 401(k)(3) and 401(m)(2)
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Users,
  Calendar,
  Download,
  RefreshCw,
  Info,
  Building2,
  ChevronRight,
} from 'lucide-react';
import type {
  ACAStatus,
  ACAEligibleEmployee,
  NondiscriminationTestResult,
  ERISAFilingStatus,
  Form1095CStatus,
} from '@/services/acaErisaService';
import { ACAERISAService } from '@/services/acaErisaService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function daysUntil(d: string): number {
  const diff = new Date(d + 'T00:00:00').getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const FORM_STATUS_STYLES: Record<Form1095CStatus, { bg: string; text: string; label: string }> = {
  generated: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Generated' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
  error: { bg: 'bg-red-100', text: 'text-red-700', label: 'Error' },
  corrected: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Corrected' },
  sent: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Sent' },
};

const OFFER_STATUS_STYLES: Record<string, string> = {
  enrolled: 'bg-emerald-100 text-emerald-700',
  offered: 'bg-blue-100 text-blue-700',
  waived: 'bg-amber-100 text-amber-700',
  not_offered: 'bg-slate-100 text-slate-600',
};

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500">{label}</p>
        <div className={`p-1.5 rounded-lg ${bg}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Test Result Row ────────────────────────────────────────────────────────────

function TestResultRow({ test }: { test: NondiscriminationTestResult }) {
  const [expanded, setExpanded] = useState(false);
  const passed = test.result === 'pass';

  return (
    <div
      className={`border rounded-xl overflow-hidden ${passed ? 'border-emerald-200' : 'border-red-200'}`}
    >
      <button
        className={`w-full flex items-center justify-between p-4 text-left ${passed ? 'bg-emerald-50 hover:bg-emerald-100' : 'bg-red-50 hover:bg-red-100'}`}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          {passed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <div>
            <p className={`font-semibold text-sm ${passed ? 'text-emerald-800' : 'text-red-800'}`}>
              {test.testName}
            </p>
            <p className="text-xs text-slate-500">Plan Year {test.planYear}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${passed ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'}`}
          >
            {passed ? 'PASS' : 'FAIL'}
          </span>
          {expanded ? (
            <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 bg-white border-t border-slate-100">
          <div className="pt-3 space-y-2 text-xs">
            {test.hceAvgDeferralRate !== undefined && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-slate-500">HCE Avg Deferral</p>
                  <p className="font-bold text-slate-800">{test.hceAvgDeferralRate}%</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-slate-500">NHCE Avg Deferral</p>
                  <p className="font-bold text-slate-800">{test.nhceAvgDeferralRate}%</p>
                </div>
              </div>
            )}
            {test.topHeavyPercentage !== undefined && (
              <div className="bg-slate-50 rounded-lg p-2.5">
                <p className="text-slate-500">Key Employee Asset %</p>
                <p className="font-bold text-red-700">
                  {test.topHeavyPercentage}% (threshold: 60%)
                </p>
              </div>
            )}
            <p className="text-slate-600">{test.notes}</p>
            {!passed && test.correctionRequired && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="font-semibold text-red-700 mb-1">
                  Correction Required by{' '}
                  {test.correctionDeadline ? fmtDate(test.correctionDeadline) : 'N/A'}
                </p>
                <p className="text-red-600">{test.correctionMethod}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type Tab = 'overview' | 'employees' | 'forms' | 'erisa' | 'tests';

export default function ACAComplianceDashboard() {
  const [acaStatus, setAcaStatus] = useState<ACAStatus | null>(null);
  const [eligibleEmployees, setEligibleEmployees] = useState<ACAEligibleEmployee[]>([]);
  const [testResults, setTestResults] = useState<NondiscriminationTestResult[]>([]);
  const [erisFiling, setErisaFiling] = useState<ERISAFilingStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [generatingForm, setGeneratingForm] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      ACAERISAService.getACAStatus(),
      ACAERISAService.getACAEligibleEmployees(),
      ACAERISAService.getNondiscriminationTestResults(),
      ACAERISAService.getERISAFilingStatus(),
    ]).then(([status, employees, tests, filing]) => {
      setAcaStatus(status);
      setEligibleEmployees(employees);
      setTestResults(tests);
      setErisaFiling(filing);
      setLoading(false);
    });
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'ALE Overview' },
    { id: 'employees', label: 'Eligible Employees' },
    { id: 'forms', label: '1095-C Status' },
    { id: 'erisa', label: 'ERISA / Form 5500' },
    { id: 'tests', label: 'Nondiscrimination Tests' },
  ];

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );

  const enrolledCount = eligibleEmployees.filter((e) => e.offerStatus === 'enrolled').length;
  const waivedCount = eligibleEmployees.filter((e) => e.offerStatus === 'waived').length;
  const eligibleCount = eligibleEmployees.filter((e) => e.isEligible).length;
  const form1095cErrors = eligibleEmployees.filter((e) => e.form1095CStatus === 'error').length;
  const filingDeadline = `${acaStatus?.currentYear ? acaStatus.currentYear + 1 : 2027}-02-28`;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ACA / ERISA Compliance</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            ACA reporting · ERISA plan compliance · Nondiscrimination testing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold border ${acaStatus?.aleStatus === 'ale' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
          >
            <Building2 className="w-4 h-4" />
            {acaStatus?.aleStatus === 'ale' ? 'Applicable Large Employer (ALE)' : 'Not ALE'}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Full-Time Equivalents"
          value={acaStatus?.fte ?? 0}
          sub={`${acaStatus?.fullTimeEmployees} FT + part-time`}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          label="ACA Eligible"
          value={eligibleCount}
          sub={`of ${eligibleEmployees.length} tracked`}
          icon={CheckCircle2}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          label="Enrolled / Waived"
          value={`${enrolledCount}/${waivedCount}`}
          sub="enrolled vs waived"
          icon={Shield}
          color="text-purple-600"
          bg="bg-purple-50"
        />
        <StatCard
          label="1095-C Errors"
          value={form1095cErrors}
          sub={form1095cErrors > 0 ? 'Action required' : 'All clear'}
          icon={form1095cErrors > 0 ? AlertTriangle : FileText}
          color={form1095cErrors > 0 ? 'text-red-600' : 'text-slate-500'}
          bg={form1095cErrors > 0 ? 'bg-red-50' : 'bg-slate-50'}
        />
      </div>

      {/* Filing Deadline Banner */}
      <div
        className={`mb-6 rounded-xl border px-5 py-3 flex items-center gap-3 ${daysUntil(filingDeadline) < 30 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}
      >
        <Calendar
          className={`w-5 h-5 shrink-0 ${daysUntil(filingDeadline) < 30 ? 'text-red-600' : 'text-amber-600'}`}
        />
        <div className="flex-1">
          <p
            className={`text-sm font-semibold ${daysUntil(filingDeadline) < 30 ? 'text-red-800' : 'text-amber-800'}`}
          >
            ACA Form 1094-C / 1095-C Filing Deadline: {fmtDate(filingDeadline)}
          </p>
          <p
            className={`text-xs ${daysUntil(filingDeadline) < 30 ? 'text-red-600' : 'text-amber-600'}`}
          >
            {daysUntil(filingDeadline)} days remaining · IRC §§ 6055–6056 reporting requirements
          </p>
        </div>
        <button className="text-xs px-3 py-1.5 bg-white border border-current rounded-lg font-medium text-amber-700 hover:bg-amber-50">
          View Calendar
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700 bg-blue-50'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.id === 'tests' && testResults.some((t) => t.result === 'fail') && (
                <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 rounded-full">
                  {testResults.filter((t) => t.result === 'fail').length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ALE Overview */}
          {activeTab === 'overview' && acaStatus && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ALE Determination */}
                <div
                  className={`rounded-xl border p-4 ${acaStatus.isSubjectToESRP ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}
                >
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    ALE Determination
                  </p>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: 'Total Employees', value: acaStatus.totalEmployees },
                      { label: 'Full-Time (30+ hrs)', value: acaStatus.fullTimeEmployees },
                      { label: 'Full-Time Equivalents', value: acaStatus.fte },
                      { label: 'ALE Threshold', value: `${acaStatus.aleThreshold} FTEs` },
                      { label: 'ESRP Applies', value: acaStatus.isSubjectToESRP ? 'Yes' : 'No' },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between">
                        <span className="text-slate-500">{row.label}</span>
                        <span className="font-semibold text-slate-800">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safe Harbor & Affordability */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Affordability Safe Harbor
                  </p>
                  <div
                    className={`mb-3 px-3 py-2 rounded-lg ${acaStatus.affordabilityMet ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}
                  >
                    <div className="flex items-center gap-2">
                      {acaStatus.affordabilityMet ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <p
                        className={`text-sm font-semibold ${acaStatus.affordabilityMet ? 'text-emerald-800' : 'text-red-800'}`}
                      >
                        Affordability: {acaStatus.affordabilityMet ? 'MET' : 'NOT MET'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    {[
                      {
                        label: 'Safe Harbor Method',
                        value: acaStatus.safeHarbor
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase()),
                      },
                      {
                        label: 'Min Value Offered',
                        value: acaStatus.minimumValueOffered ? 'Yes' : 'No',
                      },
                      {
                        label: 'Measurement Period',
                        value: `${fmtDate(acaStatus.measurementPeriodStart)} – ${fmtDate(acaStatus.measurementPeriodEnd)}`,
                      },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between">
                        <span className="text-slate-500">{row.label}</span>
                        <span className="font-medium text-slate-700">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-1">
                    ACA Employer Shared Responsibility Payment (ESRP)
                  </p>
                  <p>
                    As an ALE with 762 FTEs, you are subject to the employer mandate (26 U.S.C. §
                    4980H). You must offer Minimum Essential Coverage (MEC) to at least 95% of
                    full-time employees and their dependents, or potentially face ESRP penalties
                    (4980H(a)/(b)).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Eligible Employees */}
          {activeTab === 'employees' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600">ACA Eligibility Tracking</p>
                <button className="flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50">
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 pr-4 text-slate-500 font-medium">Employee</th>
                      <th className="text-right py-2 px-2 text-slate-500 font-medium">
                        Avg Hrs/Wk
                      </th>
                      <th className="text-center py-2 px-2 text-slate-500 font-medium">Eligible</th>
                      <th className="text-center py-2 px-2 text-slate-500 font-medium">
                        Offer Status
                      </th>
                      <th className="text-center py-2 px-2 text-slate-500 font-medium">1095-C</th>
                      <th className="text-right py-2 pl-2 text-slate-500 font-medium">
                        Self-Only Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {eligibleEmployees.map((emp) => {
                      const formStyle = FORM_STATUS_STYLES[emp.form1095CStatus];
                      return (
                        <tr key={emp.employeeId} className="hover:bg-slate-50">
                          <td className="py-2.5 pr-4">
                            <p className="font-medium text-slate-700">{emp.name}</p>
                            <p className="text-xs text-slate-400">{emp.department}</p>
                          </td>
                          <td className="text-right py-2.5 px-2">
                            <span
                              className={
                                emp.avgHoursPerWeek >= 30
                                  ? 'text-emerald-600 font-medium'
                                  : 'text-amber-600 font-medium'
                              }
                            >
                              {emp.avgHoursPerWeek}h
                            </span>
                          </td>
                          <td className="text-center py-2.5 px-2">
                            {emp.isEligible ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-400 mx-auto" />
                            )}
                          </td>
                          <td className="text-center py-2.5 px-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full capitalize ${OFFER_STATUS_STYLES[emp.offerStatus]}`}
                            >
                              {emp.offerStatus.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="text-center py-2.5 px-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${formStyle.bg} ${formStyle.text}`}
                            >
                              {formStyle.label}
                            </span>
                          </td>
                          <td className="text-right py-2.5 pl-2 text-slate-700">
                            {emp.employeeSelfOnlyCost > 0 ? `$${emp.employeeSelfOnlyCost}/mo` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 1095-C Status */}
          {activeTab === 'forms' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600">
                  Form 1095-C Generation Status (Tax Year {acaStatus?.currentYear})
                </p>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 text-xs bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-700">
                    <FileText className="w-3.5 h-3.5" /> Generate 1094-C
                  </button>
                </div>
              </div>
              {/* Status Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
                {(['generated', 'pending', 'error', 'corrected', 'sent'] as Form1095CStatus[]).map(
                  (status) => {
                    const count = eligibleEmployees.filter(
                      (e) => e.form1095CStatus === status
                    ).length;
                    const style = FORM_STATUS_STYLES[status];
                    return (
                      <div
                        key={status}
                        className={`rounded-xl border p-3 text-center ${style.bg.replace('bg-', 'bg-').replace('-100', '-50')} border-${style.bg.replace('bg-', '').replace('-100', '-200')}`}
                      >
                        <p className={`text-2xl font-bold ${style.text}`}>{count}</p>
                        <p className={`text-xs font-medium mt-0.5 ${style.text}`}>{style.label}</p>
                      </div>
                    );
                  }
                )}
              </div>
              <div className="space-y-2">
                {eligibleEmployees.map((emp) => {
                  const formStyle = FORM_STATUS_STYLES[emp.form1095CStatus];
                  return (
                    <div
                      key={emp.employeeId}
                      className="flex items-center gap-4 p-3 border border-slate-200 rounded-xl hover:bg-slate-50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700">{emp.name}</p>
                        <p className="text-xs text-slate-400">
                          {emp.employeeId} · {emp.department}
                        </p>
                      </div>
                      <div className="text-xs text-slate-500 hidden sm:block">
                        {emp.coverageMonths.length} months coverage
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${formStyle.bg} ${formStyle.text}`}
                      >
                        {formStyle.label}
                      </span>
                      <button
                        onClick={async () => {
                          setGeneratingForm(emp.employeeId);
                          await ACAERISAService.generateForm1095C(
                            emp.employeeId,
                            acaStatus?.currentYear ?? 2026
                          );
                          setGeneratingForm(null);
                        }}
                        disabled={generatingForm === emp.employeeId}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        {generatingForm === emp.employeeId ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <FileText className="w-3 h-3" />
                        )}
                        Generate
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ERISA Tab */}
          {activeTab === 'erisa' && (
            <div>
              <p className="text-sm font-medium text-slate-600 mb-4">
                ERISA Plan Filings — Form 5500
              </p>
              <div className="space-y-3">
                {erisFiling.map((filing) => (
                  <div
                    key={`${filing.planYear}-${filing.planName}`}
                    className={`rounded-xl border p-4 ${
                      filing.status === 'filed'
                        ? 'border-emerald-200 bg-emerald-50'
                        : filing.status === 'overdue'
                          ? 'border-red-200 bg-red-50'
                          : 'border-amber-200 bg-amber-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{filing.planName}</p>
                        <p className="text-xs text-slate-500">
                          Plan Year {filing.planYear} · {filing.totalParticipants} participants
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                          filing.status === 'filed'
                            ? 'bg-emerald-200 text-emerald-800'
                            : filing.status === 'overdue'
                              ? 'bg-red-200 text-red-800'
                              : 'bg-amber-200 text-amber-800'
                        }`}
                      >
                        {filing.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                      {[
                        { label: 'Due Date', value: fmtDate(filing.form5500DueDate) },
                        {
                          label: 'Extended Due',
                          value: filing.form5500ExtendedDueDate
                            ? fmtDate(filing.form5500ExtendedDueDate)
                            : 'N/A',
                        },
                        {
                          label: 'Filed Date',
                          value: filing.filedDate ? fmtDate(filing.filedDate) : 'Not filed',
                        },
                        { label: 'Auditor', value: filing.auditorName ?? 'N/A' },
                      ].map((item) => (
                        <div key={item.label}>
                          <p className="text-slate-500 mb-0.5">{item.label}</p>
                          <p className="font-medium text-slate-700">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    {filing.totalAssets > 0 && (
                      <p className="text-xs text-slate-500 mt-2">
                        Plan assets: ${(filing.totalAssets / 1_000_000).toFixed(1)}M
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nondiscrimination Tests */}
          {activeTab === 'tests' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Nondiscrimination Test Results
                  </p>
                  <p className="text-xs text-slate-400">
                    IRC §§ 401(k)(3), 401(m)(2), 416 — Plan Year 2025
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    {testResults.filter((t) => t.result === 'pass').length} Pass
                  </span>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    {testResults.filter((t) => t.result === 'fail').length} Fail
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {testResults.map((test, i) => (
                  <TestResultRow key={i} test={test} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
