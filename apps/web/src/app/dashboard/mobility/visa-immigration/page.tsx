'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FileCheck, Search, Plane, AlertTriangle, Loader2, X } from 'lucide-react';

interface VisaPermitRow {
  id: string;
  employeeId: string;
  documentType: string;
  documentNumber: string;
  countryCode: string;
  issuingAuthority: string | null;
  issueDate: string;
  expiryDate: string;
  status: string;
  category: string | null;
  notes: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / DAY_MS);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

export default function VisaImmigrationPage() {
  const [rows, setRows] = useState<VisaPermitRow[]>([]);
  const [expiring, setExpiring] = useState<VisaPermitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<VisaPermitRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [listRes, expRes] = await Promise.all([
        fetch('/api/v1/visa-permits?limit=100'),
        fetch('/api/v1/visa-permits/expiring?days=30'),
      ]);
      const listJson = await listRes.json();
      const expJson = await expRes.json();
      if (!listRes.ok || !listJson.success) {
        throw new Error(listJson.error?.message ?? 'Failed to load visa records');
      }
      setRows(listJson.items ?? []);
      setExpiring(expJson.success ? (expJson.items ?? []) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load visa records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.employeeId.toLowerCase().includes(q) ||
        r.documentNumber.toLowerCase().includes(q) ||
        r.documentType.toLowerCase().includes(q) ||
        r.countryCode.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const statusBadge = (row: VisaPermitRow) => {
    const days = daysUntil(row.expiryDate);
    if (row.status !== 'ACTIVE') {
      return { label: row.status, cls: 'bg-slate-100 text-slate-600' };
    }
    if (days <= 30) return { label: 'Expiring Soon', cls: 'bg-rose-100 text-rose-600' };
    return { label: 'Active', cls: 'bg-emerald-100 text-emerald-600' };
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-indigo-500" />
            Visa &amp; Immigration
          </h1>
          <p className="text-slate-500 text-sm">Track visa status, work permits, and residency.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee or visa..."
            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Critical Alerts — driven by live expiring feed */}
        <div className="lg:col-span-3 bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-800 flex items-center gap-3">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-rose-700 dark:text-rose-400">Expiring Visas</h3>
            <p className="text-sm text-rose-600 dark:text-rose-300">
              {expiring.length === 0
                ? 'No visas or permits are expiring within the next 30 days.'
                : `${expiring.length} document${expiring.length === 1 ? '' : 's'} expiring within the next 30 days. Action required.`}
            </p>
          </div>
        </div>

        {error && (
          <div className="lg:col-span-3 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-200 text-sm text-amber-700">
            {error}
          </div>
        )}

        {/* Visa List */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading visa records...
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Country</th>
                  <th className="px-6 py-4">Document</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                      No visa or permit records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((visa) => {
                    const badge = statusBadge(visa);
                    const expiringSoon = badge.label === 'Expiring Soon';
                    return (
                      <tr key={visa.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 font-bold">{visa.employeeId}</td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-2">
                            <Plane className="w-4 h-4 text-slate-400" /> {visa.countryCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 capitalize">
                          {visa.documentType.replace(/_/g, ' ')}
                          <span className="block text-xs text-slate-400 font-mono">
                            {visa.documentNumber}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 font-mono ${expiringSoon ? 'text-rose-600 font-bold' : ''}`}
                        >
                          {formatDate(visa.expiryDate)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => setSelected(visa)}
                            className="text-indigo-600 font-bold hover:underline"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details drawer */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md h-full bg-white dark:bg-slate-900 p-6 overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Document Details</h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Employee ID</dt>
                <dd className="font-bold">{selected.employeeId}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Document Type</dt>
                <dd className="font-bold capitalize">{selected.documentType.replace(/_/g, ' ')}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Document Number</dt>
                <dd className="font-mono">{selected.documentNumber}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Country</dt>
                <dd className="font-bold">{selected.countryCode}</dd>
              </div>
              {selected.issuingAuthority && (
                <div>
                  <dt className="text-slate-500">Issuing Authority</dt>
                  <dd>{selected.issuingAuthority}</dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500">Issue Date</dt>
                <dd>{formatDate(selected.issueDate)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Expiry Date</dt>
                <dd className="font-bold">
                  {formatDate(selected.expiryDate)}{' '}
                  <span className="text-slate-400 font-normal">
                    ({daysUntil(selected.expiryDate)} days)
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="font-bold">{selected.status}</dd>
              </div>
              {selected.notes && (
                <div>
                  <dt className="text-slate-500">Notes</dt>
                  <dd>{selected.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
