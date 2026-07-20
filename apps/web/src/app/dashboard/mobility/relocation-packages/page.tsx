'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Package, Loader2, Plus, X } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

interface TierPolicy {
  tier: string;
  title: string;
  benefits: string[];
  color: string;
}

interface RelocationPackage {
  id: string;
  employeeId: string;
  employeeName: string;
  tier: string;
  originLocation: string;
  destination: string;
  status: string;
  budgetAmount: string | number;
  spentAmount: string | number;
  currency: string;
}

const STATUS_LABELS: Record<string, string> = {
  INITIATED: 'Initiated',
  PLANNING: 'Planning',
  IN_TRANSIT: 'In Transit',
  HOUSING_SEARCH: 'Housing Search',
  CLOSING: 'Closing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_ORDER = Object.keys(STATUS_LABELS);

export default function RelocationPackagesPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [tiers, setTiers] = useState<TierPolicy[]>([]);
  const [packages, setPackages] = useState<RelocationPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [policyTier, setPolicyTier] = useState<TierPolicy | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    employeeName: '',
    tier: 'standard',
    originLocation: '',
    destination: '',
    budgetAmount: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/mobility/relocation-packages?limit=100');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message ?? 'Failed to load relocation packages');
      }
      setTiers(json.tierPolicies ?? []);
      setPackages(json.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load relocation packages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user?.employeeId) return;
      setSaving(true);
      setMessage('');
      setError('');
      try {
        const res = await fetch('/api/mobility/relocation-packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: user.employeeId,
            employeeName: form.employeeName,
            tier: form.tier,
            originLocation: form.originLocation,
            destination: form.destination,
            budgetAmount: form.budgetAmount ? Number(form.budgetAmount) : 0,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message ?? 'Failed to create relocation package');
        }
        setMessage('Relocation package created.');
        setShowForm(false);
        setForm({
          employeeName: '',
          tier: 'standard',
          originLocation: '',
          destination: '',
          budgetAmount: '',
        });
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create relocation package');
      } finally {
        setSaving(false);
      }
    },
    [form, user, load]
  );

  const advanceStatus = useCallback(
    async (pkg: RelocationPackage) => {
      const idx = STATUS_ORDER.indexOf(pkg.status);
      const next = STATUS_ORDER[Math.min(idx + 1, STATUS_ORDER.length - 3)]; // stop before COMPLETED/CANCELLED
      if (next === pkg.status) return;
      setMessage('');
      setError('');
      try {
        const res = await fetch(`/api/mobility/relocation-packages/${pkg.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: next }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message ?? 'Failed to update status');
        }
        setMessage(`Moved ${pkg.employeeName} to ${STATUS_LABELS[next]}.`);
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update status');
      }
    },
    [load]
  );

  const budgetPct = (pkg: RelocationPackage) => {
    const budget = Number(pkg.budgetAmount) || 0;
    const spent = Number(pkg.spentAmount) || 0;
    if (budget <= 0) return 0;
    return Math.min(100, Math.round((spent / budget) * 100));
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-500" />
            Relocation Packages
          </h1>
          <p className="text-slate-500 text-sm">Manage relocation benefits and tiers.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> New Relocation
        </button>
      </div>

      {message && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 text-sm p-3 rounded-xl border border-emerald-200">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/10 text-rose-700 text-sm p-3 rounded-xl border border-rose-200">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={create}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Employee Name</label>
            <input
              required
              value={form.employeeName}
              onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Tier</label>
            <select
              value={form.tier}
              onChange={(e) => setForm({ ...form, tier: e.target.value })}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
            >
              <option value="executive">Tier 1: Executive</option>
              <option value="senior">Tier 2: Senior Mgmt</option>
              <option value="standard">Tier 3: Individual</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Origin</label>
            <input
              required
              value={form.originLocation}
              onChange={(e) => setForm({ ...form, originLocation: e.target.value })}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Destination</label>
            <input
              required
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Budget (USD)</label>
            <input
              type="number"
              min="0"
              value={form.budgetAmount}
              onChange={(e) => setForm({ ...form, budgetAmount: e.target.value })}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={saving || authLoading || !user?.employeeId}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold"
            >
              {saving ? 'Saving...' : 'Create Package'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tier policy cards — driven by API tier catalogue */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tiers.map((tier) => (
          <div
            key={tier.tier}
            className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-t-4 ${tier.color}`}
          >
            <h3 className="font-bold text-xl mb-6">{tier.title}</h3>
            <ul className="space-y-3 mb-8">
              {tier.benefits.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-500">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setPolicyTier(tier)}
              className="w-full py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              View Policy Details
            </button>
          </div>
        ))}
      </div>

      {/* Active relocations */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-lg mb-4">Active Relocations</h3>
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
          </div>
        ) : packages.length === 0 ? (
          <p className="text-sm text-slate-400 py-6">No relocation packages yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {packages.map((reloc) => (
              <div
                key={reloc.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
              >
                <div className="font-bold text-sm mb-1">{reloc.employeeName}</div>
                <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                  {reloc.originLocation} <span className="text-slate-300">→</span>{' '}
                  {reloc.destination}
                </div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 capitalize">
                    {reloc.tier}
                  </span>
                  <span className="font-bold text-indigo-600">
                    {STATUS_LABELS[reloc.status] ?? reloc.status}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full ${budgetPct(reloc) > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${budgetPct(reloc)}%` }}
                  />
                </div>
                {reloc.status !== 'COMPLETED' && reloc.status !== 'CANCELLED' && (
                  <button
                    type="button"
                    onClick={() => advanceStatus(reloc)}
                    className="w-full text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Advance Stage
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Policy details modal */}
      {policyTier && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPolicyTier(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{policyTier.title}</h2>
              <button
                type="button"
                onClick={() => setPolicyTier(null)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-3">
              Included benefits for this relocation tier:
            </p>
            <ul className="space-y-2 text-sm">
              {policyTier.benefits.map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
