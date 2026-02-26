'use client';

import React from 'react';
import Link from 'next/link';
import { ModuleGrid } from '@/components/dashboard/module-grid';
import { ShieldCheck, BookLock } from 'lucide-react';

export default function AuditSecurityPage() {
  const features = [
    'Audit Logs',
    'Login Logs',
    'Role-based Access',
    'Field-level Security',
    'Dual Authentication',
    'Document Access Logs',
    'Compliance Tracker',
    'Policy Acknowledgement',
    'Approval Logs',
    'GDPR Tools',
    'Alert Rules',
    'Data Retention',
  ];

  return (
    <div className="space-y-8">
      {/* Enterprise modules — new Phase 3 additions */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
          Enterprise Security Modules
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href="/dashboard/security/compliance"
            className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-5 hover:border-indigo-500 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-500">Compliance</p>
                <h2 className="text-lg font-bold group-hover:text-indigo-600 transition-colors">
                  Compliance Framework
                </h2>
              </div>
            </div>
            <p className="text-sm text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
              SOC 2, ISO 27001, GDPR, HIPAA &amp; SOX readiness gauges, control evidence management,
              and audit-ready reports.
            </p>
          </Link>

          <Link
            href="/dashboard/security/access-governance"
            className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-5 hover:border-indigo-500 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
                <BookLock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-rose-500">Access Governance</p>
                <h2 className="text-lg font-bold group-hover:text-indigo-600 transition-colors">
                  Access Governance &amp; SoD
                </h2>
              </div>
            </div>
            <p className="text-sm text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
              Segregation of duties rule engine, access certification campaigns, role-permission
              matrix, and violation detection.
            </p>
          </Link>
        </div>
      </div>

      {/* Existing feature grid */}
      <ModuleGrid
        title="Audit & Security"
        description="Manage your audit & security operations and settings."
        features={features}
        basePath="/dashboard/security"
      />
    </div>
  );
}
