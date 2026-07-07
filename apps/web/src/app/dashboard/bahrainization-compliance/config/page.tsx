'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Building2,
  Plus,
  Pencil,
  Eye,
  Trash2,
  RotateCcw,
  Archive,
  ShieldCheck,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { EntityTable, type Column } from '../components/EntityTable';
import { FilterToolbar, type FilterField } from '../components/FilterToolbar';
import { BulkToolbar } from '../components/BulkToolbar';
import { DetailsModal } from '../components/DetailsModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ExportButton } from '../components/ExportButton';
import { RAGBadge } from '../components/RAGBadge';

interface EstablishmentConfig {
  id: string;
  legalEntityId: string | null;
  establishmentName: string;
  sector: string;
  sizeBracket: string;
  bahrainiHeadcount: number;
  totalHeadcount: number;
  lmraEstablishmentId: string | null;
  isInScope: boolean;
  isGovernmentTenderEligible: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

const SECTORS = ['PRIVATE', 'PUBLIC', 'SEMI_GOVT', 'MINISTRY'];
const SIZE_BRACKETS = ['SMALL', 'MEDIUM', 'LARGE', 'GIANT'];

const filterFields: FilterField[] = [
  {
    name: 'sector',
    label: 'Sector',
    type: 'select',
    options: SECTORS.map((s) => ({ value: s, label: s })),
  },
  {
    name: 'sizeBracket',
    label: 'Size Bracket',
    type: 'select',
    options: SIZE_BRACKETS.map((s) => ({ value: s, label: s })),
  },
  {
    name: 'isInScope',
    label: 'In Scope',
    type: 'select',
    options: [
      { value: 'true', label: 'In Scope' },
      { value: 'false', label: 'Out of Scope' },
    ],
  },
];

const emptyForm = {
  legalEntityId: '',
  establishmentName: '',
  sector: 'PRIVATE',
  sizeBracket: 'SMALL',
  bahrainiHeadcount: '',
  totalHeadcount: '',
  lmraEstablishmentId: '',
};

export default function EstablishmentScopePage() {
  const [data, setData] = React.useState<EstablishmentConfig[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState<Record<string, string>>({
    sector: '',
    sizeBracket: '',
    isInScope: '',
  });
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [sort, setSort] = React.useState<Array<{ field: string; dir: 'asc' | 'desc' }>>([
    { field: 'establishmentName', dir: 'asc' },
  ]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const [viewItem, setViewItem] = React.useState<EstablishmentConfig | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [formItem, setFormItem] = React.useState<EstablishmentConfig | null>(null);
  const [formValues, setFormValues] = React.useState(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);

  const [archiveTarget, setArchiveTarget] = React.useState<EstablishmentConfig | null>(null);
  const [restoreTarget, setRestoreTarget] = React.useState<EstablishmentConfig | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<EstablishmentConfig | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      params.set('isDeleted', String(showDeleted));
      if (search) params.set('search', search);
      if (filters.sector) params.set('sector', filters.sector);
      if (filters.sizeBracket) params.set('sizeBracket', filters.sizeBracket);
      if (filters.isInScope) params.set('isInScope', filters.isInScope);
      if (sort[0]) {
        params.set('sortField', sort[0].field);
        params.set('sortDir', sort[0].dir);
      }

      const res = await fetch(`/api/v1/bahrainization-compliance/config?${params}`);
      const payload = (await res.json()) as {
        success: boolean;
        data: { items: EstablishmentConfig[]; total: number };
      };
      if (payload.success) {
        setData(payload.data.items ?? []);
        setTotal(payload.data.total ?? 0);
      } else {
        toast.error('Failed to load establishments');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading establishments');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filters, showDeleted, sort]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters((f) => ({ ...f, [name]: value }));
    setPage(1);
  };
  const handleReset = () => {
    setSearch('');
    setFilters({ sector: '', sizeBracket: '', isInScope: '' });
    setShowDeleted(false);
    setPage(1);
  };

  const openCreate = () => {
    setFormItem(null);
    setFormValues(emptyForm);
    setFormOpen(true);
  };
  const openEdit = (row: EstablishmentConfig) => {
    setFormItem(row);
    setFormValues({
      legalEntityId: row.legalEntityId ?? '',
      establishmentName: row.establishmentName,
      sector: row.sector,
      sizeBracket: row.sizeBracket,
      bahrainiHeadcount: String(row.bahrainiHeadcount),
      totalHeadcount: String(row.totalHeadcount),
      lmraEstablishmentId: row.lmraEstablishmentId ?? '',
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!formValues.establishmentName || !formValues.sector || !formValues.sizeBracket) {
      toast.error('Establishment name, sector, and size bracket are required');
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        id: formItem?.id || undefined,
        legalEntityId: formValues.legalEntityId || undefined,
        establishmentName: formValues.establishmentName,
        sector: formValues.sector,
        sizeBracket: formValues.sizeBracket,
        bahrainiHeadcount: Number(formValues.bahrainiHeadcount || 0),
        totalHeadcount: Number(formValues.totalHeadcount || 0),
        lmraEstablishmentId: formValues.lmraEstablishmentId || undefined,
      };
      const res = await fetch('/api/v1/bahrainization-compliance/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (payload.success) {
        toast.success(formItem ? 'Establishment updated' : 'Establishment created');
        setFormOpen(false);
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to save');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error saving establishment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (action: string, id: string) => {
    try {
      const res = await fetch('/api/v1/bahrainization-compliance/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id }),
      });
      const payload = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (payload.success) {
        toast.success(`Record ${action}d successfully`);
        loadData();
      } else {
        toast.error(payload.error?.message ?? `Failed to ${action}`);
      }
    } catch (e) {
      console.error(e);
      toast.error(`Network error during ${action}`);
    }
  };

  const ratioPct = (row: EstablishmentConfig) =>
    row.totalHeadcount === 0
      ? 0
      : Number(((row.bahrainiHeadcount / row.totalHeadcount) * 100).toFixed(1));

  const columns: Column<EstablishmentConfig>[] = [
    {
      key: 'establishmentName',
      label: 'Establishment',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-900">{row.establishmentName}</span>
      ),
    },
    { key: 'sector', label: 'Sector', sortable: true },
    { key: 'sizeBracket', label: 'Size', sortable: true },
    {
      key: 'bahrainiHeadcount',
      label: 'Bahraini HC',
      sortable: true,
      render: (row) => <span className="font-mono">{row.bahrainiHeadcount}</span>,
    },
    {
      key: 'totalHeadcount',
      label: 'Total HC',
      sortable: true,
      render: (row) => <span className="font-mono">{row.totalHeadcount}</span>,
    },
    {
      key: 'ratioPct',
      label: 'Ratio %',
      render: (row) => <span className="font-mono font-semibold">{ratioPct(row)}%</span>,
    },
    {
      key: 'lmraEstablishmentId',
      label: 'LMRA ID',
      render: (row) => <span className="font-mono text-xs">{row.lmraEstablishmentId ?? '—'}</span>,
    },
    {
      key: 'isInScope',
      label: 'In Scope',
      render: (row) =>
        row.isInScope ? (
          <CheckCircle className="h-4 w-4 text-emerald-600" />
        ) : (
          <XCircle className="h-4 w-4 text-slate-400" />
        ),
    },
    {
      key: 'isGovernmentTenderEligible',
      label: 'Tender',
      render: (row) =>
        row.isGovernmentTenderEligible ? (
          <CheckCircle className="h-4 w-4 text-emerald-600" />
        ) : (
          <XCircle className="h-4 w-4 text-slate-400" />
        ),
    },
  ];

  const activeFilter = Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) as Record<
    string,
    string | boolean | undefined
  >;

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 text-slate-900 select-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-18 · S01–S02 · Establishment Scope
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1 flex items-center gap-2">
              <Building2 className="h-7 w-7 text-slate-700" />
              Establishment Scope
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton entity="config" filter={activeFilter} selectedIds={selectedIds} />
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Establishment
            </button>
          </div>
        </header>

        {/* Filters */}
        <FilterToolbar
          search={search}
          onSearchChange={(s) => {
            setSearch(s);
            setPage(1);
          }}
          filters={filters}
          onFilterChange={handleFilterChange}
          fields={filterFields}
          onReset={handleReset}
          showDeleted={showDeleted}
          onToggleDeleted={(v) => {
            setShowDeleted(v);
            setPage(1);
          }}
          placeholder="Search by establishment name or LMRA ID..."
        />

        {/* Table */}
        <EntityTable<EstablishmentConfig>
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
          emptyMessage="No establishments configured yet. Click 'Add Establishment' to get started."
          actions={(row) => (
            <>
              <button
                type="button"
                title="View"
                onClick={() => setViewItem(row)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
              {!row.isDeleted && (
                <button
                  type="button"
                  title="Edit"
                  onClick={() => openEdit(row)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
              {!row.isDeleted ? (
                <button
                  type="button"
                  title="Archive"
                  onClick={() => setArchiveTarget(row)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                >
                  <Archive className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  title="Restore"
                  onClick={() => setRestoreTarget(row)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                title="Delete"
                onClick={() => setDeleteTarget(row)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        />

        {/* Bulk Toolbar */}
        <BulkToolbar
          selectedIds={selectedIds}
          onClear={() => setSelectedIds([])}
          entity="config"
          filter={activeFilter}
          onActionComplete={loadData}
          showArchive={!showDeleted}
          showRestore={showDeleted}
          showDelete
        />

        {/* View Modal */}
        <DetailsModal
          open={viewItem !== null}
          onOpenChange={(o) => {
            if (!o) setViewItem(null);
          }}
          title="Establishment Details"
          data={viewItem as Record<string, unknown> | null}
          fields={[
            { key: 'establishmentName', label: 'Establishment Name' },
            { key: 'sector', label: 'Sector' },
            { key: 'sizeBracket', label: 'Size Bracket' },
            { key: 'bahrainiHeadcount', label: 'Bahraini Headcount' },
            { key: 'totalHeadcount', label: 'Total Headcount' },
            {
              key: 'bahrainiHeadcount',
              label: 'Current Ratio',
              render: () => (viewItem ? `${ratioPct(viewItem)}%` : '—'),
            },
            { key: 'lmraEstablishmentId', label: 'LMRA Establishment ID' },
            { key: 'legalEntityId', label: 'Legal Entity ID' },
            {
              key: 'isInScope',
              label: 'In Scope',
              render: (v) => (v ? '✓ Yes' : '✗ No'),
            },
            {
              key: 'isGovernmentTenderEligible',
              label: 'Tender Eligible',
              render: (v) => (v ? '✓ Yes' : '✗ No'),
            },
          ]}
        />

        {/* Create / Edit Modal */}
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-slate-600" />
                  {formItem ? 'Edit Establishment' : 'Add Establishment'}
                </h3>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Establishment Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={formValues.establishmentName}
                    onChange={(e) =>
                      setFormValues((f) => ({ ...f, establishmentName: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                    placeholder="e.g. ABC Manufacturing Co. WLL"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Sector <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formValues.sector}
                    onChange={(e) => setFormValues((f) => ({ ...f, sector: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  >
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Size Bracket <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formValues.sizeBracket}
                    onChange={(e) => setFormValues((f) => ({ ...f, sizeBracket: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  >
                    {SIZE_BRACKETS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Bahraini Headcount
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formValues.bahrainiHeadcount}
                    onChange={(e) =>
                      setFormValues((f) => ({ ...f, bahrainiHeadcount: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Total Headcount
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formValues.totalHeadcount}
                    onChange={(e) =>
                      setFormValues((f) => ({ ...f, totalHeadcount: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    LMRA Establishment ID
                  </label>
                  <input
                    value={formValues.lmraEstablishmentId}
                    onChange={(e) =>
                      setFormValues((f) => ({ ...f, lmraEstablishmentId: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none font-mono"
                    placeholder="e.g. BH-LMRA-12345"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Legal Entity ID (optional)
                  </label>
                  <input
                    value={formValues.legalEntityId}
                    onChange={(e) =>
                      setFormValues((f) => ({ ...f, legalEntityId: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none font-mono"
                    placeholder="UUID or leave blank for tenant-level"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 border-t border-slate-100 px-6 py-4 bg-slate-50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 shadow-sm"
                >
                  {submitting ? 'Saving...' : formItem ? 'Save Changes' : 'Create Establishment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Dialogs */}
        <ConfirmDialog
          open={archiveTarget !== null}
          onOpenChange={(o) => {
            if (!o) setArchiveTarget(null);
          }}
          title="Archive Establishment"
          desc={`Are you sure you want to archive the establishment config for "${archiveTarget?.establishmentName}" (${archiveTarget?.sector} sector, Size Bracket: ${archiveTarget?.sizeBracket})? It will be hidden from active compliance monitoring but can be restored later.`}
          variant="warning"
          confirmText="Archive"
          onConfirm={() => handleAction('archive', archiveTarget!.id)}
        />
        <ConfirmDialog
          open={restoreTarget !== null}
          onOpenChange={(o) => {
            if (!o) setRestoreTarget(null);
          }}
          title="Restore Establishment"
          desc={`Are you sure you want to restore the establishment config for "${restoreTarget?.establishmentName}" (${restoreTarget?.sector} sector, Size Bracket: ${restoreTarget?.sizeBracket}) back to active compliance monitoring?`}
          variant="info"
          confirmText="Restore"
          onConfirm={() => handleAction('restore', restoreTarget!.id)}
        />
        <ConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(o) => {
            if (!o) setDeleteTarget(null);
          }}
          title="Delete Establishment"
          desc={`Are you sure you want to permanently delete the establishment config for "${deleteTarget?.establishmentName}"? All compliance metadata and headcount history for this establishment will be permanently deleted. This action cannot be undone.`}
          variant="danger"
          confirmText="Delete Permanently"
          onConfirm={() => handleAction('delete', deleteTarget!.id)}
        />
      </div>
    </main>
  );
}
