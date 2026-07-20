'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Target, Plus, Eye, Pencil, Trash2, Archive, Database, RotateCcw } from 'lucide-react';
import { EntityTable, type Column } from '../components/EntityTable';
import { FilterToolbar, type FilterField } from '../components/FilterToolbar';
import { BulkToolbar } from '../components/BulkToolbar';
import { DetailsModal } from '../components/DetailsModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ExportButton } from '../components/ExportButton';

interface TargetRecord {
  id: string;
  sector: string;
  sizeBracket: string;
  targetRatioPct: number;
  tenderEligibilityMinPct: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  basis: string | null;
  status: string;
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
];

const emptyForm = {
  sector: 'PRIVATE',
  sizeBracket: 'SMALL',
  targetRatioPct: '10',
  tenderEligibilityMinPct: '50',
  effectiveFrom: new Date().toISOString().slice(0, 10),
  effectiveTo: '',
  basis: '',
};

export default function TargetsPage() {
  const [data, setData] = React.useState<TargetRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState<Record<string, string>>({
    sector: '',
    sizeBracket: '',
  });
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [sort, setSort] = React.useState<Array<{ field: string; dir: 'asc' | 'desc' }>>([
    { field: 'sector', dir: 'asc' },
  ]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const [viewItem, setViewItem] = React.useState<TargetRecord | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [formItem, setFormItem] = React.useState<TargetRecord | null>(null);
  const [formValues, setFormValues] = React.useState(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);
  const [seeding, setSeeding] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<TargetRecord | null>(null);
  const [archiveTarget, setArchiveTarget] = React.useState<TargetRecord | null>(null);
  const [restoreTarget, setRestoreTarget] = React.useState<TargetRecord | null>(null);

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
      if (sort[0]) {
        params.set('sortField', sort[0].field);
        params.set('sortDir', sort[0].dir);
      }

      const res = await fetch(`/api/v1/bahrainization-compliance/targets?${params}`);
      const payload = (await res.json()) as {
        success: boolean;
        data: { items: TargetRecord[]; total: number };
      };
      if (payload.success) {
        setData(payload.data.items ?? []);
        setTotal(payload.data.total ?? 0);
      } else {
        toast.error('Failed to load targets');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading targets');
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
    setFilters({ sector: '', sizeBracket: '' });
    setShowDeleted(false);
    setPage(1);
  };

  const openCreate = () => {
    setFormItem(null);
    setFormValues(emptyForm);
    setFormOpen(true);
  };
  const openEdit = (row: TargetRecord) => {
    setFormItem(row);
    setFormValues({
      sector: row.sector,
      sizeBracket: row.sizeBracket,
      targetRatioPct: String(row.targetRatioPct),
      tenderEligibilityMinPct: String(row.tenderEligibilityMinPct),
      effectiveFrom: row.effectiveFrom?.slice(0, 10) ?? '',
      effectiveTo: row.effectiveTo?.slice(0, 10) ?? '',
      basis: row.basis ?? '',
    });
    setFormOpen(true);
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/v1/bahrainization-compliance/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed-defaults' }),
      });
      const payload = (await res.json()) as {
        success: boolean;
        data: { created: string[] };
        error?: { message?: string };
      };
      if (payload.success) {
        toast.success(`Seeded ${payload.data.created.length} default targets`);
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to seed');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error seeding defaults');
    } finally {
      setSeeding(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !formValues.sector ||
      !formValues.sizeBracket ||
      !formValues.targetRatioPct ||
      !formValues.effectiveFrom
    ) {
      toast.error('Sector, size bracket, target ratio, and effective from are required');
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        action: formItem ? 'update' : 'create',
        ...(formItem ? { id: formItem.id } : {}),
        sector: formValues.sector,
        sizeBracket: formValues.sizeBracket,
        targetRatioPct: Number(formValues.targetRatioPct),
        tenderEligibilityMinPct: Number(formValues.tenderEligibilityMinPct || 50),
        effectiveFrom: formValues.effectiveFrom,
        effectiveTo: formValues.effectiveTo || undefined,
        basis: formValues.basis || undefined,
      };
      const res = await fetch('/api/v1/bahrainization-compliance/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (payload.success) {
        toast.success(formItem ? 'Target updated' : 'Target created');
        setFormOpen(false);
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to save');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error saving target');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (action: string, id: string) => {
    try {
      const res = await fetch('/api/v1/bahrainization-compliance/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id }),
      });
      const payload = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (payload.success) {
        toast.success(`Target ${action}d`);
        loadData();
      } else {
        toast.error(payload.error?.message ?? `Failed to ${action}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const columns: Column<TargetRecord>[] = [
    {
      key: 'sector',
      label: 'Sector',
      sortable: true,
      render: (r) => <span className="font-semibold">{r.sector}</span>,
    },
    { key: 'sizeBracket', label: 'Size', sortable: true },
    {
      key: 'targetRatioPct',
      label: 'Target %',
      sortable: true,
      render: (r) => (
        <span className="font-mono font-bold text-slate-900">{r.targetRatioPct}%</span>
      ),
    },
    {
      key: 'tenderEligibilityMinPct',
      label: 'Tender Min %',
      render: (r) => <span className="font-mono">{r.tenderEligibilityMinPct}%</span>,
    },
    {
      key: 'effectiveFrom',
      label: 'Effective From',
      sortable: true,
      render: (r) => <span className="font-mono text-xs">{r.effectiveFrom?.slice(0, 10)}</span>,
    },
    {
      key: 'effectiveTo',
      label: 'Effective To',
      render: (r) => (
        <span className="font-mono text-xs">{r.effectiveTo?.slice(0, 10) ?? 'Open-ended'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${r.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}
        >
          {r.status}
        </span>
      ),
    },
    {
      key: 'basis',
      label: 'Basis',
      render: (r) => <span className="text-xs text-slate-500">{r.basis ?? '—'}</span>,
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
              EPIC-18 · S04 / S15 · Sector Targets
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1 flex items-center gap-2">
              <Target className="h-7 w-7 text-slate-700" />
              Sector × Size Targets
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton entity="targets" filter={activeFilter} selectedIds={selectedIds} />
            <button
              type="button"
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <Database className="h-4 w-4" />
              {seeding ? 'Seeding...' : 'Seed Defaults'}
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Target
            </button>
          </div>
        </header>

        {/* Info Box */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed">
          <strong className="font-bold text-slate-800">LMRA Default Targets:</strong>{' '}
          PRIVATE/SMALL=10%, PRIVATE/MEDIUM=15%, PRIVATE/LARGE=20%, PRIVATE/GIANT=25%. Government
          Tender eligibility requires minimum 50%. Targets support effective dating for historical
          accuracy. Use "Seed Defaults" to seed LMRA baseline targets.
        </div>

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
          placeholder="Search by sector or basis..."
        />

        {/* Table */}
        <EntityTable<TargetRecord>
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
          emptyMessage="No targets configured. Use 'Seed Defaults' to populate LMRA baseline targets."
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
              <button
                type="button"
                title="Edit"
                onClick={() => openEdit(row)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
              {row.status === 'ARCHIVED' ? (
                <button
                  type="button"
                  title="Restore"
                  onClick={() => setRestoreTarget(row)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  title="Archive"
                  onClick={() => setArchiveTarget(row)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                >
                  <Archive className="h-4 w-4" />
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

        <BulkToolbar
          selectedIds={selectedIds}
          onClear={() => setSelectedIds([])}
          entity="targets"
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
          title="Target Details"
          data={viewItem as Record<string, unknown> | null}
          fields={[
            { key: 'sector', label: 'Sector' },
            { key: 'sizeBracket', label: 'Size Bracket' },
            { key: 'targetRatioPct', label: 'Target Ratio %', render: (v) => `${v}%` },
            { key: 'tenderEligibilityMinPct', label: 'Tender Min %', render: (v) => `${v}%` },
            {
              key: 'effectiveFrom',
              label: 'Effective From',
              render: (v) => (v ? String(v).slice(0, 10) : '—'),
            },
            {
              key: 'effectiveTo',
              label: 'Effective To',
              render: (v) => (v ? String(v).slice(0, 10) : 'Open-ended'),
            },
            { key: 'status', label: 'Status' },
            { key: 'basis', label: 'Regulatory Basis' },
          ]}
        />

        {/* Form Modal */}
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {formItem ? 'Edit Target' : 'Add Target'}
                </h3>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 grid sm:grid-cols-2 gap-5">
                {[
                  { label: 'Sector', key: 'sector', type: 'select', opts: SECTORS },
                  {
                    label: 'Size Bracket',
                    key: 'sizeBracket',
                    type: 'select',
                    opts: SIZE_BRACKETS,
                  },
                  {
                    label: 'Target Ratio %',
                    key: 'targetRatioPct',
                    type: 'number',
                    placeholder: '10',
                  },
                  {
                    label: 'Tender Eligibility Min %',
                    key: 'tenderEligibilityMinPct',
                    type: 'number',
                    placeholder: '50',
                  },
                  { label: 'Effective From', key: 'effectiveFrom', type: 'date' },
                  { label: 'Effective To (blank = open)', key: 'effectiveTo', type: 'date' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      {f.label}
                    </label>
                    {f.type === 'select' ? (
                      <select
                        value={(formValues as Record<string, string>)[f.key]}
                        onChange={(e) =>
                          setFormValues((fv) => ({ ...fv, [f.key]: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                      >
                        {f.opts?.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type}
                        value={(formValues as Record<string, string>)[f.key]}
                        onChange={(e) =>
                          setFormValues((fv) => ({ ...fv, [f.key]: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                        placeholder={f.placeholder}
                      />
                    )}
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Regulatory Basis
                  </label>
                  <input
                    value={formValues.basis}
                    onChange={(e) => setFormValues((fv) => ({ ...fv, basis: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                    placeholder="e.g. LMRA default for SMALL private establishments"
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
                  className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : formItem ? 'Save Changes' : 'Create Target'}
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={archiveTarget !== null}
          onOpenChange={(o) => {
            if (!o) setArchiveTarget(null);
          }}
          title="Archive Target"
          desc={`Are you sure you want to archive the target for ${archiveTarget?.sector} sector (${archiveTarget?.sizeBracket} bracket) with ${archiveTarget?.targetRatioPct}% target ratio? This target will be hidden from active records but can be restored.`}
          variant="warning"
          confirmText="Archive"
          onConfirm={() => handleAction('archive', archiveTarget!.id)}
        />
        <ConfirmDialog
          open={restoreTarget !== null}
          onOpenChange={(o) => {
            if (!o) setRestoreTarget(null);
          }}
          title="Restore Target"
          desc={`Are you sure you want to restore the target for ${restoreTarget?.sector} sector (${restoreTarget?.sizeBracket} bracket) with ${restoreTarget?.targetRatioPct}% target ratio back to Active?`}
          variant="info"
          confirmText="Restore"
          onConfirm={() => handleAction('restore', restoreTarget!.id)}
        />
        <ConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(o) => {
            if (!o) setDeleteTarget(null);
          }}
          title="Delete Target"
          desc={`Are you sure you want to permanently delete the target for ${deleteTarget?.sector} sector (${deleteTarget?.sizeBracket} bracket) with ${deleteTarget?.targetRatioPct}% target ratio? This action is irreversible and cannot be undone.`}
          variant="danger"
          confirmText="Delete Permanently"
          onConfirm={() => handleAction('delete', deleteTarget!.id)}
        />
      </div>
    </main>
  );
}
