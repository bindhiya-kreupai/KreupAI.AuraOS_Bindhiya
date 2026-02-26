/**
 * @module WorkflowMonitorPage
 * @description Workflow instance monitor, SLA tracking, and delegation management.
 * @project AURA HCM Platform
 * @section 24.1 Process Automation & Workflow Engine
 */

'use client';

import React, { useState } from 'react';
import WorkflowMonitor from '@/components/workflows/WorkflowMonitor';
import DelegationManager from '@/components/workflows/DelegationManager';

type Tab = 'monitor' | 'delegations';

export default function WorkflowMonitorPage() {
  const [tab, setTab] = useState<Tab>('monitor');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="pb-4 border-b border-cloud dark:border-nebula-purple/20">
        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
          Workflows / Monitor
        </p>
        <h1 className="text-2xl font-extrabold text-ink-black dark:text-pearl">
          Workflow Operations Center
        </h1>
        <p className="text-silver-mist text-sm mt-1 max-w-2xl">
          Monitor live workflow instances with step-by-step timelines and SLA tracking. Manage
          delegation of authority rules to ensure continuity during absences.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1 w-fit">
        {(
          [
            { key: 'monitor', label: 'Instance Monitor' },
            { key: 'delegations', label: 'Delegation Rules' },
          ] as { key: Tab; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === key
                ? 'bg-white dark:bg-stellar-blue text-indigo-600 shadow-sm'
                : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'monitor' && <WorkflowMonitor />}
      {tab === 'delegations' && <DelegationManager />}
    </div>
  );
}
