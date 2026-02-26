/**
 * @module ComplianceFrameworkPage
 * @description Compliance framework dashboard — readiness gauges, control details, and gap analysis.
 * @project AURA HCM Platform
 * @section 8.3 Advanced Security — Compliance Framework
 */

'use client';

import React, { useState } from 'react';
import ComplianceDashboard from '@/components/security/ComplianceDashboard';
import ControlDetailView from '@/components/security/ControlDetailView';
import { type FrameworkId } from '@/services/complianceFrameworkService';

type View = { type: 'dashboard' } | { type: 'control'; controlId: string };

export default function ComplianceFrameworkPage() {
  const [view, setView] = useState<View>({ type: 'dashboard' });
  const [_selectedFramework, setSelectedFramework] = useState<FrameworkId | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="pb-4 border-b border-cloud dark:border-nebula-purple/20">
        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
          Security / Compliance
        </p>
        <h1 className="text-2xl font-extrabold text-ink-black dark:text-pearl">
          Compliance Framework Manager
        </h1>
        <p className="text-silver-mist text-sm mt-1 max-w-2xl">
          Track readiness across SOC 2, ISO 27001, GDPR, HIPAA, and SOX. Manage controls, upload
          evidence, run automated tests, and generate audit-ready compliance reports.
        </p>
      </div>

      {/* Breadcrumb for control detail */}
      {view.type === 'control' && (
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setView({ type: 'dashboard' })}
            className="text-indigo-600 hover:underline font-medium"
          >
            Compliance Dashboard
          </button>
          <span className="text-silver-mist">/</span>
          <span className="text-ink-black dark:text-pearl font-semibold">Control Detail</span>
        </div>
      )}

      {/* Content */}
      {view.type === 'dashboard' && (
        <ComplianceDashboard
          onSelectFramework={(id) => setSelectedFramework(id)}
          onSelectControl={(controlId) => setView({ type: 'control', controlId })}
        />
      )}
      {view.type === 'control' && (
        <ControlDetailView
          controlId={view.controlId}
          onBack={() => setView({ type: 'dashboard' })}
        />
      )}
    </div>
  );
}
