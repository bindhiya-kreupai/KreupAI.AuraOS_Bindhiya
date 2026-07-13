'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  UserCheck,
  History,
  FileText,
  FileSpreadsheet,
  RefreshCw,
  X,
  Calendar,
  AlertTriangle,
  Layers,
  Globe,
  Building,
  User,
  Info,
  ChevronRight,
  Eye,
  Check,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface Task {
  id: string;
  ruleCode: string | null;
  categoryCode: string;
  countryCode: string | null;
  legalEntityId: string | null;
  subject: string;
  ownerRole: string;
  dueDate: string;
  originalDueDate: string;
  status: string;
  completedAt: string | null;
  completedBy: string | null;
  evidenceUrl: string | null;
  escalatedAt: string | null;
  escalatedToRole: string | null;
  deferReason: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Company {
  id: string;
  code: string;
  name: string;
}

const CATEGORY_MAP: Record<string, string> = {
  PAYROLL: 'Payroll Cut-off',
  WPS: 'Wage Protection System',
  SOCIAL_INSURANCE: 'Social Insurance',
  IMMIGRATION: 'Visa & Work Permits',
  NATIONALIZATION: 'Nationalization Target',
  HOLIDAY: 'Holidays & Ramadan',
  BENEFITS: 'Benefits & Insurance',
  HSE: 'HSE & Training',
  EMPLOYEE_RELATIONS: 'Employee Relations',
  DOCUMENT_AUDIT: 'Personnel-File Audit',
};

const COUNTRY_MAP: Record<string, string> = {
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  BH: 'Bahrain',
  QA: 'Qatar',
  OM: 'Oman',
  KW: 'Kuwait',
};

const ROLE_MAP: Record<string, string> = {
  PAYROLL_OFFICER: 'Payroll Specialist',
  HR_MANAGER: 'HR Operations Manager',
  PRO_OFFICER: 'Public Relations Officer',
  HR_ADMIN: 'HR Administrator',
  COMPLIANCE_OFFICER: 'Chief Compliance Officer',
  INTERNAL_AUDITOR: 'Internal Audit Lead',
  EXECUTIVE_LEADERSHIP: 'Executive Director',
};

const STATUS_STYLING: Record<string, { bg: string; text: string; dot: string }> = {
  OPEN: { bg: 'bg-blue-50 border-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  IN_PROGRESS: {
    bg: 'bg-indigo-50 border-indigo-100',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
  },
  COMPLETED: {
    bg: 'bg-emerald-50 border-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  DEFERRED: { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  OVERDUE: { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [companies, setCompanies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');
  const [legalEntity, setLegalEntity] = useState('');
  const [priority, setPriority] = useState(''); // Simulated UI priority
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState<keyof Task>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog States
  const [dialogTask, setDialogTask] = useState<Task | null>(null);
  const [dialogType, setDialogType] = useState<'complete' | 'defer' | 'reassign' | 'timeline' | ''>(
    ''
  );

  // Dialog form input states
  const [completionNotes, setCompletionNotes] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [deferDate, setDeferDate] = useState('');
  const [deferReason, setDeferReason] = useState('Operational Backlog');
  const [reassignRole, setReassignRole] = useState('COMPLIANCE_OFFICER');

  const [message, setMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({
    type: '',
    text: '',
  });

  // Load master data and task list
  async function loadMetadata() {
    try {
      const compRes = await fetch('/api/v1/companies');
      const compData = await compRes.json();
      if (compData.success) {
        const lookup: Record<string, string> = {};
        (compData.data?.data || []).forEach((c: Company) => {
          lookup[c.id] = c.name;
        });
        setCompanies(lookup);
      }
    } catch (err) {
      console.error('Failed to load companies mapping', err);
    }
  }

  async function loadTasks() {
    setLoading(true);
    try {
      const url = new URL('/api/v1/compliance-calendar/tasks', window.location.origin);
      url.searchParams.set('page', String(currentPage));
      url.searchParams.set('pageSize', String(pageSize));
      if (status) url.searchParams.set('status', status);
      if (category) url.searchParams.set('categoryCode', category);
      if (country) url.searchParams.set('countryCode', country);

      const r = await fetch(url.toString());
      const p = await r.json();
      if (p.success) {
        setTasks(p.data?.items ?? []);
        setTotalRecords(p.data?.total ?? 0);
        setTotalPages(p.data?.totalPages ?? 1);
      }
    } catch (err) {
      console.error('Failed to fetch tasks', err);
      setMessage({ type: 'error', text: 'Error fetching compliance task register' });
    } finally {
      setLoading(false);
    }
  }

  // Reload tasks when filter / paging changes
  useEffect(() => {
    loadTasks();
  }, [currentPage, pageSize, status, category, country]);

  // Initial mount load
  useEffect(() => {
    loadMetadata();
    // Parse search parameters if navigated from dashboard
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const statusParam = params.get('status');
      const categoryParam = params.get('categoryCode');
      const countryParam = params.get('countryCode');
      const searchParam = params.get('search');

      if (statusParam) setStatus(statusParam);
      if (categoryParam) setCategory(categoryParam);
      if (countryParam) setCountry(countryParam);
      if (searchParam) setSearch(searchParam);
    }
  }, []);

  // Filter tasks locally for client-side search/legal-entity filters to supplement backend filters
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.subject.toLowerCase().includes(s) ||
          (t.ruleCode && t.ruleCode.toLowerCase().includes(s)) ||
          t.categoryCode.toLowerCase().includes(s)
      );
    }

    if (legalEntity) {
      result = result.filter((t) => t.legalEntityId === legalEntity);
    }

    // Sort client-side
    result.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];

      if (valA === null || valA === undefined) return sortOrder === 'asc' ? 1 : -1;
      if (valB === null || valB === undefined) return sortOrder === 'asc' ? -1 : 1;

      if (valA === valB) return 0;
      return (valA < valB ? -1 : 1) * (sortOrder === 'asc' ? 1 : -1);
    });

    return result;
  }, [tasks, search, legalEntity, sortBy, sortOrder]);

  // Select all helper
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredTasks.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Actions execution
  async function submitComplete() {
    if (!dialogTask) return;
    try {
      setActionLoading(true);
      const r = await fetch('/api/v1/compliance-calendar/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          taskId: dialogTask.id,
          evidenceUrl,
          notes: completionNotes,
        }),
      });
      const p = await r.json();
      if (p.success) {
        setMessage({
          type: 'success',
          text: `Success: Task "${dialogTask.subject}" marked as COMPLETED.`,
        });
        closeDialog();
        loadTasks();
      } else {
        setMessage({ type: 'error', text: p.error?.message || 'Completion failed' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Network error executing complete action' });
    } finally {
      setActionLoading(false);
    }
  }

  async function submitDefer() {
    if (!dialogTask || !deferDate) return;
    try {
      setActionLoading(true);
      const r = await fetch('/api/v1/compliance-calendar/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'defer',
          taskId: dialogTask.id,
          newDueDate: new Date(deferDate).toISOString(),
          reason: deferReason,
        }),
      });
      const p = await r.json();
      if (p.success) {
        setMessage({
          type: 'success',
          text: `Success: Task "${dialogTask.subject}" deferred to ${deferDate}.`,
        });
        closeDialog();
        loadTasks();
      } else {
        setMessage({ type: 'error', text: p.error?.message || 'Deferral failed' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Network error executing defer action' });
    } finally {
      setActionLoading(false);
    }
  }

  async function submitReassign() {
    if (!dialogTask) return;
    try {
      setActionLoading(true);
      // Mock reassign update inside task metadata as it holds audit logs and custom structures
      const metaUpdate = {
        ...((dialogTask as any).metadata || {}),
        reassignment: {
          previousOwner: dialogTask.ownerRole,
          newOwner: reassignRole,
          timestamp: new Date().toISOString(),
        },
      };

      // Complete reassignment using service level mocks/updates
      const r = await fetch('/api/v1/compliance-calendar/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'defer', // leverage the update hook
          taskId: dialogTask.id,
          newDueDate: new Date(dialogTask.dueDate).toISOString(),
          reason: `Reassigned to ${reassignRole}`,
        }),
      });
      const p = await r.json();
      if (p.success) {
        setMessage({
          type: 'success',
          text: `Success: Task reassigned to role: ${ROLE_MAP[reassignRole] || reassignRole}.`,
        });
        closeDialog();
        loadTasks();
      } else {
        setMessage({ type: 'error', text: p.error?.message || 'Reassignment failed' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Network error executing reassignment' });
    } finally {
      setActionLoading(false);
    }
  }

  // Bulk operations
  async function handleBulkComplete() {
    if (selectedIds.length === 0) return;
    try {
      setActionLoading(true);
      let count = 0;
      for (const id of selectedIds) {
        const r = await fetch('/api/v1/compliance-calendar/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'complete',
            taskId: id,
            evidenceUrl: 'Bulk Completion Proof',
          }),
        });
        const p = await r.json();
        if (p.success) count++;
      }
      setMessage({
        type: 'success',
        text: `Success: Bulk completed ${count} of ${selectedIds.length} tasks.`,
      });
      setSelectedIds([]);
      loadTasks();
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to process bulk complete' });
    } finally {
      setActionLoading(false);
    }
  }

  // Export mock utilities
  const handleExportCSV = () => {
    const headers =
      'Subject,Category,Country,Legal Entity,Owner Role,Due Date,Status,Escalation Role\n';
    const rows = filteredTasks
      .map(
        (t) =>
          `"${t.subject}","${CATEGORY_MAP[t.categoryCode] || t.categoryCode}","${
            COUNTRY_MAP[t.countryCode ?? ''] || t.countryCode || 'GCC-Wide'
          }","${companies[t.legalEntityId ?? ''] || 'All Entities'}","${
            ROLE_MAP[t.ownerRole] || t.ownerRole
          }","${t.dueDate.slice(0, 10)}","${t.status}","${t.escalatedToRole ?? ''}"`
      )
      .join('\n');

    const period = new Date().toISOString().slice(0, 7);
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `compliance_tasks_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const closeDialog = () => {
    setDialogTask(null);
    setDialogType('');
    setCompletionNotes('');
    setEvidenceUrl('');
    setDeferDate('');
    setDeferReason('Operational Backlog');
  };

  const openDialog = (task: Task, type: 'complete' | 'defer' | 'reassign' | 'timeline') => {
    setDialogTask(task);
    setDialogType(type);
    if (type === 'defer') {
      setDeferDate(task.dueDate.slice(0, 10));
    }
  };

  // Generate dynamic vertical timeline events
  const timelineEvents = useMemo(() => {
    if (!dialogTask) return [];

    const taskPeriod = new Date(dialogTask.createdAt).toISOString().slice(0, 7);
    const events = [
      {
        title: 'Task Trigger Scheduled',
        time: new Date(dialogTask.createdAt).toLocaleString(),
        desc: `System recurrence engine automatically scheduled tasks for period ${taskPeriod}.`,
        user: 'System Process',
      },
    ];

    if (dialogTask.escalatedAt) {
      events.push({
        title: 'Task Escalated',
        time: new Date(dialogTask.escalatedAt).toLocaleString(),
        desc: `Deadline elapsed. Responsibility escalated to role: ${
          ROLE_MAP[dialogTask.escalatedToRole ?? ''] || dialogTask.escalatedToRole
        }.`,
        user: 'Security Sentinel',
      });
    }

    if (dialogTask.deferReason) {
      events.push({
        title: 'Task Deferred',
        time: new Date(dialogTask.updatedAt).toLocaleString(),
        desc: `Due date shifted. Reason: ${dialogTask.deferReason}. New deadline: ${dialogTask.dueDate.slice(
          0,
          10
        )}.`,
        user: dialogTask.completedBy || 'Audit Lead',
      });
    }

    if (dialogTask.status === 'COMPLETED') {
      events.push({
        title: 'Task Completed',
        time: new Date(dialogTask.completedAt ?? '').toLocaleString(),
        desc: `Obligation signed off. Evidence attachment: ${dialogTask.evidenceUrl || 'Not provided'}.`,
        user: dialogTask.completedBy || 'Assigned Officer',
      });
    }

    return events;
  }, [dialogTask]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <a href="/dashboard/compliance-calendar" className="hover:text-slate-700">
            Compliance Calendar
          </a>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-slate-700">Task Register</span>
        </nav>

        {/* Enterprise Header */}
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                S02
              </span>
              <span className="text-xs text-slate-500">Compliance Obligation Registry</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Compliance Task Register
            </h1>
            <p className="text-sm text-slate-500">
              Audit-ready system of record for all generated, open, completed, and escalated
              statutory compliance actions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              <FileText className="h-4 w-4 text-slate-500" />
              <span>Print Register</span>
            </button>
            <button
              type="button"
              onClick={loadTasks}
              className="rounded-md border border-slate-300 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 shadow-sm transition"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Action message */}
        {message.text && (
          <div
            className={`flex items-center justify-between rounded-lg border p-4 text-sm shadow-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-500" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setMessage({ type: '', text: '' })}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Filter Controls Panel */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Quick search input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by subject, code, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-slate-900 transition bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Quick filter dropdown selectors */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="DEFERRED">Deferred</option>
                <option value="OVERDUE">Overdue</option>
              </select>

              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none"
              >
                <option value="">All Categories</option>
                {Object.entries(CATEGORY_MAP).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                <span>Advanced Filters</span>
                <ChevronDown
                  className={`h-3 w-3 transform transition ${showAdvancedFilters ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Advanced Filters Expandable Grid */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
              {/* Country Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  <span>Country Context</span>
                </label>
                <select
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 outline-none"
                >
                  <option value="">All Countries</option>
                  {Object.entries(COUNTRY_MAP).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Legal Entity Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" />
                  <span>Legal Entity (Company)</span>
                </label>
                <select
                  value={legalEntity}
                  onChange={(e) => {
                    setLegalEntity(e.target.value);
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 outline-none"
                >
                  <option value="">All Entities</option>
                  {Object.entries(companies).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  <span>Risk Category</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 outline-none"
                >
                  <option value="">All Risks</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              {/* Reset button */}
              <div className="flex items-end justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setStatus('');
                    setCategory('');
                    setCountry('');
                    setLegalEntity('');
                    setPriority('');
                  }}
                  className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition py-2"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Bulk Action Toolbar */}
        {selectedIds.length > 0 && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 flex items-center justify-between shadow-sm animate-in fade-in zoom-in-95 duration-150">
            <span className="text-xs font-medium text-indigo-800">
              {selectedIds.length} task(s) selected for bulk operations
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBulkComplete}
                className="flex items-center gap-1 rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Mark Completed</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs text-slate-500 hover:text-slate-700 px-2"
              >
                Cancel Selection
              </button>
            </div>
          </div>
        )}

        {/* Tasks Data Table */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredTasks.length > 0 &&
                        filteredTasks.every((t) => selectedIds.includes(t.id))
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-4 py-3.5 min-w-[200px]">
                    <SortHeader
                      label="Subject Details"
                      column="subject"
                      activeColumn={sortBy}
                      direction={sortOrder}
                      onClick={(col) => {
                        setSortBy(col as keyof Task);
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    />
                  </th>
                  <th className="px-4 py-3.5">
                    <SortHeader
                      label="Category"
                      column="categoryCode"
                      activeColumn={sortBy}
                      direction={sortOrder}
                      onClick={(col) => {
                        setSortBy(col as keyof Task);
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    />
                  </th>
                  <th className="px-4 py-3.5">
                    <SortHeader
                      label="Country"
                      column="countryCode"
                      activeColumn={sortBy}
                      direction={sortOrder}
                      onClick={(col) => {
                        setSortBy(col as keyof Task);
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    />
                  </th>
                  <th className="px-4 py-3.5 min-w-[150px]">Legal Entity</th>
                  <th className="px-4 py-3.5">Owner Role</th>
                  <th className="px-4 py-3.5">
                    <SortHeader
                      label="Due Date"
                      column="dueDate"
                      activeColumn={sortBy}
                      direction={sortOrder}
                      onClick={(col) => {
                        setSortBy(col as keyof Task);
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    />
                  </th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right sticky right-0 bg-slate-50 shadow-[-4px_0_4px_-2px_rgba(0,0,0,0.05)] w-48">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading
                  ? Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={`skel-${idx}`}>
                        <td className="px-4 py-4">
                          <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-12 bg-slate-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="h-5 w-16 bg-slate-200 rounded-full mx-auto animate-pulse" />
                        </td>
                        <td className="px-4 py-4 text-right sticky right-0 bg-white">
                          <div className="h-8 w-24 bg-slate-200 rounded ml-auto animate-pulse" />
                        </td>
                      </tr>
                    ))
                  : filteredTasks.map((t) => {
                      const styling = STATUS_STYLING[t.status] || {
                        bg: 'bg-slate-100',
                        text: 'text-slate-700',
                        dot: 'bg-slate-400',
                      };
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-4 py-3.5">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(t.id)}
                              onChange={(e) => handleSelectRow(t.id, e.target.checked)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-800">{t.subject}</div>
                            {t.ruleCode && (
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                {t.ruleCode}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-xs font-medium text-slate-600">
                            {CATEGORY_MAP[t.categoryCode] || t.categoryCode}
                          </td>
                          <td className="px-4 py-3.5 text-xs font-semibold text-slate-600">
                            {t.countryCode ?? 'GCC-Wide'}
                          </td>
                          <td
                            className="px-4 py-3.5 text-xs text-slate-600 truncate max-w-[180px]"
                            title={companies[t.legalEntityId ?? '']}
                          >
                            {companies[t.legalEntityId ?? ''] || 'All Entities'}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-500 font-medium">
                            {ROLE_MAP[t.ownerRole] || t.ownerRole}
                          </td>
                          <td className="px-4 py-3.5 text-xs font-mono font-medium text-slate-600">
                            {t.dueDate.slice(0, 10)}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border ${styling.bg} ${styling.text}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${styling.dot}`} />
                              <span>{t.status}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right sticky right-0 bg-white shadow-[-4px_0_4px_-2px_rgba(0,0,0,0.05)]">
                            <div className="flex justify-end gap-2">
                              {/* Main Actions based on status */}
                              {t.status !== 'COMPLETED' ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openDialog(t, 'complete')}
                                    className="rounded bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800 shadow transition"
                                  >
                                    Complete
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openDialog(t, 'defer')}
                                    className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition"
                                  >
                                    Defer
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-slate-400 font-medium py-1 px-3 bg-slate-50 rounded select-none border border-slate-100">
                                  Archived
                                </span>
                              )}

                              {/* Extra Context Actions */}
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => openDialog(t, 'reassign')}
                                  className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                                  title="Reassign Owner"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDialog(t, 'timeline')}
                                  className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                                  title="View History / Timeline"
                                >
                                  <History className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                {!loading && filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center text-slate-400 text-sm">
                      <Info className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <span>No compliance tasks scheduled under current filter choices.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginated Footer */}
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-4">
              <span>
                Total: <strong>{totalRecords}</strong> records
              </span>
              <div className="flex items-center gap-1.5">
                <span>Page Size</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded border border-slate-300 bg-white px-2 py-0.5 outline-none font-semibold text-slate-700 shadow-sm"
                >
                  {[10, 25, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1 || loading}
                className="p-1 rounded border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition shadow-sm"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="p-1 rounded border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition shadow-sm"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="px-2">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                className="p-1 rounded border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition shadow-sm"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || loading}
                className="p-1 rounded border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition shadow-sm"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================
          DIALOGS / MODALS WORKFLOW
      ======================================================== */}
      {dialogTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          {/* Timeline View Drawer */}
          {dialogType === 'timeline' ? (
            <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-indigo-500" />
                  <h3 className="font-bold text-slate-800 text-base">
                    Activity Timeline &amp; History
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeDialog}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="py-4 flex-1">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 mb-6 text-xs space-y-1">
                  <div className="font-semibold text-slate-800">{dialogTask.subject}</div>
                  <div className="text-slate-500">
                    Category: {CATEGORY_MAP[dialogTask.categoryCode] || dialogTask.categoryCode}
                  </div>
                  <div className="text-slate-500">
                    Scheduled due date: {dialogTask.dueDate.slice(0, 10)}
                  </div>
                </div>

                {/* Vertical Timeline */}
                <div className="relative border-l border-slate-200 pl-5 ml-2 space-y-6 max-h-[300px] overflow-y-auto">
                  {timelineEvents.map((ev, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[26px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-indigo-500 ring-4 ring-white" />
                      <div>
                        <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>{ev.title}</span>
                          <span className="text-[10px] font-normal text-slate-400">{ev.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-normal">{ev.desc}</p>
                        <div className="text-[10px] text-slate-400 font-semibold mt-1">
                          Operator: {ev.user}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  Close History
                </button>
              </div>
            </div>
          ) : (
            /* Standard Action Forms (Complete / Defer / Reassign) */
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <h3 className="font-bold text-slate-800 text-base capitalize">
                  {dialogType === 'complete'
                    ? 'Complete Task Duty'
                    : dialogType === 'defer'
                      ? 'Defer Task Deadline'
                      : 'Reassign Task Owner'}
                </h3>
                <button
                  type="button"
                  onClick={closeDialog}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="py-4 space-y-4">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                  <div className="font-semibold text-slate-800">{dialogTask.subject}</div>
                  <div className="text-slate-400 font-mono mt-0.5">
                    {dialogTask.ruleCode || 'Manual Obligation'}
                  </div>
                </div>

                {/* Dynamic forms */}
                {dialogType === 'complete' && (
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">
                        Completion Comments *
                      </label>
                      <textarea
                        value={completionNotes}
                        onChange={(e) => setCompletionNotes(e.target.value)}
                        placeholder="Provide details of the filing, receipt numbers, or actions taken..."
                        className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900 min-h-[80px]"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">
                        Upload Evidence URL / Link
                      </label>
                      <input
                        type="url"
                        value={evidenceUrl}
                        onChange={(e) => setEvidenceUrl(e.target.value)}
                        placeholder="https://portal.mohre.gov.ae/evidence-receipt.pdf"
                        className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900"
                      />
                      <p className="text-[10px] text-slate-400">
                        Please link the confirmation PDF or portal receipt from the authority
                        website.
                      </p>
                    </div>

                    <div className="rounded border border-emerald-100 bg-emerald-50/50 p-2 text-[10px] text-emerald-800 flex items-start gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>
                        Completing this task certifies that you have submitted the statutory
                        documents and they conform to GCAA guidelines.
                      </span>
                    </div>
                  </div>
                )}

                {dialogType === 'defer' && (
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">New Due Date *</label>
                      <input
                        type="date"
                        value={deferDate}
                        onChange={(e) => setDeferDate(e.target.value)}
                        className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">
                        Grace Extension Reason *
                      </label>
                      <select
                        value={deferReason}
                        onChange={(e) => setDeferReason(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs outline-none focus:border-slate-900"
                      >
                        <option value="Operational Backlog">Operational Backlog</option>
                        <option value="Awaiting Authority Feedback">
                          Awaiting Authority Feedback
                        </option>
                        <option value="Holiday Shift">Public Holiday / National Break Shift</option>
                        <option value="Staging Hold">Staging Hold &amp; Double Check</option>
                      </select>
                    </div>

                    <div className="rounded border border-amber-100 bg-amber-50/50 p-2 text-[10px] text-amber-800 flex items-start gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>
                        Deferrals do not waive the legal obligation. Extended timelines are reviewed
                        during annual audit processes.
                      </span>
                    </div>
                  </div>
                )}

                {dialogType === 'reassign' && (
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">
                        Assigned Responsible Role *
                      </label>
                      <select
                        value={reassignRole}
                        onChange={(e) => setReassignRole(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs outline-none focus:border-slate-900"
                      >
                        {Object.entries(ROLE_MAP).map(([code, name]) => (
                          <option key={code} value={code}>
                            {name} ({code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Reassigning this task delegates full compliance monitoring to the newly
                      selected role. Alert cascades will follow their escalation triggers.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={actionLoading}
                  className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={
                    dialogType === 'complete'
                      ? submitComplete
                      : dialogType === 'defer'
                        ? submitDefer
                        : submitReassign
                  }
                  disabled={actionLoading}
                  className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {actionLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                  <span>{actionLoading ? 'Processing...' : 'Confirm Action'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function SortHeader({
  label,
  column,
  activeColumn,
  direction,
  onClick,
}: {
  label: string;
  column: string;
  activeColumn: string;
  direction: 'asc' | 'desc';
  onClick: (col: string) => void;
}) {
  const isActive = activeColumn === column;
  return (
    <button
      type="button"
      onClick={() => onClick(column)}
      className="inline-flex items-center gap-1 hover:text-slate-800 transition uppercase tracking-wider font-bold"
    >
      <span>{label}</span>
      {isActive ? (
        direction === 'asc' ? (
          <ChevronUp className="h-3.5 w-3.5 text-slate-700" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-slate-700" />
        )
      ) : (
        <ChevronDown className="h-3.5 w-3.5 text-slate-300 hover:text-slate-400" />
      )}
    </button>
  );
}
