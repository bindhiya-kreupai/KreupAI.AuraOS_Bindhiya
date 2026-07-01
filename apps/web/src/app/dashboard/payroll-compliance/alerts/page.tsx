'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ShieldAlert,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  XCircle,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { APIClient } from '@/lib/api-client';

interface RegulatorHealth {
  regulatorId: string;
  name: string;
  nameAr?: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNKNOWN';
  successRate24h: number;
  avgLatencyMs: number;
  activeAlerts: number;
  pendingRetries: number;
  lastSuccessfulSubmission?: string;
}

interface AlertInstance {
  id: string;
  regulatorId: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | string;
  triggeredAt: string;
  resolvedAt?: string;
  message: string;
  messageAr?: string;
  currentValue: number;
  thresholdValue: number;
  acknowledged: boolean;
}

interface ObservabilityDashboard {
  generatedAt: string;
  regulators: RegulatorHealth[];
  activeAlerts: AlertInstance[];
  overallHealth: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
}

const severityConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  CRITICAL: { color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3.5 h-3.5" /> },
  WARNING: {
    color: 'bg-amber-100 text-amber-700',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  INFO: { color: 'bg-blue-100 text-blue-700', icon: <Bell className="w-3.5 h-3.5" /> },
};

const healthConfig: Record<string, string> = {
  HEALTHY: 'bg-green-50 text-green-600 border-green-200',
  DEGRADED: 'bg-amber-50 text-amber-600 border-amber-200',
  DOWN: 'bg-red-50 text-red-600 border-red-200',
  UNHEALTHY: 'bg-red-50 text-red-600 border-red-200',
  UNKNOWN: 'bg-slate-50 text-slate-500 border-slate-200',
};

export default function ComplianceAlertsPage() {
  const [dashboard, setDashboard] = useState<ObservabilityDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('All');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await APIClient.get<unknown>('/v1/compliance/observability', {
        view: 'dashboard',
      });
      const data = APIClient.unwrapItem<ObservabilityDashboard>(res);
      setDashboard(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load compliance observability');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const alerts = dashboard?.activeAlerts ?? [];
  const regulators = dashboard?.regulators ?? [];
  const filteredAlerts =
    severityFilter === 'All' ? alerts : alerts.filter((a) => a.severity === severityFilter);
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && !a.resolvedAt).length;
  const openCount = alerts.filter((a) => !a.resolvedAt).length;
  const degradedRegulators = regulators.filter((r) => r.status !== 'HEALTHY').length;

  return (
    <div className="space-y-6 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-indigo-500">Payroll Compliance</p>
          <h1 className="text-3xl font-bold">Compliance Alerts</h1>
          <p className="text-slate-500">
            Live regulator health, filing status, and active compliance alerts across jurisdictions.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: 'Overall Health',
            value: dashboard?.overallHealth ?? '—',
            icon: Activity,
            color: 'text-indigo-600 bg-indigo-50',
          },
          {
            label: 'Open Alerts',
            value: openCount,
            icon: AlertTriangle,
            color: 'text-red-600 bg-red-50',
          },
          {
            label: 'Critical',
            value: criticalCount,
            icon: ShieldAlert,
            color: 'text-orange-600 bg-orange-50',
          },
          {
            label: 'Degraded Regulators',
            value: degradedRegulators,
            icon: CheckCircle2,
            color: 'text-green-600 bg-green-50',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Regulator health */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <h3 className="font-bold mb-4">Regulator Health (24h)</h3>
        {loading ? (
          <p className="text-sm text-slate-400">Loading regulator health…</p>
        ) : regulators.length === 0 ? (
          <p className="text-sm text-slate-400">
            No regulator activity recorded in the last 24 hours.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {regulators.map((r) => (
              <div
                key={r.regulatorId}
                className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 p-3"
              >
                <div>
                  <p className="font-semibold text-sm">{r.name}</p>
                  <p className="text-xs text-slate-400">
                    Success {Math.round(r.successRate24h)}% · {r.activeAlerts} alerts ·{' '}
                    {r.pendingRetries} retries
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium border ${healthConfig[r.status] || healthConfig.UNKNOWN}`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        {['All', 'CRITICAL', 'WARNING', 'INFO'].map((s) => (
          <button
            key={s}
            onClick={() => setSeverityFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              severityFilter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {s === 'All' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-400">Loading alerts…</p>
        ) : filteredAlerts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-400">
            No active compliance alerts.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${severityConfig[alert.severity]?.color || 'bg-slate-100 text-slate-600'}`}
                  >
                    {severityConfig[alert.severity]?.icon} {alert.severity}
                  </span>
                  <h3 className="font-bold">{alert.regulatorId}</h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium border ${alert.resolvedAt ? healthConfig.HEALTHY : healthConfig.DOWN}`}
                >
                  {alert.resolvedAt ? 'Resolved' : alert.acknowledged ? 'Acknowledged' : 'Open'}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-3">{alert.message}</p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                  value {alert.currentValue} / threshold {alert.thresholdValue}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(alert.triggeredAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
