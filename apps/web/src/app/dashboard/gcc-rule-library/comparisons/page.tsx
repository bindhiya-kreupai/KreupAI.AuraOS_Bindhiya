'use client';

import { useEffect, useState } from 'react';

interface Cell {
  countryCode: string;
  value: unknown;
  authority?: string;
  citation?: string;
}
interface Row {
  domain: string;
  ruleKey: string;
  cells: Record<string, Cell | null>;
}

const DOMAINS = ['PAYROLL', 'SOCIAL_INSURANCE', 'NATIONALIZATION', 'IMMIGRATION', 'EOSB'];
const GCC = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'];

export default function ComparisonsPage() {
  const [domain, setDomain] = useState('PAYROLL');
  const [rows, setRows] = useState<Row[]>([]);

  async function load() {
    const r = await fetch(`/api/v1/gcc-rule-library/comparisons?domain=${domain}`);
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [domain]);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-36 · S05</p>
          <h1 className="text-2xl font-semibold">GCC Comparison Tables</h1>
        </header>

        <section className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4">
          {DOMAINS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDomain(d)}
              className={`rounded-md px-3 py-2 text-sm ${
                domain === d ? 'bg-slate-900 text-white' : 'border border-slate-300'
              }`}
            >
              {d}
            </button>
          ))}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Rule</th>
                {GCC.map((c) => (
                  <th key={c} className="px-3 py-2">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.ruleKey} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{row.ruleKey}</td>
                  {GCC.map((c) => {
                    const cell = row.cells[c];
                    return (
                      <td key={c} className="px-3 py-2 align-top">
                        {cell ? (
                          <div>
                            <p className="text-xs">{JSON.stringify(cell.value)}</p>
                            {cell.authority ? (
                              <p className="text-[10px] text-slate-500">{cell.authority}</p>
                            ) : null}
                            {cell.citation ? (
                              <p className="text-[10px] italic text-slate-500">{cell.citation}</p>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No active rule packs for this domain.
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
