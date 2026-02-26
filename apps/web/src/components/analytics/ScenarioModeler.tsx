/**
 * @module ScenarioModeler
 * @description People Scenario Modeler — scenario builder, impact preview,
 *              side-by-side comparison, sensitivity slider, 12-month projection (Sec 23.3)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Play, Save, BarChart3, RefreshCw, Zap } from 'lucide-react';
import {
  PeopleModelingService,
  type SavedScenario,
  type ScenarioImpact,
  type ScenarioParams,
  type ScenarioType,
  type DepartmentChange,
} from '@/services/peopleModelingService';

// ── Scenario Type Config ──────────────────────────────────────────────────────

const SCENARIO_TYPES: Record<ScenarioType, { label: string; emoji: string; color: string }> = {
  hiring_plan: { label: 'Hiring Plan', emoji: '👥', color: 'bg-blue-100 text-blue-700' },
  salary_revision: { label: 'Salary Revision', emoji: '💰', color: 'bg-green-100 text-green-700' },
  benefits_change: {
    label: 'Benefits Change',
    emoji: '🏥',
    color: 'bg-purple-100 text-purple-700',
  },
  restructuring: { label: 'Restructuring', emoji: '🔄', color: 'bg-amber-100 text-amber-700' },
  attrition: { label: 'Attrition Modeling', emoji: '📉', color: 'bg-red-100 text-red-700' },
};

const STATUS_CONFIG = {
  draft: { cls: 'bg-gray-100 text-gray-500', label: 'Draft' },
  submitted: { cls: 'bg-yellow-100 text-yellow-700', label: 'Submitted' },
  approved: { cls: 'bg-green-100 text-green-700', label: 'Approved' },
  rejected: { cls: 'bg-red-100 text-red-600', label: 'Rejected' },
};

// ── Impact Metrics ────────────────────────────────────────────────────────────

function ImpactMetrics({ impact }: { impact: ScenarioImpact }) {
  const metrics = [
    {
      label: 'Annual Cost Impact',
      value: `$${(impact.totalCostImpact / 1000).toFixed(0)}K`,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
    },
    {
      label: 'Monthly Cost',
      value: `$${(impact.monthlyCostImpact / 1000).toFixed(0)}K`,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Headcount Change',
      value:
        impact.headcountChange > 0 ? `+${impact.headcountChange}` : `${impact.headcountChange}`,
      color: impact.headcountChange >= 0 ? 'text-green-700' : 'text-red-600',
      bg: impact.headcountChange >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      label: 'New Headcount',
      value: impact.newHeadcount,
      color: 'text-gray-700',
      bg: 'bg-gray-50',
    },
    {
      label: 'Productivity Impact',
      value: `${impact.productivityImpactPct >= 0 ? '+' : ''}${impact.productivityImpactPct.toFixed(1)}%`,
      color: impact.productivityImpactPct >= 0 ? 'text-green-700' : 'text-red-600',
      bg: 'bg-gray-50',
    },
    {
      label: 'Retention Impact',
      value: `${impact.retentionImpactPct >= 0 ? '+' : ''}${impact.retentionImpactPct.toFixed(1)}%`,
      color: impact.retentionImpactPct >= 0 ? 'text-green-700' : 'text-red-600',
      bg: 'bg-gray-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {metrics.map((m) => (
        <div key={m.label} className={`p-3 rounded-xl ${m.bg} text-center`}>
          <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Timeline Chart ────────────────────────────────────────────────────────────

function TimelineChart({ timeline }: { timeline: ScenarioImpact['timelineProjection'] }) {
  if (!timeline.length) return null;
  const maxCost = Math.max(...timeline.map((t) => t.cumulativeCost));
  const maxHC = Math.max(...timeline.map((t) => t.headcount));
  const minHC = Math.min(...timeline.map((t) => t.headcount));
  const n = timeline.length;
  const W = 500;
  const H = 130;
  const padL = 55;
  const padR = 20;
  const padT = 15;
  const padB = 25;
  const cW = W - padL - padR;
  const cH = H - padT - padB;

  const toX = (i: number) => padL + (i / Math.max(n - 1, 1)) * cW;
  const toCostY = (v: number) => padT + cH - (v / (maxCost * 1.1)) * cH;
  const toHCY = (v: number) => padT + cH - ((v - minHC * 0.9) / (maxHC * 1.05 - minHC * 0.9)) * cH;

  const costPath = timeline
    .map((t, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toCostY(t.cumulativeCost)}`)
    .join(' ');
  const hcPath = timeline
    .map((t, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toHCY(t.headcount)}`)
    .join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = padT + cH - f * cH;
          return (
            <g key={f}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f3f4f6" strokeWidth={0.5} />
              <text x={padL - 4} y={y + 3} textAnchor="end" fontSize={7} fill="#9ca3af">
                ${((maxCost * 1.1 * f) / 1000).toFixed(0)}K
              </text>
            </g>
          );
        })}
        <path d={costPath} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinejoin="round" />
        <path
          d={hcPath}
          fill="none"
          stroke="#10b981"
          strokeWidth={2}
          strokeDasharray="4,2"
          strokeLinejoin="round"
        />
        {timeline.map(
          (t, i) =>
            i % Math.max(1, Math.floor(n / 6)) === 0 && (
              <text
                key={i}
                x={toX(i)}
                y={H - padB + 12}
                textAnchor="middle"
                fontSize={7}
                fill="#9ca3af"
              >
                {t.month}
              </text>
            )
        )}
      </svg>
      <div className="flex items-center gap-4 text-xs mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-blue-500" /> Cumulative Cost
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 border-t-2 border-dashed border-green-500" /> Headcount
        </div>
      </div>
    </div>
  );
}

// ── Scenario Builder Form ─────────────────────────────────────────────────────

const DEFAULT_DEPT_CHANGES: DepartmentChange[] = [
  {
    departmentId: 'dept-eng',
    departmentName: 'Engineering',
    currentHeadcount: 89,
    headcountChange: 0,
  },
  {
    departmentId: 'dept-prod',
    departmentName: 'Product',
    currentHeadcount: 32,
    headcountChange: 0,
  },
  { departmentId: 'dept-sales', departmentName: 'Sales', currentHeadcount: 48, headcountChange: 0 },
  { departmentId: 'dept-data', departmentName: 'Data', currentHeadcount: 24, headcountChange: 0 },
  { departmentId: 'dept-hr', departmentName: 'HR', currentHeadcount: 22, headcountChange: 0 },
];

function ScenarioBuilder({
  onRun,
}: {
  onRun: (params: ScenarioParams, impact: ScenarioImpact) => void;
}) {
  const [type, setType] = useState<ScenarioType>('hiring_plan');
  const [name, setName] = useState('');
  const [deptChanges, setDeptChanges] = useState<DepartmentChange[]>(DEFAULT_DEPT_CHANGES);
  const [globalSalary, setGlobalSalary] = useState(8);
  const [sensitivityParam, setSensitivityParam] = useState(0);
  const [running, setRunning] = useState(false);

  const updateHC = (deptId: string, change: number) => {
    setDeptChanges((prev) =>
      prev.map((d) => (d.departmentId === deptId ? { ...d, headcountChange: change } : d))
    );
  };

  const handleRun = async () => {
    setRunning(true);
    const params: ScenarioParams = {
      name: name || `${SCENARIO_TYPES[type].label} Scenario`,
      type,
      effectiveDate: '2026-04-01',
      duration: 12,
      departmentChanges: deptChanges.filter((d) => d.headcountChange !== 0),
      globalSalaryIncreasePct: type === 'salary_revision' ? globalSalary : undefined,
    };
    const impact = await PeopleModelingService.runScenario(params);
    setRunning(false);
    onRun(params, impact);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-5 gap-2">
        {(
          Object.entries(SCENARIO_TYPES) as [
            ScenarioType,
            { label: string; emoji: string; color: string },
          ][]
        ).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setType(key)}
            className={`p-3 rounded-xl border-2 text-center transition-all ${type === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="text-xl mb-1">{cfg.emoji}</div>
            <p className="text-xs font-medium text-gray-700">{cfg.label}</p>
          </button>
        ))}
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={`${SCENARIO_TYPES[type].label} — Q2 2026`}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100"
      />

      {type === 'hiring_plan' || type === 'restructuring' ? (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Headcount Changes by Department
          </h4>
          <div className="space-y-2">
            {deptChanges.map((dept) => (
              <div
                key={dept.departmentId}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-700 w-28">{dept.departmentName}</span>
                <span className="text-xs text-gray-400">{dept.currentHeadcount} current</span>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => updateHC(dept.departmentId, dept.headcountChange - 1)}
                    className="w-7 h-7 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-bold"
                  >
                    −
                  </button>
                  <span
                    className={`w-8 text-center font-bold text-sm ${dept.headcountChange > 0 ? 'text-green-600' : dept.headcountChange < 0 ? 'text-red-600' : 'text-gray-400'}`}
                  >
                    {dept.headcountChange > 0 ? '+' : ''}
                    {dept.headcountChange}
                  </span>
                  <button
                    onClick={() => updateHC(dept.departmentId, dept.headcountChange + 1)}
                    className="w-7 h-7 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : type === 'salary_revision' ? (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700">Global Salary Increase</h4>
            <span className="text-2xl font-bold text-green-600">{globalSalary}%</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            value={globalSalary}
            onChange={(e) => setGlobalSalary(Number(e.target.value))}
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>1%</span>
            <span>10%</span>
            <span>20%</span>
          </div>
        </div>
      ) : null}

      {/* Sensitivity Slider */}
      <div className="p-4 bg-blue-50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-blue-800">Sensitivity Analysis</h4>
          <span className="text-sm font-bold text-blue-700">
            ×{(1 + sensitivityParam / 100).toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={-50}
          max={50}
          value={sensitivityParam}
          onChange={(e) => setSensitivityParam(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
        <p className="text-xs text-blue-600 mt-1">
          Vary base cost by {sensitivityParam >= 0 ? '+' : ''}
          {sensitivityParam}% to see impact range
        </p>
      </div>

      <button
        onClick={handleRun}
        disabled={running}
        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {running ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
        {running ? 'Running Scenario...' : 'Run Scenario'}
      </button>
    </div>
  );
}

// ── Scenario Comparison ───────────────────────────────────────────────────────

function ScenarioCompare({ scenarios }: { scenarios: SavedScenario[] }) {
  const [selected, setSelected] = useState<string[]>(scenarios.slice(0, 2).map((s) => s.id));
  const toCompare = scenarios.filter((s) => selected.includes(s.id));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {scenarios.map((s) => {
          const cfg = SCENARIO_TYPES[s.type];
          return (
            <button
              key={s.id}
              onClick={() =>
                setSelected((prev) =>
                  prev.includes(s.id)
                    ? prev.filter((id) => id !== s.id)
                    : prev.length < 3
                      ? [...prev, s.id]
                      : prev
                )
              }
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${selected.includes(s.id) ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {cfg.emoji} {s.name}
            </button>
          );
        })}
      </div>
      {toCompare.length >= 2 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left text-xs font-semibold text-gray-500">Metric</th>
                {toCompare.map((s) => (
                  <th key={s.id} className="p-3 text-center text-xs font-semibold text-gray-700">
                    <div>
                      {SCENARIO_TYPES[s.type].emoji} {s.name.slice(0, 20)}…
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs ${STATUS_CONFIG[s.status].cls}`}
                    >
                      {STATUS_CONFIG[s.status].label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: 'Annual Cost',
                  key: (s: SavedScenario) => `$${(s.impact.totalCostImpact / 1000).toFixed(0)}K`,
                  better: 'lower',
                },
                {
                  label: 'Headcount Change',
                  key: (s: SavedScenario) =>
                    `${s.impact.headcountChange >= 0 ? '+' : ''}${s.impact.headcountChange}`,
                  better: 'neutral',
                },
                {
                  label: 'Productivity Impact',
                  key: (s: SavedScenario) =>
                    `${s.impact.productivityImpactPct >= 0 ? '+' : ''}${s.impact.productivityImpactPct.toFixed(1)}%`,
                  better: 'higher',
                },
                {
                  label: 'Retention Impact',
                  key: (s: SavedScenario) =>
                    `${s.impact.retentionImpactPct >= 0 ? '+' : ''}${s.impact.retentionImpactPct.toFixed(1)}%`,
                  better: 'higher',
                },
                {
                  label: 'Break-Even',
                  key: (s: SavedScenario) => `${s.impact.breakEvenMonths} months`,
                  better: 'lower',
                },
                {
                  label: 'Recruitment Cost',
                  key: (s: SavedScenario) => `$${(s.impact.recruitmentCost / 1000).toFixed(0)}K`,
                  better: 'lower',
                },
              ].map((row) => (
                <tr key={row.label} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-3 text-gray-600 text-xs">{row.label}</td>
                  {toCompare.map((s) => (
                    <td key={s.id} className="p-3 text-center text-xs font-medium text-gray-800">
                      {row.key(s)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type TabType = 'builder' | 'saved' | 'compare';

export default function ScenarioModeler() {
  const [activeTab, setActiveTab] = useState<TabType>('builder');
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [runResult, setRunResult] = useState<{
    params: ScenarioParams;
    impact: ScenarioImpact;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    PeopleModelingService.getScenarios().then((s) => {
      setScenarios(s);
      setLoading(false);
    });
  }, []);

  const handleRun = (params: ScenarioParams, impact: ScenarioImpact) => {
    setRunResult({ params, impact });
  };

  const handleSave = async () => {
    if (!runResult) return;
    setSaving(true);
    const saved = await PeopleModelingService.saveScenario(runResult.params, runResult.impact);
    setScenarios((prev) => [saved, ...prev]);
    setSaving(false);
  };

  const TABS = [
    { id: 'builder' as TabType, label: 'Scenario Builder', icon: <Play size={14} /> },
    {
      id: 'saved' as TabType,
      label: `Saved Scenarios (${scenarios.length})`,
      icon: <BarChart3 size={14} />,
    },
    { id: 'compare' as TabType, label: 'Compare', icon: <Zap size={14} /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">People Scenario Modeler</h1>
        <p className="text-sm text-gray-500 mt-1">
          Model workforce changes and forecast cost, productivity, and retention impact
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {activeTab === 'builder' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Configure Scenario</h4>
                <ScenarioBuilder onRun={handleRun} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Impact Preview</h4>
                {runResult ? (
                  <div className="space-y-4">
                    <ImpactMetrics impact={runResult.impact} />
                    <div>
                      <h5 className="text-xs font-semibold text-gray-600 mb-2">
                        12-Month Projection
                      </h5>
                      <TimelineChart timeline={runResult.impact.timelineProjection} />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {saving ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )}
                        Save Scenario
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-300 flex-col gap-2">
                    <Play size={32} />
                    <p className="text-sm">Configure and run a scenario to see impact</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="space-y-3">
              {scenarios.map((s) => {
                const cfg = SCENARIO_TYPES[s.type];
                const sc = STATUS_CONFIG[s.status];
                return (
                  <div
                    key={s.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-200 transition-all"
                  >
                    <div className="text-2xl">{cfg.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{s.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>
                          Cost:{' '}
                          <span className="font-semibold text-blue-600">
                            ${(s.impact.totalCostImpact / 1000).toFixed(0)}K
                          </span>
                        </span>
                        <span>
                          HC:{' '}
                          <span className="font-semibold">
                            {s.impact.headcountChange >= 0 ? '+' : ''}
                            {s.impact.headcountChange}
                          </span>
                        </span>
                        <span>
                          Retention:{' '}
                          <span
                            className={`font-semibold ${s.impact.retentionImpactPct >= 0 ? 'text-green-600' : 'text-red-500'}`}
                          >
                            {s.impact.retentionImpactPct >= 0 ? '+' : ''}
                            {s.impact.retentionImpactPct.toFixed(0)}%
                          </span>
                        </span>
                        <span>Break-even: {s.impact.breakEvenMonths}mo</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 text-right flex-shrink-0">
                      <p>By {s.createdBy}</p>
                      <p>{s.lastModified}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'compare' && (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Select 2-3 scenarios to compare side-by-side
              </p>
              <ScenarioCompare scenarios={scenarios} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
