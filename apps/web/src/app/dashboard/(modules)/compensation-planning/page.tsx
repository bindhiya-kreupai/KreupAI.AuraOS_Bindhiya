"use client";

import React, { useState } from 'react';
import { DollarSign, Plus } from 'lucide-react';
import { CompensationPlanner } from '@/components/compensation/CompensationPlanner';
import { SalaryReview } from '@/components/compensation/SalaryReview';
import { BudgetAllocation } from '@/components/compensation/BudgetAllocation';
import { BenchmarkComparison } from '@/components/compensation/BenchmarkComparison';
import { CompReviewHistory } from '@/components/compensation/CompReviewHistory';
import MeritIncreaseCalculator from '@/components/compensation/MeritIncreaseCalculator';

type Tab = 'planner' | 'salary' | 'budget' | 'benchmark' | 'history' | 'merit';

export default function CompensationPlanningModulePage() {
  const [activeTab, setActiveTab] = useState<Tab>('planner');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'planner', label: 'Planner' },
    { key: 'salary', label: 'Salary Review' },
    { key: 'budget', label: 'Budget Allocation' },
    { key: 'benchmark', label: 'Benchmarks' },
    { key: 'merit', label: 'Merit Calculator' },
    { key: 'history', label: 'History' },
  ];

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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Total Budget</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">$850K</p>
          <p className="text-[10px] text-slate-400">FY 2026</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Allocated</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">$612K</p>
          <p className="text-[10px] text-slate-400">72% utilized</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Avg Merit Increase</p>
          <p className="text-2xl font-bold text-green-600 mt-1">7.4%</p>
          <p className="text-[10px] text-slate-400">Market avg: 5.2%</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Eligible Employees</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">24</p>
          <p className="text-[10px] text-slate-400">3 pending review</p>
        </div>
      </div>

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
