'use client';

import { useEffect, useState } from 'react';

interface Reg {
  id: string;
  employeeId: string;
  establishmentId: string;
  nationalityClass: string;
  status: string;
  registrationDate: string;
  emiratesId: string | null;
}

export default function RegistrationsPage() {
  const [regs, setRegs] = useState<Reg[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    employeeId: '',
    establishmentId: '',
    nationalityClass: 'UAE_NATIONAL',
    emiratesId: '',
  });

  async function load() {
    const r = await fetch('/api/v1/gpssa-compliance/registrations');
    const p = await r.json();
    if (p.success) setRegs(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function register() {
    setMessage('');
    const r = await fetch('/api/v1/gpssa-compliance/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', ...form }),
    });
    const p = await r.json();
    setMessage(
      p.success ? 'Registered' : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-14 · S04 / S09 / S10</p>
          <h1 className="text-2xl font-semibold">GPSSA Registrations</h1>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-5">
          <label className="text-sm">
            Employee ID
            <input
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Establishment ID
            <input
              value={form.establishmentId}
              onChange={(e) => setForm((f) => ({ ...f, establishmentId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Nationality
            <select
              value={form.nationalityClass}
              onChange={(e) => setForm((f) => ({ ...f, nationalityClass: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['UAE_NATIONAL', 'GCC_NATIONAL_OTHER'].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Emirates ID
            <input
              value={form.emiratesId}
              onChange={(e) => setForm((f) => ({ ...f, emiratesId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={register}
            className="self-end rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Register
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Establishment</th>
                <th className="px-3 py-2">Class</th>
                <th className="px-3 py-2">Emirates ID</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Registered</th>
              </tr>
            </thead>
            <tbody>
              {regs.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.employeeId}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.establishmentId}</td>
                  <td className="px-3 py-2">{r.nationalityClass}</td>
                  <td className="px-3 py-2 text-xs">{r.emiratesId ?? '—'}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2 text-xs">{r.registrationDate?.slice(0, 10)}</td>
                </tr>
              ))}
              {regs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    No registrations.
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
