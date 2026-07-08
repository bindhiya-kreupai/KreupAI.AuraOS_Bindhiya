'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Plus,
  Lock,
  Eye,
  Info,
  DollarSign,
  Activity,
  Calendar,
} from 'lucide-react';
import { EntityTable, ConfirmDialog, DetailsModal, type Column } from '../components';
import { toast } from 'sonner';

interface Cert {
  id: string;
  period: string;
  status: string;
  activeEnrollments: number;
  mandatoryCoverGapCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  openExceptionsCount: number;
  vendorsWithoutDpa: number;
  totalAccruedLiability: string;
  currency: string;
  gatingReason: string | null;
  generatedAt: string;
  signedAt?: string | null;
  signedBy?: string | null;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

function formatCompact(value: number | string): string {
  const num = Number(value);
  if (isNaN(num)) return String(value);
  if (num === 0) return '0.00';
  const abs = Math.abs(num);
  if (abs >= 1.0e12) return (num / 1.0e12).toFixed(2) + ' T';
  if (abs >= 1.0e9) return (num / 1.0e9).toFixed(2) + ' B';
  if (abs >= 1.0e6) return (num / 1.0e6).toFixed(2) + ' M';
  if (abs >= 1.0e3) return (num / 1.0e3).toFixed(2) + ' K';
  return num.toFixed(2);
}

export default function CertificatePage() {
  const [mounted, setMounted] = useState(false);
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(periodNow());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Dialogs & Details
  const [genConfirm, setGenConfirm] = useState(false);
  const [signTarget, setSignTarget] = useState<Cert | null>(null);
  const [detailsItem, setDetailsItem] = useState<Cert | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/benefits-compliance/certificate');
      const p = await r.json();
      if (p.success) setCerts(p.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    load();
  }, [load]);

