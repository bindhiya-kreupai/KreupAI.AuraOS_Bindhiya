'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  FileCheck,
  Plus,
  Eye,
  Trash2,
  RotateCcw,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  User,
} from 'lucide-react';
import { EntityTable, type Column } from '../components/EntityTable';
import { FilterToolbar, type FilterField } from '../components/FilterToolbar';
import { BulkToolbar } from '../components/BulkToolbar';
import { DetailsModal } from '../components/DetailsModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ExportButton } from '../components/ExportButton';

interface SignedByUser {
  id: string;
  name: string;
  email: string;
}

interface Certificate {
  id: string;
  period: string;
  status: string;
  punchesTotal: number;
  missingPunchCount: number;
  lateCount: number;
  regularizationsPending: number;
  fraudFlagsOpen: number;
  absconding3DayCount: number;
  consentMissingCount: number;
  gatingReason: string | null;
  generatedAt: string;
  signedAt: string | null;
  signedBy: string | null;
  attestationsJson: Array<{ field: string; value: string }> | null;
  isDeleted: boolean;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  updatedBy: string | null;
  signedByUser: SignedByUser | null;
}

const statusColor: Record<string, string> = {
  DRAFT: 'bg-amber-50 text-amber-800 border border-amber-100',
  SIGNED: 'bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold',
};

