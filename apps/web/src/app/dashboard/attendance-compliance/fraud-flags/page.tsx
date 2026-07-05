'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  AlertOctagon,
  Plus,
  Eye,
  Trash2,
  RotateCcw,
  ShieldAlert,
  Award,
  FileCheck,
  Pencil,
} from 'lucide-react';
import { EntityTable, type Column } from '../components/EntityTable';
import { FilterToolbar, type FilterField } from '../components/FilterToolbar';
import { BulkToolbar } from '../components/BulkToolbar';
import { DetailsModal } from '../components/DetailsModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ExportButton } from '../components/ExportButton';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
}

interface Flag {
  id: string;
  employeeId: string;
  punchDate: string;
  flagType: string;
  severity: string;
  score: number;
  status: string;
  evidenceJson: Record<string, any>;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolutionNotes: string | null;
  isDeleted: boolean;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  updatedBy: string | null;
  employee: Employee;
}

const sevColor: Record<string, string> = {
  LOW: 'bg-slate-50 text-slate-700 border border-slate-100',
  MEDIUM: 'bg-amber-50 text-amber-800 border border-amber-100',
  HIGH: 'bg-rose-50 text-rose-800 border border-rose-100',
  CRITICAL: 'bg-rose-100 text-rose-950 border border-rose-200 font-bold',
};

const statusColor: Record<string, string> = {
  OPEN: 'bg-rose-50 text-rose-800 border border-rose-100',
  RESOLVED: 'bg-emerald-50 text-emerald-800 border border-emerald-100',
};

