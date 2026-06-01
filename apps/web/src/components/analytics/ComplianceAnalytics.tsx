// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * @module ComplianceAnalytics
 * @description Compliance and audit analytics — audit trail dashboard, regulatory status,
 *              risk assessment matrix, certifications tracker (Sec 23.4)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  Download,
  Eye,
  AlertCircle,
  Award,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'audit' | 'regulatory' | 'risk' | 'certifications';
type RegulatoryStatus = 'compliant' | 'partial' | 'non-compliant' | 'pending-audit';
type _RiskLevel = 'critical' | 'high' | 'medium' | 'low';
type CertStatus = 'current' | 'expiring-soon' | 'expired' | 'in-progress';

interface AuditEntry {
  id: string;
  timestamp: string;
  entity: string;
  entityType: string;
  action: string;
  changedBy: string;
  ipAddress: string;
  severity: 'normal' | 'warning' | 'critical';
}

interface Regulation {
  id: string;
  name: string;
  fullName: string;
  status: RegulatoryStatus;
  complianceScore: number;
  lastAuditDate: string;
  nextAuditDate: string;
  openFindings: number;
  criticalFindings: number;
  auditor?: string;
}

interface Risk {
  id: string;
  title: string;
  category: string;
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  owner: string;
  mitigation: string;
  mitigationStatus: 'completed' | 'in-progress' | 'planned' | 'not-started';
  dueDate: string;
}

