'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Layers, Plus, Pencil, Eye, Trash2, RotateCcw, ShieldAlert, Award } from 'lucide-react';
import { EntityTable, type Column } from '../components/EntityTable';
import { FilterToolbar, type FilterField } from '../components/FilterToolbar';
import { BulkToolbar } from '../components/BulkToolbar';
import { DetailsModal } from '../components/DetailsModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ExportButton } from '../components/ExportButton';

interface Policy {
  id: string;
  country: string;
  grade: string | null;
  isEligible: boolean;
  lateToleranceMin: number;
  earlyDepartureToleranceMin: number;
  missingPunchSlaHours: number;
  regularizationSlaDays: number;
  ramadanReducedHours: string;
  remoteWorkAllowed: boolean;
  fraudGeofenceRadiusM: number;
  biometricRequired: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  updatedBy: string | null;
}

export default function PoliciesPage() {
  const [data, setData] = React.useState<Policy[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Search & Filtering
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState<Record<string, string>>({
    country: '',
    status: 'ACTIVE',
  });
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [sort, setSort] = React.useState<Array<{ field: string; dir: 'asc' | 'desc' }>>([
    { field: 'createdAt', dir: 'desc' },
  ]);

  // Sync archive toggling with status filter
  React.useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      status: showDeleted ? 'ARCHIVED' : 'ACTIVE',
    }));
  }, [showDeleted]);

  // Selections
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Modals & Dialogs
  const [viewItem, setViewItem] = React.useState<Policy | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [formItem, setFormItem] = React.useState<Policy | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Policy | null>(null);
  const [archiveTarget, setArchiveTarget] = React.useState<Policy | null>(null);
  const [restoreTarget, setRestoreTarget] = React.useState<Policy | null>(null);
  const [seeding, setSeeding] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Form states
  const [formValues, setFormValues] = React.useState({
    country: 'UAE',
    grade: '',
    isEligible: true,
    lateToleranceMin: 10,
    earlyDepartureToleranceMin: 10,
    missingPunchSlaHours: 24,
    regularizationSlaDays: 3,
    ramadanReducedHours: 6,
    remoteWorkAllowed: true,
    fraudGeofenceRadiusM: 200,
    biometricRequired: false,
    effectiveFrom: new Date().toISOString().slice(0, 10),
    effectiveTo: '',
    status: 'ACTIVE',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      params.set('isDeleted', String(showDeleted));
      if (search) params.set('search', search);

      // Add active sorting
      if (sort.length > 0) {
        params.set('sortBy', sort[0].field);
        params.set('sortOrder', sort[0].dir);
      }

      // Add active filters
      for (const [k, v] of Object.entries(filters)) {
        if (v) params.set(k, v);
      }

      const res = await fetch(`/api/v1/attendance-compliance/policies?${params.toString()}`);
      const payload = await res.json();
      if (payload.success) {
        setData(payload.data?.items ?? []);
        setTotal(payload.data?.total ?? 0);
      } else {
        toast.error(payload.error?.message ?? 'Failed to load policies');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading policies');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, [page, pageSize, search, filters, showDeleted, sort]);

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ country: '', status: 'ACTIVE' });
    setShowDeleted(false);
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/v1/attendance-compliance/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed-defaults' }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('GCC Attendance policies seeded successfully');
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to seed policies');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error seeding policies');
    } finally {
      setSeeding(false);
    }
  };

  const openCreateForm = () => {
    setFormItem(null);
    setFormValues({
      country: 'UAE',
      grade: '',
      isEligible: true,
      lateToleranceMin: 10,
      earlyDepartureToleranceMin: 10,
      missingPunchSlaHours: 24,
      regularizationSlaDays: 3,
      ramadanReducedHours: 6,
      remoteWorkAllowed: true,
      fraudGeofenceRadiusM: 200,
      biometricRequired: false,
      effectiveFrom: new Date().toISOString().slice(0, 10),
      effectiveTo: '',
      status: 'ACTIVE',
    });
    setFormOpen(true);
  };

  const openEditForm = (item: Policy) => {
    setFormItem(item);
    setFormValues({
      country: item.country,
      grade: item.grade ?? '',
      isEligible: item.isEligible,
      lateToleranceMin: item.lateToleranceMin,
      earlyDepartureToleranceMin: item.earlyDepartureToleranceMin,
      missingPunchSlaHours: item.missingPunchSlaHours,
      regularizationSlaDays: item.regularizationSlaDays,
      ramadanReducedHours: Number(item.ramadanReducedHours),
      remoteWorkAllowed: item.remoteWorkAllowed,
      fraudGeofenceRadiusM: item.fraudGeofenceRadiusM,
      biometricRequired: item.biometricRequired,
      effectiveFrom: item.effectiveFrom.slice(0, 10),
      effectiveTo: item.effectiveTo ? item.effectiveTo.slice(0, 10) : '',
      status: item.status,
    });
    setSubmitting(false);
    setFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        action: formItem ? 'update' : 'create',
        id: formItem?.id,
        ...formValues,
      };
      const res = await fetch('/api/v1/attendance-compliance/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success(formItem ? 'Policy updated successfully' : 'Policy created successfully');
        setFormOpen(false);
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to save policy');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error saving policy');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    try {
      const res = await fetch('/api/v1/attendance-compliance/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive', id: archiveTarget.id }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Policy moved to archive');
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
      const res = await fetch('/api/v1/attendance-compliance/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', id: restoreTarget.id }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Policy restored successfully');
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
      const res = await fetch('/api/v1/attendance-compliance/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: deleteTarget.id }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Policy deleted permanently');
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
      name: 'country',
      label: 'Country',
      type: 'select',
      options: [
        { value: 'UAE', label: 'UAE' },
        { value: 'KSA', label: 'Saudi Arabia' },
        { value: 'BAHRAIN', label: 'Bahrain' },
        { value: 'QATAR', label: 'Qatar' },
        { value: 'OMAN', label: 'Oman' },
        { value: 'KUWAIT', label: 'Kuwait' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
        { value: 'ARCHIVED', label: 'Archived' },
      ],
    },
  ];

  const columns: Array<Column<Policy>> = [
    { key: 'country', label: 'Country', sortable: true },
    { key: 'grade', label: 'Grade', sortable: true, render: (r) => r.grade || '—' },
    {
      key: 'lateToleranceMin',
      label: 'Late Tol (Min)',
      sortable: true,
      render: (r) => `${r.lateToleranceMin}m`,
    },
    {
      key: 'earlyDepartureToleranceMin',
      label: 'Early Tol (Min)',
      sortable: true,
      render: (r) => `${r.earlyDepartureToleranceMin}m`,
    },
    {
      key: 'missingPunchSlaHours',
      label: 'Missing SLA',
      sortable: true,
      render: (r) => `${r.missingPunchSlaHours}h`,
    },
    {
      key: 'regularizationSlaDays',
      label: 'Reg SLA',
      sortable: true,
      render: (r) => `${r.regularizationSlaDays}d`,
    },
    {
      key: 'ramadanReducedHours',
      label: 'Ramadan Hrs',
      render: (r) => `${Number(r.ramadanReducedHours)}h`,
    },
    {
      key: 'remoteWorkAllowed',
      label: 'Remote OK',
      render: (r) => (r.remoteWorkAllowed ? 'Yes' : 'No'),
    },
    {
      key: 'biometricRequired',
      label: 'Biometrics',
      render: (r) => (r.biometricRequired ? 'Yes' : 'No'),
    },
    {
      key: 'effectiveFrom',
      label: 'Effective From',
      sortable: true,
      render: (r) => r.effectiveFrom.slice(0, 10),
    },
  ];

  const detailsFields = [
    { key: 'country', label: 'Country Name' },
    { key: 'grade', label: 'Target Job Grade' },
    {
      key: 'isEligible',
      label: 'Eligible for Attendance Checks',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
    {
      key: 'lateToleranceMin',
      label: 'Late Arrival Grace (Minutes)',
      render: (v: any) => `${v} minutes`,
    },
    {
      key: 'earlyDepartureToleranceMin',
      label: 'Early Out Grace (Minutes)',
      render: (v: any) => `${v} minutes`,
    },
    {
      key: 'missingPunchSlaHours',
      label: 'Missing Punch Regularization SLA',
      render: (v: any) => `${v} hours`,
    },
    {
      key: 'regularizationSlaDays',
      label: 'Manager Regularization Approval SLA',
      render: (v: any) => `${v} days`,
    },
    {
      key: 'ramadanReducedHours',
      label: 'Reduced Ramadan Workday Hours',
      render: (v: any) => `${Number(v)} hours`,
    },
    {
      key: 'remoteWorkAllowed',
      label: 'Remote Work Allowed',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
    {
      key: 'fraudGeofenceRadiusM',
      label: 'Geofence Radius Limit',
      render: (v: any) => `${v} meters`,
    },
    {
      key: 'biometricRequired',
      label: 'Biometric Attendance Required',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
    {
      key: 'effectiveFrom',
      label: 'Effective Commencement',
      render: (v: any) => new Date(v).toLocaleDateString(),
    },
    {
      key: 'effectiveTo',
      label: 'Effective Termination',
      render: (v: any) => (v ? new Date(v).toLocaleDateString() : '—'),
    },
    { key: 'status', label: 'Current State' },
  ];

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 text-slate-900 select-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-19 · Compliance Policy
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Attendance Policies
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={seeding}
              onClick={handleSeedDefaults}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <Award className="h-4 w-4 text-indigo-500" />
              {seeding ? 'Seeding...' : 'Seed Defaults'}
            </button>
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Policy
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
          placeholder="Search by Country or Grade..."
        />

        {/* Data Table */}
        <EntityTable
          columns={columns}
          data={data}
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
                title="Edit Policy"
              >
                <Pencil className="h-4 w-4" />
              </button>
              {row.isDeleted ? (
                <button
                  type="button"
                  onClick={() => setRestoreTarget(row)}
                  className="rounded-lg p-1 hover:bg-emerald-50 text-emerald-650 transition-colors"
                  title="Restore Policy"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setArchiveTarget(row)}
                  className="rounded-lg p-1 hover:bg-rose-50 text-rose-650 transition-colors"
                  title="Archive Policy"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              {row.isDeleted && (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(row)}
                  className="rounded-lg p-1 hover:bg-rose-100 text-rose-800 transition-colors"
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
          entity="policies"
          filter={{ ...filters, search, isDeleted: showDeleted }}
          onActionComplete={loadData}
        />

        {/* Read-Only Details view */}
        <DetailsModal
          open={viewItem !== null}
          onOpenChange={(open) => !open && setViewItem(null)}
          title="Attendance Policy Details"
          data={viewItem}
          fields={detailsFields}
        />

        {/* Form Modal (Create / Edit) */}
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all max-h-[90vh] flex flex-col scale-100 p-0">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 px-6 pt-6 pb-4">
                {formItem ? 'Modify Attendance Policy' : 'Create Attendance Policy'}
              </h3>
              <form
                onSubmit={handleFormSubmit}
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto space-y-6 px-6 py-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-xs font-bold text-slate-450 uppercase">
                      Country *
                      <select
                        value={formValues.country}
                        onChange={(e) => setFormValues((v) => ({ ...v, country: e.target.value }))}
                        className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800"
                      >
                        {['UAE', 'KSA', 'BAHRAIN', 'QATAR', 'OMAN', 'KUWAIT'].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-bold text-slate-450 uppercase">
                      Job Grade (Optional)
                      <input
                        type="text"
                        placeholder="e.g. GR-04"
                        value={formValues.grade}
                        onChange={(e) => setFormValues((v) => ({ ...v, grade: e.target.value }))}
                        className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-bold text-slate-450 uppercase">
                      Late Grace Period (Min)
                      <input
                        type="number"
                        value={formValues.lateToleranceMin}
                        onChange={(e) =>
                          setFormValues((v) => ({ ...v, lateToleranceMin: Number(e.target.value) }))
                        }
                        className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-bold text-slate-450 uppercase">
                      Early Out Grace (Min)
                      <input
                        type="number"
                        value={formValues.earlyDepartureToleranceMin}
                        onChange={(e) =>
                          setFormValues((v) => ({
                            ...v,
                            earlyDepartureToleranceMin: Number(e.target.value),
                          }))
                        }
                        className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-bold text-slate-450 uppercase">
                      Missing Punch SLA (Hours)
                      <input
                        type="number"
                        value={formValues.missingPunchSlaHours}
                        onChange={(e) =>
                          setFormValues((v) => ({
                            ...v,
                            missingPunchSlaHours: Number(e.target.value),
                          }))
                        }
                        className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-bold text-slate-450 uppercase">
                      Approval SLA (Days)
                      <input
                        type="number"
                        value={formValues.regularizationSlaDays}
                        onChange={(e) =>
                          setFormValues((v) => ({
                            ...v,
                            regularizationSlaDays: Number(e.target.value),
                          }))
                        }
                        className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-bold text-slate-450 uppercase">
                      Ramadan Reduced Day (Hours)
                      <input
                        type="number"
                        value={formValues.ramadanReducedHours}
                        onChange={(e) =>
                          setFormValues((v) => ({
                            ...v,
                            ramadanReducedHours: Number(e.target.value),
                          }))
                        }
                        className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-bold text-slate-450 uppercase">
                      Geofence Max Radius (Meters)
                      <input
                        type="number"
                        value={formValues.fraudGeofenceRadiusM}
                        onChange={(e) =>
                          setFormValues((v) => ({
                            ...v,
                            fraudGeofenceRadiusM: Number(e.target.value),
                          }))
                        }
                        className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-bold text-slate-450 uppercase">
                      Commencement Date *
                      <input
                        type="date"
                        value={formValues.effectiveFrom}
                        onChange={(e) =>
                          setFormValues((v) => ({ ...v, effectiveFrom: e.target.value }))
                        }
                        className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-bold text-slate-450 uppercase">
                      Termination Date (Optional)
                      <input
                        type="date"
                        value={formValues.effectiveTo}
                        onChange={(e) =>
                          setFormValues((v) => ({ ...v, effectiveTo: e.target.value }))
                        }
                        className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800"
                      />
                    </label>
                  </div>

                  <div className="border-t border-slate-100 pt-3 grid gap-3 sm:grid-cols-3 text-xs font-bold text-slate-700">
                    <label className="flex items-center gap-2 px-1 py-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formValues.isEligible}
                        onChange={(e) =>
                          setFormValues((v) => ({ ...v, isEligible: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-slate-350"
                      />
                      <span>Eligible for Checks</span>
                    </label>
                    <label className="flex items-center gap-2 px-1 py-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formValues.remoteWorkAllowed}
                        onChange={(e) =>
                          setFormValues((v) => ({ ...v, remoteWorkAllowed: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-slate-350"
                      />
                      <span>Remote Work Allowed</span>
                    </label>
                    <label className="flex items-center gap-2 px-1 py-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formValues.biometricRequired}
                        onChange={(e) =>
                          setFormValues((v) => ({ ...v, biometricRequired: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-slate-350"
                      />
                      <span>Biometric Required</span>
                    </label>
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
                    disabled={submitting}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Dialogs */}
        <ConfirmDialog
          open={archiveTarget !== null}
          onOpenChange={(open) => !open && setArchiveTarget(null)}
          title="Archive Compliance Policy"
          desc={`Are you sure you want to archive the policy for ${archiveTarget?.country}${archiveTarget?.grade ? ` (Grade ${archiveTarget.grade})` : ''}?`}
          onConfirm={handleArchive}
          confirmText="Archive"
        />

        <ConfirmDialog
          open={restoreTarget !== null}
          onOpenChange={(open) => !open && setRestoreTarget(null)}
          title="Restore Compliance Policy"
          desc={`Are you sure you want to restore the archived policy for ${restoreTarget?.country}?`}
          onConfirm={handleRestore}
          confirmText="Restore"
          variant="info"
        />

        <ConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Permanently Delete Compliance Policy"
          desc={`WARNING: Are you sure you want to permanently delete the policy for ${deleteTarget?.country}? This action cannot be undone.`}
          onConfirm={handleDelete}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </main>
  );
}
