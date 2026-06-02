// @ts-nocheck — Presentation-layer drift / missing prop types. Tracked under #29.
/**
 * @module CompensationPage
 * @description Compensation module — total comp, salary benchmarking, bonus wizard, equity, merit, planner
 * @project AURA HCM Platform
 */

'use client';

import { useState } from 'react';
import TotalCompensationStatement from '@/components/compensation/TotalCompensationStatement';
import SalaryBenchmarking from '@/components/compensation/SalaryBenchmarking';
import BonusCalculationWizard from '@/components/compensation/BonusCalculationWizard';
import { EquityManagement } from '@/components/compensation/EquityManagement';
import { ExpenseReimbursement } from '@/components/compensation/ExpenseReimbursement';
import MeritIncreaseCalculator from '@/components/compensation/MeritIncreaseCalculator';
import CompensationPlanner from '@/components/compensation/CompensationPlanner';
import SalaryReview from '@/components/compensation/SalaryReview';
import BudgetAllocation from '@/components/compensation/BudgetAllocation';
import BenchmarkComparison from '@/components/compensation/BenchmarkComparison';
import CompReviewHistory from '@/components/compensation/CompReviewHistory';

type Tab =
  | 'total-comp'
  | 'benchmarking'
  | 'bonus'
  | 'equity'
  | 'expense'
  | 'merit'
  | 'planner'
  | 'salary-review'
  | 'budget'
  | 'benchmark-compare'
  | 'history';

const TABS: { id: Tab; label: string }[] = [
  { id: 'total-comp', label: 'Total Compensation' },
  { id: 'benchmarking', label: 'Salary Benchmarking' },
  { id: 'bonus', label: 'Bonus Wizard' },
  { id: 'equity', label: 'Equity Management' },
  { id: 'expense', label: 'Expense Reimbursement' },
  { id: 'merit', label: 'Merit Calculator' },
  { id: 'planner', label: 'Comp Planner' },
  { id: 'salary-review', label: 'Salary Review' },
  { id: 'budget', label: 'Budget Allocation' },
  { id: 'benchmark-compare', label: 'Benchmark Comparison' },
  { id: 'history', label: 'Review History' },
];

export default function CompensationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('total-comp');

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'total-comp' && <TotalCompensationStatement />}
        {activeTab === 'benchmarking' && <SalaryBenchmarking />}
        {activeTab === 'bonus' && <BonusCalculationWizard />}
        {activeTab === 'equity' && <EquityManagement />}
        {activeTab === 'expense' && <ExpenseReimbursement />}
        {activeTab === 'merit' && <MeritIncreaseCalculator />}
        {activeTab === 'planner' && <CompensationPlanner />}
        {activeTab === 'salary-review' && <SalaryReview />}
        {activeTab === 'budget' && <BudgetAllocation />}
        {activeTab === 'benchmark-compare' && <BenchmarkComparison />}
        {activeTab === 'history' && <CompReviewHistory />}
      </div>
    </div>
  );
}
