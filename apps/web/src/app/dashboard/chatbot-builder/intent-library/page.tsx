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
  ChevronDown,
  ChevronRight,
  Globe,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { useChatbot } from '../hooks/useChatbot';
import { ToastContainer } from '../components/Toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type {
  Intent,
  TrainingPhrase,
  IntentResponse,
  IntentParameter,
  IntentContext,
} from '../types';

interface IntentForm {
  intentName: string;
  displayName: string;
  description: string;
  category: string;
  priority: number;
  confidenceThreshold: number;
  webhookEnabled: boolean;
  webhookUrl: string;
}

const emptyForm: IntentForm = {
  intentName: '',
  displayName: '',
  description: '',
  category: 'General',
  priority: 0,
  confidenceThreshold: 0.7,
  webhookEnabled: false,
  webhookUrl: '',
};

const categories = ['General', 'HR', 'IT', 'Finance', 'Operations', 'Compliance'];

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
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIntent, setEditingIntent] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<IntentForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [newPhrase, setNewPhrase] = useState<Record<string, string>>({});
  const [newResponse, setNewResponse] = useState<Record<string, string>>({});

  const filteredIntents = useMemo(() => {
    let result = intents;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) => i.intentName.toLowerCase().includes(q) || i.displayName.toLowerCase().includes(q)
      );
    }
    if (categoryFilter) {
      result = result.filter((i) => i.category === categoryFilter);
    }
    return result;
  }, [intents, search, categoryFilter]);

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
        priority: form.priority,
        confidenceThreshold: form.confidenceThreshold,
        webhookEnabled: form.webhookEnabled,
        webhookUrl: form.webhookEnabled ? form.webhookUrl.trim() : undefined,
        isActive: true,
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
        priority: form.priority,
        confidenceThreshold: form.confidenceThreshold,
        webhookEnabled: form.webhookEnabled,
        webhookUrl: form.webhookEnabled ? form.webhookUrl.trim() : undefined,
      });
      setForm(emptyForm);
      setEditingIntent(null);
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (intent: Intent) => {
    setForm({
      intentName: intent.intentName,
      displayName: intent.displayName,
      description: intent.description,
      category: intent.category,
      priority: intent.priority,
      confidenceThreshold: intent.confidenceThreshold,
      webhookEnabled: intent.webhookEnabled,
      webhookUrl: intent.webhookUrl ?? '',
    });
    setEditingIntent(intent.intentId);
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

  const toggleActive = async (intent: Intent) => {
    try {
      await updateIntent(intent.intentId, { isActive: !intent.isActive });
    } catch {}
  };

  const addPhrase = async (intent: Intent) => {
    const text = newPhrase[intent.intentId];
    if (!text?.trim()) return;
    const phrase: TrainingPhrase = {
      phraseId: `phrase-${Date.now()}`,
      text: text.trim(),
      language: 'en',
      annotations: [],
      addedDate: new Date(),
    };
    try {
      await updateIntent(intent.intentId, {
        trainingPhrases: [...(intent.trainingPhrases ?? []), phrase],
      });
      setNewPhrase((p) => ({ ...p, [intent.intentId]: '' }));
    } catch {}
  };

  const removePhrase = async (intent: Intent, phraseId: string) => {
    try {
      await updateIntent(intent.intentId, {
        trainingPhrases: (intent.trainingPhrases ?? []).filter((p) => p.phraseId !== phraseId),
      });
    } catch {}
  };

  const addResponse = async (intent: Intent) => {
    const text = newResponse[intent.intentId];
    if (!text?.trim()) return;
    const response: IntentResponse = {
      responseId: `resp-${Date.now()}`,
      responseType: 'text',
      content: { text: text.trim() },
      language: 'en',
    };
    try {
      await updateIntent(intent.intentId, {
        responses: [...(intent.responses ?? []), response],
      });
      setNewResponse((p) => ({ ...p, [intent.intentId]: '' }));
    } catch {}
  };

  const removeResponse = async (intent: Intent, responseId: string) => {
    try {
      await updateIntent(intent.intentId, {
        responses: (intent.responses ?? []).filter((r) => r.responseId !== responseId),
      });
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

      <div className="flex items-center gap-3 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search intents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder-slate-400"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setCategoryFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !categoryFilter
                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-300'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                categoryFilter === cat
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading && intents.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" message="Loading intents..." />
        </div>
      ) : filteredIntents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
          <BrainCircuit className="w-12 h-12 opacity-40" />
          <p className="text-lg font-medium">
            {search || categoryFilter ? 'No intents match your filters' : 'No intents yet'}
          </p>
          {!search && !categoryFilter && (
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
                    {intent.webhookEnabled && (
                      <span title="Webhook enabled">
                        <Globe className="w-3.5 h-3.5 text-amber-500" />
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">{intent.displayName}</p>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{intent.description}</p>
                </div>
                <div className="flex items-center gap-1 ml-3 shrink-0">
                  <button
                    onClick={() => handleEdit(intent)}
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

              <div className="grid grid-cols-2 gap-y-2 gap-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <BrainCircuit className="w-4 h-4 shrink-0" />
                  <span className="font-bold">{intent.trainingPhrases?.length ?? 0}</span>
                  <span className="hidden sm:inline">phrases</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 justify-self-end">
                  <span className="font-bold">{intent.usageCount ?? 0}</span>
                  <span className="hidden sm:inline">used</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-bold">
                    {Math.round((intent.averageConfidence ?? 0) * 100)}%
                  </span>
                  <span className="hidden sm:inline">accuracy</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 justify-self-end">
                  <span className="font-bold">{intent.confidenceThreshold}</span>
                  <span className="hidden sm:inline">threshold</span>
                </div>
              </div>

              <div className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  onClick={() =>
                    setExpandedCard(expandedCard === intent.intentId ? null : intent.intentId)
                  }
                  className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {expandedCard === intent.intentId ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                  {expandedCard === intent.intentId ? 'Hide' : 'Show'} Training Phrases & Responses
                </button>

                {expandedCard === intent.intentId && (
                  <div className="mt-3 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Training Phrases
                        </label>
                      </div>
                      <div className="space-y-1 mb-2">
                        {(intent.trainingPhrases ?? []).length === 0 && (
                          <p className="text-xs text-slate-400 italic">No phrases yet.</p>
                        )}
                        {(intent.trainingPhrases ?? []).map((p) => (
                          <div
                            key={p.phraseId}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg"
                          >
                            <MessageSquare className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="text-sm flex-1">{p.text}</span>
                            <span className="text-[10px] text-slate-400 uppercase">
                              {p.language}
                            </span>
                            <button
                              onClick={() => removePhrase(intent, p.phraseId)}
                              className="p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={newPhrase[intent.intentId] ?? ''}
                          onChange={(e) =>
                            setNewPhrase((p) => ({ ...p, [intent.intentId]: e.target.value }))
                          }
                          placeholder="Add a training phrase..."
                          className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                          onKeyDown={(e) => e.key === 'Enter' && addPhrase(intent)}
                        />
                        <button
                          onClick={() => addPhrase(intent)}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Bot Responses
                        </label>
                      </div>
                      <div className="space-y-1 mb-2">
                        {(intent.responses ?? []).length === 0 && (
                          <p className="text-xs text-slate-400 italic">No responses configured.</p>
                        )}
                        {(intent.responses ?? []).map((r) => (
                          <div
                            key={r.responseId}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="text-sm flex-1">
                              {r.content?.text ?? JSON.stringify(r.content)}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase">
                              {r.language}
                            </span>
                            <button
                              onClick={() => removeResponse(intent, r.responseId)}
                              className="p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={newResponse[intent.intentId] ?? ''}
                          onChange={(e) =>
                            setNewResponse((p) => ({ ...p, [intent.intentId]: e.target.value }))
                          }
                          placeholder="Add a bot response..."
                          className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                          onKeyDown={(e) => e.key === 'Enter' && addResponse(intent)}
                        />
                        <button
                          onClick={() => addResponse(intent)}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => toggleActive(intent)}
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
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
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder-slate-400 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.priority}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, priority: parseInt(e.target.value) || 0 }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confidence Threshold:{' '}
                  <span className="font-bold text-indigo-600">{form.confidenceThreshold}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={form.confidenceThreshold}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      confidenceThreshold: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 (match anything)</span>
                  <span>1 (exact match)</span>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="webhookEnabled"
                  checked={form.webhookEnabled}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, webhookEnabled: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="webhookEnabled"
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  <Globe className="w-4 h-4 text-amber-500" /> Enable Webhook
                </label>
              </div>
              {form.webhookEnabled && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={form.webhookUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, webhookUrl: e.target.value }))}
                    placeholder="https://api.example.com/webhook/intent"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                  />
                </div>
              )}
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
