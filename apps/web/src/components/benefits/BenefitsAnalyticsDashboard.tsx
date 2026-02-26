'use client';

/**
 * @component BenefitsAnalyticsDashboard
 * @description Benefits analytics — plan utilization, cost analysis, year-over-year trends,
 *   plan performance comparisons, wellness ROI, and total compensation statements.
 * @project AURA HCM Platform
 * @section 18.7 — Benefits Analytics & Reporting
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  DollarSign,
  Users,
  Heart,
  RefreshCw,
  Loader2,
  Star,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Minus,
} from 'lucide-react';
import type {
  UtilizationReport,
  CostAnalysis,
  BenefitsTrend,
  TotalBenefitsStatement,
  WellnessROI,
  PlanComparisonReport,
  CostCategory,
} from '@/services/benefitsAnalyticsService';
import { benefitsAnalyticsService } from '@/services/benefitsAnalyticsService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtCurrency(n: number, compact = false): string {
  if (compact && n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (compact && n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(n);
}

function fmtPercent(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

function TrendIcon({ value }: { value: number | null }) {
  if (value === null) return <Minus className="w-3.5 h-3.5 text-gray-400" />;
  if (value > 0) return <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />;
  return <ArrowDownRight className="w-3.5 h-3.5 text-green-500" />;
}

const CATEGORY_COLORS: Record<CostCategory, string> = {
  MEDICAL: 'bg-blue-500',
  DENTAL: 'bg-indigo-500',
  VISION: 'bg-purple-500',
  LIFE: 'bg-teal-500',
  DISABILITY: 'bg-cyan-500',
  FSA: 'bg-green-500',
  HSA: 'bg-emerald-500',
  WELLNESS: 'bg-orange-500',
  EAP: 'bg-amber-500',
  RETIREMENT: 'bg-rose-500',
};

// ── Tab Types ──────────────────────────────────────────────────────────────────

type TabId = 'utilization' | 'cost-analysis' | 'trends' | 'plan-performance' | 'wellness-roi';

const TABS: { id: TabId; label: string }[] = [
  { id: 'utilization', label: 'Utilization' },
  { id: 'cost-analysis', label: 'Cost Analysis' },
  { id: 'trends', label: 'Trends' },
  { id: 'plan-performance', label: 'Plan Performance' },
  { id: 'wellness-roi', label: 'Wellness ROI' },
];

const PLAN_REC_STYLES: Record<string, string> = {
  RETAIN: 'bg-green-100 text-green-800 border border-green-200',
  RENEGOTIATE: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  REPLACE: 'bg-red-100 text-red-800 border border-red-200',
  MONITOR: 'bg-blue-100 text-blue-800 border border-blue-200',
};

// ── Main Component ─────────────────────────────────────────────────────────────

export default function BenefitsAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('utilization');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [utilization, setUtilization] = useState<UtilizationReport | null>(null);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis | null>(null);
  const [trends, setTrends] = useState<BenefitsTrend | null>(null);
  const [planComparison, setPlanComparison] = useState<PlanComparisonReport | null>(null);
  const [wellnessROI, setWellnessROI] = useState<WellnessROI | null>(null);
  const [totalStatement, setTotalStatement] = useState<TotalBenefitsStatement | null>(null);
  const [showStatement, setShowStatement] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentMonth = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  const loadData = useCallback(async () => {
    try {
      const [util, cost, trend, wellness, statement] = await Promise.all([
        benefitsAnalyticsService.getUtilizationReport(currentMonth, 'MONTHLY'),
        benefitsAnalyticsService.getCostAnalysis(String(currentYear), 'ANNUAL'),
        benefitsAnalyticsService.getBenefitsTrend(5),
        benefitsAnalyticsService.getWellnessROI(),
        benefitsAnalyticsService.getTotalBenefitsStatement('emp-001'),
      ]);
      setUtilization(util);
      setCostAnalysis(cost);
      setTrends(trend);
      setWellnessROI(wellness);
      setTotalStatement(statement);
    } catch (err) {
      console.error('BenefitsAnalyticsDashboard load error:', err);
    }
  }, []);

  const loadPlanComparison = useCallback(async () => {
    if (planComparison) return;
    try {
      const comparison = await benefitsAnalyticsService.getPlanComparisonReport(
        String(currentYear)
      );
      setPlanComparison(comparison);
    } catch (err) {
      console.error('Plan comparison error:', err);
    }
  }, [planComparison]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  useEffect(() => {
    if (activeTab === 'plan-performance') {
      loadPlanComparison();
    }
  }, [activeTab, loadPlanComparison]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPlanComparison(null);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600 text-sm">Loading benefits analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Benefits Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Plan utilization, cost analysis, trends, and total compensation reporting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStatement(!showStatement)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Total Comp Statement
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Total Benefits Statement Panel */}
      {showStatement && totalStatement && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-lg">Total Compensation Statement</p>
              <p className="text-indigo-200 text-sm">
                {totalStatement.employeeName} — {totalStatement.statementYear}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white text-2xl font-bold">
                {fmtCurrency(totalStatement.totalCompensationValue)}
              </p>
              <p className="text-indigo-200 text-xs">Total compensation value</p>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center bg-blue-50 rounded-xl p-3 border border-blue-200">
                <p className="text-xs text-blue-600 font-medium">Base Salary</p>
                <p className="text-xl font-bold text-blue-900">
                  {fmtCurrency(totalStatement.salary)}
                </p>
              </div>
              <div className="text-center bg-green-50 rounded-xl p-3 border border-green-200">
                <p className="text-xs text-green-600 font-medium">Employer Benefits Value</p>
                <p className="text-xl font-bold text-green-900">
                  {fmtCurrency(totalStatement.totalBenefitsValue)}
                </p>
              </div>
              <div className="text-center bg-purple-50 rounded-xl p-3 border border-purple-200">
                <p className="text-xs text-purple-600 font-medium">Benefits as % of Salary</p>
                <p className="text-xl font-bold text-purple-900">
                  {fmtPercent(totalStatement.benefitsAsPercentSalary)}
                </p>
              </div>
            </div>

            {/* Benefits Line Items */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 text-left">
                    <th className="pb-2 pr-4 font-semibold uppercase tracking-wide">Benefit</th>
                    <th className="pb-2 pr-4 font-semibold uppercase tracking-wide">Plan</th>
                    <th className="pb-2 pr-4 font-semibold uppercase tracking-wide text-right">
                      Employer Value
                    </th>
                    <th className="pb-2 pr-4 font-semibold uppercase tracking-wide text-right">
                      Employee Contrib.
                    </th>
                    <th className="pb-2 font-semibold uppercase tracking-wide text-right">
                      Total Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {totalStatement.benefitsSummary.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-1.5 pr-4 font-medium text-gray-800">{item.category}</td>
                      <td className="py-1.5 pr-4 text-gray-500">{item.planName}</td>
                      <td className="py-1.5 pr-4 text-right font-medium text-green-700">
                        {fmtCurrency(item.employerAnnualValue)}
                      </td>
                      <td className="py-1.5 pr-4 text-right text-gray-600">
                        {fmtCurrency(item.employeeAnnualContribution)}
                      </td>
                      <td className="py-1.5 text-right font-semibold text-gray-900">
                        {fmtCurrency(item.totalAnnualValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Market Position */}
            <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="text-xs font-semibold text-gray-600">Market Position</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {totalStatement.comparisonToMarket.source}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Market Median</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {fmtCurrency(totalStatement.comparisonToMarket.marketMedianBenefitsValue)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    totalStatement.comparisonToMarket.position === 'ABOVE_MARKET'
                      ? 'bg-green-100 text-green-800'
                      : totalStatement.comparisonToMarket.position === 'AT_MARKET'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {totalStatement.comparisonToMarket.position.replace(/_/g, ' ')}
                  <span className="ml-1 text-xs opacity-75">
                    {totalStatement.comparisonToMarket.percentile}th %ile
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      {utilization && costAnalysis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total Claims (MTD)
              </span>
              <BarChart3 className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {utilization.totalClaims.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              PMPM: {fmtCurrency(utilization.paidPMPM)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Annual Benefits Cost
              </span>
              <DollarSign className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {fmtCurrency(costAnalysis.totalBenefitsCost, true)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {fmtPercent(costAnalysis.benefitsCostAsPercentPayroll)} of payroll
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Cost Per Employee
              </span>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {fmtCurrency(costAnalysis.costPerEmployee)}
            </p>
            <p
              className={`text-xs mt-0.5 flex items-center gap-0.5 ${costAnalysis.budgetVariance > 0 ? 'text-red-500' : 'text-green-500'}`}
            >
              <TrendIcon value={costAnalysis.budgetVariance} />
              {costAnalysis.budgetVariance > 0 ? '+' : ''}
              {fmtCurrency(Math.abs(costAnalysis.budgetVariance))} vs budget
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Preventive Care Rate
              </span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {fmtPercent(utilization.preventiveCareRate)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Benchmark: 70%+</p>
          </div>
        </div>
      )}

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
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* ── Utilization Tab ─────────────────────────────────────────────── */}
          {activeTab === 'utilization' && utilization && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Enrollment by Category */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Utilization by Category
                  </h4>
                  <div className="space-y-2.5">
                    {utilization.utilizationByCategory.map((cat) => (
                      <div key={cat.category}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-gray-700">{cat.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">{cat.claimsCount} claims</span>
                            <span className="font-semibold text-gray-900">
                              {fmtCurrency(cat.totalPaid, true)}
                            </span>
                            <span
                              className={`flex items-center gap-0.5 ${cat.changeVsPriorPeriod > 0 ? 'text-red-500' : 'text-green-500'}`}
                            >
                              <TrendIcon value={cat.changeVsPriorPeriod} />
                              {Math.abs(cat.changeVsPriorPeriod).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${CATEGORY_COLORS[cat.category] ?? 'bg-blue-500'}`}
                            style={{ width: `${cat.percentOfTotal}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-xs text-gray-400">
                            {fmtPercent(cat.percentOfTotal)} of total
                          </span>
                          <span className="text-xs text-gray-400">
                            Utilization: {fmtPercent(cat.utilizationRate)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Diagnoses */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Top Diagnoses (ICD-10)
                  </h4>
                  <div className="space-y-2">
                    {utilization.topDiagnoses.map((dx) => (
                      <div
                        key={dx.icdCode}
                        className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              {dx.icdCode}
                            </span>
                            <span className="text-xs font-medium text-gray-800 truncate">
                              {dx.description}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {dx.claimsCount} claims • {dx.affectedMembers} members
                          </p>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <p className="text-sm font-bold text-gray-900">
                            {fmtCurrency(dx.totalPaid, true)}
                          </p>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                              dx.trend === 'INCREASING'
                                ? 'bg-red-100 text-red-700'
                                : dx.trend === 'DECREASING'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {dx.trend}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* PMPM Metrics */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: 'Claims Per Member Per Month',
                    value: utilization.claimsPerMemberMonth.toFixed(2),
                  },
                  { label: 'Paid PMPM', value: fmtCurrency(utilization.paidPMPM) },
                  { label: 'Member Months', value: utilization.memberMonths.toLocaleString() },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="bg-gray-50 rounded-xl border border-gray-200 p-3 text-center"
                  >
                    <p className="text-xs text-gray-500 mb-1">{m.label}</p>
                    <p className="text-lg font-bold text-gray-900">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Cost Analysis Tab ────────────────────────────────────────────── */}
          {activeTab === 'cost-analysis' && costAnalysis && (
            <div className="space-y-5">
              {/* Employer vs Employee Split */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Employer vs Employee Cost Split
                </h4>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1">
                    <div className="w-full h-5 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-blue-500 flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${costAnalysis.employerPercent}%` }}
                      >
                        {costAnalysis.employerPercent}%
                      </div>
                      <div
                        className="h-full bg-orange-400 flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${costAnalysis.employeePercent}%` }}
                      >
                        {costAnalysis.employeePercent}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Employer:{' '}
                    {fmtCurrency(costAnalysis.employerCost, true)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-orange-400 inline-block" /> Employee:{' '}
                    {fmtCurrency(costAnalysis.employeeCost, true)}
                  </span>
                </div>
              </div>

              {/* Cost by Category bars */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Cost Breakdown by Category
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500 text-left">
                        <th className="pb-2 pr-4 font-semibold uppercase tracking-wide">
                          Category
                        </th>
                        <th className="pb-2 pr-4 font-semibold uppercase tracking-wide text-right">
                          Employer
                        </th>
                        <th className="pb-2 pr-4 font-semibold uppercase tracking-wide text-right">
                          Employee
                        </th>
                        <th className="pb-2 pr-4 font-semibold uppercase tracking-wide text-right">
                          Total
                        </th>
                        <th className="pb-2 pr-4 font-semibold uppercase tracking-wide text-right">
                          Per Employee
                        </th>
                        <th className="pb-2 font-semibold uppercase tracking-wide text-right">
                          Participation
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {costAnalysis.costByCategory.map((cat) => (
                        <tr key={cat.category} className="hover:bg-gray-50">
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-1.5">
                              <div
                                className={`w-2.5 h-2.5 rounded-sm ${CATEGORY_COLORS[cat.category] ?? 'bg-gray-400'}`}
                              />
                              <span className="font-medium text-gray-800">{cat.category}</span>
                            </div>
                          </td>
                          <td className="py-2 pr-4 text-right font-medium text-blue-700">
                            {fmtCurrency(cat.employerPremium, true)}
                          </td>
                          <td className="py-2 pr-4 text-right text-gray-600">
                            {fmtCurrency(cat.employeePremium, true)}
                          </td>
                          <td className="py-2 pr-4 text-right font-bold text-gray-900">
                            {fmtCurrency(cat.totalCost, true)}
                          </td>
                          <td className="py-2 pr-4 text-right text-gray-700">
                            {fmtCurrency(cat.costPerEmployee)}
                          </td>
                          <td className="py-2 text-right">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.participationRate >= 80 ? 'bg-green-100 text-green-700' : cat.participationRate >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}
                            >
                              {fmtPercent(cat.participationRate)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Budget Variance */}
              <div
                className={`flex items-center justify-between p-4 rounded-xl border ${costAnalysis.budgetVariance > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}
              >
                <div>
                  <p
                    className={`text-sm font-semibold ${costAnalysis.budgetVariance > 0 ? 'text-red-800' : 'text-green-800'}`}
                  >
                    Budget Variance — {currentYear}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${costAnalysis.budgetVariance > 0 ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {costAnalysis.budgetVariance > 0 ? 'Over budget by' : 'Under budget by'}{' '}
                    {fmtCurrency(Math.abs(costAnalysis.budgetVariance))} (
                    {fmtPercent(Math.abs(costAnalysis.budgetVariancePercent))})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Projected Annual</p>
                  <p
                    className={`text-lg font-bold ${costAnalysis.budgetVariance > 0 ? 'text-red-700' : 'text-green-700'}`}
                  >
                    {fmtCurrency(costAnalysis.projectedAnnualCost, true)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Trends Tab ──────────────────────────────────────────────────── */}
          {activeTab === 'trends' && trends && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">
                  Year-over-Year Cost Trends (5-Year)
                </h4>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-500">CAGR:</span>
                  <span className="font-bold text-gray-900">
                    {fmtPercent(trends.compoundAnnualGrowthRate)}
                  </span>
                  <span className="text-gray-500">Medical Inflation:</span>
                  <span className="font-bold text-red-600">
                    {fmtPercent(trends.inflation.medicalInflation)}
                  </span>
                </div>
              </div>

              {/* Trend Chart (horizontal bar visualization) */}
              <div className="space-y-3">
                {trends.years.map((yr) => {
                  const maxCost = Math.max(...trends.years.map((y) => y.totalCost));
                  const pct = (yr.totalCost / maxCost) * 100;
                  const ePct = (yr.employerCost / yr.totalCost) * 100;
                  return (
                    <div key={yr.year} className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-600 w-12 flex-shrink-0">
                        {yr.year}
                      </span>
                      <div className="flex-1 relative">
                        <div className="w-full bg-gray-100 rounded-full h-7 overflow-hidden">
                          <div
                            className="h-full flex items-center overflow-hidden rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          >
                            <div className="h-full bg-blue-500" style={{ width: `${ePct}%` }} />
                            <div className="h-full bg-orange-400 flex-1" />
                          </div>
                        </div>
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-800">
                          {fmtCurrency(yr.totalCost, true)}
                        </span>
                      </div>
                      <div className="w-24 flex-shrink-0 text-right">
                        {yr.changePercent !== null ? (
                          <span
                            className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${yr.changePercent > 0 ? 'text-red-500' : 'text-green-500'}`}
                          >
                            <TrendIcon value={yr.changePercent} />
                            {yr.changePercent > 0 ? '+' : ''}
                            {fmtPercent(yr.changePercent)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">baseline</span>
                        )}
                        <p className="text-xs text-gray-400">{yr.enrollment} enrolled</p>
                      </div>
                    </div>
                  );
                })}

                {/* Projection */}
                <div className="flex items-center gap-3 border-t border-dashed border-gray-300 pt-3">
                  <span className="text-xs font-semibold text-purple-600 w-12 flex-shrink-0">
                    {currentYear + 1}*
                  </span>
                  <div className="flex-1 relative">
                    <div className="w-full bg-gray-100 rounded-full h-7 overflow-hidden">
                      <div
                        className="h-full bg-purple-300 rounded-full transition-all duration-500 flex items-center"
                        style={{
                          width: `${(trends.projectedNextYear / Math.max(...trends.years.map((y) => y.totalCost), trends.projectedNextYear)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-700">
                      {fmtCurrency(trends.projectedNextYear, true)}
                    </span>
                  </div>
                  <div className="w-24 flex-shrink-0 text-right">
                    <span className="text-xs font-semibold text-purple-600">Projected</span>
                  </div>
                </div>
              </div>

              {/* Inflation Context */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-yellow-800 mb-2">
                  Inflation Context (Source: KFF Employer Health Benefits Survey 2025)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Medical Inflation', value: trends.inflation.medicalInflation },
                    { label: 'Dental Inflation', value: trends.inflation.dentalInflation },
                    { label: 'Vision Inflation', value: trends.inflation.visionInflation },
                    { label: 'National Average', value: trends.inflation.nationalAverage },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <p className="text-xs text-yellow-700">{item.label}</p>
                      <p className="text-lg font-bold text-yellow-900">{fmtPercent(item.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Plan Performance Tab ─────────────────────────────────────────── */}
          {activeTab === 'plan-performance' && (
            <div className="space-y-4">
              {!planComparison ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                  <span className="text-sm text-gray-500">Loading plan comparison...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Plan Performance Comparison
                    </h4>
                    <p className="text-xs text-gray-400">
                      Period: {planComparison.comparisonPeriod}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500 text-left bg-gray-50">
                          <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">
                            Plan
                          </th>
                          <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-right">
                            Enrolled
                          </th>
                          <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-right">
                            Employer Cost
                          </th>
                          <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-right">
                            Claims Paid
                          </th>
                          <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-right">
                            Loss Ratio
                          </th>
                          <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-right">
                            NPS
                          </th>
                          <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-right">
                            Renewal %
                          </th>
                          <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-center">
                            Recommendation
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {planComparison.plans.map((plan) => (
                          <tr key={plan.planId} className="hover:bg-gray-50">
                            <td className="px-3 py-3">
                              <p className="font-semibold text-gray-900">{plan.planName}</p>
                              <p className="text-gray-500">
                                {plan.carrier} • {plan.planType}
                              </p>
                            </td>
                            <td className="px-3 py-3 text-right font-medium text-gray-800">
                              {plan.enrolledMembers.toLocaleString()}
                            </td>
                            <td className="px-3 py-3 text-right font-medium text-blue-700">
                              {fmtCurrency(plan.totalEmployerCost, true)}
                            </td>
                            <td className="px-3 py-3 text-right text-gray-700">
                              {fmtCurrency(plan.totalClaimsPaid, true)}
                            </td>
                            <td className="px-3 py-3 text-right">
                              <span
                                className={`font-bold ${plan.lossRatio >= 80 && plan.lossRatio <= 90 ? 'text-green-600' : plan.lossRatio < 70 ? 'text-orange-600' : 'text-red-600'}`}
                              >
                                {fmtPercent(plan.lossRatio)}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <span className="font-medium text-gray-800">
                                  {plan.netPromoterScore}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <span
                                className={`font-semibold ${plan.renewalRateIncrease > 8 ? 'text-red-600' : plan.renewalRateIncrease > 5 ? 'text-orange-500' : 'text-gray-700'}`}
                              >
                                +{fmtPercent(plan.renewalRateIncrease)}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-bold ${PLAN_REC_STYLES[plan.recommendation] ?? 'bg-gray-100 text-gray-700'}`}
                              >
                                {plan.recommendation}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-blue-800 mb-2">
                      {planComparison.recommendation}
                    </p>
                    <ul className="space-y-1">
                      {planComparison.suggestedChanges.map((change, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-blue-700">
                          <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-xs text-gray-400 p-2">
                    Loss Ratio guide: 80-85% is ideal (sustainable for carrier, value for employer).
                    Below 70% = overpriced; above 90% = claims-heavy.
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Wellness ROI Tab ─────────────────────────────────────────────── */}
          {activeTab === 'wellness-roi' && wellnessROI && (
            <div className="space-y-5">
              {/* ROI Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Program Cost',
                    value: fmtCurrency(wellnessROI.totalProgramCost, true),
                    color: 'text-red-600',
                    bg: 'bg-red-50',
                  },
                  {
                    label: 'Claims Savings',
                    value: fmtCurrency(wellnessROI.claimsSavings, true),
                    color: 'text-green-700',
                    bg: 'bg-green-50',
                  },
                  {
                    label: 'Productivity Gains',
                    value: fmtCurrency(wellnessROI.productivityGains, true),
                    color: 'text-blue-700',
                    bg: 'bg-blue-50',
                  },
                  {
                    label: 'ROI Ratio',
                    value: `${wellnessROI.roiRatio.toFixed(2)}x`,
                    color: 'text-purple-700',
                    bg: 'bg-purple-50',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`${item.bg} border border-gray-200 rounded-xl p-4 text-center`}
                  >
                    <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                    <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Participation */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Program Participation</h4>
                  <span className="text-lg font-bold text-gray-900">
                    {fmtPercent(wellnessROI.participationRate)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-orange-500 transition-all duration-500"
                    style={{ width: `${wellnessROI.participationRate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-gray-500">
                    {wellnessROI.participantCount} active participants
                  </span>
                  <span className="text-gray-400">
                    HRAs: {wellnessROI.healthRiskAssessmentsCompleted} • Screenings:{' '}
                    {wellnessROI.biometricScreeningsCompleted}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Incentives Paid:{' '}
                  <span className="font-semibold text-gray-800">
                    {fmtCurrency(wellnessROI.incentivestPaid)}
                  </span>
                </p>
              </div>

              {/* Outcomes */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Program Outcomes</h4>
                <div className="space-y-3">
                  {wellnessROI.measuredOutcomes.map((outcome, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-gray-800">{outcome.metric}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            outcome.trend === 'IMPROVING'
                              ? 'bg-green-100 text-green-700'
                              : outcome.trend === 'WORSENING'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {outcome.trend}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-500">
                          Baseline:{' '}
                          <span className="font-medium text-gray-700">{outcome.baselineValue}</span>
                        </span>
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-500">
                          Current:{' '}
                          <span className="font-bold text-gray-900">{outcome.currentValue}</span>
                        </span>
                        <span
                          className={`font-semibold flex items-center gap-0.5 ${outcome.changePercent < 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          <TrendIcon value={outcome.changePercent} />
                          {outcome.changePercent > 0 ? '+' : ''}
                          {fmtPercent(Math.abs(outcome.changePercent))}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{outcome.estimatedImpact}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
