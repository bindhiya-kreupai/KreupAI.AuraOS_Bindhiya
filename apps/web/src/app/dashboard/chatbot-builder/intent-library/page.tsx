'use client';

import React, { useState, useMemo } from 'react';
import {
  BrainCircuit,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  Save,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useChatbot } from '../hooks/useChatbot';
import { ToastContainer } from '../components/Toast';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface IntentForm {
  intentName: string;
  displayName: string;
  description: string;
  category: string;
}

const emptyForm: IntentForm = {
  intentName: '',
  displayName: '',
  description: '',
  category: 'General',
};

export default function IntentLibraryPage() {
  const {
    intents,
    loading,
    createIntent,
    updateIntent,
    deleteIntent,
    toasts,
    addToast,
    removeToast,
  } = useChatbot();
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIntent, setEditingIntent] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<IntentForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const filteredIntents = useMemo(() => {
    if (!search.trim()) return intents;
    const q = search.toLowerCase();
    return intents.filter(
      (i) => i.intentName.toLowerCase().includes(q) || i.displayName.toLowerCase().includes(q)
    );
  }, [intents, search]);

  const handleCreate = async () => {
    if (!form.intentName.trim() || !form.displayName.trim()) {
      addToast({ type: 'error', message: 'Intent name and display name are required' });
      return;
    }
    setSubmitting(true);
    try {
      await createIntent({
        intentName: form.intentName.trim(),
        displayName: form.displayName.trim(),
        description: form.description.trim(),
        category: form.category,
        isActive: true,
        confidenceThreshold: 0.7,
      });
      setForm(emptyForm);
      setShowCreateModal(false);
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingIntent || !form.intentName.trim() || !form.displayName.trim()) return;
    setSubmitting(true);
    try {
      await updateIntent(editingIntent, {
        intentName: form.intentName.trim(),
        displayName: form.displayName.trim(),
        description: form.description.trim(),
        category: form.category,
      });
      setForm(emptyForm);
      setEditingIntent(null);
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (intentId: string) => {
    const intent = intents.find((i) => i.intentId === intentId);
    if (!intent) return;
    setForm({
      intentName: intent.intentName,
      displayName: intent.displayName,
      description: intent.description,
      category: intent.category,
    });
    setEditingIntent(intentId);
  };

  const handleDelete = async (intentId: string) => {
    setSubmitting(true);
    try {
      await deleteIntent(intentId);
    } catch {
    } finally {
      setSubmitting(false);
      setDeleteConfirm(null);
    }
  };

  const toggleActive = async (intentId: string, current: boolean) => {
    try {
      await updateIntent(intentId, { isActive: !current });
    } catch {}
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingIntent(null);
    setForm(emptyForm);
  };

  const modalOpen = showCreateModal || editingIntent !== null;

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-indigo-500" />
            Intent Library
          </h1>
          <p className="text-slate-500 text-sm">Manage what the users want to do.</p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Intent
        </button>
      </div>

      <div className="relative shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search intents by name or display name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder-slate-400"
        />
      </div>

      {loading && intents.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" message="Loading intents..." />
        </div>
      ) : filteredIntents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
          <BrainCircuit className="w-12 h-12 opacity-40" />
          <p className="text-lg font-medium">
            {search ? 'No intents match your search' : 'No intents yet'}
          </p>
          {!search && (
            <button
              onClick={() => {
                setForm(emptyForm);
                setShowCreateModal(true);
              }}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium underline underline-offset-2"
            >
              Create your first intent
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-20 overflow-y-auto">
          {filteredIntents.map((intent) => (
            <div
              key={intent.intentId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 truncate">
                      {intent.intentName}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        intent.category === 'HR'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : intent.category === 'IT'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : intent.category === 'Finance'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {intent.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">{intent.displayName}</p>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{intent.description}</p>
                </div>
                <div className="flex items-center gap-1 ml-3 shrink-0">
                  <button
                    onClick={() => handleEdit(intent.intentId)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all opacity-0 group-hover:opacity-100"
                    title="Edit intent"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(intent.intentId)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete intent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <BrainCircuit className="w-4 h-4" />
                  <span className="font-bold">{intent.trainingPhrases?.length ?? 0}</span> phrases
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-bold">
                    {Math.round((intent.averageConfidence ?? 0) * 100)}%
                  </span>{' '}
                  accuracy
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-bold">{intent.confidenceThreshold}</span> threshold
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 ml-auto">
                  <span className="font-bold">{intent.usageCount ?? 0}</span> used
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <button
                  onClick={() => toggleActive(intent.intentId, intent.isActive)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    intent.isActive
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Check className={`w-3 h-3 ${intent.isActive ? '' : 'opacity-40'}`} />
                  {intent.isActive ? 'Active' : 'Inactive'}
                </button>
                {deleteConfirm === intent.intentId && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-500 font-medium">Confirm delete?</span>
                    <button
                      onClick={() => handleDelete(intent.intentId)}
                      disabled={submitting}
                      className="px-2 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">
                {editingIntent ? 'Edit Intent' : 'Create Intent'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Intent Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.intentName}
                  onChange={(e) => setForm((prev) => ({ ...prev, intentName: e.target.value }))}
                  placeholder="e.g. #ApplyLeave"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
                  placeholder="e.g. Apply Leave"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this intent does..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder-slate-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                >
                  <option value="General">General</option>
                  <option value="HR">HR</option>
                  <option value="IT">IT</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Compliance">Compliance</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={editingIntent ? handleUpdate : handleCreate}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {submitting ? 'Saving...' : editingIntent ? 'Update Intent' : 'Create Intent'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
