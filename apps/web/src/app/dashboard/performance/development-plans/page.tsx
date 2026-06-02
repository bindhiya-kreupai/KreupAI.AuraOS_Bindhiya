'use client';

import React, { useState, useEffect } from 'react';
import { DevelopmentPlanService } from '../core/services';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Loader2,
  Rocket,
  Save,
  Target,
  X,
} from 'lucide-react';

type NewPlanForm = {
  employeeId: string;
  title: string;
  type: string;
  description: string;
  endDate: string;
};

const emptyPlanForm: NewPlanForm = {
  employeeId: '',
  title: '',
  type: 'Skill Development',
  description: '',
  endDate: '',
};

export default function DevelopmentPlansPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [editing, setEditing] = useState<NewPlanForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const loadPlans = async () => {
    try {
      const data = await DevelopmentPlanService.getPlans();
      setPlans(data);
    } catch (error: any) {
      console.error('Failed to load development plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(t);
  }, [status]);

  const createPlan = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.employeeId.trim()) {
      setStatus({ kind: 'error', text: 'Title and employee ID are required.' });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      await DevelopmentPlanService.createPlan({
        employeeId: editing.employeeId,
        title: editing.title,
        type: editing.type,
        description: editing.description || undefined,
        endDate: editing.endDate || undefined,
        status: 'Active',
        activities: [],
      } as any);
      await loadPlans();
      setEditing(null);
      setStatus({ kind: 'success', text: 'Development plan created.' });
    } catch (e: any) {
      console.error(e);
      setStatus({ kind: 'error', text: e?.message || 'Failed to create plan.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="w-6 h-6 text-indigo-500" />
            Development Plans
          </h1>
          <p className="text-slate-500 text-sm">
            Create and track Individual Development Plans (IDPs).
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyPlanForm })}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
        >
          <Target className="w-4 h-4" /> New Plan
        </button>
      </div>

      {status && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm flex items-center gap-2 ${
            status.kind === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          {status.kind === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {status.text}
        </div>
      )}

      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Rocket className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-bold text-lg">No development plans found</p>
          <p className="text-sm mt-1">Create your first IDP to start tracking growth</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {plans.map((plan) => {
            const completedActivities =
              plan.activities?.filter((a: any) => a.status === 'Completed').length || 0;
            const totalActivities = plan.activities?.length || 0;
            const progressPct =
              totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
            const isCompleted = plan.status === 'Completed';
            const isInProgress = plan.status === 'In Progress' || plan.status === 'Active';
            const dueDate = plan.endDate
              ? new Date(plan.endDate).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })
              : 'No due date';

            return (
              <div
                key={plan.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative group overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 w-1 h-full ${
                    isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-indigo-500' : 'bg-slate-300'
                  }`}
                ></div>

                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold uppercase">
                    {plan.type}
                  </span>
                  <span className="text-xs font-bold text-slate-500">Due: {dueDate}</span>
                </div>

                <h3 className="font-bold text-lg mb-2">{plan.name}</h3>

                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-slate-500">{plan.status}</span>
                    <span className="font-bold">{progressPct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button className="text-sm font-bold text-indigo-600 hover:underline">
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold">New development plan</h3>
              <button
                onClick={() => setEditing(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <label className="block sm:col-span-2">
                <span className="block text-xs font-medium text-slate-500 mb-1">Title</span>
                <input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">Employee ID</span>
                <input
                  value={editing.employeeId}
                  onChange={(e) => setEditing({ ...editing, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">Type</span>
                <select
                  value={editing.type}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <option>Skill Development</option>
                  <option>Leadership</option>
                  <option>Career</option>
                  <option>Performance Improvement</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="block text-xs font-medium text-slate-500 mb-1">Description</span>
                <textarea
                  rows={2}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 resize-none"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">Target date</span>
                <input
                  type="date"
                  value={editing.endDate}
                  onChange={(e) => setEditing({ ...editing, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createPlan}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                <Save className="w-4 h-4" /> {saving ? 'Creating…' : 'Create plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
