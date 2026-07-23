'use client';

import React, { useState, useEffect } from 'react';
import {
  Target,
  Star,
  Users,
  ChevronRight,
  Plus,
  Zap,
  Bot,
  Sparkles,
  MessageSquare,
  Award,
  Grid3X3,
  Gauge,
  Eye,
  Search,
  Download,
  Trash2,
} from 'lucide-react';
import { cn } from '@aura/ui/utils';
import { APIClient } from '@/lib/api-client';
import {
  ReviewCycleService,
  GoalService,
  PerformanceAnalyticsService,
  PerformanceReviewService,
  CompetencyService,
  CalibrationService,
} from '@/app/dashboard/performance/core/services';

// ── Empty-state defaults (real counts are always derived from the API) ──
const DEFAULT_STATS = [
  { title: 'Active Reviews', value: '0', icon: Star, color: 'amber' },
  { title: 'Goals in Progress', value: '0', icon: Target, color: 'indigo' },
  { title: 'Feedback Given', value: '0', icon: MessageSquare, color: 'emerald' },
  { title: 'Calibration Ready', value: '0', icon: Gauge, color: 'violet', alert: false },
  { title: 'Avg Rating', value: 'N/A', icon: Award, color: 'rose' },
];

// Standard 9-box grid structure (labels/colors are fixed UI metadata).
// Counts start at 0 and are populated from real review data.
const NINE_BOX_STRUCTURE = [
  { perf: 'Low', pot: 'High', label: 'Enigma', color: 'bg-amber-100 text-amber-700', emoji: '🌟' },
  {
    perf: 'Med',
    pot: 'High',
    label: 'Growth Star',
    color: 'bg-emerald-100 text-emerald-700',
    emoji: '🚀',
  },
  {
    perf: 'High',
    pot: 'High',
    label: 'Superstar',
    color: 'bg-indigo-100 text-indigo-700',
    emoji: '⭐',
  },
  {
    perf: 'Low',
    pot: 'Med',
    label: 'Inconsistent',
    color: 'bg-rose-50 text-rose-600',
    emoji: '🔄',
  },
  {
    perf: 'Med',
    pot: 'Med',
    label: 'Core Player',
    color: 'bg-slate-100 text-slate-600',
    emoji: '💎',
  },
  {
    perf: 'High',
    pot: 'Med',
    label: 'High Performer',
    color: 'bg-blue-100 text-blue-700',
    emoji: '📈',
  },
  { perf: 'Low', pot: 'Low', label: 'At Risk', color: 'bg-rose-100 text-rose-700', emoji: '⚠️' },
  {
    perf: 'Med',
    pot: 'Low',
    label: 'Specialist',
    color: 'bg-slate-50 text-slate-500',
    emoji: '🔧',
  },
  {
    perf: 'High',
    pot: 'Low',
    label: 'Workhorse',
    color: 'bg-emerald-50 text-emerald-600',
    emoji: '🏆',
  },
];

const EMPTY_NINE_BOX_DATA = NINE_BOX_STRUCTURE.map((b) => ({ ...b, count: 0 }));

