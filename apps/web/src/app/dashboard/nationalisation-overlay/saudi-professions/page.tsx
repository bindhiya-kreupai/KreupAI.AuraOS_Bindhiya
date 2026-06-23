'use client';

import { useEffect, useState } from 'react';

interface Profession {
  id: string;
  professionCode: string;
  professionNameEn: string;
  professionNameAr: string | null;
  isicCode: string | null;
  reservedForSaudis: boolean;
  minimumNationalisationPct: number | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  regulatorRef: string | null;
}

export default function SaudiProfessionsPage() {
  const [items, setItems] = useState<Profession[]>([]);
  const [reservedOnly, setReservedOnly] = useState(false);
  const [message, setMessage] = useState('');
  const [professionCode, setProfessionCode] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [isicCode, setIsicCode] = useState('');
  const [reserved, setReserved] = useState(false);
  const [minPct, setMinPct] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().slice(0, 10));
  const [regulatorRef, setRegulatorRef] = useState('');

  async function load() {
    const qs = reservedOnly ? '?reservedForSaudis=true' : '';
    const r = await fetch(`/api/v1/nationalisation-overlay/saudi-professions${qs}`);
    const p = await r.json();
    if (p.success) setItems(p.data ?? []);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservedOnly]);

  async function upsert() {
    setMessage('');
    const r = await fetch('/api/v1/nationalisation-overlay/saudi-professions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        professionCode,
        professionNameEn: nameEn,
        professionNameAr: nameAr || undefined,
        isicCode: isicCode || undefined,
        reservedForSaudis: reserved,
        minimumNationalisationPct: minPct ? Number(minPct) : undefined,
        effectiveFrom,
        regulatorRef: regulatorRef || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : p.message);
    if (p.success) {
      setProfessionCode('');
      setNameEn('');
      setNameAr('');
      setIsicCode('');
      setMinPct('');
      setRegulatorRef('');
      load();
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-17-S09</p>
          <h1 className="text-2xl font-semibold">Saudi Profession-Localisation Codes</h1>
          <p className="mt-1 text-sm text-slate-600">
            MHRSD profession register with reserved-for-Saudis flag and per-profession minimum
            nationalisation %. Effective-dated so each year&apos;s additions are traceable.
          </p>
        </header>

        {message ? <p className="text-sm text-slate-700">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Add / update profession</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="text-sm font-medium">
              Profession code
              <input
                value={professionCode}
                onChange={(e) => setProfessionCode(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm font-medium">
              Name (en)
              <input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm font-medium">
              Name (ar)
              <input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm font-medium">
              ISIC code
              <input
                value={isicCode}
                onChange={(e) => setIsicCode(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={reserved}
                onChange={(e) => setReserved(e.target.checked)}
              />
              Reserved for Saudis
            </label>
            <label className="text-sm font-medium">
              Min nationalisation %
              <input
                value={minPct}
                onChange={(e) => setMinPct(e.target.value)}
                inputMode="numeric"
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm font-medium">
              Effective from
              <input
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm font-medium md:col-span-2">
              Regulator reference
              <input
                value={regulatorRef}
                onChange={(e) => setRegulatorRef(e.target.value)}
                placeholder="MHRSD decree / circular"
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={upsert}
            className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Save profession
          </button>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Profession register</h2>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={reservedOnly}
                onChange={(e) => setReservedOnly(e.target.checked)}
              />
              Reserved only
            </label>
          </div>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Code</th>
                <th>Name (en)</th>
                <th>Name (ar)</th>
                <th>ISIC</th>
                <th>Reserved</th>
                <th>Min %</th>
                <th>Effective from</th>
                <th>Regulator ref</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="py-2 font-mono text-xs">{p.professionCode}</td>
                  <td className="text-xs">{p.professionNameEn}</td>
                  <td className="text-xs">{p.professionNameAr ?? '—'}</td>
                  <td className="text-xs">{p.isicCode ?? '—'}</td>
                  <td className="text-xs">{p.reservedForSaudis ? 'YES' : 'no'}</td>
                  <td className="text-xs">{p.minimumNationalisationPct ?? '—'}</td>
                  <td className="text-xs">{p.effectiveFrom.slice(0, 10)}</td>
                  <td className="text-xs">{p.regulatorRef ?? '—'}</td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-xs text-slate-500">
                    No professions yet.
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
