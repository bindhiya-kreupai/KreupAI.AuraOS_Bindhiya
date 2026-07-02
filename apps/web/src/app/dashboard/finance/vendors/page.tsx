'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { VendorService } from '../services';
import type { Vendor } from '../types';
import { ToastContainer, useToast } from '../components/Toast';

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending_approval: 'bg-yellow-100 text-yellow-700',
  inactive: 'bg-slate-100 text-slate-600',
  blacklisted: 'bg-red-100 text-red-700',
};

const statusIcon: Record<string, React.ReactNode> = {
  active: <CheckCircle2 className="w-3 h-3" />,
  pending_approval: <Clock className="w-3 h-3" />,
  inactive: <AlertCircle className="w-3 h-3" />,
  blacklisted: <AlertCircle className="w-3 h-3" />,
};

const STATUS_FILTERS = ['all', 'active', 'pending_approval', 'inactive'] as const;

export default function FinanceVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    vendorName: '',
    vendorType: 'company',
    email: '',
    phone: '',
    taxId: '',
  });
  const { toasts, showToast, dismissToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await VendorService.getVendors();
      setVendors(data);
    } catch {
      showToast('error', 'Failed to load vendors.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      vendors.filter((v) => {
        const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          (v.vendorName || '').toLowerCase().includes(q) ||
          (v.categories || []).join(' ').toLowerCase().includes(q) ||
          (v.email || '').toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
      }),
    [vendors, search, statusFilter]
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vendorName.trim()) {
      showToast('warning', 'Vendor name is required.');
      return;
    }
    setSaving(true);
    try {
      await VendorService.createVendor(form as unknown as Vendor);
      showToast('success', 'Vendor added.');
      setShowModal(false);
      setForm({ vendorName: '', vendorType: 'company', email: '', phone: '', taxId: '' });
      await load();
    } catch {
      showToast('error', 'Failed to add vendor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-6 text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismissToast} />
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-indigo-500">Finance</p>
        <h1 className="text-3xl font-bold">Vendor Management</h1>
        <p className="text-slate-500 max-w-3xl">
          Onboard vendors, manage contracts, and ensure compliance with procurement rules.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No vendors found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Vendor</th>
                <th className="text-left px-4 py-3 font-semibold">Categories</th>
                <th className="text-left px-4 py-3 font-semibold">Total Spend</th>
                <th className="text-left px-4 py-3 font-semibold">Rating</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((v) => (
                <tr
                  key={v.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium">{v.vendorName}</p>
                        <p className="text-xs text-slate-400">{v.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {(v.categories || []).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    ${Number(v.totalSpend || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{Number(v.performanceRating || 0).toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[v.status] || ''}`}
                    >
                      {statusIcon[v.status]} {(v.status || '').replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Add Vendor</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                required
                placeholder="Vendor name *"
                value={form.vendorName}
                onChange={(e) => setForm({ ...form, vendorName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
              <select
                value={form.vendorType}
                onChange={(e) => setForm({ ...form, vendorType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              >
                <option value="company">Company</option>
                <option value="individual">Individual</option>
                <option value="contractor">Contractor</option>
                <option value="consultant">Consultant</option>
              </select>
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
              <input
                placeholder="Tax ID"
                value={form.taxId}
                onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
