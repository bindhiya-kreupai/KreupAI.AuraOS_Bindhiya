'use client';

import { useEffect, useState } from 'react';

interface Pol {
  id: string;
  country: string;
  grade: string | null;
  isEligible: boolean;
  lateToleranceMin: number;
  earlyDepartureToleranceMin: number;
  missingPunchSlaHours: number;
  regularizationSlaDays: number;
  ramadanReducedHours: string;
  remoteWorkAllowed: boolean;
  fraudGeofenceRadiusM: number;
  biometricRequired: boolean;
  effectiveFrom: string;
}

export default function PoliciesPage() {
  const [rows, setRows] = useState<Pol[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/attendance-compliance/policies');
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function seed() {
    setMessage('');
    const r = await fetch('/api/v1/attendance-compliance/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-defaults' }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Seeded' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-19 · S02 / S03 / S04 / S12</p>
            <h1 className="text-2xl font-semibold">Attendance Policy (GCC × Grade)</h1>
          </div>
          <button
            type="button"
            onClick={seed}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Seed GCC Defaults
          </button>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Grade</th>
                <th className="px-3 py-2">Late tol</th>
                <th className="px-3 py-2">Early tol</th>
                <th className="px-3 py-2">Missing SLA</th>
                <th className="px-3 py-2">Reg SLA</th>
                <th className="px-3 py-2">Ramadan hrs</th>
                <th className="px-3 py-2">Remote</th>
                <th className="px-3 py-2">Geofence m</th>
                <th className="px-3 py-2">Biometric</th>
                <th className="px-3 py-2">From</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{r.country}</td>
                  <td className="px-3 py-2">{r.grade ?? '*'}</td>
                  <td className="px-3 py-2">{r.lateToleranceMin}m</td>
                  <td className="px-3 py-2">{r.earlyDepartureToleranceMin}m</td>
                  <td className="px-3 py-2">{r.missingPunchSlaHours}h</td>
                  <td className="px-3 py-2">{r.regularizationSlaDays}d</td>
                  <td className="px-3 py-2">{r.ramadanReducedHours}</td>
                  <td className="px-3 py-2">{r.remoteWorkAllowed ? '✓' : '—'}</td>
                  <td className="px-3 py-2">{r.fraudGeofenceRadiusM}m</td>
                  <td className="px-3 py-2">{r.biometricRequired ? '✓' : '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.effectiveFrom?.slice(0, 10)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-3 py-6 text-center text-slate-500">
                    No policies.
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
