'use client';

import React, { useState } from 'react';
import { Languages, Plus, Edit2, Trash2, CheckCircle2, Download, X } from 'lucide-react';
import { useChatbot } from '../hooks/useChatbot';

export default function MultiLingualPage() {
  const {
    languages,
    loading,
    createLanguage,
    updateLanguage,
    deleteLanguage,
    enableLanguage,
    addToast,
  } = useChatbot();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLang, setEditingLang] = useState<(typeof languages)[number] | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState({
    languageCode: '',
    languageName: '',
    isEnabled: true,
    isDefault: false,
    confidenceThreshold: 80,
  });

  const resetForm = () => {
    setForm({
      languageCode: '',
      languageName: '',
      isEnabled: true,
      isDefault: false,
      confidenceThreshold: 80,
    });
  };

  const handleAdd = async () => {
    if (!form.languageCode || !form.languageName) {
      addToast({ type: 'warning', message: 'Language code and name are required' });
      return;
    }
    try {
      await createLanguage(form);
      setShowAddModal(false);
      resetForm();
    } catch {
      // handled by hook
    }
  };

  const handleEdit = async () => {
    if (!editingLang) return;
    try {
      await updateLanguage(editingLang.languageCode, {
        languageName: form.languageName,
        isEnabled: form.isEnabled,
        isDefault: form.isDefault,
        confidenceThreshold: form.confidenceThreshold,
      });
      setEditingLang(null);
      resetForm();
    } catch {
      // handled by hook
    }
  };

  const openEdit = (lang: (typeof languages)[number]) => {
    setEditingLang(lang);
    setForm({
      languageCode: lang.languageCode,
      languageName: lang.languageName,
      isEnabled: lang.isEnabled,
      isDefault: lang.isDefault,
      confidenceThreshold: lang.confidenceThreshold,
    });
  };

  const handleDownload = (lang: (typeof languages)[number]) => {
    const data = JSON.stringify(lang, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lang.languageCode}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (code: string) => {
    try {
      await deleteLanguage(code);
      setConfirmDelete(null);
    } catch {
      // handled by hook
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Languages className="w-6 h-6 text-indigo-500" />
            Multi-lingual Support
          </h1>
          <p className="text-slate-500 text-sm">Manage language packs and translations.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Language
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      )}

      {!loading && languages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Languages className="w-16 h-16 mb-4" />
          <p className="text-lg font-medium">No languages configured</p>
          <p className="text-sm">Click &quot;Add Language&quot; to get started.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {languages.map((lang) => {
          const completeness = Math.min(
            (lang.supportedFeatures?.length || 0) * 10 + (lang.confidenceThreshold / 100) * 50,
            100
          );
          return (
            <div
              key={lang.languageId || lang.languageCode}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{lang.languageName}</h3>
                  <div className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded inline-block mt-1">
                    {lang.languageCode}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {lang.isDefault && (
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Primary
                    </span>
                  )}
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      lang.isEnabled
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {lang.isEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Confidence Threshold</span>
                  <span className="font-semibold">{lang.confidenceThreshold}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Supported Features</span>
                  <span className="font-semibold">{lang.supportedFeatures?.length || 0}</span>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completeness >= 80
                      ? 'bg-emerald-500'
                      : completeness >= 40
                        ? 'bg-amber-500'
                        : 'bg-red-400'
                  }`}
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 mb-6 flex justify-between">
                <span>Translation Progress</span>
                <span className="font-bold">{Math.round(completeness)}%</span>
              </div>

              <div className="flex gap-2">
                {lang.isEnabled ? (
                  <button
                    onClick={() => enableLanguage(lang.languageCode)}
                    className="flex items-center gap-1.5 flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Enabled
                  </button>
                ) : (
                  <button
                    onClick={() => enableLanguage(lang.languageCode)}
                    className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Enable
                  </button>
                )}
                <button
                  onClick={() => openEdit(lang)}
                  className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:text-indigo-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirmDelete(lang.languageCode)}
                  className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownload(lang)}
                  className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:text-indigo-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {confirmDelete === lang.languageCode && (
                <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4">
                  <p className="text-sm font-semibold text-center">Delete this language?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(lang.languageCode)}
                      className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-4 py-1.5 border border-slate-300 dark:border-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Add Language</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Language Code</label>
                <input
                  type="text"
                  value={form.languageCode}
                  onChange={(e) => setForm({ ...form, languageCode: e.target.value })}
                  placeholder="e.g. fr-FR"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Language Name</label>
                <input
                  type="text"
                  value={form.languageName}
                  onChange={(e) => setForm({ ...form, languageName: e.target.value })}
                  placeholder="e.g. French (France)"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isEnabled}
                    onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium">Enabled</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium">Default</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Confidence Threshold ({form.confidenceThreshold}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.confidenceThreshold}
                  onChange={(e) =>
                    setForm({ ...form, confidenceThreshold: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
              >
                Add Language
              </button>
            </div>
          </div>
        </div>
      )}

      {editingLang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Edit Language</h2>
              <button
                onClick={() => {
                  setEditingLang(null);
                  resetForm();
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Language Code</label>
                <input
                  type="text"
                  value={form.languageCode}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm opacity-60 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Language Name</label>
                <input
                  type="text"
                  value={form.languageName}
                  onChange={(e) => setForm({ ...form, languageName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isEnabled}
                    onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium">Enabled</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium">Default</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Confidence Threshold ({form.confidenceThreshold}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.confidenceThreshold}
                  onChange={(e) =>
                    setForm({ ...form, confidenceThreshold: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingLang(null);
                  resetForm();
                }}
                className="flex-1 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
