'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, ShieldCheck, Users, Clock, Loader2, X } from 'lucide-react';
import { LeavePolicyService } from '../services';
import type { LeavePolicy } from '../types';

export default function LeavePolicyPage() {
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    weekendCounting: 'exclude' as 'include' | 'exclude' | 'sandwich',
    managerApprovalRequired: true,
    hrApprovalRequired: false,
    escalationAfterDays: 3,
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const result = await LeavePolicyService.getPolicies();
      setPolicies(result);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPolicy = (policy: LeavePolicy) => {
    setEditingPolicy(policy);
    setForm({
      name: policy.name || '',
      description: policy.description || '',
      weekendCounting: policy.weekendCounting || 'exclude',
      managerApprovalRequired: policy.managerApprovalRequired ?? true,
      hrApprovalRequired: policy.hrApprovalRequired ?? false,
      escalationAfterDays: policy.escalationAfterDays ?? 3,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !editingPolicy) return;
    try {
      setSaving(true);
      await LeavePolicyService.updatePolicy(editingPolicy.id, form as any);
      setShowModal(false);
      await fetchPolicies();
    } catch (error: any) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            Leave Policy
          </h1>
          <p className="text-slate-500 text-sm">Define accrual rules and policy assignments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {loading ? (
          <div className="col-span-2 text-center py-8 text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading leave policies...
          </div>
        ) : policies.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-slate-500">
            No leave policies configured yet.
          </div>
        ) : (
          policies.map((pol, i) => (
            <div
              key={pol.id || i}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                  {pol.name}
                </h3>
                <button
                  onClick={() => handleEditPolicy(pol)}
                  className="text-sm font-bold text-slate-500 hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <Users className="w-4 h-4" /> Assigned Group
                  </span>
                  <span className="font-bold text-sm">{pol.description || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <Clock className="w-4 h-4" /> Weekend Counting
                  </span>
                  <span className="font-bold text-sm capitalize">
                    {pol.weekendCounting || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <ShieldCheck className="w-4 h-4" /> Approval
                  </span>
                  <span className="font-bold text-sm">
                    {pol.managerApprovalRequired
                      ? 'Manager Required'
                      : pol.hrApprovalRequired
                        ? 'HR Required'
                        : 'Auto-approve'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Edit Policy: {editingPolicy?.name}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Policy Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Description / Assigned Group
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Weekend Counting
                </label>
                <select
                  value={form.weekendCounting}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, weekendCounting: e.target.value as any }))
                  }
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="exclude">Exclude weekends</option>
                  <option value="include">Include weekends</option>
                  <option value="sandwich">Sandwich rule</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Escalation After (days)
                </label>
                <input
                  type="number"
                  value={form.escalationAfterDays}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, escalationAfterDays: Number(e.target.value) }))
                  }
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  min={1}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.managerApprovalRequired}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, managerApprovalRequired: e.target.checked }))
                    }
                    className="accent-indigo-600"
                  />
                  <span className="text-sm font-bold">Manager Approval</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.hrApprovalRequired}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, hrApprovalRequired: e.target.checked }))
                    }
                    className="accent-indigo-600"
                  />
                  <span className="text-sm font-bold">HR Approval</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Update Policy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
