'use client';

/**
 * @component ONAVisualization
 * @description Organizational Network Analysis Visualization — interactive SVG network graph,
 *              influencer list, silo detection, collaboration heatmap, network metrics (Sec 23.5)
 * @project AURA HCM Platform
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronRight,
  Filter,
  Globe,
  Layers,
  Network,
  Star,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import {
  type CollaborationMetrics,
  type Influencer,
  type NetworkGraph,
  type NetworkHealth,
  type NetworkNode,
  ONAService,
  type SiloGroup,
} from '@/services/onaService';

// ============================================================================
// TYPES
// ============================================================================

interface _NodePosition {
  id: string;
  x: number;
  y: number;
}

// ============================================================================
// FORCE-DIRECTED LAYOUT (simplified Fruchterman-Reingold)
// ============================================================================

const W = 800;
const H = 560;
const PADDING = 50;

function computeLayout(graph: NetworkGraph): Map<string, { x: number; y: number }> {
  const nodes = graph.nodes;
  const edges = graph.edges;

  // Build adjacency for force simulation
  const pos = new Map<string, { x: number; y: number; vx: number; vy: number }>();

  // Initialize positions: group by department in rough circles
  const deptGroups: Record<string, string[]> = {};
  nodes.forEach((n) => {
    if (!deptGroups[n.department]) deptGroups[n.department] = [];
    deptGroups[n.department].push(n.id);
  });

  const deptList = Object.keys(deptGroups);
  const deptCount = deptList.length;

  deptList.forEach((dept, di) => {
    const angle = (di / deptCount) * 2 * Math.PI - Math.PI / 2;
    const cx = W / 2 + (W / 2 - PADDING - 60) * 0.55 * Math.cos(angle);
    const cy = H / 2 + (H / 2 - PADDING - 40) * 0.55 * Math.sin(angle);
    const members = deptGroups[dept];
    members.forEach((id, mi) => {
      const spread = 45;
      const a2 = (mi / members.length) * 2 * Math.PI;
      pos.set(id, {
        x: cx + spread * Math.cos(a2),
        y: cy + spread * Math.sin(a2),
        vx: 0,
        vy: 0,
      });
    });
  });

  // Simple repulsion + attraction passes
  const k = Math.sqrt((W * H) / nodes.length) * 0.6;
  const ITERATIONS = 60;

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const cooling = 1 - iter / ITERATIONS;

    // Reset forces
    pos.forEach((p) => {
      p.vx = 0;
      p.vy = 0;
    });

    // Repulsion between all node pairs
    const nodeArr = Array.from(pos.entries());
    for (let i = 0; i < nodeArr.length; i++) {
      for (let j = i + 1; j < nodeArr.length; j++) {
        const [_aid, ap] = nodeArr[i];
        const [_bid, bp] = nodeArr[j];
        const dx = ap.x - bp.x;
        const dy = ap.y - bp.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (k * k) / dist;
        const nx = (dx / dist) * force;
        const ny = (dy / dist) * force;
        ap.vx += nx;
        ap.vy += ny;
        bp.vx -= nx;
        bp.vy -= ny;
      }
    }

    // Attraction along edges
    edges.forEach((e) => {
      const sp = pos.get(e.source);
      const tp = pos.get(e.target);
      if (!sp || !tp) return;
      const dx = tp.x - sp.x;
      const dy = tp.y - sp.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const force = (dist * dist) / k;
      const nx = (dx / dist) * force * 0.12;
      const ny = (dy / dist) * force * 0.12;
      sp.vx += nx;
      sp.vy += ny;
      tp.vx -= nx;
      tp.vy -= ny;
    });

    // Apply with cooling + bounds
    pos.forEach((p) => {
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const maxMove = 12 * cooling;
      if (speed > maxMove) {
        p.vx = (p.vx / speed) * maxMove;
        p.vy = (p.vy / speed) * maxMove;
      }
      p.x = Math.max(PADDING, Math.min(W - PADDING, p.x + p.vx));
      p.y = Math.max(PADDING, Math.min(H - PADDING, p.y + p.vy));
    });
  }

  const result = new Map<string, { x: number; y: number }>();
  pos.forEach((p, id) => result.set(id, { x: p.x, y: p.y }));
  return result;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function NetworkMetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-slate-800 rounded-lg p-3 text-center">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-indigo-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function InfluencerRiskBadge({ level }: { level: string }) {
  const cls =
    level === 'high'
      ? 'bg-red-500/20 text-red-400 border-red-500/30'
      : level === 'medium'
        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border ${cls}`}
    >
      {level === 'high' ? 'High Risk' : level === 'medium' ? 'Med Risk' : 'Low Risk'}
    </span>
  );
}

function InfluenceTypeBadge({ type }: { type: string }) {
  const cls =
    type === 'bridge'
      ? 'bg-violet-500/20 text-violet-400'
      : type === 'hub'
        ? 'bg-blue-500/20 text-blue-400'
        : 'bg-slate-500/20 text-slate-400';
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${cls}`}
    >
      {type === 'bridge' ? 'Bridge' : type === 'hub' ? 'Hub' : 'Peripheral'}
    </span>
  );
}

interface NodeCardProps {
  node: NetworkNode;
  position: { x: number; y: number };
  isSelected: boolean;
  isHovered: boolean;
  connectedNodeIds: Set<string>;
  allNodesCount: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

function NodeCircle({
  node,
  position,
  isSelected,
  isHovered,
  connectedNodeIds,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: NodeCardProps) {
  const r = Math.max(6, Math.min(18, 6 + node.connections * 0.55));
  const isHighlighted = isSelected || isHovered || connectedNodeIds.has(node.id);
  const isDimmed = (isSelected || isHovered) && !connectedNodeIds.has(node.id) && !isSelected;

  return (
    <g
      transform={`translate(${position.x},${position.y})`}
      style={{ cursor: 'pointer' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Glow ring for influencers */}
      {node.isInfluencer && (
        <circle
          r={r + 5}
          fill="none"
          stroke={node.color}
          strokeWidth={1.5}
          strokeDasharray="3 2"
          opacity={isHighlighted ? 0.9 : 0.4}
        />
      )}
      {/* Silo indicator */}
      {node.isSilo && (
        <circle r={r + 4} fill="none" stroke="#ef4444" strokeWidth={2} opacity={0.7} />
      )}
      {/* Main node */}
      <circle
        r={r}
        fill={node.color}
        opacity={isDimmed ? 0.25 : isHighlighted ? 1 : 0.75}
        stroke={isSelected ? '#ffffff' : 'transparent'}
        strokeWidth={2}
      />
      {/* Label */}
      <text
        y={r + 11}
        textAnchor="middle"
        fontSize={9}
        fill={isDimmed ? '#475569' : '#e2e8f0'}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {node.name.split(' ')[0]}
      </text>
    </g>
  );
}

