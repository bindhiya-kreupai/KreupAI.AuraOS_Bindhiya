'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Camera, Eye, Trash2, CheckCircle, XCircle, Plus, AlertTriangle } from 'lucide-react';
import { EntityTable, type Column } from '../components/EntityTable';
import { FilterToolbar, type FilterField } from '../components/FilterToolbar';
import { BulkToolbar } from '../components/BulkToolbar';
import { DetailsModal } from '../components/DetailsModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ExportButton } from '../components/ExportButton';
import { RAGBadge } from '../components/RAGBadge';

interface Snapshot {
  id: string;
  legalEntityId: string | null;
  snapshotDate: string;
  bahrainiHeadcount: number;
  totalHeadcount: number;
  ratioPct: number;
  targetRatioPct: number;
  gapPct: number;
  ragStatus: string;
  missedHires: number;
  lmraGated: boolean;
  tenderEligible: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

const filterFields: FilterField[] = [
  {
    name: 'ragStatus',
    label: 'RAG Status',
    type: 'select',
    options: [
      { value: 'GREEN', label: 'Green (At Target)' },
      { value: 'AMBER', label: 'Amber (Near Target)' },
      { value: 'RED', label: 'Red (LMRA-Gated)' },
    ],
  },
  {
    name: 'lmraGated',
    label: 'LMRA Status',
    type: 'select',
    options: [
      { value: 'true', label: 'LMRA Gated' },
      { value: 'false', label: 'LMRA Clear' },
    ],
  },
  {
    name: 'tenderEligible',
    label: 'Tender Eligible',
    type: 'select',
    options: [
      { value: 'true', label: 'Eligible' },
      { value: 'false', label: 'Ineligible' },
    ],
  },
  { name: 'dateFrom', label: 'Date From', type: 'date' },
  { name: 'dateTo', label: 'Date To', type: 'date' },
];

export default function SnapshotsPage() {
  const [data, setData] = React.useState<Snapshot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState<Record<string, string>>({
    ragStatus: '',
    lmraGated: '',
    tenderEligible: '',
    dateFrom: '',
    dateTo: '',
  });
  const [showDeleted] = React.useState(false);
  const [sort, setSort] = React.useState<Array<{ field: string; dir: 'asc' | 'desc' }>>([
    { field: 'snapshotDate', dir: 'desc' },
  ]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const [viewItem, setViewItem] = React.useState<Snapshot | null>(null);
  const [takeOpen, setTakeOpen] = React.useState(false);
  const [takeDate, setTakeDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [takeLegalEntityId, setTakeLegalEntityId] = React.useState('');
  const [taking, setTaking] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Snapshot | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (filters.ragStatus) params.set('ragStatus', filters.ragStatus);
      if (filters.lmraGated) params.set('lmraGated', filters.lmraGated);
      if (filters.tenderEligible) params.set('tenderEligible', filters.tenderEligible);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      if (sort[0]) {
        params.set('sortField', sort[0].field);
        params.set('sortDir', sort[0].dir);
      }

      const res = await fetch(`/api/v1/bahrainization-compliance/snapshots?${params}`);
      const payload = (await res.json()) as {
        success: boolean;
        data: { items: Snapshot[]; total: number };
      };
      if (payload.success) {
        setData(payload.data.items ?? []);
        setTotal(payload.data.total ?? 0);
      } else {
        toast.error('Failed to load snapshots');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading snapshots');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters, sort]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters((f) => ({ ...f, [name]: value }));
    setPage(1);
  };
  const handleReset = () => {
    setFilters({ ragStatus: '', lmraGated: '', tenderEligible: '', dateFrom: '', dateTo: '' });
    setPage(1);
  };

  const handleTakeSnapshot = async () => {
    if (!takeDate) {
      toast.error('Snapshot date required');
      return;
    }
    setTaking(true);
    try {
      const res = await fetch('/api/v1/bahrainization-compliance/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'take',
          snapshotDate: takeDate,
          legalEntityId: takeLegalEntityId || undefined,
        }),
      });
      const payload = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (payload.success) {
        toast.success('Snapshot taken successfully');
        setTakeOpen(false);
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to take snapshot');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error taking snapshot');
    } finally {
      setTaking(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/v1/bahrainization-compliance/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      const payload = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (payload.success) {
        toast.success('Snapshot deleted');
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to delete');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const columns: Column<Snapshot>[] = [
    {
      key: 'snapshotDate',
      label: 'Snapshot Date',
      sortable: true,
      render: (r) => (
        <span className="font-mono text-sm font-semibold">{r.snapshotDate?.slice(0, 10)}</span>
      ),
    },
    {
      key: 'ragStatus',
      label: 'RAG',
      sortable: true,
      render: (r) => <RAGBadge status={r.ragStatus} />,
    },
    {
      key: 'ratioPct',
      label: 'Ratio %',
      sortable: true,
      render: (r) => <span className="font-mono font-bold">{r.ratioPct}%</span>,
    },
    {
      key: 'targetRatioPct',
      label: 'Target %',
      sortable: true,
      render: (r) => <span className="font-mono">{r.targetRatioPct}%</span>,
    },
    {
      key: 'gapPct',
      label: 'Gap',
      sortable: true,
      render: (r) => (
        <span
          className={`font-mono font-semibold ${r.gapPct >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
        >
          {r.gapPct > 0 ? '+' : ''}
          {r.gapPct}pp
        </span>
      ),
    },
    { key: 'bahrainiHeadcount', label: 'Bahraini HC', sortable: true },
    { key: 'totalHeadcount', label: 'Total HC', sortable: true },
    {
      key: 'missedHires',
      label: 'Missed Hires',
      render: (r) => (
        <span
          className={`font-mono ${r.missedHires > 0 ? 'text-amber-700 font-semibold' : 'text-slate-500'}`}
        >
          {r.missedHires}
        </span>
      ),
    },
    {
      key: 'lmraGated',
      label: 'LMRA',
      render: (r) =>
        r.lmraGated ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
            <AlertTriangle className="h-3.5 w-3.5" /> GATED
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <CheckCircle className="h-3.5 w-3.5" /> Clear
          </span>
        ),
    },
    {
      key: 'tenderEligible',
      label: 'Tender',
      render: (r) =>
        r.tenderEligible ? (
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
              EPIC-18 · S03 / S10 · LMRA Gating
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1 flex items-center gap-2">
              <Camera className="h-7 w-7 text-slate-700" />
              Ratio Snapshots
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton entity="snapshots" filter={activeFilter} selectedIds={selectedIds} />
            <button
              type="button"
              onClick={() => setTakeOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Take Snapshot
            </button>
          </div>
        </header>

        {/* Info */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs text-amber-800 leading-relaxed">
          <strong className="font-bold">Important:</strong> Snapshots capture the current
          Bahrainization ratio from the establishment config. LMRA gating is applied automatically
          when ratio is below target by &gt;2pp (RED band). Tender eligibility requires a minimum
          50% ratio. Snapshots are point-in-time records — they do not change retroactively.
          Configure establishments and seed targets before taking snapshots.
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
          onToggleDeleted={() => {}}
          placeholder="Filter snapshots..."
        />

        {/* Table */}
        <EntityTable<Snapshot>
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
          emptyMessage="No snapshots taken yet. Configure establishments, seed targets, then take a snapshot."
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
          entity="snapshots"
          filter={activeFilter}
          onActionComplete={loadData}
          showArchive={false}
          showRestore={false}
          showDelete
        />

        {/* View Modal */}
        <DetailsModal
          open={viewItem !== null}
          onOpenChange={(o) => {
            if (!o) setViewItem(null);
          }}
          title="Snapshot Details"
          data={viewItem as Record<string, unknown> | null}
          fields={[
            {
              key: 'snapshotDate',
              label: 'Snapshot Date',
              render: (v) => (v ? String(v).slice(0, 10) : '—'),
            },
            {
              key: 'ragStatus',
              label: 'RAG Status',
              render: (v) => <RAGBadge status={String(v ?? '')} />,
            },
            { key: 'ratioPct', label: 'Ratio %', render: (v) => `${v}%` },
            { key: 'targetRatioPct', label: 'Target %', render: (v) => `${v}%` },
            {
              key: 'gapPct',
              label: 'Gap to Target',
              render: (v) => `${Number(v) > 0 ? '+' : ''}${v}pp`,
            },
            { key: 'bahrainiHeadcount', label: 'Bahraini Headcount' },
            { key: 'totalHeadcount', label: 'Total Headcount' },
            { key: 'missedHires', label: 'Missed Bahraini Hires' },
            {
              key: 'lmraGated',
              label: 'LMRA Gated',
              render: (v) => (v ? '⛔ GATED — Work permits blocked' : '✓ Clear'),
            },
            {
              key: 'tenderEligible',
              label: 'Tender Eligible',
              render: (v) => (v ? '✓ Eligible (≥50% ratio)' : '✗ Ineligible'),
            },
            { key: 'legalEntityId', label: 'Legal Entity ID' },
          ]}
        />

        {/* Take Snapshot Modal */}
        {takeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="text-lg font-bold text-slate-900">Take Snapshot</h3>
                <button
                  type="button"
                  onClick={() => setTakeOpen(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Snapshot Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={takeDate}
                    onChange={(e) => setTakeDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Legal Entity ID (leave blank for tenant-level)
                  </label>
                  <input
                    type="text"
                    value={takeLegalEntityId}
                    onChange={(e) => setTakeLegalEntityId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-mono focus:border-slate-400 focus:outline-none"
                    placeholder="UUID or blank for tenant level"
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The snapshot will compute ratio from the current establishment config and apply
                  the applicable sector target for the snapshot date.
                </p>
              </div>
              <div className="flex justify-end gap-2.5 border-t border-slate-100 px-6 py-4 bg-slate-50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setTakeOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTakeSnapshot}
                  disabled={taking}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {taking ? 'Taking...' : 'Take Snapshot'}
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(o) => {
            if (!o) setDeleteTarget(null);
          }}
          title="Delete Snapshot"
          desc={`Permanently delete the snapshot from ${deleteTarget?.snapshotDate?.slice(0, 10)}? This cannot be undone.`}
          variant="danger"
          confirmText="Delete"
          onConfirm={() => handleDelete(deleteTarget!.id)}
        />
      </div>
    </main>
  );
}