export default function CertificatesPage() {
  const [data, setData] = React.useState<Certificate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Search & Filtering
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState<Record<string, string>>({
    status: '',
  });
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [sort, setSort] = React.useState<Array<{ field: string; dir: 'asc' | 'desc' }>>([
    { field: 'period', dir: 'desc' },
  ]);

  // Selections
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Modals & Dialogs
  const [viewItem, setViewItem] = React.useState<Certificate | null>(null);
  const [generateOpen, setGenerateOpen] = React.useState(false);
  const [signItem, setSignItem] = React.useState<Certificate | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Certificate | null>(null);
  const [archiveTarget, setArchiveTarget] = React.useState<Certificate | null>(null);
  const [restoreTarget, setRestoreTarget] = React.useState<Certificate | null>(null);

  // Generate form values
  const [period, setPeriod] = React.useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  const [generating, setGenerating] = React.useState(false);

  // Signature check states
  const [checks, setChecks] = React.useState({
    accuracy: false,
    fraudResolved: false,
    consentsApproved: false,
  });
  const [signing, setSigning] = React.useState(false);

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

      const res = await fetch(`/api/v1/attendance-compliance/certificate?${params.toString()}`);
      const payload = await res.json();
      if (payload.success) {
        setData(payload.data?.items ?? []);
        setTotal(payload.data?.total ?? 0);
      } else {
        toast.error(payload.error?.message ?? 'Failed to load certificates');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading certificates');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, [page, pageSize, search, filters, showDeleted, sort]);

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ status: '' });
    setShowDeleted(false);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch('/api/v1/attendance-compliance/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', period }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success(`Compliance certificate generated for ${period}`);
        setGenerateOpen(false);
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to generate certificate');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signItem) return;
    if (!checks.accuracy || !checks.fraudResolved || !checks.consentsApproved) {
      toast.error('You must agree to all attestations before signing');
      return;
    }
    setSigning(true);
    try {
      const attestations = [
        { field: 'accuracy', value: 'I certify that all attendance records are correct' },
        { field: 'fraudResolved', value: 'I certify that all open fraud flags have been resolved' },
        {
          field: 'consentsApproved',
          value: 'I certify that biometric consent coverage has been reviewed',
        },
      ];
      const res = await fetch('/api/v1/attendance-compliance/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sign',
          period: signItem.period,
          attestations,
        }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success(`Certificate signed successfully for ${signItem.period}`);
        setSignItem(null);
        loadData();
      } else {
        toast.error(payload.error?.message ?? 'Failed to sign certificate');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error');
    } finally {
      setSigning(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    try {
      const res = await fetch('/api/v1/attendance-compliance/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive', id: archiveTarget.id }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Certificate moved to archive');
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
      const res = await fetch('/api/v1/attendance-compliance/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', id: restoreTarget.id }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Certificate restored successfully');
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
      const res = await fetch('/api/v1/attendance-compliance/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: deleteTarget.id }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success('Certificate deleted permanently');
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
        { value: 'DRAFT', label: 'Draft' },
        { value: 'SIGNED', label: 'Signed' },
      ],
    },
  ];

  const columns: Array<Column<Certificate>> = [
    { key: 'period', label: 'Period Month', sortable: true },
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
    { key: 'punchesTotal', label: 'Total Punches', render: (r) => r.punchesTotal.toLocaleString() },
    { key: 'missingPunchCount', label: 'Missing Punches', render: (r) => r.missingPunchCount },
    { key: 'lateCount', label: 'Late Arrivals', render: (r) => r.lateCount },
    { key: 'fraudFlagsOpen', label: 'Open Fraud Flags', render: (r) => r.fraudFlagsOpen },
    { key: 'absconding3DayCount', label: 'Absconding Cases', render: (r) => r.absconding3DayCount },
    { key: 'consentMissingCount', label: 'Missing Consents', render: (r) => r.consentMissingCount },
    {
      key: 'signedByUser',
      label: 'Signed By',
      render: (r) => (r.signedByUser ? `${r.signedByUser.name} (${r.signedByUser.email})` : '—'),
    },
  ];

  const detailsFields = [
    { key: 'period', label: 'Certification Period' },
    { key: 'status', label: 'Certification Status' },
    { key: 'punchesTotal', label: 'Total Device Logs Checked' },
    { key: 'missingPunchCount', label: 'Punches Violating SLA' },
    { key: 'lateCount', label: 'Late Arrival Flags' },
    { key: 'regularizationsPending', label: 'Pending Manager Approvals' },
    { key: 'fraudFlagsOpen', label: 'Active Investigation Fraud Flags' },
    { key: 'absconding3DayCount', label: 'Absconding Employees Flagged' },
    { key: 'consentMissingCount', label: 'Employees Lacking Biometric/Geo Consent' },
    {
      key: 'generatedAt',
      label: 'Generated Date/Time',
      render: (v: any) => (v ? new Date(v).toLocaleString() : '—'),
    },
    {
      key: 'signedAt',
      label: 'Signed Date/Time',
      render: (v: any) => (v ? new Date(v).toLocaleString() : '—'),
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 text-slate-900 select-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-19 · Compliance Close
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Monthly Certificates
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setPeriod(
                  `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
                );
                setGenerateOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Generate Certificate
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
          placeholder="Search by Period (YYYY-MM)..."
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
              {row.status === 'DRAFT' && !row.gatingReason && (
                <button
                  type="button"
                  onClick={() => {
                    setChecks({ accuracy: false, fraudResolved: false, consentsApproved: false });
                    setSignItem(row);
                  }}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2 py-0.5 text-[10px] font-bold text-white transition-colors"
                  title="Sign Certificate"
                >
                  Sign
                </button>
              )}
              {row.status === 'DRAFT' && row.gatingReason && (
                <span
                  className="rounded-lg bg-slate-100 text-slate-450 px-2 py-0.5 text-[10px] font-bold cursor-not-allowed"
                  title={row.gatingReason}
                >
                  Gated
                </span>
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
          entity="certificates"
          filter={{ ...filters, search, isDeleted: showDeleted }}
          onActionComplete={loadData}
        />

        {/* Read-Only Details view */}
        <DetailsModal
          open={viewItem !== null}
          onOpenChange={(open) => !open && setViewItem(null)}
          title="Monthly Certificate Details"
          data={viewItem}
          fields={detailsFields}
          renderExtra={(cert) => (
            <div className="space-y-4">
              {/* Checklist gating blocker display */}
              {cert.gatingReason ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold">Gating Blockers Active</span>
                    <p className="font-semibold text-amber-700">{cert.gatingReason}</p>
                  </div>
                </div>
              ) : cert.status === 'SIGNED' ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-start gap-2.5">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold">Signed & Certified Log</span>
                    <p className="font-semibold text-emerald-700">
                      Approved by {cert.signedByUser?.name} on{' '}
                      {new Date(cert.signedAt!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-650 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="font-bold">Ready to Sign — No gating blockers active.</span>
                </div>
              )}

              {/* Attestation check list items if signed */}
              {cert.attestationsJson && (
                <div className="rounded-xl border border-slate-200 p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Signed Attestations
                  </h4>
                  <ul className="space-y-1.5 text-xs font-semibold text-slate-700">
                    {cert.attestationsJson.map((att: any, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{att.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        />

        {/* Form Modal (Create / Edit) */}
        {generateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all scale-100 p-0">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 px-6 pt-6 pb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-slate-650" />
                Generate Monthly Compliance Certification
              </h3>
              <form
                onSubmit={handleGenerate}
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto space-y-6 px-6 py-6">
                  <label className="flex flex-col gap-1 text-xs font-bold text-slate-450 uppercase">
                    Select Period *
                    <input
                      type="month"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="mt-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-slate-450"
                    />
                  </label>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 p-6 rounded-b-2xl mt-auto">
                  <button
                    type="button"
                    onClick={() => setGenerateOpen(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-50"
                  >
                    {generating ? 'Calculating...' : 'Generate Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sign Certificate Dialog */}
        {signItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all scale-100 p-0">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 px-6 pt-6 pb-4 flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-emerald-500" />
                Sign Period Certification · {signItem.period}
              </h3>
              <form onSubmit={handleSign} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-6 px-6 py-6">
                  <p className="text-xs font-semibold text-slate-500 leading-normal">
                    Signing this document certifies GCC Compliance for all employee logs in the
                    selected month. Please check and agree to each clause:
                  </p>

                  <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checks.accuracy}
                        onChange={(e) => setChecks((c) => ({ ...c, accuracy: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-350 mt-0.5 shrink-0"
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        I certify that all attendance records, punches, and missing punches SLA
                        requests for {signItem.period} are correct and verified.
                      </span>
                    </label>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checks.fraudResolved}
                        onChange={(e) =>
                          setChecks((c) => ({ ...c, fraudResolved: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-slate-350 mt-0.5 shrink-0"
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        I certify that zero open fraud flag alerts remain uninvestigated or pending
                        active resolution.
                      </span>
                    </label>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checks.consentsApproved}
                        onChange={(e) =>
                          setChecks((c) => ({ ...c, consentsApproved: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-slate-350 mt-0.5 shrink-0"
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        I certify that biometric consent compliance logs have been reviewed for all
                        active workers.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 p-6 rounded-b-2xl mt-auto">
                  <button
                    type="button"
                    onClick={() => setSignItem(null)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      signing ||
                      !checks.accuracy ||
                      !checks.fraudResolved ||
                      !checks.consentsApproved
                    }
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {signing ? 'Signing Document...' : 'Submit E-Signature'}
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
          title="Archive Monthly Certificate"
          desc={`Are you sure you want to archive the compliance certificate for period ${archiveTarget?.period}?`}
          onConfirm={handleArchive}
          confirmText="Archive"
        />

        <ConfirmDialog
          open={restoreTarget !== null}
          onOpenChange={(open) => !open && setRestoreTarget(null)}
          title="Restore Monthly Certificate"
          desc={`Are you sure you want to restore the archived compliance certificate for period ${restoreTarget?.period}?`}
          onConfirm={handleRestore}
          confirmText="Restore"
          variant="info"
        />

        <ConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Permanently Delete Monthly Certificate"
          desc={`WARNING: Are you sure you want to permanently delete the compliance certificate for period ${deleteTarget?.period}? This cannot be undone.`}
          onConfirm={handleDelete}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </main>
  );
}
