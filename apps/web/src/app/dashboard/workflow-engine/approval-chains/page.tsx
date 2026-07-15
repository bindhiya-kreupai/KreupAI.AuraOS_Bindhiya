'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  GitPullRequest,
  Users,
  Edit,
  Trash2,
  Shield,
  Loader2,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  Save,
  UserPlus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  GripVertical,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  Copy,
} from 'lucide-react';
import { ApprovalChainService, WorkflowService } from '../services';
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

interface ApproverItem {
  id: string;
  type: 'USER' | 'ROLE' | 'MANAGER';
  userId?: string;
  userName?: string;
  roleId?: string;
  roleName?: string;
  isRequired: boolean;
}

interface ConditionItem {
  id: string;
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains';
  value: string;
}

interface ChainLevel {
  id: string;
  levelNumber: number;
  levelName: string;
  approvers: ApproverItem[];
  approvalType: 'ANY' | 'ALL' | 'MAJORITY';
  conditions: ConditionItem[];
  escalationHours: number;
  dueHours: number;
}

interface ApprovalChainData {
  id?: string;
  name: string;
  description: string;
  processType: string;
  isActive: boolean;
  levels: ChainLevel[];
  isSequential: boolean;
  requireAllLevels: boolean;
  nodes?: any[];
  edges?: any[];
  version?: number;
  updatedAt?: string;
  createdBy?: string;
}

// ============================================================================
// Helpers
// ============================================================================

const uid = () => Math.random().toString(36).slice(2, 10);

const OPERATORS = [
  { value: 'eq', label: 'equals' },
  { value: 'neq', label: 'not equals' },
  { value: 'gt', label: 'greater than' },
  { value: 'gte', label: 'greater or equal' },
  { value: 'lt', label: 'less than' },
  { value: 'lte', label: 'less or equal' },
  { value: 'contains', label: 'contains' },
];

const APPROVAL_TYPES = [
  { value: 'ANY', label: 'Any One', desc: 'Any single approver can approve' },
  { value: 'ALL', label: 'All Required', desc: 'Every approver must approve' },
  { value: 'MAJORITY', label: 'Majority', desc: 'More than half must approve' },
];

// ============================================================================
// Main Component
// ============================================================================

