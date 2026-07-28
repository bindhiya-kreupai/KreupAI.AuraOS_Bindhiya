'use client';

import { useEffect, useState } from 'react';

interface DelayFlag {
  id: string;
  employeeId: string;
  countryCode: string;
  period: string;
  dueDate: string;
  daysLate: number;
  severity: string;
  status: string;
}
interface Exception {
  id: string;
  code: string;
  description: string;
  severity: string;
  status: string;
  ownerRole: string;
}

const sevColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-rose-100 text-rose-800',
};

export default function ExceptionsPage() {
  const [tab, setTab] = useState<'exceptions' | 'delays'>('delays');
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [delays, setDelays] = useState<DelayFlag[]>([]);
  const [message, setMessage] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('');
  const [ownerRole, setOwnerRole] = useState('');
  const [employee, setEmployee] = useState('');
  const [country, setCountry] = useState('');
  const [period, setPeriod] = useState('');
  const [due, setDue] = useState('');
  const [daysLate, setDaysLate] = useState('');

  async function load() {
    // Exceptions
    const e = await fetch('/api/v1/wps-compliance/exceptions').then((r) => r.json());

    if (e.success) {
      setExceptions(
        Array.isArray(e.data) ? e.data : Array.isArray(e.data?.items) ? e.data.items : []
      );
    } else {
      setExceptions([]);
    }

    // Delay Flags
    const d = await fetch('/api/v1/wps-compliance/exceptions?view=delay-flags').then((r) =>
      r.json()
    );

    console.log('Delay API:', d);

    if (d.success) {
      setDelays(Array.isArray(d.data) ? d.data : Array.isArray(d.data?.items) ? d.data.items : []);
    } else {
      setDelays([]);
    }
  }
  async function resolve(flagId: string) {
    const r = await fetch('/api/v1/wps-compliance/exceptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resolve-delay-flag', flagId }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Resolved' : p.error?.message);
    load();
  }
  async function raiseException() {
    const r = await fetch('/api/v1/wps-compliance/exceptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'record-delay',
        code,
        description,
        severity,
        ownerRole,
      }),
    });

    const p = await r.json();

    if (p.success) {
      setMessage('Raised');
      setCode('');
      setDescription('');
      setSeverity('');
      setOwnerRole('');
      load();
    } else {
      setMessage(p.error?.message ?? 'Failed');
    }
  }
  async function createDelayFlag() {
    const r = await fetch('/api/v1/wps-compliance/exceptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'record-delay',
        employeeId: employee,
        countryCode: country,
        period,
        dueDate: due,
        creditedAt: new Date().toISOString(),
        submissionId: `MANUAL-${Date.now()}`,
      }),
    });

    const p = await r.json();

    if (p.success) {
      setMessage('Delay flag created');
      load();
    } else {
      setMessage(p.error?.message ?? 'Failed');
    }
  }
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-11 · S08–S09</p>
          <h1 className="text-2xl font-semibold">WPS Exceptions & Salary Delay Flags</h1>
        </header>
        <section className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab('delays')}
            className={`rounded-md px-3 py-1.5 text-sm ${tab === 'delays' ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}
          >
            Delay flags ({delays.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('exceptions')}
            className={`rounded-md px-3 py-1.5 text-sm ${tab === 'exceptions' ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}
          >
            Exceptions ({exceptions.length})
          </button>
          {message ? <span className="text-sm">{message}</span> : null}
        </section>
        {tab === 'exceptions' && (
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-4 text-lg font-semibold">Raise New Exception</h2>

            <div className="grid grid-cols-2 gap-4">
              <input
                className="rounded border p-2"
                placeholder="Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />

              <input
                className="rounded border p-2"
                placeholder="Owner Role"
                value={ownerRole}
                onChange={(e) => setOwnerRole(e.target.value)}
              />

              <input
                className="rounded border p-2"
                placeholder="Severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              />

              <input
                className="col-span-2 rounded border p-2"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button
              onClick={raiseException}
              className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
            >
              Raise Exception
            </button>
          </section>
        )}
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          {tab === 'delays' ? (
            <>
              {/* Delay Flag Form */}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  className="rounded border p-2"
                  placeholder="Employee"
                  value={employee}
                  onChange={(e) => setEmployee(e.target.value)}
                />

                <input
                  className="rounded border p-2"
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />

                <input
                  className="rounded border p-2"
                  placeholder="Period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                />

                <input
                  className="rounded border p-2"
                  type="date"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                />

                <input
                  type="number"
                  placeholder="Days Late"
                  value={daysLate}
                  onChange={(e) => setDaysLate(e.target.value)}
                  className="rounded border p-2"
                />

                <select
                  className="rounded border p-2"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                >
                  <option value="">Severity</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>

                <button
                  type="button"
                  onClick={createDelayFlag}
                  className="rounded bg-slate-900 text-white px-4 py-2"
                >
                  Create Delay Flag
                </button>
              </div>

              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Employee</th>
                    <th className="px-3 py-2">Country</th>
                    <th className="px-3 py-2">Period</th>
                    <th className="px-3 py-2">Due</th>
                    <th className="px-3 py-2">Days Late</th>
                    <th className="px-3 py-2">Severity</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(delays) &&
                    delays.map((d) => (
                      <tr key={d.id} className="border-b border-slate-100">
                        <td className="px-3 py-2 font-mono text-xs">{d.employeeId}</td>
                        <td className="px-3 py-2">{d.countryCode}</td>
                        <td className="px-3 py-2">{d.period}</td>
                        <td className="px-3 py-2 text-xs">{d.dueDate?.slice(0, 10)}</td>
                        <td className="px-3 py-2">{d.daysLate}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevColor[d.severity] ?? ''}`}
                          >
                            {d.severity}
                          </span>
                        </td>
                        <td className="px-3 py-2">{d.status}</td>
                        <td className="px-3 py-2">
                          {d.status === 'OPEN' ? (
                            <button
                              type="button"
                              onClick={() => resolve(d.id)}
                              className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                            >
                              Resolve
                            </button>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  {delays.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                        No delay flags.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Severity</th>
                  <th className="px-3 py-2">Owner</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(exceptions) &&
                  exceptions.map((e) => (
                    <tr key={e.id} className="border-b border-slate-100">
                      <td className="px-3 py-2 font-mono text-xs">{e.code}</td>
                      <td className="px-3 py-2">{e.description}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevColor[e.severity] ?? ''}`}
                        >
                          {e.severity}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">{e.ownerRole}</td>
                      <td className="px-3 py-2">{e.status}</td>
                    </tr>
                  ))}
                {exceptions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                      No exceptions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
