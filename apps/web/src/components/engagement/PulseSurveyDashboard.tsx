/**
 * @module PulseSurveyDashboard
 * @description Employee pulse survey management — active surveys, survey creation,
 *              eNPS results, engagement trends, industry benchmarks (Sec 13.2)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  TrendingUp,
  Send,
  Loader2,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Minus,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'active' | 'create' | 'results' | 'trends' | 'benchmarks';
type QuestionType = 'likert' | 'nps' | 'open-text';
type SurveyStatus = 'active' | 'scheduled' | 'closed';
type SurveyCategory = 'engagement' | 'culture' | 'manager' | 'dei' | 'wellbeing' | 'onboarding';
type Audience = 'all' | 'department' | 'location';
type Frequency = 'weekly' | 'monthly' | 'quarterly';

interface ActiveSurvey {
  id: string;
  name: string;
  category: SurveyCategory;
  status: SurveyStatus;
  responseRate: number;
  totalInvited: number;
  responded: number;
  deadline: string;
  launchedAt: string;
}

interface SurveyQuestion {
  id: string;
  type: QuestionType;
  text: string;
  order: number;
}

interface ENPSResult {
  score: number;
  promoters: number;
  passives: number;
  detractors: number;
  totalResponses: number;
}

interface QuestionResult {
  questionId: string;
  questionText: string;
  type: QuestionType;
  avgScore?: number;
  distribution?: Record<string, number>;
  openResponses?: string[];
}

interface TrendPoint {
  period: string;
  enps: number;
  engagement: number;
  participation: number;
}

interface BenchmarkData {
  industry: string;
  enps: number;
  engagement: number;
  participation: number;
}

interface DepartmentBenchmark {
  department: string;
  score: number;
  trend: 'up' | 'down' | 'flat';
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const ACTIVE_SURVEYS: ActiveSurvey[] = [
  {
    id: 'sv-001',
    name: 'Q1 2026 Pulse Check',
    category: 'engagement',
    status: 'active',
    responseRate: 68,
    totalInvited: 290,
    responded: 197,
    deadline: '2026-03-05',
    launchedAt: '2026-02-24',
  },
  {
    id: 'sv-002',
    name: 'Manager Effectiveness Survey',
    category: 'manager',
    status: 'active',
    responseRate: 42,
    totalInvited: 185,
    responded: 78,
    deadline: '2026-03-10',
    launchedAt: '2026-02-20',
  },
  {
    id: 'sv-003',
    name: 'Wellbeing Check-in Feb',
    category: 'wellbeing',
    status: 'active',
    responseRate: 81,
    totalInvited: 290,
    responded: 235,
    deadline: '2026-02-28',
    launchedAt: '2026-02-22',
  },
  {
    id: 'sv-004',
    name: 'New Hire 30-Day Survey',
    category: 'onboarding',
    status: 'scheduled',
    responseRate: 0,
    totalInvited: 12,
    responded: 0,
    deadline: '2026-03-15',
    launchedAt: '2026-03-01',
  },
  {
    id: 'sv-005',
    name: 'DEI Culture Survey',
    category: 'dei',
    status: 'closed',
    responseRate: 74,
    totalInvited: 290,
    responded: 215,
    deadline: '2026-02-15',
    launchedAt: '2026-02-01',
  },
];

const ENPS_RESULT: ENPSResult = {
  score: 42,
  promoters: 54,
  passives: 34,
  detractors: 12,
  totalResponses: 197,
};

const QUESTION_RESULTS: QuestionResult[] = [
  {
    questionId: 'q1',
    questionText: 'How likely are you to recommend this company as a great place to work?',
    type: 'nps',
    avgScore: 7.8,
    distribution: { '0-6': 12, '7-8': 34, '9-10': 54 },
  },
  {
    questionId: 'q2',
    questionText: 'I feel my work is meaningful and contributes to company goals.',
    type: 'likert',
    avgScore: 4.1,
    distribution: {
      'Strongly Disagree': 4,
      Disagree: 8,
      Neutral: 18,
      Agree: 42,
      'Strongly Agree': 28,
    },
  },
  {
    questionId: 'q3',
    questionText: 'My manager provides clear direction and regular feedback.',
    type: 'likert',
    avgScore: 3.8,
    distribution: {
      'Strongly Disagree': 6,
      Disagree: 12,
      Neutral: 22,
      Agree: 38,
      'Strongly Agree': 22,
    },
  },
  {
    questionId: 'q4',
    questionText: 'I have access to the tools and resources I need to do my job effectively.',
    type: 'likert',
    avgScore: 4.3,
    distribution: {
      'Strongly Disagree': 2,
      Disagree: 6,
      Neutral: 14,
      Agree: 46,
      'Strongly Agree': 32,
    },
  },
  {
    questionId: 'q5',
    questionText: 'What is one thing we could do to improve your experience at work?',
    type: 'open-text',
    openResponses: [
      'More flexible work hours',
      'Better career growth opportunities',
      'Improved communication from leadership',
      'More team collaboration tools',
      'Clear promotion criteria',
      'Better work-life balance support',
    ],
  },
];

const TREND_DATA: TrendPoint[] = [
  { period: 'Q2 2025', enps: 28, engagement: 68, participation: 62 },
  { period: 'Q3 2025', enps: 32, engagement: 70, participation: 65 },
  { period: 'Q4 2025', enps: 38, engagement: 72, participation: 70 },
  { period: 'Q1 2026', enps: 42, engagement: 74, participation: 68 },
];

const BENCHMARKS: BenchmarkData[] = [
  { industry: 'Technology', enps: 38, engagement: 73, participation: 71 },
  { industry: 'Finance', enps: 22, engagement: 68, participation: 65 },
  { industry: 'Healthcare', enps: 18, engagement: 65, participation: 72 },
  { industry: 'Manufacturing', enps: 12, engagement: 61, participation: 68 },
  { industry: 'Your Company', enps: 42, engagement: 74, participation: 68 },
];

const DEPT_BENCHMARKS: DepartmentBenchmark[] = [
  { department: 'Engineering', score: 78, trend: 'up' },
  { department: 'Product', score: 76, trend: 'up' },
  { department: 'Sales', score: 65, trend: 'flat' },
  { department: 'Marketing', score: 72, trend: 'up' },
  { department: 'Operations', score: 61, trend: 'down' },
  { department: 'HR', score: 80, trend: 'up' },
  { department: 'Finance', score: 69, trend: 'flat' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const TAB_LIST: { id: TabId; label: string }[] = [
  { id: 'active', label: 'Active Surveys' },
  { id: 'create', label: 'Create Survey' },
  { id: 'results', label: 'Results' },
  { id: 'trends', label: 'Trends' },
  { id: 'benchmarks', label: 'Benchmarks' },
];

function categoryBadge(cat: SurveyCategory): string {
  const map: Record<SurveyCategory, string> = {
    engagement: 'bg-blue-100 text-blue-700',
    culture: 'bg-purple-100 text-purple-700',
    manager: 'bg-indigo-100 text-indigo-700',
    dei: 'bg-pink-100 text-pink-700',
    wellbeing: 'bg-emerald-100 text-emerald-700',
    onboarding: 'bg-amber-100 text-amber-700',
  };
  return map[cat] ?? 'bg-gray-100 text-gray-700';
}

function statusBadge(status: SurveyStatus): string {
  const map: Record<SurveyStatus, string> = {
    active: 'bg-green-100 text-green-700',
    scheduled: 'bg-yellow-100 text-yellow-700',
    closed: 'bg-gray-100 text-gray-600',
  };
  return map[status];
}

function enpsColor(score: number): string {
  if (score >= 50) return 'text-emerald-600';
  if (score >= 20) return 'text-blue-600';
  if (score >= 0) return 'text-amber-600';
  return 'text-red-600';
}

function scoreBarColor(score: number): string {
  if (score >= 4.5) return 'bg-emerald-500';
  if (score >= 3.5) return 'bg-blue-500';
  if (score >= 2.5) return 'bg-amber-500';
  return 'bg-red-500';
}

function trendIcon(trend: 'up' | 'down' | 'flat') {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  if (trend === 'down') return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
  return <Minus className="w-4 h-4 text-gray-400" />;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color ?? 'text-gray-800'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function ResponseRateBar({ rate }: { rate: number }) {
  const color = rate >= 70 ? 'bg-emerald-500' : rate >= 50 ? 'bg-blue-500' : 'bg-amber-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${rate}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-9 text-right">{rate}%</span>
    </div>
  );
}

function _LikertBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-32 text-xs text-gray-600 truncate">{label}</span>
      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-xs text-gray-500">{pct}%</span>
    </div>
  );
}

function TrendSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 120;
  const H = 40;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 8) - 4;
    return `${x},${y}`;
  });
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        points={pts.join(' ')}
      />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * W;
        const y = H - ((v - min) / range) * (H - 8) - 4;
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
      })}
    </svg>
  );
}

// ── Tab: Active Surveys ───────────────────────────────────────────────────────

function ActiveSurveysTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Running Surveys"
          value={3}
          sub="2 closing this week"
          color="text-blue-600"
        />
        <MetricCard
          label="Avg Response Rate"
          value="64%"
          sub="+6% vs last month"
          color="text-emerald-600"
        />
        <MetricCard label="Total Responses" value={510} sub="This month" color="text-indigo-600" />
        <MetricCard
          label="Completion Rate"
          value="91%"
          sub="Of started surveys"
          color="text-violet-600"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Survey Activity</h3>
          <div className="flex gap-2">
            <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Categories</option>
              <option>Engagement</option>
              <option>Manager</option>
              <option>Wellbeing</option>
            </select>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {ACTIVE_SURVEYS.map((sv) => (
            <div key={sv.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-800 truncate">{sv.name}</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryBadge(sv.category)}`}
                    >
                      {sv.category.charAt(0).toUpperCase() + sv.category.slice(1)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(sv.status)}`}
                    >
                      {sv.status.charAt(0).toUpperCase() + sv.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {sv.responded} of {sv.totalInvited} responded · Deadline: {sv.deadline}
                  </p>
                  <ResponseRateBar rate={sv.responseRate} />
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium">
                    View
                  </button>
                  {sv.status === 'active' && (
                    <button className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 font-medium">
                      Remind
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Create Survey ────────────────────────────────────────────────────────

function CreateSurveyTab() {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    {
      id: 'q1',
      type: 'nps',
      text: 'How likely are you to recommend this company as a great place to work?',
      order: 1,
    },
  ]);
  const [audience, setAudience] = useState<Audience>('all');
  const [frequency, setFrequency] = useState<Frequency>('monthly');

  const addQuestion = (type: QuestionType) => {
    const placeholders: Record<QuestionType, string> = {
      likert: 'I feel valued and recognized for my contributions.',
      nps: 'How likely are you to recommend this company to a friend?',
      'open-text': 'What could we do to improve your experience at work?',
    };
    setQuestions((prev) => [
      ...prev,
      { id: `q${Date.now()}`, type, text: placeholders[type], order: prev.length + 1 },
    ]);
  };

  const removeQuestion = (id: string) => setQuestions((prev) => prev.filter((q) => q.id !== id));

  const typeLabel: Record<QuestionType, string> = {
    likert: 'Likert Scale',
    nps: 'NPS (0-10)',
    'open-text': 'Open Text',
  };
  const typeColor: Record<QuestionType, string> = {
    likert: 'bg-blue-100 text-blue-700',
    nps: 'bg-purple-100 text-purple-700',
    'open-text': 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Survey Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Survey Name</label>
            <input
              type="text"
              defaultValue="Q1 2026 Employee Pulse"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Engagement</option>
              <option>Manager Effectiveness</option>
              <option>Culture</option>
              <option>Wellbeing</option>
              <option>DEI</option>
              <option>Onboarding</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as Audience)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Employees (290)</option>
              <option value="department">Specific Department</option>
              <option value="location">Specific Location</option>
            </select>
            {audience === 'department' && (
              <select className="w-full mt-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Engineering</option>
                <option>Sales</option>
                <option>Marketing</option>
                <option>Operations</option>
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Frequency)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="once">One-time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Launch Date</label>
            <input
              type="date"
              defaultValue="2026-03-01"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input
              type="date"
              defaultValue="2026-03-07"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Question Builder</h3>
          <div className="flex gap-2">
            <button
              onClick={() => addQuestion('likert')}
              className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Likert
            </button>
            <button
              onClick={() => addQuestion('nps')}
              className="text-xs px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 font-medium flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> NPS
            </button>
            <button
              onClick={() => addQuestion('open-text')}
              className="text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-medium flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Open Text
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={q.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-gray-400">Q{idx + 1}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColor[q.type]}`}
                >
                  {typeLabel[q.type]}
                </span>
                <button
                  onClick={() => removeQuestion(q.id)}
                  className="ml-auto text-gray-400 hover:text-red-500 text-xs"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                defaultValue={q.text}
                className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {q.type === 'likert' && (
                <div className="flex gap-2 mt-2">
                  {['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'].map(
                    (l) => (
                      <span key={l} className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                        {l}
                      </span>
                    )
                  )}
                </div>
              )}
              {q.type === 'nps' && (
                <div className="flex gap-1 mt-2">
                  {Array.from({ length: 11 }, (_, i) => (
                    <span
                      key={i}
                      className="text-xs w-7 h-7 flex items-center justify-center bg-gray-100 rounded text-gray-600"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-3 justify-end">
          <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            Save Draft
          </button>
          <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium">
            <Send className="w-4 h-4" /> Launch Survey
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Results ──────────────────────────────────────────────────────────────

function ResultsTab() {
  const { score, promoters, passives, detractors, totalResponses } = ENPS_RESULT;
  const total = promoters + passives + detractors;
  const promoterPct = Math.round((promoters / total) * 100);
  const passivePct = Math.round((passives / total) * 100);
  const detractorPct = Math.round((detractors / total) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Overall eNPS Score</h3>
            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1">
              <option>Q1 2026 Pulse Check</option>
              <option>Manager Effectiveness</option>
            </select>
          </div>
          <div className="text-center mb-4">
            <span className={`text-6xl font-extrabold ${enpsColor(score)}`}>
              {score > 0 ? `+${score}` : score}
            </span>
            <p className="text-sm text-gray-500 mt-1">{totalResponses} total responses</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-gray-600 w-24">Promoters (9-10)</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${promoterPct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700 w-10 text-right">
                {promoterPct}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Minus className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-600 w-24">Passives (7-8)</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-400 rounded-full"
                  style={{ width: `${passivePct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700 w-10 text-right">
                {passivePct}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsDown className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-600 w-24">Detractors (0-6)</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${detractorPct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700 w-10 text-right">
                {detractorPct}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Open Text Themes</h3>
          <p className="text-xs text-gray-500 mb-3">Most common topics from open-ended responses</p>
          <div className="flex flex-wrap gap-2">
            {[
              {
                word: 'Career Growth',
                size: 'text-xl',
                weight: 'font-bold',
                color: 'text-blue-600',
              },
              {
                word: 'Work-Life Balance',
                size: 'text-lg',
                weight: 'font-semibold',
                color: 'text-purple-600',
              },
              {
                word: 'Flexibility',
                size: 'text-base',
                weight: 'font-semibold',
                color: 'text-emerald-600',
              },
              {
                word: 'Communication',
                size: 'text-lg',
                weight: 'font-bold',
                color: 'text-indigo-600',
              },
              { word: 'Tools', size: 'text-sm', weight: 'font-medium', color: 'text-gray-600' },
              {
                word: 'Recognition',
                size: 'text-base',
                weight: 'font-semibold',
                color: 'text-amber-600',
              },
              { word: 'Promotion', size: 'text-sm', weight: 'font-medium', color: 'text-red-500' },
              {
                word: 'Team Collaboration',
                size: 'text-base',
                weight: 'font-semibold',
                color: 'text-teal-600',
              },
              { word: 'Leadership', size: 'text-lg', weight: 'font-bold', color: 'text-blue-500' },
              { word: 'Benefits', size: 'text-sm', weight: 'font-medium', color: 'text-green-600' },
              {
                word: 'Mentorship',
                size: 'text-sm',
                weight: 'font-medium',
                color: 'text-violet-600',
              },
            ].map((item) => (
              <span
                key={item.word}
                className={`${item.size} ${item.weight} ${item.color} cursor-default hover:opacity-80 transition-opacity`}
              >
                {item.word}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Question-by-Question Breakdown</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {QUESTION_RESULTS.filter((q) => q.type !== 'open-text').map((q) => (
            <div key={q.questionId} className="p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="text-sm text-gray-700 font-medium">{q.questionText}</p>
                <div className="shrink-0 text-right">
                  <span
                    className={`text-lg font-bold ${scoreBarColor(q.avgScore ?? 0)
                      .replace('bg-', 'text-')
                      .replace('-500', '-600')}`}
                  >
                    {q.avgScore?.toFixed(1)}
                    {q.type === 'nps' ? '/10' : '/5'}
                  </span>
                </div>
              </div>
              {q.distribution && (
                <div className="space-y-1.5">
                  {Object.entries(q.distribution).map(([label, count]) => {
                    const total = Object.values(q.distribution!).reduce((a, b) => a + b, 0);
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={label} className="flex items-center gap-2 text-xs">
                        <span className="w-28 text-gray-600 truncate">{label}</span>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${scoreBarColor(q.avgScore ?? 0)}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-gray-500">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Trends ───────────────────────────────────────────────────────────────

function TrendsTab() {
  const enpsData = TREND_DATA.map((d) => d.enps);
  const engagementData = TREND_DATA.map((d) => d.engagement);
  const participationData = TREND_DATA.map((d) => d.participation);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium mb-1">eNPS Trend</p>
          <p className="text-2xl font-bold text-blue-600 mb-2">+42</p>
          <TrendSparkline data={enpsData} color="#3b82f6" />
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +4 vs last quarter
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Engagement Score</p>
          <p className="text-2xl font-bold text-emerald-600 mb-2">74%</p>
          <TrendSparkline data={engagementData} color="#10b981" />
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +2% vs last quarter
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Participation Rate</p>
          <p className="text-2xl font-bold text-purple-600 mb-2">68%</p>
          <TrendSparkline data={participationData} color="#8b5cf6" />
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Minus className="w-3 h-3" /> Flat vs last quarter
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Quarterly Progress</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Period
                </th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                  eNPS
                </th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                  Engagement
                </th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                  Participation
                </th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  eNPS Bar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {TREND_DATA.map((row) => (
                <tr key={row.period} className="hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-800">{row.period}</td>
                  <td className={`py-3 text-right font-bold ${enpsColor(row.enps)}`}>
                    {row.enps > 0 ? `+${row.enps}` : row.enps}
                  </td>
                  <td className="py-3 text-right text-gray-700">{row.engagement}%</td>
                  <td className="py-3 text-right text-gray-700">{row.participation}%</td>
                  <td className="py-3 w-32">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${((row.enps + 100) / 200) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Benchmarks ───────────────────────────────────────────────────────────

function BenchmarksTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-1">Industry Comparison</h3>
        <p className="text-xs text-gray-500 mb-4">
          eNPS benchmarks across industries (2025 Global HCM Report)
        </p>
        <div className="space-y-3">
          {BENCHMARKS.map((b) => {
            const isCompany = b.industry === 'Your Company';
            return (
              <div
                key={b.industry}
                className={`flex items-center gap-4 p-3 rounded-lg ${isCompany ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
              >
                <div className="w-32 text-sm font-medium text-gray-700 truncate">{b.industry}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-white rounded-full overflow-hidden border border-gray-200">
                      <div
                        className={`h-full rounded-full ${isCompany ? 'bg-blue-500' : 'bg-gray-400'}`}
                        style={{ width: `${((b.enps + 100) / 200) * 100}%` }}
                      />
                    </div>
                    <span
                      className={`text-sm font-bold w-10 text-right ${isCompany ? 'text-blue-600' : 'text-gray-600'}`}
                    >
                      {b.enps > 0 ? `+${b.enps}` : b.enps}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 w-28 text-right">
                  Eng: {b.engagement}% | Part: {b.participation}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Department Scores vs Company Average</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DEPT_BENCHMARKS.map((dept) => (
            <div
              key={dept.department}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-28 text-sm font-medium text-gray-700">{dept.department}</div>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${dept.score >= 75 ? 'bg-emerald-500' : dept.score >= 65 ? 'bg-blue-500' : 'bg-amber-500'}`}
                  style={{ width: `${dept.score}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-700 w-8 text-right">{dept.score}</span>
              {trendIcon(dept.trend)}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" />
          Company average: <span className="font-semibold text-gray-600">72</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PulseSurveyDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pulse Survey Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitor engagement, gather feedback, track eNPS trends
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            <Plus className="w-4 h-4" /> New Survey
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-1">
          {TAB_LIST.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'active' && <ActiveSurveysTab />}
          {activeTab === 'create' && <CreateSurveyTab />}
          {activeTab === 'results' && <ResultsTab />}
          {activeTab === 'trends' && <TrendsTab />}
          {activeTab === 'benchmarks' && <BenchmarksTab />}
        </>
      )}
    </div>
  );
}
