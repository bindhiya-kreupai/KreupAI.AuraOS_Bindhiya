'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Truck, CalendarClock, Wrench, Plus, AlertCircle, Inbox } from 'lucide-react';
import { EquipmentLeasingService } from '../services';
import type { EquipmentLease } from '../types';
import { LoadingOverlay } from '../components/LoadingSpinner';
import { ToastContainer } from '../components/Toast';
import { FormModal, Field, inputClass } from '../components/FormModal';
import { useConstructionToasts } from '../hooks/useConstructionToasts';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-600',
  maintenance: 'bg-amber-100 text-amber-600',
  pending: 'bg-indigo-100 text-indigo-600',
};

export default function EquipmentLeasingPage() {
  const { toasts, pushToast, dismissToast } = useConstructionToasts();
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [form, setForm] = useState({
    equipmentName: '',
    projectId: '',
    costLabel: '',
    endLabel: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await EquipmentLeasingService.getAllLeases();
      setLeases(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load equipment leases');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.equipmentName.trim()) {
      pushToast('error', 'Equipment name is required');
      return;
    }
    setSubmitting(true);
    try {
      await EquipmentLeasingService.createLease({
        equipmentName: form.equipmentName.trim(),
        projectId: form.projectId.trim() || 'unassigned',
        status: 'active',
        ...(form.costLabel ? { costLabel: form.costLabel } : {}),
        ...(form.endLabel ? { endLabel: form.endLabel } : {}),
      } as Partial<EquipmentLease>);
      pushToast('success', 'Equipment lease created');
      setModalOpen(false);
      setForm({ equipmentName: '', projectId: '', costLabel: '', endLabel: '' });
      await load();
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : 'Failed to create lease');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportIssue = async (leaseId: string) => {
    setBusyId(leaseId);
    try {
      await EquipmentLeasingService.updateLease(leaseId, {
        status: 'maintenance',
        issueReportedAt: new Date().toISOString(),
      } as unknown as Partial<EquipmentLease>);
      pushToast('success', 'Issue reported — flagged for maintenance');
      await load();
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : 'Failed to report issue');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismissToast} />
      {loading && <LoadingOverlay message="Loading equipment..." />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="w-6 h-6 text-indigo-500" />
            Equipment Leasing
          </h1>
          <p className="text-slate-500 text-sm">
            Manage heavy machinery rentals and maintenance schedules.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Rent Equipment
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

      {!loading && !error && leases.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
          <Inbox className="w-12 h-12 mb-3 text-slate-300" />
          <p className="font-bold">No equipment leased</p>
          <p className="text-sm">Rent equipment to see it here.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 overflow-y-auto">
        {leases.map((eq: EquipmentLease & Record<string, any>) => {
          const id = eq.leaseId ?? eq.id;
          const status = String(eq.status ?? 'pending');
          return (
            <div
              key={id}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 group-hover:scale-125 transition-transform duration-500">
                <Truck className="w-24 h-24" />
              </div>
              <h3 className="font-bold text-lg w-3/4 mb-1">{eq.equipmentName ?? 'Equipment'}</h3>
              {eq.endLabel && (
                <div className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" /> Ends: {eq.endLabel}
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {status}
                </span>
                {eq.projectId && (
                  <span className="text-xs font-bold text-slate-400">@ {eq.projectId}</span>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="font-bold text-indigo-600">{eq.costLabel ?? '—'}</span>
                {status !== 'maintenance' && (
                  <button
                    onClick={() => handleReportIssue(id)}
                    disabled={busyId === id}
                    className="text-xs text-rose-500 flex items-center gap-1 font-bold disabled:opacity-50"
                  >
                    <Wrench className="w-3 h-3" /> {busyId === id ? 'Reporting...' : 'Report Issue'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <FormModal
        open={modalOpen}
        title="Rent Equipment"
        submitLabel="Create Lease"
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      >
        <Field label="Equipment Name">
          <input
            className={inputClass}
            value={form.equipmentName}
            onChange={(e) => setForm({ ...form, equipmentName: e.target.value })}
            placeholder="Caterpillar 320 Excavator"
            required
          />
        </Field>
        <Field label="Project / Site ID">
          <input
            className={inputClass}
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            placeholder="Skyline Site"
          />
        </Field>
        <Field label="Rate">
          <input
            className={inputClass}
            value={form.costLabel}
            onChange={(e) => setForm({ ...form, costLabel: e.target.value })}
            placeholder="$450/day"
          />
        </Field>
        <Field label="Lease End">
          <input
            className={inputClass}
            value={form.endLabel}
            onChange={(e) => setForm({ ...form, endLabel: e.target.value })}
            placeholder="Dec 15, 2024"
          />
        </Field>
      </FormModal>
    </div>
  );
}
