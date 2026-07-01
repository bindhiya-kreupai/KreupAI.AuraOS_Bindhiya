'use client';

import { useEffect, useState } from 'react';

const BASE = '/api/v1/structural-extensions';

interface FundingLink {
  id: string;
  employeeId: string;
  schemeCode: string;
  fundingAccountRef: string | null;
  balance: number | null;
  currency: string | null;
  lastReconciledAt: string | null;
}

interface RtwPlan {
  id: string;
  employeeId: string;
  leaveCode: string;
  expectedReturnDate: string | null;
  phasedReturnPct: number | null;
  status: string;
  actualReturnDate: string | null;
}

function readList<T>(p: { success?: boolean; data?: unknown }): T[] {
  const d = p.data as { items?: T[] } | T[] | undefined;
  if (Array.isArray(d)) return d;
  return (d?.items as T[]) ?? [];
}

export default function EosSioFundingReturnToWorkPlansPage() {
  const [funding, setFunding] = useState<FundingLink[]>([]);
  const [plans, setPlans] = useState<RtwPlan[]>([]);
  const [message, setMessage] = useState('');

  const [fund, setFund] = useState({
    employeeId: '',
    schemeCode: '',
    fundingAccountRef: '',
    balance: '',
    currency: '',
  });
  const [plan, setPlan] = useState({
    employeeId: '',
    leaveCode: '',
    expectedReturnDate: '',
    phasedReturnPct: '',
  });
  const [returns, setReturns] = useState<Record<string, string>>({});

  async function loadFunding() {
    const r = await fetch(`${BASE}/eos-sio-funding`);
    const p = await r.json();
    if (p.success) setFunding(readList<FundingLink>(p));
  }
  async function loadPlans() {
    const r = await fetch(`${BASE}/return-to-work`);
    const p = await r.json();
    if (p.success) setPlans(readList<RtwPlan>(p));
  }
  useEffect(() => {
    loadFunding();
    loadPlans();
  }, []);

  async function post(path: string, body: unknown) {
    const r = await fetch(`${BASE}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return r.json();
  }

  async function upsertFunding() {
    const p = await post('eos-sio-funding', {
      action: 'upsert',
      employeeId: fund.employeeId,
      schemeCode: fund.schemeCode,
      fundingAccountRef: fund.fundingAccountRef || undefined,
      balance: fund.balance ? Number(fund.balance) : undefined,
      currency: fund.currency || undefined,
    });
    setMessage(p.success ? (p.message ?? 'Saved') : p.error?.message);
    if (p.success) {
      setFund({ employeeId: '', schemeCode: '', fundingAccountRef: '', balance: '', currency: '' });
      loadFunding();
    }
  }

  async function reconcile(id: string) {
    const p = await post('eos-sio-funding', { action: 'reconcile', id });
    setMessage(p.success ? (p.message ?? 'Reconciled') : p.error?.message);
    if (p.success) loadFunding();
  }

  async function createPlan() {
    const p = await post('return-to-work', {
      action: 'create',
      employeeId: plan.employeeId,
      leaveCode: plan.leaveCode,
      expectedReturnDate: plan.expectedReturnDate,
      phasedReturnPct: plan.phasedReturnPct ? Number(plan.phasedReturnPct) : undefined,
    });
    setMessage(p.success ? (p.message ?? 'Created') : p.error?.message);
    if (p.success) {
      setPlan({ employeeId: '', leaveCode: '', expectedReturnDate: '', phasedReturnPct: '' });
      loadPlans();
    }
  }

  async function confirmReturn(id: string) {
    const actualReturnDate = returns[id];
    if (!actualReturnDate) {
      setMessage('Actual return date required');
      return;
    }
    const p = await post('return-to-work', {
      action: 'confirm-return',
      id,
      actualReturnDate,
      fitnessClearance: true,
    });
    setMessage(p.success ? (p.message ?? 'Confirmed') : p.error?.message);
    if (p.success) loadPlans();
  }

  const input = 'rounded-md border border-slate-300 px-2 py-1.5 text-sm';
  const btn = 'rounded-md bg-slate-900 px-3 py-2 text-sm text-white';

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">Structural Extensions · AURA-522</p>
          <h1 className="text-2xl font-semibold">EOS↔SIO Funding &amp; Return-to-Work Plans</h1>
        </header>
        {message ? (
          <p className="rounded-md border border-slate-200 bg-white p-3 text-sm">{message}</p>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">EOS↔SIO Funding Links</h2>
          <div className="flex flex-wrap items-end gap-2">
            <input
              className={input}
              placeholder="Employee ID"
              value={fund.employeeId}
              onChange={(e) => setFund((f) => ({ ...f, employeeId: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Scheme code"
              value={fund.schemeCode}
              onChange={(e) => setFund((f) => ({ ...f, schemeCode: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Funding account ref"
              value={fund.fundingAccountRef}
              onChange={(e) => setFund((f) => ({ ...f, fundingAccountRef: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Balance"
              type="number"
              value={fund.balance}
              onChange={(e) => setFund((f) => ({ ...f, balance: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Currency"
              value={fund.currency}
              onChange={(e) => setFund((f) => ({ ...f, currency: e.target.value }))}
            />
            <button type="button" className={btn} onClick={upsertFunding}>
              Upsert
            </button>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Employee</th>
                <th>Scheme</th>
                <th>Account Ref</th>
                <th>Balance</th>
                <th>Currency</th>
                <th>Last Reconciled</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {funding.map((f) => (
                <tr key={f.id} className="border-t border-slate-100">
                  <td className="py-2">{f.employeeId}</td>
                  <td>{f.schemeCode}</td>
                  <td>{f.fundingAccountRef ?? '—'}</td>
                  <td>{f.balance ?? '—'}</td>
                  <td>{f.currency ?? '—'}</td>
                  <td>{f.lastReconciledAt ?? '—'}</td>
                  <td>
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      onClick={() => reconcile(f.id)}
                    >
                      Reconcile
                    </button>
                  </td>
                </tr>
              ))}
              {funding.length === 0 && (
                <tr>
                  <td className="py-2 text-slate-500" colSpan={7}>
                    No funding links yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Return-to-Work Plans</h2>
          <div className="flex flex-wrap items-end gap-2">
            <input
              className={input}
              placeholder="Employee ID"
              value={plan.employeeId}
              onChange={(e) => setPlan((f) => ({ ...f, employeeId: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Leave code"
              value={plan.leaveCode}
              onChange={(e) => setPlan((f) => ({ ...f, leaveCode: e.target.value }))}
            />
            <input
              className={input}
              type="date"
              value={plan.expectedReturnDate}
              onChange={(e) => setPlan((f) => ({ ...f, expectedReturnDate: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Phased return %"
              type="number"
              value={plan.phasedReturnPct}
              onChange={(e) => setPlan((f) => ({ ...f, phasedReturnPct: e.target.value }))}
            />
            <button type="button" className={btn} onClick={createPlan}>
              Create
            </button>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Employee</th>
                <th>Leave</th>
                <th>Expected Return</th>
                <th>Phased %</th>
                <th>Status</th>
                <th>Actual Return</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {plans.map((pl) => (
                <tr key={pl.id} className="border-t border-slate-100">
                  <td className="py-2">{pl.employeeId}</td>
                  <td>{pl.leaveCode}</td>
                  <td>{pl.expectedReturnDate ?? '—'}</td>
                  <td>{pl.phasedReturnPct ?? '—'}</td>
                  <td>{pl.status}</td>
                  <td>{pl.actualReturnDate ?? '—'}</td>
                  <td className="flex items-center gap-1 py-2">
                    <input
                      className={input}
                      type="date"
                      value={returns[pl.id] ?? ''}
                      onChange={(e) => setReturns((r) => ({ ...r, [pl.id]: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      onClick={() => confirmReturn(pl.id)}
                    >
                      Confirm Return
                    </button>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td className="py-2 text-slate-500" colSpan={7}>
                    No plans yet.
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