export default function FraudFlagsPage() {
  const [data, setData] = React.useState<Flag[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Search & Filtering
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState<Record<string, string>>({
    status: 'OPEN',
    severity: '',
    flagType: '',
  });
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [sort, setSort] = React.useState<Array<{ field: string; dir: 'asc' | 'desc' }>>([
    { field: 'punchDate', dir: 'desc' },
  ]);

  // Selections
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Modals & Dialogs
  const [viewItem, setViewItem] = React.useState<Flag | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [formItem, setFormItem] = React.useState<Flag | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Flag | null>(null);
  const [archiveTarget, setArchiveTarget] = React.useState<Flag | null>(null);
  const [restoreTarget, setRestoreTarget] = React.useState<Flag | null>(null);
  const [resolveTarget, setResolveTarget] = React.useState<Flag | null>(null);
  const [resolutionNotes, setResolutionNotes] = React.useState('');

  // Searchable Employees list
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [empSearchQuery, setEmpSearchQuery] = React.useState('');
  const [empLoading, setEmpLoading] = React.useState(false);
  const [empDropdownOpen, setEmpDropdownOpen] = React.useState(false);
  const [selectedEmpName, setSelectedEmpName] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  // Form states
  const [formValues, setFormValues] = React.useState({
    employeeId: '',
    punchDate: new Date().toISOString().slice(0, 10),
    flagType: 'BUDDY_PUNCH',
    score: 50,
    severity: 'MEDIUM',
    evidenceJson: '{}',
  });

  // Structured evidence states
  const [hasSharedIp, setHasSharedIp] = React.useState(false);
  const [sharedIpValue, setSharedIpValue] = React.useState('');
  const [hasGeoMismatch, setHasGeoMismatch] = React.useState(false);
  const [geoDistanceValue, setGeoDistanceValue] = React.useState('');
  const [hasBuddyPunching, setHasBuddyPunching] = React.useState(false);
  const [buddyEmpCodeValue, setBuddyEmpCodeValue] = React.useState('');
  const [hasTimeDrift, setHasTimeDrift] = React.useState(false);
  const [timeDriftSecondsValue, setTimeDriftSecondsValue] = React.useState('');
  const [customEvidenceNotes, setCustomEvidenceNotes] = React.useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      params.set('isDeleted', String(showDeleted));
      if (search) params.set('search', search);

      if (sort.length > 0) {
        params.set('sortBy', sort[0].field);
        params.set('sortOrder', sort[0].dir);
      }

      for (const [k, v] of Object.entries(filters)) {
        if (v) params.set(k, v);
      }

      const res = await fetch(`/api/v1/attendance-compliance/fraud-flags?${params.toString()}`);
      const payload = await res.json();
      if (payload.success) {
        setData(payload.data?.items ?? []);
        setTotal(payload.data?.total ?? 0);
      } else {
        toast.error(payload.error?.message ?? 'Failed to load fraud flags');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading fraud flags');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, [page, pageSize, search, filters, showDeleted, sort]);

  const searchEmployees = async (query: string) => {
    setEmpLoading(true);
    try {
      const res = await fetch(`/api/employees/search?q=${encodeURIComponent(query)}&size=50`);
      const payload = await res.json();
      if (payload.success) {
        setEmployees(payload.data?.employees ?? []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEmpLoading(false);
    }
  };

  React.useEffect(() => {
    searchEmployees('');
  }, []);

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ status: 'OPEN', severity: '', flagType: '' });
    setShowDeleted(false);
  };

  const openCreateForm = () => {
    setFormItem(null);
    setFormValues({
      employeeId: '',
      punchDate: new Date().toISOString().slice(0, 10),
      flagType: 'BUDDY_PUNCH',
      score: 50,
      severity: 'MEDIUM',
      evidenceJson: '{}',
    });
    setEmpSearchQuery('');
    setSelectedEmpName('');
    setEmpDropdownOpen(false);

    // Reset structured evidence states
    setHasSharedIp(false);
    setSharedIpValue('');
    setHasGeoMismatch(false);
    setGeoDistanceValue('');
    setHasBuddyPunching(false);
    setBuddyEmpCodeValue('');
    setHasTimeDrift(false);
    setTimeDriftSecondsValue('');
    setCustomEvidenceNotes('');

    setFormOpen(true);
  };

  const openEditForm = (item: Flag) => {
    setFormItem(item);
    setFormValues({
      employeeId: item.employeeId,
      punchDate: item.punchDate.slice(0, 10),
      flagType: item.flagType,
      score: item.score,
      severity: item.severity,
      evidenceJson: JSON.stringify(item.evidenceJson || {}, null, 2),
    });
    setEmpSearchQuery('');
    setSelectedEmpName(
      item.employee
        ? `${item.employee.firstName} ${item.employee.lastName} (${item.employee.employeeCode})`
        : ''
    );
    setEmpDropdownOpen(false);

    // Parse existing evidence
    const evidence = item.evidenceJson || {};
    setHasSharedIp(!!evidence.sharedIp || !!evidence.sharedIpAddress);
    setSharedIpValue(evidence.sharedIpAddress || evidence.sharedIp || '');
    setHasGeoMismatch(
      !!evidence.geofenceMismatch || !!evidence.distanceMeters || !!evidence.distance
    );
    setGeoDistanceValue(String(evidence.distanceMeters || evidence.distance || ''));
    setHasBuddyPunching(
      !!evidence.buddyPunching || !!evidence.secondaryEmployeeCode || !!evidence.suspectedEmployee
    );
    setBuddyEmpCodeValue(evidence.secondaryEmployeeCode || evidence.suspectedEmployee || '');
    setHasTimeDrift(
      !!evidence.timeDrift || !!evidence.timeDriftSeconds || !!evidence.deviceTimeDriftSeconds
    );
    setTimeDriftSecondsValue(
      String(evidence.timeDriftSeconds || evidence.deviceTimeDriftSeconds || '')
    );
    setCustomEvidenceNotes(evidence.customNotes || evidence.notes || '');

    setSubmitting(false);
    setFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const parsedEvidence: any = {};
      if (hasSharedIp) {
        parsedEvidence.sharedIp = true;
        parsedEvidence.sharedIpAddress = sharedIpValue;
      }
      if (hasGeoMismatch) {
        parsedEvidence.geofenceMismatch = true;
        parsedEvidence.distanceMeters = Number(geoDistanceValue) || 0;
      }
      if (hasBuddyPunching) {
        parsedEvidence.buddyPunching = true;
        parsedEvidence.secondaryEmployeeCode = buddyEmpCodeValue;
      }
      if (hasTimeDrift) {
        parsedEvidence.timeDrift = true;
        parsedEvidence.timeDriftSeconds = Number(timeDriftSecondsValue) || 0;
      }
      if (customEvidenceNotes) {
        parsedEvidence.customNotes = customEvidenceNotes;
      }

      const body = {
        action: formItem ? 'update' : 'raise',
        id: formItem?.id,
        employeeId: formValues.employeeId,
        punchDate: new Date(formValues.punchDate),
        flagType: formValues.flagType,
        score: formValues.score,
        severity: formValues.severity,
        evidence: parsedEvidence,
      };

      const res = await fetch('/api/v1/attendance-compliance/fraud-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success(formItem ? 'Fraud flag updated' : 'Fraud flag raised');
        setFormOpen(false);
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to save fraud flag');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveSubmit = async () => {
    if (!resolveTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/attendance-compliance/fraud-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve',
          id: resolveTarget.id,
          notes: resolutionNotes,
        }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Fraud flag resolved and closed');
        setResolveTarget(null);
        setResolutionNotes('');
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to resolve flag');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    try {
      const res = await fetch('/api/v1/attendance-compliance/fraud-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive', id: archiveTarget.id }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Fraud flag moved to archive');
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to archive');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error');
    }
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    try {
      const res = await fetch('/api/v1/attendance-compliance/fraud-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', id: restoreTarget.id }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Fraud flag restored successfully');
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to restore');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch('/api/v1/attendance-compliance/fraud-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: deleteTarget.id }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Fraud flag deleted permanently');
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to delete');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error');
    }
  };

  const filterFields: FilterField[] = [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'OPEN', label: 'Open' },
        { value: 'RESOLVED', label: 'Resolved' },
      ],
    },
    {
      name: 'severity',
      label: 'Severity',
      type: 'select',
      options: [
        { value: 'LOW', label: 'Low' },
        { value: 'MEDIUM', label: 'Medium' },
        { value: 'HIGH', label: 'High' },
        { value: 'CRITICAL', label: 'Critical' },
      ],
    },
    {
      name: 'flagType',
      label: 'Anomaly Type',
      type: 'select',
      options: [
        { value: 'BUDDY_PUNCH', label: 'Buddy Punching' },
        { value: 'GEO_MISMATCH', label: 'Geofence Mismatch' },
        { value: 'SUSPICIOUS_TIME', label: 'Suspicious Timings' },
        { value: 'SHARED_IP', label: 'Shared IP Address' },
        { value: 'TIME_DRIFT', label: 'Device Time Drift' },
        { value: 'GHOST_PRESENCE', label: 'Ghost Presence' },
      ],
    },
  ];

  const columns: Array<Column<Flag>> = [
    {
      key: 'punchDate',
      label: 'Punch Date',
      sortable: true,
      render: (r) => r.punchDate.slice(0, 10),
    },
    { key: 'employeeCode', label: 'Code', render: (r) => r.employee?.employeeCode || '—' },
    {
      key: 'employeeName',
      label: 'Employee Name',
      render: (r) => (r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '—'),
    },
    { key: 'flagType', label: 'Type', sortable: true },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      render: (r) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${sevColor[r.severity] ?? ''}`}
        >
          {r.severity}
        </span>
      ),
    },
    { key: 'score', label: 'Score', sortable: true, render: (r) => `${r.score}/100` },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (r) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusColor[r.status] ?? ''}`}
        >
          {r.status}
        </span>
      ),
    },
    { key: 'resolutionNotes', label: 'Resolution', render: (r) => r.resolutionNotes || '—' },
  ];

  const detailsFields = [
    {
      key: 'punchDate',
      label: 'Transaction Punch Date',
      render: (v: any) => (v ? new Date(v).toLocaleDateString() : '—'),
    },
    { key: 'employeeCode', label: 'Employee Code' },
    { key: 'employeeName', label: 'Employee Name' },
    { key: 'flagType', label: 'Signal Flag Classification' },
    { key: 'severity', label: 'Severity Rating' },
    { key: 'score', label: 'Evaluated Fraud Score (Scale 0-100)' },
    { key: 'status', label: 'Investigation State' },
    {
      key: 'resolvedAt',
      label: 'Resolution Date/Time',
      render: (v: any) => (v ? new Date(v).toLocaleString() : '—'),
    },
    { key: 'resolutionNotes', label: 'Official Resolution Actions / Notes' },
  ];

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 text-slate-900 select-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-19 · Fraud Investigation
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Attendance Fraud Register
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Raise Flag
            </button>
          </div>
        </header>

        {/* Filters Toolbar */}
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFilterChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
          fields={filterFields}
          onReset={handleResetFilters}
          showDeleted={showDeleted}
          onToggleDeleted={setShowDeleted}
          placeholder="Search by Employee Code or Name..."
        />

        {/* Data Table */}
        <EntityTable
          columns={columns}
          data={data.map((item) => ({
            ...item,
            employeeCode: item.employee?.employeeCode,
            employeeName: item.employee
              ? `${item.employee.firstName} ${item.employee.lastName}`
              : '',
          }))}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          sort={sort}
          onSortChange={setSort}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          actions={(row) => (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewItem(row)}
                className="rounded-lg p-1 hover:bg-slate-100 text-slate-650 transition-colors"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => openEditForm(row)}
                className="rounded-lg p-1 hover:bg-slate-100 text-indigo-650 transition-colors"
                title="Edit Flag"
              >
                <Pencil className="h-4 w-4" />
              </button>
              {row.status === 'OPEN' && (
                <button
                  type="button"
                  onClick={() => setResolveTarget(row)}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2 py-0.5 text-[10px] font-bold text-white transition-colors"
                  title="Resolve Flag"
                >
                  Resolve
                </button>
              )}
              {row.isDeleted ? (
                <button
                  type="button"
                  onClick={() => setRestoreTarget(row)}
                  className="rounded-lg p-1 hover:bg-emerald-50 text-emerald-650 transition-colors"
                  title="Restore Record"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setArchiveTarget(row)}
                  className="rounded-lg p-1 hover:bg-rose-50 text-rose-650 transition-colors"
                  title="Archive Record"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              {row.isDeleted && (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(row)}
                  className="rounded-lg p-1 hover:bg-rose-100 text-rose-850 transition-colors"
                  title="Permanently Delete"
                >
                  <ShieldAlert className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        />

        {/* Bulk Action Toolbar */}
        <BulkToolbar
          selectedIds={selectedIds}
          onClear={() => setSelectedIds([])}
          entity="fraud-flags"
          filter={{ ...filters, search, isDeleted: showDeleted }}
          onActionComplete={loadData}
        />

        {/* Read-Only Details view */}
        <DetailsModal
          open={viewItem !== null}
          onOpenChange={(open) => !open && setViewItem(null)}
          title="Fraud flag Audit File"
          data={
            viewItem
              ? {
                  ...viewItem,
                  employeeCode: viewItem.employee?.employeeCode,
                  employeeName: viewItem.employee
                    ? `${viewItem.employee.firstName} ${viewItem.employee.lastName}`
                    : '',
                }
              : null
          }
          fields={detailsFields}
          renderExtra={(flag) => (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Device Signal Evidence
              </h4>
              <pre className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-[11px] text-slate-700 font-mono overflow-x-auto max-h-48">
                {JSON.stringify(flag.evidenceJson || {}, null, 2)}
              </pre>
            </div>
          )}
        />

        {/* Form Modal (Create / Edit) */}
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="relative w-full max-w-xl transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all max-h-[90vh] flex flex-col scale-100 p-0">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 px-6 pt-6 pb-4">
                {formItem ? 'Modify Fraud Flag' : 'Raise Attendance Fraud Flag'}
              </h3>
              <form
                onSubmit={handleFormSubmit}
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto space-y-6 px-6 py-6">
                  {/* Employee Searchable Dropdown */}
                  {!formItem && (
                    <div className="flex flex-col gap-1 relative">
                      <span className="text-xs font-bold text-slate-450 uppercase">
                        Find Employee *
                      </span>
                      <input
                        type="text"
                        placeholder="Type code or name to search employee..."
                        value={
                          empDropdownOpen
                            ? empSearchQuery
                            : formValues.employeeId
                              ? selectedEmpName
                              : empSearchQuery
                        }
                        onFocus={() => {
                          setEmpDropdownOpen(true);
                          searchEmployees(empSearchQuery);
                        }}
                        onChange={(e) => {
                          setEmpSearchQuery(e.target.value);
                          setEmpDropdownOpen(true);
                          searchEmployees(e.target.value);
                        }}
                        className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-slate-400"
                      />

                      {empDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setEmpDropdownOpen(false)}
                          />
                          <div className="absolute top-[100%] left-0 right-0 z-20 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg py-1">
                            {empLoading ? (
                              <div className="px-4 py-2 text-xs font-semibold text-slate-450">
                                Loading employees...
                              </div>
                            ) : employees.length === 0 ? (
                              <div className="px-4 py-2 text-xs font-semibold text-slate-450">
                                No matching employees found
                              </div>
                            ) : (
                              employees.map((e) => (
                                <button
                                  key={e.id}
                                  type="button"
                                  onClick={() => {
                                    setFormValues((v) => ({ ...v, employeeId: e.id }));
                                    setSelectedEmpName(
                                      `${e.firstName} ${e.lastName} (${e.employeeCode})`
                                    );
                                    setEmpSearchQuery('');
                                    setEmpDropdownOpen(false);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-50 transition-colors font-semibold flex items-center justify-between"
                                >
                                  <span>
                                    {e.firstName} {e.lastName}
                                  </span>
                                  <span className="text-xs text-slate-400">{e.employeeCode}</span>
                                </button>
                              ))
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-xs font-bold text-slate-450 uppercase">
                      Punch Date *
                      <input
                        type="date"
                        value={formValues.punchDate}
                        onChange={(e) =>
                          setFormValues((v) => ({ ...v, punchDate: e.target.value }))
                        }
                        className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-bold text-slate-450 uppercase">
                      Anomaly Flag Classification *
                      <select
                        value={formValues.flagType}
                        onChange={(e) => setFormValues((v) => ({ ...v, flagType: e.target.value }))}
                        className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800"
                      >
                        {[
                          'BUDDY_PUNCH',
                          'GEO_MISMATCH',
                          'SUSPICIOUS_TIME',
                          'SHARED_IP',
                          'TIME_DRIFT',
                          'GHOST_PRESENCE',
                        ].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-bold text-slate-450 uppercase">
                      Severity *
                      <select
                        value={formValues.severity}
                        onChange={(e) => setFormValues((v) => ({ ...v, severity: e.target.value }))}
                        className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800"
                      >
                        {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-bold text-slate-450 uppercase">
                      Fraud Score (0-100) *
                      <input
                        type="number"
                        value={formValues.score}
                        onChange={(e) =>
                          setFormValues((v) => ({ ...v, score: Number(e.target.value) }))
                        }
                        className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800"
                      />
                    </label>
                  </div>

                  {/* Structured Evidence Selection */}
                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Device Signal Evidence
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Shared IP */}
                      <div className="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasSharedIp}
                            onChange={(e) => setHasSharedIp(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                          <span>IP Address Sharing</span>
                        </label>
                        {hasSharedIp && (
                          <input
                            type="text"
                            placeholder="e.g. 192.168.1.100"
                            value={sharedIpValue}
                            onChange={(e) => setSharedIpValue(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 animate-fade-in"
                          />
                        )}
                      </div>

                      {/* Geofence Mismatch */}
                      <div className="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasGeoMismatch}
                            onChange={(e) => setHasGeoMismatch(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                          <span>Geofence Mismatch</span>
                        </label>
                        {hasGeoMismatch && (
                          <input
                            type="number"
                            placeholder="Distance (Meters)"
                            value={geoDistanceValue}
                            onChange={(e) => setGeoDistanceValue(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 animate-fade-in"
                          />
                        )}
                      </div>

                      {/* Buddy Punching */}
                      <div className="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasBuddyPunching}
                            onChange={(e) => setHasBuddyPunching(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                          <span>Buddy Punching Suspected</span>
                        </label>
                        {hasBuddyPunching && (
                          <input
                            type="text"
                            placeholder="Secondary Employee Code"
                            value={buddyEmpCodeValue}
                            onChange={(e) => setBuddyEmpCodeValue(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 animate-fade-in"
                          />
                        )}
                      </div>

                      {/* Time Drift */}
                      <div className="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasTimeDrift}
                            onChange={(e) => setHasTimeDrift(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                          <span>Device Time Drift</span>
                        </label>
                        {hasTimeDrift && (
                          <input
                            type="number"
                            placeholder="Time Drift (Seconds)"
                            value={timeDriftSecondsValue}
                            onChange={(e) => setTimeDriftSecondsValue(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 animate-fade-in"
                          />
                        )}
                      </div>

                      {/* Custom Notes */}
                      <div className="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50/50 sm:col-span-2">
                        <span className="text-xs font-bold text-slate-700">
                          Technical Notes / Custom Evidence
                        </span>
                        <textarea
                          rows={2}
                          placeholder="e.g. Heartbeat signal lost during punch action..."
                          value={customEvidenceNotes}
                          onChange={(e) => setCustomEvidenceNotes(e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 p-6 rounded-b-2xl mt-auto">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || (!formItem && !formValues.employeeId)}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Resolve Flag Notes Dialog */}
        {resolveTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all scale-100">
              <h3 className="text-base font-bold text-slate-900">Resolve Fraud Incident</h3>
              <p className="text-xs text-slate-450 mt-1 font-semibold">
                Submit resolution notes to close employee {resolveTarget.employee?.firstName}{' '}
                {resolveTarget.employee?.lastName}&apos;s anomaly log.
              </p>
              <textarea
                rows={4}
                placeholder="Type resolution actions, evidence findings, or justification..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 outline-none focus:border-slate-400"
              />
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setResolveTarget(null);
                    setResolutionNotes('');
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting || !resolutionNotes.trim()}
                  onClick={handleResolveSubmit}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting ? 'Resolving...' : 'Confirm Close'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialogs */}
        <ConfirmDialog
          open={archiveTarget !== null}
          onOpenChange={(open) => !open && setArchiveTarget(null)}
          title="Archive Fraud Flag Record"
          desc="Are you sure you want to archive this fraud flag record? It will be soft-deleted."
          onConfirm={handleArchive}
          confirmText="Archive"
        />

        <ConfirmDialog
          open={restoreTarget !== null}
          onOpenChange={(open) => !open && setRestoreTarget(null)}
          title="Restore Fraud Flag Record"
          desc="Are you sure you want to restore this soft-deleted fraud flag record?"
          onConfirm={handleRestore}
          confirmText="Restore"
          variant="info"
        />

        <ConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Permanently Delete Fraud Flag"
          desc="WARNING: Are you sure you want to permanently delete this fraud flag? This cannot be undone."
          onConfirm={handleDelete}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </main>
  );
}
