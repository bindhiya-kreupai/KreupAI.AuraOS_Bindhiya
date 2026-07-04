'use client';

import React, { useState, useCallback } from 'react';
import {
  MessageSquare,
  GitBranch,
  Play,
  Plus,
  Settings,
  Save,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  X,
} from 'lucide-react';
import { useChatbot } from '../hooks/useChatbot';
import type { DialogueFlow, DialogueNode, NodeType, Status } from '../types';

export default function DialogueDesignerPage() {
  const {
    dialogueFlows,
    loading,
    createDialogueFlow,
    updateDialogueFlow,
    publishDialogueFlow,
    deleteDialogueFlow,
    addToast,
  } = useChatbot();

  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('General');

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTags, setSettingsTags] = useState('');
  const [settingsVersion, setSettingsVersion] = useState('');
  const [settingsIsActive, setSettingsIsActive] = useState(false);

  const [showTestModal, setShowTestModal] = useState(false);

  const selectedFlow = dialogueFlows.find((f) => f.flowId === selectedFlowId) ?? null;

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormCategory('General');
  };

  const handleCreate = async () => {
    if (!formName.trim()) return;
    try {
      const flow = await createDialogueFlow({
        flowName: formName.trim(),
        description: formDescription.trim(),
        category: formCategory,
        status: 'draft',
        isActive: false,
        version: '1.0.0',
        nodes: [],
        connections: [],
        variables: [],
        triggerIntents: [],
        tags: [],
      });
      if (flow) setSelectedFlowId(flow.flowId);
      setShowCreateModal(false);
      resetForm();
    } catch {
      /* handled by hook */
    }
  };

  const handleEdit = async () => {
    if (!selectedFlowId || !formName.trim()) return;
    try {
      await updateDialogueFlow(selectedFlowId, {
        flowName: formName.trim(),
        description: formDescription.trim(),
        category: formCategory,
      });
      setShowEditModal(false);
    } catch {
      /* handled by hook */
    }
  };

  const handleDelete = async (flowId: string) => {
    try {
      await deleteDialogueFlow(flowId);
      if (selectedFlowId === flowId) setSelectedFlowId(null);
      setShowDeleteConfirm(null);
    } catch {
      /* handled by hook */
    }
  };

  const handlePublish = async (flowId: string) => {
    try {
      await publishDialogueFlow(flowId);
    } catch {
      /* handled by hook */
    }
  };

  const addNode = async (nodeType: NodeType) => {
    if (!selectedFlow) return;
    const newNode: DialogueNode = {
      nodeId: `node-${Date.now()}`,
      nodeType,
      nodeName: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
      position: { x: 0, y: 0 },
      configuration: {} as any,
      nextNodes: [],
    };
    try {
      await updateDialogueFlow(selectedFlow.flowId, {
        nodes: [...selectedFlow.nodes, newNode],
      });
      addToast({ type: 'success', message: `${nodeType} node added` });
    } catch {
      /* handled by hook */
    }
  };

  const openSettings = (flow: DialogueFlow) => {
    setSettingsTags((flow.tags ?? []).join(', '));
    setSettingsVersion(flow.version);
    setSettingsIsActive(flow.isActive);
    setShowSettingsModal(true);
  };

  const handleSettingsSave = async () => {
    if (!selectedFlow) return;
    try {
      await updateDialogueFlow(selectedFlow.flowId, {
        tags: settingsTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        version: settingsVersion,
        isActive: settingsIsActive,
      });
      setShowSettingsModal(false);
    } catch {
      /* handled by hook */
    }
  };

  const openEdit = (flow: DialogueFlow) => {
    setFormName(flow.flowName);
    setFormDescription(flow.description ?? '');
    setFormCategory(flow.category);
    setShowEditModal(true);
  };

  const statusBadge = (status: Status) => {
    const colors: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
      published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
      active: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      inactive: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
      archived: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status] ?? colors.draft}`}
      >
        {status}
      </span>
    );
  };

  const categoryBadge = (cat: string) => (
    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
      {cat}
    </span>
  );

  const renderModal = (
    visible: boolean,
    title: string,
    confirmLabel: string,
    onConfirm: () => void,
    onCancel: () => void
  ) => {
    if (!visible) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold mb-4">{title}</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Flow Name
              </label>
              <input
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Onboarding Flow"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                rows={3}
                placeholder="Describe what this flow does..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
              >
                <option>General</option>
                <option>Onboarding</option>
                <option>Support</option>
                <option>HR</option>
                <option>Payroll</option>
                <option>Benefits</option>
                <option>IT</option>
                <option>Sales</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCanvas = () => {
    if (!selectedFlow) {
      return (
        <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
          <div className="text-center">
            <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">Select a flow to view its structure</p>
          </div>
        </div>
      );
    }

    const { nodes, connections, tags, triggerIntents } = selectedFlow;
    const totalNodes = nodes.length;
    const messageNodes = nodes.filter((n) => n.nodeType === 'message').length;
    const conditionNodes = nodes.filter((n) => n.nodeType === 'condition').length;
    const actionNodes = nodes.filter(
      (n) => n.nodeType === 'action' || n.nodeType === 'api_call'
    ).length;
    const endNodes = nodes.filter((n) => n.nodeType === 'end').length;
    const questionNodes = nodes.filter((n) => n.nodeType === 'question').length;
    const handoffNodes = nodes.filter((n) => n.nodeType === 'handoff').length;

    return (
      <div className="h-full overflow-auto p-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {totalNodes}
            </div>
            <div className="text-xs text-slate-500 mt-1">Total Nodes</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {messageNodes + questionNodes}
            </div>
            <div className="text-xs text-slate-500 mt-1">Messages</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {conditionNodes}
            </div>
            <div className="text-xs text-slate-500 mt-1">Conditions</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {connections.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">Connections</div>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="text-sm font-semibold mb-3 text-slate-500 uppercase tracking-wider">
            Node Composition
          </h3>
          <div className="space-y-2">
            {messageNodes > 0 && (
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-indigo-500 shrink-0" />
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${(messageNodes / totalNodes) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{messageNodes}</span>
              </div>
            )}
            {conditionNodes > 0 && (
              <div className="flex items-center gap-3">
                <GitBranch className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(conditionNodes / totalNodes) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{conditionNodes}</span>
              </div>
            )}
            {actionNodes > 0 && (
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(actionNodes / totalNodes) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{actionNodes}</span>
              </div>
            )}
            {questionNodes > 0 && (
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-sky-500 shrink-0" />
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${(questionNodes / totalNodes) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{questionNodes}</span>
              </div>
            )}
            {handoffNodes > 0 && (
              <div className="flex items-center gap-3">
                <GitBranch className="w-4 h-4 text-rose-500 shrink-0" />
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${(handoffNodes / totalNodes) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{handoffNodes}</span>
              </div>
            )}
            {endNodes > 0 && (
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-slate-500 shrink-0" />
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-500 rounded-full"
                    style={{ width: `${(endNodes / totalNodes) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{endNodes}</span>
              </div>
            )}
            {totalNodes === 0 && (
              <p className="text-sm text-slate-400 italic">
                No nodes yet — start building your flow!
              </p>
            )}
          </div>
        </div>

        {triggerIntents.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold mb-2 text-slate-500 uppercase tracking-wider">
              Trigger Intents
            </h3>
            <div className="flex flex-wrap gap-2">
              {triggerIntents.map((intent) => (
                <span
                  key={intent}
                  className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                >
                  {intent}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-indigo-500" />
            Dialogue Designer
          </h1>
          <p className="text-slate-500 text-sm">Design conversation flows visually.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Flow
          </button>
          {selectedFlow && (
            <>
              <button
                onClick={() => openEdit(selectedFlow)}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                <Save className="w-4 h-4" /> Save Flow
              </button>
              <button
                onClick={() => setShowTestModal(true)}
                className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all"
              >
                <Play className="w-4 h-4" /> Test Bot
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="w-80 shrink-0 overflow-y-auto space-y-2 pr-1">
          {loading && dialogueFlows.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">Loading flows...</div>
          )}
          {!loading && dialogueFlows.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              No flows yet. Click &quot;Create Flow&quot; to get started.
            </div>
          )}
          {dialogueFlows.map((flow) => (
            <div
              key={flow.flowId}
              onClick={() => setSelectedFlowId(flow.flowId)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedFlowId === flow.flowId
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate">{flow.flowName}</h3>
                    {flow.isActive && (
                      <span
                        className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"
                        title="Active"
                      />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">{flow.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {categoryBadge(flow.category)}
                    {statusBadge(flow.status)}
                    <span className="text-[10px] text-slate-400 font-mono">v{flow.version}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {new Date(flow.lastModifiedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(flow);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(flow.flowId);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePublish(flow.flowId);
                    }}
                    className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                    title="Publish"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="absolute left-4 top-4 bottom-4 w-12 bg-white dark:bg-slate-800 shadow-lg rounded-xl flex flex-col items-center py-4 gap-3 z-10 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => addNode('message')}
              disabled={!selectedFlow}
              className="p-2 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg text-indigo-600 dark:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Add Message"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button
              onClick={() => addNode('condition')}
              disabled={!selectedFlow}
              className="p-2 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg text-indigo-600 dark:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Add Condition"
            >
              <GitBranch className="w-5 h-5" />
            </button>
            <button
              onClick={() => selectedFlow && openSettings(selectedFlow)}
              disabled={!selectedFlow}
              className="p-2 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg text-indigo-600 dark:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute inset-0 ml-20 p-2 overflow-auto">{renderCanvas()}</div>

          <div
            className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
        </div>
      </div>

      {renderModal(showCreateModal, 'Create Flow', 'Create', handleCreate, () => {
        setShowCreateModal(false);
        resetForm();
      })}
      {renderModal(showEditModal, 'Edit Flow', 'Save', handleEdit, () => {
        setShowEditModal(false);
        resetForm();
      })}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold mb-2">Delete Flow</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete this flow? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 text-sm font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && selectedFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Flow Settings</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700"
                  placeholder="e.g. onboarding, welcome"
                  value={settingsTags}
                  onChange={(e) => setSettingsTags(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Version
                </label>
                <input
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700"
                  value={settingsVersion}
                  onChange={(e) => setSettingsVersion(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="settingsActive"
                  checked={settingsIsActive}
                  onChange={(e) => setSettingsIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="settingsActive"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  Active
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSettingsSave}
                className="px-4 py-2 text-sm font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showTestModal && selectedFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Test Bot — {selectedFlow.flowName}</h2>
              <button
                onClick={() => setShowTestModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>
                This flow has <strong>{selectedFlow.nodes.length}</strong> nodes and{' '}
                <strong>{selectedFlow.connections.length}</strong> connections.
              </p>
              {selectedFlow.triggerIntents.length > 0 && (
                <p>
                  Triggered by intents: <strong>{selectedFlow.triggerIntents.join(', ')}</strong>
                </p>
              )}
              <p>
                Status: <span className="font-semibold">{selectedFlow.status}</span>
              </p>
              <p>
                Version: <span className="font-semibold">{selectedFlow.version}</span>
              </p>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                <p className="text-xs text-slate-400">
                  To run a full test, publish the flow and trigger it via a connected channel.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  handlePublish(selectedFlow.flowId);
                  setShowTestModal(false);
                }}
                className="px-4 py-2 text-sm font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Publish &amp; Test
              </button>
              <button
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
