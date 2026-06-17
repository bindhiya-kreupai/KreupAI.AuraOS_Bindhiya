'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  publishedCount: number;
  ackCoveragePct: number;
  ackBelowThresholdCount: number;
}

export default function AcknowledgementsPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [total, setTotal] = useState('100');

  async function load() {
    const r = await fetch(`/api/v1/hr-policies-compliance/dashboard?totalEmployees=${total}`);
    const p = await r.json();
    if (p.success) setData(p.data);
  }
  useEffect(() => {
    load();
  }, [total]);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-32 · S08</p>
          <h1 className="text-2xl font-semibold">Acknowledgement Coverage</h1>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <label className="text-sm">
            Total employee population for coverage calc
            <input
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="mt-1 w-32 rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
        </section>

        {data ? (
          <section className="grid gap-4 md:grid-cols-3">
            <Tile label="Published Policies" value={data.publishedCount} />
            <Tile
              label="Overall Ack Coverage %"
              value={data.ackCoveragePct}
              colour={data.ackCoveragePct >= 90 ? 'emerald' : 'rose'}
            />
            <Tile label="Policies < 90% Ack" value={data.ackBelowThresholdCount} colour="rose" />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
          Acknowledgement records live in the existing PolicyAcknowledgement model
          (aura_policy_acknowledgement). Coverage is computed as acks / population per published
          policy that requires acknowledgement; the certificate gates signing if any policy drops
          below 90%.
        </section>
      </div>
    </main>
  );
}

function Tile({ label, value, colour }: { label: string; value: number; colour?: string }) {
  const cls =
    colour === 'emerald'
      ? 'text-emerald-700'
      : colour === 'rose'
        ? 'text-rose-700'
        : 'text-slate-900';
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`text-3xl font-semibold ${cls}`}>{value}</p>
    </div>
  );
}