export default function ApprovalChainsPage() {
  const [chains, setChains] = useState<ApprovalChainData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingChain, setEditingChain] = useState<ApprovalChainData | null>(null);
  const [saving, setSaving] = useState(false);

  // Builder state
  const [builderForm, setBuilderForm] = useState<ApprovalChainData>({
    name: '',
    description: '',
    processType: 'APPROVAL_CHAIN',
    isActive: false,
    levels: [],
    isSequential: true,
    requireAllLevels: true,
  });

  useEffect(() => {
    fetchChains();
  }, []);

  const fetchChains = async () => {
    try {
      setLoading(true);
      const data = await ApprovalChainService.getChains();
      const mapped = (data || []).map((c: any) => mapChainFromApi(c));
      setChains(mapped);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapChainFromApi = (c: any): ApprovalChainData => {
    const nodes = Array.isArray(c.nodes) ? c.nodes : [];
    const levels: ChainLevel[] = nodes.map((n: any, i: number) => ({
      id: n.id || uid(),
      levelNumber: i + 1,
      levelName: n.name || n.levelName || `Level ${i + 1}`,
      approvers: (n.config?.approvers || []).map((a: any) => ({
        id: uid(),
        type: a.type || 'USER',
        userId: a.userId,
        userName: a.userName || a.userId || 'Unknown',
        roleId: a.roleId,
        roleName: a.roleName || a.roleId || 'Unknown',
        isRequired: a.isRequired ?? true,
      })),
      approvalType: n.config?.approvalType || 'ANY',
      conditions: (n.config?.conditions || []).map((cond: any) => ({
        id: uid(),
        field: cond.field || '',
        operator: cond.operator || 'eq',
        value: String(cond.value ?? ''),
      })),
      escalationHours: n.config?.escalationHours || 48,
      dueHours: n.config?.dueHours || 24,
    }));

    let triggerMeta: any = {};
    try {
      triggerMeta = c.triggerEvent ? JSON.parse(c.triggerEvent) : {};
    } catch {}

    return {
      id: c.id,
      name: c.name || c.chainName || 'Unnamed Chain',
      description: c.description || '',
      processType: c.processType || 'APPROVAL_CHAIN',
      isActive: c.isActive ?? true,
      levels,
      isSequential: triggerMeta.isSequential ?? c.isSequential ?? true,
      requireAllLevels: triggerMeta.requireAllLevels ?? c.requireAllLevels ?? true,
      nodes: c.nodes,
      edges: c.edges,
      version: c.version,
      updatedAt: c.updatedAt,
      createdBy: c.createdBy,
    };
  };

  const mapChainToApi = (form: ApprovalChainData) => {
    const nodes = form.levels.map((level, i) => ({
      id: level.id,
      type: 'approval',
      name: level.levelName,
      config: {
        levelNumber: i + 1,
        approvers: level.approvers.map((a) => ({
          type: a.type,
          userId: a.userId,
          userName: a.userName,
          roleId: a.roleId,
          roleName: a.roleName,
          isRequired: a.isRequired,
        })),
        approvalType: level.approvalType,
        conditions: level.conditions.map((c) => ({
          field: c.field,
          operator: c.operator,
          value: c.value,
        })),
        escalationHours: level.escalationHours,
        dueHours: level.dueHours,
      },
    }));

    const edges = form.levels.slice(0, -1).map((level, i) => ({
      id: `edge-${level.id}-${form.levels[i + 1].id}`,
      source: level.id,
      target: form.levels[i + 1].id,
    }));

    return {
      name: form.name,
      description: form.description,
      processType: form.processType,
      trigger: 'EVENT',
      nodes,
      edges,
      triggerEvent: JSON.stringify({
        isSequential: form.isSequential,
        requireAllLevels: form.requireAllLevels,
      }),
    };
  };

  // ============================================================================
  // Chain Actions
  // ============================================================================

  const handleCreate = () => {
    setEditingChain(null);
    setBuilderForm({
      name: '',
      description: '',
      processType: 'APPROVAL_CHAIN',
      isActive: false,
      levels: [createEmptyLevel(1)],
      isSequential: true,
      requireAllLevels: true,
    });
    setShowBuilder(true);
  };

  const handleEdit = (chain: ApprovalChainData) => {
    setEditingChain(chain);
    setBuilderForm({ ...chain, levels: chain.levels.map((l) => ({ ...l })) });
    setShowBuilder(true);
  };

  const handleDuplicate = async (chain: ApprovalChainData) => {
    try {
      setSaving(true);
      const duplicateData: ApprovalChainData = {
        ...chain,
        id: undefined,
        name: `${chain.name} (Copy)`,
        isActive: false,
        levels: chain.levels.map((l) => ({ ...l, id: uid() })),
      };
      const apiData = mapChainToApi(duplicateData);
      await ApprovalChainService.createChain(apiData as any);
      await fetchChains();
    } catch (error: any) {
      console.error('Error duplicating chain:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (chain: ApprovalChainData) => {
    try {
      const newActive = !chain.isActive;
      await ApprovalChainService.updateChain(chain.id!, { isActive: newActive } as any);
      setChains((prev) => prev.map((c) => (c.id === chain.id ? { ...c, isActive: newActive } : c)));
    } catch (error: any) {
      console.error('Error toggling chain:', error);
    }
  };

  const handleDelete = async (chain: ApprovalChainData) => {
    try {
      await ApprovalChainService.deleteChain(chain.id!);
      await fetchChains();
      if (expandedId === chain.id) setExpandedId(null);
      toast.success(`"${chain.name}" deleted`);
    } catch (error: any) {
      console.error('Error deleting chain:', error);
      toast.error('Failed to delete chain');
    }
  };

  const handleSaveBuilder = async () => {
    if (!builderForm.name.trim()) {
      toast.warning('Chain name is required');
      return;
    }
    if (builderForm.levels.length === 0) {
      toast.warning('Add at least one approval level');
      return;
    }
    for (const level of builderForm.levels) {
      if (!level.levelName.trim()) {
        toast.warning(`Level name is required for level ${level.levelNumber}`);
        return;
      }
      if (level.approvers.length === 0) {
        toast.warning(`At least one approver required for "${level.levelName}"`);
        return;
      }
    }

    try {
      setSaving(true);
      const apiData = mapChainToApi(builderForm);
      if (editingChain?.id) {
        await ApprovalChainService.updateChain(editingChain.id, {
          ...apiData,
          isActive: builderForm.isActive,
        } as any);
      } else {
        await ApprovalChainService.createChain(apiData as any);
      }
      await fetchChains();
      setShowBuilder(false);
    } catch (error: any) {
      console.error('Error saving chain:', error);
      toast.error(error?.message || 'Failed to save chain');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // Level Management
  // ============================================================================

  const createEmptyLevel = (num: number): ChainLevel => ({
    id: uid(),
    levelNumber: num,
    levelName: `Level ${num}`,
    approvers: [{ id: uid(), type: 'USER', userName: '', isRequired: true }],
    approvalType: 'ANY',
    conditions: [],
    escalationHours: 48,
    dueHours: 24,
  });

  const addLevel = () => {
    setBuilderForm((prev) => ({
      ...prev,
      levels: [...prev.levels, createEmptyLevel(prev.levels.length + 1)],
    }));
  };

  const removeLevel = (levelId: string) => {
    setBuilderForm((prev) => ({
      ...prev,
      levels: prev.levels
        .filter((l) => l.id !== levelId)
        .map((l, i) => ({ ...l, levelNumber: i + 1 })),
    }));
  };

  const updateLevel = (levelId: string, updates: Partial<ChainLevel>) => {
    setBuilderForm((prev) => ({
      ...prev,
      levels: prev.levels.map((l) => (l.id === levelId ? { ...l, ...updates } : l)),
    }));
  };

  // ============================================================================
  // Approver Management
  // ============================================================================

  const addApprover = (levelId: string) => {
    updateLevel(levelId, {
      approvers: [
        ...(builderForm.levels.find((l) => l.id === levelId)?.approvers || []),
        { id: uid(), type: 'USER', userName: '', isRequired: true },
      ],
    });
  };

  const removeApprover = (levelId: string, approverId: string) => {
    const level = builderForm.levels.find((l) => l.id === levelId);
    if (!level) return;
    updateLevel(levelId, {
      approvers: level.approvers.filter((a) => a.id !== approverId),
    });
  };

  const updateApprover = (levelId: string, approverId: string, updates: Partial<ApproverItem>) => {
    const level = builderForm.levels.find((l) => l.id === levelId);
    if (!level) return;
    updateLevel(levelId, {
      approvers: level.approvers.map((a) => (a.id === approverId ? { ...a, ...updates } : a)),
    });
  };

  // ============================================================================
  // Condition Management
  // ============================================================================

  const addCondition = (levelId: string) => {
    const level = builderForm.levels.find((l) => l.id === levelId);
    if (!level) return;
    updateLevel(levelId, {
      conditions: [...level.conditions, { id: uid(), field: '', operator: 'eq', value: '' }],
    });
  };

  const removeCondition = (levelId: string, condId: string) => {
    const level = builderForm.levels.find((l) => l.id === levelId);
    if (!level) return;
    updateLevel(levelId, {
      conditions: level.conditions.filter((c) => c.id !== condId),
    });
  };

  const updateCondition = (levelId: string, condId: string, updates: Partial<ConditionItem>) => {
    const level = builderForm.levels.find((l) => l.id === levelId);
    if (!level) return;
    updateLevel(levelId, {
      conditions: level.conditions.map((c) => (c.id === condId ? { ...c, ...updates } : c)),
    });
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitPullRequest className="w-6 h-6 text-blue-500" />
            Approval Chains
          </h1>
          <p className="text-slate-500 text-sm">
            Define multi-level approval hierarchies with conditions and escalation rules.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Approval Chain
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Chains</div>
          <div className="text-2xl font-bold mt-1">{chains.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase">Active</div>
          <div className="text-2xl font-bold mt-1 text-emerald-600">
            {chains.filter((c) => c.isActive).length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase">Drafts</div>
          <div className="text-2xl font-bold mt-1 text-slate-500">
            {chains.filter((c) => !c.isActive).length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase">Avg. Levels</div>
          <div className="text-2xl font-bold mt-1">
            {chains.length > 0
              ? (chains.reduce((sum, c) => sum + c.levels.length, 0) / chains.length).toFixed(1)
              : '0'}
          </div>
        </div>
      </div>

      {/* Chain List */}
      {chains.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-500 mb-2">No Approval Chains</h3>
          <p className="text-sm text-slate-400 mb-4">
            Create your first approval chain to define multi-level approval workflows.
          </p>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            Create Approval Chain
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {chains.map((chain) => (
            <div
              key={chain.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:shadow-md"
            >
              {/* Chain Header */}
              <div className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg truncate">{chain.name}</h3>
                    {chain.isActive ? (
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-bold uppercase rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase rounded-full">
                        Draft
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-bold uppercase rounded-full">
                      {chain.levels.length} Level{chain.levels.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 truncate">
                    {chain.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span>{chain.isSequential ? 'Sequential' : 'Parallel'} flow</span>
                    <span>
                      {chain.requireAllLevels ? 'All levels required' : 'Any level sufficient'}
                    </span>
                    {chain.updatedAt && (
                      <span>Updated {new Date(chain.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleActive(chain)}
                    className={`p-2 rounded-lg transition-colors ${chain.isActive ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    title={chain.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {chain.isActive ? (
                      <ToggleRight className="w-5 h-5" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(chain)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(chain)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(chain)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === chain.id ? null : chain.id!)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="View levels"
                  >
                    {expandedId === chain.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Levels */}
              {expandedId === chain.id && chain.levels.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 p-5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Approval Levels
                  </div>
                  <div className="space-y-3">
                    {chain.levels.map((level, idx) => (
                      <div
                        key={level.id}
                        className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-sm">{level.levelName}</div>
                            <div className="text-xs text-slate-400">
                              {APPROVAL_TYPES.find((t) => t.value === level.approvalType)?.label ||
                                level.approvalType}{' '}
                              · {level.approvers.length} approver
                              {level.approvers.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Clock className="w-3 h-3" /> Due: {level.dueHours}h
                            {level.escalationHours > 0 && (
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Esc: {level.escalationHours}h
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Approvers */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {level.approvers.map((a) => (
                            <span
                              key={a.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-medium"
                            >
                              {a.type === 'USER' ? (
                                <Users className="w-3 h-3" />
                              ) : (
                                <Shield className="w-3 h-3" />
                              )}
                              {a.type === 'USER' ? a.userName || 'User' : a.roleName || 'Role'}
                              {a.isRequired && <span className="text-red-400">*</span>}
                            </span>
                          ))}
                        </div>

                        {/* Conditions */}
                        {level.conditions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {level.conditions.map((c) => (
                              <span
                                key={c.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded text-[10px] font-mono"
                              >
                                {c.field}{' '}
                                {OPERATORS.find((o) => o.value === c.operator)?.label || c.operator}{' '}
                                {c.value}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Connector */}
                        {idx < chain.levels.length - 1 && (
                          <div className="flex justify-center mt-3">
                            <ArrowRight className="w-4 h-4 text-slate-300 rotate-90" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-3xl mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold">
                {editingChain ? 'Edit Approval Chain' : 'New Approval Chain'}
              </h2>
              <button
                onClick={() => setShowBuilder(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Basic Information
                </h3>
                <div>
                  <label className="block text-sm font-medium mb-1">Chain Name *</label>
                  <input
                    type="text"
                    value={builderForm.name}
                    onChange={(e) => setBuilderForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Expense Approval Chain"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={builderForm.description}
                    onChange={(e) =>
                      setBuilderForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Describe what this approval chain is used for..."
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={builderForm.isSequential}
                      onChange={(e) =>
                        setBuilderForm((prev) => ({ ...prev, isSequential: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Sequential flow
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={builderForm.requireAllLevels}
                      onChange={(e) =>
                        setBuilderForm((prev) => ({ ...prev, requireAllLevels: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Require all levels
                  </label>
                </div>
              </div>

              {/* Approval Levels */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Approval Levels
                  </h3>
                  <button
                    onClick={addLevel}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Level
                  </button>
                </div>

                {builderForm.levels.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No levels added yet. Click "Add Level" to start building your approval chain.
                  </div>
                )}

                {builderForm.levels.map((level, idx) => (
                  <div
                    key={level.id}
                    className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <input
                        type="text"
                        value={level.levelName}
                        onChange={(e) => updateLevel(level.id, { levelName: e.target.value })}
                        placeholder="Level name"
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <select
                        value={level.approvalType}
                        onChange={(e) =>
                          updateLevel(level.id, { approvalType: e.target.value as any })
                        }
                        className="px-2 py-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      >
                        {APPROVAL_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeLevel(level.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Approvers */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500">Approvers</span>
                        <button
                          onClick={() => addApprover(level.id)}
                          className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <UserPlus className="w-3 h-3" /> Add
                        </button>
                      </div>
                      <div className="space-y-2">
                        {level.approvers.map((approver) => (
                          <div key={approver.id} className="flex items-center gap-2">
                            <select
                              value={approver.type}
                              onChange={(e) =>
                                updateApprover(level.id, approver.id, {
                                  type: e.target.value as any,
                                })
                              }
                              className="px-2 py-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-xs"
                            >
                              <option value="USER">User</option>
                              <option value="ROLE">Role</option>
                              <option value="MANAGER">Manager</option>
                            </select>
                            {approver.type === 'USER' ? (
                              <input
                                type="text"
                                value={approver.userName || ''}
                                onChange={(e) =>
                                  updateApprover(level.id, approver.id, {
                                    userName: e.target.value,
                                  })
                                }
                                placeholder="User name or ID"
                                className="flex-1 px-2 py-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-xs"
                              />
                            ) : (
                              <input
                                type="text"
                                value={approver.roleName || ''}
                                onChange={(e) =>
                                  updateApprover(level.id, approver.id, {
                                    roleName: e.target.value,
                                  })
                                }
                                placeholder="Role name"
                                className="flex-1 px-2 py-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-xs"
                              />
                            )}
                            <label className="flex items-center gap-1 text-[10px] text-slate-500 shrink-0">
                              <input
                                type="checkbox"
                                checked={approver.isRequired}
                                onChange={(e) =>
                                  updateApprover(level.id, approver.id, {
                                    isRequired: e.target.checked,
                                  })
                                }
                                className="rounded border-slate-300 text-blue-600"
                              />
                              Required
                            </label>
                            {level.approvers.length > 1 && (
                              <button
                                onClick={() => removeApprover(level.id, approver.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Conditions */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500">
                          Conditions (optional)
                        </span>
                        <button
                          onClick={() => addCondition(level.id)}
                          className="text-[10px] font-bold text-amber-600 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                      {level.conditions.length > 0 && (
                        <div className="space-y-2">
                          {level.conditions.map((cond) => (
                            <div key={cond.id} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={cond.field}
                                onChange={(e) =>
                                  updateCondition(level.id, cond.id, { field: e.target.value })
                                }
                                placeholder="Field (e.g., amount)"
                                className="w-28 px-2 py-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-xs font-mono"
                              />
                              <select
                                value={cond.operator}
                                onChange={(e) =>
                                  updateCondition(level.id, cond.id, {
                                    operator: e.target.value as any,
                                  })
                                }
                                className="px-2 py-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-xs"
                              >
                                {OPERATORS.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={cond.value}
                                onChange={(e) =>
                                  updateCondition(level.id, cond.id, { value: e.target.value })
                                }
                                placeholder="Value"
                                className="flex-1 px-2 py-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-xs font-mono"
                              />
                              <button
                                onClick={() => removeCondition(level.id, cond.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Timing */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <label className="text-[10px] font-bold text-slate-500">Due in</label>
                        <input
                          type="number"
                          value={level.dueHours}
                          onChange={(e) =>
                            updateLevel(level.id, { dueHours: parseInt(e.target.value) || 24 })
                          }
                          className="w-16 px-2 py-1 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-xs text-center"
                          min={1}
                        />
                        <span className="text-[10px] text-slate-400">hours</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-slate-400" />
                        <label className="text-[10px] font-bold text-slate-500">
                          Escalate after
                        </label>
                        <input
                          type="number"
                          value={level.escalationHours}
                          onChange={(e) =>
                            updateLevel(level.id, {
                              escalationHours: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-16 px-2 py-1 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-xs text-center"
                          min={0}
                        />
                        <span className="text-[10px] text-slate-400">hours</span>
                      </div>
                    </div>

                    {/* Connector */}
                    {idx < builderForm.levels.length - 1 && (
                      <div className="flex justify-center">
                        <ArrowRight className="w-4 h-4 text-slate-300 rotate-90" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowBuilder(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBuilder}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingChain ? 'Update Chain' : 'Create Chain'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
