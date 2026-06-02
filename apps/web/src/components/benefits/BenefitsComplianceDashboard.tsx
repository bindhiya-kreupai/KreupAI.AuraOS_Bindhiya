'use client';

/**
 * @component BenefitsComplianceDashboard
 * @description ACA/ERISA regulatory compliance dashboard — ACA status, SPDs, nondiscrimination
 *   testing, Section 125 cafeteria plans, and HSA Form 8889 reporting.
 * @project AURA HCM Platform
 * @section 18.5 — Benefits Compliance
 * @legal ACA: 26 U.S.C. §§ 4980H, 6055, 6056; ERISA: 29 U.S.C. §§ 1021-1031;
 *   IRC § 125 cafeteria plans; IRC §§ 410(b), 401(k)(3), 401(m), 416;
 *   IRC §§ 223, 8889 HSA contribution limits.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Download,
  RefreshCw,
  Loader2,
  ChevronRight,
  BarChart3,
  Info,
} from 'lucide-react';
import type {
  ACAStatus,
  BenefitsComplianceSummary,
  NondiscriminationTestResult,
  Section125Status,
  Form8889,
  ERISASummaryPlanDescription,
  TestResult,
  ComplianceStatus,
  NondiscriminationTestType,
} from '@/services/benefitsComplianceService';
import { benefitsComplianceService } from '@/services/benefitsComplianceService';

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
    minimumFractionDigits: 0,
  }).format(n);
}

function fmtPercent(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

// ── Badge Components ───────────────────────────────────────────────────────────

const TEST_RESULT_STYLES: Record<TestResult, { bg: string; text: string; icon: React.ReactNode }> =
  {
    PASS: {
      bg: 'bg-green-100 border border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    FAIL: {
      bg: 'bg-red-100 border border-red-200',
      text: 'text-red-800',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
    MARGINAL: {
      bg: 'bg-yellow-100 border border-yellow-200',
      text: 'text-yellow-800',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    NOT_APPLICABLE: {
      bg: 'bg-gray-100 border border-gray-200',
      text: 'text-gray-600',
      icon: <Info className="w-3.5 h-3.5" />,
    },
  };

function TestResultBadge({ result }: { result: TestResult }) {
  const style = TEST_RESULT_STYLES[result];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
    >
      {style.icon}
      {result}
    </span>
  );
}

const COMPLIANCE_STATUS_STYLES: Record<ComplianceStatus, string> = {
  COMPLIANT: 'bg-green-100 text-green-800 border border-green-200',
  AT_RISK: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  VIOLATION: 'bg-red-100 text-red-800 border border-red-200',
  PENDING_REVIEW: 'bg-blue-100 text-blue-800 border border-blue-200',
};

function ComplianceBadge({ status }: { status: ComplianceStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${COMPLIANCE_STATUS_STYLES[status]}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

// ── NDT Test types list ────────────────────────────────────────────────────────

const NDT_TESTS: Array<{ type: NondiscriminationTestType; label: string; plan: string }> = [
  { type: '410B_RATIO', label: 'IRC § 410(b) Ratio Test', plan: 'all-plans' },
  { type: '410B_AVG_BENEFIT', label: 'IRC § 410(b) Average Benefit', plan: 'all-plans' },
  { type: 'ADP', label: 'IRC § 401(k)(3) ADP Test', plan: 'retirement' },
  { type: 'ACP', label: 'IRC § 401(m) ACP Test', plan: 'retirement' },
  { type: 'TOP_HEAVY', label: 'IRC § 416 Top-Heavy', plan: 'retirement' },
  { type: '125_ELIGIBILITY', label: 'IRC § 125 Eligibility Test', plan: 'cafe-001' },
  { type: '125_BENEFITS', label: 'IRC § 125 Benefits Test', plan: 'cafe-001' },
  { type: '125_KEY_EMPLOYEE', label: 'IRC § 125 Key Employee Concentration', plan: 'cafe-001' },
];

// ── Tab Types ──────────────────────────────────────────────────────────────────

type TabId = 'aca-status' | 'erisa-documents' | 'ndt' | 'section-125' | 'hsa';

const TABS: { id: TabId; label: string }[] = [
  { id: 'aca-status', label: 'ACA Status' },
  { id: 'erisa-documents', label: 'ERISA Documents' },
  { id: 'ndt', label: 'Nondiscrimination Tests' },
  { id: 'section-125', label: 'Section 125' },
  { id: 'hsa', label: 'HSA' },
];

const ERISA_PLANS = [
  {
    id: 'h-gold',
    name: 'Balanced Choice (Gold) Medical Plan',
    type: 'Medical/Health',
    updated: '2026-01-01',
    carrier: 'Blue Cross Blue Shield',
  },
  {
    id: 'd-gold',
    name: 'Comprehensive Dental Plan',
    type: 'Dental',
    updated: '2026-01-01',
    carrier: 'Delta Dental',
  },
  {
    id: 'v-basic',
    name: 'Vision Care Plan',
    type: 'Vision',
    updated: '2026-01-01',
    carrier: 'VSP Vision',
  },
  {
    id: 'life-basic',
    name: 'Group Life Insurance Plan',
    type: 'Life Insurance',
    updated: '2026-01-01',
    carrier: 'MetLife',
  },
  {
    id: 'std',
    name: 'Short-Term Disability Plan',
    type: 'Disability',
    updated: '2026-01-01',
    carrier: 'Unum',
  },
];

// ── Main Component ─────────────────────────────────────────────────────────────

export default function BenefitsComplianceDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('aca-status');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [acaStatus, setAcaStatus] = useState<ACAStatus | null>(null);
  const [complianceSummary, setComplianceSummary] = useState<BenefitsComplianceSummary | null>(
    null
  );
  const [ndtResults, setNdtResults] = useState<NondiscriminationTestResult[]>([]);
  const [section125, setSection125] = useState<Section125Status | null>(null);
  const [form8889, setForm8889] = useState<Form8889 | null>(null);
  const [selectedSPD, setSelectedSPD] = useState<ERISASummaryPlanDescription | null>(null);
  const [spdLoading, setSpdLoading] = useState<string | null>(null);
  const [runningTests, setRunningTests] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [aca, summary, s125, f8889] = await Promise.all([
        benefitsComplianceService.getACAStatus(),
        benefitsComplianceService.getBenefitsCompliance(),
        benefitsComplianceService.getSection125Status(),
        benefitsComplianceService.generateForm8889('emp-001', new Date().getFullYear()),
      ]);
      setAcaStatus(aca);
      setComplianceSummary(summary);
      setSection125(s125);
      setForm8889(f8889);
    } catch (err: any) {
      console.error('BenefitsComplianceDashboard load error:', err);
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

  const handleRunAllTests = async () => {
    setRunningTests(true);
    setNdtResults([]);
    try {
      const results = await Promise.all(
        NDT_TESTS.map((t) => benefitsComplianceService.runNondiscriminationTest(t.plan, t.type))
      );
      setNdtResults(results);
    } catch (err: any) {
      console.error('NDT error:', err);
    } finally {
      setRunningTests(false);
    }
  };

  const handleViewSPD = async (planId: string) => {
    setSpdLoading(planId);
    try {
      const spd = await benefitsComplianceService.getERISASPD(planId);
      setSelectedSPD(selectedSPD?.planId === planId ? null : spd);
    } catch (err: any) {
      console.error('SPD error:', err);
    } finally {
      setSpdLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600 text-sm">Loading compliance dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Benefits Compliance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            ACA § 4980H • ERISA § 1021 • IRC § 125 • IRC § 410(b) • IRC § 8889
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
      {complianceSummary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Overall', status: complianceSummary.overallStatus },
            { label: 'ACA', status: complianceSummary.acaCompliance },
            { label: 'ERISA', status: complianceSummary.erisaCompliance },
            { label: 'Sec. 125', status: complianceSummary.section125Compliance },
            { label: 'NDT', status: complianceSummary.ndtResults },
            { label: 'HSA', status: complianceSummary.hsaCompliance },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center"
            >
              <p className="text-xs font-medium text-gray-500 mb-1.5">{item.label}</p>
              <ComplianceBadge status={item.status} />
            </div>
          ))}
        </div>
      )}

      {/* Open Issues */}
      {complianceSummary && complianceSummary.openIssues.length > 0 && (
        <div className="space-y-2">
          {complianceSummary.openIssues.map((issue) => (
            <div
              key={issue.id}
              className={`flex items-start gap-3 p-3 rounded-xl border ${
                issue.severity === 'CRITICAL'
                  ? 'bg-red-50 border-red-200'
                  : issue.severity === 'WARNING'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-blue-50 border-blue-200'
              }`}
            >
              {issue.severity === 'CRITICAL' ? (
                <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              ) : issue.severity === 'WARNING' ? (
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold ${issue.severity === 'CRITICAL' ? 'text-red-800' : issue.severity === 'WARNING' ? 'text-yellow-800' : 'text-blue-800'}`}
                >
                  {issue.area}
                </p>
                <p
                  className={`text-xs mt-0.5 ${issue.severity === 'CRITICAL' ? 'text-red-700' : issue.severity === 'WARNING' ? 'text-yellow-700' : 'text-blue-700'}`}
                >
                  {issue.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Remediation: {issue.remediation} • Due {fmtDate(issue.dueDate)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 px-4 pt-4 overflow-x-auto" aria-label="Compliance tabs">
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
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* ── ACA Status Tab ─────────────────────────────────────────────── */}
          {activeTab === 'aca-status' && acaStatus && (
            <div className="space-y-6">
              {/* ALE Determination */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    ALE Determination (26 U.S.C. § 4980H)
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {acaStatus.isALE
                      ? 'Applicable Large Employer (ALE)'
                      : 'Non-ALE — Reporting Optional'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {acaStatus.fullTimeEmployees} full-time employees +{' '}
                    {acaStatus.partTimeEquivalents} part-time equivalents = {acaStatus.totalFTEs}{' '}
                    FTEs
                  </p>
                </div>
                <div
                  className={`px-4 py-2 rounded-xl font-semibold text-sm ${acaStatus.isALE ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-green-100 text-green-800 border border-green-200'}`}
                >
                  {acaStatus.isALE ? 'ALE — Mandate Applies' : 'Non-ALE'}
                </div>
              </div>

              {/* 95% Rule */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">95% Rule — Coverage Offered</p>
                  <span
                    className={`flex items-center gap-1 text-sm font-semibold ${acaStatus.ninetyFivePercentRule ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {acaStatus.ninetyFivePercentRule ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {acaStatus.ninetyFivePercentRule ? 'SAFE HARBOR MET' : 'AT RISK'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${acaStatus.coverageOfferedPercent >= 95 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, acaStatus.coverageOfferedPercent)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    Coverage offered to {fmtPercent(acaStatus.coverageOfferedPercent)} of FT
                    employees
                  </span>
                  <span className="text-xs text-gray-400">Required: 95%</span>
                </div>
              </div>

              {/* Affordability Test */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Affordability Test — § 36B Safe Harbor
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Safe Harbor Method</span>
                      <span className="font-semibold text-gray-800 bg-blue-50 px-2 py-0.5 rounded">
                        {acaStatus.affordabilityTest.safeHarborMethod.replace(/_/g, ' ')} Safe
                        Harbor
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">2026 Affordability Threshold</span>
                      <span className="font-semibold text-gray-800">
                        {fmtPercent(acaStatus.affordabilityTest.affordabilityThresholdPercent)} of
                        household income
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Lowest-Cost Employee Share</span>
                      <span className="font-semibold text-gray-800">
                        {fmtCurrency(acaStatus.affordabilityTest.employeeCostLowest)}/month
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Employees Failing Affordability</span>
                      <span
                        className={`font-semibold ${acaStatus.affordabilityTest.employeesFailingAffordability > 0 ? 'text-orange-600' : 'text-green-600'}`}
                      >
                        {acaStatus.affordabilityTest.employeesFailingAffordability}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div
                      className={`text-center px-6 py-4 rounded-xl border-2 ${acaStatus.affordabilityTest.isAffordable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                    >
                      {acaStatus.affordabilityTest.isAffordable ? (
                        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-1" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-500 mx-auto mb-1" />
                      )}
                      <p
                        className={`text-sm font-bold ${acaStatus.affordabilityTest.isAffordable ? 'text-green-800' : 'text-red-800'}`}
                      >
                        {acaStatus.affordabilityTest.isAffordable ? 'AFFORDABLE' : 'NOT AFFORDABLE'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* MEC/MV Compliance */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  MEC & MV Coverage Compliance
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      label: 'Minimum Essential Coverage (MEC)',
                      pct: acaStatus.mecCompliance.percentEmployeesMEC,
                      compliant: acaStatus.mecCompliance.isMECCompliant,
                      plans: acaStatus.mecCompliance.plansWithMEC,
                    },
                    {
                      label: 'Minimum Value (MV) — 60% actuarial',
                      pct: acaStatus.mecCompliance.percentEmployeesMV,
                      compliant: acaStatus.mecCompliance.isMVCompliant,
                      plans: acaStatus.mecCompliance.plansWithMV,
                    },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-700">{item.label}</p>
                        {item.compliant ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className={`h-2 rounded-full ${item.compliant ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(100, item.pct)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{fmtPercent(item.pct)} coverage</p>
                      <p className="text-xs text-gray-400 mt-1">{item.plans.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filing Status */}
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs font-semibold text-blue-800">1095-C Forms Ready</p>
                    <p className="text-xs text-blue-700">
                      IRS filing deadline: {fmtDate(acaStatus.filingDeadline)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-800">{acaStatus.formsReady1095C}</p>
                  <p className="text-xs text-blue-600">forms generated</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-xs font-semibold text-gray-600">
                  Employer Penalty Risk Assessment
                </p>
                <p className="text-xs text-gray-700 mt-0.5">{acaStatus.employerPenaltyRisk}</p>
              </div>
            </div>
          )}

          {/* ── ERISA Documents Tab ─────────────────────────────────────────── */}
          {activeTab === 'erisa-documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">
                  Summary Plan Descriptions (SPDs)
                </h3>
                <span className="text-xs text-gray-400">
                  ERISA § 104(b) — Required within 90 days of enrollment
                </span>
              </div>

              {ERISA_PLANS.map((plan) => (
                <div key={plan.id} className="bg-white border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
                        <p className="text-xs text-gray-500">
                          {plan.carrier} • {plan.type} • Updated {fmtDate(plan.updated)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
                        Current
                      </span>
                      <button
                        onClick={() => handleViewSPD(plan.id)}
                        disabled={spdLoading === plan.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        {spdLoading === plan.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                        View SPD
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                        Download PDF
                      </button>
                    </div>
                  </div>

                  {/* SPD Detail Panel */}
                  {selectedSPD && selectedSPD.planId === plan.id && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Eligibility
                            </p>
                            <p className="text-xs text-gray-700">
                              {selectedSPD.eligibilityRequirements}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Benefits
                            </p>
                            <p className="text-xs text-gray-700">
                              {selectedSPD.benefitsDescription}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Claims Procedure
                            </p>
                            <p className="text-xs text-gray-700 line-clamp-3">
                              {selectedSPD.claimsProcedure}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Participant Rights (ERISA § 502)
                            </p>
                            <ul className="space-y-1">
                              {selectedSPD.participantRights.slice(0, 4).map((right, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-1.5 text-xs text-gray-600"
                                >
                                  <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-500" />
                                  {right}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Plan Administration
                            </p>
                            <p className="text-xs text-gray-700">{selectedSPD.planAdministrator}</p>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span>
                              <span className="text-gray-500">Plan #:</span>{' '}
                              <span className="font-medium text-gray-800">
                                {selectedSPD.planNumber}
                              </span>
                            </span>
                            <span>
                              <span className="text-gray-500">Plan Year End:</span>{' '}
                              <span className="font-medium text-gray-800">
                                {selectedSPD.planYearEnd}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Nondiscrimination Tests Tab ─────────────────────────────────── */}
          {activeTab === 'ndt' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Nondiscrimination Testing</h3>
                <button
                  onClick={handleRunAllTests}
                  disabled={runningTests}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {runningTests ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <BarChart3 className="w-4 h-4" />
                  )}
                  {runningTests ? 'Running Tests...' : 'Run All Tests'}
                </button>
              </div>

              {ndtResults.length === 0 && !runningTests && (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Click &quot;Run All Tests&quot; to execute nondiscrimination testing
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Tests run: IRC §§ 410(b), 401(k)(3), 401(m), 416, 125
                  </p>
                </div>
              )}

              {ndtResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ndtResults.map((result, i) => (
                    <div
                      key={i}
                      className={`bg-white border rounded-xl p-4 ${
                        result.result === 'FAIL'
                          ? 'border-red-200'
                          : result.result === 'MARGINAL'
                            ? 'border-yellow-200'
                            : 'border-green-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {NDT_TESTS[i]?.label ?? result.testType}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Plan: {result.planName} • {result.testYear}
                          </p>
                        </div>
                        <TestResultBadge result={result.result} />
                      </div>
                      <div className="space-y-1 mt-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Threshold</span>
                          <span className="font-semibold text-gray-800">
                            {result.details.threshold}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Actual Result</span>
                          <span
                            className={`font-semibold ${result.result === 'PASS' ? 'text-green-700' : result.result === 'FAIL' ? 'text-red-700' : 'text-yellow-700'}`}
                          >
                            {result.details.actualValue}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Participants</span>
                          <span className="font-semibold text-gray-700">
                            {result.details.participantsIncluded}
                          </span>
                        </div>
                        {result.details.highlyCompensatedEmployees !== undefined && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">HCE / NHCE</span>
                            <span className="font-semibold text-gray-700">
                              {result.details.highlyCompensatedEmployees} /{' '}
                              {result.details.nonHighlyCompensatedEmployees}
                            </span>
                          </div>
                        )}
                      </div>
                      {result.recommendations.length > 0 && result.result !== 'PASS' && (
                        <div
                          className={`mt-3 p-2 rounded-lg text-xs ${result.result === 'FAIL' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}
                        >
                          <p className="font-semibold mb-1">Recommendation</p>
                          <p>{result.recommendations[0]}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Section 125 Tab ─────────────────────────────────────────────── */}
          {activeTab === 'section-125' && section125 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Cafeteria Plan Status</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${section125.isCompliant ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}
                >
                  {section125.isCompliant ? 'COMPLIANT' : 'REQUIRES ATTENTION'}
                </span>
              </div>

              {/* Plan Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Eligibility Test', result: section125.eligibilityTestResult },
                  { label: 'Benefits Test', result: section125.benefitsTestResult },
                  { label: 'Key Employee Test', result: section125.keyEmployeeConcentrationTest },
                  {
                    label: 'Overall Status',
                    result: section125.isCompliant
                      ? ('PASS' as TestResult)
                      : ('FAIL' as TestResult),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center"
                  >
                    <p className="text-xs text-gray-500 mb-2">{item.label}</p>
                    <TestResultBadge result={item.result} />
                  </div>
                ))}
              </div>

              {/* Plan Year */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{section125.planName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{section125.planYear}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-gray-500">
                      Last Tested:{' '}
                      <span className="text-gray-700 font-medium">
                        {fmtDate(section125.lastTestedDate)}
                      </span>
                    </p>
                    <p className="text-gray-500 mt-0.5">
                      Next Test Due:{' '}
                      <span className="text-gray-700 font-medium">
                        {fmtDate(section125.nextTestDue)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* FSA Accounts */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Flexible Spending Accounts
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section125.flexibleSpendingAccounts.map((fsa) => (
                    <div key={fsa.type} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-800">
                          {fsa.type === 'HEALTHCARE'
                            ? 'Healthcare FSA'
                            : fsa.type === 'DEPENDENT_CARE'
                              ? 'Dependent Care FSA'
                              : 'Adoption FSA'}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${fsa.isWithinLimits ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {fsa.isWithinLimits ? 'Within Limits' : 'Over Limit'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Annual Election Limit (2026)</span>
                          <span className="font-semibold text-gray-800">
                            {fmtCurrency(fsa.annualElectionLimit)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Average Employee Election</span>
                          <span className="font-semibold text-gray-800">
                            {fmtCurrency(fsa.averageElection)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-500">Participation Rate</span>
                            <span className="font-semibold text-gray-800">
                              {fmtPercent(fsa.participationRate)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-blue-500"
                              style={{ width: `${Math.min(100, fsa.participationRate)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── HSA Tab ─────────────────────────────────────────────────────── */}
          {activeTab === 'hsa' && form8889 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">
                  IRS Form 8889 — HSA Reporting
                </h3>
                <span className="text-xs text-gray-400">
                  IRC §§ 223 & 8889 — Tax Year {form8889.formYear}
                </span>
              </div>

              {/* HSA Contribution Limits */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">
                  2026 HSA Contribution Limits (IRS)
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Self-Only HDHP', limit: '$4,300', change: '+$100 vs 2025' },
                    { label: 'Family HDHP', limit: '$8,550', change: '+$250 vs 2025' },
                    { label: 'Age 55+ Catch-Up', limit: '$1,000', change: 'Unchanged' },
                    {
                      label: 'HDHP Min Deductible (Self)',
                      limit: '$1,650',
                      change: '+$50 vs 2025',
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-blue-700">{item.label}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-blue-900">{item.limit}</span>
                        <p className="text-xs text-blue-500">{item.change}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employee Form 8889 */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Form 8889 — {form8889.employeeName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Coverage: {form8889.coverageType} HDHP • Tax Year {form8889.formYear}
                    </p>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    Generate Form 8889
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Part I — Contributions
                    </p>
                    {[
                      {
                        label: 'Employee Contributions',
                        value: form8889.hsaContributions.employeeContributions,
                      },
                      {
                        label: 'Employer Contributions',
                        value: form8889.hsaContributions.employerContributions,
                      },
                      {
                        label: 'Total Contributions',
                        value: form8889.hsaContributions.totalContributions,
                        bold: true,
                      },
                      { label: 'Annual Limit', value: form8889.hsaContributions.annualLimit },
                      {
                        label: 'Excess Contributions',
                        value: form8889.hsaContributions.excessContributions,
                        alert: form8889.hsaContributions.excessContributions > 0,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0"
                      >
                        <span
                          className={`text-xs ${item.alert ? 'text-red-600' : 'text-gray-600'}`}
                        >
                          {item.label}
                        </span>
                        <span
                          className={`text-sm font-${item.bold ? 'bold' : 'semibold'} ${item.alert && item.value > 0 ? 'text-red-600' : 'text-gray-900'}`}
                        >
                          {fmtCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                    {/* Utilization Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Contribution Utilization</span>
                        <span className="font-medium text-gray-700">
                          {fmtPercent(
                            (form8889.hsaContributions.totalContributions /
                              form8889.hsaContributions.annualLimit) *
                              100
                          )}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-teal-500 transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (form8889.hsaContributions.totalContributions / form8889.hsaContributions.annualLimit) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Part II — Distributions
                    </p>
                    {[
                      {
                        label: 'Qualified Medical Expenses',
                        value: form8889.qualifiedMedicalExpenses,
                      },
                      {
                        label: 'Non-Medical Distributions',
                        value: form8889.distributionsForNonMedical,
                        alert: form8889.distributionsForNonMedical > 0,
                      },
                      {
                        label: 'Taxable Distributions',
                        value: form8889.taxableDistributions,
                        alert: form8889.taxableDistributions > 0,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0"
                      >
                        <span
                          className={`text-xs ${item.alert ? 'text-red-600' : 'text-gray-600'}`}
                        >
                          {item.label}
                        </span>
                        <span
                          className={`text-sm font-semibold ${item.alert && item.value > 0 ? 'text-red-600' : 'text-gray-900'}`}
                        >
                          {fmtCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                    {form8889.taxableDistributions === 0 &&
                      form8889.hsaContributions.excessContributions === 0 && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          No tax penalties — contributions within limits
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Upcoming Deadlines */}
              {complianceSummary && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Upcoming Compliance Deadlines
                  </p>
                  <div className="space-y-2">
                    {complianceSummary.upcomingDeadlines.map((dl, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{dl.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {dl.description} — {dl.responsible}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          <span className="text-xs text-gray-600">{fmtDate(dl.dueDate)}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              dl.status === 'COMPLETE'
                                ? 'bg-green-100 text-green-700'
                                : dl.status === 'IN_PROGRESS'
                                  ? 'bg-blue-100 text-blue-700'
                                  : dl.status === 'OVERDUE'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {dl.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
