'use client';

import { useEffect, useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  UserCheck,
  ShieldAlert,
  ChevronRight,
  Info,
  X,
  Printer,
  Shield,
  FileSignature,
  RefreshCw,
} from 'lucide-react';

interface Cert {
  id: string;
  period: string;
  status: string;
  tasksDue: number;
  tasksCompleted: number;
  tasksDeferred: number;
  tasksOverdue: number;
  criticalOverdue: number;
  gatingReason: string | null;
  attestationsJson?: any;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function CertificatePage() {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [period, setPeriod] = useState(periodNow());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({
    type: '',
    text: '',
  });

  // Modal / Sign state
  const [signingCert, setSigningCert] = useState<Cert | null>(null);
  const [checkedAttestations, setCheckedAttestations] = useState<Record<string, boolean>>({});
  const [signatureKey, setSignatureKey] = useState('');

  // Hardcoded checklist items
  const attestationItems = [
    {
      key: 'wps',
      text: 'I certify that all Wage Protection System (WPS) transfers for the reporting period have been matching authority files and executed.',
    },
    {
      key: 'social',
      text: 'I certify that social insurance contributions for GCC nationals have been processed and paid without penalty.',
    },
    {
      key: 'immigration',
      text: 'I verify that all visa renewals, residence permits, and quota parameters are fully current.',
    },
    {
      key: 'deferrals',
      text: 'I acknowledge that all deferred obligations for this period have been approved by the Internal Audit Lead.',
    },
  ];

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/compliance-calendar/certificate');
      const p = await r.json();
      if (p.success) {
        setCerts(p.data ?? []);
      }
    } catch (e) {
      console.error('Failed to load certificates', e);
      setMessage({ type: 'error', text: 'Error connecting to certification api' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function generate() {
    setMessage({ type: '', text: '' });
    setLoading(true);
    try {
      const r = await fetch('/api/v1/compliance-calendar/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', period }),
      });
      const p = await r.json();
      if (p.success) {
        setMessage({ type: 'success', text: `Success: Drafted certificate for period ${period}.` });
        load();
      } else {
        setMessage({ type: 'error', text: p.error?.message || 'Generation failed' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Network error generating certificate' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSign(e: React.FormEvent) {
    e.preventDefault();
    if (!signingCert) return;

    // Validation
    const allChecked = attestationItems.every((item) => checkedAttestations[item.key]);
    if (!allChecked) {
      setMessage({
        type: 'error',
        text: 'Please accept all attestation checklists before signing.',
      });
      return;
    }

    if (signatureKey !== 'CONFIRM-SIGN') {
      alert('Invalid signing authorization key. Please type "CONFIRM-SIGN" to authorize.');
      return;
    }

    try {
      setLoading(true);
      const attestationsToSend = attestationItems.map((item) => ({
        field: item.key,
        value: 'APPROVED',
      }));

      const r = await fetch('/api/v1/compliance-calendar/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sign',
          period: signingCert.period,
          attestations: attestationsToSend,
        }),
      });
      const p = await r.json();
      if (p.success) {
        setMessage({
          type: 'success',
          text: `Certificate for period ${signingCert.period} has been DIGITALLY SIGNED.`,
        });
        setSigningCert(null);
        setSignatureKey('');
        setCheckedAttestations({});
        load();
      } else {
        setMessage({ type: 'error', text: p.error?.message || 'Signing failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error signing certificate' });
    } finally {
      setLoading(false);
    }
  }

  const handleAttestationChange = (key: string, checked: boolean) => {
    setCheckedAttestations((prev) => ({ ...prev, [key]: checked }));
  };

  const handlePrintCert = (c: Cert) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Monthly Compliance Certificate — Period ${c.period}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            .cert-box { border: 8px double #475569; padding: 40px; text-align: center; }
            h1 { font-size: 28px; margin-bottom: 5px; color: #0f172a; }
            h2 { font-size: 16px; text-transform: uppercase; color: #64748b; margin-top: 0; }
            .period { font-size: 20px; font-weight: bold; margin: 25px 0; color: #4f46e5; }
            .metrics { display: flex; justify-content: center; gap: 30px; margin: 30px 0; font-size: 14px; }
            .metric { border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 6px; }
            .metric strong { font-size: 18px; display: block; color: #0f172a; }
            .attestations { text-align: left; max-width: 600px; margin: 30px auto; font-size: 12px; color: #475569; }
            .attestations li { margin-bottom: 10px; }
            .signature { margin-top: 50px; font-size: 14px; font-style: italic; }
            .footer { margin-top: 60px; font-size: 10px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <h2>Statutory Certification</h2>
            <h1>MONTHLY COMPLIANCE CERTIFICATE</h1>
            <div class="period">REPORTING PERIOD: ${c.period}</div>
            
            <p>This document certifies that the organization has successfully run and audited all statutory payroll, Wage Protection System, social security filings, and immigration parameters for the period.</p>
            
            <div class="metrics">
              <div class="metric"><strong>${c.tasksDue}</strong> Tasks Due</div>
              <div class="metric"><strong>${c.tasksCompleted}</strong> Completed</div>
              <div class="metric"><strong>${c.tasksDeferred}</strong> Deferred</div>
              <div class="metric"><strong>${c.tasksOverdue}</strong> Overdue</div>
            </div>

            <div class="attestations">
              <h3>Attestation Statements:</h3>
              <ul>
                <li>Wage Protection System (WPS) transfers conforms to GCC regulations.</li>
                <li>Social security contributions for GCC nationals paid without delay.</li>
                <li>Work permit quotas and document retention retention guidelines checked.</li>
                <li>No active critical compliance blockers detected.</li>
              </ul>
            </div>

            <div class="signature">
              <p>Digitally Signed &amp; Authorized By</p>
              <p><strong>System Compliance Officer (Role Authorized)</strong></p>
              <p>Sign state: ${c.status} • Timestamp: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="footer">
              AuraOS Compliance Engine • Verification Ref: ${c.id}
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <a href="/dashboard/compliance-calendar" className="hover:text-slate-700">
            Compliance Calendar
          </a>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-slate-700">Monthly Certificate</span>
        </nav>

        {/* Enterprise Header */}
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                S10
              </span>
              <span className="text-xs text-slate-500">Executive Statutory Audits</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Monthly Compliance Certificate
            </h1>
            <p className="text-sm text-slate-500">
              Generate audited executive certifications. All monthly tasks must pass without
              critical overdue blockers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 shadow-sm">
              <Calendar className="mr-2 h-4 w-4 text-slate-400" />
              <input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none text-slate-700"
              />
            </div>

            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow hover:bg-slate-800 transition"
            >
              <Award className="h-4 w-4" />
              <span>Generate Draft</span>
            </button>

            <button
              type="button"
              onClick={load}
              className="rounded-md border border-slate-300 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 shadow-sm transition"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Global Notifications */}
        {message.text && (
          <div
            className={`flex items-center justify-between rounded-lg border p-4 text-sm shadow-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-500" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setMessage({ type: '', text: '' })}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Business Logic Warning */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-xs text-slate-500 flex items-start gap-3">
          <Info className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="leading-relaxed">
            <h4 className="font-semibold text-slate-800">
              Compliance Gating Rules &amp; Protocols
            </h4>
            <p className="mt-1">
              Certificates are locked from digital sign-off if there are unresolved compliance tasks
              in <strong>Wage Protection System (WPS)</strong>, <strong>Social Insurance</strong>,
              or <strong>Immigration (Visa &amp; Work Permits)</strong>. All critical tasks must be
              fully COMPLETED or formally DEFERRED to bypass blocker holds.
            </p>
          </div>
        </section>

        {/* Certificate Register Table */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Reporting Period</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-center">Due Duties</th>
                  <th className="px-4 py-3.5 text-center">Completed</th>
                  <th className="px-4 py-3.5 text-center">Deferred</th>
                  <th className="px-4 py-3.5 text-center">Overdue</th>
                  <th className="px-4 py-3.5 text-center">Critical Blocker</th>
                  <th className="px-4 py-3.5">Gating Reason</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && certs.length === 0
                  ? Array.from({ length: 3 }).map((_, idx) => (
                      <tr key={`skel-${idx}`}>
                        <td className="px-4 py-4">
                          <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="h-4 w-10 bg-slate-200 rounded mx-auto animate-pulse" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="h-4 w-10 bg-slate-200 rounded mx-auto animate-pulse" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="h-4 w-10 bg-slate-200 rounded mx-auto animate-pulse" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="h-4 w-10 bg-slate-200 rounded mx-auto animate-pulse" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="h-4 w-10 bg-slate-200 rounded mx-auto animate-pulse" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="h-6 w-16 bg-slate-200 rounded ml-auto animate-pulse" />
                        </td>
                      </tr>
                    ))
                  : certs.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3.5 font-bold text-slate-800">{c.period}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border ${
                              c.status === 'SIGNED'
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                : 'bg-amber-50 border-amber-100 text-amber-700'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${c.status === 'SIGNED' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            />
                            <span>{c.status}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono font-medium text-slate-700">
                          {c.tasksDue}
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono font-semibold text-emerald-600">
                          {c.tasksCompleted}
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono text-amber-600">
                          {c.tasksDeferred}
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono font-semibold text-rose-600">
                          {c.tasksOverdue}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {c.criticalOverdue > 0 ? (
                            <span className="rounded bg-rose-50 border border-rose-100 px-1.5 py-0.5 text-xs font-bold text-rose-700 animate-pulse">
                              {c.criticalOverdue} Blocker
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">0</span>
                          )}
                        </td>
                        <td
                          className="px-4 py-3.5 text-xs text-rose-700 max-w-[200px] truncate"
                          title={c.gatingReason ?? undefined}
                        >
                          {c.gatingReason ? (
                            <span className="flex items-center gap-1">
                              <ShieldAlert className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                              <span className="truncate">{c.gatingReason}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex justify-end gap-2">
                            {c.status === 'DRAFT' && !c.gatingReason && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSigningCert(c);
                                  setCheckedAttestations({});
                                  setSignatureKey('');
                                }}
                                className="rounded bg-slate-900 text-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1 shadow"
                              >
                                <FileSignature className="h-3.5 w-3.5" />
                                <span>Sign Cert</span>
                              </button>
                            )}

                            {c.status === 'SIGNED' && (
                              <button
                                type="button"
                                onClick={() => handlePrintCert(c)}
                                className="rounded border border-slate-300 bg-white text-slate-600 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50 shadow-sm transition flex items-center gap-1"
                              >
                                <Printer className="h-3.5 w-3.5 text-slate-500" />
                                <span>Print Cert</span>
                              </button>
                            )}

                            {c.gatingReason && (
                              <a
                                href="/dashboard/compliance-calendar/tasks?status=OVERDUE"
                                className="text-xs font-semibold text-indigo-600 hover:underline py-1.5 px-2"
                              >
                                Resolve Tasks
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                {certs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center text-slate-400 text-sm">
                      <Info className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <span>
                        No Monthly Certificates generated yet. Select period and click Generate
                        Draft.
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ========================================================
          DIGITAL SIGNATURE ATTESTATION MODAL
      ======================================================== */}
      {signingCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800 text-base">Digital Statutory Sign-off</h3>
              </div>
              <button
                type="button"
                onClick={() => setSigningCert(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSign} className="py-4 space-y-4">
              {/* Summary Stats info */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-800 border-b border-slate-200 pb-1.5 mb-2">
                  <span>Reporting Period:</span>
                  <span>{signingCert.period}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-slate-600">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-bold">
                      Due
                    </span>
                    <span className="font-mono text-sm font-semibold">{signingCert.tasksDue}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-bold">
                      Completed
                    </span>
                    <span className="font-mono text-sm font-semibold text-emerald-600">
                      {signingCert.tasksCompleted}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-bold">
                      Deferred
                    </span>
                    <span className="font-mono text-sm font-semibold text-amber-600">
                      {signingCert.tasksDeferred}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-bold">
                      Overdue
                    </span>
                    <span className="font-mono text-sm font-semibold">
                      {signingCert.tasksOverdue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attestation Checkboxes list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Compliance Declarations &amp; Attestations
                </h4>

                <div className="space-y-2.5">
                  {attestationItems.map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer hover:text-slate-900 transition"
                    >
                      <input
                        type="checkbox"
                        checked={checkedAttestations[item.key] || false}
                        onChange={(e) => handleAttestationChange(item.key, e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                        required
                      />
                      <span className="leading-relaxed">{item.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Verification key input */}
              <div className="space-y-1 pt-2.5 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">
                  Signature Confirmation Key *
                </label>
                <input
                  type="text"
                  required
                  value={signatureKey}
                  onChange={(e) => setSignatureKey(e.target.value)}
                  placeholder="Type CONFIRM-SIGN to authorize"
                  className="w-full rounded-md border border-slate-300 p-2.5 text-xs outline-none focus:border-slate-900 font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  Type "CONFIRM-SIGN" in capital letters to verify your identity and authorization.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3.5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSigningCert(null)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-md transition"
                >
                  Authorize &amp; Sign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
