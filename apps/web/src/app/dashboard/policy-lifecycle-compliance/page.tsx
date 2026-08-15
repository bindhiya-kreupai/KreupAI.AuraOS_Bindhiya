'use client';

import Link from 'next/link';
import {
  CalendarCheck2,
  BadgeCheck,
  GitCompareArrows,
  ShieldCheck,
  ArrowRight,
  Activity,
  FileText,
  Workflow,
} from 'lucide-react';

const evaluators = [
  {
    title: 'Review Cadence',
    description: 'Monitor review schedules and identify overdue policy reviews.',
    href: '/dashboard/policy-lifecycle-compliance/review-cadence',
    icon: CalendarCheck2,
    color: 'text-blue-600',
  },
  {
    title: 'Acknowledgement Coverage',
    description: 'Track employee acknowledgements for published policies.',
    href: '/dashboard/policy-lifecycle-compliance/ack-coverage',
    icon: BadgeCheck,
    color: 'text-green-600',
  },
  {
    title: 'Version Difference',
    description: 'Compare policy versions and review document changes.',
    href: '/dashboard/policy-lifecycle-compliance/version-diff',
    icon: GitCompareArrows,
    color: 'text-purple-600',
  },
];

export default function PolicyLifecycleCompliancePage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Policy Lifecycle Compliance</h1>

          <p className="mt-2 text-slate-600 max-w-3xl">
            Centralized dashboard for monitoring policy review cadence, acknowledgement coverage,
            and version comparison across the organization.
          </p>
        </div>

        <div className="rounded-xl bg-indigo-100 p-4">
          <ShieldCheck className="h-10 w-10 text-indigo-600" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <Activity className="mb-4 h-8 w-8 text-blue-600" />
          <p className="text-sm text-slate-500">Available Evaluators</p>
          <h2 className="mt-2 text-3xl font-bold">3</h2>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <CalendarCheck2 className="mb-4 h-8 w-8 text-green-600" />
          <p className="text-sm text-slate-500">Review Monitoring</p>
          <h2 className="mt-2 text-3xl font-bold">Active</h2>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <BadgeCheck className="mb-4 h-8 w-8 text-amber-600" />
          <p className="text-sm text-slate-500">Acknowledgements</p>
          <h2 className="mt-2 text-3xl font-bold">Tracking</h2>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <GitCompareArrows className="mb-4 h-8 w-8 text-purple-600" />
          <p className="text-sm text-slate-500">Version Control</p>
          <h2 className="mt-2 text-3xl font-bold">Enabled</h2>
        </div>
      </div>

      {/* Workflow + Quick Guide */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2 rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Workflow className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold">Policy Lifecycle Workflow</h2>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            {['Draft', 'Review', 'Approval', 'Published', 'Acknowledged', 'Review', 'Archive'].map(
              (step, index) => (
                <div key={index} className="flex items-center">
                  <div className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
                    {step}
                  </div>

                  {index !== 6 && <ArrowRight className="mx-2 h-5 w-5 text-slate-400" />}
                </div>
              )
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Best Practices</h2>

          <ul className="space-y-3 text-sm text-slate-600">
            <li>✔ Schedule periodic reviews</li>
            <li>✔ Track acknowledgements</li>
            <li>✔ Maintain version history</li>
            <li>✔ Preserve audit evidence</li>
            <li>✔ Support compliance reporting</li>
          </ul>
        </div>
      </div>

      {/* Evaluators */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b p-6">
          <h2 className="text-2xl font-semibold">Available Evaluators</h2>

          <p className="mt-2 text-slate-500">
            Launch any evaluator to validate policy lifecycle compliance.
          </p>
        </div>

        <div className="divide-y">
          {evaluators.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center justify-between p-6 hover:bg-slate-50 transition"
              >
                <div className="flex items-start gap-5">
                  <div className="rounded-lg bg-slate-100 p-3">
                    <Icon className={`h-7 w-7 ${item.color}`} />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>

                    <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  </div>
                </div>

                <Link
                  href={item.href}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700"
                >
                  Open
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold">Compliance Summary</h2>
        </div>

        <p className="text-slate-600 leading-7">
          Policy Lifecycle Compliance ensures every organizational policy is reviewed on schedule,
          acknowledged by the intended audience, and version-controlled for audit readiness. Use the
          evaluators above to assess compliance across the complete policy lifecycle.
        </p>
      </div>
    </div>
  );
}
