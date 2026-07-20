'use client';

/**
 * Compliance Tracker — a lightweight, live at-a-glance summary of framework
 * readiness. Deep control management, evidence upload, and testing live on the
 * enterprise Compliance Framework page (/dashboard/security/compliance); every
 * action here links through to it (backlog AURA-274 / AURA-281).
 */

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertTriangle, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import {
  ComplianceFrameworkService,
  type ComplianceFramework,
} from '@/services/complianceFrameworkService';

const STATUS_STYLES: Record<string, { label: string; badge: string; bar: string }> = {
  certified: {
    label: 'Certified',
    badge: 'bg-emerald-100 text-emerald-700',
    bar: 'bg-emerald-500',
  },
  'in-progress': {
    label: 'In Progress',
    badge: 'bg-amber-100 text-amber-700',
    bar: 'bg-amber-500',
  },
  'not-started': {
    label: 'Not Started',
    badge: 'bg-slate-100 text-slate-600',
    bar: 'bg-slate-400',
  },
  expired: {
    label: 'Expired',
    badge: 'bg-rose-100 text-rose-700',
    bar: 'bg-rose-500',
  },
};

function statusStyle(status: string) {
  return STATUS_STYLES[status] ?? STATUS_STYLES['in-progress'];
}

function formatDate(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ComplianceTrackerPage() {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ComplianceFrameworkService.getComplianceFrameworks();
      setFrameworks(data);
    } catch {
      setError('Failed to load compliance frameworks.');
      setFrameworks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const overallScore =
    frameworks.length > 0
      ? Math.round(
          frameworks.reduce((sum, f) => sum + (f.readinessScore ?? 0), 0) / frameworks.length
        )
      : 0;

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
            Compliance Tracker
          </h1>
          <p className="text-slate-500 text-sm">
            Monitor adherence to regulatory standards (ISO, SOC 2, GDPR, HIPAA, SOX).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Overall Score:</span>
            <div className="w-32 h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${overallScore}%` }}
              />
            </div>
            <span className="text-emerald-600 font-bold">{overallScore}%</span>
          </div>
          <Link
            href="/dashboard/security/compliance"
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <ShieldCheck className="w-4 h-4" /> Manage Frameworks
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading frameworks…
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
          <p className="text-sm">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      ) : frameworks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400">
          <CheckCircle className="w-8 h-8" />
          <p className="text-sm">No compliance frameworks configured yet.</p>
          <Link
            href="/dashboard/security/compliance"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
          >
            Set up frameworks
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full min-h-0 overflow-y-auto pb-20">
          {frameworks.map((f) => {
            const style = statusStyle(f.status);
            const score = Math.max(0, Math.min(100, f.readinessScore ?? 0));
            return (
              <div
                key={f.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 rounded-xl flex items-center justify-center text-xl font-bold">
                      {f.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                        {f.name}
                      </h3>
                      <p className="text-xs text-slate-500">{f.fullName}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${style.badge}`}>
                    {style.label}
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Readiness</span>
                    <span className="font-bold">{score}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${style.bar} rounded-full transition-all`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                      <span className="text-xs text-slate-500 block">Controls</span>
                      <span className="font-bold text-sm">{f.totalControls}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                      <span className="text-xs text-slate-500 block">Next Audit</span>
                      <span className="font-bold text-sm">{formatDate(f.nextAuditDate)}</span>
                    </div>
                    {f.auditor ? (
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                        <span className="text-xs text-slate-500 block">Auditor</span>
                        <span className="font-bold text-sm">{f.auditor}</span>
                      </div>
                    ) : null}
                    {f.certificationExpiry ? (
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                        <span className="text-xs text-slate-500 block">Cert. Expiry</span>
                        <span className="font-bold text-sm">
                          {formatDate(f.certificationExpiry)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <Link
                  href={`/dashboard/security/compliance?framework=${f.id}`}
                  className="mt-auto w-full py-2 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors flex items-center justify-center gap-2"
                >
                  View Controls &amp; Evidence <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
