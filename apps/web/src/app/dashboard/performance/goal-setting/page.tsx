'use client';

import React, { useEffect, useState } from 'react';
import { GoalService } from '../core/services';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Loader2,
  MoreVertical,
  Plus,
  Save,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';

type GoalForm = {
  id?: string;
  employeeId: string;
  title: string;
  description: string;
  category: 'Objective' | 'Key Result' | 'Personal';
  type: 'individual' | 'team' | 'company';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  dueDate: string;
};

const emptyForm: GoalForm = {
  employeeId: '',
  title: '',
  description: '',
  category: 'Objective',
  type: 'individual',
  priority: 'medium',
  progress: 0,
  dueDate: '',
};

export default function GoalSettingPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<any[]>([]);
  const [editing, setEditing] = useState<GoalForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(t);
  }, [status]);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const data = await GoalService.getGoals();
      setGoals(data || []);
    } catch (error: any) {
      console.error('Failed to load goals:', error);
      setStatus({ kind: 'error', text: error?.message || 'Failed to load goals.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const activeGoals = goals.filter((g) => g.status !== 'completed' && g.status !== 'archived');
  const archivedGoals = goals.filter((g) => g.status === 'completed' || g.status === 'archived');
  const displayGoals = activeTab === 'active' ? activeGoals : archivedGoals;

  const getStatusLabel = (goal: any) => {
    if (goal.status === 'completed') return 'Completed';
    if ((goal.progress ?? 0) < 30) return 'At Risk';
    return 'On Track';
  };

  const getTypeLabel = (goal: any) => {
    if (goal.type === 'objective' || goal.category === 'Objective') return 'Objective';
    if (goal.type === 'key_result' || goal.category === 'Key Result') return 'Key Result';
    return 'Personal';
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.employeeId.trim()) {
      setStatus({ kind: 'error', text: 'Title and employee ID are required.' });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const payload = {
        employeeId: editing.employeeId,
        title: editing.title,
        description: editing.description || undefined,
        category: editing.category,
        type: editing.type,
        priority: editing.priority,
        progress: Number(editing.progress) || 0,
        dueDate: editing.dueDate || undefined,
      };
      if (editing.id) {
        await GoalService.updateGoal(editing.id, payload as any);
      } else {
        await GoalService.createGoal(payload as any);
      }
      await loadGoals();
      setEditing(null);
      setStatus({ kind: 'success', text: editing.id ? 'Goal updated.' : 'Goal created.' });
    } catch (e: any) {
      console.error(e);
      setStatus({ kind: 'error', text: e?.message || 'Failed to save goal.' });
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-500" />
            Goal Setting
          </h1>
          <p className="text-slate-500 text-sm">
            Define and track your OKRs and performance objectives.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyForm })}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Goal
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

      <div className="flex gap-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-2 font-bold text-sm transition-colors ${
            activeTab === 'active'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Active Goals ({activeGoals.length})
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`pb-3 px-2 font-bold text-sm transition-colors ${
            activeTab === 'archived'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Archived ({archivedGoals.length})
        </button>
      </div>

      {displayGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Target className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-bold text-lg">No goals found</p>
          <p className="text-sm mt-1">Create your first goal to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayGoals.map((goal) => {
            const statusLabel = getStatusLabel(goal);
            const typeLabel = getTypeLabel(goal);
            const progress = `${goal.progress || 0}%`;
            const dueDate = goal.dueDate
              ? new Date(goal.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'No due date';

            return (
              <div
                key={goal.id}
                onClick={() =>
                  setEditing({
                    id: goal.id,
                    employeeId: goal.employeeId || '',
                    title: goal.title || '',
                    description: goal.description || '',
                    category: (goal.category as GoalForm['category']) || 'Objective',
                    type: (goal.type as GoalForm['type']) || 'individual',
                    priority: (goal.priority as GoalForm['priority']) || 'medium',
                    progress: goal.progress || 0,
                    dueDate: goal.dueDate ? new Date(goal.dueDate).toISOString().slice(0, 10) : '',
                  })
                }
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 group hover:border-indigo-300 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          typeLabel === 'Objective'
                            ? 'bg-purple-100 text-purple-600'
                            : typeLabel === 'Key Result'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {typeLabel}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          statusLabel === 'On Track'
                            ? 'bg-emerald-100 text-emerald-600'
                            : statusLabel === 'At Risk'
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">{goal.title}</h3>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-slate-500">Progress</span>
                      <span className="font-bold">{progress}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          statusLabel === 'On Track'
                            ? 'bg-emerald-500'
                            : statusLabel === 'At Risk'
                              ? 'bg-rose-500'
                              : 'bg-indigo-500'
                        }`}
                        style={{ width: progress }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Due: {dueDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {goal.type || 'Individual'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setEditing({ ...emptyForm })}
        className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-500 transition-all"
      >
        <Plus className="w-5 h-5" /> Add New Goal
      </button>

      {editing && (
        <GoalModal
          form={editing}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={save}
          saving={saving}
        />
      )}
    </div>
  );
}

function GoalModal({
  form,
  onChange,
  onClose,
  onSave,
  saving,
}: {
  form: GoalForm;
  onChange: (f: GoalForm) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold">{form.id ? 'Edit goal' : 'New goal'}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <label className="block sm:col-span-2">
            <span className="block text-xs font-medium text-slate-500 mb-1">Title</span>
            <input
              value={form.title}
              onChange={(e) => onChange({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="block text-xs font-medium text-slate-500 mb-1">Description</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 resize-none"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-500 mb-1">Employee ID</span>
            <input
              value={form.employeeId}
              onChange={(e) => onChange({ ...form, employeeId: e.target.value })}
              placeholder="e.g. EMP-1234"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-500 mb-1">Category</span>
            <select
              value={form.category}
              onChange={(e) =>
                onChange({ ...form, category: e.target.value as GoalForm['category'] })
              }
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <option>Objective</option>
              <option>Key Result</option>
              <option>Personal</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-500 mb-1">Type</span>
            <select
              value={form.type}
              onChange={(e) => onChange({ ...form, type: e.target.value as GoalForm['type'] })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <option value="individual">Individual</option>
              <option value="team">Team</option>
              <option value="company">Company</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-500 mb-1">Priority</span>
            <select
              value={form.priority}
              onChange={(e) =>
                onChange({ ...form, priority: e.target.value as GoalForm['priority'] })
              }
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-500 mb-1">Progress (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              value={form.progress}
              onChange={(e) => onChange({ ...form, progress: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-500 mb-1">Due date</span>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => onChange({ ...form, dueDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
