/**
 * @module AssessmentCenter
 * @description Assessment management — template library, candidate queue,
 *              radar scorecard, side-by-side comparison, score distribution (Sec 20.4)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  Users,
  Target,
  Star,
  RefreshCw,
  Eye,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  AssessmentService,
  type AssessmentTemplate,
  type AssessmentAssignment,
  type AssessmentAnalytics,
  type Scorecard,
  type AssessmentType,
} from '@/services/assessmentService';

// ── Radar Chart ───────────────────────────────────────────────────────────────

function RadarChart({
  dimensions,
  actual,
  benchmark,
  size = 200,
}: {
  dimensions: string[];
  actual: number[];
  benchmark?: number[];
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const n = dimensions.length;

  const angle = (i: number) => (i / n) * Math.PI * 2 - Math.PI / 2;
  const x = (i: number, val: number) => cx + Math.cos(angle(i)) * r * (val / 100);
  const y = (i: number, val: number) => cy + Math.sin(angle(i)) * r * (val / 100);

  const normalizeVal = (v: number, max = 100) => (v / max) * 100;

  const toPath = (vals: number[], max: number) =>
    vals
      .map(
        (v, i) =>
          `${i === 0 ? 'M' : 'L'} ${x(i, normalizeVal(v, max))} ${y(i, normalizeVal(v, max))}`
      )
      .join(' ') + ' Z';

  const maxVal = 100;
  const gridLevels = [25, 50, 75, 100];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid */}
      {gridLevels.map((lvl) => (
        <polygon
          key={lvl}
          points={Array.from({ length: n })
            .map((_, i) => `${x(i, lvl)},${y(i, lvl)}`)
            .join(' ')}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      ))}
      {/* Spokes */}
      {Array.from({ length: n }).map((_, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={x(i, 100)}
          y2={y(i, 100)}
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      ))}
      {/* Benchmark area */}
      {benchmark && (
        <path
          d={toPath(benchmark, maxVal)}
          fill="#3b82f620"
          stroke="#3b82f6"
          strokeWidth={1.5}
          strokeDasharray="4,2"
        />
      )}
      {/* Actual area */}
      <path d={toPath(actual, maxVal)} fill="#10b98140" stroke="#10b981" strokeWidth={2} />
      {/* Labels */}
      {dimensions.map((dim, i) => {
        const lx = cx + Math.cos(angle(i)) * (r + 16);
        const ly = cy + Math.sin(angle(i)) * (r + 14);
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8}
            fill="#374151"
            fontWeight={500}
          >
            {dim.length > 12 ? dim.slice(0, 10) + '…' : dim}
          </text>
        );
      })}
      {/* Center */}
      <circle cx={cx} cy={cy} r={3} fill="#6b7280" />
    </svg>
  );
}

// ── Score Histogram ───────────────────────────────────────────────────────────

function ScoreHistogram({
  distribution,
}: {
  distribution: AssessmentAnalytics['scoreDistribution'];
}) {
  const max = Math.max(...distribution.map((d) => d.count));
  const W = 320;
  const H = 100;
  const padB = 25;
  const padL = 30;
  const barW = (W - padL) / distribution.length - 4;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {distribution.map((d, i) => {
        const barH = max > 0 ? (d.count / max) * (H - padB - 10) : 0;
        const bx = padL + i * ((W - padL) / distribution.length) + 2;
        const by = H - padB - barH;
        return (
          <g key={d.range}>
            <rect x={bx} y={by} width={barW} height={barH} rx={3} fill="#6366f1" />
            <text
              x={bx + barW / 2}
              y={H - padB + 8}
              textAnchor="middle"
              fontSize={7}
              fill="#6b7280"
            >
              {d.range}
            </text>
            {d.count > 0 && (
              <text
                x={bx + barW / 2}
                y={by - 3}
                textAnchor="middle"
                fontSize={8}
                fill="#374151"
                fontWeight={600}
              >
                {d.count}
              </text>
            )}
          </g>
        );
      })}
      <text x={padL - 4} y={H - padB} textAnchor="end" fontSize={7} fill="#9ca3af">
        0
      </text>
      <text x={padL - 4} y={10} textAnchor="end" fontSize={7} fill="#9ca3af">
        {max}
      </text>
      <text x={W / 2} y={H - 2} textAnchor="middle" fontSize={8} fill="#6b7280">
        Score Range (%)
      </text>
    </svg>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AssessmentAssignment['status'] }) {
  const cfg = {
    pending: { cls: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
    in_progress: { cls: 'bg-blue-100 text-blue-700', label: 'In Progress' },
    completed: { cls: 'bg-green-100 text-green-700', label: 'Completed' },
    expired: { cls: 'bg-red-100 text-red-600', label: 'Expired' },
    cancelled: { cls: 'bg-gray-100 text-gray-500', label: 'Cancelled' },
  }[status];
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>
  );
}

