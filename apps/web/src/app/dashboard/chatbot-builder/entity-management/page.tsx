'use client';

import React, { useState } from 'react';
import { Database, Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { useChatbot } from '../hooks/useChatbot';

export default function EntityManagementPage() {
  const { entities, loading, createEntity, updateEntity, deleteEntity, addToast } = useChatbot();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<any>(null);

  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('list');
  const [formDescription, setFormDescription] = useState('');
  const [formValues, setFormValues] = useState('[]');
  const [formFuzzy, setFormFuzzy] = useState(false);

  const resetForm = () => {
    setFormName('');
    setFormType('list');
    setFormDescription('');
    setFormValues('[]');
    setFormFuzzy(false);
    setEditingEntity(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (entity: any) => {
    setEditingEntity(entity);
    setFormName(entity.entityName);
    setFormType(entity.entityType);
    setFormDescription(entity.description || '');
    setFormValues(JSON.stringify(entity.values, null, 2));
    setFormFuzzy(entity.fuzzyMatching);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let parsedValues: any[];
    try {
      parsedValues = JSON.parse(formValues);
      if (!Array.isArray(parsedValues)) throw new Error();
    } catch {
      addToast({ type: 'error', message: 'Values must be a valid JSON array' });
      return;
    }
    const payload = {
      entityName: formName,
      entityType: formType,
      description: formDescription,
      values: parsedValues,
      fuzzyMatching: formFuzzy,
    };
    try {
      if (editingEntity) {
        await updateEntity(editingEntity.entityId, payload as any);
      } else {
        await createEntity(payload as any);
      }
      closeModal();
    } catch {
      // toast already added by hook
    }
  };

  const handleDelete = async (entity: any) => {
    if (window.confirm(`Delete entity "${entity.entityName}"? This cannot be undone.`)) {
      await deleteEntity(entity.entityId);
    }
  };

  const filtered = entities.filter((e: any) =>
    e.entityName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColor: Record<string, string> = {
    active: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    draft: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    published: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
    archived: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
  };

  const typeColor: Record<string, string> = {
    list: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    regex: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    system: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    custom: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-500" />
            Entity Management
          </h1>
          <p className="text-slate-500 text-sm">
            Define business objects for the bot to recognize.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" /> New Entity
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              Loading entities...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              {searchQuery ? 'No entities match your search.' : 'No entities defined yet.'}
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Entity Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Values</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((entity: any) => (
                  <tr
                    key={entity.entityId}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                      {entity.entityName}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${typeColor[entity.entityType] || typeColor.custom}`}
                      >
                        {entity.entityType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500">
                        {Array.isArray(entity.values) ? entity.values.length : 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${statusColor[entity.status] || statusColor.draft}`}
                      >
                        {entity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(entity)}
                          className="p-2 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg text-indigo-500"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entity)}
                          className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold">{editingEntity ? 'Edit Entity' : 'New Entity'}</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Entity Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="@EntityName"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Entity Type
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="list">List</option>
                  <option value="regex">Regex</option>
                  <option value="system">System</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Values <span className="text-slate-400 font-normal">(JSON array)</span>
                </label>
                <textarea
                  value={formValues}
                  onChange={(e) => setFormValues(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="fuzzyMatching"
                  checked={formFuzzy}
                  onChange={(e) => setFormFuzzy(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="fuzzyMatching"
                  className="text-sm font-bold text-slate-700 dark:text-slate-300"
                >
                  Enable Fuzzy Matching
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
                >
                  {editingEntity ? 'Update Entity' : 'Create Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