// Department collaboration heatmap
function CollaborationHeatmap({ data }: { data: CollaborationMetrics[] }) {
  const depts = Array.from(
    new Set(data.flatMap((d) => [d.teamName, ...d.topCollaborators.map((c) => c.departmentName)]))
  );
  const getScore = (rowTeam: string, colDept: string): number => {
    if (rowTeam === colDept) return 100;
    const row = data.find((d) => d.teamName === rowTeam);
    if (!row) return 0;
    const col = row.topCollaborators.find((c) => c.departmentName === colDept);
    return col?.score ?? Math.floor(Math.random() * 35 + 10);
  };

  const colorFromScore = (s: number): string => {
    if (s >= 80) return '#1d4ed8';
    if (s >= 60) return '#2563eb';
    if (s >= 40) return '#3b82f6';
    if (s >= 20) return '#93c5fd';
    return '#1e293b';
  };

  return (
    <div className="overflow-x-auto">
      <table className="text-xs min-w-full">
        <thead>
          <tr>
            <th className="text-slate-500 text-left py-1 pr-2 font-normal w-24">Team ↓</th>
            {depts.map((d) => (
              <th
                key={d}
                className="text-slate-400 font-normal pb-1 px-0.5 text-center"
                style={{ minWidth: 48 }}
              >
                <span
                  className="inline-block"
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    transform: 'rotate(180deg)',
                    height: 52,
                    fontSize: 10,
                  }}
                >
                  {d}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.teamName}>
              <td className="text-slate-300 py-0.5 pr-2 font-medium text-xs whitespace-nowrap">
                {row.teamName}
              </td>
              {depts.map((col) => {
                const score = getScore(row.teamName, col);
                return (
                  <td key={col} className="py-0.5 px-0.5 text-center">
                    <div
                      className="rounded mx-auto flex items-center justify-center"
                      style={{ width: 36, height: 22, background: colorFromScore(score) }}
                      title={`${row.teamName} ↔ ${col}: ${score}`}
                    >
                      <span className="text-white font-medium" style={{ fontSize: 9 }}>
                        {score}
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Network health gauge
function HealthGauge({ score }: { score: number }) {
  const radius = 52;
  const stroke = 10;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <svg width={140} height={84} viewBox="0 0 140 84">
        {/* Track */}
        <path
          d={`M ${70 - radius} 74 A ${radius} ${radius} 0 0 1 ${70 + radius} 74`}
          fill="none"
          stroke="#1e293b"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Progress */}
        <path
          d={`M ${70 - radius} 74 A ${radius} ${radius} 0 0 1 ${70 + radius} 74`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text x={70} y={68} textAnchor="middle" fontSize={22} fontWeight="bold" fill={color}>
          {score}
        </text>
        <text x={70} y={80} textAnchor="middle" fontSize={9} fill="#94a3b8">
          / 100
        </text>
      </svg>
      <div className="text-slate-400 text-xs -mt-1">Network Health Score</div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TABS = ['Network Graph', 'Influencers', 'Silos', 'Collaboration', 'Network Health'] as const;
type Tab = (typeof TABS)[number];

const DEPT_FILTER_OPTIONS = [
  'All Departments',
  'Engineering',
  'Product',
  'Data',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Marketing',
  'Design',
];

export default function ONAVisualization() {
  const [activeTab, setActiveTab] = useState<Tab>('Network Graph');
  const [graph, setGraph] = useState<NetworkGraph | null>(null);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [silos, setSilos] = useState<SiloGroup[]>([]);
  const [collaboration, setCollaboration] = useState<CollaborationMetrics[]>([]);
  const [health, setHealth] = useState<NetworkHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [edgeTypeFilter, setEdgeTypeFilter] = useState<
    'all' | 'collaboration' | 'reporting' | 'informal'
  >('all');
  const [showInfluencersOnly, setShowInfluencersOnly] = useState(false);
  const [showSilosHighlighted, setShowSilosHighlighted] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      ONAService.getNetworkGraph(),
      ONAService.getInfluencers(),
      ONAService.getSiloDetection(),
      ONAService.getCollaborationMetrics(),
      ONAService.getNetworkHealth(),
    ]).then(([g, inf, sil, col, hlth]) => {
      setGraph(g);
      setInfluencers(inf);
      setSilos(sil);
      setCollaboration(col);
      setHealth(hlth);
      setLoading(false);
    });
  }, []);

  // Computed layout (memoized because force simulation is expensive)
  const layout = useMemo(() => {
    if (!graph) return new Map<string, { x: number; y: number }>();
    return computeLayout(graph);
  }, [graph]);

  // Filtered nodes and edges
  const { filteredNodes, filteredEdges } = useMemo(() => {
    if (!graph) return { filteredNodes: [], filteredEdges: [] };
    let nodes = graph.nodes;
    if (deptFilter !== 'All Departments') {
      nodes = nodes.filter((n) => n.department === deptFilter);
    }
    if (showInfluencersOnly) {
      nodes = nodes.filter((n) => n.isInfluencer);
    }
    const nodeIds = new Set(nodes.map((n) => n.id));
    let edges = graph.edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
    if (edgeTypeFilter !== 'all') {
      edges = edges.filter((e) => e.type === edgeTypeFilter);
    }
    return { filteredNodes: nodes, filteredEdges: edges };
  }, [graph, deptFilter, showInfluencersOnly, edgeTypeFilter]);

  // Connected node IDs for highlight
  const connectedNodeIds = useMemo(() => {
    const active = hoveredNodeId ?? selectedNode?.id;
    if (!active) return new Set<string>();
    const set = new Set<string>([active]);
    filteredEdges.forEach((e) => {
      if (e.source === active) set.add(e.target);
      if (e.target === active) set.add(e.source);
    });
    return set;
  }, [hoveredNodeId, selectedNode, filteredEdges]);

  const activeNodeId = hoveredNodeId ?? selectedNode?.id;

  const getEdgeColor = (type: string) => {
    if (type === 'reporting') return '#6366f1';
    if (type === 'informal') return '#f59e0b';
    return '#475569';
  };

  const getEdgeOpacity = (e: { source: string; target: string; frequency: string }) => {
    if (activeNodeId && !connectedNodeIds.has(e.source) && !connectedNodeIds.has(e.target))
      return 0.06;
    if (e.frequency === 'daily') return 0.85;
    if (e.frequency === 'weekly') return 0.55;
    if (e.frequency === 'monthly') return 0.3;
    return 0.15;
  };

  const getEdgeWidth = (weight: number) => Math.max(0.5, weight * 0.3);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 gap-2">
        <Network className="w-5 h-5 animate-pulse text-indigo-400" />
        <span>Mapping organizational network…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-400" />
            Organizational Network Analysis
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Map collaboration patterns, identify influencers, and detect silos across the
            organization.
          </p>
        </div>
        {health && (
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span className="text-slate-500">|</span>
            <span>{graph?.metadata.totalNodes} employees</span>
            <span className="text-slate-500">|</span>
            <span>{graph?.metadata.totalEdges} connections</span>
            <span className="text-slate-500">|</span>
            <span className={health.overallScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}>
              Health: {health.overallScore}/100
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Network Graph Tab ─────────────────────────── */}
      {activeTab === 'Network Graph' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {DEPT_FILTER_OPTIONS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <select
              value={edgeTypeFilter}
              onChange={(e) => setEdgeTypeFilter(e.target.value as typeof edgeTypeFilter)}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Edge Types</option>
              <option value="collaboration">Collaboration</option>
              <option value="reporting">Reporting</option>
              <option value="informal">Informal</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showInfluencersOnly}
                onChange={(e) => setShowInfluencersOnly(e.target.checked)}
                className="rounded border-slate-600 bg-slate-800 text-indigo-500"
              />
              Influencers only
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showSilosHighlighted}
                onChange={(e) => setShowSilosHighlighted(e.target.checked)}
                className="rounded border-slate-600 bg-slate-800 text-indigo-500"
              />
              Highlight silos
            </label>
          </div>

          {/* Graph Canvas + Sidebar */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            {/* SVG Canvas */}
            <div className="xl:col-span-3 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
              <svg
                width="100%"
                viewBox={`0 0 ${W} ${H}`}
                style={{ display: 'block', minHeight: 340 }}
                onClick={(e) => {
                  if ((e.target as SVGElement).tagName === 'svg') setSelectedNode(null);
                }}
              >
                {/* Edges */}
                <g>
                  {filteredEdges.map((e, i) => {
                    const sp = layout.get(e.source);
                    const tp = layout.get(e.target);
                    if (!sp || !tp) return null;
                    return (
                      <line
                        key={i}
                        x1={sp.x}
                        y1={sp.y}
                        x2={tp.x}
                        y2={tp.y}
                        stroke={getEdgeColor(e.type)}
                        strokeWidth={getEdgeWidth(e.weight)}
                        opacity={getEdgeOpacity(e)}
                        strokeLinecap="round"
                      />
                    );
                  })}
                </g>
                {/* Nodes */}
                <g>
                  {filteredNodes.map((node) => {
                    const pos = layout.get(node.id);
                    if (!pos) return null;
                    return (
                      <NodeCircle
                        key={node.id}
                        node={showSilosHighlighted ? node : { ...node, isSilo: false }}
                        position={pos}
                        isSelected={selectedNode?.id === node.id}
                        isHovered={hoveredNodeId === node.id}
                        connectedNodeIds={connectedNodeIds}
                        allNodesCount={filteredNodes.length}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        onClick={() => setSelectedNode(node.id === selectedNode?.id ? null : node)}
                      />
                    );
                  })}
                </g>
              </svg>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 border-t border-slate-700 bg-slate-800/40">
                <span className="text-slate-500 text-xs font-medium">Edge:</span>
                {[
                  { color: '#475569', label: 'Collaboration' },
                  { color: '#6366f1', label: 'Reporting' },
                  { color: '#f59e0b', label: 'Informal' },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1 text-xs text-slate-400">
                    <svg width={20} height={6}>
                      <line x1={0} y1={3} x2={20} y2={3} stroke={l.color} strokeWidth={2} />
                    </svg>
                    {l.label}
                  </span>
                ))}
                <span className="text-slate-500 text-xs font-medium ml-2">Node:</span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <svg width={14} height={14}>
                    <circle
                      cx={7}
                      cy={7}
                      r={5}
                      fill="transparent"
                      stroke="#94a3b8"
                      strokeWidth={1.5}
                      strokeDasharray="2 2"
                    />
                  </svg>
                  Influencer
                </span>
                {showSilosHighlighted && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <svg width={14} height={14}>
                      <circle
                        cx={7}
                        cy={7}
                        r={5}
                        fill="transparent"
                        stroke="#ef4444"
                        strokeWidth={2}
                      />
                    </svg>
                    Silo node
                  </span>
                )}
                <span className="text-xs text-slate-500 ml-auto">
                  {filteredNodes.length} nodes · {filteredEdges.length} edges
                </span>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-3">
              {/* Selected node card */}
              {selectedNode ? (
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-white font-semibold text-sm">{selectedNode.name}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{selectedNode.title}</div>
                    </div>
                    <button onClick={() => setSelectedNode(null)}>
                      <X className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ background: selectedNode.color }}
                    />
                    <span className="text-xs text-slate-300">{selectedNode.department}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-white">{selectedNode.connections}</div>
                      <div className="text-xs text-slate-500">Connections</div>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-white">
                        {(selectedNode.betweennessCentrality * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-slate-500">Centrality</div>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-white">
                        {(selectedNode.clusteringCoefficient * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-slate-500">Clustering</div>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-2 text-center">
                      <div
                        className={`text-sm font-bold ${selectedNode.isInfluencer ? 'text-violet-400' : 'text-slate-400'}`}
                      >
                        {selectedNode.isInfluencer ? 'Yes' : 'No'}
                      </div>
                      <div className="text-xs text-slate-500">Influencer</div>
                    </div>
                  </div>
                  {selectedNode.isSilo && (
                    <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 rounded-lg p-2">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      Isolated node — low cross-department collaboration
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center text-slate-500 text-xs">
                  <Network className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Click a node to view details
                </div>
              )}

              {/* Dept legend */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-3">
                <div className="text-xs font-medium text-slate-400 mb-2">Departments</div>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries({
                    Engineering: '#3b82f6',
                    Product: '#8b5cf6',
                    Data: '#06b6d4',
                    Sales: '#f59e0b',
                    HR: '#ec4899',
                    Finance: '#10b981',
                    Operations: '#6366f1',
                    Marketing: '#f97316',
                    Design: '#84cc16',
                  }).map(([dept, color]) => (
                    <button
                      key={dept}
                      onClick={() => setDeptFilter(deptFilter === dept ? 'All Departments' : dept)}
                      className={`flex items-center gap-1.5 text-xs rounded px-1.5 py-1 transition-colors ${
                        deptFilter === dept
                          ? 'bg-slate-700 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: color }}
                      />
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Influencers Tab ─────────────────────────────── */}
      {activeTab === 'Influencers' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-violet-400" />
            <span className="text-slate-300 text-sm font-medium">
              {influencers.length} key influencers identified — these individuals have outsized
              network impact.
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {influencers.map((inf) => {
              const node = graph?.nodes.find((n) => n.id === inf.nodeId);
              return (
                <div
                  key={inf.nodeId}
                  className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: node?.color ?? '#6366f1' }}
                      >
                        {inf.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">{inf.name}</div>
                        <div className="text-slate-400 text-xs">{inf.title}</div>
                        <div className="text-slate-500 text-xs">{inf.department}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <InfluencerRiskBadge level={inf.riskLevel} />
                      <InfluenceTypeBadge type={inf.influenceType} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-900 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-white">{inf.connections}</div>
                      <div className="text-xs text-slate-500">Direct links</div>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-violet-400">{inf.reach}</div>
                      <div className="text-xs text-slate-500">2-hop reach</div>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-blue-400">
                        {(inf.betweennessCentrality * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-slate-500">Centrality</div>
                    </div>
                  </div>
                  {/* Centrality bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Betweenness Centrality</span>
                      <span>{(inf.betweennessCentrality * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${inf.betweennessCentrality * 100}%`,
                          background:
                            inf.riskLevel === 'high'
                              ? '#ef4444'
                              : inf.riskLevel === 'medium'
                                ? '#f59e0b'
                                : '#22c55e',
                        }}
                      />
                    </div>
                  </div>
                  {inf.riskLevel === 'high' && (
                    <div className="flex items-start gap-1.5 text-xs text-amber-400 bg-amber-500/10 rounded-lg p-2">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      High departure risk — consider knowledge transfer and succession planning.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Silos Tab ────────────────────────────────────── */}
      {activeTab === 'Silos' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Layers className="w-4 h-4 text-red-400" />
            {silos.length} potential communication silos detected. Silos reduce organizational
            agility.
          </div>
          {silos.map((silo) => (
            <div
              key={silo.id}
              className={`bg-slate-800 rounded-xl border p-5 space-y-4 ${
                silo.riskLevel === 'high' ? 'border-red-500/40' : 'border-amber-500/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">
                      {silo.departments.join(' + ')} Silo
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        silo.riskLevel === 'high'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {silo.riskLevel === 'high' ? 'High Risk' : 'Medium Risk'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">
                    {silo.nodeCount} employees, {silo.externalConnections} external connections
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">{silo.nodeCount}</div>
                  <div className="text-xs text-slate-500">Employees</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-amber-400">
                    {(silo.internalDensity * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-slate-500">Internal density</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-red-400">{silo.externalConnections}</div>
                  <div className="text-xs text-slate-500">Cross-dept links</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5" />
                  Recommendations
                </div>
                <ul className="space-y-1.5">
                  {silo.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Collaboration Tab ────────────────────────────── */}
      {activeTab === 'Collaboration' && (
        <div className="space-y-6">
          {/* Team cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {collaboration.map((c) => (
              <div
                key={c.teamName}
                className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold text-sm">{c.teamName}</div>
                  <span
                    className={`text-xs font-medium ${c.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                  >
                    {c.trend >= 0 ? '+' : ''}
                    {c.trend}%
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                      <span>Internal</span>
                      <span>{c.internalCollaboration}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${c.internalCollaboration}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                      <span>Cross-dept</span>
                      <span>{c.externalCollaboration}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-violet-500"
                        style={{ width: `${c.externalCollaboration}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Top collaborators</div>
                  {c.topCollaborators.map((col) => (
                    <div
                      key={col.departmentId}
                      className="flex items-center justify-between text-xs text-slate-400 py-0.5"
                    >
                      <span>{col.departmentName}</span>
                      <span className="text-slate-300 font-medium">{col.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              Cross-Department Collaboration Matrix
            </h3>
            <CollaborationHeatmap data={collaboration} />
            <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
              <span>Score scale:</span>
              {[
                { color: '#1e293b', label: '0–19' },
                { color: '#93c5fd', label: '20–39' },
                { color: '#3b82f6', label: '40–59' },
                { color: '#2563eb', label: '60–79' },
                { color: '#1d4ed8', label: '80+' },
              ].map((l) => (
                <span key={l.label} className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded"
                    style={{ background: l.color, border: '1px solid #334155' }}
                  />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Network Health Tab ───────────────────────────── */}
      {activeTab === 'Network Health' && health && (
        <div className="space-y-6">
          {/* Score + metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col items-center">
              <HealthGauge score={health.overallScore} />
              <div className="mt-3 grid grid-cols-2 gap-2 w-full">
                <div
                  className={`text-center p-2 rounded-lg ${health.overallScore >= 70 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'} text-xs font-medium`}
                >
                  {health.overallScore >= 70 ? 'Healthy Network' : 'Needs Attention'}
                </div>
                <div
                  className={`text-center p-2 rounded-lg text-xs font-medium ${health.fragility >= 60 ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}
                >
                  Fragility: {health.fragility}%
                </div>
              </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <NetworkMetricCard
                label="Network Density"
                value={(health.density * 100).toFixed(1) + '%'}
                sub="Edges / max possible"
              />
              <NetworkMetricCard
                label="Clustering Coeff."
                value={(health.clusteringCoefficient * 100).toFixed(0) + '%'}
                sub="Local connectivity"
              />
              <NetworkMetricCard
                label="Avg Path Length"
                value={health.avgPathLength}
                sub="Hops between nodes"
              />
              <NetworkMetricCard
                label="Silo Groups"
                value={health.siloCount}
                sub="Isolated clusters"
              />
              <NetworkMetricCard
                label="Key Influencers"
                value={health.influencerCount}
                sub="High-centrality nodes"
              />
              <NetworkMetricCard
                label="Diameter"
                value={graph?.metadata.diameter ?? 0}
                sub="Longest shortest path"
              />
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Network Health Recommendations
            </h3>
            <div className="space-y-2">
              {health.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-900 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-indigo-400 text-xs font-bold">
                    {i + 1}
                  </div>
                  <p className="text-slate-300 text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Info flow analysis */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Information Flow Bottlenecks
            </h3>
            <div className="text-slate-400 text-xs mb-3">
              These employees are information bottlenecks — info must pass through them to reach
              many others.
            </div>
            <div className="space-y-2">
              {influencers.slice(0, 3).map((inf) => (
                <div
                  key={inf.nodeId}
                  className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{
                      background: graph?.nodes.find((n) => n.id === inf.nodeId)?.color ?? '#6366f1',
                    }}
                  >
                    {inf.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{inf.name}</div>
                    <div className="text-slate-500 text-xs">
                      {inf.title} · {inf.department}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 text-sm font-bold">
                      {(inf.betweennessCentrality * 100).toFixed(0)}%
                    </div>
                    <div className="text-slate-500 text-xs">flow load</div>
                  </div>
                  <div className="w-20">
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${inf.betweennessCentrality * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
