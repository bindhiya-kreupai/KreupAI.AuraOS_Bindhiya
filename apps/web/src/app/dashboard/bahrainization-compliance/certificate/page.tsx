'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Award,
  Plus,
  Eye,
  Trash2,
  FileCheck,
  PenLine,
  AlertOctagon,
  CheckCircle,
  XCircle,
  Lock,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { EntityTable, type Column } from '../components/EntityTable';
import { FilterToolbar, type FilterField } from '../components/FilterToolbar';
import { BulkToolbar } from '../components/BulkToolbar';
import { DetailsModal } from '../components/DetailsModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ExportButton } from '../components/ExportButton';
import { CertStatusBadge } from '../components/RAGBadge';

interface Certificate {
  id: string;
  period: string;
  entitiesInScope: number;
  entitiesAtTarget: number;
  entitiesLmraGated: number;
  entitiesTenderEligible: number;
  totalMissedHires: number;
  artificialRiskCount: number;
  gatingReason: string | null;
  status: string;
  signedAt: string | null;
  signedBy: string | null;
  generatedAt: string | null;
  attestationsJson: Array<{ field: string; value: string }>;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

const filterFields: FilterField[] = [
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'DRAFT', label: 'Draft' },
      { value: 'SIGNED', label: 'Signed' },
    ],
  },
  { name: 'periodFrom', label: 'Period From', type: 'date' },
  { name: 'periodTo', label: 'Period To', type: 'date' },
];

