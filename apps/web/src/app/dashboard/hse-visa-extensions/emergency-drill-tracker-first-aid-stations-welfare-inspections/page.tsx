'use client';

import { useEffect, useState } from 'react';

interface Drill {
  id: string;
  siteId: string;
  drillCode: string;
  drillType: string;
  scheduledAt: string | null;
  conductedAt: string | null;
  result: string | null;
}

interface FirstAidStation {
  id: string;
  siteId: string;
  stationCode: string;
  label: string;
  certifiedFirstAiderCount: number | null;
  isActive: boolean | null;
}

interface WelfareInspection {
  id: string;
  siteId: string;
  inspectionCode: string;
  scope: string;
  inspectedAt: string | null;
  result: string | null;
}

function readList<T>(payload: { data?: { items?: T[] } | T[] }): T[] {
  const data = payload.data;
  if (Array.isArray(data)) return data;
  return (data?.items as T[] | undefined) ?? [];
}

function fmt(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

const BASE = '/api/v1/hse-visa-extensions';

export default function EmergencyDrillFirstAidWelfarePage() {
  const [message, setMessage] = useState('');

  // --- Emergency drills ------------------------------------------------------
  const [drills, setDrills] = useState<Drill[]>([]);
  const [drillFilter, setDrillFilter] = useState<{ siteId: string; result: string }>({
    siteId: '',
    result: '',
  });
  const [drillForm, setDrillForm] = useState({
    siteId: '',
    drillCode: '',
    drillType: '',
    scheduledAt: '',
  });
  const [drillResult, setDrillResult] = useState<
    Record<
      string,
      {
        conductedAt: string;
        evacuationTimeSeconds: string;
        participantCount: string;
        findings: string;
        result: string;
      }
    >
  >({});

  async function loadDrills() {
    const url = new URL(`${BASE}/drills`, window.location.origin);
    if (drillFilter.siteId) url.searchParams.set('siteId', drillFilter.siteId);
    if (drillFilter.result) url.searchParams.set('result', drillFilter.result);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setDrills(readList<Drill>(p));
  }

  async function scheduleDrill() {
    const r = await fetch(`${BASE}/drills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'schedule',
        siteId: drillForm.siteId,
        drillCode: drillForm.drillCode,
        drillType: drillForm.drillType,
        scheduledAt: drillForm.scheduledAt
          ? new Date(drillForm.scheduledAt).toISOString()
          : undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? (p.message ?? 'Scheduled') : p.error?.message);
    if (p.success) setDrillForm({ siteId: '', drillCode: '', drillType: '', scheduledAt: '' });
    loadDrills();
  }

  async function recordDrillResult(id: string) {
    const rf = drillResult[id] ?? {
      conductedAt: '',
      evacuationTimeSeconds: '',
      participantCount: '',
      findings: '',
      result: 'PASS',
    };
    const r = await fetch(`${BASE}/drills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'record-result',
        id,
        conductedAt: rf.conductedAt ? new Date(rf.conductedAt).toISOString() : undefined,
        evacuationTimeSeconds: rf.evacuationTimeSeconds
          ? Number(rf.evacuationTimeSeconds)
          : undefined,
        participantCount: rf.participantCount ? Number(rf.participantCount) : undefined,
        findings: rf.findings || undefined,
        result: rf.result,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? (p.message ?? 'Recorded') : p.error?.message);
    loadDrills();
  }

  // --- First-aid stations ----------------------------------------------------
  const [stations, setStations] = useState<FirstAidStation[]>([]);
  const [stationSiteFilter, setStationSiteFilter] = useState('');
  const [stationForm, setStationForm] = useState({
    siteId: '',
    stationCode: '',
    label: '',
    certifiedFirstAiderCount: '',
    isActive: true,
  });
  const [inspectionResult, setInspectionResult] = useState<Record<string, string>>({});

  async function loadStations() {
    const url = new URL(`${BASE}/first-aid`, window.location.origin);
    if (stationSiteFilter) url.searchParams.set('siteId', stationSiteFilter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setStations(readList<FirstAidStation>(p));
  }

  async function upsertStation() {
    const r = await fetch(`${BASE}/first-aid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        siteId: stationForm.siteId,
        stationCode: stationForm.stationCode,
        label: stationForm.label,
        certifiedFirstAiderCount: stationForm.certifiedFirstAiderCount
          ? Number(stationForm.certifiedFirstAiderCount)
          : undefined,
        isActive: stationForm.isActive,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? (p.message ?? 'Saved') : p.error?.message);
    if (p.success) {
      setStationForm({
        siteId: '',
        stationCode: '',
        label: '',
        certifiedFirstAiderCount: '',
        isActive: true,
      });
    }
    loadStations();
  }

  async function recordStationInspection(id: string) {
    const result = inspectionResult[id] ?? 'PASS';
    const r = await fetch(`${BASE}/first-aid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'record-inspection', id, result }),
    });
    const p = await r.json();
    setMessage(p.success ? (p.message ?? 'Inspected') : p.error?.message);
    loadStations();
  }

  async function restockStation(id: string) {
    const r = await fetch(`${BASE}/first-aid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'restock', id }),
    });
    const p = await r.json();
    setMessage(p.success ? (p.message ?? 'Restocked') : p.error?.message);
    loadStations();
  }

  // --- Welfare inspections ---------------------------------------------------
  const [welfare, setWelfare] = useState<WelfareInspection[]>([]);
  const [welfareFilter, setWelfareFilter] = useState<{ siteId: string; result: string }>({
    siteId: '',
    result: '',
  });
  const [welfareForm, setWelfareForm] = useState({
    siteId: '',
    inspectionCode: '',
    scope: '',
    inspectedAt: '',
    findings: '',
    result: 'PASS',
  });

  async function loadWelfare() {
    const url = new URL(`${BASE}/welfare-inspections`, window.location.origin);
    if (welfareFilter.siteId) url.searchParams.set('siteId', welfareFilter.siteId);
    if (welfareFilter.result) url.searchParams.set('result', welfareFilter.result);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setWelfare(readList<WelfareInspection>(p));
  }

  async function recordWelfare() {
    const r = await fetch(`${BASE}/welfare-inspections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'record',
        siteId: welfareForm.siteId,
        inspectionCode: welfareForm.inspectionCode,
        scope: welfareForm.scope,
        inspectedAt: welfareForm.inspectedAt
          ? new Date(welfareForm.inspectedAt).toISOString()
          : undefined,
        findings: welfareForm.findings || undefined,
        result: welfareForm.result,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? (p.message ?? 'Recorded') : p.error?.message);
    if (p.success) {
      setWelfareForm({
        siteId: '',
        inspectionCode: '',
        scope: '',
        inspectedAt: '',
        findings: '',
        result: 'PASS',
      });
    }
    loadWelfare();
  }

  useEffect(() => {
    loadDrills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drillFilter.siteId, drillFilter.result]);
  useEffect(() => {
    loadStations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationSiteFilter]);
  useEffect(() => {
    loadWelfare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [welfareFilter.siteId, welfareFilter.result]);

  const inputCls = 'rounded-md border border-slate-300 px-2 py-1.5 text-sm';
  const btnCls = 'rounded-md bg-slate-900 px-3 py-2 text-sm text-white';

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">HSE · AURA-443</p>
          <h1 className="text-2xl font-semibold">
            Emergency Drills · First-Aid Stations · Welfare Inspections
          </h1>
          {message ? <p className="mt-2 text-sm text-slate-700">{message}</p> : null}
        </header>

        {/* Emergency drills */}
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Emergency Drills</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              className={inputCls}
              placeholder="Filter siteId"
              value={drillFilter.siteId}
              onChange={(e) => setDrillFilter((f) => ({ ...f, siteId: e.target.value }))}
            />
            <select
              className={inputCls}
              value={drillFilter.result}
              onChange={(e) => setDrillFilter((f) => ({ ...f, result: e.target.value }))}
            >
              <option value="">All results</option>
              {['PASS', 'PARTIAL', 'FAIL'].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              className={inputCls}
              placeholder="siteId"
              value={drillForm.siteId}
              onChange={(e) => setDrillForm((f) => ({ ...f, siteId: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="drillCode"
              value={drillForm.drillCode}
              onChange={(e) => setDrillForm((f) => ({ ...f, drillCode: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="drillType"
              value={drillForm.drillType}
              onChange={(e) => setDrillForm((f) => ({ ...f, drillType: e.target.value }))}
            />
            <input
              type="datetime-local"
              className={inputCls}
              value={drillForm.scheduledAt}
              onChange={(e) => setDrillForm((f) => ({ ...f, scheduledAt: e.target.value }))}
            />
            <button type="button" className={btnCls} onClick={scheduleDrill}>
              Schedule Drill
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-3">siteId</th>
                  <th className="py-2 pr-3">drillCode</th>
                  <th className="py-2 pr-3">drillType</th>
                  <th className="py-2 pr-3">scheduledAt</th>
                  <th className="py-2 pr-3">conductedAt</th>
                  <th className="py-2 pr-3">result</th>
                  <th className="py-2 pr-3">record result</th>
                </tr>
              </thead>
              <tbody>
                {drills.map((d) => {
                  const rf = drillResult[d.id] ?? {
                    conductedAt: '',
                    evacuationTimeSeconds: '',
                    participantCount: '',
                    findings: '',
                    result: 'PASS',
                  };
                  return (
                    <tr key={d.id} className="border-b border-slate-100 align-top">
                      <td className="py-2 pr-3">{d.siteId}</td>
                      <td className="py-2 pr-3">{d.drillCode}</td>
                      <td className="py-2 pr-3">{d.drillType}</td>
                      <td className="py-2 pr-3">{fmt(d.scheduledAt)}</td>
                      <td className="py-2 pr-3">{fmt(d.conductedAt)}</td>
                      <td className="py-2 pr-3">{d.result ?? '—'}</td>
                      <td className="py-2 pr-3">
                        <div className="flex flex-wrap gap-1">
                          <input
                            type="datetime-local"
                            className={inputCls}
                            value={rf.conductedAt}
                            onChange={(e) =>
                              setDrillResult((s) => ({
                                ...s,
                                [d.id]: { ...rf, conductedAt: e.target.value },
                              }))
                            }
                          />
                          <input
                            className={`${inputCls} w-20`}
                            placeholder="evac s"
                            value={rf.evacuationTimeSeconds}
                            onChange={(e) =>
                              setDrillResult((s) => ({
                                ...s,
                                [d.id]: { ...rf, evacuationTimeSeconds: e.target.value },
                              }))
                            }
                          />
                          <input
                            className={`${inputCls} w-20`}
                            placeholder="count"
                            value={rf.participantCount}
                            onChange={(e) =>
                              setDrillResult((s) => ({
                                ...s,
                                [d.id]: { ...rf, participantCount: e.target.value },
                              }))
                            }
                          />
                          <select
                            className={inputCls}
                            value={rf.result}
                            onChange={(e) =>
                              setDrillResult((s) => ({
                                ...s,
                                [d.id]: { ...rf, result: e.target.value },
                              }))
                            }
                          >
                            {['PASS', 'PARTIAL', 'FAIL'].map((r) => (
                              <option key={r}>{r}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className={btnCls}
                            onClick={() => recordDrillResult(d.id)}
                          >
                            Record
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {drills.length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={7}>
                      No drills yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        {/* First-aid stations */}
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">First-Aid Stations</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              className={inputCls}
              placeholder="Filter siteId"
              value={stationSiteFilter}
              onChange={(e) => setStationSiteFilter(e.target.value)}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              className={inputCls}
              placeholder="siteId"
              value={stationForm.siteId}
              onChange={(e) => setStationForm((f) => ({ ...f, siteId: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="stationCode"
              value={stationForm.stationCode}
              onChange={(e) => setStationForm((f) => ({ ...f, stationCode: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="label"
              value={stationForm.label}
              onChange={(e) => setStationForm((f) => ({ ...f, label: e.target.value }))}
            />
            <input
              className={`${inputCls} w-32`}
              placeholder="aiders"
              value={stationForm.certifiedFirstAiderCount}
              onChange={(e) =>
                setStationForm((f) => ({ ...f, certifiedFirstAiderCount: e.target.value }))
              }
            />
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={stationForm.isActive}
                onChange={(e) => setStationForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              isActive
            </label>
            <button type="button" className={btnCls} onClick={upsertStation}>
              Save Station
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-3">siteId</th>
                  <th className="py-2 pr-3">stationCode</th>
                  <th className="py-2 pr-3">label</th>
                  <th className="py-2 pr-3">aiders</th>
                  <th className="py-2 pr-3">isActive</th>
                  <th className="py-2 pr-3">actions</th>
                </tr>
              </thead>
              <tbody>
                {stations.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{s.siteId}</td>
                    <td className="py-2 pr-3">{s.stationCode}</td>
                    <td className="py-2 pr-3">{s.label}</td>
                    <td className="py-2 pr-3">{s.certifiedFirstAiderCount ?? 0}</td>
                    <td className="py-2 pr-3">{s.isActive ? 'Yes' : 'No'}</td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-wrap gap-1">
                        <select
                          className={inputCls}
                          value={inspectionResult[s.id] ?? 'PASS'}
                          onChange={(e) =>
                            setInspectionResult((m) => ({ ...m, [s.id]: e.target.value }))
                          }
                        >
                          {['PASS', 'FAIL'].map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className={btnCls}
                          onClick={() => recordStationInspection(s.id)}
                        >
                          Inspect
                        </button>
                        <button
                          type="button"
                          className={btnCls}
                          onClick={() => restockStation(s.id)}
                        >
                          Restock
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {stations.length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={6}>
                      No stations yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        {/* Welfare inspections */}
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Welfare Inspections</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              className={inputCls}
              placeholder="Filter siteId"
              value={welfareFilter.siteId}
              onChange={(e) => setWelfareFilter((f) => ({ ...f, siteId: e.target.value }))}
            />
            <select
              className={inputCls}
              value={welfareFilter.result}
              onChange={(e) => setWelfareFilter((f) => ({ ...f, result: e.target.value }))}
            >
              <option value="">All results</option>
              {['PASS', 'FAIL', 'PENDING'].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              className={inputCls}
              placeholder="siteId"
              value={welfareForm.siteId}
              onChange={(e) => setWelfareForm((f) => ({ ...f, siteId: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="inspectionCode"
              value={welfareForm.inspectionCode}
              onChange={(e) => setWelfareForm((f) => ({ ...f, inspectionCode: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="scope"
              value={welfareForm.scope}
              onChange={(e) => setWelfareForm((f) => ({ ...f, scope: e.target.value }))}
            />
            <input
              type="datetime-local"
              className={inputCls}
              value={welfareForm.inspectedAt}
              onChange={(e) => setWelfareForm((f) => ({ ...f, inspectedAt: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="findings"
              value={welfareForm.findings}
              onChange={(e) => setWelfareForm((f) => ({ ...f, findings: e.target.value }))}
            />
            <select
              className={inputCls}
              value={welfareForm.result}
              onChange={(e) => setWelfareForm((f) => ({ ...f, result: e.target.value }))}
            >
              {['PASS', 'FAIL', 'PENDING'].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <button type="button" className={btnCls} onClick={recordWelfare}>
              Record Inspection
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-3">siteId</th>
                  <th className="py-2 pr-3">inspectionCode</th>
                  <th className="py-2 pr-3">scope</th>
                  <th className="py-2 pr-3">inspectedAt</th>
                  <th className="py-2 pr-3">result</th>
                </tr>
              </thead>
              <tbody>
                {welfare.map((w) => (
                  <tr key={w.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{w.siteId}</td>
                    <td className="py-2 pr-3">{w.inspectionCode}</td>
                    <td className="py-2 pr-3">{w.scope}</td>
                    <td className="py-2 pr-3">{fmt(w.inspectedAt)}</td>
                    <td className="py-2 pr-3">{w.result ?? '—'}</td>
                  </tr>
                ))}
                {welfare.length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={5}>
                      No inspections yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
