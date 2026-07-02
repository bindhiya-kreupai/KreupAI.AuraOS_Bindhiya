'use client';

import { useEffect, useState } from 'react';

const BASE = '/api/v1/structural-extensions';

interface RetentionPolicy {
  id: string;
  recordType: string;
  country: string | null;
  retentionYears: number;
  classification: string | null;
  disposalMethod: string | null;
  effectiveFrom: string | null;
}

interface PhysicalLocation {
  id: string;
  documentRef: string;
  warehouseCode: string;
  boxCode: string | null;
  shelfCode: string | null;
  fileCode: string | null;
  status: string;
}

interface FindingRiskLink {
  id: string;
  findingRef: string;
  domainCode: string;
  riskCode: string;
  linkType: string | null;
  notes: string | null;
}

function readList<T>(p: { success?: boolean; data?: unknown }): T[] {
  const d = p.data as { items?: T[] } | T[] | undefined;
  if (Array.isArray(d)) return d;
  return (d?.items as T[]) ?? [];
}

export default function SeparationRetentionPhysicalLocationsFindingRiskLinksPage() {
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [locations, setLocations] = useState<PhysicalLocation[]>([]);
  const [links, setLinks] = useState<FindingRiskLink[]>([]);
  const [message, setMessage] = useState('');

  const [policy, setPolicy] = useState({
    recordType: '',
    retentionYears: '',
    country: '',
    classification: '',
    disposalMethod: '',
    legalBasis: '',
    effectiveFrom: '',
  });
  const [location, setLocation] = useState({
    documentRef: '',
    warehouseCode: '',
    boxCode: '',
    shelfCode: '',
    fileCode: '',
    notes: '',
  });
  const [link, setLink] = useState({
    findingRef: '',
    domainCode: '',
    riskCode: '',
    linkType: '',
    notes: '',
  });

  async function loadPolicies() {
    const r = await fetch(`${BASE}/separation-retention`);
    const p = await r.json();
    if (p.success) setPolicies(readList<RetentionPolicy>(p));
  }
  async function loadLocations() {
    const r = await fetch(`${BASE}/physical-locations`);
    const p = await r.json();
    if (p.success) setLocations(readList<PhysicalLocation>(p));
  }
  async function loadLinks() {
    const r = await fetch(`${BASE}/finding-risk-links`);
    const p = await r.json();
    if (p.success) setLinks(readList<FindingRiskLink>(p));
  }
  useEffect(() => {
    loadPolicies();
    loadLocations();
    loadLinks();
  }, []);

  async function post(path: string, body: unknown) {
    const r = await fetch(`${BASE}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return r.json();
  }

  async function upsertPolicy() {
    const p = await post('separation-retention', {
      action: 'upsert',
      recordType: policy.recordType,
      retentionYears: Number(policy.retentionYears),
      country: policy.country || undefined,
      classification: policy.classification || undefined,
      disposalMethod: policy.disposalMethod || undefined,
      legalBasis: policy.legalBasis || undefined,
      effectiveFrom: policy.effectiveFrom,
    });
    setMessage(p.success ? (p.message ?? 'Saved') : p.error?.message);
    if (p.success) {
      setPolicy({
        recordType: '',
        retentionYears: '',
        country: '',
        classification: '',
        disposalMethod: '',
        legalBasis: '',
        effectiveFrom: '',
      });
      loadPolicies();
    }
  }

  async function upsertLocation() {
    const p = await post('physical-locations', {
      action: 'upsert',
      documentRef: location.documentRef,
      warehouseCode: location.warehouseCode,
      boxCode: location.boxCode || undefined,
      shelfCode: location.shelfCode || undefined,
      fileCode: location.fileCode || undefined,
      notes: location.notes || undefined,
    });
    setMessage(p.success ? (p.message ?? 'Saved') : p.error?.message);
    if (p.success) {
      setLocation({
        documentRef: '',
        warehouseCode: '',
        boxCode: '',
        shelfCode: '',
        fileCode: '',
        notes: '',
      });
      loadLocations();
    }
  }

  async function locationAction(documentRef: string, action: string) {
    const p = await post('physical-locations', { action, documentRef });
    setMessage(p.success ? (p.message ?? 'Done') : p.error?.message);
    if (p.success) loadLocations();
  }

  async function upsertLink() {
    const p = await post('finding-risk-links', {
      action: 'link',
      findingRef: link.findingRef,
      domainCode: link.domainCode,
      riskCode: link.riskCode,
      linkType: link.linkType || undefined,
      notes: link.notes || undefined,
    });
    setMessage(p.success ? (p.message ?? 'Linked') : p.error?.message);
    if (p.success) {
      setLink({ findingRef: '', domainCode: '', riskCode: '', linkType: '', notes: '' });
      loadLinks();
    }
  }

  const input = 'rounded-md border border-slate-300 px-2 py-1.5 text-sm';
  const btn = 'rounded-md bg-slate-900 px-3 py-2 text-sm text-white';

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">Structural Extensions · AURA-527</p>
          <h1 className="text-2xl font-semibold">
            Separation Retention, Physical Locations &amp; Finding↔Risk Links
          </h1>
        </header>
        {message ? (
          <p className="rounded-md border border-slate-200 bg-white p-3 text-sm">{message}</p>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Separation Retention Policies</h2>
          <div className="flex flex-wrap items-end gap-2">
            <input
              className={input}
              placeholder="Record type"
              value={policy.recordType}
              onChange={(e) => setPolicy((f) => ({ ...f, recordType: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Retention years"
              type="number"
              value={policy.retentionYears}
              onChange={(e) => setPolicy((f) => ({ ...f, retentionYears: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Country"
              value={policy.country}
              onChange={(e) => setPolicy((f) => ({ ...f, country: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Classification"
              value={policy.classification}
              onChange={(e) => setPolicy((f) => ({ ...f, classification: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Disposal method"
              value={policy.disposalMethod}
              onChange={(e) => setPolicy((f) => ({ ...f, disposalMethod: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Legal basis"
              value={policy.legalBasis}
              onChange={(e) => setPolicy((f) => ({ ...f, legalBasis: e.target.value }))}
            />
            <input
              className={input}
              type="date"
              value={policy.effectiveFrom}
              onChange={(e) => setPolicy((f) => ({ ...f, effectiveFrom: e.target.value }))}
            />
            <button type="button" className={btn} onClick={upsertPolicy}>
              Upsert
            </button>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Record Type</th>
                <th>Country</th>
                <th>Retention Yrs</th>
                <th>Classification</th>
                <th>Disposal</th>
                <th>Effective</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((pol) => (
                <tr key={pol.id} className="border-t border-slate-100">
                  <td className="py-2">{pol.recordType}</td>
                  <td>{pol.country ?? '—'}</td>
                  <td>{pol.retentionYears}</td>
                  <td>{pol.classification ?? '—'}</td>
                  <td>{pol.disposalMethod ?? '—'}</td>
                  <td>{pol.effectiveFrom ?? '—'}</td>
                </tr>
              ))}
              {policies.length === 0 && (
                <tr>
                  <td className="py-2 text-slate-500" colSpan={6}>
                    No policies yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Physical File Locations</h2>
          <div className="flex flex-wrap items-end gap-2">
            <input
              className={input}
              placeholder="Document ref"
              value={location.documentRef}
              onChange={(e) => setLocation((f) => ({ ...f, documentRef: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Warehouse code"
              value={location.warehouseCode}
              onChange={(e) => setLocation((f) => ({ ...f, warehouseCode: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Box code"
              value={location.boxCode}
              onChange={(e) => setLocation((f) => ({ ...f, boxCode: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Shelf code"
              value={location.shelfCode}
              onChange={(e) => setLocation((f) => ({ ...f, shelfCode: e.target.value }))}
            />
            <input
              className={input}
              placeholder="File code"
              value={location.fileCode}
              onChange={(e) => setLocation((f) => ({ ...f, fileCode: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Notes"
              value={location.notes}
              onChange={(e) => setLocation((f) => ({ ...f, notes: e.target.value }))}
            />
            <button type="button" className={btn} onClick={upsertLocation}>
              Upsert
            </button>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Document Ref</th>
                <th>Warehouse</th>
                <th>Box</th>
                <th>Shelf</th>
                <th>File</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {locations.map((loc) => (
                <tr key={loc.id} className="border-t border-slate-100">
                  <td className="py-2">{loc.documentRef}</td>
                  <td>{loc.warehouseCode}</td>
                  <td>{loc.boxCode ?? '—'}</td>
                  <td>{loc.shelfCode ?? '—'}</td>
                  <td>{loc.fileCode ?? '—'}</td>
                  <td>{loc.status}</td>
                  <td className="flex gap-1 py-2">
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      onClick={() => locationAction(loc.documentRef, 'check-out')}
                    >
                      Check Out
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      onClick={() => locationAction(loc.documentRef, 'check-in')}
                    >
                      Check In
                    </button>
                  </td>
                </tr>
              ))}
              {locations.length === 0 && (
                <tr>
                  <td className="py-2 text-slate-500" colSpan={7}>
                    No locations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Audit Finding↔Risk Links</h2>
          <div className="flex flex-wrap items-end gap-2">
            <input
              className={input}
              placeholder="Finding ref"
              value={link.findingRef}
              onChange={(e) => setLink((f) => ({ ...f, findingRef: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Domain code"
              value={link.domainCode}
              onChange={(e) => setLink((f) => ({ ...f, domainCode: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Risk code"
              value={link.riskCode}
              onChange={(e) => setLink((f) => ({ ...f, riskCode: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Link type"
              value={link.linkType}
              onChange={(e) => setLink((f) => ({ ...f, linkType: e.target.value }))}
            />
            <input
              className={input}
              placeholder="Notes"
              value={link.notes}
              onChange={(e) => setLink((f) => ({ ...f, notes: e.target.value }))}
            />
            <button type="button" className={btn} onClick={upsertLink}>
              Link
            </button>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Finding Ref</th>
                <th>Domain</th>
                <th>Risk</th>
                <th>Link Type</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="py-2">{l.findingRef}</td>
                  <td>{l.domainCode}</td>
                  <td>{l.riskCode}</td>
                  <td>{l.linkType ?? '—'}</td>
                  <td>{l.notes ?? '—'}</td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr>
                  <td className="py-2 text-slate-500" colSpan={5}>
                    No links yet.
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
