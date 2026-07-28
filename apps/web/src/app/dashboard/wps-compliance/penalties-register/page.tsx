'use client';

import { useEffect, useState } from 'react';

interface Penalty {
  id: string;
  countryCode: string;
  period: string;
  type: string;
  description: string;
  amount: string | null;
  currency: string | null;
  status: string;
  raisedAt: string;
}

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [countryCode, setCountryCode] = useState('');
  const [establishmentId, setEstablishmentId] = useState('');
  const [period, setPeriod] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');

  async function load() {
    const r = await fetch('/api/v1/wps-compliance/penalties');
    const p = await r.json();
    if (p.success) setPenalties(p.data ?? []);
  }
  async function raisePenalty() {
    const r = await fetch('/api/v1/wps-compliance/penalties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'raise',
        countryCode,
        establishmentId,
        period,
        type,
        description,
      }),
    });

    const p = await r.json();

    if (p.success) {
      await load();

      setCountryCode('');
      setEstablishmentId('');
      setPeriod('');
      setType('');
      setDescription('');
    } else {
      alert(p.error ?? 'Failed to raise penalty');
    }
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-11 · S10</p>
          <h1 className="text-2xl font-semibold">WPS Penalty Register</h1>
        </header>
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold">Raise New Penalty</h2>

          <div className="grid grid-cols-2 gap-4">
            <input
              className="rounded border p-2"
              placeholder="Country Code"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            />

            <input
              className="rounded border p-2"
              placeholder="Establishment ID"
              value={establishmentId}
              onChange={(e) => setEstablishmentId(e.target.value)}
            />

            <input
              className="rounded border p-2"
              placeholder="Period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />

            <input
              className="rounded border p-2"
              placeholder="Penalty Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />

            <input
              className="col-span-2 rounded border p-2"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button onClick={raisePenalty} className="mt-4 rounded bg-blue-600 px-4 py-2 text-white">
            Raise Penalty
          </button>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {penalties.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{p.countryCode}</td>
                  <td className="px-3 py-2">{p.period}</td>
                  <td className="px-3 py-2">{p.type}</td>
                  <td className="px-3 py-2">{p.description}</td>
                  <td className="px-3 py-2 text-xs">
                    {p.amount ? `${p.amount} ${p.currency ?? ''}` : '—'}
                  </td>
                  <td className="px-3 py-2">{p.status}</td>
                  <td className="px-3 py-2">
                    {p.status !== 'RESOLVED' && (
                      <button
                        className="rounded bg-green-600 px-3 py-1 text-white"
                        onClick={async () => {
                          await fetch('/api/v1/wps-compliance/penalties', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              action: 'resolve',
                              penaltyId: p.id,
                            }),
                          });

                          load();
                        }}
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {penalties.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    No penalties.
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
