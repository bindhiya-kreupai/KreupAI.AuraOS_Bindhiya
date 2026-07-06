'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Fingerprint,
  Plus,
  Pencil,
  Eye,
  Trash2,
  RotateCcw,
  ShieldAlert,
  Award,
  FileCheck,
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

interface Consent {
  id: string;
  employeeId: string;
  consentType: string;
  grantedAt: string | null;
  revokedAt: string | null;
  evidenceUrl: string | null;
  statusLabel: string;
  isDeleted: boolean;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  updatedBy: string | null;
  employee: Employee;
}

export default function ConsentsPage() {
  const [data, setData] = React.useState<Consent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Search & Filtering
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState<Record<string, string>>({
    consentType: '',
    status: '',
  });
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [sort, setSort] = React.useState<Array<{ field: string; dir: 'asc' | 'desc' }>>([
    { field: 'updatedAt', dir: 'desc' },
  ]);

  // Selections
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Modals & Dialogs
  const [viewItem, setViewItem] = React.useState<Consent | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [formItem, setFormItem] = React.useState<Consent | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Consent | null>(null);
  const [archiveTarget, setArchiveTarget] = React.useState<Consent | null>(null);
  const [restoreTarget, setRestoreTarget] = React.useState<Consent | null>(null);

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
    consentType: 'BIOMETRIC',
    evidenceUrl: '',
    isGranted: true,
    grantedAt: new Date().toISOString().slice(0, 10),
    revokedAt: '',
  });

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

      const res = await fetch(`/api/v1/attendance-compliance/consents?${params.toString()}`);
      const payload = await res.json();
      if (payload.success) {
        setData(payload.data?.items ?? []);
        setTotal(payload.data?.total ?? 0);
      } else {
        toast.error(payload.error?.message ?? 'Failed to load consents');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading consents');
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
    setFilters({ consentType: '', status: '' });
    setShowDeleted(false);
  };

  const openCreateForm = () => {
    setFormItem(null);
    setFormValues({
      employeeId: '',
      consentType: 'BIOMETRIC',
      evidenceUrl: '',
      isGranted: true,
      grantedAt: new Date().toISOString().slice(0, 10),
      revokedAt: '',
    });
    setEmpSearchQuery('');
    setSelectedEmpName('');
    setEmpDropdownOpen(false);
    setFormOpen(true);
  };

  const openEditForm = (item: Consent) => {
    setFormItem(item);
    setFormValues({
      employeeId: item.employeeId,
      consentType: item.consentType,
      evidenceUrl: item.evidenceUrl ?? '',
      isGranted: item.grantedAt !== null && item.revokedAt === null,
      grantedAt: item.grantedAt
        ? item.grantedAt.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      revokedAt: item.revokedAt ? item.revokedAt.slice(0, 10) : '',
    });
    setEmpSearchQuery('');
    setSelectedEmpName(
      item.employee
        ? `${item.employee.firstName} ${item.employee.lastName} (${item.employee.employeeCode})`
        : ''
    );
    setEmpDropdownOpen(false);
    setSubmitting(false);
    setFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let body: any = {};
      if (formItem) {
        body = {
          action: 'update',
          id: formItem.id,
          consentType: formValues.consentType,
          evidenceUrl: formValues.evidenceUrl,
          grantedAt: formValues.isGranted ? new Date(formValues.grantedAt) : null,
          revokedAt:
            !formValues.isGranted && formValues.revokedAt
              ? new Date(formValues.revokedAt)
              : !formValues.isGranted
                ? new Date()
                : null,
        };
      } else {
        body = {
          action: formValues.isGranted ? 'grant' : 'revoke',
          employeeId: formValues.employeeId,
          consentType: formValues.consentType,
          evidenceUrl: formValues.evidenceUrl || undefined,
        };
      }

      const res = await fetch('/api/v1/attendance-compliance/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success(formItem ? 'Consent updated successfully' : 'Consent logged successfully');
        setFormOpen(false);
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to save consent record');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error saving consent');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    try {
      const res = await fetch('/api/v1/attendance-compliance/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive', id: archiveTarget.id }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Consent record moved to archive');
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
      const res = await fetch('/api/v1/attendance-compliance/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', id: restoreTarget.id }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Consent record restored successfully');
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
      const res = await fetch('/api/v1/attendance-compliance/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: deleteTarget.id }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Consent record deleted permanently');
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
      name: 'consentType',
      label: 'Consent Type',
      type: 'select',
      options: [
        { value: 'BIOMETRIC', label: 'Biometric' },
        { value: 'GEOLOCATION', label: 'Geolocation' },
        { value: 'PHOTO_VERIFICATION', label: 'Photo Verification' },
      ],
    },
    {
      name: 'status',
      label: 'State',
      type: 'select',
      options: [
        { value: 'ACTIVE', label: 'Active (Granted)' },
        { value: 'INACTIVE', label: 'Inactive (Revoked)' },
      ],
    },
  ];

  const columns: Array<Column<Consent>> = [
    { key: 'employeeCode', label: 'Code', render: (r) => r.employee?.employeeCode || '—' },
    {
      key: 'employeeName',
      label: 'Employee Name',
      render: (r) => (r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '—'),
    },
    { key: 'consentType', label: 'Consent Type', sortable: true },
    {
      key: 'grantedAt',
      label: 'Granted At',
      sortable: true,
      render: (r) => (r.grantedAt ? r.grantedAt.slice(0, 10) : '—'),
    },
    {
      key: 'revokedAt',
      label: 'Revoked At',
      sortable: true,
      render: (r) => (r.revokedAt ? r.revokedAt.slice(0, 10) : '—'),
    },
    {
      key: 'evidenceUrl',
      label: 'Evidence URL',
      render: (r) =>
        r.evidenceUrl ? (
          <a
            href={r.evidenceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-650 hover:underline"
          >
            Open File
          </a>
        ) : (
          '—'
        ),
    },
    {
      key: 'statusLabel',
      label: 'State',
      render: (r) => {
        const active = r.grantedAt && !r.revokedAt;
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              active
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                : 'bg-rose-50 text-rose-800 border border-rose-100'
            }`}
          >
            {active ? 'Granted ✓' : 'Revoked ✗'}
          </span>
        );
      },
    },
  ];

  const detailsFields = [
    { key: 'employeeCode', label: 'Employee Code', render: (v: any) => v || '—' },
    { key: 'employeeName', label: 'Employee Full Name', render: (v: any) => v || '—' },
    { key: 'consentType', label: 'Consent Clause' },
    {
      key: 'grantedAt',
      label: 'Granted Date',
      render: (v: any) => (v ? new Date(v).toLocaleDateString() : '—'),
    },
    {
      key: 'revokedAt',
      label: 'Revoked Date',
      render: (v: any) => (v ? new Date(v).toLocaleDateString() : '—'),
    },
    {
      key: 'evidenceUrl',
      label: 'Evidence Document Link',
      render: (v: any) =>
        v ? (
          <a href={v} target="_blank" rel="noreferrer" className="text-indigo-650 hover:underline">
            {v}
          </a>
        ) : (
          '—'
        ),
    },
    { key: 'statusLabel', label: 'Active State' },
  ];

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 text-slate-900 select-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-19 · Consent Compliance
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Biometric/Geolocation Consent
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Log Consent
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
                title="Edit Record"
              >
                <Pencil className="h-4 w-4" />
              </button>
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
          entity="consents"
          filter={{ ...filters, search, isDeleted: showDeleted }}
          onActionComplete={loadData}
        />

        {/* Read-Only Details view */}
        <DetailsModal
          open={viewItem !== null}
          onOpenChange={(open) => !open && setViewItem(null)}
          title="Consent Agreement Details"
          data={
            viewItem
              ? {
                  ...viewItem,
                  employeeCode: viewItem.employee?.employeeCode,
                  employeeName: viewItem.employee
                    ? `${viewItem.employee.firstName} ${viewItem.employee.lastName}`
                    : '',
                  statusLabel: viewItem.grantedAt && !viewItem.revokedAt ? 'ACTIVE' : 'INACTIVE',
                }
              : null
          }
          fields={detailsFields}
        />

        {/* Form Modal (Create / Edit) */}
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="relative w-full max-w-xl transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all max-h-[90vh] flex flex-col scale-100 p-0">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 px-6 pt-6 pb-4">
                {formItem ? 'Modify Consent Log' : 'Log Consent Agreement'}
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
                      Consent Clause Type *
                      <select
                        value={formValues.consentType}
                        onChange={(e) =>
                          setFormValues((v) => ({ ...v, consentType: e.target.value }))
                        }
                        className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800"
                      >
                        {['BIOMETRIC', 'GEOLOCATION', 'PHOTO_VERIFICATION'].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-bold text-slate-450 uppercase">
                      State
                      <select
                        value={formValues.isGranted ? 'grant' : 'revoke'}
                        onChange={(e) =>
                          setFormValues((v) => ({ ...v, isGranted: e.target.value === 'grant' }))
                        }
                        className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800"
                      >
                        <option value="grant">Granted</option>
                        <option value="revoke">Revoked / Disagreed</option>
                      </select>
                    </label>
                    {formValues.isGranted ? (
                      <label className="flex flex-col gap-1 text-xs font-bold text-slate-450 uppercase">
                        Granted Date *
                        <input
                          type="date"
                          value={formValues.grantedAt}
                          onChange={(e) =>
                            setFormValues((v) => ({ ...v, grantedAt: e.target.value }))
                          }
                          className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800"
                        />
                      </label>
                    ) : (
                      <label className="flex flex-col gap-1 text-xs font-bold text-slate-450 uppercase">
                        Revoked Date *
                        <input
                          type="date"
                          value={formValues.revokedAt}
                          onChange={(e) =>
                            setFormValues((v) => ({ ...v, revokedAt: e.target.value }))
                          }
                          className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800"
                        />
                      </label>
                    )}
                    <label className="flex flex-col gap-1 text-xs font-bold text-slate-450 uppercase sm:col-span-2">
                      Evidence URL
                      <input
                        type="url"
                        placeholder="https://s3.storage.com/evidence-document-pdf"
                        value={formValues.evidenceUrl}
                        onChange={(e) =>
                          setFormValues((v) => ({ ...v, evidenceUrl: e.target.value }))
                        }
                        className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800"
                      />
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

        {/* Confirmation Dialogs */}
        <ConfirmDialog
          open={archiveTarget !== null}
          onOpenChange={(open) => !open && setArchiveTarget(null)}
          title="Archive Consent Log"
          desc="Are you sure you want to archive this consent log? It will be soft-deleted."
          onConfirm={handleArchive}
          confirmText="Archive"
        />

        <ConfirmDialog
          open={restoreTarget !== null}
          onOpenChange={(open) => !open && setRestoreTarget(null)}
          title="Restore Consent Log"
          desc="Are you sure you want to restore this soft-deleted consent record?"
          onConfirm={handleRestore}
          confirmText="Restore"
          variant="info"
        />

        <ConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Permanently Delete Consent Log"
          desc="WARNING: Are you sure you want to permanently delete this consent record? This cannot be undone."
          onConfirm={handleDelete}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </main>
  );
}
