'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import {
  UserPlus,
  BookOpen,
  Clock,
  CheckCircle2,
  Loader2,
  Search,
  X,
  ChevronDown,
  Calendar,
  Send,
  Users,
  Building2,
  Zap,
} from 'lucide-react';
import type {
  TrainingModule,
  TrainingAssignment as TrainingAssignmentType,
  AutoAssignCriteria,
} from '@/services/complianceTrainingService';
import {
  ComplianceTrainingService,
  TRAINING_CATEGORY_META,
} from '@/services/complianceTrainingService';

// ── Schema ────────────────────────────────────────────────────────────────────

const AssignmentSchema = z.object({
  moduleId: z.string().min(1, 'Please select a training module'),
  employeeIds: z.array(z.string()).min(1, 'Select at least one employee'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
});

// ── Mock employee list for demo ───────────────────────────────────────────────

const MOCK_EMPLOYEES = [
  { id: 'emp-001', name: 'Jane Doe', department: 'Engineering', role: 'Senior Engineer' },
  { id: 'emp-002', name: 'John Smith', department: 'Sales & Marketing', role: 'Account Executive' },
  { id: 'emp-003', name: 'Sarah Lee', department: 'Human Resources', role: 'HR Manager' },
  { id: 'emp-004', name: 'Michael Zhang', department: 'Engineering', role: 'Engineering Manager' },
  { id: 'emp-005', name: 'Jennifer Martinez', department: 'Sales & Marketing', role: 'VP Sales' },
  { id: 'emp-006', name: 'David Kim', department: 'Finance', role: 'Finance Director' },
  { id: 'emp-007', name: 'Emily Johnson', department: 'Finance', role: 'Senior Accountant' },
  { id: 'emp-008', name: 'Robert Brown', department: 'IT', role: 'IT Manager' },
];

const MOCK_DEPARTMENTS = ['Engineering', 'Sales & Marketing', 'Human Resources', 'Finance', 'IT'];

// ── Module selector ───────────────────────────────────────────────────────────

function ModuleSelect({
  modules,
  value,
  onChange,
  error,
}: {
  modules: TrainingModule[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = modules.find((m) => m.id === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm border rounded-xl bg-white dark:bg-slate-900 text-left transition-colors ${
          error
            ? 'border-red-400'
            : open
              ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'
        }`}
      >
        {selected ? (
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-slate-900 dark:text-slate-100">{selected.title}</span>
          </span>
        ) : (
          <span className="text-slate-400">Select training module...</span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
          {modules.map((m) => {
            const catMeta = TRAINING_CATEGORY_META[m.category];
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onChange(m.id);
                  setOpen(false);
                }}
                className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left ${m.id === value ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
              >
                <BookOpen
                  className={`w-4 h-4 mt-0.5 shrink-0 ${catMeta?.color ?? 'text-indigo-600'}`}
                />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {m.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {catMeta?.label} · {m.durationMinutes} min · {m.frequency}
                    {m.isMandatory && (
                      <span className="ml-2 text-red-500 font-semibold">Mandatory</span>
                    )}
                  </p>
                </div>
                {m.id === value && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 ml-auto shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Auto-assign panel ─────────────────────────────────────────────────────────

interface AutoAssignPanelProps {
  modules: TrainingModule[];
  onComplete: (result: { assigned: number }) => void;
}

function AutoAssignPanel({ modules, onComplete }: AutoAssignPanelProps) {
  const [selectedModule, setSelectedModule] = useState('');
  const [criteria, setCriteria] = useState<AutoAssignCriteria>({
    departments: [],
    onHire: false,
    dueDays: 30,
  });
  const [loading, setLoading] = useState(false);

  const toggleDept = (dept: string) => {
    setCriteria((c) => ({
      ...c,
      departments: c.departments?.includes(dept)
        ? c.departments.filter((d) => d !== dept)
        : [...(c.departments ?? []), dept],
    }));
  };

  const handleAutoAssign = async () => {
    if (!selectedModule) return;
    setLoading(true);
    try {
      const result = await ComplianceTrainingService.autoAssignTraining(selectedModule, criteria);
      onComplete({ assigned: result.assigned });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/10 dark:to-indigo-900/10 border border-violet-200 dark:border-violet-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-violet-600" />
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Auto-Assignment
        </h3>
      </div>
      <p className="text-sm text-slate-500">
        Automatically assign a training to employees based on role, department, or hire date.
      </p>

      {/* Module select */}
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          Training Module
        </label>
        <ModuleSelect modules={modules} value={selectedModule} onChange={setSelectedModule} />
      </div>

      {/* Department criteria */}
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
          Target Departments
        </label>
        <div className="flex flex-wrap gap-2">
          {MOCK_DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => toggleDept(dept)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                criteria.departments?.includes(dept)
                  ? 'bg-violet-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-400'
              }`}
            >
              <Building2 className="w-3 h-3" />
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Options row */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            className="rounded border-slate-300 dark:border-slate-600 text-violet-600 focus:ring-violet-500"
            checked={criteria.onHire ?? false}
            onChange={(e) => setCriteria((c) => ({ ...c, onHire: e.target.checked }))}
          />
          Assign on hire
        </label>

        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Clock className="w-4 h-4 text-slate-400" />
          Due in
          <input
            type="number"
            min={1}
            max={365}
            value={criteria.dueDays ?? 30}
            onChange={(e) => setCriteria((c) => ({ ...c, dueDays: Number(e.target.value) }))}
            className="w-16 px-2 py-1 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          days
        </div>
      </div>

      <button
        onClick={handleAutoAssign}
        disabled={!selectedModule || loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Processing...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" /> Run Auto-Assignment
          </>
        )}
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface TrainingAssignmentProps {
  onAssigned?: () => void;
}

export function TrainingAssignment({ onAssigned }: TrainingAssignmentProps) {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [assignments, setAssignments] = useState<TrainingAssignmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'manual' | 'auto'>('manual');
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [empSearch, setEmpSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  useEffect(() => {
    Promise.all([
      ComplianceTrainingService.getTrainingModules(),
      ComplianceTrainingService.getAllAssignments(),
    ])
      .then(([mods, asgns]) => {
        setModules(mods);
        setAssignments(asgns);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredEmployees = MOCK_EMPLOYEES.filter((e) => {
    const matchSearch = !empSearch || e.name.toLowerCase().includes(empSearch.toLowerCase());
    const matchDept = !deptFilter || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  const toggleEmployee = (id: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const ids = filteredEmployees.map((e) => e.id);
    setSelectedEmployees(Array.from(new Set([...selectedEmployees, ...ids])));
  };

  const validate = () => {
    try {
      AssignmentSchema.parse({
        moduleId: selectedModule,
        employeeIds: selectedEmployees,
        dueDate,
        notes,
      });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) fieldErrors[String(e.path[0])] = e.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const result = await ComplianceTrainingService.createAssignment({
        employeeIds: selectedEmployees,
        moduleId: selectedModule,
        dueDate,
        notes: notes || undefined,
      });
      setSuccess(
        `Successfully assigned training to ${result.created} employee${result.created !== 1 ? 's' : ''}`
      );
      setSelectedModule('');
      setSelectedEmployees([]);
      setDueDate('');
      setNotes('');
      onAssigned?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Training Assignments
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Assign compliance trainings to employees or departments
        </p>
      </div>

      {/* Success toast */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm text-emerald-700 dark:text-emerald-300 flex-1">{success}</span>
          <button onClick={() => setSuccess(null)}>
            <X className="w-4 h-4 text-emerald-400 hover:text-emerald-600" />
          </button>
        </div>
      )}

      {/* Tab toggle */}
      <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden w-fit">
        {[
          { id: 'manual', label: 'Manual Assignment', icon: UserPlus },
          { id: 'auto', label: 'Auto-Assignment', icon: Zap },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as 'manual' | 'auto')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : activeTab === 'auto' ? (
        <AutoAssignPanel
          modules={modules}
          onComplete={({ assigned }) =>
            setSuccess(`Auto-assigned training to ${assigned} employee${assigned !== 1 ? 's' : ''}`)
          }
        />
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: module + dates */}
          <div className="space-y-4">
            {/* Module */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Training Module <span className="text-red-500">*</span>
              </label>
              <ModuleSelect
                modules={modules}
                value={selectedModule}
                onChange={setSelectedModule}
                error={errors.moduleId}
              />
            </div>

            {/* Due date */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Due Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    errors.dueDate ? 'border-red-400' : 'border-slate-300 dark:border-slate-700'
                  }`}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {errors.dueDate && <p className="mt-1 text-xs text-red-500">{errors.dueDate}</p>}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Notes (optional)
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Add a note for employees about this training..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Assigning...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Assign to {selectedEmployees.length} Employee
                  {selectedEmployees.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>

          {/* Right: employee selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Select Employees
                  {selectedEmployees.length > 0 && (
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                      {selectedEmployees.length} selected
                    </span>
                  )}
                </h3>
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Select all
                </button>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Search..."
                    className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                  />
                </div>
                <select
                  className="px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option value="">All Depts</option>
                  {MOCK_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              {errors.employeeIds && (
                <p className="mt-1 text-xs text-red-500">{errors.employeeIds}</p>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEmployees.map((emp) => (
                <label
                  key={emp.id}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedEmployees.includes(emp.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                    checked={selectedEmployees.includes(emp.id)}
                    onChange={() => toggleEmployee(emp.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {emp.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {emp.role} · {emp.department}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </form>
      )}

      {/* Recent assignments */}
      {assignments.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Recent Assignments
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {assignments.slice(0, 5).map((a) => (
              <div key={a.id} className="px-5 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {a.moduleTitle}
                  </p>
                  <p className="text-xs text-slate-500">
                    {a.employeeName} · Due {new Date(a.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    a.isOverdue
                      ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                      : a.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {a.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
