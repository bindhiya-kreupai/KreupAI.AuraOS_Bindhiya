'use client';

import React, { useState, useEffect } from 'react';
import { Handshake, X } from 'lucide-react';
import { UnionService } from '../services';
import type { CollectiveBargainingAgreement, Toast } from '../types';
import { ToastContainer } from '../components/Toast';

type CBAStatus = CollectiveBargainingAgreement['status'];

interface CBAFormState {
  agreementName: string;
  unionName: string;
  status: CBAStatus;
  effectiveDate: string;
  expiryDate: string;
}

const EMPTY_FORM: CBAFormState = {
  agreementName: '',
  unionName: '',
  status: 'draft',
  effectiveDate: '',
  expiryDate: '',
};

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  negotiation: 'bg-amber-100 text-amber-600',
  active: 'bg-emerald-100 text-emerald-600',
  expired: 'bg-rose-100 text-rose-600',
  terminated: 'bg-rose-100 text-rose-600',
};

export default function CollectiveBargainingPage() {
  const [agreements, setAgreements] = useState<CollectiveBargainingAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<CBAFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const notify = (type: Toast['type'], message: string) =>
    setToasts((t) => [...t, { id: crypto.randomUUID(), type, message }]);
  const closeToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    setLoading(true);
    try {
      const data = await UnionService.getCBAgreements();
      setAgreements(data);
    } catch (error) {
      console.error('Error:', error);
      notify('error', 'Failed to load agreements.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await UnionService.createCBAgreement({
        agreementName: form.agreementName,
        unionName: form.unionName,
        status: form.status,
        effectiveDate: form.effectiveDate || undefined,
        expiryDate: form.expiryDate || undefined,
      });
      setShowAdd(false);
      setForm(EMPTY_FORM);
      notify('success', 'Proposal drafted successfully.');
      await fetchAgreements();
    } catch (error) {
      console.error('Error:', error);
      notify('error', 'Failed to draft proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  const countBy = (status: CBAStatus) => agreements.filter((a) => a.status === status).length;

  const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : '—');
  const fmtCost = (a: CollectiveBargainingAgreement) =>
    a.financialImpact
      ? `${a.financialImpact.currency} ${a.financialImpact.estimatedCost.toLocaleString()}`
      : '—';

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Handshake className="w-6 h-6 text-indigo-500" />
            Collective Bargaining
          </h1>
          <p className="text-slate-500 text-sm">Manage contract negotiations and proposals.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
        >
          Draft New Proposal
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 shrink-0">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 text-xs uppercase font-bold">Draft</div>
          <div className="text-2xl font-bold">{countBy('draft')}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 text-xs uppercase font-bold">Negotiation</div>
          <div className="text-2xl font-bold text-amber-600">{countBy('negotiation')}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 text-xs uppercase font-bold">Active</div>
          <div className="text-2xl font-bold text-emerald-600">{countBy('active')}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 text-xs uppercase font-bold">Expired</div>
          <div className="text-2xl font-bold text-rose-600">{countBy('expired')}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex-1 overflow-auto">
        <h3 className="font-bold text-lg mb-4">Agreements &amp; Negotiations</h3>
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading agreements&hellip;</div>
        ) : agreements.length === 0 ? (
          <div className="py-12 text-center text-slate-500">No agreements found.</div>
        ) : (
          <div className="space-y-3">
            {agreements.map((a) => (
              <div
                key={a.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">{a.agreementCode}</span>
                    <div className="font-bold text-lg">{a.agreementName}</div>
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    Union: {a.unionName} &middot; {fmtDate(a.effectiveDate)} &rarr;{' '}
                    {fmtDate(a.expiryDate)} &middot; Cost: {fmtCost(a)}
                  </div>
                </div>
                <span
                  className={`mt-2 md:mt-0 px-2 py-1 rounded text-xs font-bold capitalize ${STATUS_STYLES[a.status] || 'bg-slate-100 text-slate-600'}`}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-auto"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Draft New Proposal</h3>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Agreement Name</label>
              <input
                required
                value={form.agreementName}
                onChange={(e) => setForm({ ...form, agreementName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold mb-1">Union Name</label>
                <input
                  required
                  value={form.unionName}
                  onChange={(e) => setForm({ ...form, unionName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as CBAStatus })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold mb-1">Effective Date</label>
                <input
                  type="date"
                  value={form.effectiveDate}
                  onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitting ? 'Saving…' : 'Draft Proposal'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}
