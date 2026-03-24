'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  XCircle,
} from 'lucide-react';

const MOCK_ALERTS = [
  {
    id: 1,
    title: 'WPS SIF File Overdue',
    category: 'UAE WPS',
    severity: 'Critical',
    status: 'Open',
    description: 'March 2025 SIF file has not been submitted. Deadline was 15th March.',
    date: '2025-03-16',
    entity: 'Dubai Branch',
  },
  {
    id: 2,
    title: 'GOSI Contribution Mismatch',
    category: 'KSA GOSI',
    severity: 'High',
    status: 'Open',
    description:
      'Employee salary updates not reflected in GOSI contribution calculations for 3 employees.',
    date: '2025-03-14',
    entity: 'Riyadh Office',
  },
  {
    id: 3,
    title: 'PF ECR Filing Pending',
    category: 'India Statutory',
    severity: 'High',
    status: 'In Progress',
    description: 'EPF Electronic Challan Return for February 2025 pending submission.',
    date: '2025-03-10',
    entity: 'Mumbai Branch',
  },
  {
    id: 4,
    title: 'Professional Tax Slab Update',
    category: 'India Statutory',
    severity: 'Medium',
    status: 'Open',
    description:
      'Karnataka professional tax slabs updated effective April 2025. System needs reconfiguration.',
    date: '2025-03-12',
    entity: 'Bangalore Office',
  },
  {
    id: 5,
    title: 'EOSB Accrual Review Due',
    category: 'EOSB & Gratuity',
    severity: 'Medium',
    status: 'In Progress',
    description:
      'Quarterly EOSB accrual review due for Q1 2025. 12 employees have service year milestones.',
    date: '2025-03-01',
    entity: 'All Entities',
  },
  {
    id: 6,
    title: 'Saudization Ratio Below Threshold',
    category: 'KSA Nitaqat',
    severity: 'Critical',
    status: 'Open',
    description: 'Current Saudization ratio at 18% — below the 20% Green zone requirement.',
    date: '2025-03-15',
    entity: 'Jeddah Branch',
  },
  {
    id: 7,
    title: 'ESI Return Filed Successfully',
    category: 'India Statutory',
    severity: 'Low',
    status: 'Resolved',
    description: 'ESI half-yearly return filed for Oct-Mar period.',
    date: '2025-03-08',
    entity: 'Chennai Branch',
  },
  {
    id: 8,
    title: 'MoHRE Validation Warning',
    category: 'UAE WPS',
    severity: 'Medium',
    status: 'Open',
    description:
      '2 employees have labour card expiry within 30 days. Renewal required before next WPS submission.',
    date: '2025-03-13',
    entity: 'Abu Dhabi Branch',
  },
];

const severityConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  Critical: { color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3.5 h-3.5" /> },
  High: { color: 'bg-orange-100 text-orange-700', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  Medium: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3.5 h-3.5" /> },
  Low: { color: 'bg-blue-100 text-blue-700', icon: <Bell className="w-3.5 h-3.5" /> },
};

const statusConfig: Record<string, string> = {
  Open: 'bg-red-50 text-red-600 border-red-200',
  'In Progress': 'bg-amber-50 text-amber-600 border-amber-200',
  Resolved: 'bg-green-50 text-green-600 border-green-200',
};

export default function ComplianceAlertsPage() {
  const [filter, setFilter] = useState<string>('All');

  const filtered = filter === 'All' ? MOCK_ALERTS : MOCK_ALERTS.filter((a) => a.status === filter);
  const openCount = MOCK_ALERTS.filter((a) => a.status === 'Open').length;
  const criticalCount = MOCK_ALERTS.filter(
    (a) => a.severity === 'Critical' && a.status !== 'Resolved'
  ).length;

  return (
    <div className="space-y-6 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-indigo-500">Payroll Compliance</p>
          <h1 className="text-3xl font-bold">Compliance Alerts</h1>
          <p className="text-slate-500">
            Monitor regulatory deadlines, filing status, and compliance issues across jurisdictions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: 'Total Alerts',
            value: MOCK_ALERTS.length,
            icon: Bell,
            color: 'text-indigo-600 bg-indigo-50',
          },
          { label: 'Open', value: openCount, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
          {
            label: 'Critical',
            value: criticalCount,
            icon: ShieldAlert,
            color: 'text-orange-600 bg-orange-50',
          },
          {
            label: 'Resolved',
            value: MOCK_ALERTS.filter((a) => a.status === 'Resolved').length,
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

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        {['All', 'Open', 'In Progress', 'Resolved'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((alert) => (
          <div
            key={alert.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${severityConfig[alert.severity]?.color || ''}`}
                >
                  {severityConfig[alert.severity]?.icon} {alert.severity}
                </span>
                <h3 className="font-bold">{alert.title}</h3>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig[alert.status] || ''}`}
              >
                {alert.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-3">{alert.description}</p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                {alert.category}
              </span>
              <span>{alert.entity}</span>
              <span>{alert.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
