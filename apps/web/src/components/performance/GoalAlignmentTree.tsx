/**
 * @module GoalAlignmentTree
 * @description Goal hierarchy visualization using ReactFlow — shows company →
 *              department → team → individual cascading goals with progress
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { Node, Edge } from 'reactflow';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Handle,
  Position,
  ReactFlowProvider,
  Panel,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Building2,
  Users,
  UserCircle,
  Target,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  TrendingUp,
  Filter,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

export type GoalLevel = 'company' | 'department' | 'team' | 'individual';
export type GoalNodeStatus = 'on_track' | 'at_risk' | 'behind' | 'achieved' | 'not_started';

export interface AlignmentGoal {
  id: string;
  title: string;
  description: string;
  level: GoalLevel;
  status: GoalNodeStatus;
  progress: number;
  owner: string;
  ownerRole: string;
  department?: string;
  targetDate: string;
  parentGoalId?: string;
  childCount: number;
  weight: number;
  metrics?: { name: string; current: number; target: number; unit: string }[];
}

interface GoalAlignmentTreeProps {
  goals: AlignmentGoal[];
}

// ── Config ───────────────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<
  GoalLevel,
  { label: string; icon: LucideIcon; color: string; bg: string; border: string; nodeBg: string }
> = {
  company: {
    label: 'Company',
    icon: Building2,
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
    border: '#4B3BF5',
    nodeBg: 'linear-gradient(135deg, #4B3BF5 0%, #6366F1 100%)',
  },
  department: {
    label: 'Department',
    icon: Users,
    color: 'text-nebula-purple',
    bg: 'bg-nebula-purple/10',
    border: '#8B5CF6',
    nodeBg: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
  },
  team: {
    label: 'Team',
    icon: Users,
    color: 'text-sunset-amber',
    bg: 'bg-sunset-amber/10',
    border: '#F59E0B',
    nodeBg: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  },
  individual: {
    label: 'Individual',
    icon: UserCircle,
    color: 'text-neural-mint',
    bg: 'bg-neural-mint/10',
    border: '#00D4AA',
    nodeBg: 'linear-gradient(135deg, #00D4AA 0%, #34D399 100%)',
  },
};

const STATUS_CONFIG: Record<
  GoalNodeStatus,
  { label: string; icon: LucideIcon; color: string; textColor: string }
> = {
  on_track: {
    label: 'On Track',
    icon: CheckCircle2,
    color: '#00D4AA',
    textColor: 'text-neural-mint',
  },
  at_risk: {
    label: 'At Risk',
    icon: AlertTriangle,
    color: '#F59E0B',
    textColor: 'text-sunset-amber',
  },
  behind: { label: 'Behind', icon: XCircle, color: '#EF4444', textColor: 'text-coral-alert' },
  achieved: {
    label: 'Achieved',
    icon: CheckCircle2,
    color: '#00D4AA',
    textColor: 'text-neural-mint',
  },
  not_started: {
    label: 'Not Started',
    icon: Clock,
    color: '#9CA3AF',
    textColor: 'text-silver-mist',
  },
};

// ── Mock Data ────────────────────────────────────────────────────────────────────

export const MOCK_ALIGNMENT_GOALS: AlignmentGoal[] = [
  // Company Level
  {
    id: 'g-company-1',
    title: 'Achieve $50M ARR by Q4 2026',
    description: 'Scale the business to $50M annual recurring revenue',
    level: 'company',
    status: 'on_track',
    progress: 62,
    owner: 'CEO',
    ownerRole: 'Chief Executive Officer',
    targetDate: '2026-12-31',
    childCount: 3,
    weight: 100,
    metrics: [{ name: 'ARR', current: 31, target: 50, unit: '$M' }],
  },
  // Department Level
  {
    id: 'g-dept-eng',
    title: 'Ship v3.0 Platform with 99.9% Uptime',
    description: 'Deliver the next-generation platform architecture',
    level: 'department',
    status: 'on_track',
    progress: 71,
    owner: 'CTO',
    ownerRole: 'VP Engineering',
    department: 'Engineering',
    targetDate: '2026-09-30',
    parentGoalId: 'g-company-1',
    childCount: 2,
    weight: 40,
    metrics: [
      { name: 'Features Shipped', current: 42, target: 60, unit: 'features' },
      { name: 'Uptime', current: 99.95, target: 99.9, unit: '%' },
    ],
  },
  {
    id: 'g-dept-sales',
    title: 'Close 200 Enterprise Deals',
    description: 'Expand enterprise customer base through strategic sales',
    level: 'department',
    status: 'at_risk',
    progress: 45,
    owner: 'VP Sales',
    ownerRole: 'VP of Sales',
    department: 'Sales',
    targetDate: '2026-12-31',
    parentGoalId: 'g-company-1',
    childCount: 2,
    weight: 35,
    metrics: [{ name: 'Deals Closed', current: 90, target: 200, unit: 'deals' }],
  },
  {
    id: 'g-dept-product',
    title: 'Achieve NPS Score of 75+',
    description: 'Increase customer satisfaction through product excellence',
    level: 'department',
    status: 'on_track',
    progress: 80,
    owner: 'CPO',
    ownerRole: 'VP Product',
    department: 'Product',
    targetDate: '2026-12-31',
    parentGoalId: 'g-company-1',
    childCount: 1,
    weight: 25,
    metrics: [{ name: 'NPS', current: 72, target: 75, unit: 'score' }],
  },
  // Team Level
  {
    id: 'g-team-platform',
    title: 'Complete API Gateway Migration',
    description: 'Migrate all services to the new API gateway',
    level: 'team',
    status: 'on_track',
    progress: 85,
    owner: 'Lisa Park',
    ownerRole: 'Tech Lead',
    department: 'Platform Team',
    targetDate: '2026-06-30',
    parentGoalId: 'g-dept-eng',
    childCount: 2,
    weight: 50,
    metrics: [{ name: 'APIs Migrated', current: 34, target: 40, unit: 'APIs' }],
  },
  {
    id: 'g-team-frontend',
    title: 'Redesign Dashboard Experience',
    description: 'Launch the new unified dashboard with real-time analytics',
    level: 'team',
    status: 'at_risk',
    progress: 55,
    owner: 'Anika Shah',
    ownerRole: 'Design Lead',
    department: 'Frontend Team',
    targetDate: '2026-07-31',
    parentGoalId: 'g-dept-eng',
    childCount: 2,
    weight: 50,
    metrics: [{ name: 'Screens Complete', current: 11, target: 20, unit: 'screens' }],
  },
  {
    id: 'g-team-enterprise',
    title: 'Build Strategic Account Pipeline',
    description: 'Develop pipeline for $100K+ accounts',
    level: 'team',
    status: 'behind',
    progress: 30,
    owner: 'Elena Rodriguez',
    ownerRole: 'Enterprise Lead',
    department: 'Enterprise Sales',
    targetDate: '2026-09-30',
    parentGoalId: 'g-dept-sales',
    childCount: 1,
    weight: 60,
    metrics: [{ name: 'Pipeline Value', current: 3.2, target: 10, unit: '$M' }],
  },
  {
    id: 'g-team-smb',
    title: 'Scale SMB Self-Serve Funnel',
    description: 'Double self-serve signups through product-led growth',
    level: 'team',
    status: 'on_track',
    progress: 68,
    owner: 'Carlos Rivera',
    ownerRole: 'Growth Lead',
    department: 'SMB Sales',
    targetDate: '2026-12-31',
    parentGoalId: 'g-dept-sales',
    childCount: 1,
    weight: 40,
    metrics: [{ name: 'Monthly Signups', current: 340, target: 500, unit: 'signups' }],
  },
  {
    id: 'g-team-ux',
    title: 'Reduce Onboarding Drop-off by 40%',
    description: 'Optimize the user onboarding flow with UX research',
    level: 'team',
    status: 'achieved',
    progress: 100,
    owner: 'Priya Patel',
    ownerRole: 'UX Lead',
    department: 'UX Team',
    targetDate: '2026-06-30',
    parentGoalId: 'g-dept-product',
    childCount: 1,
    weight: 100,
    metrics: [{ name: 'Drop-off Reduction', current: 42, target: 40, unit: '%' }],
  },
  // Individual Level
  {
    id: 'g-ind-1',
    title: 'Implement Rate Limiter Service',
    description: 'Build rate limiting for the new API gateway',
    level: 'individual',
    status: 'on_track',
    progress: 90,
    owner: 'You',
    ownerRole: 'Senior Engineer',
    department: 'Platform Team',
    targetDate: '2026-04-30',
    parentGoalId: 'g-team-platform',
    childCount: 0,
    weight: 50,
    metrics: [{ name: 'Endpoints Protected', current: 36, target: 40, unit: 'endpoints' }],
  },
  {
    id: 'g-ind-2',
    title: 'Write Migration Runbook',
    description: 'Document the complete API migration runbook',
    level: 'individual',
    status: 'achieved',
    progress: 100,
    owner: 'David Kim',
    ownerRole: 'Solutions Architect',
    department: 'Platform Team',
    targetDate: '2026-03-31',
    parentGoalId: 'g-team-platform',
    childCount: 0,
    weight: 50,
  },
  {
    id: 'g-ind-3',
    title: 'Build Real-Time Analytics Widgets',
    description: 'Create 8 interactive dashboard widgets',
    level: 'individual',
    status: 'at_risk',
    progress: 50,
    owner: 'Sarah Chen',
    ownerRole: 'Software Engineer',
    department: 'Frontend Team',
    targetDate: '2026-06-30',
    parentGoalId: 'g-team-frontend',
    childCount: 0,
    weight: 50,
    metrics: [{ name: 'Widgets Built', current: 4, target: 8, unit: 'widgets' }],
  },
  {
    id: 'g-ind-4',
    title: 'Design System v2 Components',
    description: 'Ship 30 updated design system components',
    level: 'individual',
    status: 'on_track',
    progress: 73,
    owner: 'Jordan Lee',
    ownerRole: 'UI Engineer',
    department: 'Frontend Team',
    targetDate: '2026-07-31',
    parentGoalId: 'g-team-frontend',
    childCount: 0,
    weight: 50,
    metrics: [{ name: 'Components', current: 22, target: 30, unit: 'components' }],
  },
  {
    id: 'g-ind-5',
    title: 'Close 5 Enterprise Pilots',
    description: 'Convert pilot programs to paid contracts',
    level: 'individual',
    status: 'behind',
    progress: 20,
    owner: 'Rachel Green',
    ownerRole: 'Account Executive',
    department: 'Enterprise Sales',
    targetDate: '2026-08-31',
    parentGoalId: 'g-team-enterprise',
    childCount: 0,
    weight: 100,
    metrics: [{ name: 'Pilots Closed', current: 1, target: 5, unit: 'pilots' }],
  },
  {
    id: 'g-ind-6',
    title: 'Launch PLG Email Sequences',
    description: 'Automate 5 onboarding email campaigns',
    level: 'individual',
    status: 'on_track',
    progress: 80,
    owner: 'Marcus Johnson',
    ownerRole: 'Growth Marketer',
    department: 'SMB Sales',
    targetDate: '2026-05-31',
    parentGoalId: 'g-team-smb',
    childCount: 0,
    weight: 100,
    metrics: [{ name: 'Campaigns Live', current: 4, target: 5, unit: 'campaigns' }],
  },
  {
    id: 'g-ind-7',
    title: 'Run 12 User Interview Sessions',
    description: 'Conduct monthly user research sessions',
    level: 'individual',
    status: 'achieved',
    progress: 100,
    owner: 'Priya Patel',
    ownerRole: 'UX Researcher',
    department: 'UX Team',
    targetDate: '2026-06-30',
    parentGoalId: 'g-team-ux',
    childCount: 0,
    weight: 100,
    metrics: [{ name: 'Sessions', current: 12, target: 12, unit: 'sessions' }],
  },
];

// ── Custom ReactFlow Node ────────────────────────────────────────────────────────

interface GoalNodeData {
  goal: AlignmentGoal;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

function GoalNode({ data }: { data: GoalNodeData }) {
  const { goal, isExpanded, onToggle } = data;
  const levelCfg = LEVEL_CONFIG[goal.level];
  const statusCfg = STATUS_CONFIG[goal.status];
  const StatusIcon = statusCfg.icon;
  const LevelIcon = levelCfg.icon;

  const progressColor =
    goal.progress >= 80 ? '#00D4AA' : goal.progress >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div
      className="relative"
      style={{ minWidth: goal.level === 'company' ? 280 : goal.level === 'department' ? 260 : 240 }}
    >
      {/* Incoming handle */}
      {goal.parentGoalId && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: levelCfg.border, width: 8, height: 8, border: '2px solid white' }}
        />
      )}

      <div
        className="rounded-xl shadow-md border overflow-hidden"
        style={{ borderColor: `${levelCfg.border}40` }}
      >
        {/* Color bar */}
        <div className="h-1.5" style={{ background: levelCfg.nodeBg }} />

        <div className="bg-white dark:bg-stellar-blue px-3 py-2.5">
          {/* Header */}
          <div className="flex items-start gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: `${levelCfg.border}15` }}
            >
              <LevelIcon className="w-3.5 h-3.5" style={{ color: levelCfg.border }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[7px] font-bold uppercase" style={{ color: levelCfg.border }}>
                  {levelCfg.label}
                </span>
                <span
                  className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[6px] font-bold"
                  style={{ color: statusCfg.color, backgroundColor: `${statusCfg.color}15` }}
                >
                  <StatusIcon style={{ width: 8, height: 8 }} />
                  {statusCfg.label}
                </span>
              </div>
              <p className="text-[9px] font-bold text-ink-black dark:text-pearl leading-tight mt-0.5 line-clamp-2">
                {goal.title}
              </p>
              <p className="text-[7px] text-silver-mist mt-0.5">
                {goal.owner} · {goal.ownerRole}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-[7px] mb-0.5">
              <span className="text-silver-mist">Progress</span>
              <span className="font-black" style={{ color: progressColor }}>
                {goal.progress}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${goal.progress}%`, backgroundColor: progressColor }}
              />
            </div>
          </div>

          {/* Metrics */}
          {goal.metrics && goal.metrics.length > 0 && (
            <div className="flex gap-2 mt-1.5">
              {goal.metrics.map((m) => (
                <div key={m.name} className="text-[7px]">
                  <span className="text-silver-mist">{m.name}: </span>
                  <span className="font-bold text-ink-black dark:text-pearl">
                    {m.current}/{m.target} {m.unit}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Expand/Collapse */}
          {goal.childCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(goal.id);
              }}
              className="flex items-center gap-0.5 mt-1.5 text-[7px] font-bold hover:opacity-80 transition-opacity"
              style={{ color: levelCfg.border }}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              {goal.childCount} sub-goal{goal.childCount !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      {/* Outgoing handle */}
      {goal.childCount > 0 && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: levelCfg.border, width: 8, height: 8, border: '2px solid white' }}
        />
      )}
    </div>
  );
}

const nodeTypes = { goalNode: GoalNode };

// ── Layout Helpers ───────────────────────────────────────────────────────────────

function buildTreeLayout(
  goals: AlignmentGoal[],
  expandedIds: Set<string>
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Find root goals
  const roots = goals.filter((g) => !g.parentGoalId);

  // BFS layout
  const X_GAP = 300;
  const Y_GAP = 160;

  function getVisibleChildren(parentId: string): AlignmentGoal[] {
    if (!expandedIds.has(parentId)) return [];
    return goals.filter((g) => g.parentGoalId === parentId);
  }

  function getSubtreeWidth(goalId: string): number {
    const children = getVisibleChildren(goalId);
    if (children.length === 0) return 1;
    return children.reduce((sum, c) => sum + getSubtreeWidth(c.id), 0);
  }

  function layoutNode(goal: AlignmentGoal, level: number, xOffset: number): number {
    const children = getVisibleChildren(goal.id);
    const _totalWidth = Math.max(
      1,
      children.reduce((sum, c) => sum + getSubtreeWidth(c.id), 0)
    );

    let nodeX: number;
    if (children.length === 0) {
      nodeX = xOffset * X_GAP;
    } else {
      // Layout children first, then center parent
      let childOffset = xOffset;
      const childXPositions: number[] = [];
      for (const child of children) {
        const childWidth = getSubtreeWidth(child.id);
        const childX = layoutNode(child, level + 1, childOffset);
        childXPositions.push(childX);
        childOffset += childWidth;
      }
      nodeX = (childXPositions[0] + childXPositions[childXPositions.length - 1]) / 2;
    }

    const nodeId = goal.id;
    nodes.push({
      id: nodeId,
      type: 'goalNode',
      position: { x: nodeX, y: level * Y_GAP },
      data: {
        goal,
        isExpanded: expandedIds.has(goal.id),
        onToggle: () => {},
      },
    });

    // Edges to children
    for (const child of children) {
      const levelCfg = LEVEL_CONFIG[child.level];
      edges.push({
        id: `${goal.id}-${child.id}`,
        source: goal.id,
        target: child.id,
        type: 'smoothstep',
        animated: child.status === 'at_risk' || child.status === 'behind',
        style: { stroke: levelCfg.border, strokeWidth: 2, opacity: 0.6 },
        markerEnd: { type: MarkerType.ArrowClosed, color: levelCfg.border, width: 12, height: 12 },
      });
    }

    return nodeX;
  }

  let rootOffset = 0;
  for (const root of roots) {
    const rootWidth = getSubtreeWidth(root.id);
    layoutNode(root, 0, rootOffset);
    rootOffset += rootWidth;
  }

  return { nodes, edges };
}

// ── Main Component ───────────────────────────────────────────────────────────────

function GoalAlignmentTreeInner({ goals }: GoalAlignmentTreeProps) {
  // Expand all by default
  const allIds = useMemo(
    () => new Set(goals.filter((g) => g.childCount > 0).map((g) => g.id)),
    [goals]
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(allIds);
  const [levelFilter, setLevelFilter] = useState<GoalLevel | 'all'>('all');

  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filteredGoals = useMemo(() => {
    if (levelFilter === 'all') return goals;
    // Show the filtered level and all ancestors
    const targetGoals = goals.filter((g) => g.level === levelFilter);
    const ancestorIds = new Set<string>();
    function addAncestors(goalId: string | undefined) {
      if (!goalId) return;
      const goal = goals.find((g) => g.id === goalId);
      if (goal && !ancestorIds.has(goal.id)) {
        ancestorIds.add(goal.id);
        addAncestors(goal.parentGoalId);
      }
    }
    for (const tg of targetGoals) {
      ancestorIds.add(tg.id);
      addAncestors(tg.parentGoalId);
    }
    return goals.filter((g) => ancestorIds.has(g.id));
  }, [goals, levelFilter]);

  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () => buildTreeLayout(filteredGoals, expandedIds),
    [filteredGoals, expandedIds]
  );

  // Inject the toggle handler into node data
  const nodesWithHandler = useMemo(
    () =>
      layoutNodes.map((n) => ({
        ...n,
        data: { ...n.data, onToggle: handleToggle },
      })),
    [layoutNodes, handleToggle]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(nodesWithHandler);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  // Sync when layout changes
  React.useEffect(() => {
    setNodes(nodesWithHandler);
    setEdges(layoutEdges);
  }, [nodesWithHandler, layoutEdges, setNodes, setEdges]);

  // Stats
  const stats = useMemo(() => {
    const total = goals.length;
    const onTrack = goals.filter((g) => g.status === 'on_track' || g.status === 'achieved').length;
    const atRisk = goals.filter((g) => g.status === 'at_risk').length;
    const behind = goals.filter((g) => g.status === 'behind').length;
    const avgProgress =
      total > 0 ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / total) : 0;
    return { total, onTrack, atRisk, behind, avgProgress };
  }, [goals]);

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          {
            label: 'Total Goals',
            value: stats.total,
            icon: Target,
            color: 'text-celestial-indigo',
            bg: 'bg-celestial-indigo/10',
          },
          {
            label: 'On Track',
            value: stats.onTrack,
            icon: CheckCircle2,
            color: 'text-neural-mint',
            bg: 'bg-neural-mint/10',
          },
          {
            label: 'At Risk',
            value: stats.atRisk,
            icon: AlertTriangle,
            color: 'text-sunset-amber',
            bg: 'bg-sunset-amber/10',
          },
          {
            label: 'Behind',
            value: stats.behind,
            icon: XCircle,
            color: 'text-coral-alert',
            bg: 'bg-coral-alert/10',
          },
          {
            label: 'Avg Progress',
            value: `${stats.avgProgress}%`,
            icon: TrendingUp,
            color: 'text-celestial-indigo',
            bg: 'bg-celestial-indigo/10',
          },
        ].map((s) => {
          const SIcon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-2.5 text-center"
            >
              <div
                className={`w-7 h-7 mx-auto rounded-lg ${s.bg} flex items-center justify-center mb-1`}
              >
                <SIcon className={`w-3.5 h-3.5 ${s.color}`} />
              </div>
              <p className="text-[14px] font-black text-ink-black dark:text-pearl">{s.value}</p>
              <p className="text-[7px] text-silver-mist font-semibold">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Level Filter */}
      <div className="flex items-center gap-1.5">
        <Filter className="w-3 h-3 text-silver-mist" />
        <span className="text-[8px] font-bold text-silver-mist">Level:</span>
        {(['all', 'company', 'department', 'team', 'individual'] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setLevelFilter(lvl)}
            className={`px-2 py-1 rounded-md text-[8px] font-bold transition-colors ${
              levelFilter === lvl
                ? lvl === 'all'
                  ? 'bg-celestial-indigo text-white'
                  : `${LEVEL_CONFIG[lvl].bg} ${LEVEL_CONFIG[lvl].color}`
                : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
            }`}
          >
            {lvl === 'all' ? 'All Levels' : LEVEL_CONFIG[lvl].label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setExpandedIds(allIds)}
          className="px-2 py-1 rounded-md text-[8px] font-bold text-silver-mist hover:text-celestial-indigo transition-colors"
        >
          Expand All
        </button>
        <button
          onClick={() => setExpandedIds(new Set())}
          className="px-2 py-1 rounded-md text-[8px] font-bold text-silver-mist hover:text-celestial-indigo transition-colors"
        >
          Collapse All
        </button>
      </div>

      {/* ReactFlow Canvas */}
      <div
        className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden"
        style={{ height: 600 }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.3}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#E5E7EB" gap={20} size={1} />
          <Controls
            showInteractive={false}
            className="!bg-white !dark:bg-stellar-blue !shadow-md !rounded-xl !border !border-cloud dark:!border-nebula-purple/20"
          />
          <Panel position="top-right" className="flex items-center gap-1.5">
            {/* Legend */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-stellar-blue/90 border border-cloud dark:border-nebula-purple/20 shadow-sm">
              {(['company', 'department', 'team', 'individual'] as GoalLevel[]).map((lvl) => (
                <div key={lvl} className="flex items-center gap-0.5">
                  <div
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: LEVEL_CONFIG[lvl].border }}
                  />
                  <span className="text-[7px] font-semibold text-silver-mist">
                    {LEVEL_CONFIG[lvl].label}
                  </span>
                </div>
              ))}
              <div className="w-px h-3 bg-cloud dark:bg-nebula-purple/20 mx-1" />
              <div className="flex items-center gap-0.5">
                <div
                  className="w-4 h-0.5 bg-sunset-amber"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, #F59E0B 0, #F59E0B 3px, transparent 3px, transparent 6px)',
                  }}
                />
                <span className="text-[7px] font-semibold text-silver-mist">At Risk</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

// ── Exported Wrapper with Provider ───────────────────────────────────────────────

export const GoalAlignmentTree: React.FC<GoalAlignmentTreeProps> = (props) => (
  <ReactFlowProvider>
    <GoalAlignmentTreeInner {...props} />
  </ReactFlowProvider>
);

export default GoalAlignmentTree;
