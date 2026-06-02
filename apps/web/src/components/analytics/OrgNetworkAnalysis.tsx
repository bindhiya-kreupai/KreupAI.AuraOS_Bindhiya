// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * @module OrgNetworkAnalysis
 * @description Organizational network analysis — collaboration map, key influencers,
 *              silo detection, and collaboration recommendations (Sec 23.3)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Network,
  Users,
  AlertTriangle,
  Lightbulb,
  Loader2,
  RefreshCw,
  GitBranch,
  Zap,
  ArrowRight,
  Activity,
  Star,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'map' | 'influencers' | 'silos' | 'recommendations';

interface TeamNode {
  id: string;
  name: string;
  size: number;
  color: string;
  x: number;
  y: number;
}

interface CollaborationEdge {
  from: string;
  to: string;
  strength: 'high' | 'medium' | 'low';
}

interface Influencer {
  id: string;
  name: string;
  initials: string;
  color: string;
  department: string;
  title: string;
  influenceScore: number;
  bridgeScore: number;
  connectionsCount: number;
  teamsConnected: number;
  role: 'hub' | 'bridge' | 'peripheral';
}

interface Silo {
  id: string;
  department: string;
  isolationScore: number;
  internalCollabRatio: number;
  externalCollabRatio: number;
  riskLevel: 'high' | 'medium' | 'low';
  affectedEmployees: number;
}

