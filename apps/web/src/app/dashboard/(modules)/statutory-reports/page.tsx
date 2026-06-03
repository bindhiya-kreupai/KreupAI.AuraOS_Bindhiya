/**
 * @module StatutoryReportsPage
 * @description Statutory report generation, submission, and acknowledgement.
 * Talks to /api/v1/compliance/statutory-reports + .../generate + .../[id]/submit.
 * @project AURA HCM Platform
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { FileSpreadsheet, Send, Shield } from 'lucide-react';

interface ReportSpec {
  code: string;
  countryCode: string;
  name: string;
  format: string;
  description: string;
}

type ReportStatus = 'DRAFT' | 'GENERATED' | 'SUBMITTED' | 'ACKNOWLEDGED' | 'FAILED';

interface ReportRun {
  id: string;
  code: string;
  countryCode: string;
  status: ReportStatus;
  periodStart: string;
  periodEnd: string;
  submissionReference?: string | null;
  generatedAt?: string | null;
  errorMessage?: string | null;
}

const statusColor: Record<ReportStatus, string> = {
  DRAFT: 'bg-silver-mist/15 text-silver-mist',
  GENERATED: 'bg-amber-500/15 text-amber-500',
  SUBMITTED: 'bg-blue-500/15 text-blue-500',
  ACKNOWLEDGED: 'bg-emerald-500/15 text-emerald-500',
  FAILED: 'bg-red-500/15 text-red-500',
};

async function listSpecs(country?: string): Promise<ReportSpec[]> {
  const qs = new URLSearchParams({ mode: 'specs' });
  if (country) qs.set('country', country);
  const res = await fetch(`/api/v1/compliance/statutory-reports?${qs.toString()}`, {
    credentials: 'include',
  });
  const json = await res.json();
  if (!json.success) throw new Error(json?.error?.message ?? 'Failed to load specs');
  return json.data as ReportSpec[];
}

async function listRuns(): Promise<ReportRun[]> {
  const res = await fetch(`/api/v1/compliance/statutory-reports?mode=runs`, {
    credentials: 'include',
  });
  const json = await res.json();
  if (!json.success) throw new Error(json?.error?.message ?? 'Failed to load runs');
  return json.items as ReportRun[];
}

async function generate(code: string, periodStart: string, periodEnd: string) {
  const res = await fetch(`/api/v1/compliance/statutory-reports/generate`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, periodStart, periodEnd }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json?.error?.message ?? 'Generate failed');
}

async function submitRun(id: string, submissionReference: string) {
  const res = await fetch(`/api/v1/compliance/statutory-reports/${id}/submit`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ submissionReference }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json?.error?.message ?? 'Submit failed');
}

export default function StatutoryReportsPage() {
  const [specs, setSpecs] = useState<ReportSpec[]>([]);
  const [runs, setRuns] = useState<ReportRun[]>([]);
  const [country, setCountry] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [periodStart, setPeriodStart] = useState<string>('');
  const [periodEnd, setPeriodEnd] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, r] = await Promise.all([listSpecs(country || undefined), listRuns()]);
      setSpecs(s);
      setRuns(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [country]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleGenerate = async () => {
    if (!code || !periodStart || !periodEnd) {
      setError('code, periodStart, periodEnd required');
      return;
    }
    try {
      setError(null);
      await generate(code, periodStart, periodEnd);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generate failed');
    }
  };

  const handleSubmit = async (run: ReportRun) => {
    const ref = window.prompt(
      `Enter the real authority-issued reference for ${run.code} (rejected if < 3 chars):`
    );
    if (!ref) return;
    try {
      setError(null);
      await submitRun(run.id, ref);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submit failed');
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-celestial-indigo" />
          Statutory Reports
        </h1>
        <p className="text-sm text-silver-mist mt-0.5">
          UAE MOHRE / WPS, KSA GOSI / Nitaqat, India Form 16 / 24Q / PF ECR — generate, submit, and
          track acknowledgements.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-500/10 px-4 py-2 text-sm text-red-500">{error}</div>
      )}

      <div className="rounded-md border border-silver-mist/20 p-4 space-y-3">
        <h2 className="text-sm font-semibold">Generate report</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <label className="flex flex-col">
            Country filter
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="rounded-md border border-silver-mist/30 bg-transparent px-2 py-1"
            >
              <option value="">All</option>
              <option value="AE">UAE</option>
              <option value="SA">KSA</option>
              <option value="IN">India</option>
            </select>
          </label>
          <label className="flex flex-col">
            Report
            <select
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="rounded-md border border-silver-mist/30 bg-transparent px-2 py-1"
            >
              <option value="">Select…</option>
              {specs.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col">
            Period start
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="rounded-md border border-silver-mist/30 bg-transparent px-2 py-1"
            />
          </label>
          <label className="flex flex-col">
            Period end
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="rounded-md border border-silver-mist/30 bg-transparent px-2 py-1"
            />
          </label>
        </div>
        <button
          onClick={() => void handleGenerate()}
          className="rounded-md bg-emerald-500/10 px-3 py-1 text-sm text-emerald-500 hover:bg-emerald-500/20"
        >
          Generate
        </button>
      </div>

      <div className="rounded-md border border-silver-mist/20 p-4">
        <h2 className="text-sm font-semibold mb-3">Generated runs</h2>
        {loading ? (
          <div className="text-center text-sm text-silver-mist py-6">Loading…</div>
        ) : runs.length === 0 ? (
          <div className="text-center text-sm text-silver-mist py-6">No runs yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-silver-mist/5 text-left">
                <tr>
                  <th className="px-2 py-2">Code</th>
                  <th className="px-2 py-2">Country</th>
                  <th className="px-2 py-2">Period</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Reference</th>
                  <th className="px-2 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} className="border-t border-silver-mist/10">
                    <td className="px-2 py-2 font-mono text-xs">{r.code}</td>
                    <td className="px-2 py-2">{r.countryCode}</td>
                    <td className="px-2 py-2 text-silver-mist text-xs">
                      {new Date(r.periodStart).toLocaleDateString()} →{' '}
                      {new Date(r.periodEnd).toLocaleDateString()}
                    </td>
                    <td className="px-2 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${statusColor[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 font-mono text-xs">{r.submissionReference ?? '—'}</td>
                    <td className="px-2 py-2 text-right">
                      {r.status === 'GENERATED' && (
                        <button
                          onClick={() => void handleSubmit(r)}
                          className="rounded-md bg-blue-500/10 px-2 py-1 text-xs text-blue-500 hover:bg-blue-500/20 inline-flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" /> Submit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 px-1">
        <Shield className="w-3.5 h-3.5 text-silver-mist/40" />
        <p className="text-[10px] text-silver-mist/60">
          Submission references shorter than 3 chars are rejected at the API — placeholder values
          cannot be persisted to the SUBMITTED state. Closes #85.
        </p>
      </div>
    </div>
  );
}
