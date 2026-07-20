'use client';

import * as React from 'react';
import { DetailsModal, FormModal, ConfirmDialog } from '../components';
import { toast } from 'sonner';
import {
  Award,
  ShieldAlert,
  BadgeCheck,
  PenTool,
  ClipboardCheck,
  Trash2,
  ShieldAlert as HardDeleteIcon,
} from 'lucide-react';

interface Certificate {
  id: string;
  period: string;
  status: string;
  generatedAt: string;
  signedAt: string | null;
  signedBy: string | null;
  sitesTotal: number;
  sitesOvercapacity: number;
  inspectionsDue: number;
  openCriticalFindings: number;
  openComplaints: number;
  complaintsSlaBreached: number;
  averageInspectionScore: string;
  gatingReason: string | null;
  attestationsJson: Array<{ field: string; value: string }>;
  isDeleted: boolean;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function CertificatePage() {
  const [certs, setCerts] = React.useState<Certificate[]>([]);
  const [period, setPeriod] = React.useState(periodNow());
  const [loading, setLoading] = React.useState(true);

  // Modals & Checklist State
  const [viewItem, setViewItem] = React.useState<Certificate | null>(null);
  const [signTarget, setSignTarget] = React.useState<Certificate | null>(null);
  const [attestations, setAttestations] = React.useState<Record<string, boolean>>({
    safetyChecked: false,
    hygieneChecked: false,
    capacityChecked: false,
    auditConfirmed: false,
  });

  const [confirmAction, setConfirmAction] = React.useState<{
    type: 'delete' | 'hard-delete';
    id: string;
    title: string;
    desc: string;
  } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/accommodation-compliance/certificate');
      const p = await r.json();
      if (p.success) setCerts(p.data ?? []);
    } catch (e) {
      console.error(e);
      toast.error('Network error loading certificates');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const handleGenerate = async () => {
    try {
      const res = await fetch('/api/v1/accommodation-compliance/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', period }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Certificate generated successfully');
        load();
      } else {
        toast.error(data.error?.message ?? 'Failed to generate certificate');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error generating certificate');
    }
  };

  const handleSignSubmit = async () => {
    if (!signTarget) return;
    const allChecked = Object.values(attestations).every(Boolean);
    if (!allChecked) {
      toast.error('All attestation check list items must be agreed to before signing.');
      throw new Error();
    }

    try {
      const mappedAttestations = Object.entries(attestations).map(([k, v]) => ({
        field: k,
        value: v ? 'CONFIRMED' : 'DECLINED',
      }));

      const res = await fetch('/api/v1/accommodation-compliance/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sign',
          period: signTarget.period,
          attestations: mappedAttestations,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Certificate signed and finalized successfully');
        setSignTarget(null);
        setAttestations({
          safetyChecked: false,
          hygieneChecked: false,
          capacityChecked: false,
          auditConfirmed: false,
        });
        load();
      } else {
        toast.error(data.error?.message ?? 'Failed to sign certificate');
        throw new Error();
      }
    } catch (e) {
      throw e;
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;

    try {
      const res = await fetch('/api/v1/accommodation-compliance/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: type, id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Certificate removed successfully`);
        load();
      } else {
        toast.error(data.error?.message ?? 'Failed to delete certificate');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error deleting certificate');
    }
  };

  const triggerDelete = (type: 'delete' | 'hard-delete', c: Certificate) => {
    const title = type === 'hard-delete' ? 'Permanently Delete Certificate' : 'Trash Certificate';
    const desc =
      type === 'hard-delete'
        ? `WARNING: Are you sure you want to permanently delete this certificate record? This action CANNOT be undone.`
        : `Are you sure you want to move this certificate for period ${c.period} to trash?`;

    setConfirmAction({ type, id: c.id, title, desc });
  };

  const detailFields = [
    { key: 'period', label: 'Period' },
    { key: 'status', label: 'Status' },
    { key: 'generatedAt', label: 'Generated At', render: (v: any) => new Date(v).toLocaleString() },
    {
      key: 'signedAt',
      label: 'Signed At',
      render: (v: any) => (v ? new Date(v).toLocaleString() : '—'),
    },
    { key: 'signedBy', label: 'Signed By User' },
    { key: 'sitesTotal', label: 'Total Active Sites' },
    { key: 'sitesOvercapacity', label: 'Sites Over Capacity' },
    { key: 'inspectionsDue', label: 'Overdue Inspections' },
    { key: 'openCriticalFindings', label: 'Open Critical Findings' },
    { key: 'openComplaints', label: 'Open Complaints' },
    { key: 'complaintsSlaBreached', label: 'SLA-Breached Complaints' },
    {
      key: 'averageInspectionScore',
      label: 'Average Inspection Score',
      render: (v: any) => `${v}%`,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 text-slate-900 select-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-23 · S17 / S18
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Monthly Compliance Certificate
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
              onClick={handleGenerate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
            >
              Generate Certificate
            </button>
          </div>
        </header>

        {/* Informative Header Alerts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-xs text-slate-500 leading-normal">
          <p>
            Monthly compliance certificates consolidate site allocation counts, SLA stats, and
            findings.
            <strong> Gating mechanisms block draft certificates from signing </strong> if there are
            any overdue inspections, overcapacity sites, or SLA breached complaints.
          </p>
        </div>

        {/* Master List */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm overflow-hidden">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total Sites</th>
                  <th className="px-4 py-3">Over Cap</th>
                  <th className="px-4 py-3">Insp Overdue</th>
                  <th className="px-4 py-3">Critical Findings</th>
                  <th className="px-4 py-3">SLA Breaches</th>
                  <th className="px-4 py-3">Avg Score</th>
                  <th className="px-4 py-3">Gating Blockers</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                      Loading certificates...
                    </td>
                  </tr>
                ) : certs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-slate-450 font-medium">
                      No certificates generated. Enter a period above to generate.
                    </td>
                  </tr>
                ) : (
                  certs.map((c) => {
                    const gated = !!c.gatingReason;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-800">{c.period}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                              c.status === 'SIGNED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                                : 'bg-amber-50 text-amber-800 border-amber-100'
                            }`}
                          >
                            {c.status === 'SIGNED' ? (
                              <BadgeCheck className="h-3 w-3 shrink-0" />
                            ) : (
                              <PenTool className="h-3 w-3 shrink-0" />
                            )}
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">{c.sitesTotal}</td>
                        <td
                          className={`px-4 py-3.5 ${c.sitesOvercapacity > 0 ? 'text-rose-600 font-bold' : ''}`}
                        >
                          {c.sitesOvercapacity}
                        </td>
                        <td
                          className={`px-4 py-3.5 ${c.inspectionsDue > 0 ? 'text-amber-600 font-bold' : ''}`}
                        >
                          {c.inspectionsDue}
                        </td>
                        <td
                          className={`px-4 py-3.5 ${c.openCriticalFindings > 0 ? 'text-rose-600 font-bold' : ''}`}
                        >
                          {c.openCriticalFindings}
                        </td>
                        <td
                          className={`px-4 py-3.5 ${c.complaintsSlaBreached > 0 ? 'text-rose-600 font-bold' : ''}`}
                        >
                          {c.complaintsSlaBreached}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-700">
                          {Number(c.averageInspectionScore).toFixed(1)}%
                        </td>
                        <td className="px-4 py-3.5 max-w-[220px] truncate text-xs">
                          {gated ? (
                            <span className="flex items-center gap-1 text-rose-600 font-medium">
                              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                              {c.gatingReason?.replace('Blocked: ', '')}
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-medium">
                              Clear of Blockers ✓
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewItem(c)}
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-650 hover:bg-slate-50 transition-colors"
                            >
                              Details
                            </button>
                            {c.status === 'DRAFT' && !gated && (
                              <button
                                type="button"
                                onClick={() => setSignTarget(c)}
                                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 text-xs font-bold text-white transition-colors"
                              >
                                Sign
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => triggerDelete('delete', c)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Delete Certificate"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Read-Only Details View Modal */}
        <DetailsModal
          open={viewItem !== null}
          onOpenChange={(open) => !open && setViewItem(null)}
          title="Compliance Certificate Summary"
          data={viewItem}
          fields={detailFields}
          renderExtra={(data) => {
            const list = data.attestationsJson ?? [];
            return (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Signed Attestations Checklist
                </h4>
                {list.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Certificate not yet signed / attestations not logged.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden bg-slate-50/50">
                    {list.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3.5">
                        <span className="text-sm font-medium text-slate-700 uppercase tracking-wider text-xs">
                          {item.field.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-100">
                          <ClipboardCheck className="h-3.5 w-3.5 shrink-0" />
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }}
        />

        {/* Signing Checklist Attestations Modal */}
        <FormModal
          open={signTarget !== null}
          onOpenChange={(open) => !open && setSignTarget(null)}
          title={`Sign Certificate: Period ${signTarget?.period}`}
          onSubmit={handleSignSubmit}
          submitText="Confirm & Sign"
        >
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-xs text-emerald-800 mb-2 leading-relaxed">
            Please review the following attestations checklist. You must accept all items as a
            compliance attestation officer before signing the monthly certificate.
          </div>

          <div className="space-y-3.5 select-none">
            <label className="flex items-start gap-3 cursor-pointer p-2.5 hover:bg-slate-50 rounded-xl transition-all">
              <input
                type="checkbox"
                checked={attestations.safetyChecked}
                onChange={(e) =>
                  setAttestations((a) => ({ ...a, safetyChecked: e.target.checked }))
                }
                className="h-5 w-5 rounded border-slate-350 text-slate-900 focus:ring-slate-500 mt-0.5 shrink-0"
              />
              <div className="text-xs">
                <span className="block font-bold text-slate-800">
                  Fire &amp; Electrical Safety Checked
                </span>
                <span className="text-slate-500">
                  I attest that the civil defense certificates are up-to-date and fire safety drills
                  have been regularly practiced.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-2.5 hover:bg-slate-50 rounded-xl transition-all">
              <input
                type="checkbox"
                checked={attestations.hygieneChecked}
                onChange={(e) =>
                  setAttestations((a) => ({ ...a, hygieneChecked: e.target.checked }))
                }
                className="h-5 w-5 rounded border-slate-350 text-slate-900 focus:ring-slate-500 mt-0.5 shrink-0"
              />
              <div className="text-xs">
                <span className="block font-bold text-slate-800">
                  Cleanliness &amp; Hygiene Standards Maintained
                </span>
                <span className="text-slate-500">
                  I attest that the toilets-to-shower ratios are correct and cleanliness is
                  monitored by camp health inspectors.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-2.5 hover:bg-slate-50 rounded-xl transition-all">
              <input
                type="checkbox"
                checked={attestations.capacityChecked}
                onChange={(e) =>
                  setAttestations((a) => ({ ...a, capacityChecked: e.target.checked }))
                }
                className="h-5 w-5 rounded border-slate-350 text-slate-900 focus:ring-slate-500 mt-0.5 shrink-0"
              />
              <div className="text-xs">
                <span className="block font-bold text-slate-800">
                  Bed Allocation Segregation Met
                </span>
                <span className="text-slate-500">
                  I attest that overcrowding checks are continuously enforced and employee bedroom
                  assignments comply with density baselines.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-2.5 hover:bg-slate-50 rounded-xl transition-all">
              <input
                type="checkbox"
                checked={attestations.auditConfirmed}
                onChange={(e) =>
                  setAttestations((a) => ({ ...a, auditConfirmed: e.target.checked }))
                }
                className="h-5 w-5 rounded border-slate-350 text-slate-900 focus:ring-slate-500 mt-0.5 shrink-0"
              />
              <div className="text-xs">
                <span className="block font-bold text-slate-800">
                  Audit History &amp; SLA Checks Completed
                </span>
                <span className="text-slate-500">
                  I attest that all open critical findings have been investigated and SLA breaches
                  have been cleared.
                </span>
              </div>
            </label>
          </div>
        </FormModal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={confirmAction !== null}
          onOpenChange={(open) => !open && setConfirmAction(null)}
          title={confirmAction?.title ?? ''}
          description={confirmAction?.desc ?? ''}
          type={confirmAction?.type === 'hard-delete' ? 'danger' : 'warning'}
          onConfirm={handleConfirmAction}
        />
      </div>
    </main>
  );
}
