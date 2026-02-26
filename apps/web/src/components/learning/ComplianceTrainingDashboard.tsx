'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  RefreshCw,
  Plus,
  BookOpen,
  Award,
  Calendar,
} from 'lucide-react';
import type {
  TrainingModule,
  TrainingAssignment,
  Certification,
  DepartmentCompliance,
  TrainingStatus,
  TrainingCategory,
} from '@/services/complianceTrainingService';
import { ComplianceTrainingService } from '@/services/complianceTrainingService';

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = 'required' | 'assignments' | 'certifications' | 'report';

interface DashboardState {
  modules: TrainingModule[];
  assignments: TrainingAssignment[];
  certifications: Certification[];
  deptCompliance: DepartmentCompliance[];
  loading: boolean;
  activeTab: Tab;
  assignmentFilter: TrainingStatus | 'All';
  categoryFilter: TrainingCategory | 'All';
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<TrainingCategory, string> = {
  regulatory: 'Regulatory',
  safety: 'Safety',
  privacy: 'Data Privacy',
  security: 'Cybersecurity',
  ethics: 'Ethics',
  anti_harassment: 'Anti-Harassment',
  financial: 'Financial / SOX',
  environmental: 'Environmental',
};

const CATEGORY_COLORS: Record<TrainingCategory, string> = {
  regulatory: 'bg-sky-100 text-sky-700',
  safety: 'bg-orange-100 text-orange-700',
  privacy: 'bg-purple-100 text-purple-700',
  security: 'bg-slate-200 text-slate-700',
  ethics: 'bg-emerald-100 text-emerald-700',
  anti_harassment: 'bg-pink-100 text-pink-700',
  financial: 'bg-amber-100 text-amber-700',
  environmental: 'bg-green-100 text-green-700',
};

const STATUS_STYLES: Record<TrainingStatus, string> = {
  not_started: 'bg-slate-100 text-slate-500',
  in_progress: 'bg-sky-100 text-sky-700',
  completed: 'bg-emerald-100 text-emerald-700',
  expired: 'bg-red-100 text-red-700',
  overdue: 'bg-red-200 text-red-800',
  waived: 'bg-purple-100 text-purple-600',
};

// Well-known mandatory training programs
const MANDATORY_TRAINING_NAMES = [
  'SOX Compliance',
  'HIPAA Privacy',
  'OSHA Safety',
  'Data Privacy & GDPR',
  'Anti-Harassment & Discrimination',
  'Code of Conduct',
  'Cybersecurity Awareness',
  'Anti-Bribery & Corruption',
  'Financial Controls',
  'Environmental & Safety',
];

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

// ── Sub Components ─────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Required Training Tab ──────────────────────────────────────────────────────

function RequiredTrainingTab({ modules }: { modules: TrainingModule[] }) {
  const mandatory = modules.filter((m) => m.isMandatory);

  // Supplement with well-known ones if list is short
  const displayList =
    mandatory.length > 0
      ? mandatory
      : MANDATORY_TRAINING_NAMES.map((name, idx) => ({
          id: `mock-${idx}`,
          moduleCode: `CT-${String(idx + 1).padStart(3, '0')}`,
          title: name,
          description: `Mandatory ${name} training for all employees`,
          category:
            (
              [
                'financial',
                'privacy',
                'safety',
                'privacy',
                'anti_harassment',
                'ethics',
                'security',
                'ethics',
                'financial',
                'environmental',
              ] as TrainingCategory[]
            )[idx] || 'regulatory',
          frequency: 'annual' as const,
          durationMinutes: [60, 90, 120, 45, 60, 30, 45, 60, 90, 60][idx] || 60,
          passingScore: 80,
          maxAttempts: 3,
          contentType: ['video', 'quiz'] as any,
          isActive: true,
          isMandatory: true,
          version: '1.0',
          createdDate: '2024-01-01',
          lastUpdated: '2025-01-01',
          tags: [],
          regulatoryFramework: [name.split(' ')[0]],
        }));

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">{displayList.length} mandatory training modules</p>
      {displayList.map((module) => {
        const catLabel = CATEGORY_LABELS[module.category as TrainingCategory] || module.category;
        const catColor =
          CATEGORY_COLORS[module.category as TrainingCategory] || 'bg-slate-100 text-slate-600';
        return (
          <div
            key={module.id}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-400 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0">
                  <BookOpen size={16} className="text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{module.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {module.moduleCode} &bull; v{module.version}
                  </p>
                </div>
              </div>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${catColor}`}>
                {catLabel}
              </span>
            </div>

            <p className="text-sm text-slate-500 mb-3 line-clamp-1">{module.description}</p>

            <div className="flex flex-wrap gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {module.durationMinutes} min
              </span>
              <span className="flex items-center gap-1">
                <Award size={11} />
                Pass: {module.passingScore}%
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {module.frequency.replace('_', ' ')}
              </span>
              {module.regulatoryFramework && module.regulatoryFramework.length > 0 && (
                <span className="flex items-center gap-1">
                  <ShieldCheck size={11} />
                  {module.regulatoryFramework.join(', ')}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Assignments Tab ────────────────────────────────────────────────────────────

function AssignmentsTab({
  assignments,
  statusFilter,
  onStatusFilterChange,
}: {
  assignments: TrainingAssignment[];
  statusFilter: TrainingStatus | 'All';
  onStatusFilterChange: (s: TrainingStatus | 'All') => void;
}) {
  const filtered = assignments.filter((a) => statusFilter === 'All' || a.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {(['All', 'not_started', 'in_progress', 'completed', 'overdue'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onStatusFilterChange(s as TrainingStatus | 'All')}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap ${
                statusFilter === s ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'
              }`}
            >
              {s === 'All'
                ? 'All'
                : s === 'not_started'
                  ? 'Not Started'
                  : s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left p-4 font-semibold text-slate-600">Employee</th>
              <th className="text-left p-4 font-semibold text-slate-600">Training</th>
              <th className="text-left p-4 font-semibold text-slate-600">Assigned</th>
              <th className="text-left p-4 font-semibold text-slate-600">Due Date</th>
              <th className="text-left p-4 font-semibold text-slate-600">Status</th>
              <th className="text-right p-4 font-semibold text-slate-600">Progress</th>
              <th className="text-right p-4 font-semibold text-slate-600">Overdue</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 25).map((assignment) => {
              const daysLeft = daysUntil(assignment.dueDate);
              return (
                <tr
                  key={assignment.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4">
                    <p className="font-medium text-slate-800">{assignment.employeeName}</p>
                    <p className="text-xs text-slate-400">{assignment.departmentName}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-700">{assignment.moduleTitle}</p>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${CATEGORY_COLORS[assignment.category] || 'bg-slate-100 text-slate-500'}`}
                    >
                      {CATEGORY_LABELS[assignment.category] || assignment.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs">
                    {new Date(assignment.assignedDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-slate-600">
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                    {assignment.status !== 'completed' && daysLeft > 0 && daysLeft <= 7 && (
                      <p className="text-xs text-amber-600">{daysLeft}d remaining</p>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${STATUS_STYLES[assignment.status]}`}
                    >
                      {assignment.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${assignment.progress === 100 ? 'bg-emerald-500' : 'bg-sky-500'}`}
                          style={{ width: `${assignment.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{assignment.progress}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    {assignment.isOverdue ? (
                      <span className="text-xs font-semibold text-red-600">OVERDUE</span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400">No assignments found.</div>
        )}
      </div>
    </div>
  );
}

// ── Certifications Tab ─────────────────────────────────────────────────────────

function CertificationsTab({ certifications }: { certifications: Certification[] }) {
  return (
    <div className="space-y-4">
      {certifications.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Award size={48} className="mx-auto mb-3 text-slate-200" />
          <p>No certifications found. Certifications are issued upon training completion.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certifications.map((cert) => {
            const expiryDays = daysUntil(cert.expiryDate);
            const isExpiring = expiryDays > 0 && expiryDays <= 30;
            const isExpired = expiryDays <= 0;
            return (
              <div
                key={cert.id}
                className={`bg-white rounded-xl border p-5 ${
                  isExpired
                    ? 'border-red-300'
                    : isExpiring
                      ? 'border-amber-300'
                      : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Award size={18} className="text-amber-600" />
                  </div>
                  {isExpired ? (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg font-medium">
                      Expired
                    </span>
                  ) : isExpiring ? (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-lg font-medium">
                      Expiring Soon
                    </span>
                  ) : (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-medium">
                      Active
                    </span>
                  )}
                </div>
                <p className="font-semibold text-slate-800">
                  {cert.moduleName || cert.certificationCode}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">{cert.employeeName}</p>
                <div className="mt-3 space-y-1 text-xs text-slate-400">
                  <p>Issued: {new Date(cert.issuedDate).toLocaleDateString()}</p>
                  <p>
                    Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                    {isExpiring && !isExpired && (
                      <span className="text-amber-600 ml-1">({expiryDays}d left)</span>
                    )}
                  </p>
                  {cert.renewalRequired && (
                    <p className="text-amber-600 font-medium">Renewal Required</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Compliance Report Tab ──────────────────────────────────────────────────────

function ComplianceReportTab({
  assignments,
  modules,
  deptCompliance,
}: {
  assignments: TrainingAssignment[];
  modules: TrainingModule[];
  deptCompliance: DepartmentCompliance[];
}) {
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter((a) => a.status === 'completed').length;
  const overallRate =
    totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;
  const overdueCount = assignments.filter((a) => a.isOverdue).length;
  const expiringSoon = assignments.filter((a) => {
    const d = daysUntil(a.dueDate);
    return d > 0 && d <= 14 && a.status !== 'completed';
  }).length;

  // By category stats
  const byCategory = (Object.keys(CATEGORY_LABELS) as TrainingCategory[])
    .map((cat) => {
      const catAssignments = assignments.filter((a) => a.category === cat);
      const catCompleted = catAssignments.filter((a) => a.status === 'completed').length;
      return {
        category: cat,
        total: catAssignments.length,
        completed: catCompleted,
        rate:
          catAssignments.length > 0 ? Math.round((catCompleted / catAssignments.length) * 100) : 0,
      };
    })
    .filter((c) => c.total > 0);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ShieldCheck size={18} className="text-emerald-600" />}
          label="Overall Completion"
          value={`${overallRate}%`}
          sub={`${completedAssignments}/${totalAssignments}`}
          color="bg-emerald-100"
        />
        <StatCard
          icon={<AlertTriangle size={18} className="text-red-600" />}
          label="Overdue Items"
          value={overdueCount}
          color="bg-red-100"
        />
        <StatCard
          icon={<Clock size={18} className="text-amber-600" />}
          label="Due in 14 Days"
          value={expiringSoon}
          color="bg-amber-100"
        />
        <StatCard
          icon={<BookOpen size={18} className="text-sky-600" />}
          label="Active Modules"
          value={modules.filter((m) => m.isActive && m.isMandatory).length}
          color="bg-sky-100"
        />
      </div>

      {/* By Training Category */}
      {byCategory.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">
            Completion Rate by Training Category
          </h3>
          <div className="space-y-3">
            {byCategory.map(({ category, total, completed, rate }) => (
              <div key={category} className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded w-32 flex-shrink-0 text-center font-medium ${CATEGORY_COLORS[category]}`}
                >
                  {CATEGORY_LABELS[category]}
                </span>
                <div className="flex-1 bg-slate-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${rate >= 90 ? 'bg-emerald-500' : rate >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700 w-12 text-right">{rate}%</span>
                <span className="text-xs text-slate-400 w-16 text-right">
                  {completed}/{total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Department Compliance */}
      {deptCompliance.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Department Compliance Percentage</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-3 font-semibold text-slate-600">Department</th>
                  <th className="text-right pb-3 font-semibold text-slate-600">Total</th>
                  <th className="text-right pb-3 font-semibold text-slate-600">Completed</th>
                  <th className="text-right pb-3 font-semibold text-slate-600">Overdue</th>
                  <th className="pb-3 pl-4 font-semibold text-slate-600">Rate</th>
                </tr>
              </thead>
              <tbody>
                {deptCompliance.map((dept) => {
                  const rate =
                    dept.totalAssignments > 0
                      ? Math.round((dept.completedAssignments / dept.totalAssignments) * 100)
                      : 0;
                  return (
                    <tr key={dept.departmentId} className="border-b border-slate-50">
                      <td className="py-3 font-medium text-slate-800">{dept.departmentName}</td>
                      <td className="py-3 text-right text-slate-600">{dept.totalAssignments}</td>
                      <td className="py-3 text-right text-emerald-600">
                        {dept.completedAssignments}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={
                            dept.overdueAssignments > 0
                              ? 'text-red-600 font-semibold'
                              : 'text-slate-400'
                          }
                        >
                          {dept.overdueAssignments}
                        </span>
                      </td>
                      <td className="py-3 pl-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${rate >= 90 ? 'bg-emerald-500' : rate >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-600">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Department Compliance</h3>
          <div className="text-center py-8 text-slate-400 text-sm">
            No department breakdown available.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ComplianceTrainingDashboard() {
  const [state, setState] = useState<DashboardState>({
    modules: [],
    assignments: [],
    certifications: [],
    deptCompliance: [],
    loading: true,
    activeTab: 'required',
    assignmentFilter: 'All',
    categoryFilter: 'All',
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const [modules, assignments, deptCompliance] = await Promise.all([
        ComplianceTrainingService.getModules
          ? ComplianceTrainingService.getModules()
          : Promise.resolve([]),
        ComplianceTrainingService.getAssignments
          ? ComplianceTrainingService.getAssignments()
          : Promise.resolve([]),
        ComplianceTrainingService.getDepartmentCompliance
          ? ComplianceTrainingService.getDepartmentCompliance()
          : Promise.resolve([]),
      ]);

      // Get some certs if available
      let certifications: Certification[] = [];
      try {
        certifications = (await ComplianceTrainingService.getCertifications('all')) || [];
      } catch {
        /* certifications remain empty */
      }

      setState((s) => ({
        ...s,
        modules: modules.modules || modules,
        assignments: assignments.assignments || assignments,
        certifications,
        deptCompliance: deptCompliance.departments || deptCompliance,
        loading: false,
      }));
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const {
    modules,
    assignments,
    certifications,
    deptCompliance,
    loading,
    activeTab,
    assignmentFilter,
  } = state;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'required', label: 'Required Training' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'report', label: 'Compliance Report' },
  ];

  const overdueCount = assignments.filter((a) => a.isOverdue).length;
  const completedCount = assignments.filter((a) => a.status === 'completed').length;
  const overallRate =
    assignments.length > 0 ? Math.round((completedCount / assignments.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-slate-400" />
        <span className="ml-3 text-slate-500">Loading compliance training...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Compliance Training</h1>
          <p className="text-sm text-slate-500 mt-1">
            Mandatory training assignments, certifications, and compliance reporting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700">
            <Plus size={14} />
            Assign Training
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ShieldCheck size={18} className="text-emerald-600" />}
          label="Overall Compliance"
          value={`${overallRate}%`}
          sub={`${completedCount}/${assignments.length}`}
          color="bg-emerald-100"
        />
        <StatCard
          icon={<BookOpen size={18} className="text-sky-600" />}
          label="Mandatory Modules"
          value={modules.filter((m) => m.isMandatory).length}
          color="bg-sky-100"
        />
        <StatCard
          icon={<AlertTriangle size={18} className="text-red-600" />}
          label="Overdue"
          value={overdueCount}
          sub="require immediate action"
          color="bg-red-100"
        />
        <StatCard
          icon={<Award size={18} className="text-amber-600" />}
          label="Certifications"
          value={certifications.length}
          color="bg-amber-100"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setState((s) => ({ ...s, activeTab: tab.id }))}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'required' && <RequiredTrainingTab modules={modules} />}
        {activeTab === 'assignments' && (
          <AssignmentsTab
            assignments={assignments}
            statusFilter={assignmentFilter}
            onStatusFilterChange={(f) => setState((s) => ({ ...s, assignmentFilter: f }))}
          />
        )}
        {activeTab === 'certifications' && <CertificationsTab certifications={certifications} />}
        {activeTab === 'report' && (
          <ComplianceReportTab
            assignments={assignments}
            modules={modules}
            deptCompliance={deptCompliance}
          />
        )}
      </div>
    </div>
  );
}
