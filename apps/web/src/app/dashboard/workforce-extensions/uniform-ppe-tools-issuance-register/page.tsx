'use client';

import { useEffect, useState } from 'react';

interface Issuance {
  id: string;
  employeeId: string;
  itemCode: string;
  itemLabel: string;
  category: string;
  quantity: number;
  issuedAt: string | null;
  returnedAt: string | null;
}

const CATEGORIES = ['UNIFORM', 'PPE', 'TOOLS'];
const CONDITIONS = ['GOOD', 'DAMAGED'];

export default function IssuanceRegisterPage() {
  const [rows, setRows] = useState<Issuance[]>([]);
  const [filter, setFilter] = useState({ employeeId: '', category: '' });
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    employeeId: '',
    itemCode: '',
    itemLabel: '',
    category: 'UNIFORM',
    quantity: '',
    notes: '',
  });
  const [condition, setCondition] = useState<Record<string, string>>({});

  async function load() {
    const url = new URL('/api/v1/workforce-extensions/issuance', window.location.origin);
    if (filter.employeeId) url.searchParams.set('employeeId', filter.employeeId);
    if (filter.category) url.searchParams.set('category', filter.category);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows((p.data?.items ?? []) as Issuance[]);
  }

  useEffect(() => {
    load();
  }, [filter.employeeId, filter.category]);

  async function issue() {
    const r = await fetch('/api/v1/workforce-extensions/issuance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'issue',
        employeeId: form.employeeId,
        itemCode: form.itemCode,
        itemLabel: form.itemLabel,
        category: form.category || undefined,
        quantity: form.quantity ? Number(form.quantity) : undefined,
        notes: form.notes || undefined,
      }),
    });
    const p = await r.json();
    if (p.success) {
      setMessage(p.message ?? 'Issued');
      load();
    } else {
      setMessage(p.error?.message ?? 'Error');
    }
  }

  async function markReturned(id: string) {
    const r = await fetch('/api/v1/workforce-extensions/issuance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'return', id, condition: condition[id] ?? 'GOOD' }),
    });
    const p = await r.json();
    if (p.success) {
      setMessage(p.message ?? 'Returned');
      load();
    } else {
      setMessage(p.error?.message ?? 'Error');
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">Workforce Extensions · AURA-543</p>
          <h1 className="text-2xl font-semibold">Uniform / PPE / Tools Issuance Register</h1>
          {message ? <p className="mt-2 text-sm text-slate-700">{message}</p> : null}
        </header>

        <section className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <label className="text-sm">
            employeeId
            <input
              value={filter.employeeId}
              onChange={(e) => setFilter((f) => ({ ...f, employeeId: e.target.value }))}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-sm">
            Category
            <select
              value={filter.category}
              onChange={(e) => setFilter((f) => ({ ...f, category: e.target.value }))}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </section>

        <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Issue Item</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <input
              placeholder="employeeId"
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="itemCode"
              value={form.itemCode}
              onChange={(e) => setForm((f) => ({ ...f, itemCode: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="itemLabel"
              value={form.itemLabel}
              onChange={(e) => setForm((f) => ({ ...f, itemLabel: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              placeholder="quantity"
              type="number"
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              placeholder="notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={issue}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Issue Item
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2">employeeId</th>
                  <th>itemCode</th>
                  <th>itemLabel</th>
                  <th>category</th>
                  <th>quantity</th>
                  <th>issuedAt</th>
                  <th>returnedAt</th>
                  <th>Return</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-2 font-mono text-xs">{row.employeeId}</td>
                    <td className="font-mono text-xs">{row.itemCode}</td>
                    <td>{row.itemLabel}</td>
                    <td>{row.category}</td>
                    <td>{row.quantity}</td>
                    <td>
                      {row.issuedAt ? new Date(row.issuedAt).toISOString().slice(0, 10) : '—'}
                    </td>
                    <td>
                      {row.returnedAt ? new Date(row.returnedAt).toISOString().slice(0, 10) : '—'}
                    </td>
                    <td className="flex items-center gap-2 py-2">
                      <select
                        value={condition[row.id] ?? 'GOOD'}
                        onChange={(e) => setCondition((s) => ({ ...s, [row.id]: e.target.value }))}
                        className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                      >
                        {CONDITIONS.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => markReturned(row.id)}
                        className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white"
                      >
                        Return
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-3 text-slate-500">
                      No issuances yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
