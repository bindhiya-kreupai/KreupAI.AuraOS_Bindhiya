'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Users, FileSignature, CreditCard, Plus, AlertCircle, Inbox } from 'lucide-react';
import { SubcontractorPortalService } from '../services';
import type { SubcontractorProfile } from '../types';
import { LoadingOverlay } from '../components/LoadingSpinner';
import { ToastContainer } from '../components/Toast';
import { FormModal, Field, inputClass } from '../components/FormModal';
import { useConstructionToasts } from '../hooks/useConstructionToasts';

export default function SubcontractorPortalPage() {
  const { toasts, pushToast, dismissToast } = useConstructionToasts();
  const [subs, setSubs] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [form, setForm] = useState({ companyName: '', specialty: '', paymentTerms: 'Net 30' });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, c, i] = await Promise.all([
        SubcontractorPortalService.getAllSubcontractors(),
        SubcontractorPortalService.getAllContracts(),
        SubcontractorPortalService.getAllInvoices(),
      ]);
      setSubs(Array.isArray(s) ? s : []);
      setContracts(Array.isArray(c) ? c : []);
      setInvoices(Array.isArray(i) ? i : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subcontractors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName.trim()) {
      pushToast('error', 'Company name is required');
      return;
    }
    setSubmitting(true);
    try {
      await SubcontractorPortalService.createSubcontractor({
        companyName: form.companyName.trim(),
        specialty: form.specialty ? form.specialty.split(',').map((s) => s.trim()) : [],
        status: 'active',
        ...(form.paymentTerms ? { paymentTerms: form.paymentTerms } : {}),
      } as Partial<SubcontractorProfile>);
      pushToast('success', 'Vendor added successfully');
      setModalOpen(false);
      setForm({ companyName: '', specialty: '', paymentTerms: 'Net 30' });
      await load();
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : 'Failed to add vendor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateContract = async (sub: any) => {
    const subId = sub.subcontractorId ?? sub.id;
    setBusyId(`c-${subId}`);
    try {
      await SubcontractorPortalService.createContract({
        subcontractorId: subId,
        projectId: 'unassigned',
        status: 'draft',
        scope: `${sub.companyName} services`,
      } as any);
      pushToast('success', `Draft contract created for ${sub.companyName}`);
      await load();
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : 'Failed to create contract');
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateInvoice = async (sub: any) => {
    const subId = sub.subcontractorId ?? sub.id;
    const contract = contracts.find((c) => (c.subcontractorId ?? '') === subId);
    if (!contract) {
      pushToast('info', 'Create a contract first before raising an invoice');
      return;
    }
    setBusyId(`i-${subId}`);
    try {
      await SubcontractorPortalService.createInvoice({
        contractId: contract.contractId ?? contract.id,
        subcontractorId: subId,
        status: 'draft',
      } as any);
      pushToast('success', `Draft invoice created for ${sub.companyName}`);
      await load();
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : 'Failed to create invoice');
    } finally {
      setBusyId(null);
    }
  };

  const contractLabel = (subId: string) => {
    const active = contracts.filter((c) => (c.subcontractorId ?? '') === subId);
    return active.length > 0 ? `${active.length} contract${active.length === 1 ? '' : 's'}` : '—';
  };

  const invoiceLabel = (subId: string) => {
    const pending = invoices.filter(
      (i) => (i.subcontractorId ?? '') === subId && i.status !== 'paid'
    );
    return pending.length > 0 ? `${pending.length} pending` : '—';
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismissToast} />
      {loading && <LoadingOverlay message="Loading subcontractors..." />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Subcontractor Portal
          </h1>
          <p className="text-slate-500 text-sm">
            Manage contracts, invoices, and performance of subcontractors.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Vendor
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
          <button onClick={() => void load()} className="ml-auto font-bold underline">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && subs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
          <Inbox className="w-12 h-12 mb-3 text-slate-300" />
          <p className="font-bold">No subcontractors yet</p>
          <p className="text-sm">Add a vendor to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-4">Subcontractor</th>
                <th className="px-6 py-4">Specialty</th>
                <th className="px-6 py-4">Contracts</th>
                <th className="px-6 py-4">Pending Invoice</th>
                <th className="px-6 py-4">Performance</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {subs.map((sub: SubcontractorProfile & Record<string, any>) => {
                const subId = sub.subcontractorId ?? sub.id;
                const rating = sub.performanceRating?.overallRating ?? sub.rating;
                const specialty = Array.isArray(sub.specialty)
                  ? sub.specialty.join(', ')
                  : (sub.specialty ?? '—');
                return (
                  <tr key={subId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-bold">{sub.companyName}</td>
                    <td className="px-6 py-4 text-slate-500">{specialty || '—'}</td>
                    <td className="px-6 py-4 font-mono">{contractLabel(subId)}</td>
                    <td className="px-6 py-4 font-mono text-indigo-600 font-bold">
                      {invoiceLabel(subId)}
                    </td>
                    <td className="px-6 py-4">
                      {typeof rating === 'number' ? (
                        <div className="flex items-center gap-1">
                          <span
                            className={`font-bold ${rating >= 4.5 ? 'text-emerald-600' : 'text-amber-600'}`}
                          >
                            {rating}
                          </span>
                          <span className="text-xs text-slate-400">/ 5.0</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                      <button
                        onClick={() => handleCreateContract(sub)}
                        disabled={busyId === `c-${subId}`}
                        title="Create contract"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 disabled:opacity-50"
                      >
                        <FileSignature className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCreateInvoice(sub)}
                        disabled={busyId === `i-${subId}`}
                        title="Create invoice"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 disabled:opacity-50"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <FormModal
        open={modalOpen}
        title="Add Vendor"
        submitLabel="Add Vendor"
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      >
        <Field label="Company Name">
          <input
            className={inputClass}
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            placeholder="ABC Electricals"
            required
          />
        </Field>
        <Field label="Specialty (comma-separated)">
          <input
            className={inputClass}
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
            placeholder="Electrical, Low Voltage"
          />
        </Field>
        <Field label="Payment Terms">
          <input
            className={inputClass}
            value={form.paymentTerms}
            onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
            placeholder="Net 30"
          />
        </Field>
      </FormModal>
    </div>
  );
}
