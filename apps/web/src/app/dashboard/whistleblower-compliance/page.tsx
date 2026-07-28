'use client';

import Link from 'next/link';
import { ShieldCheck, AlertTriangle, Clock, ArrowRight } from 'lucide-react';

const workspaces = [
  {
    title: 'Anonymous Intake',
    description: 'Submit and manage confidential whistleblower reports.',
    href: '/dashboard/whistleblower-compliance/anonymous-intake',
    icon: ShieldCheck,
  },
  {
    title: 'Retaliation Detection',
    description: 'Monitor and identify potential retaliation against reporters.',
    href: '/dashboard/whistleblower-compliance/retaliation-detection',
    icon: AlertTriangle,
  },
  {
    title: 'Case Cycle SLA',
    description: 'Configure and monitor investigation SLA timelines.',
    href: '/dashboard/whistleblower-compliance/case-cycle-sla',
    icon: Clock,
  },
];

export default function WhistleblowerCompliancePage() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500">Whistleblower Compliance</p>

        <h1 className="mt-2 text-3xl font-bold">Whistleblower Compliance</h1>

        <p className="mt-2 text-slate-600">
          Protect employees by enabling confidential reporting, monitoring retaliation risks, and
          ensuring timely investigations.
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