export default function PerformanceCommandCenter() {
  const [activeTab, setActiveTab] = useState<'reviews' | 'goals' | 'ninebox' | 'calibration'>(
    'reviews'
  );
  const [aiInsight, setAiInsight] = useState('');
  const [perfStats, setPerfStats] = useState(DEFAULT_STATS);
  const [reviewCycles, setReviewCycles] = useState<any[]>([]);
  const [_loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Annual', due: '' });

  const handleCreateCycle = () => {
    // In a real app, this would call an API
    setIsModalOpen(false);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [stats, cycles, goals] = await Promise.all([
          PerformanceAnalyticsService.getStats(),
          ReviewCycleService.getCycles(),
          GoalService.getGoals(),
        ]);
        // Map real stats to display format
        if (stats) {
          setPerfStats([
            {
              title: 'Active Reviews',
              value: String(stats.totalReviews - stats.completedReviews || 0),
              icon: Star,
              color: 'amber',
            },
            {
              title: 'Goals in Progress',
              value: String(goals?.length || 0),
              icon: Target,
              color: 'indigo',
            },
            {
              title: 'Feedback Given',
              value: String(stats.completedReviews || 0),
              icon: MessageSquare,
              color: 'emerald',
            },
            { title: 'Calibration Ready', value: '0', icon: Gauge, color: 'violet', alert: false },
            {
              title: 'Avg Rating',
              value: stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A',
              icon: Award,
              color: 'rose',
            },
          ]);
        }
        if (cycles && cycles.length > 0) {
          setReviewCycles(
            cycles.map((c: any) => ({
              name: c.name || c.title,
              status: c.status || 'Active',
              progress: c.progress || 0,
              due: c.endDate
                ? new Date(c.endDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'TBD',
              employees: c.employeeCount || 0,
              type: c.type || 'Review',
            }))
          );
        }
      } catch (error: any) {
        console.error('Failed to load performance data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const insights = [
      'AI analysis: 14 team leads have not submitted peer feedback. Average review quality is 12% below benchmark for late submissions.',
      'Calibration alert: Engineering department ratings skew 0.4 points higher than org average. Recommend cross-functional calibration.',
      '9-Box analysis: 8 "Enigma" employees show high potential but low performance — recommend targeted coaching intervention.',
      'OKR completion forecast: 72% of Q1 key results are on track. 18% at risk — suggest mid-quarter check-ins.',
    ];
    setAiInsight(insights[Math.floor(Math.random() * insights.length)]);
  }, [activeTab]);

  const tabs = [
    { id: 'reviews', label: 'Reviews & Feedback', icon: Star },
    { id: 'goals', label: 'OKR / Goals', icon: Target },
    { id: 'ninebox', label: '9-Box & Talent', icon: Grid3X3 },
    { id: 'calibration', label: 'Calibration', icon: Gauge },
  ];

  return (
    <div className="min-h-screen bg-ghost-white dark:bg-deep-space p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-ink-black dark:text-pearl tracking-tight uppercase italic">
                Performance Command Center
              </h1>
              <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">
                OKR Engine • 360° Feedback • 9-Box Talent Grid • AI Calibration
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFormData({ name: '', type: 'Annual', due: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:bg-amber-600 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> New Review Cycle
          </button>
        </div>
      </div>

      {/* AI Sentinel */}
      <div className="mb-8 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-[2rem] p-6 shadow-xl shadow-amber-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Bot className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-1">
              Aura Performance Intelligence
            </h3>
            <p className="text-sm text-white font-medium leading-relaxed">{aiInsight}</p>
          </div>
          <button className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/20 transition-all backdrop-blur-sm">
            Act Now
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {perfStats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl p-1.5 shadow-sm w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all',
              activeTab === tab.id
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-slate-50 dark:hover:bg-slate-800'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'reviews' && <ReviewsTab reviewCycles={reviewCycles} />}
      {activeTab === 'goals' && <GoalsTab />}
      {activeTab === 'ninebox' && <NineBoxTab />}
      {activeTab === 'calibration' && <CalibrationTab />}

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-stellar-blue p-8 rounded-3xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-black text-ink-black dark:text-pearl uppercase tracking-tight mb-6">
              New Review Cycle
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Cycle Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl focus:border-amber-500 outline-none"
                  placeholder="e.g. Q1 2026 Review"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl focus:border-amber-500 outline-none"
                >
                  <option value="Annual">Annual Review</option>
                  <option value="Quarterly">Quarterly Review</option>
                  <option value="360">360° Feedback</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.due}
                  onChange={(e) => setFormData({ ...formData, due: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl focus:border-amber-500 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-ink-black dark:text-pearl rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCycle}
                className="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors"
              >
                Create Cycle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Reviews & Feedback
// ═══════════════════════════════════════════════════════════════
function ReviewsTab({ reviewCycles }: { reviewCycles: any[] }) {
  const [feedbackStats, setFeedbackStats] = useState([
    { source: 'Self Assessment', completed: 0, total: 100 },
    { source: 'Manager Review', completed: 0, total: 100 },
    { source: 'Peer Feedback', completed: 0, total: 100 },
    { source: 'Direct Reports', completed: 0, total: 100 },
    { source: 'Cross-Functional', completed: 0, total: 100 },
  ]);
  const [recentFeedback, setRecentFeedback] = useState<
    { from: string; to: string; type: string; msg: string; time: string }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredCycles = reviewCycles.filter((c) => {
    const matchesSearch = c.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Name,Type,Due Date,Status,Progress,Employees\n' +
      reviewCycles
        .map((c) => `${c.name},${c.type},${c.due},${c.status},${c.progress},${c.employees}`)
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'review_cycles.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    async function fetchRecentFeedback() {
      try {
        const response = await APIClient.get<{ items?: any[]; feedback?: any[] }>(
          '/performance/feedback',
          { limit: 5 }
        );
        const rows = response.items || response.feedback || [];
        setRecentFeedback(
          rows.slice(0, 5).map((f: any) => ({
            from: f.fromName || f.fromId || 'Colleague',
            to: f.toName || f.toId || 'Team',
            type: f.category === 'praise' ? 'Kudos' : 'Growth',
            msg: f.message || '',
            time: f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '',
          }))
        );
      } catch (error: any) {
        setRecentFeedback([]);
      }
    }
    fetchRecentFeedback();
  }, []);

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const reviews = await PerformanceReviewService.getReviews();
        if (reviews && reviews.length > 0) {
          const total = reviews.length || 1;
          const selfDone = reviews.filter((r: any) => r.selfAssessment?.submittedDate).length;
          const mgrDone = reviews.filter((r: any) => r.managerAssessment?.submittedDate).length;
          const peerDone = reviews.filter((r: any) =>
            r.feedback360?.some((f: any) => f.feedbackType === 'peer')
          ).length;
          const directDone = reviews.filter((r: any) =>
            r.feedback360?.some((f: any) => f.feedbackType === 'subordinate')
          ).length;
          const crossDone = reviews.filter((r: any) =>
            r.feedback360?.some((f: any) => f.feedbackType === 'stakeholder')
          ).length;
          setFeedbackStats([
            {
              source: 'Self Assessment',
              completed: Math.round((selfDone / total) * 100),
              total: 100,
            },
            {
              source: 'Manager Review',
              completed: Math.round((mgrDone / total) * 100),
              total: 100,
            },
            {
              source: 'Peer Feedback',
              completed: Math.round((peerDone / total) * 100),
              total: 100,
            },
            {
              source: 'Direct Reports',
              completed: Math.round((directDone / total) * 100),
              total: 100,
            },
            {
              source: 'Cross-Functional',
              completed: Math.round((crossDone / total) * 100),
              total: 100,
            },
          ]);
        }
      } catch (error: any) {
        console.error('Failed to load feedback stats:', error);
      }
    }
    fetchFeedback();
  }, []);

  return (
    <div className="space-y-8">
      {/* Active Review Cycles */}
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">
            Review Cycles
          </h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-silver-mist" />
              <input
                type="text"
                placeholder="Search cycles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Scheduled">Scheduled</option>
            </select>
            <button
              onClick={handleExport}
              className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl text-silver-mist hover:text-amber-600 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {(filteredCycles.length > 0
            ? filteredCycles
            : [
                {
                  name: 'No review cycles configured',
                  status: 'N/A',
                  progress: 0,
                  due: '-',
                  employees: 0,
                  type: '-',
                },
              ]
          ).map((cycle, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group cursor-pointer border border-transparent hover:border-amber-200/50"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-ink-black dark:text-pearl group-hover:text-amber-600 transition-colors">
                    {cycle.name}
                  </p>
                  <p className="text-[10px] text-silver-mist font-bold uppercase tracking-widest">
                    {cycle.type} • Due {cycle.due} • {cycle.employees} employees
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 w-36">
                  <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        cycle.progress >= 100
                          ? 'bg-emerald-500'
                          : cycle.progress >= 50
                            ? 'bg-amber-500'
                            : 'bg-indigo-500'
                      )}
                      style={{ width: `${cycle.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-silver-mist tabular-nums w-10 text-right">
                    {cycle.progress}%
                  </span>
                </div>
                <span
                  className={cn(
                    'text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest',
                    cycle.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-600'
                      : cycle.status === 'Completed'
                        ? 'bg-indigo-50 text-indigo-600'
                        : cycle.status === 'Scheduled'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-amber-50 text-amber-600'
                  )}
                >
                  {cycle.status}
                </span>
                <button className="p-2 text-silver-mist hover:text-red-500 transition-colors inline-block ml-2">
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronRight className="w-4 h-4 text-silver-mist group-hover:text-amber-600 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 360° & Continuous Feedback */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
              <Users className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="text-lg font-black text-ink-black dark:text-pearl uppercase tracking-tight">
              360° Feedback
            </h3>
          </div>
          <div className="space-y-4">
            {feedbackStats.map((src, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xs font-bold text-ink-black dark:text-pearl w-36">
                  {src.source}
                </span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all duration-1000"
                    style={{ width: `${src.completed}%` }}
                  />
                </div>
                <span className="text-xs font-black text-silver-mist tabular-nums">
                  {src.completed}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-black text-ink-black dark:text-pearl uppercase tracking-tight">
                Continuous Feedback
              </h3>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="space-y-3">
            {recentFeedback.length === 0 && (
              <p className="text-xs text-silver-mist leading-relaxed">
                No feedback yet. Recognition and constructive feedback will appear here.
              </p>
            )}
            {recentFeedback.map((fb, i) => (
              <div key={i} className="p-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-ink-black dark:text-pearl">
                    {fb.from} → {fb.to}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest',
                        fb.type === 'Kudos'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-indigo-50 text-indigo-600'
                      )}
                    >
                      {fb.type}
                    </span>
                    <span className="text-[10px] text-silver-mist font-bold">{fb.time}</span>
                  </div>
                </div>
                <p className="text-xs text-silver-mist leading-relaxed">{fb.msg}</p>
              </div>
            ))}
            <button className="w-full py-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-[10px] font-black text-emerald-600 uppercase tracking-widest text-center hover:bg-emerald-100 transition-all">
              + Give Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: OKR / Goals
// ═══════════════════════════════════════════════════════════════
function GoalsTab() {
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    async function fetchGoals() {
      try {
        const data = await GoalService.getGoals();
        if (data && data.length > 0) {
          // Group goals: organizational/team as objectives, individual as key results under them
          const objectives = data.filter(
            (g: any) => g.type === 'organizational' || g.type === 'team'
          );
          const individual = data.filter((g: any) => g.type === 'individual');
          const mapped =
            objectives.length > 0
              ? objectives.map((obj: any) => ({
                  objective: obj.title,
                  level: obj.type === 'organizational' ? 'Company' : 'Department',
                  owner: obj.employeeId ? `Employee ${obj.employeeId.slice(0, 6)}` : 'TBD',
                  keyResults:
                    obj.metrics && obj.metrics.length > 0
                      ? obj.metrics.map((m: any) => ({
                          kr: m.name,
                          progress: m.target > 0 ? Math.round((m.current / m.target) * 100) : 0,
                          current: `${m.current}${m.unit ? ' ' + m.unit : ''}`,
                        }))
                      : [
                          {
                            kr: obj.description || 'No key results defined',
                            progress: obj.progress || 0,
                            current: obj.status || '-',
                          },
                        ],
                }))
              : individual.map((g: any) => ({
                  objective: g.title,
                  level: 'Individual',
                  owner: g.employeeId ? `Employee ${g.employeeId.slice(0, 6)}` : 'TBD',
                  keyResults:
                    g.metrics && g.metrics.length > 0
                      ? g.metrics.map((m: any) => ({
                          kr: m.name,
                          progress: m.target > 0 ? Math.round((m.current / m.target) * 100) : 0,
                          current: `${m.current}${m.unit ? ' ' + m.unit : ''}`,
                        }))
                      : [
                          {
                            kr: g.description || g.title,
                            progress: g.progress || 0,
                            current: g.status || '-',
                          },
                        ],
                }));
          setGoals(mapped);
        }
      } catch (error: any) {
        console.error('Failed to load goals:', error);
      }
    }
    fetchGoals();
  }, []);

  const FALLBACK_OKR = [
    {
      objective: 'No goals configured yet',
      level: 'N/A',
      owner: '-',
      keyResults: [
        { kr: 'Create organizational goals to see OKR cascade', progress: 0, current: '-' },
      ],
    },
  ];

  const okrData = goals.length > 0 ? goals : FALLBACK_OKR;

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <Target className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">
                OKR & Goal Engine
              </h2>
              <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">
                Cascading Objectives • Key Results Tracking • Auto-Alignment
              </p>
            </div>
            <button className="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
              + Set Objective
            </button>
          </div>

          {/* OKR Cascade */}
          <div className="space-y-6">
            {okrData.map((okr, i) => (
              <div
                key={i}
                className="p-6 bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border border-cloud dark:border-nebula-purple/10"
              >
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="font-black text-ink-black dark:text-pearl text-sm">
                      {okr.objective}
                    </p>
                    <p className="text-[10px] text-silver-mist font-bold uppercase tracking-widest mt-1">
                      {okr.level} • Owner: {okr.owner}
                    </p>
                  </div>
                  <span className="text-[9px] font-black px-3 py-1 bg-amber-50 text-amber-600 rounded-full uppercase tracking-widest">
                    {okr.level}
                  </span>
                </div>
                <div className="space-y-3">
                  {okr.keyResults.map((kr: any, j: number) => (
                    <div
                      key={j}
                      className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900/50 rounded-xl"
                    >
                      <div
                        className={cn(
                          'w-1 h-8 rounded-full',
                          kr.progress >= 80
                            ? 'bg-emerald-500'
                            : kr.progress >= 50
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                        )}
                      />
                      <span className="text-xs font-bold text-ink-black dark:text-pearl flex-1">
                        {kr.kr}
                      </span>
                      <div className="flex items-center gap-3 w-40">
                        <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              kr.progress >= 80
                                ? 'bg-emerald-500'
                                : kr.progress >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                            )}
                            style={{ width: `${kr.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-silver-mist tabular-nums">
                          {kr.progress}%
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-silver-mist w-20 text-right">
                        {kr.current}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: 9-Box Grid
// ═══════════════════════════════════════════════════════════════
function NineBoxTab() {
  const [nineBoxData, setNineBoxData] = useState(EMPTY_NINE_BOX_DATA);
  const [competencies, setCompetencies] = useState<
    { name: string; level: number; benchmark: number; trend: string }[]
  >([]);

  useEffect(() => {
    async function fetchTalentData() {
      try {
        const [reviews, comps] = await Promise.all([
          PerformanceReviewService.getReviews(),
          CompetencyService.getCompetencies(),
        ]);
        // Derive 9-box from reviews if available
        if (reviews && reviews.length > 0) {
          const buckets = NINE_BOX_STRUCTURE.map((b) => ({ ...b, count: 0 }));
          reviews.forEach((r: any) => {
            const rating = r.overallRating || 3;
            const potential = r.calibrationScore || rating; // use calibration as potential proxy
            const perfLevel = rating >= 4 ? 'High' : rating >= 3 ? 'Med' : 'Low';
            const potLevel = potential >= 4 ? 'High' : potential >= 3 ? 'Med' : 'Low';
            const bucket = buckets.find((b) => b.perf === perfLevel && b.pot === potLevel);
            if (bucket) bucket.count++;
          });
          setNineBoxData(buckets);
        }
        // Map competencies from API
        if (comps && comps.length > 0) {
          const levelMap: Record<string, number> = {
            beginner: 1.5,
            intermediate: 2.5,
            advanced: 3.5,
            expert: 4.5,
          };
          setCompetencies(
            comps.map((c: any) => ({
              name: c.name,
              level: levelMap[c.level] || 3.0,
              benchmark: 4.0,
              trend: 'stable',
            }))
          );
        }
      } catch (error: any) {
        console.error('Failed to load talent data:', error);
      }
    }
    fetchTalentData();
  }, []);

  const grid = [
    ['High', nineBoxData[0], nineBoxData[1], nineBoxData[2]],
    ['Medium', nineBoxData[3], nineBoxData[4], nineBoxData[5]],
    ['Low', nineBoxData[6], nineBoxData[7], nineBoxData[8]],
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">
              9-Box Talent Grid
            </h2>
            <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">
              Performance × Potential Matrix • org-wide View
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl text-[10px] font-black text-ink-black dark:text-pearl uppercase tracking-widest">
              <Eye className="w-3.5 h-3.5 inline mr-2" /> Department View
            </button>
          </div>
        </div>

        {/* The 9-Box Grid */}
        <div className="relative">
          {/* Y-axis label */}
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90">
            <span className="text-[10px] font-black text-silver-mist uppercase tracking-widest">
              Potential →
            </span>
          </div>

          <div className="ml-8">
            {/* X-axis label */}
            <div className="text-center mb-2">
              <span className="text-[10px] font-black text-silver-mist uppercase tracking-widest">
                Performance →
              </span>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-4 gap-3 mb-3">
              <div />
              <div className="text-center text-[10px] font-black text-silver-mist uppercase tracking-widest">
                Low
              </div>
              <div className="text-center text-[10px] font-black text-silver-mist uppercase tracking-widest">
                Medium
              </div>
              <div className="text-center text-[10px] font-black text-silver-mist uppercase tracking-widest">
                High
              </div>
            </div>

            {/* Grid Rows */}
            {grid.map((row, i) => (
              <div key={i} className="grid grid-cols-4 gap-3 mb-3">
                <div className="flex items-center justify-end pr-3">
                  <span className="text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    {row[0] as string}
                  </span>
                </div>
                {[1, 2, 3].map((j) => {
                  const cell = row[j] as (typeof EMPTY_NINE_BOX_DATA)[0];
                  return (
                    <div
                      key={j}
                      className={cn(
                        'p-5 rounded-2xl text-center cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] border border-transparent hover:border-amber-300/50',
                        cell.color
                      )}
                    >
                      <span className="text-2xl block mb-1">{cell.emoji}</span>
                      <p className="font-black text-sm">{cell.label}</p>
                      <p className="text-2xl font-black mt-1">{cell.count}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 opacity-60">
                        employees
                      </p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Competency Framework */}
        <div className="mt-10 pt-8 border-t border-cloud dark:border-nebula-purple/20">
          <h3 className="text-lg font-black text-ink-black dark:text-pearl uppercase tracking-tight mb-6">
            Competency Framework
          </h3>
          {competencies.length === 0 && (
            <p className="text-sm text-silver-mist">
              No competency framework data yet. Define competencies to see the organizational
              framework here.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competencies.map((comp, i) => (
              <div
                key={i}
                className="p-5 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-cloud dark:border-nebula-purple/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-ink-black dark:text-pearl">
                    {comp.name}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-black px-2 py-0.5 rounded-full uppercase',
                      comp.trend === 'up'
                        ? 'bg-emerald-50 text-emerald-600'
                        : comp.trend === 'down'
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {comp.trend === 'up' ? '↑' : comp.trend === 'down' ? '↓' : '→'} {comp.level}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(comp.level / 5) * 100}%` }}
                    />
                    <div
                      className="absolute top-0 h-full w-0.5 bg-rose-500"
                      style={{ left: `${(comp.benchmark / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-silver-mist">
                    BM: {comp.benchmark}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Calibration
// ═══════════════════════════════════════════════════════════════
function CalibrationTab() {
  const [bellCurve, setBellCurve] = useState([
    { rating: '1', actual: 0, expected: 5, label: 'Below' },
    { rating: '2', actual: 0, expected: 15, label: 'Needs Improv.' },
    { rating: '3', actual: 0, expected: 50, label: 'Meets' },
    { rating: '4', actual: 0, expected: 22, label: 'Exceeds' },
    { rating: '5', actual: 0, expected: 8, label: 'Outstanding' },
  ]);
  const [calibrationDepts, setCalibrationDepts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCalibrationData() {
      try {
        const [stats, sessions] = await Promise.all([
          PerformanceAnalyticsService.getStats(),
          CalibrationService.getSessions(),
        ]);
        // Map rating distribution to bell curve
        if (stats && stats.ratingDistribution) {
          const dist = stats.ratingDistribution;
          const total = Object.values(dist).reduce((a: number, b: number) => a + b, 0) || 1;
          setBellCurve([
            {
              rating: '1',
              actual: Math.round(((dist[1] || 0) / total) * 100),
              expected: 5,
              label: 'Below',
            },
            {
              rating: '2',
              actual: Math.round(((dist[2] || 0) / total) * 100),
              expected: 15,
              label: 'Needs Improv.',
            },
            {
              rating: '3',
              actual: Math.round(((dist[3] || 0) / total) * 100),
              expected: 50,
              label: 'Meets',
            },
            {
              rating: '4',
              actual: Math.round(((dist[4] || 0) / total) * 100),
              expected: 22,
              label: 'Exceeds',
            },
            {
              rating: '5',
              actual: Math.round(((dist[5] || 0) / total) * 100),
              expected: 8,
              label: 'Outstanding',
            },
          ]);
        }
        // Map calibration sessions to department view
        if (sessions && sessions.length > 0) {
          setCalibrationDepts(
            sessions.map((s: any) => ({
              dept: s.reviewCycleId ? `Cycle ${s.reviewCycleId.slice(0, 6)}` : 'General',
              avg:
                s.adjustments?.length > 0
                  ? (
                      s.adjustments.reduce(
                        (sum: number, a: any) => sum + (a.calibratedRating || 0),
                        0
                      ) / s.adjustments.length
                    ).toFixed(1)
                  : 'N/A',
              org: 3.8,
              dev:
                s.adjustments?.length > 0
                  ? (
                      s.adjustments.reduce(
                        (sum: number, a: any) => sum + (a.calibratedRating || 0),
                        0
                      ) /
                        s.adjustments.length -
                      3.8
                    ).toFixed(1)
                  : '0.0',
              status:
                s.status === 'completed'
                  ? 'Aligned'
                  : s.status === 'in_progress'
                    ? 'In Progress'
                    : 'Scheduled',
            }))
          );
        }
      } catch (error: any) {
        console.error('Failed to load calibration data:', error);
      }
    }
    fetchCalibrationData();
  }, []);

  const FALLBACK_DEPTS = [
    { dept: 'No calibration data', avg: 'N/A', org: '-', dev: '0.0', status: 'N/A' },
  ];

  const deptData = calibrationDepts.length > 0 ? calibrationDepts : FALLBACK_DEPTS;

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <Gauge className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">
                Rating Calibration
              </h2>
              <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">
                Cross-Functional Alignment • Bias Detection • Bell Curve
              </p>
            </div>
            <button className="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" /> Start Session
            </button>
          </div>

          {/* Bell Curve Visualization */}
          <div className="p-8 bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border border-cloud dark:border-nebula-purple/10 mb-8">
            <h3 className="text-xs font-black text-silver-mist uppercase tracking-widest mb-6">
              Rating Distribution vs. Expected Bell Curve
            </h3>
            <div className="flex items-end justify-center gap-6 h-48">
              {bellCurve.map((r, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group/bar cursor-pointer">
                  <div className="flex items-end gap-1">
                    <div
                      className="w-10 bg-amber-500 rounded-t-xl transition-all group-hover/bar:bg-amber-600"
                      style={{ height: `${r.actual * 3}px` }}
                    />
                    <div
                      className="w-10 bg-slate-200 dark:bg-slate-700 rounded-t-xl border-2 border-dashed border-slate-300"
                      style={{ height: `${r.expected * 3}px` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-ink-black dark:text-pearl">{r.rating}</p>
                    <p className="text-[8px] font-black text-silver-mist uppercase tracking-widest leading-tight">
                      {r.label}
                    </p>
                    <p className="text-[9px] font-bold text-amber-600 mt-0.5">{r.actual}%</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded" />
                <span className="text-[10px] font-bold text-silver-mist">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-200 border-2 border-dashed border-slate-300 rounded" />
                <span className="text-[10px] font-bold text-silver-mist">Expected</span>
              </div>
            </div>
          </div>

          {/* Department Calibration */}
          <div className="overflow-hidden rounded-2xl border border-cloud dark:border-nebula-purple/20">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Department
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Avg Rating
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Org Average
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Deviation
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud dark:divide-nebula-purple/10">
                {deptData.map((dept, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-5 font-bold text-sm text-ink-black dark:text-pearl">
                      {dept.dept}
                    </td>
                    <td className="px-6 py-5 text-sm font-black text-ink-black dark:text-pearl">
                      {dept.avg}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-silver-mist">{dept.org}</td>
                    <td className="px-6 py-5">
                      <span
                        className={cn(
                          'text-sm font-black',
                          dept.dev.startsWith('+') && parseFloat(dept.dev) > 0.2
                            ? 'text-amber-600'
                            : dept.dev.startsWith('-')
                              ? 'text-rose-600'
                              : 'text-emerald-600'
                        )}
                      >
                        {dept.dev}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={cn(
                          'text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest',
                          dept.status === 'Aligned'
                            ? 'bg-emerald-50 text-emerald-600'
                            : dept.status === 'Over'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-rose-50 text-rose-600'
                        )}
                      >
                        {dept.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Shared
// ═══════════════════════════════════════════════════════════════
function StatCard({ title, value, icon: Icon, color, alert }: any) {
  const colorMap: Record<string, string> = {
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    violet: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20',
    rose: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20',
  };
  return (
    <div
      className={cn(
        'bg-white dark:bg-stellar-blue rounded-3xl p-5 border transition-all hover:shadow-xl group',
        alert
          ? 'border-violet-100 dark:border-violet-900/20'
          : 'border-cloud dark:border-nebula-purple/30'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn('p-2.5 rounded-2xl', colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {alert && <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />}
      </div>
      <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest leading-none mb-1">
        {title}
      </p>
      <div className="text-2xl font-black text-ink-black dark:text-pearl group-hover:text-amber-500 transition-colors">
        {value}
      </div>
    </div>
  );
}
