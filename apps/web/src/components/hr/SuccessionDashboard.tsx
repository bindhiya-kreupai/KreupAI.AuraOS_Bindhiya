'use client';

import React, { useState, useEffect } from 'react';
import {
  Target,
  AlertTriangle,
  Star,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ChevronRight,
  Plus,
  BarChart3,
  RefreshCw,
  Info,
  Award,
} from 'lucide-react';
import type {
  SuccessionAnalytics,
  KeyPosition,
  ReadinessLevel,
} from '@/services/successionService';
import { SuccessionService } from '@/services/successionService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const READINESS_COLORS: Record<ReadinessLevel, { bg: string; text: string; border: string }> = {
  'Ready Now': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  '1-2 Years': { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300' },
  '3-5 Years': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  'Not Ready': { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
};

const RISK_COLORS = {
  High: 'bg-red-100 text-red-700 border-red-300',
  Medium: 'bg-amber-100 text-amber-700 border-amber-300',
  Low: 'bg-emerald-100 text-emerald-700 border-emerald-300',
};

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Key Position Row
// ---------------------------------------------------------------------------

function KeyPositionRow({ position, onSelect }: { position: KeyPosition; onSelect: () => void }) {
  const riskClass = RISK_COLORS[position.riskLevel];

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-sm transition-all text-left"
    >
      {/* Position info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 text-sm truncate">{position.title}</span>
          {position.criticality === 'Critical' && (
            <Star size={12} className="text-amber-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          {position.department} &bull; {position.grade}
        </p>
        {position.incumbentName ? (
          <p className="text-xs text-slate-500 mt-0.5">Incumbent: {position.incumbentName}</p>
        ) : (
          <p className="text-xs text-rose-500 mt-0.5">Vacant position</p>
        )}
      </div>

      {/* Successors count */}
      <div className="text-center flex-shrink-0">
        <p className="text-xl font-bold text-slate-700">{position.successorCount}</p>
        <p className="text-xs text-slate-400">Successors</p>
      </div>

      {/* Ready Now badge */}
      <div className="flex-shrink-0">
        {position.hasReadyNow ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200">
            <CheckCircle2 size={12} />
            Ready Now
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium border border-slate-200">
            <Clock size={12} />
            No Ready Now
          </span>
        )}
      </div>

      {/* Risk */}
      <div className="flex-shrink-0">
        <span
          className={`inline-block px-2 py-1 rounded-lg text-xs font-medium border ${riskClass}`}
        >
          {position.riskLevel} Risk
        </span>
      </div>

      <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Add Successor Modal
// ---------------------------------------------------------------------------

function AddSuccessorModal({
  positions,
  onClose,
  onAdd,
}: {
  positions: KeyPosition[];
  onClose: () => void;
  onAdd: (positionId: string, candidateId: string, readiness: ReadinessLevel) => Promise<void>;
}) {
  const [positionId, setPositionId] = useState(positions[0]?.id ?? '');
  const [candidateId, _setCandidateId] = useState('cand-001');
  const [readiness, setReadiness] = useState<ReadinessLevel>('1-2 Years');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!positionId || !candidateId) return;
    setSaving(true);
    await onAdd(positionId, candidateId, readiness);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">Add Successor</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Add a candidate to the succession pipeline
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Key Position</label>
            <select
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
            >
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {p.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Successor Readiness
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Ready Now', '1-2 Years', '3-5 Years', 'Not Ready'] as ReadinessLevel[]).map(
                (r) => {
                  const col = READINESS_COLORS[r];
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReadiness(r)}
                      className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        readiness === r
                          ? `${col.bg} ${col.text} ${col.border} ring-2 ring-offset-1 ring-slate-800`
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {r}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Successor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function SuccessionDashboard() {
  const [analytics, setAnalytics] = useState<SuccessionAnalytics | null>(null);
  const [positions, setPositions] = useState<KeyPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'gaps'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [anal, pos] = await Promise.all([
      SuccessionService.getSuccessionAnalytics(),
      SuccessionService.getKeyPositions(),
    ]);
    setAnalytics(anal);
    setPositions(pos);
    setLoading(false);
  }

  const criticalGapPositions = positions.filter((p) => p.successorCount === 0);
  const highRiskPositions = positions.filter((p) => p.riskLevel === 'High');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Succession Planning</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {analytics?.totalKeyPositions} key positions &bull; {analytics?.coverageRate}% coverage
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={16} className="text-slate-500" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            <Plus size={16} />
            Add Successor
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Target size={20} className="text-emerald-600" />}
          label="Coverage Rate"
          value={`${analytics?.coverageRate ?? 0}%`}
          sub={`${analytics?.positionsWithSuccessors} of ${analytics?.totalKeyPositions} positions`}
          color="bg-emerald-100"
        />
        <StatCard
          icon={<CheckCircle2 size={20} className="text-sky-600" />}
          label="Ready Now"
          value={`${analytics?.readyNowRate ?? 0}%`}
          sub={`${analytics?.positionsWithReadyNow} positions covered`}
          color="bg-sky-100"
        />
        <StatCard
          icon={<BarChart3 size={20} className="text-purple-600" />}
          label="Bench Strength"
          value={analytics?.benchStrength ?? 0}
          sub="avg successors per position"
          color="bg-purple-100"
        />
        <StatCard
          icon={<AlertTriangle size={20} className="text-rose-600" />}
          label="Critical Gaps"
          value={analytics?.criticalGaps ?? 0}
          sub="positions with 0 successors"
          color="bg-rose-100"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1">
        {(
          [
            ['overview', 'Overview'],
            ['positions', 'All Positions'],
            ['gaps', 'Critical Gaps'],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-slate-800 text-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
            {tab === 'gaps' && criticalGapPositions.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-rose-100 text-rose-600 text-xs rounded-full">
                {criticalGapPositions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && analytics && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Readiness Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Award size={16} className="text-purple-500" />
              Readiness Distribution
            </h3>
            <div className="space-y-3">
              {analytics.readinessDistribution.map((r) => {
                const col = READINESS_COLORS[r.level];
                return (
                  <div key={r.level}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-medium ${col.text}`}>{r.level}</span>
                      <span className="text-sm font-bold text-slate-700">
                        {r.count}{' '}
                        <span className="text-slate-400 font-normal text-xs">
                          ({r.percentage}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${col.bg.replace('100', '400')}`}
                        style={{ width: `${r.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Coverage */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-sky-500" />
              Department Coverage
            </h3>
            <div className="space-y-3">
              {analytics.departmentCoverage.map((d) => (
                <div key={d.department}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-700">{d.department}</span>
                    <div className="flex items-center gap-2">
                      {d.gap > 0 && (
                        <span className="text-xs text-rose-500">
                          {d.gap} gap{d.gap > 1 ? 's' : ''}
                        </span>
                      )}
                      <span className="text-sm font-bold text-slate-700">{d.coverage}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        d.coverage === 100
                          ? 'bg-emerald-400'
                          : d.coverage >= 60
                            ? 'bg-sky-400'
                            : 'bg-rose-400'
                      }`}
                      style={{ width: `${d.coverage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High Risk Positions */}
          {highRiskPositions.length > 0 && (
            <div className="md:col-span-2 bg-rose-50 border border-rose-200 rounded-xl p-5">
              <h3 className="font-semibold text-rose-800 mb-3 flex items-center gap-2">
                <ShieldAlert size={16} className="text-rose-600" />
                High Risk — Positions Requiring Immediate Action
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {highRiskPositions.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl border border-rose-200 p-3">
                    <p className="font-semibold text-slate-800 text-sm">{p.title}</p>
                    <p className="text-xs text-slate-500">{p.department}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {p.successorCount === 0 ? (
                        <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full border border-rose-200">
                          No successors
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full border border-amber-200">
                          No Ready Now
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{p.criticality}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'positions' && (
        <div className="space-y-3">
          {positions.map((p) => (
            <KeyPositionRow key={p.id} position={p} onSelect={() => {}} />
          ))}
        </div>
      )}

      {activeTab === 'gaps' && (
        <div className="space-y-4">
          {criticalGapPositions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-2" />
              <p className="text-slate-600 font-medium">
                All key positions have at least one successor
              </p>
              <p className="text-slate-400 text-sm mt-1">Succession coverage is complete.</p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                <p>
                  The following {criticalGapPositions.length} critical/key positions have no
                  succession candidates. Immediate action is required to address
                  single-point-of-failure risk.
                </p>
              </div>
              {criticalGapPositions.map((p) => (
                <div key={p.id} className="bg-white border border-rose-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{p.title}</p>
                      <p className="text-sm text-slate-500">
                        {p.department} &bull; {p.grade}
                      </p>
                      {p.incumbentName ? (
                        <p className="text-sm text-slate-600 mt-1">Incumbent: {p.incumbentName}</p>
                      ) : (
                        <p className="text-sm text-rose-500 mt-1">Position is vacant</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium border ${RISK_COLORS[p.riskLevel]}`}
                      >
                        {p.riskLevel} Risk
                      </span>
                      <span className="text-xs text-slate-400">{p.criticality} position</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors"
                    >
                      <Plus size={12} />
                      Add Successor
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Info */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
        <Info size={14} className="mt-0.5 flex-shrink-0" />
        <p>
          Succession plans are reviewed semi-annually. Use the 9-Box Grid to identify and calibrate
          high-potential candidates. Retention risk employees in the pipeline require proactive
          engagement.
        </p>
      </div>

      {/* Add Successor Modal */}
      {showAddModal && (
        <AddSuccessorModal
          positions={positions}
          onClose={() => setShowAddModal(false)}
          onAdd={async (posId, candId, readiness) => {
            await SuccessionService.addSuccessor(posId, candId, readiness);
            await loadData();
          }}
        />
      )}
    </div>
  );
}
