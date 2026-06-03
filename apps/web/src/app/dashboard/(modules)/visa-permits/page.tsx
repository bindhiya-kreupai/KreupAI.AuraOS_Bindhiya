/**
 * @module VisaPermitsPage
 * @description Visa / permit / identity-document tracking with expiry alerts.
 * @project AURA HCM Platform
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { FileWarning, Stamp, Shield } from 'lucide-react';

type VisaStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'RENEWED' | 'REVOKED';

interface VisaPermit {
  id: string;
  employeeId: string;
  documentType: string;
  documentNumber: string;
  countryCode: string;
  issueDate: string;
  expiryDate: string;
  status: VisaStatus;
  notes?: string | null;
}

const DOCUMENT_TYPES = [
  'passport',
  'visa',
  'emirates_id',
  'iqama',
  'work_permit',
  'labor_card',
  'medical',
  'residence_permit',
];

const statusColor: Record<VisaStatus, string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-500',
  EXPIRED: 'bg-red-500/15 text-red-500',
  CANCELED: 'bg-silver-mist/15 text-silver-mist',
  RENEWED: 'bg-blue-500/15 text-blue-500',
  REVOKED: 'bg-red-500/15 text-red-500',
};

async function listPermits(filters: {
  status?: string;
  documentType?: string;
}): Promise<VisaPermit[]> {
  const qs = new URLSearchParams();
  if (filters.status) qs.set('status', filters.status);
  if (filters.documentType) qs.set('documentType', filters.documentType);
  const res = await fetch(`/api/v1/visa-permits?${qs.toString()}`, { credentials: 'include' });
  const json = await res.json();
  if (!json.success) throw new Error(json?.error?.message ?? 'Failed to load');
  return json.items as VisaPermit[];
}

async function expiringSoon(days: number): Promise<VisaPermit[]> {
  const res = await fetch(`/api/v1/visa-permits/expiring?days=${days}`, { credentials: 'include' });
  const json = await res.json();
  if (!json.success) throw new Error(json?.error?.message ?? 'Failed to load');
  return json.items as VisaPermit[];
}

async function startRenewal(permitId: string) {
  const res = await fetch(`/api/v1/visa-permits/${permitId}/renewals`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json?.error?.message ?? 'Renewal start failed');
}

export default function VisaPermitsPage() {
  const [items, setItems] = useState<VisaPermit[]>([]);
  const [expiring, setExpiring] = useState<VisaPermit[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [window_, setWindow] = useState<number>(30);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [all, soon] = await Promise.all([
        listPermits({ status: statusFilter, documentType: typeFilter || undefined }),
        expiringSoon(window_),
      ]);
      setItems(all);
      setExpiring(soon);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, window_]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRenew = async (id: string) => {
    try {
      await startRenewal(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Renew failed');
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Stamp className="w-5 h-5 text-celestial-indigo" />
          Visa &amp; Immigration
        </h1>
        <p className="text-sm text-silver-mist mt-0.5">
          Track passports, visas, Emirates IDs, Iqamas, work permits, labor cards, medical
          certificates, and residence permits — with expiry alerts and renewal workflow.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-500/10 px-4 py-2 text-sm text-red-500">{error}</div>
      )}

      <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-amber-500">
            <FileWarning className="w-4 h-4" />
            Expiring within {window_} days
          </h2>
          <select
            value={window_}
            onChange={(e) => setWindow(Number(e.target.value))}
            className="rounded-md border border-amber-500/30 bg-transparent px-2 py-1 text-xs"
          >
            <option value={7}>7</option>
            <option value={30}>30</option>
            <option value={60}>60</option>
            <option value={90}>90</option>
          </select>
        </div>
        {expiring.length === 0 ? (
          <p className="text-xs text-silver-mist">No documents expiring in this window.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {expiring.map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <span>
                  <span className="font-mono text-xs">{p.employeeId.slice(0, 8)}</span> ·{' '}
                  {p.documentType} · <span className="text-amber-500">{p.documentNumber}</span> ·
                  expires {new Date(p.expiryDate).toLocaleDateString()}
                </span>
                <button
                  onClick={() => void handleRenew(p.id)}
                  className="rounded-md bg-amber-500/15 px-2 py-1 text-xs text-amber-500 hover:bg-amber-500/25"
                >
                  Start renewal
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-silver-mist/30 bg-transparent px-2 py-1 text-sm"
        >
          {['ACTIVE', 'EXPIRED', 'CANCELED', 'RENEWED', 'REVOKED'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-md border border-silver-mist/30 bg-transparent px-2 py-1 text-sm"
        >
          <option value="">All types</option>
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center text-sm text-silver-mist py-8">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-center text-sm text-silver-mist py-8">
          No documents match the filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-silver-mist/20">
          <table className="w-full text-sm">
            <thead className="bg-silver-mist/5 text-left">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Number</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Issued</th>
                <th className="px-3 py-2">Expires</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-silver-mist/10">
                  <td className="px-3 py-2 font-mono text-xs">{p.employeeId.slice(0, 8)}</td>
                  <td className="px-3 py-2">{p.documentType}</td>
                  <td className="px-3 py-2 font-mono text-xs">{p.documentNumber}</td>
                  <td className="px-3 py-2">{p.countryCode}</td>
                  <td className="px-3 py-2 text-silver-mist text-xs">
                    {new Date(p.issueDate).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-silver-mist text-xs">
                    {new Date(p.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusColor[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-2 px-1">
        <Shield className="w-3.5 h-3.5 text-silver-mist/40" />
        <p className="text-[10px] text-silver-mist/60">
          Renewal transactions are atomic: the old permit is marked RENEWED and a new ACTIVE permit
          is created with the new document number and dates in the same DB transaction.
        </p>
      </div>
    </div>
  );
}
