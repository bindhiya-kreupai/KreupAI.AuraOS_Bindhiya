'use client';

import { useEffect, useState } from 'react';

interface Submission {
  id: string;
  countryCode: string;
  period: string;
  status: string;
  fileFormat: string;
  totalEmployees: number;
  totalAmount: string;
  dueDate: string | null;
  submittedAt: string | null;
  acknowledgedAt: string | null;
  reconciliationStatus: string | null;
}

const statusColor: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  GENERATED: 'bg-blue-100 text-blue-800',
  VALIDATED: 'bg-blue-100 text-blue-800',
  SUBMITTED: 'bg-amber-100 text-amber-800',
  ACKNOWLEDGED: 'bg-emerald-100 text-emerald-800',
  RECONCILED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800',
};

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function SubmissionsPage() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [period, setPeriod] = useState(periodNow());
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    country: '',
    format: '',
    employees: '',
    dueDate: '',
    submittedDate: '',
  });

  async function load() {
    const r = await fetch(`/api/v1/wps-compliance/submissions?period=${period}`);
    const p = await r.json();
    if (p.success) setSubs(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [period]);

  async function call(action: string, sub: Submission, extra: Record<string, unknown> = {}) {
    setMessage('');
    const r = await fetch('/api/v1/wps-compliance/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, submissionId: sub.id, ...extra }),
    });
    const p = await r.json();
    setMessage(
      p.success
        ? `${action} OK`
        : (p.error?.details?.error ?? p.error?.message ?? action + ' failed')
    );
    load();
  }
  async function saveSubmission() {
    const r = await fetch('/api/v1/wps-compliance/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'build',
        countryCode: form.country,
        establishmentId: 'demo-1',
        period,
        rows: [
          {
            employeeCode: 'EMP001',
            employeeName: 'Demo Employee',
            iban: 'BH67BMAG00001299123456',
            bankSwift: 'BMAGBHBM',
            currency: 'BHD',
            fixedPay: 1000,
            variablePay: 0,
            deductions: 0,
            netPay: 1000,
            daysWorked: 30,
            nationalId: '123456789',
            labourCardNumber: 'LC123456',
          },
        ],
      }),
    });

    const p = await r.json();

    if (p.success) {
      setMessage('Submission created successfully');
      load();

      setForm({
        country: '',
        format: '',
        employees: '',
        dueDate: '',
        submittedDate: '',
      });
    } else {
      setMessage(p.error?.message ?? p.error?.details?.error ?? 'Failed to create submission');
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-11 · S02–S07</p>
            <h1 className="text-2xl font-semibold">WPS Submissions</h1>
          </div>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </header>

        {message ? <p className="text-sm">{message}</p> : null}

        {/* Add Submission Form */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-4 text-lg font-semibold">New WPS Submission</h3>

          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="rounded border p-2"
            />

            <input
              placeholder="Format"
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value })}
              className="rounded border p-2"
            />

            <input
              type="number"
              placeholder="Employees"
              value={form.employees}
              onChange={(e) => setForm({ ...form, employees: e.target.value })}
              className="rounded border p-2"
            />

            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="rounded border p-2"
            />

            <input
              type="date"
              value={form.submittedDate}
              onChange={(e) => setForm({ ...form, submittedDate: e.target.value })}
              className="rounded border p-2"
            />
          </div>

          <button
            type="button"
            onClick={saveSubmission}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white"
          >
            Save Submission
          </button>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Format</th>
                <th className="px-3 py-2">Employees</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Due</th>
                <th className="px-3 py-2">Submitted</th>
                <th className="px-3 py-2">Recon</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{s.countryCode}</td>
                  <td className="px-3 py-2">{s.period}</td>
                  <td className="px-3 py-2">{s.fileFormat}</td>
                  <td className="px-3 py-2">{s.totalEmployees}</td>
                  <td className="px-3 py-2">{s.totalAmount}</td>
                  <td className="px-3 py-2 text-xs">{s.dueDate?.slice(0, 10)}</td>
                  <td className="px-3 py-2 text-xs">{s.submittedAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{s.reconciliationStatus ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[s.status] ?? ''}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {s.status === 'DRAFT' && (
                        <button
                          type="button"
                          onClick={() =>
                            call('generate', s, {
                              employerId: 'demo-1',
                              establishmentName: 'Demo Co',
                            })
                          }
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                        >
                          Generate
                        </button>
                      )}
                      {s.status === 'GENERATED' && (
                        <button
                          type="button"
                          onClick={() => call('validate', s)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                        >
                          Validate
                        </button>
                      )}
                      {(s.status === 'VALIDATED' || s.status === 'GENERATED') && (
                        <button
                          type="button"
                          onClick={() => call('submit', s)}
                          className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white"
                        >
                          Submit
                        </button>
                      )}
                      {s.status === 'SUBMITTED' && (
                        <button
                          type="button"
                          onClick={() =>
                            call('acknowledge', s, { ackReference: `ACK-${Date.now()}` })
                          }
                          className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                        >
                          Ack
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {subs.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-slate-500">
                    No submissions for {period}.
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
