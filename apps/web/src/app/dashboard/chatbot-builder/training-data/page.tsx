'use client';

import React, { useState, useCallback } from 'react';
import {
  DatabaseZap,
  UploadCloud,
  DownloadCloud,
  Filter,
  Check,
  X,
  RotateCw,
  Plus,
  Search,
  Layers,
  Trash2,
} from 'lucide-react';
import { useChatbot } from '../hooks/useChatbot';
import { TrainingExampleService, ModelTrainingService } from '../services';

export default function TrainingDataPage() {
  const {
    trainingDatasets,
    trainingExamples,
    loading,
    loadTrainingExamples,
    deleteTrainingExample,
    createTrainingDataset,
    deleteTrainingDataset,
    addToast,
  } = useChatbot();

  const [view, setView] = useState<'datasets' | 'examples'>('examples');
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showNewDatasetModal, setShowNewDatasetModal] = useState(false);
  const [importForm, setImportForm] = useState({ text: '', intent: '', language: 'en' });
  const [newForm, setNewForm] = useState({ text: '', intent: '', language: 'en' });
  const [datasetForm, setDatasetForm] = useState({
    datasetName: '',
    description: '',
    language: 'en',
  });

  const filteredExamples = trainingExamples.filter((e) =>
    e.intent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleValidate = useCallback(
    async (exampleId: string) => {
      try {
        await TrainingExampleService.updateExample(exampleId, { isValidated: true });
        await loadTrainingExamples();
        addToast({ type: 'success', message: 'Example validated' });
      } catch {
        addToast({ type: 'error', message: 'Failed to validate example' });
      }
    },
    [loadTrainingExamples, addToast]
  );

  const handleDelete = useCallback(
    async (exampleId: string) => {
      try {
        await deleteTrainingExample(exampleId);
      } catch {
        addToast({ type: 'error', message: 'Failed to delete example' });
      }
    },
    [deleteTrainingExample, addToast]
  );

  const handleRetrain = useCallback(async () => {
    try {
      await ModelTrainingService.startTraining({ status: 'queued' });
      addToast({ type: 'success', message: 'Model retraining initiated' });
    } catch {
      addToast({ type: 'error', message: 'Failed to initiate model retraining' });
    }
  }, [addToast]);

  const handleDeleteDataset = useCallback(
    async (datasetId: string) => {
      if (
        !window.confirm(
          'Are you sure you want to delete this dataset? This action cannot be undone.'
        )
      )
        return;
      try {
        await deleteTrainingDataset(datasetId);
      } catch {
        addToast({ type: 'error', message: 'Failed to delete dataset' });
      }
    },
    [deleteTrainingDataset, addToast]
  );

  const handleCreateDataset = useCallback(async () => {
    try {
      await createTrainingDataset({
        datasetName: datasetForm.datasetName,
        description: datasetForm.description,
        language: datasetForm.language,
      });
      setShowNewDatasetModal(false);
      setDatasetForm({ datasetName: '', description: '', language: 'en' });
      addToast({ type: 'success', message: 'Dataset created' });
    } catch {
      addToast({ type: 'error', message: 'Failed to create dataset' });
    }
  }, [createTrainingDataset, datasetForm, addToast]);

  const handleImportSubmit = useCallback(async () => {
    try {
      await TrainingExampleService.createExample(importForm);
      await loadTrainingExamples();
      setShowImportModal(false);
      setImportForm({ text: '', intent: '', language: 'en' });
      addToast({ type: 'success', message: 'Example imported' });
    } catch {
      addToast({ type: 'error', message: 'Failed to import example' });
    }
  }, [importForm, loadTrainingExamples, addToast]);

  const handleNewSubmit = useCallback(async () => {
    try {
      await TrainingExampleService.createExample(newForm);
      await loadTrainingExamples();
      setShowNewModal(false);
      setNewForm({ text: '', intent: '', language: 'en' });
      addToast({ type: 'success', message: 'Example created' });
    } catch {
      addToast({ type: 'error', message: 'Failed to create example' });
    }
  }, [newForm, loadTrainingExamples, addToast]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'published':
        return 'bg-emerald-100 text-emerald-700';
      case 'draft':
        return 'bg-amber-100 text-amber-700';
      case 'archived':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  if (loading && trainingDatasets.length === 0 && trainingExamples.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DatabaseZap className="w-6 h-6 text-indigo-500" />
            Training Data
          </h1>
          <p className="text-slate-500 text-sm">Review utterances and improve bot accuracy.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <UploadCloud className="w-4 h-4" /> Import
          </button>
          <button
            onClick={handleRetrain}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
          >
            <RotateCw className="w-4 h-4" /> Retrain Model
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit shrink-0">
        <button
          onClick={() => setView('datasets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'datasets' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Layers className="w-4 h-4" /> Datasets
        </button>
        <button
          onClick={() => setView('examples')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'examples' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <DatabaseZap className="w-4 h-4" /> Examples
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full min-h-0">
        {view === 'datasets' ? (
          <div className="flex flex-col h-full min-h-0">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold">Datasets</h2>
              <button
                onClick={() => setShowNewDatasetModal(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" /> New Dataset
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {trainingDatasets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <DatabaseZap className="w-12 h-12 mb-3" />
                  <p className="font-medium">No datasets yet</p>
                  <p className="text-sm">Create a dataset to start organizing training data.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {trainingDatasets.map((ds) => (
                    <div
                      key={ds.datasetId}
                      className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">
                          {ds.datasetName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded ${statusColor(ds.status)}`}
                          >
                            {ds.status}
                          </span>
                          <button
                            onClick={() => handleDeleteDataset(ds.datasetId)}
                            className="p-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                            title="Delete Dataset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mb-3 line-clamp-2">{ds.description}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {ds.language}
                        </span>
                        <span>{ds.intents.length} intents</span>
                        <span>{ds.totalExamples} examples</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by intent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              <button
                onClick={() => setShowNewModal(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" /> New Example
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-0">
              {filteredExamples.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <DatabaseZap className="w-12 h-12 mb-3" />
                  <p className="font-medium">
                    {searchQuery ? 'No matching examples' : 'No examples yet'}
                  </p>
                  <p className="text-sm">
                    {searchQuery
                      ? 'Try a different filter.'
                      : 'Add training examples to improve your bot.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredExamples.map((ex) => (
                    <div
                      key={ex.exampleId}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          "{ex.text}"
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                            {ex.intent}
                          </span>
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                            {ex.language}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded ${ex.isValidated ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                          >
                            {ex.isValidated ? 'Validated' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!ex.isValidated && (
                          <button
                            onClick={() => handleValidate(ex.exampleId)}
                            className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                            title="Confirm Intent"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(ex.exampleId)}
                          className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Import Training Example</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Text
                </label>
                <textarea
                  value={importForm.text}
                  onChange={(e) => setImportForm({ ...importForm, text: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3}
                  placeholder="Enter the training phrase..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Intent
                </label>
                <input
                  type="text"
                  value={importForm.intent}
                  onChange={(e) => setImportForm({ ...importForm, intent: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="#IntentName"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Language
                </label>
                <select
                  value={importForm.language}
                  onChange={(e) => setImportForm({ ...importForm, language: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                disabled={!importForm.text || !importForm.intent}
                className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewDatasetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">New Dataset</h2>
              <button
                onClick={() => setShowNewDatasetModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Dataset Name
                </label>
                <input
                  type="text"
                  value={datasetForm.datasetName}
                  onChange={(e) => setDatasetForm({ ...datasetForm, datasetName: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Customer Support"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={datasetForm.description}
                  onChange={(e) => setDatasetForm({ ...datasetForm, description: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3}
                  placeholder="Describe the purpose of this dataset..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Language
                </label>
                <select
                  value={datasetForm.language}
                  onChange={(e) => setDatasetForm({ ...datasetForm, language: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowNewDatasetModal(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDataset}
                disabled={!datasetForm.datasetName || !datasetForm.description}
                className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Dataset
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">New Training Example</h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Text
                </label>
                <textarea
                  value={newForm.text}
                  onChange={(e) => setNewForm({ ...newForm, text: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3}
                  placeholder="Enter the training phrase..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Intent
                </label>
                <input
                  type="text"
                  value={newForm.intent}
                  onChange={(e) => setNewForm({ ...newForm, intent: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="#IntentName"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Language
                </label>
                <select
                  value={newForm.language}
                  onChange={(e) => setNewForm({ ...newForm, language: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNewSubmit}
                disabled={!newForm.text || !newForm.intent}
                className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
