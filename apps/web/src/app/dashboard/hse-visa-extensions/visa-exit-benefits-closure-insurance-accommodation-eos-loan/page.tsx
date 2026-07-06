'use client';

import { useEffect, useState } from 'react';

interface BenefitClosure {
  id: string;
  visaExitCaseId: string;
  benefitCategory: string;
  status: string | null;
  amountSettled: number | null;
  notes: string | null;
}

function readList<T>(payload: { data?: { items?: T[] } | T[] }): T[] {
  const data = payload.data;
  if (Array.isArray(data)) return data;
  return (data?.items as T[] | undefined) ?? [];
}

const BASE = '/api/v1/hse-visa-extensions';

export default function BenefitsClosurePage() {
  const [message, setMessage] = useState('');
  const [items, setItems] = useState<BenefitClosure[]>([]);
  const [caseId, setCaseId] = useState('');
  const [closeForm, setCloseForm] = useState<
    Record<string, { amountSettled: string; notes: string }>
  >({});

  async function load() {
    const url = new URL(`${BASE}/benefits-closure`, window.location.origin);
    if (caseId) url.searchParams.set('visaExitCaseId', caseId);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setItems(readList<BenefitClosure>(p));
  }

  async function seedDefaults() {
    const r = await fetch(`${BASE}/benefits-closure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-defaults', visaExitCaseId: caseId }),
    });
    const p = await r.json();
    setMessage(p.success ? (p.message ?? 'Seeded') : p.error?.message);
    load();
  }

  async function closeItem(id: string) {
    const cf = closeForm[id] ?? { amountSettled: '', notes: '' };
    const r = await fetch(`${BASE}/benefits-closure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'close',
        id,
        amountSettled: cf.amountSettled ? Number(cf.amountSettled) : undefined,
        notes: cf.notes || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? (p.message ?? 'Closed') : p.error?.message);
    load();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const inputCls = 'rounded-md border border-slate-300 px-2 py-1.5 text-sm';
  const btnCls = 'rounded-md bg-slate-900 px-3 py-2 text-sm text-white';

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">Visa-Exit · AURA-445</p>
          <h1 className="text-2xl font-semibold">
            Benefits Closure — Insurance · Accommodation · EOS · Loan
          </h1>
          {message ? <p className="mt-2 text-sm text-slate-700">{message}</p> : null}
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              className={inputCls}
              placeholder="visaExitCaseId"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
            />
            <button type="button" className={btnCls} onClick={seedDefaults} disabled={!caseId}>
              Seed Default Closure Items
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-3">visaExitCaseId</th>
                  <th className="py-2 pr-3">benefitCategory</th>
                  <th className="py-2 pr-3">status</th>
                  <th className="py-2 pr-3">amountSettled</th>
                  <th className="py-2 pr-3">notes</th>
                  <th className="py-2 pr-3">close</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => {
                  const cf = closeForm[it.id] ?? { amountSettled: '', notes: '' };
                  return (
                    <tr key={it.id} className="border-b border-slate-100 align-top">
                      <td className="py-2 pr-3">{it.visaExitCaseId}</td>
                      <td className="py-2 pr-3">{it.benefitCategory}</td>
                      <td className="py-2 pr-3">{it.status ?? '—'}</td>
                      <td className="py-2 pr-3">{it.amountSettled ?? '—'}</td>
                      <td className="py-2 pr-3">{it.notes ?? '—'}</td>
                      <td className="py-2 pr-3">
                        <div className="flex flex-wrap gap-1">
                          <input
                            className={`${inputCls} w-28`}
                            placeholder="amount"
                            value={cf.amountSettled}
                            onChange={(e) =>
                              setCloseForm((s) => ({
                                ...s,
                                [it.id]: { ...cf, amountSettled: e.target.value },
                              }))
                            }
                          />
                          <input
                            className={inputCls}
                            placeholder="notes"
                            value={cf.notes}
                            onChange={(e) =>
                              setCloseForm((s) => ({
                                ...s,
                                [it.id]: { ...cf, notes: e.target.value },
                              }))
                            }
                          />
                          <button type="button" className={btnCls} onClick={() => closeItem(it.id)}>
                            Close
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={6}>
                      No closure items yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
