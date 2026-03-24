'use client';

import Link from 'next/link';
import {
  Calculator,
  Users,
  Building2,
  FileSpreadsheet,
  BarChart2,
  CheckCircle2,
  Lightbulb,
  Clock,
  Coins,
} from 'lucide-react';

const budgetAreas = [
  {
    title: 'Salary Budgets',
    href: '/dashboard/finance/budget/salary-budgets',
    description: 'Plan and track salary allocations by department and grade.',
    icon: Calculator,
  },
  {
    title: 'Headcount Planning',
    href: '/dashboard/finance/budget/headcount-planning',
    description: 'Forecast staffing needs and align with budget capacity.',
    icon: Users,
  },
  {
    title: 'Department Allocation',
    href: '/dashboard/finance/budget/department-allocation',
    description: 'Distribute budgets across departments and cost centers.',
    icon: Building2,
  },
  {
    title: 'Budget Templates',
    href: '/dashboard/finance/budget/budget-templates',
    description: 'Reusable planning templates aligned to business units.',
    icon: FileSpreadsheet,
  },
  {
    title: 'Budget vs Actual',
    href: '/dashboard/finance/budget/budget-vs-actual',
    description: 'Monitor variance and track spending against planned budgets.',
    icon: BarChart2,
  },
  {
    title: 'Approvals',
    href: '/dashboard/finance/budget/approvals',
    description: 'Review and approve budget requests and revisions.',
    icon: CheckCircle2,
  },
  {
    title: 'Scenario Planning',
    href: '/dashboard/finance/budget/scenario-planning',
    description: 'Model salary, hiring, and cost changes with comparisons.',
    icon: Lightbulb,
  },
  {
    title: 'Cost Projections',
    href: '/dashboard/finance/budget/cost-projections',
    description: 'Project future costs based on current trends and plans.',
    icon: Coins,
  },
  {
    title: 'Approval Workflow',
    href: '/dashboard/finance/budget/approval-workflow',
    description: 'Configure budget approval chains and escalation rules.',
    icon: Clock,
  },
];

export default function BudgetHubPage() {
  return (
    <div className="space-y-8 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-indigo-500">Finance</p>
        <h1 className="text-3xl font-bold">Budgeting</h1>
        <p className="text-slate-500 max-w-3xl">
          Headcount and salary budgets, department allocation, approvals, and scenario planning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {budgetAreas.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-5 hover:border-indigo-500 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h2>
              </div>
              <p className="text-sm text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
