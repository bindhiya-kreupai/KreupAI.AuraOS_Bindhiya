'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  Eye,
  Trash2,
  Archive,
  RotateCcw,
  AlertOctagon,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  Shield,
  Activity,
  Play,
  Pause,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import {
  EntityTable,
  FilterToolbar,
  BulkToolbar,
  DetailsModal,
  ConfirmDialog,
  ExportButton,
  FormModal,
  type Column,
  type FilterField,
} from '../components';

interface Cov {
  id: string;
  employeeId: string;
  benefitCatalogueId: string;
  vendorId: string | null;
  policyNumber: string | null;
  startedAt: string;
  expiresAt: string | null;
  actualAnnualValue: string | null;
  currency: string;
  dependantsCount: number;
  status: string;
  accruedBalance: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  // Enriched fields
  employeeName?: string;
  employeeCode?: string;
  benefitLabel?: string;
  benefitCode?: string;
  vendorName?: string;
}

interface EmployeeSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  email?: string;
  joiningDate?: string;
  department?: { id: string; name: string; code: string } | null;
  location?: { id: string; name: string } | null;
  status?: { id: string; code: string; name: string } | null;
}

interface EligibilityVerdict {
  benefitCode: string;
  label: string;
  benefitType: string;
  eligible: boolean;
  isMandatory: boolean;
  reason?: string;
}

const getDefaultRenewalDate = (row: Cov) => {
  if (row.expiresAt) {
    const d = new Date(row.expiresAt);
    if (!isNaN(d.getTime())) {
      d.setFullYear(d.getFullYear() + 1);
      return d.toISOString().slice(0, 10);
    }
  }
  const today = new Date();
  today.setFullYear(today.getFullYear() + 1);
  return today.toISOString().slice(0, 10);
};

