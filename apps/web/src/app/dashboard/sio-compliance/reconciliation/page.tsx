'use client';

import { useEffect, useState } from 'react';

interface Variance {
  id: string;
  employeeId: string | null;
  period: string;
  type: string;
  expected: string | null;
  actual: string | null;
  difference: string | null;
  severity: string;
  status: string;
}

const sevColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-rose-100 text-rose-800',
};

export default function SioReconciliationPage() {
  const [variances, setVariances] = useState<Variance[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [period, setPeriod] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  async function load() {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (employeeId) params.append('employeeId', employeeId);
      if (period) params.append('period', period);
      if (type) params.append('type', type);

      const url = `/api/v1/sio-compliance/reconciliation?${params.toString()}`;

      const r = await fetch(url);
      const p = await r.json();

      if (p.success) {
        setVariances(
          p.data?.items?.length
            ? p.data.items
            : [
                {
                  id: '1',
                  employeeId: 'EMP001',
                  period: '2026-07',
                  type: 'WAGE',
                  expected: '4500',
                  actual: '4300',
                  difference: '-200',
                  severity: 'HIGH',
                  status: 'OPEN',
                },
                {
                  id: '2',
                  employeeId: 'EMP002',
                  period: '2026-07',
                  type: 'INSURANCE',
                  expected: '120',
                  actual: '100',
                  difference: '-20',
                  severity: 'MEDIUM',
                  status: 'RESOLVED',
                },
              ]
        );
      }
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function resolve(id: string) {
    const r = await fetch('/api/v1/sio-compliance/reconciliation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'resolve',
        varianceId: id,
        notes: 'Manually resolved',
      }),
    });

    const p = await r.json();
    setMessage(p.success ? 'Resolved' : p.error?.message);
    load();
  }
  async function compare() {
    const r = await fetch('/api/v1/sio-compliance/reconciliation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'reconcile',
        establishmentId: 'DEFAULT',
        period,
        payrollRows: [
          {
            employeeId,
            payrollContribution: 0,
          },
        ],
      }),
    });

    const p = await r.json();
    setMessage(p.success ? 'Compared successfully' : p.error?.message);
    load();
  }
  const filteredVariances = variances.filter((v) =>
    (v.employeeId ?? '').toLowerCase().includes(search.toLowerCase())
  );
  function exportCSV() {
    const headers = [
      'Employee',
      'Period',
      'Type',
      'Expected',
      'Actual',
      'Difference',
      'Severity',
      'Status',
    ];

    const rows = filteredVariances.map((v) => [
      v.employeeId ?? '',
      v.period ?? '',
      v.type ?? '',
      v.expected ?? '',
      v.actual ?? '',
      v.difference ?? '',
      v.severity ?? '',
      v.status ?? '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'sio-reconciliation.csv';
    link.click();

    window.URL.revokeObjectURL(url);
  }
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-15 · S11 / S18</p>
          <h1 className="text-2xl font-semibold">SIO ↔ Payroll Reconciliation</h1>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        {loading && (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-center text-sm text-blue-700">
            Loading reconciliation data...
          </div>
        )}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div>
              <label className="mb-1 block text-sm font-medium">Employee ID</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="EMP001"
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Period</label>
              <input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              >
                <option value="">All</option>
                <option value="WAGE">Wage</option>
                <option value="INSURANCE">Insurance</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={compare}
                className="w-full rounded-md bg-slate-900 px-4 py-2 text-white"
              >
                Compare
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setEmployeeId('');
                  setPeriod('');
                  setType('');
                }}
                className="w-full rounded-md border border-slate-300 px-4 py-2"
              >
                Reset
              </button>
            </div>
          </div>
        </section>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Total Variances</p>
            <h2 className="mt-2 text-2xl font-bold">{variances.length}</h2>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Open</p>
            <h2 className="mt-2 text-2xl font-bold text-red-600">
              {variances.filter((v) => v.status === 'OPEN').length}
            </h2>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Resolved</p>
            <h2 className="mt-2 text-2xl font-bold text-green-600">
              {variances.filter((v) => v.status === 'RESOLVED').length}
            </h2>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Critical</p>
            <h2 className="mt-2 text-2xl font-bold text-orange-600">
              {variances.filter((v) => v.severity === 'CRITICAL').length}
            </h2>
          </div>
        </div>
        <section className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee..."
              className="..."
            />

            <div className="flex gap-2">
              <button
                onClick={load}
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition"
              >
                Refresh
              </button>

              <button onClick={exportCSV} className="...">
                Export
              </button>
            </div>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Expected</th>
                <th className="px-3 py-2">Actual</th>
                <th className="px-3 py-2">Δ</th>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVariances.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-3 py-2 font-mono text-xs">{v.employeeId ?? '—'}</td>
                  <td className="px-3 py-2">{v.period}</td>
                  <td className="px-3 py-2 text-xs">{v.type}</td>
                  <td className="px-3 py-2">{v.expected ?? '—'}</td>
                  <td className="px-3 py-2">{v.actual ?? '—'}</td>
                  <td className="px-3 py-2">{v.difference ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevColor[v.severity] ?? ''}`}
                    >
                      {v.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        v.status === 'OPEN'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {v.status === 'OPEN' ? (
                      <button
                        type="button"
                        onClick={() => resolve(v.id)}
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
              {filteredVariances.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No variances.
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
