'use client';

import { useEffect, useState } from 'react';

interface StageBreakdown {
  stage: string;
  total: number;
  pass: number;
  fail: number;
  observation: number;
  unchecked: number;
}

export default function TaStageBreakdownPage() {
  const [stages, setStages] = useState<StageBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch('/api/v1/talent-acquisition-compliance/dashboard');
      const json = await res.json();
      console.log(json);
      console.log(json.data?.stageBreakdown);

      if (json.success) {
        setStages(json.data?.stageBreakdown ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-03/04/05</p>

          <h1 className="text-3xl font-semibold">Talent Acquisition Stage Breakdown</h1>

          <p className="mt-2 text-slate-600">
            Stage-wise audit summary across the Talent Acquisition lifecycle.
          </p>
        </header>

        <section className="grid grid-cols-5 gap-4">
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-slate-500">Stages</div>
            <div className="mt-2 text-3xl font-bold">{stages.length}</div>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-slate-500">Pass</div>
            <div className="mt-2 text-3xl font-bold text-emerald-600">
              {stages.reduce((a, b) => a + b.pass, 0)}
            </div>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-slate-500">Fail</div>
            <div className="mt-2 text-3xl font-bold text-rose-600">
              {stages.reduce((a, b) => a + b.fail, 0)}
            </div>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-slate-500">Observation</div>
            <div className="mt-2 text-3xl font-bold text-amber-600">
              {stages.reduce((a, b) => a + b.observation, 0)}
            </div>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-slate-500">Unchecked</div>
            <div className="mt-2 text-3xl font-bold text-slate-600">
              {stages.reduce((a, b) => a + b.unchecked, 0)}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Stage</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Pass</th>
                <th className="px-3 py-2">Fail</th>
                <th className="px-3 py-2">Observation</th>
                <th className="px-3 py-2">Unchecked</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : stages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    No stage breakdown available.
                  </td>
                </tr>
              ) : (
                stages.map((stage, index) => (
                  <tr key={stage.stage} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-medium">{stage.stage}</td>

                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={stage.total}
                        onChange={(e) => {
                          const updated = [...stages];
                          updated[index].total = Number(e.target.value);
                          setStages(updated);
                        }}
                        className="w-16 rounded border px-2 py-1"
                      />
                    </td>

                    <td className="px-3 py-2 text-emerald-600">
                      <input
                        type="number"
                        value={stage.pass}
                        onChange={(e) => {
                          const updated = [...stages];
                          updated[index].pass = Number(e.target.value);
                          setStages(updated);
                        }}
                        className="w-16 rounded border px-2 py-1"
                      />
                    </td>

                    <td className="px-3 py-2 text-rose-600">
                      <input
                        type="number"
                        value={stage.fail}
                        onChange={(e) => {
                          const updated = [...stages];
                          updated[index].fail = Number(e.target.value);
                          setStages(updated);
                        }}
                        className="w-16 rounded border px-2 py-1"
                      />
                    </td>

                    <td className="px-3 py-2 text-amber-600">
                      <input
                        type="number"
                        value={stage.observation}
                        onChange={(e) => {
                          const updated = [...stages];
                          updated[index].observation = Number(e.target.value);
                          setStages(updated);
                        }}
                        className="w-16 rounded border px-2 py-1"
                      />
                    </td>

                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={stage.unchecked}
                        onChange={(e) => {
                          const updated = [...stages];
                          updated[index].unchecked = Number(e.target.value);
                          setStages(updated);
                        }}
                        className="w-16 rounded border px-2 py-1"
                      />
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
