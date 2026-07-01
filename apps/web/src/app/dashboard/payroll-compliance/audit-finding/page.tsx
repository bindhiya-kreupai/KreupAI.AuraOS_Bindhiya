'use client';

import { useEffect, useState } from 'react';

interface Finding {
  id: string;
  findingNumber: string;
  period: string;
  category: string;
  controlCode: string | null;
  title: string;
  severity: string;
  ownerId: string | null;
  dueAt: string | null;
  status: string;
}

const sevColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-amber-100 text-amber-800',
  CRITICAL: 'bg-rose-100 text-rose-800',
};

const CATEGORIES = [
  'APPROVAL',
  'PERIOD_LOCK',
  'GL_POSTING',
  'BANK_FILE',
  'RECONCILIATION',
  'STATUTORY',
  'AUDIT_TRAIL',
  'SOD',
];

export default function PayrollAuditFindingPage() {
  const [rows, setRows] = useState<Finding[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    findingNumber: '',
    period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    category: 'APPROVAL',
    controlCode: '',
    title: '',
    description: '',
    severity: 'MEDIUM',
    ownerId: '',
  });

  async function load() {
    const r = await fetch('/api/v1/payroll-compliance/audit-finding');
    const p = await r.json();
    if (p.success) setRows(p.data?.items ?? p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function raise() {
    const r = await fetch('/api/v1/payroll-compliance/audit-finding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'raise', ...form }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Raised' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }
  async function remediate(id: string) {
    const remediation = prompt('Remediation summary?') ?? '';
    if (!remediation) return;
    const r = await fetch('/api/v1/payroll-compliance/audit-finding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remediate', id, remediation }),
    });
    const p = await r.json();
    setMessage(
      p.success ? 'Remediated' : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-10 · S16</p>
          <h1 className="text-2xl font-semibold">Payroll Audit Findings</h1>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Raise Finding</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-6">
            <input
              value={form.findingNumber}
              onChange={(e) => setForm({ ...form, findingNumber: e.target.value })}
              placeholder="PF-001"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
              placeholder="YYYY-MM"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-md border border-slate-300 px-2 py-1.5"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              className="rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={raise}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Raise
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">No.</th>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Control</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Due</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.findingNumber}</td>
                  <td className="px-3 py-2">{r.period}</td>
                  <td className="px-3 py-2 text-xs">{r.category}</td>
                  <td className="px-3 py-2 text-xs">{r.controlCode ?? '—'}</td>
                  <td className="px-3 py-2">{r.title}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevColor[r.severity] ?? ''}`}
                    >
                      {r.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{r.dueAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">
                    {r.status === 'OPEN' ? (
                      <button
                        type="button"
                        onClick={() => remediate(r.id)}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                      >
                        Remediate
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No findings.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