const ATTESTATION_FIELDS = [
  {
    field: 'bahrainization_data_accurate',
    label: 'The Bahrainization headcount data is accurate and verified',
  },
  { field: 'no_ghost_employees', label: 'No ghost or fictitious Bahraini employees are counted' },
  { field: 'sio_registered_verified', label: 'All counted Bahrainis are SIO-registered' },
  {
    field: 'wages_paid_verified',
    label: 'All counted Bahrainis receive actual wages per their employment contract',
  },
  { field: 'lmra_compliance_confirmed', label: 'LMRA establishment data matches this certificate' },
];

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function CertificatePage() {
  const [data, setData] = React.useState<Certificate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [filters, setFilters] = React.useState<Record<string, string>>({
    status: '',
    periodFrom: '',
    periodTo: '',
  });
  const [sort, setSort] = React.useState<Array<{ field: string; dir: 'asc' | 'desc' }>>([
    { field: 'period', dir: 'desc' },
  ]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const [viewItem, setViewItem] = React.useState<Certificate | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Certificate | null>(null);

  // Generate modal
  const [generateOpen, setGenerateOpen] = React.useState(false);
  const [generatePeriod, setGeneratePeriod] = React.useState(periodNow());
  const [generating, setGenerating] = React.useState(false);

  // Sign modal
  const [signTarget, setSignTarget] = React.useState<Certificate | null>(null);
  const [attestations, setAttestations] = React.useState<Record<string, boolean>>({});
  const [signing, setSigning] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (filters.status) params.set('status', filters.status);
      if (filters.periodFrom) params.set('periodFrom', filters.periodFrom);
      if (filters.periodTo) params.set('periodTo', filters.periodTo);
      if (sort[0]) {
        params.set('sortField', sort[0].field);
        params.set('sortDir', sort[0].dir);
      }

      const res = await fetch(`/api/v1/bahrainization-compliance/certificate?${params}`);
      const payload = (await res.json()) as {
        success: boolean;
        data: { items: Certificate[]; total: number };
      };
      if (payload.success) {
        setData(payload.data.items ?? []);
        setTotal(payload.data.total ?? 0);
      } else {
        toast.error('Failed to load certificates');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading certificates');
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
    setFilters({ status: '', periodFrom: '', periodTo: '' });
    setPage(1);
  };

  const handleGenerate = async () => {
    if (!generatePeriod) {
      toast.error('Period required');
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch('/api/v1/bahrainization-compliance/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', period: generatePeriod }),
      });
      const payload = (await res.json()) as {
        success: boolean;
        data: Certificate;
        error?: { message?: string };
      };
      if (payload.success) {
        const cert = payload.data;
        if (cert.gatingReason) {
          toast.warning(`Certificate generated (BLOCKED): ${cert.gatingReason}`, {
            duration: 6000,
          });
        } else {
          toast.success('Certificate generated successfully — ready for signing');
        }
        setGenerateOpen(false);
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to generate certificate');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error generating certificate');
    } finally {
      setGenerating(false);
    }
  };

  const openSign = (cert: Certificate) => {
    if (cert.status === 'SIGNED') {
      toast.info('This certificate is already signed');
      return;
    }
    if (cert.gatingReason) {
      toast.error(`Cannot sign — blocked: ${cert.gatingReason}`);
      return;
    }
    setSignTarget(cert);
    const init: Record<string, boolean> = {};
    ATTESTATION_FIELDS.forEach((f) => {
      init[f.field] = false;
    });
    setAttestations(init);
  };

  const handleSign = async () => {
    const allAttested = ATTESTATION_FIELDS.every((f) => attestations[f.field]);
    if (!allAttested) {
      toast.error('All attestations must be confirmed before signing');
      return;
    }
    setSigning(true);
    try {
      const attestationsList = ATTESTATION_FIELDS.map((f) => ({
        field: f.field,
        value: 'ATTESTED',
      }));
      const res = await fetch('/api/v1/bahrainization-compliance/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sign',
          period: signTarget!.period,
          attestations: attestationsList,
        }),
      });
      const payload = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (payload.success) {
        toast.success('Certificate signed and locked successfully');
        setSignTarget(null);
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to sign certificate');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error signing certificate');
    } finally {
      setSigning(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/v1/bahrainization-compliance/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      const payload = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (payload.success) {
        toast.success('Certificate deleted');
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to delete');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const columns: Column<Certificate>[] = [
    {
      key: 'period',
      label: 'Period',
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-slate-900">{r.period}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (r) => <CertStatusBadge status={r.status} />,
    },
    {
      key: 'gatingReason',
      label: 'Blocking Reason',
      render: (r) =>
        r.gatingReason ? (
          <span className="inline-flex items-center gap-1 text-xs text-rose-700 font-semibold">
            <Lock className="h-3.5 w-3.5" /> Blocked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold">
            <CheckCircle className="h-3.5 w-3.5" /> Clear
          </span>
        ),
    },
    {
      key: 'entitiesInScope',
      label: 'In Scope',
      render: (r) => <span className="font-mono">{r.entitiesInScope}</span>,
    },
    {
      key: 'entitiesAtTarget',
      label: 'At Target',
      render: (r) => (
        <span className="font-mono text-emerald-700 font-semibold">{r.entitiesAtTarget}</span>
      ),
    },
    {
      key: 'entitiesLmraGated',
      label: 'LMRA-Gated',
      render: (r) => (
        <span
          className={`font-mono font-semibold ${r.entitiesLmraGated > 0 ? 'text-rose-700' : 'text-emerald-700'}`}
        >
          {r.entitiesLmraGated}
        </span>
      ),
    },
    {
      key: 'totalMissedHires',
      label: 'Missed Hires',
      render: (r) => (
        <span
          className={`font-mono ${r.totalMissedHires > 0 ? 'text-amber-700 font-semibold' : 'text-slate-500'}`}
        >
          {r.totalMissedHires}
        </span>
      ),
    },
    {
      key: 'artificialRiskCount',
      label: 'Artificial Risk',
      render: (r) => (
        <span
          className={`font-mono ${r.artificialRiskCount > 0 ? 'text-rose-700 font-semibold' : 'text-slate-500'}`}
        >
          {r.artificialRiskCount}
        </span>
      ),
    },
    {
      key: 'generatedAt',
      label: 'Generated',
      sortable: true,
      render: (r) => (
        <span className="font-mono text-xs">{r.generatedAt?.slice(0, 10) ?? '—'}</span>
      ),
    },
    {
      key: 'signedAt',
      label: 'Signed',
      sortable: true,
      render: (r) => <span className="font-mono text-xs">{r.signedAt?.slice(0, 10) ?? '—'}</span>,
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
              EPIC-18 · S12 / S20 · Monthly Certificate
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1 flex items-center gap-2">
              <Award className="h-7 w-7 text-slate-700" />
              Bahrainization Certificates
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton entity="certificate" filter={activeFilter} selectedIds={selectedIds} />
            <button
              type="button"
              onClick={() => {
                setGeneratePeriod(periodNow());
                setGenerateOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Generate Certificate
            </button>
          </div>
        </header>

        {/* Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 leading-relaxed shadow-sm">
          <p className="font-bold text-slate-800 mb-1">Certificate Workflow</p>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold">
              1. Configure Establishments
            </span>
            <span className="text-slate-400">→</span>
            <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold">
              2. Seed Targets
            </span>
            <span className="text-slate-400">→</span>
            <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold">
              3. Record Hires + Link Evidence
            </span>
            <span className="text-slate-400">→</span>
            <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold">
              4. Take Snapshots
            </span>
            <span className="text-slate-400">→</span>
            <span className="rounded-full bg-amber-50 border border-amber-200 text-amber-800 px-2 py-1 font-semibold">
              5. Generate Certificate
            </span>
            <span className="text-slate-400">→</span>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-1 font-semibold">
              6. Sign Certificate
            </span>
          </div>
        </div>

        {/* Filters */}
        <FilterToolbar
          search=""
          onSearchChange={() => {}}
          filters={filters}
          onFilterChange={handleFilterChange}
          fields={filterFields}
          onReset={handleReset}
          showDeleted={false}
          onToggleDeleted={() => {}}
          placeholder=""
        />

        {/* Table */}
        <EntityTable<Certificate>
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
          emptyMessage="No certificates generated yet. Complete the workflow above, then generate your first certificate."
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
              {row.status === 'DRAFT' && !row.gatingReason && (
                <button
                  type="button"
                  title="Sign"
                  onClick={() => openSign(row)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <PenLine className="h-4 w-4" />
                </button>
              )}
              {row.gatingReason && (
                <span title={row.gatingReason} className="rounded-lg p-1.5 text-rose-400">
                  <Lock className="h-4 w-4" />
                </span>
              )}
              {row.status === 'SIGNED' && (
                <span className="rounded-lg p-1.5 text-emerald-600">
                  <FileCheck className="h-4 w-4" />
                </span>
              )}
              {row.status !== 'SIGNED' && (
                <button
                  type="button"
                  title="Delete"
                  onClick={() => setDeleteTarget(row)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        />

        <BulkToolbar
          selectedIds={selectedIds}
          onClear={() => setSelectedIds([])}
          entity="certificate"
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
          title="Certificate Details"
          data={viewItem as Record<string, unknown> | null}
          fields={[
            { key: 'period', label: 'Period' },
            {
              key: 'status',
              label: 'Status',
              render: (v) => <CertStatusBadge status={String(v ?? '')} />,
            },
            {
              key: 'gatingReason',
              label: 'Blocking Reason',
              render: (v) => (v ? String(v) : '✓ No blocks'),
            },
            { key: 'entitiesInScope', label: 'Entities In Scope' },
            { key: 'entitiesAtTarget', label: 'Entities At Target (GREEN)' },
            { key: 'entitiesLmraGated', label: 'LMRA-Gated Entities' },
            { key: 'entitiesTenderEligible', label: 'Tender-Eligible Entities' },
            { key: 'totalMissedHires', label: 'Total Missed Bahraini Hires' },
            { key: 'artificialRiskCount', label: 'Artificial-Risk Hires' },
            {
              key: 'generatedAt',
              label: 'Generated At',
              render: (v) => (v ? new Date(String(v)).toLocaleString() : '—'),
            },
            {
              key: 'signedAt',
              label: 'Signed At',
              render: (v) => (v ? new Date(String(v)).toLocaleString() : '—'),
            },
            { key: 'signedBy', label: 'Signed By' },
          ]}
          renderExtra={(d) =>
            Array.isArray(d.attestationsJson) && (d.attestationsJson as unknown[]).length > 0 ? (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Attestations
                </h4>
                <div className="space-y-2">
                  {(d.attestationsJson as Array<{ field: string; value: string }>).map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="font-mono text-slate-500">{a.field}</span>
                      <span className="font-semibold text-emerald-700">{a.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          }
        />

        {/* Generate Modal */}
        {generateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-slate-700" />
                  Generate Certificate
                </h3>
                <button
                  type="button"
                  onClick={() => setGenerateOpen(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Period (YYYY-MM) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="month"
                    value={generatePeriod}
                    onChange={(e) => setGeneratePeriod(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-mono focus:border-slate-400 focus:outline-none"
                  />
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 leading-relaxed">
                  <strong>Pre-requisites:</strong> Establishments configured, sector targets seeded,
                  ratio snapshots taken, artificial-risk assessments run, SIO/payroll evidence
                  linked. Certificate will be BLOCKED if any LMRA-gated entities or high-risk hires
                  exist.
                </div>
              </div>
              <div className="flex justify-end gap-2.5 border-t border-slate-100 px-6 py-4 bg-slate-50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setGenerateOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sign Modal */}
        {signTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl my-4">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <PenLine className="h-5 w-5 text-emerald-700" />
                  Sign Certificate — {signTarget.period}
                </h3>
                <button
                  type="button"
                  onClick={() => setSignTarget(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  By signing this certificate, you legally attest to the accuracy of all
                  Bahrainization data for the period{' '}
                  <strong className="text-slate-800">{signTarget.period}</strong>. All attestations
                  below are mandatory.
                </p>
                <div className="space-y-2">
                  {ATTESTATION_FIELDS.map((f) => (
                    <label
                      key={f.field}
                      className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${attestations[f.field] ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <input
                        type="checkbox"
                        checked={attestations[f.field] ?? false}
                        onChange={(e) =>
                          setAttestations((a) => ({ ...a, [f.field]: e.target.checked }))
                        }
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-emerald-700"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800 leading-snug">{f.label}</p>
                        {attestations[f.field] && (
                          <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                            ✓ Attested
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                <div className="rounded-xl bg-slate-900 p-3 text-xs text-slate-300 leading-relaxed">
                  <AlertOctagon className="h-3.5 w-3.5 inline mr-1 text-amber-400" />
                  <strong>Legal Notice:</strong> This digital attestation is legally binding under
                  Bahrain Labour Law and LMRA regulations. False attestation may result in
                  penalties, permit revocation, and legal prosecution.
                </div>
              </div>
              <div className="flex justify-end gap-2.5 border-t border-slate-100 px-6 py-4 bg-slate-50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setSignTarget(null)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSign}
                  disabled={signing || !ATTESTATION_FIELDS.every((f) => attestations[f.field])}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  {signing ? (
                    'Signing...'
                  ) : (
                    <>
                      <PenLine className="h-4 w-4" />
                      Sign & Lock Certificate
                    </>
                  )}
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
          title="Delete Certificate"
          desc={`Permanently delete the ${deleteTarget?.period} certificate? Only DRAFT certificates should be deleted.`}
          variant="danger"
          confirmText="Delete Permanently"
          onConfirm={() => handleDelete(deleteTarget!.id)}
        />
      </div>
    </main>
  );
}