export default function EnrollmentsPage() {
  const [mounted, setMounted] = React.useState(false);
  const [rows, setRows] = React.useState<Cov[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);

  // Table & Filters
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [filters, setFilters] = React.useState<Record<string, string>>({
    status: 'ACTIVE',
    vendorId: '',
    expiringSoon: '',
  });
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Catalogue options for dropdown
  const [catalogueOptions, setCatalogueOptions] = React.useState<
    Array<{ value: string; label: string }>
  >([]);

  // Vendor search
  const [vendorOptions, setVendorOptions] = React.useState<Array<{ value: string; label: string }>>(
    []
  );
  const vendorResultsRef = React.useRef<Map<string, { id: string; name: string }>>(new Map());
  const [vendorLoading, setVendorLoading] = React.useState(false);
  const [viewItem, setViewItem] = React.useState<Cov | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<Cov | null>(null);

  // Form values
  const [formValues, setFormValues] = React.useState({
    employeeId: '',
    employeeName: '',
    employeeCode: '',
    department: '',
    designation: '',
    jobLevel: '',
    company: '',
    legalEntityId: '',
    joiningDate: '',
    employmentStatus: '',
    workLocation: '',
    manager: '',
    nationality: '',

    // Enrollment inputs
    benefitCode: '',
    vendorId: '',
    policyNumber: '',
    startedAt: new Date().toISOString().slice(0, 10),
    expiresAt: '',
    actualAnnualValue: '',
    currency: 'AED',
    dependantsCount: 0,
  });

  // Action Dialogs
  const [renewTarget, setRenewTarget] = React.useState<Cov | null>(null);
  const [renewDate, setRenewDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [terminateTarget, setTerminateTarget] = React.useState<Cov | null>(null);
  const [terminateDate, setTerminateDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [suspendTarget, setSuspendTarget] = React.useState<Cov | null>(null);
  const [resumeTarget, setResumeTarget] = React.useState<Cov | null>(null);
  const [accrueTarget, setAccrueTarget] = React.useState<Cov | null>(null);

  // Employee Dropdown
  const [empOptions, setEmpOptions] = React.useState<Array<{ value: string; label: string }>>([]);
  const empResultsRef = React.useRef<Map<string, EmployeeSearchResult>>(new Map());
  const [empLoading, setEmpLoading] = React.useState(false);
  const [hrLoading, setHrLoading] = React.useState(false);

  // Eligibility Verdicts
  const [verdicts, setVerdicts] = React.useState<EligibilityVerdict[]>([]);
  const [verdictsLoading, setVerdictsLoading] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      params.set('showDeleted', String(showDeleted));
      if (search) params.set('search', search);
      if (filters.status) params.set('status', filters.status);
      if (filters.vendorId) params.set('vendorId', filters.vendorId);
      if (filters.expiringSoon === 'true') params.set('expiringSoon', 'true');

      const res = await fetch(`/api/v1/benefits-compliance/enrollments?${params}`);
      const payload = await res.json();
      if (payload.success) {
        setRows(payload.data.items ?? []);
        setTotal(payload.data.total ?? 0);
      } else {
        toast.error('Failed to load enrollments');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading enrollments');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filters, showDeleted]);

  const loadCatalogue = async () => {
    try {
      const r = await fetch('/api/v1/benefits-compliance/catalogue');
      const p = await r.json();
      if (p.success && p.data) {
        setCatalogueOptions(
          p.data.map((c: any) => ({ value: c.benefitCode, label: `${c.label} (${c.benefitCode})` }))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    setMounted(true);
    loadCatalogue();
  }, []);

  const handleSearchVendors = React.useCallback(async (query: string) => {
    setVendorLoading(true);
    try {
      const params = new URLSearchParams({ pageSize: '30' });
      if (query) params.set('search', query);
      const res = await fetch(`/api/v1/benefits-compliance/vendors?${params}`);
      const payload = await res.json();
      const results: Array<{ id: string; name: string }> =
        payload.data?.items ?? payload.data ?? [];
      results.forEach((r) => vendorResultsRef.current.set(r.id, r));
      setVendorOptions(results.map((r) => ({ value: r.id, label: r.name })));
    } catch (e) {
      console.error(e);
    } finally {
      setVendorLoading(false);
    }
  }, []);

  const handleSearchEmployees = React.useCallback(async (query: string) => {
    setEmpLoading(true);
    try {
      const res = await fetch(`/api/employees/search?q=${encodeURIComponent(query)}&size=20`);
      const payload = await res.json();
      const results: EmployeeSearchResult[] = payload.data?.employees ?? payload.employees ?? [];
      results.forEach((r) => empResultsRef.current.set(r.id, r));
      setEmpOptions(
        results.map((r) => ({
          value: r.id,
          label: `${r.firstName} ${r.lastName} (${r.employeeCode})`,
        }))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setEmpLoading(false);
    }
  }, []);

  const handleSelectEmployee = React.useCallback(async (emp: EmployeeSearchResult) => {
    const autoDate = emp.joiningDate
      ? new Date(emp.joiningDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    setFormValues((f) => ({
      ...f,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeCode: emp.employeeCode,
      department: emp.department?.name ?? '',
      joiningDate: autoDate,
      employmentStatus: emp.status?.name ?? '',
      // Resets
      designation: '',
      jobLevel: '',
      company: '',
      legalEntityId: '',
      workLocation: '',
      manager: '',
      nationality: '',
    }));

    // Load full HR metadata
    setHrLoading(true);
    try {
      const detailRes = await fetch(`/api/v1/employees/${emp.id}`);
      const detailPayload = await detailRes.json();
      if (detailPayload.success && detailPayload.data) {
        const d = detailPayload.data;
        setFormValues((f) => ({
          ...f,
          designation: d.jobProfile?.name ?? d.jobProfile?.title ?? '',
          jobLevel: d.grade?.name ?? '',
          company: d.company?.name ?? '',
          legalEntityId: d.company?.id ?? '',
          employmentStatus: d.status?.name ?? f.employmentStatus,
          joiningDate: d.joiningDate
            ? new Date(d.joiningDate).toISOString().slice(0, 10)
            : f.joiningDate,
          workLocation: d.location?.name ?? '',
          manager: d.manager ? `${d.manager.firstName} ${d.manager.lastName}` : '',
        }));

        // Evaluate eligibility for this employee
        setVerdictsLoading(true);
        try {
          const elRes = await fetch('/api/v1/benefits-compliance/eligibility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'evaluateAll',
              context: {
                employee: { ...d, employeeComplianceDetails: d.employeeComplianceDetails },
              },
            }),
          });
          const elPayload = await elRes.json();
          if (elPayload.success && elPayload.data?.verdicts) {
            setVerdicts(elPayload.data.verdicts);
          }
        } catch (err) {
          console.error('Eligibility evaluation failed:', err);
        } finally {
          setVerdictsLoading(false);
        }
      }
    } catch {
      // HR detail fetch failed
    } finally {
      setHrLoading(false);
    }
  }, []);

  const handleEmployeeSelectById = React.useCallback(
    (id: string) => {
      const emp = empResultsRef.current.get(id);
      if (emp) handleSelectEmployee(emp);
      else {
        setFormValues((f) => ({ ...f, employeeId: id }));
        handleSelectEmployee({ id, firstName: '', lastName: '', employeeCode: '' });
      }
    },
    [handleSelectEmployee]
  );

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.employeeId) {
      toast.error('Please select an employee');
      return;
    }
    if (!formValues.benefitCode) {
      toast.error('Please select a benefit program from the eligibility cards above');
      return;
    }
    const payload = {
      action: 'enroll',
      employeeId: formValues.employeeId,
      benefitCode: formValues.benefitCode,
      vendorId: formValues.vendorId || undefined,
      policyNumber: formValues.policyNumber || undefined,
      startedAt: formValues.startedAt,
      expiresAt: formValues.expiresAt || undefined,
      actualAnnualValue: formValues.actualAnnualValue
        ? Number(formValues.actualAnnualValue)
        : undefined,
      dependantsCount: Number(formValues.dependantsCount),
    };

    try {
      const res = await fetch('/api/v1/benefits-compliance/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          editingItem ? 'Enrollment modified successfully' : 'Employee enrolled successfully'
        );
        setFormOpen(false);
        loadData();
      } else {
        toast.error(data.error?.message ?? 'Failed to enroll');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error during enrollment');
    }
  };

  const handleRenew = async () => {
    if (!renewTarget) return;
    try {
      const r = await fetch('/api/v1/benefits-compliance/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'renew', id: renewTarget.id, expiresAt: renewDate }),
      });
      const p = await r.json();
      if (p.success) {
        toast.success('Policy renewed successfully');
        loadData();
      } else {
        toast.error(p.error?.message ?? 'Failed to renew');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setRenewTarget(null);
    }
  };

  const handleTerminate = async () => {
    if (!terminateTarget) return;
    try {
      const r = await fetch('/api/v1/benefits-compliance/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'terminate',
          id: terminateTarget.id,
          endsAt: terminateDate,
        }),
      });
      const p = await r.json();
      if (p.success) {
        toast.success('Enrollment terminated successfully');
        loadData();
      } else {
        toast.error(p.error?.message ?? 'Failed to terminate');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setTerminateTarget(null);
    }
  };

  const handleSuspend = async () => {
    if (!suspendTarget) return;
    try {
      const r = await fetch('/api/v1/benefits-compliance/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suspend', id: suspendTarget.id }),
      });
      const p = await r.json();
      if (p.success) {
        toast.success('Enrollment suspended');
        loadData();
      } else {
        toast.error(p.error?.message ?? 'Failed to suspend');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSuspendTarget(null);
    }
  };

  const handleResume = async () => {
    if (!resumeTarget) return;
    try {
      const r = await fetch('/api/v1/benefits-compliance/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resume', id: resumeTarget.id }),
      });
      const p = await r.json();
      if (p.success) {
        toast.success('Enrollment resumed active');
        loadData();
      } else {
        toast.error(p.error?.message ?? 'Failed to resume');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setResumeTarget(null);
    }
  };

  const handleAccrue = async () => {
    if (!accrueTarget) return;
    try {
      const r = await fetch('/api/v1/benefits-compliance/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accrue', id: accrueTarget.id }),
      });
      const p = await r.json();
      if (p.success) {
        toast.success(`Accrual balance calculated and updated successfully`);
        loadData();
      } else {
        toast.error(p.error?.message ?? 'Failed to process accrual');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setAccrueTarget(null);
    }
  };

  const selectedRows = rows.filter((r) => selectedIds.includes(r.id));

  const columns: Array<Column<Cov>> = [
    { key: 'employeeName', label: 'Employee', sortable: true },
    { key: 'benefitLabel', label: 'Benefit Program', sortable: true },
    {
      key: 'vendorName',
      label: 'Vendor',
      render: (row) => <span className="text-xs text-slate-600">{row.vendorName ?? '—'}</span>,
    },
    {
      key: 'policyNumber',
      label: 'Policy #',
      render: (row) => <span className="font-mono text-xs">{row.policyNumber ?? '—'}</span>,
    },
    {
      key: 'dependantsCount',
      label: 'Dependents',
      render: (row) => <span className="text-xs text-slate-600">{row.dependantsCount}</span>,
    },
    { key: 'startedAt', label: 'Start Date', render: (row) => row.startedAt.slice(0, 10) },
    {
      key: 'expiresAt',
      label: 'Renewal Due',
      sortable: true,
      render: (row) => {
        if (!row.expiresAt) return <span className="text-slate-400 text-xs">—</span>;
        const daysLeft = Math.ceil((new Date(row.expiresAt).getTime() - Date.now()) / 86400000);
        if (daysLeft <= 0)
          return <span className="text-xs font-semibold text-rose-600">Expired</span>;
        if (daysLeft <= 30)
          return <span className="text-xs font-semibold text-rose-500">{daysLeft}d</span>;
        if (daysLeft <= 60)
          return <span className="text-xs font-semibold text-amber-600">{daysLeft}d</span>;
        return <span className="text-xs text-slate-500">{row.expiresAt.slice(0, 10)}</span>;
      },
    },
    {
      key: 'actualAnnualValue',
      label: 'Annual Value',
      render: (row) =>
        `${Number(row.actualAnnualValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${row.currency}`,
    },
    {
      key: 'accruedBalance',
      label: 'Accrual Balance',
      render: (row) =>
        `${Number(row.accruedBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${row.currency}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const cls =
          row.status === 'ACTIVE'
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700 font-semibold'
            : row.status === 'SUSPENDED'
              ? 'bg-amber-50 border-amber-100 text-amber-700 font-semibold'
              : 'bg-slate-50 border-slate-100 text-slate-500';
        return (
          <span className={`rounded-full border px-2 py-0.5 text-xs ${cls}`}>{row.status}</span>
        );
      },
    },
  ];

  const filterFields: FilterField[] = [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'ACTIVE', label: 'ACTIVE' },
        { value: 'SUSPENDED', label: 'SUSPENDED' },
        { value: 'TERMINATED', label: 'TERMINATED' },
      ],
    },
    {
      name: 'expiringSoon',
      label: 'Renewal Warning',
      type: 'select',
      options: [{ value: 'true', label: 'Expiring ≤60 days' }],
    },
  ];

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 text-slate-900 select-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Banner */}
        <div className="flex items-center gap-3 rounded-2xl bg-sky-50/60 border border-sky-100 p-4 text-sky-850">
          <Info className="h-5 w-5 text-sky-600 shrink-0" />
          <p className="text-xs leading-normal">
            <strong>Read-only Compliance Register Mode:</strong> Under standard GCC HR governance,
            this module acts as a compliance ledger. Core employee profiles (grades, cost centers,
            designations) can only be updated inside the central HR Master.
          </p>
        </div>

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-22 · S03 - S13
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Coverage Enrollment &amp; Register
            </h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setFormValues({
                employeeId: '',
                employeeName: '',
                employeeCode: '',
                department: '',
                designation: '',
                jobLevel: '',
                company: '',
                legalEntityId: '',
                joiningDate: '',
                employmentStatus: '',
                workLocation: '',
                manager: '',
                nationality: '',
                benefitCode: '',
                vendorId: '',
                policyNumber: '',
                startedAt: new Date().toISOString().slice(0, 10),
                expiresAt: '',
                actualAnnualValue: '',
                currency: 'AED',
                dependantsCount: 0,
              });
              setVerdicts([]);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Enroll Employee
          </button>
        </header>

        {/* Filters */}
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFilterChange={(n, v) => setFilters((f) => ({ ...f, [n]: v }))}
          fields={filterFields}
          onReset={() => {
            setSearch('');
            setFilters({ status: 'ACTIVE', vendorId: '', expiringSoon: '' });
          }}
          showDeleted={showDeleted}
          onToggleDeleted={setShowDeleted}
          placeholder="Search by policy number or employee..."
        />

        {/* Table */}
        <EntityTable
          columns={columns}
          data={rows}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          actions={(row) => (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewItem(row)}
                className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-700 transition-colors"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
              {row.status !== 'TERMINATED' && (
                <button
                  type="button"
                  onClick={() => {
                    setRenewTarget(row);
                    setRenewDate(getDefaultRenewalDate(row));
                  }}
                  className="rounded-lg p-1.5 hover:bg-slate-100 text-sky-700 transition-colors"
                  title="Renew Policy"
                >
                  <Calendar className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setAccrueTarget(row)}
                className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-700 transition-colors"
                title="Calculate Accrual Balance"
              >
                <Activity className="h-4 w-4" />
              </button>
              {row.status === 'ACTIVE' && (
                <button
                  type="button"
                  onClick={() => setSuspendTarget(row)}
                  className="rounded-lg p-1.5 hover:bg-slate-100 text-amber-700 transition-colors"
                  title="Suspend Policy"
                >
                  <Pause className="h-4 w-4" />
                </button>
              )}
              {row.status === 'SUSPENDED' && (
                <button
                  type="button"
                  onClick={() => setResumeTarget(row)}
                  className="rounded-lg p-1.5 hover:bg-slate-100 text-emerald-700 transition-colors"
                  title="Resume Policy"
                >
                  <Play className="h-4 w-4" />
                </button>
              )}
              {row.status !== 'TERMINATED' && (
                <button
                  type="button"
                  onClick={() => {
                    setTerminateTarget(row);
                    setTerminateDate(new Date().toISOString().slice(0, 10));
                  }}
                  className="rounded-lg p-1.5 hover:bg-slate-100 text-rose-700 transition-colors"
                  title="Terminate Enrollment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        />

        {/* Action Dialogs */}
        <ConfirmDialog
          open={!!renewTarget}
          onOpenChange={(o: boolean) => {
            if (!o) setRenewTarget(null);
          }}
          title="Renew Policy & Extend Coverage"
          description="Extend the duration of this employee's benefit policy. A new ledger entry will be logged under the compliance pipeline."
          confirmText="Attest & Renew"
          type="info"
          onConfirm={handleRenew}
        >
          <div className="flex flex-col gap-4 mt-4 text-left border-t border-slate-100 pt-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-100 rounded-xl p-3.5">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Employee
                </span>
                <span className="font-semibold text-slate-800">
                  {renewTarget?.employeeName} ({renewTarget?.employeeCode})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Benefit Program
                </span>
                <span className="font-semibold text-slate-800">
                  {renewTarget?.benefitLabel} ({renewTarget?.benefitCode})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Current Expiry
                </span>
                <span className="font-semibold text-slate-800">
                  {renewTarget?.expiresAt
                    ? new Date(renewTarget.expiresAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Vendor & Policy
                </span>
                <span className="font-semibold text-slate-800">
                  {renewTarget?.vendorName || 'No Vendor'} ({renewTarget?.policyNumber || 'N/A'})
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                New Policy Expiration Date *
              </label>
              <input
                type="date"
                value={renewDate}
                onChange={(e) => setRenewDate(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-slate-400 focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-400 font-semibold mt-1">
                Defaults to exactly one year following the current expiration date.
              </span>
            </div>
          </div>
        </ConfirmDialog>

        <ConfirmDialog
          open={!!terminateTarget}
          onOpenChange={(o: boolean) => {
            if (!o) setTerminateTarget(null);
          }}
          title="Terminate Benefit Enrollment"
          description="Are you sure you want to terminate this enrollment? This stops any monthly compliance accrual balances and archives history."
          type="danger"
          onConfirm={handleTerminate}
        >
          <div className="mt-3 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500">TERMINATION EFFECTIVE DATE</label>
            <input
              type="date"
              value={terminateDate}
              onChange={(e) => setTerminateDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
            />
          </div>
        </ConfirmDialog>

        <ConfirmDialog
          open={!!suspendTarget}
          onOpenChange={(o: boolean) => {
            if (!o) setSuspendTarget(null);
          }}
          title="Suspend Coverage"
          description="Temporarily suspend benefits coverage for this employee. Compliance warnings may trigger if this benefit program is mandatory under GCC HR regulations."
          confirmText="Yes, Suspend Coverage"
          type="warning"
          onConfirm={handleSuspend}
        >
          <div className="flex flex-col gap-4 mt-4 text-left border-t border-slate-100 pt-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-100 rounded-xl p-3.5">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Employee
                </span>
                <span className="font-semibold text-slate-800">
                  {suspendTarget?.employeeName} ({suspendTarget?.employeeCode})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Benefit Program
                </span>
                <span className="font-semibold text-slate-800">
                  {suspendTarget?.benefitLabel} ({suspendTarget?.benefitCode})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Current Expiry
                </span>
                <span className="font-semibold text-slate-800">
                  {suspendTarget?.expiresAt
                    ? new Date(suspendTarget.expiresAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Vendor & Policy
                </span>
                <span className="font-semibold text-slate-800">
                  {suspendTarget?.vendorName || 'No Vendor'} ({suspendTarget?.policyNumber || 'N/A'}
                  )
                </span>
              </div>
            </div>
            <p className="text-[11px] text-rose-600 font-semibold leading-relaxed">
              Caution: Suspending a mandatory statutory benefit (e.g., CCHI Medical Insurance) will
              immediately trigger compliance blockers in the monthly certification workspace.
            </p>
          </div>
        </ConfirmDialog>

        <ConfirmDialog
          open={!!resumeTarget}
          onOpenChange={(o: boolean) => {
            if (!o) setResumeTarget(null);
          }}
          title="Resume Active Coverage"
          description="Resume the coverage to active status. Compliance alerts and gating blockers on certificates will clear once active status is restored."
          confirmText="Yes, Resume Coverage"
          type="success"
          onConfirm={handleResume}
        >
          <div className="flex flex-col gap-4 mt-4 text-left border-t border-slate-100 pt-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-100 rounded-xl p-3.5">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Employee
                </span>
                <span className="font-semibold text-slate-800">
                  {resumeTarget?.employeeName} ({resumeTarget?.employeeCode})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Benefit Program
                </span>
                <span className="font-semibold text-slate-800">
                  {resumeTarget?.benefitLabel} ({resumeTarget?.benefitCode})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Current Expiry
                </span>
                <span className="font-semibold text-slate-800">
                  {resumeTarget?.expiresAt
                    ? new Date(resumeTarget.expiresAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Vendor & Policy
                </span>
                <span className="font-semibold text-slate-800">
                  {resumeTarget?.vendorName || 'No Vendor'} ({resumeTarget?.policyNumber || 'N/A'})
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              This restores active monthly compliance tracking, and resumes recurring accrual
              calculation parameters.
            </p>
          </div>
        </ConfirmDialog>

        <ConfirmDialog
          open={!!accrueTarget}
          onOpenChange={(o: boolean) => {
            if (!o) setAccrueTarget(null);
          }}
          title="Run Accrual Calculation"
          description="Calculate and post the accumulated benefits balance (e.g., End-of-Service Gratuity, Housing, Leave Travel allowance) for the current period."
          confirmText="Yes, Calculate Accrual"
          type="info"
          onConfirm={handleAccrue}
        >
          <div className="flex flex-col gap-4 mt-4 text-left border-t border-slate-100 pt-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-100 rounded-xl p-3.5">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Employee
                </span>
                <span className="font-semibold text-slate-800">
                  {accrueTarget?.employeeName} ({accrueTarget?.employeeCode})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Benefit Program
                </span>
                <span className="font-semibold text-slate-800">
                  {accrueTarget?.benefitLabel} ({accrueTarget?.benefitCode})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Current Balance
                </span>
                <span className="font-semibold text-slate-800">
                  {accrueTarget?.accruedBalance
                    ? `${Number(accrueTarget.accruedBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${accrueTarget.currency}`
                    : '0.00 AED'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Annual Value
                </span>
                <span className="font-semibold text-slate-800">
                  {accrueTarget?.actualAnnualValue
                    ? `${Number(accrueTarget.actualAnnualValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${accrueTarget.currency}`
                    : '0.00 AED'}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Note: This action re-evaluates the monthly accrual rate using standard GCC compliance
              formulas based on the employee's grade, organization settings, and active tenure.
            </p>
          </div>
        </ConfirmDialog>

        {/* View Details Modal */}
        <DetailsModal
          open={!!viewItem}
          onOpenChange={(o) => {
            if (!o) setViewItem(null);
          }}
          title="Benefit Enrollment Details"
          data={viewItem}
          fields={[
            { key: 'employeeName', label: 'Employee Name' },
            { key: 'employeeCode', label: 'Employee Code' },
            { key: 'benefitLabel', label: 'Program Name' },
            { key: 'benefitCode', label: 'Program Code' },
            { key: 'vendorName', label: 'Vendor', render: (val) => val ?? '—' },
            { key: 'policyNumber', label: 'Policy Number', render: (val) => val ?? '—' },
            { key: 'dependantsCount', label: 'Dependents' },
            { key: 'startedAt', label: 'Start Date', render: (val) => val?.slice(0, 10) },
            {
              key: 'expiresAt',
              label: 'Expiration Date',
              render: (val) => val?.slice(0, 10) ?? '—',
            },
            {
              key: 'actualAnnualValue',
              label: 'Actual Annual Value',
              render: (val) =>
                `${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED`,
            },
            {
              key: 'accruedBalance',
              label: 'Accrual Balance',
              render: (val) =>
                `${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED`,
            },
            { key: 'status', label: 'Status' },
            { key: 'createdBy', label: 'Created By', render: (val) => val ?? '—' },
            { key: 'updatedBy', label: 'Last Updated By', render: (val) => val ?? '—' },
            {
              key: 'createdAt',
              label: 'Created At',
              render: (val) => val?.slice(0, 16).replace('T', ' ') ?? '—',
            },
            {
              key: 'updatedAt',
              label: 'Updated At',
              render: (val) => val?.slice(0, 16).replace('T', ' ') ?? '—',
            },
          ]}
        />

        {/* Enrollment Form Modal */}
        <FormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          title="Enroll Employee in Benefits"
          onSubmit={handleEnrollSubmit}
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Step 1: HR Master Search */}
            <div className="col-span-2">
              <SearchableSelect
                label="Select Employee from HR Master *"
                value={formValues.employeeId}
                placeholder="Type name or code to search..."
                onChange={handleEmployeeSelectById}
                onSearch={handleSearchEmployees}
                options={empOptions}
                loading={empLoading}
              />
            </div>

            {/* Read-Only HR Master Card */}
            {formValues.employeeId && (
              <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    HR Master — Read Only
                  </span>
                  {hrLoading ? (
                    <span className="text-[10px] text-slate-400 animate-pulse">Syncing...</span>
                  ) : (
                    <span className="text-[10px] text-emerald-700 font-bold">✓ Profile Synced</span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs leading-normal">
                  {(
                    [
                      ['Department', formValues.department],
                      ['Designation', formValues.designation],
                      ['Grade Level', formValues.jobLevel],
                      ['Legal Entity', formValues.company],
                      ['Work Location', formValues.workLocation],
                      ['Line Manager', formValues.manager],
                      ['Joining Date', formValues.joiningDate],
                      ['Employment Status', formValues.employmentStatus],
                      ['Nationality', formValues.nationality || (hrLoading ? '…' : '—')],
                    ] as [string, string][]
                  ).map(([lbl, val]) => (
                    <div key={lbl}>
                      <span className="text-slate-400">{lbl}</span>
                      <p className="font-bold text-slate-800">{val || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compliance Summary */}
            {formValues.employeeId && verdicts.length > 0 && (
              <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">
                  Compliance Summary
                </span>
                <div className="space-y-1.5">
                  {verdicts
                    .filter((v) => v.isMandatory)
                    .map((v) => (
                      <div
                        key={v.benefitCode}
                        className={`flex items-center gap-2 text-xs font-medium ${
                          v.eligible ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {v.eligible ? (
                          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span>
                          <strong>Mandatory:</strong> {v.label} —{' '}
                          {v.eligible
                            ? 'Required & Eligible'
                            : `Not Eligible${v.reason ? ` (${v.reason})` : ''}`}
                        </span>
                      </div>
                    ))}
                  {verdicts
                    .filter((v) => !v.isMandatory && v.eligible)
                    .slice(0, 4)
                    .map((v) => (
                      <div
                        key={v.benefitCode}
                        className="flex items-center gap-2 text-xs text-slate-600"
                      >
                        <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        <span>{v.label} — Eligible</span>
                      </div>
                    ))}
                  {verdicts
                    .filter((v) => !v.isMandatory && !v.eligible)
                    .slice(0, 3)
                    .map((v) => (
                      <div
                        key={v.benefitCode}
                        className="flex items-center gap-2 text-xs text-slate-400"
                      >
                        <XCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {v.label} — Not Eligible{v.reason ? ` (${v.reason})` : ''}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Eligible Benefits */}
            {formValues.employeeId && (
              <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  System Suggested / Eligible Benefits
                </span>
                {verdictsLoading ? (
                  <p className="text-xs text-slate-400">Calculating eligibility rules...</p>
                ) : verdicts.length === 0 ? (
                  <p className="text-xs text-slate-400">No eligibility rules defined</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {verdicts.map((v) => (
                      <div
                        key={v.benefitCode}
                        onClick={() => setFormValues((f) => ({ ...f, benefitCode: v.benefitCode }))}
                        className={`flex items-center justify-between border rounded-xl p-2.5 cursor-pointer transition-all hover:bg-slate-50 ${
                          formValues.benefitCode === v.benefitCode
                            ? 'border-slate-800 bg-slate-50/50'
                            : 'border-slate-200'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-slate-900">{v.label}</p>
                          <span className="text-[10px] text-slate-400">{v.benefitCode}</span>
                        </div>
                        {v.eligible ? (
                          <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Eligible
                          </span>
                        ) : (
                          <span className="text-[10px] bg-rose-50 text-rose-800 font-bold px-1.5 py-0.5 rounded border border-rose-100 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Ineligible
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Selected Benefit display / fallback to catalogue */}
            <div className="col-span-2">
              {formValues.benefitCode ? (
                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-50 px-4 py-2.5">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Selected Benefit Program
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {verdicts.find((v) => v.benefitCode === formValues.benefitCode)?.label ??
                        catalogueOptions.find((o) => o.value === formValues.benefitCode)?.label ??
                        formValues.benefitCode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormValues((f) => ({ ...f, benefitCode: '' }))}
                    className="text-xs text-slate-400 hover:text-slate-600 underline"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-center">
                  <p className="text-xs text-slate-400">
                    {formValues.employeeId
                      ? 'Click an eligible benefit card above to select it'
                      : 'Select an employee first to see eligible benefits'}
                  </p>
                </div>
              )}
            </div>

            {/* Vendor search */}
            <div className="col-span-2">
              <SearchableSelect
                label="Vendor"
                value={formValues.vendorId}
                placeholder="Search vendor by name..."
                onChange={(val) => setFormValues((f) => ({ ...f, vendorId: val }))}
                onSearch={handleSearchVendors}
                options={vendorOptions}
                loading={vendorLoading}
                loadingText="Loading vendors..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Policy Number
              </label>
              <input
                value={formValues.policyNumber}
                onChange={(e) => setFormValues((f) => ({ ...f, policyNumber: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                placeholder="POL-10294"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Dependents Count
              </label>
              <input
                type="number"
                value={formValues.dependantsCount}
                onChange={(e) =>
                  setFormValues((f) => ({ ...f, dependantsCount: Number(e.target.value) }))
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Start Date *
              </label>
              <input
                type="date"
                value={formValues.startedAt}
                onChange={(e) => setFormValues((f) => ({ ...f, startedAt: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Expiration Date
              </label>
              <input
                type="date"
                value={formValues.expiresAt}
                onChange={(e) => setFormValues((f) => ({ ...f, expiresAt: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Actual Annual Value
              </label>
              <input
                type="number"
                value={formValues.actualAnnualValue}
                onChange={(e) =>
                  setFormValues((f) => ({ ...f, actualAnnualValue: e.target.value }))
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                placeholder="Calculated or Override value (leave blank for catalogue default)"
              />
            </div>
          </div>
        </FormModal>

        {/* Bulk Actions */}
        <BulkToolbar
          selectedIds={selectedIds}
          selectedRows={selectedRows}
          onClear={() => setSelectedIds([])}
          entity="enrollments"
          onActionComplete={loadData}
        />
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Focus Searchable Select Component
// ─────────────────────────────────────────────────────────────────────────────
function SearchableSelect({
  label,
  value,
  placeholder,
  onChange,
  onSearch,
  options,
  loading = false,
  loadingText = 'Loading...',
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (val: string) => void;
  onSearch?: (query: string) => void;
  options: Array<{ value: string; label: string }>;
  loading?: boolean;
  loadingText?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const selected = options.find((o) => o.value === value);
    if (selected) setSearchQuery(selected.label);
    else if (!value) setSearchQuery('');
  }, [value, options]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        const selected = options.find((o) => o.value === value);
        setSearchQuery(selected ? selected.label : '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, options]);

  const filteredOptions = onSearch
    ? options
    : options.filter((o) => o.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div ref={wrapperRef} className="relative flex flex-col gap-1.5 w-full">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (onSearch) onSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (onSearch && options.length === 0) onSearch('');
          }}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition-all"
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-slate-250 border-t-slate-600" />
          </div>
        )}
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          {filteredOptions.map((option) => (
            <li
              key={option.value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(option.value);
                setSearchQuery(option.label);
                setIsOpen(false);
              }}
              className={`cursor-pointer px-4 py-2 text-xs hover:bg-slate-50 transition-colors ${
                option.value === value
                  ? 'bg-slate-50 font-semibold text-slate-900'
                  : 'text-slate-700'
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}

      {isOpen && loading && filteredOptions.length === 0 && (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-xl border border-slate-200 bg-white py-3 shadow-xl">
          <li className="flex items-center gap-2 px-4 py-1 text-xs text-slate-450">
            <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
            {loadingText}
          </li>
        </ul>
      )}

      {isOpen && searchQuery.length > 0 && filteredOptions.length === 0 && !loading && (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
          <li className="px-4 py-2 text-xs text-slate-400">No employees found</li>
        </ul>
      )}
    </div>
  );
}
