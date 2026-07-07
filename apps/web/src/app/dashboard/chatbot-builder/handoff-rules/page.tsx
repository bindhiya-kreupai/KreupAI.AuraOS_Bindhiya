'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowRightLeft,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  Clock,
  ThumbsDown,
  Search,
  Filter,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useChatbot } from '../hooks/useChatbot';
import { ToastContainer } from '../components/Toast';
import type { HandoffRule } from '../types';

const triggerIconMap: Record<string, React.ElementType> = {
  sentiment: ThumbsDown,
  user_request: UserPlus,
  timeout: Clock,
};

const triggerLabelMap: Record<string, string> = {
  sentiment: 'Sentiment',
  user_request: 'User Request',
  timeout: 'Timeout',
  intent: 'Intent Match',
  keyword: 'Keyword',
  failed_attempts: 'Failed Attempts',
};

const triggerColors: Record<string, string> = {
  sentiment: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  user_request: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  timeout: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  intent: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  keyword: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  failed_attempts: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

const allTriggerTypes = Object.keys(triggerLabelMap);

export default function HandoffRulesPage() {
  const {
    handoffRules,
    loading,
    loadHandoffRules,
    createHandoffRule,
    updateHandoffRule,
    deleteHandoffRule,
    toasts,
    addToast,
    removeToast,
  } = useChatbot();

  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<HandoffRule | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [triggerFilter, setTriggerFilter] = useState('all');

  const [ruleName, setRuleName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [triggersJson, setTriggersJson] = useState('[]');
  const [conditionsJson, setConditionsJson] = useState('[]');
  const [actionJson, setActionJson] = useState('{}');

  const openAddModal = () => {
    setEditingRule(null);
    setRuleName('');
    setDescription('');
    setPriority(1);
    setIsActive(true);
    setTriggersJson('[]');
    setConditionsJson('[]');
    setActionJson('{}');
    setShowModal(true);
  };

  const openEditModal = (rule: HandoffRule) => {
    setEditingRule(rule);
    setRuleName(rule.ruleName);
    setDescription(rule.description);
    setPriority(rule.priority);
    setIsActive(rule.isActive);
    setTriggersJson(JSON.stringify(rule.triggers, null, 2));
    setConditionsJson(JSON.stringify(rule.conditions, null, 2));
    setActionJson(JSON.stringify(rule.action, null, 2));
    setShowModal(true);
  };

  const handleSave = async () => {
    let parsedTriggers: any[];
    let parsedConditions: any[];
    let parsedAction: any;
    try {
      parsedTriggers = JSON.parse(triggersJson);
      parsedConditions = JSON.parse(conditionsJson);
      parsedAction = JSON.parse(actionJson);
    } catch {
      addToast({ type: 'error', message: 'Invalid JSON in triggers, conditions, or action' });
      return;
    }

    try {
      if (editingRule) {
        await updateHandoffRule(editingRule.ruleId, {
          ruleName,
          description,
          priority,
          isActive,
          triggers: parsedTriggers,
          conditions: parsedConditions,
          action: parsedAction,
        });
      } else {
        await createHandoffRule({
          ruleName,
          description,
          priority,
          isActive,
          triggers: parsedTriggers,
          conditions: parsedConditions,
          action: parsedAction,
        });
      }

      setShowModal(false);
      setEditingRule(null);
    } catch {
      // toast already added by hook
    }
  };

  const handleToggle = async (rule: HandoffRule) => {
    try {
      await updateHandoffRule(rule.ruleId, { isActive: !rule.isActive });
    } catch {
      // toast already added by hook
    }
  };

  const handleDelete = async (ruleId: string) => {
    try {
      await deleteHandoffRule(ruleId);
      setDeleteConfirmId(null);
    } catch {
      // toast already added by hook
    }
  };

  const filtered = useMemo(() => {
    let result = handoffRules;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.ruleName.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q)
      );
    }

    if (statusFilter === 'active') result = result.filter((r) => r.isActive);
    else if (statusFilter === 'inactive') result = result.filter((r) => !r.isActive);

    if (triggerFilter !== 'all') {
      result = result.filter((r) => r.triggers?.some((t) => t.triggerType === triggerFilter));
    }

    return result;
  }, [handoffRules, searchQuery, statusFilter, triggerFilter]);

  const getTriggerIcon = (triggers: any[]) => {
    if (!triggers || triggers.length === 0) return ArrowRightLeft;
    const t = triggers[0];
    if (t && t.triggerType && triggerIconMap[t.triggerType]) {
      return triggerIconMap[t.triggerType];
    }
    return ArrowRightLeft;
  };

  const getTriggersSummary = (triggers: any[]): string => {
    if (!triggers || triggers.length === 0) return 'No triggers';
    return triggers
      .map((t) => {
        if (t.triggerType === 'sentiment') return `Sentiment < ${t.triggerValue ?? 0.3}`;
        if (t.triggerType === 'failed_attempts') return `Failed > ${t.triggerValue ?? 2}`;
        if (t.triggerType === 'user_request') return 'User requests agent';
        if (t.triggerType === 'timeout') return 'Timeout reached';
        if (t.triggerType === 'intent') return `Intent: ${t.triggerValue ?? 'unknown'}`;
        if (t.triggerType === 'keyword') return `Keyword: ${t.triggerValue ?? 'unknown'}`;
        return JSON.stringify(t.triggerValue ?? '');
      })
      .join(', ');
  };

  const getActionSummary = (action: any): string => {
    if (!action) return 'No action';
    return action.targetName
      ? `Route to ${action.targetName}`
      : action.targetType
        ? `Route to ${action.targetType}`
        : JSON.stringify(action);
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-indigo-500" />
            Handoff Rules
          </h1>
          <p className="text-slate-500 text-sm">
            Configure when to transfer chats to human agents.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Rule
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search rules by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={triggerFilter}
            onChange={(e) => setTriggerFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm outline-none"
          >
            <option value="all">All Triggers</option>
            {allTriggerTypes.map((t) => (
              <option key={t} value={t}>
                {triggerLabelMap[t]}
              </option>
            ))}
          </select>
          {(searchQuery || statusFilter !== 'all' || triggerFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setTriggerFilter('all');
              }}
              className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 hover:text-rose-600 transition-colors"
              title="Clear all filters"
            >
              <XCircle className="w-3.5 h-3.5" /> Clear
            </button>
          )}
          <button
            onClick={() => loadHandoffRules()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
            title="Refresh rules"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && handoffRules.length === 0 ? (
        <div className="flex items-center justify-center flex-1 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center flex-1 text-slate-400">
          <p>
            {searchQuery || statusFilter !== 'all' || triggerFilter !== 'all'
              ? 'No rules match your filters.'
              : 'No handoff rules configured. Click Add Rule to create one.'}
          </p>
        </div>
      ) : (
        <div className="overflow-y-auto flex-1 space-y-3 pr-1">
          {filtered.map((rule) => {
            const Icon = getTriggerIcon(rule.triggers);
            return (
              <div
                key={rule.ruleId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg">{rule.ruleName}</h3>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          rule.priority >= 8
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : rule.priority >= 5
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}
                      >
                        P{rule.priority}
                      </span>
                      {rule.triggers?.map((t, i) => (
                        <span
                          key={i}
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${triggerColors[t.triggerType] || 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}
                        >
                          {triggerLabelMap[t.triggerType] || t.triggerType}
                        </span>
                      ))}
                    </div>
                    {rule.description && (
                      <p className="text-sm text-slate-500 mt-0.5 truncate">{rule.description}</p>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-2 text-sm">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono text-slate-600 dark:text-slate-400 truncate max-w-xs">
                        If {getTriggersSummary(rule.triggers)}
                      </span>
                      <ArrowRightLeft className="w-4 h-4 text-slate-400 hidden sm:block shrink-0" />
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate">
                        {getActionSummary(rule.action)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      {rule.conditions?.length > 0 && (
                        <span>
                          {rule.conditions.length} condition{rule.conditions.length > 1 ? 's' : ''}
                        </span>
                      )}
                      {rule.lastModifiedDate && (
                        <span>Updated {new Date(rule.lastModifiedDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => openEditModal(rule)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    title="Edit rule"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {deleteConfirmId === rule.ruleId ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(rule.ruleId)}
                        className="px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(rule.ruleId)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div
                    onClick={() => handleToggle(rule)}
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${rule.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${rule.isActive ? 'translate-x-6' : 'translate-x-0'}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingRule ? 'Edit Handoff Rule' : 'Add Handoff Rule'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Rule Name</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Negative Sentiment"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  placeholder="Optional description"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1">Priority</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm font-semibold">Active</span>
                    <div
                      onClick={() => setIsActive(!isActive)}
                      className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Triggers{' '}
                  <span className="font-normal text-slate-400">
                    (JSON array {`[{ "triggerType": "sentiment", "triggerValue": 0.3 }]`})
                  </span>
                </label>
                <textarea
                  value={triggersJson}
                  onChange={(e) => setTriggersJson(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder='[{ "triggerType": "sentiment", "triggerValue": 0.3 }]'
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Conditions{' '}
                  <span className="font-normal text-slate-400">
                    (JSON array{' '}
                    {`[{ "conditionType": "queue_capacity", "operator": ">", "value": 5 }]`})
                  </span>
                </label>
                <textarea
                  value={conditionsJson}
                  onChange={(e) => setConditionsJson(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder='[{ "conditionType": "queue_capacity", "operator": ">", "value": 5 }]'
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Action{' '}
                  <span className="font-normal text-slate-400">
                    (JSON object {`{ "targetType": "queue", "targetName": "support" }`})
                  </span>
                </label>
                <textarea
                  value={actionJson}
                  onChange={(e) => setActionJson(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder='{ "targetType": "queue", "targetName": "support" }'
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingRule(null);
                }}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