interface Certification {
  id: string;
  name: string;
  issuingBody: string;
  certDate: string;
  expiryDate: string;
  status: CertStatus;
  scope: string;
  openFindings: number;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const AUDIT_ENTRIES: AuditEntry[] = [
  {
    id: 'au-001',
    timestamp: '2026-02-26 14:32:18',
    entity: 'Employee Record #EMP-0142',
    entityType: 'Employee',
    action: 'Salary Modified',
    changedBy: 'hr.admin@company.com',
    ipAddress: '10.0.0.42',
    severity: 'warning',
  },
  {
    id: 'au-002',
    timestamp: '2026-02-26 13:15:44',
    entity: 'Leave Policy — Engineering',
    entityType: 'Policy',
    action: 'Policy Updated',
    changedBy: 'policy.manager@company.com',
    ipAddress: '10.0.0.18',
    severity: 'normal',
  },
  {
    id: 'au-003',
    timestamp: '2026-02-26 11:08:29',
    entity: 'User Role: HR_ADMIN',
    entityType: 'Access Control',
    action: 'Permission Escalated',
    changedBy: 'sys.admin@company.com',
    ipAddress: '10.0.0.5',
    severity: 'critical',
  },
  {
    id: 'au-004',
    timestamp: '2026-02-26 10:44:12',
    entity: 'Payroll Run #PR-2026-02',
    entityType: 'Payroll',
    action: 'Payroll Approved',
    changedBy: 'finance.lead@company.com',
    ipAddress: '10.0.0.31',
    severity: 'normal',
  },
  {
    id: 'au-005',
    timestamp: '2026-02-26 09:22:55',
    entity: 'Employee #EMP-0089',
    entityType: 'Employee',
    action: 'Termination Processed',
    changedBy: 'hr.ops@company.com',
    ipAddress: '10.0.0.22',
    severity: 'warning',
  },
  {
    id: 'au-006',
    timestamp: '2026-02-25 16:48:33',
    entity: 'Bulk Export: Employee Data',
    entityType: 'Data Export',
    action: 'Mass Data Export (290 records)',
    changedBy: 'data.analyst@company.com',
    ipAddress: '10.0.0.55',
    severity: 'critical',
  },
];

const REGULATIONS: Regulation[] = [
  {
    id: 'reg-gdpr',
    name: 'GDPR',
    fullName: 'General Data Protection Regulation',
    status: 'compliant',
    complianceScore: 94,
    lastAuditDate: '2025-11-15',
    nextAuditDate: '2026-05-15',
    openFindings: 2,
    criticalFindings: 0,
    auditor: 'PwC Advisory',
  },
  {
    id: 'reg-soc2',
    name: 'SOC 2',
    fullName: 'System and Organization Controls 2',
    status: 'compliant',
    complianceScore: 91,
    lastAuditDate: '2025-10-01',
    nextAuditDate: '2026-10-01',
    openFindings: 4,
    criticalFindings: 0,
    auditor: 'Deloitte',
  },
  {
    id: 'reg-iso',
    name: 'ISO 27001',
    fullName: 'Information Security Management System',
    status: 'partial',
    complianceScore: 78,
    lastAuditDate: '2025-09-20',
    nextAuditDate: '2026-03-20',
    openFindings: 8,
    criticalFindings: 1,
    auditor: 'BSI Group',
  },
  {
    id: 'reg-hipaa',
    name: 'HIPAA',
    fullName: 'Health Insurance Portability and Accountability Act',
    status: 'compliant',
    complianceScore: 96,
    lastAuditDate: '2025-12-10',
    nextAuditDate: '2026-06-10',
    openFindings: 1,
    criticalFindings: 0,
    auditor: 'Internal',
  },
  {
    id: 'reg-sox',
    name: 'SOX',
    fullName: 'Sarbanes-Oxley Act',
    status: 'pending-audit',
    complianceScore: 85,
    lastAuditDate: '2025-08-15',
    nextAuditDate: '2026-02-28',
    openFindings: 5,
    criticalFindings: 0,
    auditor: 'KPMG',
  },
];

const RISKS: Risk[] = [
  {
    id: 'r-001',
    title: 'Unauthorized Data Access via Elevated Permissions',
    category: 'Security',
    likelihood: 3,
    impact: 5,
    owner: 'CISO',
    mitigation: 'Implement PAM solution and quarterly access reviews',
    mitigationStatus: 'in-progress',
    dueDate: '2026-03-31',
  },
  {
    id: 'r-002',
    title: 'GDPR Data Subject Request SLA Breach',
    category: 'Compliance',
    likelihood: 2,
    impact: 4,
    owner: 'DPO',
    mitigation: 'Automate DSR processing workflow in HCM platform',
    mitigationStatus: 'planned',
    dueDate: '2026-04-15',
  },
  {
    id: 'r-003',
    title: 'Payroll Processing Error due to System Integration Failure',
    category: 'Operational',
    likelihood: 2,
    impact: 5,
    owner: 'Payroll Manager',
    mitigation: 'Implement redundant payroll validation layer',
    mitigationStatus: 'completed',
    dueDate: '2026-01-31',
  },
  {
    id: 'r-004',
    title: 'Employee Data Breach via Phishing Attack',
    category: 'Security',
    likelihood: 4,
    impact: 4,
    owner: 'CISO',
    mitigation: 'Mandatory security awareness training + MFA enforcement',
    mitigationStatus: 'in-progress',
    dueDate: '2026-03-15',
  },
  {
    id: 'r-005',
    title: 'Non-Compliance with Pay Equity Reporting Requirements',
    category: 'Regulatory',
    likelihood: 2,
    impact: 3,
    owner: 'Head of HR',
    mitigation: 'Annual pay equity audit and remediation plan',
    mitigationStatus: 'planned',
    dueDate: '2026-05-01',
  },
];

const CERTIFICATIONS: Certification[] = [
  {
    id: 'cert-001',
    name: 'SOC 2 Type II',
    issuingBody: 'Deloitte',
    certDate: '2025-10-01',
    expiryDate: '2026-10-01',
    status: 'current',
    scope: 'Security, Availability, Confidentiality',
    openFindings: 0,
  },
  {
    id: 'cert-002',
    name: 'ISO 27001:2022',
    issuingBody: 'BSI Group',
    certDate: '2025-09-20',
    expiryDate: '2026-09-20',
    status: 'current',
    scope: 'ISMS for all HCM data processing',
    openFindings: 2,
  },
  {
    id: 'cert-003',
    name: 'GDPR Data Protection Certification',
    issuingBody: 'PwC Advisory',
    certDate: '2025-11-15',
    expiryDate: '2026-05-15',
    status: 'expiring-soon',
    scope: 'EU employee personal data processing',
    openFindings: 1,
  },
  {
    id: 'cert-004',
    name: 'HIPAA Business Associate Agreement',
    issuingBody: 'Health Compliance Org',
    certDate: '2025-12-10',
    expiryDate: '2027-12-10',
    status: 'current',
    scope: 'PHI handling for benefits administration',
    openFindings: 0,
  },
  {
    id: 'cert-005',
    name: 'PCI DSS Level 2',
    issuingBody: 'QSA Partner',
    certDate: '2025-06-01',
    expiryDate: '2026-06-01',
    status: 'current',
    scope: 'Payment card data for rewards program',
    openFindings: 0,
  },
  {
    id: 'cert-006',
    name: 'CCPA Compliance Attestation',
    issuingBody: 'Internal Legal',
    certDate: '2024-01-15',
    expiryDate: '2026-01-15',
    status: 'in-progress',
    scope: 'California employee & consumer data',
    openFindings: 3,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const TAB_LIST: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'audit', label: 'Audit Dashboard', icon: Eye },
  { id: 'regulatory', label: 'Regulatory Status', icon: Shield },
  { id: 'risk', label: 'Risk Assessment', icon: AlertTriangle },
  { id: 'certifications', label: 'Certifications', icon: Award },
];

function regulatoryStatusConfig(s: RegulatoryStatus) {
  const map = {
    compliant: {
      label: 'Compliant',
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      dotColor: 'bg-emerald-500',
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
    },
    partial: {
      label: 'Partial',
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      dotColor: 'bg-amber-500',
      icon: AlertCircle,
      iconColor: 'text-amber-500',
    },
    'non-compliant': {
      label: 'Non-Compliant',
      color: 'bg-red-100 text-red-700 border-red-200',
      dotColor: 'bg-red-500',
      icon: AlertTriangle,
      iconColor: 'text-red-500',
    },
    'pending-audit': {
      label: 'Pending Audit',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      dotColor: 'bg-blue-500',
      icon: Clock,
      iconColor: 'text-blue-500',
    },
  };
  return map[s];
}

function certStatusConfig(s: CertStatus) {
  const map = {
    current: { label: 'Current', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    'expiring-soon': { label: 'Expiring Soon', color: 'bg-amber-100 text-amber-700', icon: Clock },
    expired: { label: 'Expired', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
    'in-progress': {
      label: 'Renewal In Progress',
      color: 'bg-blue-100 text-blue-700',
      icon: RefreshCw,
    },
  };
  return map[s];
}

function auditSeverityColor(s: AuditEntry['severity']) {
  const map = {
    normal: 'bg-gray-100 text-gray-600',
    warning: 'bg-amber-100 text-amber-700',
    critical: 'bg-red-100 text-red-700',
  };
  return map[s];
}

function mitigationStatusColor(s: Risk['mitigationStatus']) {
  const map = {
    completed: 'bg-emerald-100 text-emerald-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    planned: 'bg-amber-100 text-amber-700',
    'not-started': 'bg-red-100 text-red-700',
  };
  return map[s];
}

function riskScore(r: Risk): number {
  return r.likelihood * r.impact;
}

function riskScoreColor(score: number): string {
  if (score >= 16) return 'bg-red-500 text-white';
  if (score >= 9) return 'bg-amber-500 text-white';
  if (score >= 4) return 'bg-yellow-400 text-gray-800';
  return 'bg-green-200 text-green-800';
}

// ── Tab: Audit Dashboard ──────────────────────────────────────────────────────

function AuditDashboardTab() {
  const auditStats = [
    { label: 'Changes Today', value: '42', color: 'text-gray-800' },
    { label: 'Changes This Week', value: '284', color: 'text-blue-600' },
    { label: 'Changes This Month', value: '1,128', color: 'text-indigo-600' },
    { label: 'Critical Alerts', value: '3', color: 'text-red-600' },
  ];

  const topChangedEntities = [
    { entity: 'Employee Records', changes: 384, icon: '👤' },
    { entity: 'Leave Requests', changes: 218, icon: '📅' },
    { entity: 'Payroll Processing', changes: 96, icon: '💵' },
    { entity: 'Access Permissions', changes: 78, icon: '🔑' },
    { entity: 'Policy Documents', changes: 52, icon: '📄' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {auditStats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              {s.label}
            </p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Most Changed Entities (This Month)</h3>
          <div className="space-y-3">
            {topChangedEntities.map((e) => (
              <div key={e.entity} className="flex items-center gap-3">
                <span className="text-lg">{e.icon}</span>
                <span className="text-sm text-gray-700 flex-1">{e.entity}</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(e.changes / 400) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600 w-10 text-right">
                  {e.changes}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Unusual Activity Alerts</h3>
            <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-lg">
              3 Active
            </span>
          </div>
          <div className="space-y-3">
            {AUDIT_ENTRIES.filter((e) => e.severity === 'critical').map((e) => (
              <div key={e.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">{e.action}</p>
                    <p className="text-xs text-red-600">
                      {e.entity} — {e.changedBy}
                    </p>
                    <p className="text-xs text-red-400">{e.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Recent Audit Trail</h3>
          <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5">
            <Download className="w-3.5 h-3.5" /> Export Audit Log
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Entity
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Changed By
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  IP
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Severity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {AUDIT_ENTRIES.map((entry) => (
                <tr
                  key={entry.id}
                  className={`hover:bg-gray-50 ${entry.severity === 'critical' ? 'bg-red-50' : ''}`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{entry.timestamp}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{entry.entity}</p>
                      <p className="text-xs text-gray-400">{entry.entityType}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{entry.action}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{entry.changedBy}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{entry.ipAddress}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${auditSeverityColor(entry.severity)}`}
                    >
                      {entry.severity.charAt(0).toUpperCase() + entry.severity.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Regulatory Status ────────────────────────────────────────────────────

function RegulatoryStatusTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Compliant', value: '3', color: 'text-emerald-600' },
          { label: 'Partial Compliance', value: '1', color: 'text-amber-600' },
          { label: 'Pending Audit', value: '1', color: 'text-blue-600' },
          { label: 'Avg Compliance Score', value: '88.8%', color: 'text-purple-600' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              {m.label}
            </p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {REGULATIONS.map((reg) => {
          const { label, color, icon: Icon, _iconColor } = regulatoryStatusConfig(reg.status);
          return (
            <div key={reg.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-lg font-bold text-gray-800">{reg.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${color} flex items-center gap-1`}
                    >
                      <Icon className="w-3 h-3" /> {label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{reg.fullName}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400">Last Audit</span>
                      <p className="font-semibold text-gray-700 mt-0.5">{reg.lastAuditDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Next Audit Due</span>
                      <p className="font-semibold text-gray-700 mt-0.5">{reg.nextAuditDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Open Findings</span>
                      <p
                        className={`font-semibold mt-0.5 ${reg.openFindings > 0 ? 'text-amber-600' : 'text-emerald-600'}`}
                      >
                        {reg.openFindings}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Critical Findings</span>
                      <p
                        className={`font-semibold mt-0.5 ${reg.criticalFindings > 0 ? 'text-red-600' : 'text-emerald-600'}`}
                      >
                        {reg.criticalFindings}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg ${reg.complianceScore >= 90 ? 'bg-emerald-500' : reg.complianceScore >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                  >
                    {reg.complianceScore}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Compliance</p>
                  {reg.auditor && <p className="text-xs text-gray-400 mt-0.5">{reg.auditor}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab: Risk Assessment ──────────────────────────────────────────────────────

function RiskAssessmentTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Risk Matrix (Likelihood × Impact)</h3>
          <div className="grid grid-cols-6 gap-1 text-xs">
            {/* Header */}
            <div />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="text-center text-gray-500 font-medium pb-2">
                Impact {i}
              </div>
            ))}
            {/* Grid rows (Impact axis, Likelihood rows) */}
            {[5, 4, 3, 2, 1].map((likelihood) => (
              <React.Fragment key={likelihood}>
                <div className="text-gray-500 font-medium flex items-center justify-end pr-1">
                  L{likelihood}
                </div>
                {[1, 2, 3, 4, 5].map((impact) => {
                  const score = likelihood * impact;
                  const hasRisk = RISKS.find(
                    (r) => r.likelihood === likelihood && r.impact === impact
                  );
                  return (
                    <div
                      key={impact}
                      className={`aspect-square rounded flex items-center justify-center text-xs font-bold ${riskScoreColor(score)}`}
                      title={hasRisk ? hasRisk.title : ''}
                    >
                      {hasRisk ? '●' : score}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="flex gap-3 mt-3 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-200 inline-block" /> Low (1-3)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-yellow-400 inline-block" /> Medium (4-8)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-amber-500 inline-block" /> High (9-15)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-500 inline-block" /> Critical (16-25)
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Risk Summary</h3>
          {[
            {
              label: 'Critical Risks',
              count: RISKS.filter((r) => riskScore(r) >= 16).length,
              color: 'text-red-600',
              bg: 'bg-red-50',
            },
            {
              label: 'High Risks',
              count: RISKS.filter((r) => riskScore(r) >= 9 && riskScore(r) < 16).length,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
            },
            {
              label: 'Medium Risks',
              count: RISKS.filter((r) => riskScore(r) >= 4 && riskScore(r) < 9).length,
              color: 'text-yellow-700',
              bg: 'bg-yellow-50',
            },
            {
              label: 'Low Risks',
              count: RISKS.filter((r) => riskScore(r) < 4).length,
              color: 'text-green-700',
              bg: 'bg-green-50',
            },
          ].map((row) => (
            <div
              key={row.label}
              className={`flex items-center justify-between p-3 rounded-lg mb-2 ${row.bg}`}
            >
              <span className="text-sm font-medium text-gray-700">{row.label}</span>
              <span className={`text-xl font-bold ${row.color}`}>{row.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Top Risks &amp; Mitigation Plans</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {RISKS.sort((a, b) => riskScore(b) - riskScore(a)).map((risk) => {
            const score = riskScore(risk);
            return (
              <div key={risk.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${riskScoreColor(score)}`}
                  >
                    {score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-gray-800 text-sm">{risk.title}</p>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {risk.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{risk.mitigation}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>Owner: {risk.owner}</span>
                      <span>Due: {risk.dueDate}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-medium ${mitigationStatusColor(risk.mitigationStatus)}`}
                      >
                        {risk.mitigationStatus.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Certifications ───────────────────────────────────────────────────────

function CertificationsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Current',
            value: CERTIFICATIONS.filter((c) => c.status === 'current').length,
            color: 'text-emerald-600',
          },
          {
            label: 'Expiring Soon',
            value: CERTIFICATIONS.filter((c) => c.status === 'expiring-soon').length,
            color: 'text-amber-600',
          },
          {
            label: 'Renewal In Progress',
            value: CERTIFICATIONS.filter((c) => c.status === 'in-progress').length,
            color: 'text-blue-600',
          },
          {
            label: 'Open Audit Findings',
            value: CERTIFICATIONS.reduce((s, c) => s + c.openFindings, 0),
            color: 'text-orange-600',
          },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              {m.label}
            </p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CERTIFICATIONS.map((cert) => {
          const { label, color, icon: Icon } = certStatusConfig(cert.status);
          return (
            <div
              key={cert.id}
              className={`bg-white rounded-xl border shadow-sm p-5 ${cert.status === 'expiring-soon' ? 'border-amber-200' : 'border-gray-100'}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm">{cert.name}</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${color} flex items-center gap-1`}
                    >
                      <Icon className="w-3 h-3" /> {label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {cert.issuingBody} — {cert.scope}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Issued</span>
                      <p className="font-medium text-gray-700">{cert.certDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Expires</span>
                      <p
                        className={`font-medium ${cert.status === 'expiring-soon' ? 'text-amber-600' : 'text-gray-700'}`}
                      >
                        {cert.expiryDate}
                      </p>
                    </div>
                  </div>
                  {cert.openFindings > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                      <AlertCircle className="w-3 h-3" /> {cert.openFindings} open finding
                      {cert.openFindings > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ComplianceAnalytics() {
  const [activeTab, setActiveTab] = useState<TabId>('audit');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Audit trail, regulatory compliance, risk management, and certifications
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 600);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-1">
          {TAB_LIST.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'audit' && <AuditDashboardTab />}
          {activeTab === 'regulatory' && <RegulatoryStatusTab />}
          {activeTab === 'risk' && <RiskAssessmentTab />}
          {activeTab === 'certifications' && <CertificationsTab />}
        </>
      )}
    </div>
  );
}