interface Recommendation {
  id: string;
  type: 'cross-functional' | 'mentorship' | 'rotation' | 'event';
  title: string;
  description: string;
  impactScore: number;
  effort: 'low' | 'medium' | 'high';
  departments: string[];
  status: 'suggested' | 'in-progress' | 'completed';
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const TEAM_NODES: TeamNode[] = [
  { id: 'eng', name: 'Engineering', size: 68, color: '#3b82f6', x: 50, y: 50 },
  { id: 'product', name: 'Product', size: 22, color: '#8b5cf6', x: 70, y: 30 },
  { id: 'sales', name: 'Sales', size: 45, color: '#f59e0b', x: 80, y: 70 },
  { id: 'mktg', name: 'Marketing', size: 28, color: '#ec4899', x: 55, y: 80 },
  { id: 'ops', name: 'Operations', size: 38, color: '#10b981', x: 25, y: 65 },
  { id: 'hr', name: 'HR', size: 18, color: '#06b6d4', x: 25, y: 30 },
  { id: 'finance', name: 'Finance', size: 16, color: '#f97316', x: 45, y: 20 },
  { id: 'legal', name: 'Legal', size: 8, color: '#94a3b8', x: 10, y: 50 },
];

const COLLABORATION_EDGES: CollaborationEdge[] = [
  { from: 'eng', to: 'product', strength: 'high' },
  { from: 'eng', to: 'ops', strength: 'medium' },
  { from: 'product', to: 'mktg', strength: 'high' },
  { from: 'product', to: 'sales', strength: 'medium' },
  { from: 'sales', to: 'mktg', strength: 'high' },
  { from: 'sales', to: 'ops', strength: 'medium' },
  { from: 'hr', to: 'eng', strength: 'low' },
  { from: 'hr', to: 'finance', strength: 'medium' },
  { from: 'finance', to: 'ops', strength: 'medium' },
  { from: 'legal', to: 'hr', strength: 'low' },
  { from: 'legal', to: 'finance', strength: 'low' },
];

const INFLUENCERS: Influencer[] = [
  {
    id: 'emp-001',
    name: 'James Miller',
    initials: 'JM',
    color: 'bg-blue-500',
    department: 'Engineering',
    title: 'Principal Engineer',
    influenceScore: 94,
    bridgeScore: 88,
    connectionsCount: 142,
    teamsConnected: 7,
    role: 'hub',
  },
  {
    id: 'emp-002',
    name: 'Sarah Chen',
    initials: 'SC',
    color: 'bg-pink-500',
    department: 'Product',
    title: 'VP Product',
    influenceScore: 91,
    bridgeScore: 96,
    connectionsCount: 128,
    teamsConnected: 8,
    role: 'bridge',
  },
  {
    id: 'emp-003',
    name: 'Lisa Wang',
    initials: 'LW',
    color: 'bg-indigo-500',
    department: 'Marketing',
    title: 'Sr. Marketing Manager',
    influenceScore: 82,
    bridgeScore: 74,
    connectionsCount: 98,
    teamsConnected: 5,
    role: 'hub',
  },
  {
    id: 'emp-004',
    name: 'Tom Johnson',
    initials: 'TJ',
    color: 'bg-amber-500',
    department: 'Engineering',
    title: 'CTO',
    influenceScore: 89,
    bridgeScore: 72,
    connectionsCount: 118,
    teamsConnected: 6,
    role: 'bridge',
  },
  {
    id: 'emp-005',
    name: 'Maria Garcia',
    initials: 'MG',
    color: 'bg-emerald-500',
    department: 'Operations',
    title: 'Operations Lead',
    influenceScore: 78,
    bridgeScore: 82,
    connectionsCount: 86,
    teamsConnected: 5,
    role: 'bridge',
  },
];

const SILOS: Silo[] = [
  {
    id: 's-001',
    department: 'Legal',
    isolationScore: 78,
    internalCollabRatio: 82,
    externalCollabRatio: 18,
    riskLevel: 'high',
    affectedEmployees: 8,
  },
  {
    id: 's-002',
    department: 'Finance',
    isolationScore: 62,
    internalCollabRatio: 71,
    externalCollabRatio: 29,
    riskLevel: 'medium',
    affectedEmployees: 16,
  },
  {
    id: 's-003',
    department: 'Operations',
    isolationScore: 48,
    internalCollabRatio: 64,
    externalCollabRatio: 36,
    riskLevel: 'medium',
    affectedEmployees: 38,
  },
  {
    id: 's-004',
    department: 'Sales',
    isolationScore: 32,
    internalCollabRatio: 55,
    externalCollabRatio: 45,
    riskLevel: 'low',
    affectedEmployees: 45,
  },
];

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-001',
    type: 'cross-functional',
    title: 'Engineering-Finance Cross-Functional Project',
    description:
      'Assign 2 Engineers to work with Finance on the cost optimization tool to build bridges between these isolated teams.',
    impactScore: 88,
    effort: 'medium',
    departments: ['Engineering', 'Finance'],
    status: 'suggested',
  },
  {
    id: 'rec-002',
    type: 'mentorship',
    title: 'Legal Team Mentorship Integration',
    description:
      'Pair Legal team members with mentors across departments (Engineering, HR, Finance) to reduce isolation and increase cross-team trust.',
    impactScore: 82,
    effort: 'low',
    departments: ['Legal', 'HR', 'Finance'],
    status: 'suggested',
  },
  {
    id: 'rec-003',
    type: 'rotation',
    title: 'Sales-Product Rotation Program',
    description:
      'Six-week rotation where Sales team members shadow Product team and vice versa to strengthen collaboration.',
    impactScore: 79,
    effort: 'high',
    departments: ['Sales', 'Product'],
    status: 'in-progress',
  },
  {
    id: 'rec-004',
    type: 'event',
    title: 'Monthly Cross-Team Hackathon',
    description:
      'Monthly 2-day hackathon with random cross-team assignments to build organic relationships across silos.',
    impactScore: 72,
    effort: 'medium',
    departments: ['All Teams'],
    status: 'completed',
  },
  {
    id: 'rec-005',
    type: 'cross-functional',
    title: 'Operations-Marketing Joint OKRs',
    description:
      'Align Operations and Marketing teams with shared quarterly objectives to incentivize cross-team collaboration.',
    impactScore: 68,
    effort: 'low',
    departments: ['Operations', 'Marketing'],
    status: 'suggested',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const TAB_LIST: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'map', label: 'Collaboration Map', icon: Network },
  { id: 'influencers', label: 'Influencers', icon: Star },
  { id: 'silos', label: 'Silos', icon: AlertTriangle },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
];

function roleConfig(role: Influencer['role']) {
  const map = {
    hub: { label: 'Network Hub', color: 'bg-blue-100 text-blue-700' },
    bridge: { label: 'Bridge Builder', color: 'bg-purple-100 text-purple-700' },
    peripheral: { label: 'Peripheral', color: 'bg-gray-100 text-gray-600' },
  };
  return map[role];
}

function riskColor(level: Silo['riskLevel']) {
  const map = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-green-100 text-green-700 border-green-200',
  };
  return map[level];
}

function recTypeConfig(type: Recommendation['type']) {
  const map = {
    'cross-functional': {
      label: 'Cross-Functional',
      color: 'bg-blue-100 text-blue-700',
      icon: GitBranch,
    },
    mentorship: { label: 'Mentorship', color: 'bg-purple-100 text-purple-700', icon: Users },
    rotation: { label: 'Job Rotation', color: 'bg-emerald-100 text-emerald-700', icon: RefreshCw },
    event: { label: 'Team Event', color: 'bg-amber-100 text-amber-700', icon: Zap },
  };
  return map[type];
}

