'use client';

import Link from 'next/link';
import { Building2, Package, TrendingDown, PieChart, PiggyBank } from 'lucide-react';

const assetAreas = [
  {
    title: 'Capital Assets',
    href: '/dashboard/finance/assets/capital-assets',
    description: 'Register and track fixed capital assets, purchase cost, and current value.',
    icon: Building2,
  },
  {
    title: 'Operational Assets',
    href: '/dashboard/finance/assets/operational-assets',
    description: 'Manage consumable and operational inventory, reorder points, and stock value.',
    icon: Package,
  },
  {
    title: 'Depreciation',
    href: '/dashboard/finance/assets/depreciation',
    description: 'Straight-line and declining-balance depreciation schedules and reporting.',
    icon: TrendingDown,
  },
  {
    title: 'Cost Centers',
    href: '/dashboard/finance/assets/cost-centers',
    description: 'Allocated vs. spent budget by cost center across the organization.',
    icon: PieChart,
  },
];

export default function FinanceAssetsHubPage() {
  return (
    <div className="space-y-6 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-indigo-500">Finance</p>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <PiggyBank className="w-7 h-7 text-indigo-500" /> Asset Management
        </h1>
        <p className="text-slate-500 max-w-3xl">
          Track capital and operational assets, run depreciation, and monitor cost-center budgets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assetAreas.map((area) => {
          const Icon = area.icon;
          return (
            <Link
              key={area.href}
              href={area.href}
              className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:border-indigo-400 hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="font-bold text-lg group-hover:text-indigo-600">{area.title}</h2>
              <p className="text-sm text-slate-500 mt-1">{area.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
