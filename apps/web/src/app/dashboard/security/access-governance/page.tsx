/**
 * @module AccessGovernancePage
 * @description Enterprise access governance — SoD rules, access reviews, and role-permission matrix.
 * @project AURA HCM Platform
 * @section 24.3 Enterprise Access Governance
 */

'use client';

import React, { useState } from 'react';
import AccessGovernanceDashboard from '@/components/admin/AccessGovernanceDashboard';
import SoDRuleManager from '@/components/admin/SoDRuleManager';

type View = 'dashboard' | 'sod-rules';

export default function AccessGovernancePage() {
  const [view, setView] = useState<View>('dashboard');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="pb-4 border-b border-cloud dark:border-nebula-purple/20">
        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
          Security / Access Governance
        </p>
        <h1 className="text-2xl font-extrabold text-ink-black dark:text-pearl">
          Enterprise Access Governance
        </h1>
        <p className="text-silver-mist text-sm mt-1 max-w-2xl">
          Enforce Segregation of Duties (SoD) rules, run access certification campaigns, and review
          the full role-permission matrix. SOX and SOC 2 compliant evidence generation.
        </p>
      </div>

      {/* Sub-nav tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1 w-fit">
        {(
          [
            { key: 'dashboard', label: 'Governance Dashboard' },
            { key: 'sod-rules', label: 'SoD Rule Manager' },
          ] as { key: View; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              view === key
                ? 'bg-white dark:bg-stellar-blue text-indigo-600 shadow-sm'
                : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {view === 'dashboard' && (
        <AccessGovernanceDashboard onViewSoDRules={() => setView('sod-rules')} />
      )}
      {view === 'sod-rules' && <SoDRuleManager />}
    </div>
  );
}