// ── Type Badge ────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<AssessmentType, { label: string; color: string; bg: string }> = {
  technical: { label: 'Technical', color: 'text-blue-700', bg: 'bg-blue-100' },
  cognitive: { label: 'Cognitive', color: 'text-purple-700', bg: 'bg-purple-100' },
  personality: { label: 'Personality', color: 'text-pink-700', bg: 'bg-pink-100' },
  situational: { label: 'Situational', color: 'text-amber-700', bg: 'bg-amber-100' },
};

function TypeBadge({ type }: { type: AssessmentType }) {
  const cfg = TYPE_CONFIG[type];
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ── Scorecard Flyout ──────────────────────────────────────────────────────────

function ScorecardFlyout({ scorecard, onClose }: { scorecard: Scorecard; onClose: () => void }) {
  const dims = scorecard.dimensionBreakdown.map((d) => d.dimension);
  const actual = scorecard.dimensionBreakdown.map((d) => d.score);
  const bench = scorecard.dimensionBreakdown.map((d) => d.benchmark);

  const recCfg = {
    strong_hire: { cls: 'bg-green-600 text-white', label: 'Strong Hire' },
    hire: { cls: 'bg-green-100 text-green-800', label: 'Hire' },
    maybe: { cls: 'bg-yellow-100 text-yellow-800', label: 'Maybe' },
    no_hire: { cls: 'bg-red-100 text-red-700', label: 'No Hire' },
  }[scorecard.recommendation];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50" onClick={onClose}>
      <div
        className="bg-white h-full w-full max-w-md overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-200 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{scorecard.candidateName}</h3>
            <p className="text-sm text-gray-500">{scorecard.jobTitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <XCircle size={18} className="text-gray-400" />
          </button>
        </div>
        <div className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">{scorecard.overallScore}</p>
              <p className="text-xs text-gray-400">Overall Score</p>
            </div>
            <span className={`px-4 py-2 rounded-xl text-sm font-bold ${recCfg.cls}`}>
              {recCfg.label}
            </span>
          </div>

          <div className="flex justify-center">
            <RadarChart dimensions={dims} actual={actual} benchmark={bench} size={220} />
          </div>
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-1 bg-green-500 rounded" /> Candidate
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-1 border-t-2 border-dashed border-blue-500" /> Benchmark
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Dimension Breakdown</h4>
            {scorecard.dimensionBreakdown.map((d) => (
              <div key={d.dimension}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-600">{d.dimension}</span>
                  <span className="font-semibold text-gray-800">
                    {d.score}{' '}
                    <span className="text-gray-400 font-normal">/ benchmark {d.benchmark}</span>
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${d.score}%`,
                      background: d.score >= d.benchmark ? '#10b981' : '#f59e0b',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Assessments Taken</h4>
            {scorecard.assessments.map((a) => (
              <div
                key={a.assessmentId}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <TypeBadge type={a.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{a.assessmentName}</p>
                  <p className="text-xs text-gray-400">
                    {a.completedDate} · P{a.percentile}
                  </p>
                </div>
                <span
                  className={`text-sm font-bold ${a.passed ? 'text-green-600' : 'text-red-500'}`}
                >
                  {a.score}%
                </span>
              </div>
            ))}
          </div>

          {scorecard.notes && (
            <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-800">{scorecard.notes}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type TabType = 'templates' | 'queue' | 'analytics' | 'compare';

export default function AssessmentCenter() {
  const [activeTab, setActiveTab] = useState<TabType>('queue');
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [assignments, setAssignments] = useState<AssessmentAssignment[]>([]);
  const [analytics, setAnalytics] = useState<AssessmentAnalytics | null>(null);
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssessmentType | 'all'>('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [t, a, an] = await Promise.all([
        AssessmentService.getAssessmentTemplates(),
        AssessmentService.getAssignments(),
        AssessmentService.getAssessmentAnalytics(),
      ]);
      setTemplates(t);
      setAssignments(a);
      setAnalytics(an);
      setLoading(false);
    };
    load();
  }, []);

  const handleViewScorecard = async (candidateId: string) => {
    const sc = await AssessmentService.getCandidateScorecard(candidateId);
    if (sc) setScorecard(sc);
  };

  const filteredTemplates = templates.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const TABS = [
    { id: 'queue' as TabType, label: 'Candidate Queue', icon: <Users size={14} /> },
    { id: 'templates' as TabType, label: 'Templates', icon: <ClipboardList size={14} /> },
    { id: 'analytics' as TabType, label: 'Analytics', icon: <BarChart3 size={14} /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-blue-600" />
      </div>
    );
  }

  const pending = assignments.filter((a) => a.status === 'pending').length;
  const inProgress = assignments.filter((a) => a.status === 'in_progress').length;
  const completed = assignments.filter((a) => a.status === 'completed').length;

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Center</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage candidate assessments and view results
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-sm">
          <Plus size={16} /> New Assessment
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Pending',
            value: pending,
            icon: <Clock size={18} className="text-yellow-600" />,
            color: 'bg-yellow-50',
          },
          {
            label: 'In Progress',
            value: inProgress,
            icon: <TrendingUp size={18} className="text-blue-600" />,
            color: 'bg-blue-50',
          },
          {
            label: 'Completed',
            value: completed,
            icon: <CheckCircle size={18} className="text-green-600" />,
            color: 'bg-green-50',
          },
          {
            label: 'Pass Rate',
            value: `${analytics?.passRate.toFixed(0)}%`,
            icon: <Award size={18} className="text-purple-600" />,
            color: 'bg-purple-50',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3"
          >
            <div className={`p-2.5 rounded-lg ${kpi.color}`}>{kpi.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
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
          {/* Candidate Queue Tab */}
          {activeTab === 'queue' && (
            <div className="space-y-3">
              {assignments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-200 transition-all"
                >
                  <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                    {a.candidateName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{a.candidateName}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {a.assessmentName} · {a.jobTitle}
                    </p>
                  </div>
                  <TypeBadge type={a.assessmentType} />
                  <StatusBadge status={a.status} />
                  <div className="text-right text-xs hidden md:block">
                    {a.score !== undefined ? (
                      <div>
                        <p className={`font-bold ${a.passed ? 'text-green-600' : 'text-red-500'}`}>
                          {a.score}%
                        </p>
                        <p className="text-gray-400">P{a.percentile}</p>
                      </div>
                    ) : (
                      <p className="text-gray-400">Due {a.dueDate}</p>
                    )}
                  </div>
                  {a.status === 'completed' && (
                    <button
                      onClick={() => handleViewScorecard(a.candidateId)}
                      className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"
                      title="View Scorecard"
                    >
                      <Eye size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search templates or tags..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as AssessmentType | 'all')}
                  className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="all">All Types</option>
                  <option value="technical">Technical</option>
                  <option value="cognitive">Cognitive</option>
                  <option value="personality">Personality</option>
                  <option value="situational">Situational</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTemplates.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 border border-gray-200 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TypeBadge type={t.type} />
                        <span className="text-xs text-gray-400">{t.durationMinutes}min</span>
                      </div>
                      <span className="text-xs text-gray-400">{t.usageCount} uses</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{t.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{t.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Target size={11} /> Pass: {t.passingScore}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={11} className="text-amber-400" /> Avg: {t.avgScore.toFixed(0)}%
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle size={11} className="text-green-500" />{' '}
                        {t.completionRate.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {t.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-sm">
                {[
                  {
                    label: 'Completion Rate',
                    value: `${analytics.completionRate.toFixed(0)}%`,
                    sub: `${analytics.completed}/${analytics.totalAssigned}`,
                  },
                  {
                    label: 'Avg Score',
                    value: `${analytics.avgScore.toFixed(0)}%`,
                    sub: 'across all types',
                  },
                  {
                    label: 'Predictive Validity',
                    value: `r = ${analytics.predictiveValidity.toFixed(2)}`,
                    sub: 'vs job performance',
                  },
                ].map((s) => (
                  <div key={s.label} className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs font-semibold text-gray-600 mt-0.5">{s.label}</p>
                    <p className="text-xs text-gray-400">{s.sub}</p>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Score Distribution</h4>
                <ScoreHistogram distribution={analytics.scoreDistribution} />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">By Assessment Type</h4>
                <div className="space-y-2">
                  {analytics.byType.map((bt) => (
                    <div
                      key={bt.type}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <TypeBadge type={bt.type} />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">
                            {bt.completed}/{bt.assigned} completed
                          </span>
                          <span className="font-medium text-gray-700">
                            Avg: {bt.avgScore.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${bt.passRate}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {bt.passRate.toFixed(0)}% pass rate
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Performers</h4>
                <div className="space-y-2">
                  {analytics.topPerformers.map((tp, idx) => (
                    <div
                      key={tp.candidateId}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-600'}`}
                      >
                        #{idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{tp.candidateName}</p>
                        <p className="text-xs text-gray-400">Percentile {tp.percentile}</p>
                      </div>
                      <span className="text-lg font-bold text-green-600">{tp.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {scorecard && <ScorecardFlyout scorecard={scorecard} onClose={() => setScorecard(null)} />}
    </div>
  );
}
