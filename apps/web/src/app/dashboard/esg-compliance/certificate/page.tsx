'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle2, ShieldAlert, Award, FileSpreadsheet } from 'lucide-react';

interface Cert {
  id: string;
  period: string;
  status: 'DRAFT' | 'SIGNED';
  carbonVerdict: 'PASS' | 'FAIL';
  diversityVerdict: 'PASS' | 'WARN';
  disclosureVerdict: 'PASS' | 'FAIL';
  gatingReason: string | null;
  signedAt?: string;
  signedBy?: string;
}

const INITIAL_CERTS: Cert[] = [
  {
    id: 'cert-1',
    period: '2026-05',
    status: 'SIGNED',
    carbonVerdict: 'PASS',
    diversityVerdict: 'PASS',
    disclosureVerdict: 'PASS',
    gatingReason: null,
    signedAt: '2026-05-31',
    signedBy: 'Super Admin',
  },
  {
    id: 'cert-2',
    period: '2026-06',
    status: 'DRAFT',
    carbonVerdict: 'FAIL',
    diversityVerdict: 'WARN',
    disclosureVerdict: 'FAIL',
    gatingReason: 'Blocked: Carbon intensity above benchmark; Diversity ratios below targets; Missing 2 mandatory disclosures',
  }
];

export default function EsgMonthlyCertPage() {
  const [certs, setCerts] = useState<Cert[]>(INITIAL_CERTS);
  const [period, setPeriod] = useState('2026-07');
  const [message, setMessage] = useState('');
  
  // Simulation params
  const [simCarbon, setSimCarbon] = useState('PASS');
  const [simDiversity, setSimDiversity] = useState('PASS');
  const [simDisclosure, setSimDisclosure] = useState('PASS');

  const generate = () => {
    if (certs.some((c) => c.period === period)) {
      setMessage(`Certificate for ${period} already exists.`);
      return;
    }

    const reasons: string[] = [];
    if (simCarbon === 'FAIL') reasons.push('Carbon intensity above benchmark');
    if (simDiversity === 'WARN') reasons.push('Diversity ratios below targets');
    if (simDisclosure === 'FAIL') reasons.push('Missing mandatory disclosures');
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;

    const newCert: Cert = {
      id: `cert-${Date.now()}`,
      period,
      status: 'DRAFT',
      carbonVerdict: simCarbon as any,
      diversityVerdict: simDiversity as any,
      disclosureVerdict: simDisclosure as any,
      gatingReason,
    };

    setCerts([newCert, ...certs]);
    setMessage(`Draft certificate generated for ${period}`);
  };

  const sign = (id: string) => {
    setCerts(
      certs.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: 'SIGNED',
            signedAt: new Date().toISOString().slice(0, 10),
            signedBy: 'Super Admin',
          };
        }
        return c;
      })
    );
    setMessage('Certificate successfully signed and archived.');
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
          <div>
            <p className="text-sm uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">EPIC-30 · ESG Compliance</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Monthly ESG Compliance Certificate</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate and sign monthly corporate ESG status attestations.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 shadow-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="text-sm outline-none text-slate-700 dark:text-slate-200 bg-transparent animate-none"
              />
            </div>
            <button
              onClick={generate}
              className="rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium px-4 py-2 text-sm shadow transition-colors"
            >
              Generate Draft
            </button>
          </div>
        </header>

        {message && (
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-lg text-sm font-medium animate-fadeIn">
            {message}
          </div>
        )}

        {/* Demo Simulation Controls */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">Demo Simulator Controls</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex flex-col text-xs font-semibold text-slate-600 dark:text-slate-350 gap-1.5">
              Carbon Intensity Status
              <select
                value={simCarbon}
                onChange={(e) => setSimCarbon(e.target.value)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 outline-none text-sm font-normal text-slate-900 dark:text-slate-100"
              >
                <option value="PASS">PASS (Within benchmark)</option>
                <option value="FAIL">FAIL (Exceeds benchmark)</option>
              </select>
            </label>
            <label className="flex flex-col text-xs font-semibold text-slate-600 dark:text-slate-350 gap-1.5">
              Workforce Diversity Status
              <select
                value={simDiversity}
                onChange={(e) => setSimDiversity(e.target.value)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 outline-none text-sm font-normal text-slate-900 dark:text-slate-100"
              >
                <option value="PASS">PASS (Targets met)</option>
                <option value="WARN">WARN (Gender/leadership ratio low)</option>
              </select>
            </label>
            <label className="flex flex-col text-xs font-semibold text-slate-600 dark:text-slate-350 gap-1.5">
              Governance Disclosures Status
              <select
                value={simDisclosure}
                onChange={(e) => setSimDisclosure(e.target.value)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 outline-none text-sm font-normal text-slate-900 dark:text-slate-100"
              >
                <option value="PASS">PASS (All reports filed)</option>
                <option value="FAIL">FAIL (Missing mandatory reports)</option>
              </select>
            </label>
          </div>
        </section>

        {/* Certificates List */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Historical Certificates</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Carbon</th>
                  <th className="px-4 py-3">Diversity</th>
                  <th className="px-4 py-3">Disclosures</th>
                  <th className="px-4 py-3">Gating Details / Warnings</th>
                  <th className="px-4 py-3">Attestation</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {certs.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">{c.period}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                          c.status === 'SIGNED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-450 border border-emerald-200 dark:border-emerald-900/50'
                            : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-455 border border-amber-200 dark:border-amber-900/50'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-bold ${c.carbonVerdict === 'PASS' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-455'}`}>
                        {c.carbonVerdict}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-bold ${c.diversityVerdict === 'PASS' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-455'}`}>
                        {c.diversityVerdict === 'PASS' ? 'PASS' : 'WARN'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-bold ${c.disclosureVerdict === 'PASS' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-455'}`}>
                        {c.disclosureVerdict}
                      </span>
                    </td>
                    <td className="px-4 py-4 max-w-xs truncate text-xs">
                      {c.gatingReason ? (
                        <div className="flex items-center gap-1 text-rose-600 dark:text-rose-455">
                          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{c.gatingReason}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-455">
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Gating Check Cleared</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {c.status === 'SIGNED' ? (
                        <div>
                          <p className="font-semibold text-slate-700 dark:text-slate-350">Signed: {c.signedBy}</p>
                          <p className="text-slate-400 dark:text-slate-500 mt-0.5">{c.signedAt}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">Awaiting Signature</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {c.status === 'DRAFT' && !c.gatingReason ? (
                        <button
                          onClick={() => sign(c.id)}
                          className="flex items-center gap-1 rounded bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-750 dark:hover:bg-emerald-650 text-white font-medium px-3 py-1.5 text-xs shadow-sm transition-colors animate-none"
                        >
                          <Award className="w-3.5 h-3.5" />
                          Sign Attestation
                        </button>
                      ) : c.status === 'DRAFT' ? (
                        <button
                          disabled
                          className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-3 py-1.5 text-xs cursor-not-allowed border border-slate-200 dark:border-slate-700"
                        >
                          Gated
                        </button>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-450 font-medium text-xs">Archived</span>
                      )}
                    </td>
                  </tr>
                ))}
                {certs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                      No monthly ESG certificates generated yet.
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
