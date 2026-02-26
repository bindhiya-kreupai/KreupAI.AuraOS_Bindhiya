'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Target,
  AlertTriangle,
  TrendingUp,
  Star,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus,
  RefreshCw,
  Award,
  Calendar,
} from 'lucide-react';
import type {
  SuccessionAnalytics,
  KeyPosition,
  SuccessionCandidate,
  SuccessionPlan,
  DevelopmentPlan,
  TalentReview,
  ReadinessLevel,
} from '@/services/successionService';
import { SuccessionService } from '@/services/successionService';

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = 'key-positions' | '9-box' | 'pipeline' | 'development' | 'talent-review';

interface DashboardState {
  analytics: SuccessionAnalytics | null;
  keyPositions: KeyPosition[];
  candidates: SuccessionCandidate[];
  plans: SuccessionPlan[];
  developmentPlans: DevelopmentPlan[];
  talentReviews: TalentReview[];
  loading: boolean;
  activeTab: Tab;
  selectedPosition: KeyPosition | null;
  selectedNineBoxCell: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const READINESS_COLORS: Record<ReadinessLevel, string> = {
  'Ready Now': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  '1-2 Years': 'bg-sky-100 text-sky-700 border border-sky-200',
  '3-5 Years': 'bg-amber-100 text-amber-700 border border-amber-200',
  'Not Ready': 'bg-slate-100 text-slate-500 border border-slate-200',
};

const RISK_COLORS = {
  High: 'bg-red-100 text-red-700 border border-red-200',
  Medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  Low: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
};

const NINE_BOX_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  'H-H': { label: 'Star', color: 'text-amber-700', bg: 'bg-amber-100' },
  'H-M': { label: 'High Potential', color: 'text-sky-700', bg: 'bg-sky-100' },
  'H-L': { label: 'Solid Performer', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  'M-H': { label: 'Future Star', color: 'text-purple-700', bg: 'bg-purple-100' },
  'M-M': { label: 'Core Player', color: 'text-slate-700', bg: 'bg-slate-100' },
  'M-L': { label: 'Inconsistent Player', color: 'text-orange-700', bg: 'bg-orange-100' },
  'L-H': { label: 'Enigma', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  'L-M': { label: 'Under Performer', color: 'text-rose-700', bg: 'bg-rose-50' },
  'L-L': { label: 'Under Performer', color: 'text-red-700', bg: 'bg-red-50' },
};

// ── Sub Components ─────────────────────────────────────────────────────────────

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

function TabButton({
  _id,
  label,
  active,
  onClick,
}: {
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
        active ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );
}

function ReadinessBadge({ level }: { level: ReadinessLevel }) {
  return (
    <span
      className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${READINESS_COLORS[level]}`}
    >
      {level}
    </span>
  );
}

function RiskBadge({ level }: { level: 'High' | 'Medium' | 'Low' }) {
  return (
    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${RISK_COLORS[level]}`}>
      {level} Risk
    </span>
  );
}

// ── Key Positions Tab ──────────────────────────────────────────────────────────

function KeyPositionsTab({
  positions,
  onSelectPosition,
}: {
  positions: KeyPosition[];
  onSelectPosition: (p: KeyPosition) => void;
}) {
  const [filter, setFilter] = useState<'All' | 'Critical' | 'Key' | 'Important'>('All');
  const [riskFilter, setRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  const filtered = positions.filter((p) => {
    const criticality = filter === 'All' || p.criticality === filter;
    const risk = riskFilter === 'All' || p.riskLevel === riskFilter;
    return criticality && risk;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {(['All', 'Critical', 'Key', 'Important'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                filter === f ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {(['All', 'High', 'Medium', 'Low'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                riskFilter === r ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Position List */}
      <div className="space-y-2">
        {filtered.map((position) => (
          <button
            key={position.id}
            onClick={() => onSelectPosition(position)}
            className="w-full flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-sm transition-all text-left"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 text-sm">{position.title}</span>
                {position.criticality === 'Critical' && (
                  <Star size={12} className="text-amber-500 fill-amber-400" />
                )}
                <span
                  className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                    position.criticality === 'Critical'
                      ? 'bg-amber-100 text-amber-700'
                      : position.criticality === 'Key'
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {position.criticality}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {position.department} &bull; Grade {position.grade}
              </p>
              {position.incumbentName ? (
                <p className="text-xs text-slate-500 mt-0.5">Incumbent: {position.incumbentName}</p>
              ) : (
                <p className="text-xs text-rose-500 mt-0.5">Vacant position</p>
              )}
            </div>
            <div className="text-center flex-shrink-0">
              <p className="text-xl font-bold text-slate-700">{position.successorCount}</p>
              <p className="text-xs text-slate-400">Successors</p>
            </div>
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
            <RiskBadge level={position.riskLevel} />
            <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            No positions match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}

// ── 9-Box Grid Tab ─────────────────────────────────────────────────────────────

function NineBoxGridTab({
  candidates,
  onSelectCell,
}: {
  candidates: SuccessionCandidate[];
  onSelectCell: (cell: string) => void;
}) {
  const cellCounts: Record<string, number> = {};
  candidates.forEach((c) => {
    cellCounts[c.nineBoxCell] = (cellCounts[c.nineBoxCell] || 0) + 1;
  });

  const cells = [
    ['L-H', 'M-H', 'H-H'],
    ['L-M', 'M-M', 'H-M'],
    ['L-L', 'M-L', 'H-L'],
  ];

  const potentialLabels = ['High Potential', 'Medium Potential', 'Low Potential'];
  const performanceLabels = ['Low', 'Medium', 'High'];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-1">9-Box Talent Grid</h3>
        <p className="text-sm text-slate-500 mb-6">
          Performance vs Potential matrix — click a cell to see employees
        </p>

        <div className="flex gap-4">
          {/* Y-axis label */}
          <div className="flex items-center justify-center w-8">
            <span className="text-xs text-slate-400 font-medium -rotate-90 whitespace-nowrap">
              Potential
            </span>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-3 gap-1.5">
              {cells.map((row, rowIdx) =>
                row.map((cellKey, colIdx) => {
                  const info = NINE_BOX_LABELS[cellKey] || {
                    label: cellKey,
                    color: 'text-slate-600',
                    bg: 'bg-slate-100',
                  };
                  const count = cellCounts[cellKey] || 0;
                  return (
                    <button
                      key={cellKey}
                      onClick={() => onSelectCell(cellKey)}
                      className={`${info.bg} rounded-xl p-4 text-center border-2 border-transparent hover:border-slate-400 transition-all group cursor-pointer`}
                    >
                      <p className={`text-2xl font-bold ${info.color}`}>{count}</p>
                      <p className={`text-xs font-medium mt-1 ${info.color}`}>{info.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {potentialLabels[rowIdx]} / Perf {performanceLabels[colIdx]}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
            {/* X-axis label */}
            <p className="text-xs text-slate-400 text-center mt-3 font-medium">Performance</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-700 mb-3">Category Legend</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(NINE_BOX_LABELS).map(([key, info]) => (
            <span
              key={key}
              className={`${info.bg} ${info.color} text-xs px-2 py-1 rounded-lg font-medium`}
            >
              {key}: {info.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Talent Pipeline Tab ────────────────────────────────────────────────────────

function TalentPipelineTab({ plans }: { plans: SuccessionPlan[] }) {
  const [selected, setSelected] = useState<SuccessionPlan | null>(plans[0] || null);

  return (
    <div className="flex gap-4">
      {/* Position list */}
      <div className="w-64 flex-shrink-0 space-y-2">
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelected(plan)}
            className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${
              selected?.id === plan.id
                ? 'border-slate-800 bg-slate-800 text-white'
                : 'border-slate-200 bg-white hover:border-slate-400 text-slate-700'
            }`}
          >
            <p className="font-medium truncate">{plan.positionTitle}</p>
            <p
              className={`text-xs mt-0.5 ${selected?.id === plan.id ? 'text-slate-300' : 'text-slate-400'}`}
            >
              {plan.successors.length} successor(s)
            </p>
          </button>
        ))}
      </div>

      {/* Successor detail */}
      {selected && (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-800">{selected.positionTitle}</h3>
            <p className="text-sm text-slate-500">
              {selected.department} &bull; Incumbent: {selected.incumbentName || 'Vacant'}
            </p>
            <span
              className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-md font-medium ${
                selected.status === 'Active'
                  ? 'bg-emerald-100 text-emerald-700'
                  : selected.status === 'Draft'
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-amber-100 text-amber-700'
              }`}
            >
              {selected.status}
            </span>
          </div>

          <div className="space-y-3">
            {selected.successors.map((entry) => (
              <div key={entry.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                  {entry.candidateName
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{entry.candidateName}</p>
                  <p className="text-xs text-slate-400">{entry.candidateTitle}</p>
                </div>
                <ReadinessBadge level={entry.readiness} />
                {entry.notes && (
                  <p className="text-xs text-slate-400 max-w-[160px] truncate">{entry.notes}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
            Last reviewed by {selected.reviewedBy} &bull; Updated{' '}
            {new Date(selected.updatedAt).toLocaleDateString()}
          </div>
        </div>
      )}

      {plans.length === 0 && (
        <div className="flex-1 text-center py-12 text-slate-400 text-sm">
          No succession plans available.
        </div>
      )}
    </div>
  );
}

// ── Development Plans Tab ──────────────────────────────────────────────────────

function DevelopmentPlansTab({ plans }: { plans: DevelopmentPlan[] }) {
  const [selected, setSelected] = useState<DevelopmentPlan | null>(plans[0] || null);

  return (
    <div className="space-y-4">
      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const completedMilestones =
            plan.milestones?.filter((m: any) => m.status === 'Completed').length || 0;
          const totalMilestones = plan.milestones?.length || 1;
          const progress = Math.round((completedMilestones / totalMilestones) * 100);

          return (
            <button
              key={plan.id}
              onClick={() => setSelected(plan)}
              className={`text-left p-4 rounded-xl border transition-all ${
                selected?.id === plan.id
                  ? 'border-slate-800 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-400'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                  {plan.employeeName
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2) || 'N/A'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{plan.employeeName}</p>
                  <p className="text-xs text-slate-400">{plan.targetRole}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Progress</span>
                  <span className="text-slate-700 font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  {completedMilestones}/{totalMilestones} milestones &bull; Mentor:{' '}
                  {plan.mentorName || 'TBD'}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">
                {selected.employeeName} — Development Plan
              </h3>
              <p className="text-sm text-slate-500">Target: {selected.targetRole}</p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-lg font-medium ${
                selected.status === 'Active'
                  ? 'bg-emerald-100 text-emerald-700'
                  : selected.status === 'Completed'
                    ? 'bg-sky-100 text-sky-700'
                    : 'bg-amber-100 text-amber-700'
              }`}
            >
              {selected.status}
            </span>
          </div>

          <div className="space-y-2">
            {selected.milestones?.map((m: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    m.status === 'Completed'
                      ? 'bg-emerald-500'
                      : m.status === 'In Progress'
                        ? 'bg-sky-500'
                        : 'bg-slate-200'
                  }`}
                >
                  {m.status === 'Completed' && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{m.title || m.description}</p>
                  {m.dueDate && (
                    <p className="text-xs text-slate-400">
                      Due {new Date(m.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    m.status === 'Completed'
                      ? 'text-emerald-700'
                      : m.status === 'In Progress'
                        ? 'text-sky-700'
                        : 'text-slate-500'
                  }`}
                >
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Talent Review Tab ──────────────────────────────────────────────────────────

function TalentReviewTab({ reviews }: { reviews: TalentReview[] }) {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-800">{review.title}</h3>
              <p className="text-sm text-slate-500">
                {review.department} &bull; {new Date(review.reviewDate).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-lg font-medium ${
                review.status === 'Completed'
                  ? 'bg-emerald-100 text-emerald-700'
                  : review.status === 'Scheduled'
                    ? 'bg-sky-100 text-sky-700'
                    : review.status === 'In Progress'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-500'
              }`}
            >
              {review.status}
            </span>
          </div>

          {review.calibrationNotes && (
            <div className="p-3 bg-slate-50 rounded-lg mb-3">
              <p className="text-xs font-medium text-slate-600 mb-1">Calibration Notes</p>
              <p className="text-sm text-slate-700">{review.calibrationNotes}</p>
            </div>
          )}

          {review.actionItems && review.actionItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">
                Action Items ({review.actionItems.length})
              </p>
              <div className="space-y-1">
                {review.actionItems.slice(0, 3).map((action: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        action.status === 'Completed'
                          ? 'bg-emerald-500'
                          : action.status === 'In Progress'
                            ? 'bg-amber-500'
                            : 'bg-slate-300'
                      }`}
                    />
                    <span className="text-slate-600">{action.title}</span>
                    <span className="text-xs text-slate-400 ml-auto">{action.assignedTo}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Users size={12} />
              {review.participants || 0} participants
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              Reviewed {new Date(review.reviewDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Award size={12} />
              Facilitated by {review.facilitator}
            </span>
          </div>
        </div>
      ))}
      {reviews.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">
          No talent review sessions found.
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function SuccessionPlanningDashboard() {
  const [state, setState] = useState<DashboardState>({
    analytics: null,
    keyPositions: [],
    candidates: [],
    plans: [],
    developmentPlans: [],
    talentReviews: [],
    loading: true,
    activeTab: 'key-positions',
    selectedPosition: null,
    selectedNineBoxCell: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const [analytics, keyPositions, candidates, plans, devPlans, reviews] = await Promise.all([
        SuccessionService.getAnalytics(),
        SuccessionService.getKeyPositions(),
        SuccessionService.getAllCandidates(),
        SuccessionService.getSuccessionPlans(),
        SuccessionService.getDevelopmentPlans
          ? SuccessionService.getDevelopmentPlans()
          : Promise.resolve([]),
        SuccessionService.getTalentReviews
          ? SuccessionService.getTalentReviews()
          : Promise.resolve([]),
      ]);
      setState((s) => ({
        ...s,
        analytics,
        keyPositions,
        candidates,
        plans,
        developmentPlans: devPlans,
        talentReviews: reviews,
        loading: false,
      }));
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const {
    analytics,
    keyPositions,
    candidates,
    plans,
    developmentPlans,
    talentReviews,
    loading,
    activeTab,
  } = state;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'key-positions', label: 'Key Positions' },
    { id: '9-box', label: '9-Box Grid' },
    { id: 'pipeline', label: 'Talent Pipeline' },
    { id: 'development', label: 'Development Plans' },
    { id: 'talent-review', label: 'Talent Review' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-slate-400" />
        <span className="ml-3 text-slate-500">Loading succession data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Succession Planning</h1>
          <p className="text-sm text-slate-500 mt-1">
            Talent pipeline, 9-box grid, and development tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700">
            <Plus size={14} />
            New Plan
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Target size={18} className="text-slate-600" />}
            label="Key Positions"
            value={analytics.totalKeyPositions || keyPositions.length}
            sub={`${analytics.criticalPositions || 0} critical`}
            color="bg-slate-100"
          />
          <StatCard
            icon={<Users size={18} className="text-emerald-600" />}
            label="Ready Now"
            value={
              analytics.readyNowCount || candidates.filter((c) => c.nineBoxCell === 'H-H').length
            }
            sub="successors identified"
            color="bg-emerald-100"
          />
          <StatCard
            icon={<AlertTriangle size={18} className="text-red-600" />}
            label="High Risk Positions"
            value={keyPositions.filter((p) => p.riskLevel === 'High').length}
            sub="need immediate attention"
            color="bg-red-100"
          />
          <StatCard
            icon={<TrendingUp size={18} className="text-sky-600" />}
            label="Bench Strength"
            value={`${analytics.benchStrengthPercent || 0}%`}
            sub="coverage score"
            color="bg-sky-100"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => setState((s) => ({ ...s, activeTab: tab.id }))}
          />
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'key-positions' && (
          <KeyPositionsTab
            positions={keyPositions}
            onSelectPosition={(p) => setState((s) => ({ ...s, selectedPosition: p }))}
          />
        )}
        {activeTab === '9-box' && (
          <NineBoxGridTab
            candidates={candidates}
            onSelectCell={(cell) => setState((s) => ({ ...s, selectedNineBoxCell: cell }))}
          />
        )}
        {activeTab === 'pipeline' && <TalentPipelineTab plans={plans} />}
        {activeTab === 'development' && <DevelopmentPlansTab plans={developmentPlans} />}
        {activeTab === 'talent-review' && <TalentReviewTab reviews={talentReviews} />}
      </div>
    </div>
  );
}
