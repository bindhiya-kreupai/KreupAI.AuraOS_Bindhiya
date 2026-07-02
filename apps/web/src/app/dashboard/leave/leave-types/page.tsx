'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Edit, Trash2, Plus, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { LeaveTypeService } from '../services';
import type { LeaveType } from '../types';

interface Feedback {
  type: 'success' | 'error';
  message: string;
}

const EMPTY_FORM = {
  name: '',
  code: '',
  description: '',
  isPaid: true,
  isCarryForwardAllowed: false,
  maxCarryForwardDays: 0,
  isEncashable: false,
  annualQuota: 0,
};

export default function LeaveTypesPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const result = await LeaveTypeService.getLeaveTypes();
      setLeaveTypes(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load leave types';
      setFeedback({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leave type?')) return;
    try {
      await LeaveTypeService.deleteLeaveType(id);
      setFeedback({ type: 'success', message: 'Leave type deleted successfully.' });
      await fetchLeaveTypes();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete leave type';
      setFeedback({ type: 'error', message });
    }
  };

  const handleEdit = (type: LeaveType) => {
    setEditingType(type);
    setForm({
      name: type.name || '',
      code: type.code || '',
      description: type.description || '',
      isPaid: type.isPaid ?? true,
      isCarryForwardAllowed: type.isCarryForwardAllowed ?? false,
      maxCarryForwardDays: type.maxCarryForwardDays ?? 0,
      isEncashable: type.isEncashable ?? false,
      annualQuota: type.annualQuota ?? 0,
    });
    setShowModal(true);
  };

  const handleAddType = () => {
    setEditingType(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.code.trim()) return;
    try {
      setSaving(true);
      if (editingType) {
        await LeaveTypeService.updateLeaveType(editingType.id, form as Partial<LeaveType>);
        setFeedback({ type: 'success', message: `Leave type "${form.name}" updated.` });
      } else {
        await LeaveTypeService.createLeaveType(form as unknown as LeaveType);
        setFeedback({ type: 'success', message: `Leave type "${form.name}" created.` });
      }
      setShowModal(false);
      await fetchLeaveTypes();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save leave type';
      setFeedback({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-500" />
            Leave Types
          </h1>
          <p className="text-slate-500 text-sm">Configure available leave categories.</p>
        </div>
        <button
          onClick={handleAddType}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Type
        </button>
      </div>

      {feedback && (
        <div
          role="alert"
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium shrink-0 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-lg">Defined Leave Types</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-4">Type Name</th>
              <th className="px-6 py-4">Abbreviation</th>
              <th className="px-6 py-4">Paid</th>
              <th className="px-6 py-4">Carry Forward</th>
              <th className="px-6 py-4">Encashable</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading leave types...
                  </div>
                </td>
              </tr>
            ) : leaveTypes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No leave types configured yet.
                </td>
              </tr>
            ) : (
              leaveTypes.map((type, i) => (
                <tr key={type.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-bold">{type.name}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{type.code}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        type.isPaid
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {type.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {type.isCarryForwardAllowed != null
                      ? type.isCarryForwardAllowed
                        ? `Max ${type.maxCarryForwardDays ?? 'N/A'} Days`
                        : 'No'
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {type.isEncashable != null ? (
                      type.isEncashable ? (
                        <span className="text-emerald-600 font-bold">Yes</span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleEdit(type)}
                      className="text-slate-400 hover:text-indigo-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(type.id)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingType ? 'Edit Leave Type' : 'Add Leave Type'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Annual Leave"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Code *</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    placeholder="e.g. AL"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={2}
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Annual Quota (days)
                </label>
                <input
                  type="number"
                  value={form.annualQuota}
                  onChange={(e) => setForm((p) => ({ ...p, annualQuota: Number(e.target.value) }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  min={0}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPaid}
                    onChange={(e) => setForm((p) => ({ ...p, isPaid: e.target.checked }))}
                    className="accent-indigo-600"
                  />
                  <span className="text-sm font-bold">Paid</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isEncashable}
                    onChange={(e) => setForm((p) => ({ ...p, isEncashable: e.target.checked }))}
                    className="accent-indigo-600"
                  />
                  <span className="text-sm font-bold">Encashable</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isCarryForwardAllowed}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, isCarryForwardAllowed: e.target.checked }))
                    }
                    className="accent-indigo-600"
                  />
                  <span className="text-sm font-bold">Carry Forward</span>
                </label>
              </div>
              {form.isCarryForwardAllowed && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Max Carry Forward Days
                  </label>
                  <input
                    type="number"
                    value={form.maxCarryForwardDays}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, maxCarryForwardDays: Number(e.target.value) }))
                    }
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    min={0}
                  />
                </div>
              )}
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
                {saving ? 'Saving...' : editingType ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