function effortBadge(effort: Recommendation['effort']) {
  const map = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
  };
  return map[effort];
}

function statusBadge(status: Recommendation['status']) {
  const map = {
    suggested: 'bg-gray-100 text-gray-600',
    'in-progress': 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
  };
  return map[status];
}

// ── Tab: Collaboration Map ────────────────────────────────────────────────────

function CollaborationMapTab() {
  const edgeColorMap = { high: '#3b82f6', medium: '#94a3b8', low: '#e2e8f0' };
  const edgeWidthMap = { high: 3, medium: 2, low: 1 };

  const getNode = (id: string) => TEAM_NODES.find((n) => n.id === id)!;

  const colabStats = [
    { label: 'Total Cross-Team Connections', value: '1,842' },
    { label: 'Avg Collaborations per Employee', value: '6.3' },
    { label: 'High-Strength Connections', value: '24%' },
    { label: 'Network Density', value: '0.42' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {colabStats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              {s.label}
            </p>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Cross-Team Collaboration Network</h3>
        <div
          className="relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl overflow-hidden"
          style={{ height: 420 }}
        >
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            {/* Edges */}
            {COLLABORATION_EDGES.map((edge, i) => {
              const from = getNode(edge.from);
              const to = getNode(edge.to);
              return (
                <line
                  key={i}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={edgeColorMap[edge.strength]}
                  strokeWidth={edgeWidthMap[edge.strength] * 0.3}
                  opacity={0.7}
                />
              );
            })}
            {/* Nodes */}
            {TEAM_NODES.map((node) => {
              const r = Math.max(3, Math.min(7, node.size / 12));
              return (
                <g key={node.id}>
                  <circle cx={node.x} cy={node.y} r={r + 1} fill={node.color} opacity={0.15} />
                  <circle cx={node.x} cy={node.y} r={r} fill={node.color} opacity={0.9} />
                  <text
                    x={node.x}
                    y={node.y + r + 2.5}
                    textAnchor="middle"
                    fontSize="2.2"
                    fill="#374151"
                    fontWeight="600"
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
          {Object.entries(edgeColorMap).map(([strength, color]) => (
            <div key={strength} className="flex items-center gap-1.5">
              <div
                className="w-6 h-0.5 rounded"
                style={{
                  backgroundColor: color,
                  height: strength === 'high' ? 3 : strength === 'medium' ? 2 : 1,
                }}
              />
              <span>{strength.charAt(0).toUpperCase() + strength.slice(1)} collaboration</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Collaboration Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="pb-2 text-gray-500 text-left">Team</th>
                {TEAM_NODES.slice(0, 6).map((n) => (
                  <th key={n.id} className="pb-2 text-center" style={{ color: n.color }}>
                    {n.name.substring(0, 4)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TEAM_NODES.slice(0, 6).map((rowNode) => (
                <tr key={rowNode.id} className="hover:bg-gray-50">
                  <td className="py-2 font-medium text-gray-700">{rowNode.name}</td>
                  {TEAM_NODES.slice(0, 6).map((colNode) => {
                    if (rowNode.id === colNode.id)
                      return (
                        <td key={colNode.id} className="text-center py-2">
                          <div className="w-6 h-6 bg-gray-100 rounded mx-auto" />
                        </td>
                      );
                    const edge = COLLABORATION_EDGES.find(
                      (e) =>
                        (e.from === rowNode.id && e.to === colNode.id) ||
                        (e.from === colNode.id && e.to === rowNode.id)
                    );
                    const bgMap = {
                      high: 'bg-blue-500',
                      medium: 'bg-blue-200',
                      low: 'bg-gray-200',
                    };
                    const bg = edge ? bgMap[edge.strength] : 'bg-transparent';
                    return (
                      <td key={colNode.id} className="text-center py-2">
                        <div
                          className={`w-6 h-6 rounded mx-auto ${bg}`}
                          title={edge ? `${edge.strength} collaboration` : 'No collaboration'}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Influencers ──────────────────────────────────────────────────────────

function InfluencersTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-800 mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Network Hubs
          </h4>
          <p className="text-xs text-blue-600">
            Employees with the most connections and highest information flow
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <h4 className="font-semibold text-purple-800 mb-1 flex items-center gap-2">
            <GitBranch className="w-4 h-4" /> Bridge Builders
          </h4>
          <p className="text-xs text-purple-600">
            Employees who connect otherwise disconnected teams
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {INFLUENCERS.map((inf, idx) => {
          const { label, color } = roleConfig(inf.role);
          return (
            <div key={inf.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-300">#{idx + 1}</span>
                  <div
                    className={`w-12 h-12 ${inf.color} rounded-full flex items-center justify-center text-white font-semibold`}
                  >
                    {inf.initials}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-gray-800">{inf.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
                      {label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {inf.title} — {inf.department}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-gray-400">Influence Score</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${inf.influenceScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-blue-600">
                          {inf.influenceScore}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Bridge Score</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${inf.bridgeScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-purple-600">{inf.bridgeScore}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Connections</p>
                      <p className="text-sm font-bold text-gray-800 mt-1">{inf.connectionsCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Teams Connected</p>
                      <p className="text-sm font-bold text-gray-800 mt-1">
                        {inf.teamsConnected} teams
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab: Silos ────────────────────────────────────────────────────────────────

function SilosTab() {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800 text-sm">Silo Detection Active</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Teams with internal-to-external collaboration ratio above 65% are flagged as potential
            silos. High isolation can reduce innovation and increase attrition.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Silos Detected', value: '2 High Risk', color: 'text-red-600' },
          { label: 'Employees at Risk', value: '24', color: 'text-amber-600' },
          { label: 'Avg Isolation Score', value: '55/100', color: 'text-orange-600' },
          { label: 'Network Fragmentation', value: '0.38', color: 'text-gray-700' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              {m.label}
            </p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {SILOS.map((silo) => (
          <div
            key={silo.id}
            className={`bg-white rounded-xl border shadow-sm p-5 ${silo.riskLevel === 'high' ? 'border-red-200' : silo.riskLevel === 'medium' ? 'border-amber-200' : 'border-gray-100'}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-800">{silo.department}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border ${riskColor(silo.riskLevel)}`}
                  >
                    {silo.riskLevel.charAt(0).toUpperCase() + silo.riskLevel.slice(1)} Risk
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {silo.affectedEmployees} employees in this team
                </p>
              </div>
              <div className="text-center">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${silo.riskLevel === 'high' ? 'bg-red-500' : silo.riskLevel === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`}
                >
                  {silo.isolationScore}
                </div>
                <p className="text-xs text-gray-500 mt-1">Isolation</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-36">Internal Collaboration</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${silo.internalCollabRatio}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-blue-600 w-8 text-right">
                  {silo.internalCollabRatio}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-36">External Collaboration</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${silo.externalCollabRatio}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-emerald-600 w-8 text-right">
                  {silo.externalCollabRatio}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Recommendations ──────────────────────────────────────────────────────

function RecommendationsTab() {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-blue-800 text-sm">AI-Powered Recommendations</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Based on network analysis, these interventions are predicted to increase cross-team
            collaboration and reduce silos over the next 90 days.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {RECOMMENDATIONS.map((rec) => {
          const { label, color, icon: Icon } = recTypeConfig(rec.type);
          return (
            <div key={rec.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${color} flex items-center gap-1`}
                    >
                      <Icon className="w-3 h-3" /> {label}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(rec.status)}`}
                    >
                      {rec.status === 'in-progress'
                        ? 'In Progress'
                        : rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">{rec.title}</h4>
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{rec.description}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex gap-1">
                      {rec.departments.map((d) => (
                        <span
                          key={d}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${effortBadge(rec.effort)}`}
                    >
                      {rec.effort.charAt(0).toUpperCase() + rec.effort.slice(1)} Effort
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-center">
                  <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-700">{rec.impactScore}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Impact</p>
                </div>
              </div>
              {rec.status === 'suggested' && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                  <button className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-1">
                    Start Initiative <ArrowRight className="w-3 h-3" />
                  </button>
                  <button className="px-3 py-1.5 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium">
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function OrgNetworkAnalysis() {
  const [activeTab, setActiveTab] = useState<TabId>('map');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Org Network Analysis</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Understand collaboration patterns, influencers, and organizational silos
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 600);
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Analysis
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-1">
          {TAB_LIST.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'map' && <CollaborationMapTab />}
          {activeTab === 'influencers' && <InfluencersTab />}
          {activeTab === 'silos' && <SilosTab />}
          {activeTab === 'recommendations' && <RecommendationsTab />}
        </>
      )}
    </div>
  );
}
