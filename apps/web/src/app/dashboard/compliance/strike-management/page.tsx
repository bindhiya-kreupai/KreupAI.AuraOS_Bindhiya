'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Shield, Users, AlertTriangle, X } from 'lucide-react';
import { StrikeService } from '../services';
import type { Strike, Toast } from '../types';
import { ToastContainer } from '../components/Toast';

type StrikeRow = Strike & { responseMode?: 'standby' | 'deployed' };

type StrikeType = Strike['strikeType'];

interface StrikeFormState {
  strikeName: string;
  unionName: string;
  strikeType: StrikeType;
  proposedStartDate: string;
  affectedEmployeeCount: string;
}

const EMPTY_FORM: StrikeFormState = {
  strikeName: '',
  unionName: '',
  strikeType: 'full',
  proposedStartDate: '',
  affectedEmployeeCount: '',
};

const STATUS_STYLES: Record<string, string> = {
  notice_received: 'bg-amber-100 text-amber-600',
  in_negotiation: 'bg-indigo-100 text-indigo-600',
  active: 'bg-rose-100 text-rose-600',
  resolved: 'bg-emerald-100 text-emerald-600',
  cancelled: 'bg-slate-100 text-slate-600',
};

export default function StrikeManagementPage() {
  const [strikes, setStrikes] = useState<StrikeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<StrikeFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const notify = (type: Toast['type'], message: string) =>
    setToasts((t) => [...t, { id: crypto.randomUUID(), type, message }]);
  const closeToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  useEffect(() => {
    fetchStrikes();
  }, []);

  const fetchStrikes = async () => {
    setLoading(true);
    try {
      const data = await StrikeService.getStrikes();
      setStrikes(data as StrikeRow[]);
    } catch (error) {
      console.error('Error:', error);
      notify('error', 'Failed to load strikes.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await StrikeService.createStrike({
        strikeName: form.strikeName,
        unionName: form.unionName,
        strikeType: form.strikeType,
        proposedStartDate: form.proposedStartDate || undefined,
        affectedEmployeeCount: Number(form.affectedEmployeeCount) || 0,
      });
      setShowAdd(false);
      setForm(EMPTY_FORM);
      notify('success', 'Strike notice created.');
      await fetchStrikes();
    } catch (error) {
      console.error('Error:', error);
      notify('error', 'Failed to create strike notice.');
    } finally {
      setSubmitting(false);
    }
  };

  const setResponseMode = async (id: string, responseMode: 'standby' | 'deployed') => {
    setBusyId(id);
    try {
      await StrikeService.updateStrike(id, { responseMode });
      notify('success', responseMode === 'deployed' ? 'Contingency deployed.' : 'Set to standby.');
      await fetchStrikes();
    } catch (error) {
      console.error('Error:', error);
      notify('error', 'Failed to update response mode.');
    } finally {
      setBusyId(null);
    }
  };

  const countBy = (status: string) => strikes.filter((s) => s.status === status).length;
  const fmtStatus = (s: string) => s.replace(/_/g, ' ');

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-rose-500" />
            Strike Management
          </h1>
          <p className="text-slate-500 text-sm">
            Contingency planning and strike impact monitoring.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-500/20"
        >
          New Strike Notice
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 shrink-0">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 text-xs uppercase font-bold">Notices</div>
          <div className="text-2xl font-bold text-amber-600">{countBy('notice_received')}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 text-xs uppercase font-bold">Negotiating</div>
          <div className="text-2xl font-bold text-indigo-600">{countBy('in_negotiation')}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 text-xs uppercase font-bold">Active</div>
          <div className="text-2xl font-bold text-rose-600">{countBy('active')}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 text-xs uppercase font-bold">Resolved</div>
          <div className="text-2xl font-bold text-emerald-600">{countBy('resolved')}</div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          Loading strikes&hellip;
        </div>
      ) : strikes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          No strikes on record.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-auto">
          {strikes.map((strike) => {
            const deployed = strike.responseMode === 'deployed';
            return (
              <div
                key={strike.id}
                className="p-4 border border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/10 rounded-xl"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    <div className="font-bold text-rose-900 dark:text-rose-200">
                      {strike.strikeName}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold capitalize ${STATUS_STYLES[strike.status] || 'bg-slate-100 text-slate-600'}`}
                  >
                    {fmtStatus(strike.status)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <div>
                    <span className="block text-xs uppercase font-bold text-slate-400">Union</span>
                    {strike.unionName || '—'}
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-bold text-slate-400">Type</span>
                    <span className="capitalize">{fmtStatus(strike.strikeType)}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase font-bold text-slate-400">
                      Affected
                    </span>
                    {strike.affectedEmployeeCount}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-rose-100 dark:border-rose-900/30 pt-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 ${deployed ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                  >
                    {deployed ? <Shield className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                    {strike.responseMode || 'standby'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={busyId === strike.id || deployed}
                      onClick={() => setResponseMode(strike.id, 'deployed')}
                      className="text-xs font-bold text-white bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Deploy
                    </button>
                    <button
                      disabled={busyId === strike.id || !deployed}
                      onClick={() => setResponseMode(strike.id, 'standby')}
                      className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50"
                    >
                      Standby
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-auto"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">New Strike Notice</h3>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Strike Name</label>
              <input
                required
                value={form.strikeName}
                onChange={(e) => setForm({ ...form, strikeName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold mb-1">Union Name</label>
                <input
                  value={form.unionName}
                  onChange={(e) => setForm({ ...form, unionName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Strike Type</label>
                <select
                  value={form.strikeType}
                  onChange={(e) => setForm({ ...form, strikeType: e.target.value as StrikeType })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                >
                  <option value="full">Full</option>
                  <option value="partial">Partial</option>
                  <option value="sit_in">Sit-in</option>
                  <option value="work_to_rule">Work-to-Rule</option>
                  <option value="slowdown">Slowdown</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold mb-1">Proposed Start Date</label>
                <input
                  type="date"
                  value={form.proposedStartDate}
                  onChange={(e) => setForm({ ...form, proposedStartDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Affected Employees</label>
                <input
                  type="number"
                  min="0"
                  value={form.affectedEmployeeCount}
                  onChange={(e) => setForm({ ...form, affectedEmployeeCount: e.target.value })}
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
                className="flex-1 py-2 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 disabled:opacity-60"
              >
                {submitting ? 'Saving…' : 'Create Notice'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}
