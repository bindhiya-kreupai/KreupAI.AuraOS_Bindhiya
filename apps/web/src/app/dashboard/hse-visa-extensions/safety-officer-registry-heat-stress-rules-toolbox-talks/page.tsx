'use client';

import { useEffect, useState } from 'react';

interface SafetyOfficer {
  id: string;
  employeeId: string;
  name: string;
  role: string | null;
  siteId: string | null;
  certificationCode: string | null;
  certificationExpiresAt: string | null;
  isPrimary: boolean | null;
}

interface HeatStressRule {
  id: string;
  country: string;
  month: number;
  noOutdoorWorkFromHour: number;
  noOutdoorWorkToHour: number;
  effectiveFrom: string | null;
  regulatorRef: string | null;
}

interface ToolboxTalk {
  id: string;
  talkCode: string;
  topic: string;
  siteId: string | null;
  deliveredAt: string | null;
  attendeeCount: number | null;
}

function readList<T>(payload: { data?: { items?: T[] } | T[] }): T[] {
  const data = payload.data;
  if (Array.isArray(data)) return data;
  return (data?.items as T[] | undefined) ?? [];
}

function fmtDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

function fmtDateTime(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

const BASE = '/api/v1/hse-visa-extensions';

export default function SafetyOfficerHeatStressToolboxPage() {
  const [message, setMessage] = useState('');

  // --- Safety officers -------------------------------------------------------
  const [officers, setOfficers] = useState<SafetyOfficer[]>([]);
  const [officerFilter, setOfficerFilter] = useState<{ siteId: string; status: string }>({
    siteId: '',
    status: '',
  });
  const [officerForm, setOfficerForm] = useState({
    employeeId: '',
    name: '',
    role: '',
    siteId: '',
    certificationCode: '',
    certificationIssuedAt: '',
    certificationExpiresAt: '',
    scope: '',
    isPrimary: false,
  });

  async function loadOfficers() {
    const url = new URL(`${BASE}/safety-officers`, window.location.origin);
    if (officerFilter.siteId) url.searchParams.set('siteId', officerFilter.siteId);
    if (officerFilter.status) url.searchParams.set('status', officerFilter.status);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setOfficers(readList<SafetyOfficer>(p));
  }

  async function upsertOfficer() {
    const r = await fetch(`${BASE}/safety-officers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        employeeId: officerForm.employeeId,
        name: officerForm.name,
        role: officerForm.role || undefined,
        siteId: officerForm.siteId || undefined,
        certificationCode: officerForm.certificationCode || undefined,
        certificationIssuedAt: officerForm.certificationIssuedAt || undefined,
        certificationExpiresAt: officerForm.certificationExpiresAt || undefined,
        scope: officerForm.scope || undefined,
        isPrimary: officerForm.isPrimary,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? (p.message ?? 'Saved') : p.error?.message);
    if (p.success) {
      setOfficerForm({
        employeeId: '',
        name: '',
        role: '',
        siteId: '',
        certificationCode: '',
        certificationIssuedAt: '',
        certificationExpiresAt: '',
        scope: '',
        isPrimary: false,
      });
    }
    loadOfficers();
  }

  // --- Heat-stress rules -----------------------------------------------------
  const [rules, setRules] = useState<HeatStressRule[]>([]);
  const [ruleCountryFilter, setRuleCountryFilter] = useState('');
  const [ruleForm, setRuleForm] = useState({
    country: '',
    month: '',
    noOutdoorWorkFromHour: '',
    noOutdoorWorkToHour: '',
    effectiveFrom: '',
    effectiveTo: '',
    regulatorRef: '',
    notes: '',
  });

  async function loadRules() {
    const url = new URL(`${BASE}/heat-stress`, window.location.origin);
    if (ruleCountryFilter) url.searchParams.set('country', ruleCountryFilter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRules(readList<HeatStressRule>(p));
  }

  async function upsertRule() {
    const r = await fetch(`${BASE}/heat-stress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        country: ruleForm.country,
        month: ruleForm.month ? Number(ruleForm.month) : undefined,
        noOutdoorWorkFromHour: ruleForm.noOutdoorWorkFromHour
          ? Number(ruleForm.noOutdoorWorkFromHour)
          : undefined,
        noOutdoorWorkToHour: ruleForm.noOutdoorWorkToHour
          ? Number(ruleForm.noOutdoorWorkToHour)
          : undefined,
        effectiveFrom: ruleForm.effectiveFrom || undefined,
        effectiveTo: ruleForm.effectiveTo || undefined,
        regulatorRef: ruleForm.regulatorRef || undefined,
        notes: ruleForm.notes || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? (p.message ?? 'Saved') : p.error?.message);
    if (p.success) {
      setRuleForm({
        country: '',
        month: '',
        noOutdoorWorkFromHour: '',
        noOutdoorWorkToHour: '',
        effectiveFrom: '',
        effectiveTo: '',
        regulatorRef: '',
        notes: '',
      });
    }
    loadRules();
  }

  // --- Toolbox talks ---------------------------------------------------------
  const [talks, setTalks] = useState<ToolboxTalk[]>([]);
  const [talkFilter, setTalkFilter] = useState<{ siteId: string; from: string; to: string }>({
    siteId: '',
    from: '',
    to: '',
  });
  const [talkForm, setTalkForm] = useState({
    talkCode: '',
    topic: '',
    siteId: '',
    deliveredAt: '',
    attendeeCount: '',
    summary: '',
  });

  async function loadTalks() {
    const url = new URL(`${BASE}/toolbox-talks`, window.location.origin);
    if (talkFilter.siteId) url.searchParams.set('siteId', talkFilter.siteId);
    if (talkFilter.from) url.searchParams.set('from', talkFilter.from);
    if (talkFilter.to) url.searchParams.set('to', talkFilter.to);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setTalks(readList<ToolboxTalk>(p));
  }

  async function recordTalk() {
    const r = await fetch(`${BASE}/toolbox-talks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'record',
        talkCode: talkForm.talkCode,
        topic: talkForm.topic,
        siteId: talkForm.siteId || undefined,
        deliveredAt: talkForm.deliveredAt
          ? new Date(talkForm.deliveredAt).toISOString()
          : undefined,
        attendeeCount: talkForm.attendeeCount ? Number(talkForm.attendeeCount) : undefined,
        summary: talkForm.summary || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? (p.message ?? 'Recorded') : p.error?.message);
    if (p.success) {
      setTalkForm({
        talkCode: '',
        topic: '',
        siteId: '',
        deliveredAt: '',
        attendeeCount: '',
        summary: '',
      });
    }
    loadTalks();
  }

  useEffect(() => {
    loadOfficers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officerFilter.siteId, officerFilter.status]);
  useEffect(() => {
    loadRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruleCountryFilter]);
  useEffect(() => {
    loadTalks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [talkFilter.siteId, talkFilter.from, talkFilter.to]);

  const inputCls = 'rounded-md border border-slate-300 px-2 py-1.5 text-sm';
  const btnCls = 'rounded-md bg-slate-900 px-3 py-2 text-sm text-white';

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">HSE · AURA-444</p>
          <h1 className="text-2xl font-semibold">
            Safety Officer Registry · Heat-Stress Rules · Toolbox Talks
          </h1>
          {message ? <p className="mt-2 text-sm text-slate-700">{message}</p> : null}
        </header>

        {/* Safety officers */}
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Safety Officer Registry</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              className={inputCls}
              placeholder="Filter siteId"
              value={officerFilter.siteId}
              onChange={(e) => setOfficerFilter((f) => ({ ...f, siteId: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="Filter status"
              value={officerFilter.status}
              onChange={(e) => setOfficerFilter((f) => ({ ...f, status: e.target.value }))}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              className={inputCls}
              placeholder="employeeId"
              value={officerForm.employeeId}
              onChange={(e) => setOfficerForm((f) => ({ ...f, employeeId: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="name"
              value={officerForm.name}
              onChange={(e) => setOfficerForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="role"
              value={officerForm.role}
              onChange={(e) => setOfficerForm((f) => ({ ...f, role: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="siteId"
              value={officerForm.siteId}
              onChange={(e) => setOfficerForm((f) => ({ ...f, siteId: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="certificationCode"
              value={officerForm.certificationCode}
              onChange={(e) => setOfficerForm((f) => ({ ...f, certificationCode: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="scope"
              value={officerForm.scope}
              onChange={(e) => setOfficerForm((f) => ({ ...f, scope: e.target.value }))}
            />
            <label className="text-sm">
              issued
              <input
                type="date"
                className={`ml-1 ${inputCls}`}
                value={officerForm.certificationIssuedAt}
                onChange={(e) =>
                  setOfficerForm((f) => ({ ...f, certificationIssuedAt: e.target.value }))
                }
              />
            </label>
            <label className="text-sm">
              expires
              <input
                type="date"
                className={`ml-1 ${inputCls}`}
                value={officerForm.certificationExpiresAt}
                onChange={(e) =>
                  setOfficerForm((f) => ({ ...f, certificationExpiresAt: e.target.value }))
                }
              />
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={officerForm.isPrimary}
                onChange={(e) => setOfficerForm((f) => ({ ...f, isPrimary: e.target.checked }))}
              />
              isPrimary
            </label>
            <button type="button" className={btnCls} onClick={upsertOfficer}>
              Save Officer
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-3">employeeId</th>
                  <th className="py-2 pr-3">name</th>
                  <th className="py-2 pr-3">role</th>
                  <th className="py-2 pr-3">siteId</th>
                  <th className="py-2 pr-3">certCode</th>
                  <th className="py-2 pr-3">certExpires</th>
                  <th className="py-2 pr-3">isPrimary</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{o.employeeId}</td>
                    <td className="py-2 pr-3">{o.name}</td>
                    <td className="py-2 pr-3">{o.role ?? '—'}</td>
                    <td className="py-2 pr-3">{o.siteId ?? '—'}</td>
                    <td className="py-2 pr-3">{o.certificationCode ?? '—'}</td>
                    <td className="py-2 pr-3">{fmtDate(o.certificationExpiresAt)}</td>
                    <td className="py-2 pr-3">{o.isPrimary ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
                {officers.length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={7}>
                      No officers yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        {/* Heat-stress rules */}
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Heat-Stress Rules</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              className={inputCls}
              placeholder="Filter country"
              value={ruleCountryFilter}
              onChange={(e) => setRuleCountryFilter(e.target.value)}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              className={inputCls}
              placeholder="country"
              value={ruleForm.country}
              onChange={(e) => setRuleForm((f) => ({ ...f, country: e.target.value }))}
            />
            <input
              className={`${inputCls} w-24`}
              placeholder="month 1-12"
              value={ruleForm.month}
              onChange={(e) => setRuleForm((f) => ({ ...f, month: e.target.value }))}
            />
            <input
              className={`${inputCls} w-28`}
              placeholder="from hr 0-23"
              value={ruleForm.noOutdoorWorkFromHour}
              onChange={(e) =>
                setRuleForm((f) => ({ ...f, noOutdoorWorkFromHour: e.target.value }))
              }
            />
            <input
              className={`${inputCls} w-28`}
              placeholder="to hr 0-23"
              value={ruleForm.noOutdoorWorkToHour}
              onChange={(e) => setRuleForm((f) => ({ ...f, noOutdoorWorkToHour: e.target.value }))}
            />
            <label className="text-sm">
              effFrom
              <input
                type="date"
                className={`ml-1 ${inputCls}`}
                value={ruleForm.effectiveFrom}
                onChange={(e) => setRuleForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
              />
            </label>
            <label className="text-sm">
              effTo
              <input
                type="date"
                className={`ml-1 ${inputCls}`}
                value={ruleForm.effectiveTo}
                onChange={(e) => setRuleForm((f) => ({ ...f, effectiveTo: e.target.value }))}
              />
            </label>
            <input
              className={inputCls}
              placeholder="regulatorRef"
              value={ruleForm.regulatorRef}
              onChange={(e) => setRuleForm((f) => ({ ...f, regulatorRef: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="notes"
              value={ruleForm.notes}
              onChange={(e) => setRuleForm((f) => ({ ...f, notes: e.target.value }))}
            />
            <button type="button" className={btnCls} onClick={upsertRule}>
              Save Rule
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-3">country</th>
                  <th className="py-2 pr-3">month</th>
                  <th className="py-2 pr-3">fromHour</th>
                  <th className="py-2 pr-3">toHour</th>
                  <th className="py-2 pr-3">effectiveFrom</th>
                  <th className="py-2 pr-3">regulatorRef</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{rule.country}</td>
                    <td className="py-2 pr-3">{rule.month}</td>
                    <td className="py-2 pr-3">{rule.noOutdoorWorkFromHour}</td>
                    <td className="py-2 pr-3">{rule.noOutdoorWorkToHour}</td>
                    <td className="py-2 pr-3">{fmtDate(rule.effectiveFrom)}</td>
                    <td className="py-2 pr-3">{rule.regulatorRef ?? '—'}</td>
                  </tr>
                ))}
                {rules.length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={6}>
                      No rules yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        {/* Toolbox talks */}
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Toolbox Talks</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              className={inputCls}
              placeholder="Filter siteId"
              value={talkFilter.siteId}
              onChange={(e) => setTalkFilter((f) => ({ ...f, siteId: e.target.value }))}
            />
            <label className="text-sm">
              from
              <input
                type="date"
                className={`ml-1 ${inputCls}`}
                value={talkFilter.from}
                onChange={(e) => setTalkFilter((f) => ({ ...f, from: e.target.value }))}
              />
            </label>
            <label className="text-sm">
              to
              <input
                type="date"
                className={`ml-1 ${inputCls}`}
                value={talkFilter.to}
                onChange={(e) => setTalkFilter((f) => ({ ...f, to: e.target.value }))}
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              className={inputCls}
              placeholder="talkCode"
              value={talkForm.talkCode}
              onChange={(e) => setTalkForm((f) => ({ ...f, talkCode: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="topic"
              value={talkForm.topic}
              onChange={(e) => setTalkForm((f) => ({ ...f, topic: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="siteId"
              value={talkForm.siteId}
              onChange={(e) => setTalkForm((f) => ({ ...f, siteId: e.target.value }))}
            />
            <input
              type="datetime-local"
              className={inputCls}
              value={talkForm.deliveredAt}
              onChange={(e) => setTalkForm((f) => ({ ...f, deliveredAt: e.target.value }))}
            />
            <input
              className={`${inputCls} w-28`}
              placeholder="attendees"
              value={talkForm.attendeeCount}
              onChange={(e) => setTalkForm((f) => ({ ...f, attendeeCount: e.target.value }))}
            />
            <input
              className={inputCls}
              placeholder="summary"
              value={talkForm.summary}
              onChange={(e) => setTalkForm((f) => ({ ...f, summary: e.target.value }))}
            />
            <button type="button" className={btnCls} onClick={recordTalk}>
              Record Talk
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-3">talkCode</th>
                  <th className="py-2 pr-3">topic</th>
                  <th className="py-2 pr-3">siteId</th>
                  <th className="py-2 pr-3">deliveredAt</th>
                  <th className="py-2 pr-3">attendees</th>
                </tr>
              </thead>
              <tbody>
                {talks.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{t.talkCode}</td>
                    <td className="py-2 pr-3">{t.topic}</td>
                    <td className="py-2 pr-3">{t.siteId ?? '—'}</td>
                    <td className="py-2 pr-3">{fmtDateTime(t.deliveredAt)}</td>
                    <td className="py-2 pr-3">{t.attendeeCount ?? 0}</td>
                  </tr>
                ))}
                {talks.length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={5}>
                      No talks yet.
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
