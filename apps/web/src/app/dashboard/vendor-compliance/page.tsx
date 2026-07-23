'use client';

import Link from 'next/link';
import { ShieldCheck, Search, Ban, ArrowRight } from 'lucide-react';

const workspaces = [
  {
    title: 'Conflict of Interest',
    description: 'Identify and manage vendor conflict of interest cases.',
    href: '/dashboard/vendor-compliance/conflict-of-interest',
    icon: ShieldCheck,
  },
  {
    title: 'Due Diligence',
    description: 'Perform vendor due diligence and compliance verification.',
    href: '/dashboard/vendor-compliance/due-diligence',
    icon: Search,
  },
  {
    title: 'Sanctions Screening',
    description: 'Screen vendors against sanctions and watchlists.',
    href: '/dashboard/vendor-compliance/sanctions-screening',
    icon: Ban,
  },
];

export default function VendorCompliancePage() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500">Vendor Compliance</p>

        <h1 className="mt-2 text-3xl font-bold">Vendor Compliance</h1>

        <p className="mt-2 text-slate-600">
          Manage vendor onboarding, due diligence, conflict checks and sanctions screening through
          dedicated compliance workspaces.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {workspaces.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-10 w-10 text-indigo-600" />
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>

              <h2 className="mt-5 text-xl font-semibold">{item.title}</h2>

              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
