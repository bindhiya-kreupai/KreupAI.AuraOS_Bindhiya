/**
 * @reference docs/aura-master-instructions.md
 */
"use client";

import Link from "next/link";
import { Banknote, BarChart2, Calculator, Coins, FileSpreadsheet, PiggyBank, Wallet } from "lucide-react";

const financeAreas = [
  {
    title: "Assets",
    href: "/dashboard/finance/assets",
    description: "Track capital and operational assets tied to cost centers and projects.",
    icon: PiggyBank,
  },
  {
    title: "Budgeting",
    href: "/dashboard/finance/budget",
    description: "Headcount and salary budgets, department allocation, approvals, and scenarios.",
    icon: Calculator,
  },
  {
    title: "Petty Cash",
    href: "/dashboard/finance/petty-cash",
    description: "Small disbursements, float reconciliation, and policy controls.",
    icon: Wallet,
  },
  {
    title: "Vendors",
    href: "/dashboard/finance/vendors",
    description: "Onboard vendors, manage contracts, and ensure compliance with procurement rules.",
    icon: Banknote,
  },
  {
    title: "Budget Reports",
    href: "/dashboard/finance/budget/budget-vs-actual",
    description: "Monitor variance, projections, and approval workflows.",
    icon: BarChart2,
  },
  {
    title: "Templates",
    href: "/dashboard/finance/budget/budget-templates",
    description: "Reusable planning templates aligned to business units and cost centers.",
    icon: FileSpreadsheet,
  },
  {
    title: "Scenario Planning",
    href: "/dashboard/finance/budget/scenario-planning",
    description: "Model salary, hiring, and cost changes with multi-scenario comparisons.",
    icon: Coins,
  },
];

export default function FinanceLandingPage() {
  return (
    <div className="space-y-8 pb-10 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-indigo-500">Finance</p>
        <h1 className="text-3xl font-bold">Finance & Budget Hub</h1>
        <p className="text-slate-500 max-w-3xl">
          Plan, monitor, and reconcile budgets across headcount, projects, and vendors. All tools below
          are configuration-driven—nothing hardcoded.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {financeAreas.map((item) => {
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
                <div>
                  <p className="text-sm font-semibold text-indigo-500">Finance</p>
                  <h2 className="text-lg font-bold group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h2>
                </div>
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