  const handleGenerate = async () => {
    try {
      const r = await fetch('/api/v1/benefits-compliance/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', period }),
      });
      const p = await r.json();
      if (p.success) {
        toast.success(`Compliance Audit and Certificate generated for ${period}`);
        load();
      } else {
        toast.error(p.error?.message ?? 'Failed to generate certificate');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setGenConfirm(false);
    }
  };

  const handleSign = async () => {
    if (!signTarget) return;
    try {
      const r = await fetch('/api/v1/benefits-compliance/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sign',
          period: signTarget.period,
          attestations: [{ field: 'attest', value: 'OK' }],
        }),
      });
      const p = await r.json();
      if (p.success) {
        toast.success(
          `Benefits Compliance Certificate for ${signTarget.period} signed successfully`
        );
        load();
      } else {
        toast.error(p.error?.message ?? 'Failed to sign certificate');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSignTarget(null);
    }
  };

  const columns: Array<Column<Cert>> = [
    { key: 'period', label: 'Compliance Period', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const isSigned = row.status === 'SIGNED';
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              isSigned
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                : 'bg-slate-50 border-slate-100 text-slate-500'
            }`}
          >
            {isSigned ? <ShieldCheck className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            {row.status}
          </span>
        );
      },
    },
    { key: 'activeEnrollments', label: 'Active Coverages' },
    {
      key: 'mandatoryCoverGapCount',
      label: 'Mandatory Gaps',
      render: (row) => (
        <span
          className={row.mandatoryCoverGapCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}
        >
          {row.mandatoryCoverGapCount}
        </span>
      ),
    },
    {
      key: 'expiredCount',
      label: 'Expired',
      render: (row) => (
        <span className={row.expiredCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
          {row.expiredCount}
        </span>
      ),
    },
    {
      key: 'vendorsWithoutDpa',
      label: 'No DPA Vendors',
      render: (row) => (
        <span className={row.vendorsWithoutDpa > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
          {row.vendorsWithoutDpa}
        </span>
      ),
    },
    {
      key: 'openExceptionsCount',
      label: 'Exceptions',
      render: (row) => (
        <span
          className={
            row.openExceptionsCount > 0 ? 'text-amber-600 font-semibold' : 'text-slate-500'
          }
        >
          {row.openExceptionsCount}
        </span>
      ),
    },
    {
      key: 'totalAccruedLiability',
      label: 'Accrued Liability',
      render: (row) => `${formatCompact(row.totalAccruedLiability)} ${row.currency}`,
    },
    {
      key: 'gatingReason',
      label: 'Compliance Blockers',
      render: (row) =>
        row.gatingReason ? (
          <div className="flex flex-col gap-1 max-w-xs leading-normal">
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-xs text-rose-700 font-bold w-fit">
              🔴 BLOCKED
            </span>
            <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              {row.gatingReason}
            </span>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-xs text-emerald-700 font-bold w-fit">
            🟢 READY
          </span>
        ),
    },
    {
      key: 'generatedAt',
      label: 'Generated',
      render: (row) => {
        const date = new Date(row.generatedAt);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      },
    },
    {
      key: 'signedAt',
      label: 'Signed Date / Attestation',
      render: (row) => {
        if (row.status !== 'SIGNED') return <span className="text-slate-400">—</span>;
        const dateStr = row.signedAt
          ? new Date(row.signedAt).toLocaleDateString(undefined, {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '';
        return (
          <div className="flex flex-col text-xs leading-normal">
            <span className="font-bold text-slate-700">{row.signedBy}</span>
            <span className="text-[10px] text-slate-400 font-semibold">{dateStr}</span>
          </div>
        );
      },
    },
  ];

  // Calculations for summary strip
  const draftCount = certs.filter((c) => c.status === 'DRAFT').length;
  const signedCount = certs.filter((c) => c.status === 'SIGNED').length;
  const blockedCount = certs.filter((c) => c.gatingReason !== null).length;
  const readyCount = certs.length - blockedCount;

  const complianceScore = certs.length ? ((readyCount / certs.length) * 100).toFixed(2) : '100.00';

  let totalLiability = 0;
  let lastAuditStr = '—';
  let currencyCode = 'AED';

  if (certs.length > 0) {
    totalLiability = certs.reduce((acc, c) => acc + Number(c.totalAccruedLiability), 0);
    currencyCode = certs[0].currency;
    const sorted = [...certs].sort(
      (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
    const lastDate = new Date(sorted[0].generatedAt);
    lastAuditStr = lastDate.toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  const paginatedCerts = certs.slice((page - 1) * pageSize, page * pageSize);

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 text-slate-900 select-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-22 · S17 / S18
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Benefits Compliance Certificates
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-slate-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setGenConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Generate Audit
            </button>
          </div>
        </header>

        {/* KPI Compliance summary strip */}
        <section className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600 border border-slate-200">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">
                Draft Audits
              </span>
              <span className="text-xl font-extrabold text-slate-900 leading-none mt-1 block">
                {draftCount}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 text-emerald-600 p-2 border border-emerald-100">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">
                Signed
              </span>
              <span className="text-xl font-extrabold text-slate-900 leading-none mt-1 block">
                {signedCount}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="rounded-lg bg-rose-50 text-rose-600 p-2 border border-rose-100">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">
                Blocked
              </span>
              <span className="text-xl font-extrabold text-slate-900 leading-none mt-1 block">
                {blockedCount}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="rounded-lg bg-sky-50 text-sky-600 p-2 border border-sky-100">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">
                Score
              </span>
              <span className="text-xl font-extrabold text-slate-900 leading-none mt-1 block">
                {complianceScore}%
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 text-amber-600 p-2 border border-amber-100">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">
                Liability
              </span>
              <span className="text-xl font-extrabold text-slate-900 leading-none mt-1 block">
                {formatCompact(totalLiability)} {currencyCode}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3 col-span-2 md:col-span-1">
            <div className="rounded-lg bg-purple-50 text-purple-600 p-2 border border-purple-100">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">
                Last Audit
              </span>
              <span className="text-xs font-bold text-slate-700 leading-tight mt-1.5 block">
                {lastAuditStr}
              </span>
            </div>
          </div>
        </section>

        {/* Data Table */}
        <EntityTable
          columns={columns}
          data={paginatedCerts}
          loading={loading}
          total={certs.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          emptyMessage={
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 max-w-sm mx-auto">
              <Info className="h-10 w-10 text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-700 text-sm">
                No monthly compliance audit exists
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-normal">
                Select a period, click Generate Audit, review compliance exception findings, and
                attest once compliant.
              </p>
            </div>
          }
          actions={(row) => {
            const isSigned = row.status === 'SIGNED';
            return (
              <div className="flex items-center gap-1.5">
                {isSigned ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setDetailsItem(row)}
                      className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-700 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        toast.success(
                          `Downloading Benefits Compliance Certificate PDF for ${row.period}...`
                        )
                      }
                      className="rounded bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-all"
                    >
                      Download PDF
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        toast.info(
                          `Audit Log: Certificate attested by ${row.signedBy} on ${
                            row.signedAt ? new Date(row.signedAt).toLocaleString() : 'System'
                          }`
                        )
                      }
                      className="rounded bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-all"
                    >
                      Audit Log
                    </button>
                  </>
                ) : row.status === 'DRAFT' && !row.gatingReason ? (
                  <button
                    type="button"
                    onClick={() => setSignTarget(row)}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 px-3 py-1.5 text-xs text-emerald-800 font-bold transition-all"
                  >
                    Sign Certificate
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDetailsItem(row)}
                      className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-700 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <span
                      className="inline-flex items-center gap-1 rounded-xl bg-rose-50 border border-rose-100 px-3 py-1.5 text-xs text-rose-800 font-bold opacity-60 cursor-not-allowed"
                      title="Signing blocked due to compliance violations"
                    >
                      Blocked
                    </span>
                  </div>
                )}
              </div>
            );
          }}
        />

        {/* Generate Confirmation Dialog */}
        <ConfirmDialog
          open={genConfirm}
          onOpenChange={setGenConfirm}
          title={`Generate Compliance Audit for ${period}?`}
          description="This calculates coverage percentages, checks DPA status across vendors, and registers leave travel, housing, and medical compliance exceptions. This will create or update the draft certificate."
          confirmText="Generate Audit"
          type="info"
          onConfirm={handleGenerate}
        />

        {/* Sign Confirmation Dialog */}
        <ConfirmDialog
          open={!!signTarget}
          onOpenChange={(o) => {
            if (!o) setSignTarget(null);
          }}
          title={`Sign Certificate for ${signTarget?.period}?`}
          description="By signing, you attest that the company's GCC Employee benefits program meets all statutory requirements and that vendor DPAs have been audited. This action is irreversible."
          confirmText="Attest &amp; Sign"
          type="success"
          onConfirm={handleSign}
        />

        {/* Details View Modal */}
        {detailsItem && (
          <DetailsModal
            open={!!detailsItem}
            onOpenChange={(o) => {
              if (!o) setDetailsItem(null);
            }}
            title={`Benefits Audit Summary — Period ${detailsItem.period}`}
            data={detailsItem}
            fields={[
              { key: 'period', label: 'Compliance Period' },
              { key: 'status', label: 'Audit Status' },
              { key: 'activeEnrollments', label: 'Active Enrolled Coverages' },
              { key: 'mandatoryCoverGapCount', label: 'Mandatory Coverage Gaps' },
              { key: 'expiredCount', label: 'Expired Policies' },
              { key: 'vendorsWithoutDpa', label: 'Vendors Lacking DPA Agreements' },
              { key: 'openExceptionsCount', label: 'Compliance Exceptions Logged' },
              {
                key: 'totalAccruedLiability',
                label: 'Accrued End-of-Service Liability',
                render: (v) => `${formatCompact(v)} ${detailsItem.currency}`,
              },
              {
                key: 'generatedAt',
                label: 'Generated Timestamp',
                render: (v) => new Date(v).toLocaleString(),
              },
              { key: 'signedBy', label: 'Attested By', render: (v) => v || '—' },
              {
                key: 'signedAt',
                label: 'Signature Timestamp',
                render: (v) => (v ? new Date(v).toLocaleString() : '—'),
              },
            ]}
            renderExtra={() => (
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-3 text-sm mt-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-semibold">
                  Compliance Exceptions Detail
                </h4>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-xs text-slate-400 font-bold uppercase">
                      Vendor Issues
                    </span>
                    <span className="text-slate-800 font-semibold">
                      {detailsItem.vendorsWithoutDpa > 0
                        ? `${detailsItem.vendorsWithoutDpa} warning(s)`
                        : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-xs text-slate-400 font-bold uppercase">
                      Coverage Gaps
                    </span>
                    <span className="text-slate-800 font-semibold">
                      {detailsItem.mandatoryCoverGapCount > 0
                        ? `${detailsItem.mandatoryCoverGapCount} gap(s) detected`
                        : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase">
                      Gating / Blocker Status
                    </span>
                    <span
                      className={`text-xs font-bold ${detailsItem.gatingReason ? 'text-rose-600' : 'text-emerald-700'}`}
                    >
                      {detailsItem.gatingReason
                        ? `BLOCKED: ${detailsItem.gatingReason}`
                        : 'READY TO ATTEST'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          />
        )}
      </div>
    </main>
  );
}
