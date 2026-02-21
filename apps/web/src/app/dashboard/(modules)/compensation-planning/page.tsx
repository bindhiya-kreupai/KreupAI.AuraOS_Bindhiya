"use client";

import React, { useState, useEffect } from 'react';
import { DollarSign, Plus } from 'lucide-react';
import { CompensationPlanner } from '@/components/compensation/CompensationPlanner';
import { SalaryReview } from '@/components/compensation/SalaryReview';
import { BudgetAllocation } from '@/components/compensation/BudgetAllocation';
import { BenchmarkComparison } from '@/components/compensation/BenchmarkComparison';
import { CompReviewHistory } from '@/components/compensation/CompReviewHistory';
import MeritIncreaseCalculator from '@/components/compensation/MeritIncreaseCalculator';

type Tab = 'planner' | 'salary' | 'budget' | 'benchmark' | 'history' | 'merit';

interface CompensationSummary {
  totalPayroll: number;
  averageSalary: number;
  medianSalary: number;
  salaryRangeMin: number;
  salaryRangeMax: number;
  totalBenefitsCost: number;
  benefitsPerEmployee: number;
}

interface BudgetUtilization {
  annualBudget: number;
  utilized: number;
  remaining: number;
  utilizationRate: number;
  projectedYearEnd: number;
}

interface CompensationAnalytics {
  summary: CompensationSummary;
  budgetUtilization: BudgetUtilization;
  byDepartment: { department: string; headcount: number; avgSalary: number }[];
}

export default function CompensationPlanningModulePage() {
  const [activeTab, setActiveTab] = useState<Tab>('planner');
  const [analytics, setAnalytics] = useState<CompensationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/analytics/compensation/')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setAnalytics(result.data);
        } else {
          setError('Failed to load compensation data');
        }
      })
      .catch((err) => {
        console.error('Compensation analytics fetch error:', err);
        setError('Failed to load compensation data');
      })
      .finally(() => setLoading(false));
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'planner', label: 'Planner' },
    { key: 'salary', label: 'Salary Review' },
    { key: 'budget', label: 'Budget Allocation' },
    { key: 'benchmark', label: 'Benchmarks' },
    { key: 'merit', label: 'Merit Calculator' },
    { key: 'history', label: 'History' },
  ];

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const totalBudget = analytics?.budgetUtilization?.annualBudget ?? 0;
  const allocated = analytics?.budgetUtilization?.utilized ?? 0;
  const utilizationRate = analytics?.budgetUtilization?.utilizationRate ?? 0;
  const avgSalary = analytics?.summary?.averageSalary ?? 0;
  const medianSalary = analytics?.summary?.medianSalary ?? 0;
  const avgMerit = medianSalary > 0 ? Math.round(((avgSalary - medianSalary) / medianSalary) * 1000) / 10 : 0;
  const eligibleEmployees = analytics?.byDepartment?.reduce((sum, d) => sum + d.headcount, 0) ?? 0;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-indigo-500" />
            Compensation Planning
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Plan merit increases, allocate budgets, and benchmark against market
          </p>
        </div>
        <button
          onClick={() => setActiveTab('salary')}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Review
        </button>
      </div>

      {/* Summary Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-3" />
              <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2" />
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-12" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 uppercase font-medium">Total Budget</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{formatCurrency(totalBudget)}</p>
            <p className="text-[10px] text-slate-400">FY 2026</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 uppercase font-medium">Allocated</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{formatCurrency(allocated)}</p>
            <p className="text-[10px] text-slate-400">{utilizationRate}% utilized</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 uppercase font-medium">Avg Salary vs Median</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{avgMerit > 0 ? '+' : ''}{avgMerit}%</p>
            <p className="text-[10px] text-slate-400">Avg: {formatCurrency(avgSalary)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 uppercase font-medium">Eligible Employees</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{eligibleEmployees}</p>
            <p className="text-[10px] text-slate-400">Across all departments</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'planner' && <CompensationPlanner />}
        {activeTab === 'salary' && <SalaryReview />}
        {activeTab === 'budget' && <BudgetAllocation />}
        {activeTab === 'benchmark' && <BenchmarkComparison />}
        {activeTab === 'merit' && <MeritIncreaseCalculator />}
        {activeTab === 'history' && <CompReviewHistory />}
      </div>
    </div>
  );
}
