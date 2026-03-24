'use client';

import Link from 'next/link';
import { Wallet, Receipt, ShieldCheck } from 'lucide-react';

const pettyCashAreas = [
  {
    title: 'Disbursements',
    href: '/dashboard/finance/petty-cash/disbursements',
    description: 'Process and track small cash disbursements with approval workflows.',
    icon: Wallet,
  },
  {
    title: 'Reconciliation',
    href: '/dashboard/finance/petty-cash/reconciliation',
    description: 'Reconcile float balances and generate settlement reports.',
    icon: Receipt,
  },
  {
    title: 'Policy Controls',
    href: '/dashboard/finance/petty-cash/policy-controls',
    description: 'Configure spending limits, categories, and approval thresholds.',
    icon: ShieldCheck,
  },
];

export default function PettyCashHubPage() {
  return (
    <div className="space-y-8 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-indigo-500">Finance</p>
        <h1 className="text-3xl font-bold">Petty Cash</h1>
        <p className="text-slate-500 max-w-3xl">
          Small disbursements, float reconciliation, and policy controls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {pettyCashAreas.map((item) => {
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
