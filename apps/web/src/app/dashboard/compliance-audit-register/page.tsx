'use client';

import { useEffect, useState } from 'react';

interface DomainSummary {
  domainCode: string;
  openMandatory: number;
  openHighOrCritical: number;
}

interface ChecklistItem {
  id: string;
  domainCode: string;
  categoryCode: string;
  itemCode: string;
  label: string;
  ownerRole: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLIANT' | 'NON_COMPLIANT' | 'WAIVED';
  isMandatory: boolean;
}

interface RiskEntry {
  id: string;
  domainCode: string;
  riskCode: string;
  title: string;
  likelihood: number;
  impact: number;
  score: number;
  band: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'MITIGATED' | 'ACCEPTED' | 'TRANSFERRED' | 'CLOSED';
  ownerRole: string | null;
  controlRef: string | null;
  mitigationPlan: string | null;
}

const DOMAINS = ['ER', 'DISCIPLINARY', 'SEPARATION', 'EOSB', 'VISA_EXIT'];

const statusColor: Record<string, string> = {
  OPEN: 'bg-slate-200 text-slate-800',
  IN_PROGRESS: 'bg-amber-100 text-amber-900',
  COMPLIANT: 'bg-emerald-100 text-emerald-900',
  NON_COMPLIANT: 'bg-rose-100 text-rose-900',
  WAIVED: 'bg-slate-100 text-slate-600',
};
const bandColor: Record<string, string> = {
  LOW: 'bg-slate-200 text-slate-800',
  MEDIUM: 'bg-amber-100 text-amber-900',
  HIGH: 'bg-orange-200 text-orange-900',
  CRITICAL: 'bg-rose-200 text-rose-900',
};

export default function ComplianceAuditRegisterPage() {
  const [summary, setSummary] = useState<DomainSummary[]>([]);
  const [domain, setDomain] = useState('ER');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [risks, setRisks] = useState<RiskEntry[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/compliance-audit-register/dashboard');
    const p = await r.json();
    if (p.success) setSummary(p.data.perDomain ?? []);

    const cr = await fetch(`/api/v1/compliance-audit-register/checklists?domainCode=${domain}`);
    const cp = await cr.json();
    if (cp.success) setItems(cp.data ?? []);

    const rr = await fetch(`/api/v1/compliance-audit-register/risks?domainCode=${domain}`);
    const rp = await rr.json();
    if (rp.success) setRisks(rp.data ?? []);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  async function seed(kind: 'checklists' | 'risks') {
    setMessage('');
    const r = await fetch(`/api/v1/compliance-audit-register/${kind}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed', domainCode: domain }),
    });
    const p = await r.json();
    setMessage(p.success ? `Seeded ${kind} for ${domain}` : p.message);
    load();
  }

  async function setStatus(itemCode: string, status: ChecklistItem['status']) {
    setMessage('');
    const r = await fetch('/api/v1/compliance-audit-register/checklists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', itemCode, domainCode: domain, status }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Updated' : p.message);
    load();
  }

  async function reviewRisk(riskCode: string, status: RiskEntry['status']) {
    setMessage('');
    const r = await fetch('/api/v1/compliance-audit-register/risks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'review', riskCode, domainCode: domain, status }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Reviewed' : p.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">
            Theme C · EPIC-25-S12 · EPIC-26-S11 · EPIC-27-S17 · EPIC-28-S14 · EPIC-29-S15
          </p>
          <h1 className="text-2xl font-semibold">Compliance Audit Checklist + Risk Register</h1>
          <p className="mt-1 text-sm text-slate-600">
            Shared register for ER, Disciplinary, Separation, EOSB, and Visa-Exit. Same shape as the
            per-domain registers already shipped for org, payroll, records, talent-acquisition, and
            immigration.
          </p>
        </header>

        {message ? <p className="text-sm text-slate-700">{message}</p> : null}

        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {summary.map((s) => (
            <button
              key={s.domainCode}
              type="button"
              onClick={() => setDomain(s.domainCode)}
              className={`rounded-lg border p-3 text-left text-sm hover:border-slate-900 ${
                s.domainCode === domain ? 'border-slate-900 bg-white' : 'border-slate-200 bg-white'
              }`}
            >
              <p className="font-semibold">{s.domainCode}</p>
              <p className="mt-1 text-xs">
                <span className={s.openMandatory > 0 ? 'text-amber-700' : 'text-slate-500'}>
                  {s.openMandatory} open mandatory
                </span>
              </p>
              <p className="text-xs">
                <span className={s.openHighOrCritical > 0 ? 'text-rose-700' : 'text-slate-500'}>
                  {s.openHighOrCritical} open HIGH/CRITICAL
                </span>
              </p>
            </button>
          ))}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{domain} · Checklist</h2>
            <div className="flex gap-2">
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              >
                {DOMAINS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => seed('checklists')}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white"
              >
                Seed defaults
              </button>
            </div>
          </div>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Code</th>
                <th>Category</th>
                <th>Label</th>
                <th>Owner role</th>
                <th>Status</th>
                <th>Mandatory</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t border-slate-100">
                  <td className="py-2 font-mono text-xs">{it.itemCode}</td>
                  <td className="text-xs">{it.categoryCode}</td>
                  <td className="text-xs">{it.label}</td>
                  <td className="text-xs">{it.ownerRole ?? '—'}</td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[it.status]}`}
                    >
                      {it.status}
                    </span>
                  </td>
                  <td className="text-xs">{it.isMandatory ? 'YES' : 'no'}</td>
                  <td className="text-xs">
                    {it.status !== 'COMPLIANT' ? (
                      <button
                        type="button"
                        onClick={() => setStatus(it.itemCode, 'COMPLIANT')}
                        className="rounded-md bg-emerald-600 px-2 py-1 text-xs text-white"
                      >
                        Mark COMPLIANT
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setStatus(it.itemCode, 'OPEN')}
                        className="rounded-md bg-slate-700 px-2 py-1 text-xs text-white"
                      >
                        Reopen
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-xs text-slate-500">
                    No items. Seed defaults.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{domain} · Risk Register (L × I)</h2>
            <button
              type="button"
              onClick={() => seed('risks')}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white"
            >
              Seed defaults
            </button>
          </div>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Code</th>
                <th>Title</th>
                <th>L</th>
                <th>I</th>
                <th>Score</th>
                <th>Band</th>
                <th>Status</th>
                <th>Control / mitigation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 align-top">
                  <td className="py-2 font-mono text-xs">{r.riskCode}</td>
                  <td className="text-xs">{r.title}</td>
                  <td className="text-xs">{r.likelihood}</td>
                  <td className="text-xs">{r.impact}</td>
                  <td className="text-xs">{r.score}</td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${bandColor[r.band]}`}
                    >
                      {r.band}
                    </span>
                  </td>
                  <td className="text-xs">{r.status}</td>
                  <td className="text-xs">{r.controlRef ?? r.mitigationPlan ?? '—'}</td>
                  <td className="text-xs">
                    {r.status === 'OPEN' ? (
                      <button
                        type="button"
                        onClick={() => reviewRisk(r.riskCode, 'MITIGATED')}
                        className="rounded-md bg-emerald-600 px-2 py-1 text-xs text-white"
                      >
                        Mark MITIGATED
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => reviewRisk(r.riskCode, 'OPEN')}
                        className="rounded-md bg-slate-700 px-2 py-1 text-xs text-white"
                      >
                        Reopen
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {risks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-4 text-center text-xs text-slate-500">
                    No risks. Seed defaults.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
