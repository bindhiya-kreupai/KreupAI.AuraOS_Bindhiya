'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  HardHat,
  MapPin,
  Users,
  Calendar,
  ArrowRightCircle,
  Truck,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { StaffingService } from '../services';
import { LoadingOverlay } from '../components/LoadingSpinner';
import { ToastContainer } from '../components/Toast';
import { FormModal, Field, inputClass } from '../components/FormModal';
import { useConstructionToasts } from '../hooks/useConstructionToasts';

export default function StaffingPage() {
  const { toasts, pushToast, dismissToast } = useConstructionToasts();
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [form, setForm] = useState({ projectName: '', location: '', crewSize: '0', workType: '' });
  const [rosterCrew, setRosterCrew] = useState('0');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await StaffingService.getAllAllocations();
      setAllocations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staffing allocations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectName.trim()) {
      pushToast('error', 'Project name is required');
      return;
    }
    setSubmitting(true);
    try {
      await StaffingService.createAllocation({
        projectName: form.projectName.trim(),
        location: form.location.trim(),
        crewSize: Number(form.crewSize) || 0,
        workType: form.workType.trim(),
        status: 'active',
      });
      pushToast('success', 'Allocation created');
      setCreateOpen(false);
      setForm({ projectName: '', location: '', crewSize: '0', workType: '' });
      await load();
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : 'Failed to create allocation');
    } finally {
      setSubmitting(false);
    }
  };

  const openRoster = (alloc: any) => {
    setRosterOpen(alloc);
    setRosterCrew(String(alloc.crewSize ?? 0));
  };

  const handleManageRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rosterOpen) return;
    setSubmitting(true);
    try {
      await StaffingService.updateAllocation(rosterOpen.allocationId ?? rosterOpen.id, {
        crewSize: Number(rosterCrew) || 0,
      });
      pushToast('success', 'Roster updated');
      setRosterOpen(null);
      await load();
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : 'Failed to update roster');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransport = async (alloc: any) => {
    const id = alloc.allocationId ?? alloc.id;
    setBusyId(id);
    try {
      await StaffingService.updateAllocation(id, {
        transportRequested: true,
        transportRequestedAt: new Date().toISOString(),
      });
      pushToast('success', 'Transport requested for crew');
      await load();
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : 'Failed to request transport');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismissToast} />
      {loading && <LoadingOverlay message="Loading allocations..." />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Project Staffing
          </h1>
          <p className="text-slate-500 text-sm">
            Allocate crews to sites, manage labor budget, and transport.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-800/30">
            <Calendar className="w-4 h-4" /> Current Allocation
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Allocation
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
          <button onClick={() => void load()} className="ml-auto font-bold underline">
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full min-h-0 overflow-y-auto pb-20">
        {allocations.map((p: any) => (
          <div
            key={p.allocationId ?? p.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                  {p.projectName}
                </h3>
                {p.location && (
                  <div className="text-sm font-bold text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {p.location}
                  </div>
                )}
              </div>
              <span
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  p.status === 'active'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-indigo-100 text-indigo-600'
                }`}
              >
                {p.status ?? 'active'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="text-xs text-slate-500 font-bold uppercase mb-1">Crew Size</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {p.crewSize ?? 0} <HardHat className="w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="text-xs text-slate-500 font-bold uppercase mb-1">Work Type</div>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {p.workType ?? '—'}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
              <div className="flex gap-2">
                <button
                  onClick={() => openRoster(p)}
                  className="flex-1 py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-colors"
                >
                  Manage Roster
                </button>
                <button
                  onClick={() => handleTransport(p)}
                  disabled={busyId === (p.allocationId ?? p.id)}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group disabled:opacity-50"
                  title="Request transport"
                >
                  <Truck className="w-4 h-4 group-hover:text-indigo-500" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300">Wait Bench</h3>
          <p className="text-sm text-slate-500 mb-6">
            {allocations.length === 0
              ? 'No crews allocated yet. Create an allocation to begin.'
              : 'Add another allocation to assign available crews.'}
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 px-6 py-2 rounded-xl text-sm font-bold shadow hover:shadow-md transition-all text-indigo-600 border border-slate-100 dark:border-slate-700"
          >
            View Available Staff <ArrowRightCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      <FormModal
        open={createOpen}
        title="New Allocation"
        submitLabel="Create Allocation"
        submitting={submitting}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      >
        <Field label="Project Name">
          <input
            className={inputClass}
            value={form.projectName}
            onChange={(e) => setForm({ ...form, projectName: e.target.value })}
            placeholder="Skyline Tower (Phase 2)"
            required
          />
        </Field>
        <Field label="Location">
          <input
            className={inputClass}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Downtown"
          />
        </Field>
        <Field label="Crew Size">
          <input
            className={inputClass}
            type="number"
            min={0}
            value={form.crewSize}
            onChange={(e) => setForm({ ...form, crewSize: e.target.value })}
          />
        </Field>
        <Field label="Work Type">
          <input
            className={inputClass}
            value={form.workType}
            onChange={(e) => setForm({ ...form, workType: e.target.value })}
            placeholder="Concrete & Steel"
          />
        </Field>
      </FormModal>

      <FormModal
        open={rosterOpen !== null}
        title={`Manage Roster${rosterOpen ? ` — ${rosterOpen.projectName}` : ''}`}
        submitLabel="Update Roster"
        submitting={submitting}
        onClose={() => setRosterOpen(null)}
        onSubmit={handleManageRoster}
      >
        <Field label="Crew Size">
          <input
            className={inputClass}
            type="number"
            min={0}
            value={rosterCrew}
            onChange={(e) => setRosterCrew(e.target.value)}
          />
        </Field>
      </FormModal>
    </div>
  );
}
