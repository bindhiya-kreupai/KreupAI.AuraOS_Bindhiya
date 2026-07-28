'use client';

import { useEffect, useState } from 'react';
import { EmployeeSearchableSelect } from '@/components/shared/EmployeeSearchableSelect';
import { Loader2 } from 'lucide-react';

interface Calc {
  id: string;
  employeeId: string;
  countryCode: string;
  joiningDate: string;
  lastWorkingDate: string;
  terminationType: string;
  basicSalary: string;
  totalServiceYears: string;
  totalServiceMonths: number;
  dailyRate: string;
  gratuityAmount: string;
  socialInsuranceOffset: string;
  netPayable: string;
  currency: string;
  law: string | null;
  status: string;
  paymentReference: string | null;
}

const statusColor: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-indigo-100 text-indigo-800',
  SETTLED: 'bg-emerald-100 text-emerald-800',
};

export default function EosbCalcsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    employeeId: '',
    countryCode: 'AE',
    joiningDate: new Date(new Date().setFullYear(new Date().getFullYear() - 2))
      .toISOString()
      .slice(0, 10),
    lastWorkingDate: new Date().toISOString().slice(0, 10),
    basicSalary: '10000',
    terminationType: 'RESIGNATION',
    unpaidLeaveDays: '0',
    socialInsuranceOffset: '0',
  });
  const [message, setMessage] = useState('');

  async function load() {
    setIsLoading(true);
    try {
      const url = new URL('/api/v1/eosb-compliance/calculations', window.location.origin);
      if (filter) url.searchParams.set('status', filter);
      const r = await fetch(url.toString());
      const p = await r.json();
      if (p.success) {
        setRows(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
      }
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function finalize() {
    setIsFinalizing(true);
    setMessage('');
    try {
      const r = await fetch('/api/v1/eosb-compliance/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'finalize',
          ...form,
          basicSalary: Number(form.basicSalary),
          unpaidLeaveDays: Number(form.unpaidLeaveDays),
          socialInsuranceOffset: Number(form.socialInsuranceOffset),
        }),
      });
      const p = await r.json();
      setMessage(
        p.success ? 'Finalized' : (p.error?.details?.error ?? p.error?.message ?? 'failed')
      );
    } finally {
      setIsFinalizing(false);
      load();
    }
  }

  async function approve(id: string) {
    setActionLoadingId(id);
    try {
      const r = await fetch('/api/v1/eosb-compliance/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', id }),
      });
      const p = await r.json();
      setMessage(p.success ? 'Approved' : p.error?.message);
    } finally {
      setActionLoadingId(null);
      load();
    }
  }
  async function settle(id: string) {
    const ref = window.prompt('Payment reference?') ?? '';
    if (!ref) return;
    setActionLoadingId(id);
    try {
      const r = await fetch('/api/v1/eosb-compliance/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'settle', id, paymentReference: ref }),
      });
      const p = await r.json();
      setMessage(p.success ? 'Settled' : p.error?.message);
    } finally {
      setActionLoadingId(null);
      load();
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">
              EPIC-28 · S03 / S06 / S07 / S08 / S12
            </p>
            <h1 className="text-2xl font-semibold">Finalized EOSB Calculations</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="DRAFT">DRAFT</option>
            <option value="APPROVED">APPROVED</option>
            <option value="SETTLED">SETTLED</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-8">
          <label className="text-sm flex flex-col gap-1">
            Employee Name
            <EmployeeSearchableSelect
              value={form.employeeId}
              onChange={(val) => setForm((f) => ({ ...f, employeeId: val }))}
              placeholder="Search employee..."
            />
          </label>
          <label className="text-sm">
            Country
            <select
              value={form.countryCode}
              onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['AE', 'SA', 'BH', 'QA', 'OM', 'KW', 'IN'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Joining
            <input
              type="date"
              value={form.joiningDate}
              onChange={(e) => setForm((f) => ({ ...f, joiningDate: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Last Day
            <input
              type="date"
              value={form.lastWorkingDate}
              onChange={(e) => setForm((f) => ({ ...f, lastWorkingDate: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Basic
            <input
              value={form.basicSalary}
              onChange={(e) => setForm((f) => ({ ...f, basicSalary: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Type
            <select
              value={form.terminationType}
              onChange={(e) => setForm((f) => ({ ...f, terminationType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {[
                'RESIGNATION',
                'TERMINATION',
                'TERMINATION_WITHOUT_CAUSE',
                'END_OF_CONTRACT',
                'RETIREMENT',
                'DEATH',
                'DISABILITY',
                'MUTUAL_AGREEMENT',
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            SI Offset
            <input
              value={form.socialInsuranceOffset}
              onChange={(e) => setForm((f) => ({ ...f, socialInsuranceOffset: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={finalize}
            disabled={isFinalizing || isLoading}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white flex items-center justify-center gap-1.5"
          >
            {isFinalizing && <Loader2 className="w-4 h-4 animate-spin" />}
            {isFinalizing ? 'Finalizing...' : 'Finalize'}
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Service</th>
                <th className="px-3 py-2">Basic</th>
                <th className="px-3 py-2">Gratuity</th>
                <th className="px-3 py-2">SI Offset</th>
                <th className="px-3 py-2">Net Payable</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-slate-400">
                    No calculations found
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">
                      <div className="font-semibold text-slate-900">
                        {r.employeeName ?? r.employeeId}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {r.joiningDate?.slice(0, 10)} to {r.lastWorkingDate?.slice(0, 10)} (
                        {r.terminationType})
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {r.totalServiceYears}y {r.totalServiceMonths}m
                    </td>
                    <td className="px-3 py-2">{r.basicSalary} AED</td>
                    <td className="px-3 py-2">{r.gratuityAmount} AED</td>
                    <td className="px-3 py-2">{r.socialInsuranceOffset} AED</td>
                    <td className="px-3 py-2 font-semibold text-emerald-700">{r.netPayable} AED</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[r.status] ?? ''}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {r.status === 'DRAFT' && (
                          <button
                            type="button"
                            onClick={() => approve(r.id)}
                            disabled={actionLoadingId === r.id}
                            className="rounded-md bg-indigo-700 px-2 py-1 text-xs text-white flex items-center justify-center gap-1"
                          >
                            {actionLoadingId === r.id && (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            )}
                            {actionLoadingId === r.id ? 'Approving...' : 'Approve'}
                          </button>
                        )}
                        {r.status === 'APPROVED' && (
                          <button
                            type="button"
                            onClick={() => settle(r.id)}
                            disabled={actionLoadingId === r.id}
                            className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white flex items-center justify-center gap-1"
                          >
                            {actionLoadingId === r.id && (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            )}
                            {actionLoadingId === r.id ? 'Settling...' : 'Settle'}
                          </button>
                        )}
                        {r.paymentReference && (
                          <span className="font-mono text-xs text-slate-500">
                            {r.paymentReference}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
