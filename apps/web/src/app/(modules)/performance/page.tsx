'use client';

import React, { useState, useEffect } from 'react';
import {
  Target, Star, Users, TrendingUp,
  CheckCircle2, AlertCircle, BarChart3,
  ChevronRight, Plus, RefreshCw, Zap,
  Bot, Sparkles, MessageSquare, Award,
  Grid3X3, ArrowUpRight, Settings2,
  Gauge, UserCheck, GitBranch,
  Lightbulb, ThumbsUp, Eye
} from 'lucide-react';
import { cn } from '@aura/ui/src/lib/utils';
import Link from 'next/link';

// ── Mock Data ──────────────────────────────────────────────────────────
const PERF_STATS = [
  { title: 'Active Reviews', value: '142', icon: Star, color: 'amber' },
  { title: 'Goals in Progress', value: '386', icon: Target, color: 'indigo' },
  { title: 'Feedback Given', value: '1.2K', icon: MessageSquare, color: 'emerald' },
  { title: 'Calibration Ready', value: '3', icon: Gauge, color: 'violet', alert: true },
  { title: 'Avg Rating', value: '3.8', icon: Award, color: 'rose' },
];

const REVIEW_CYCLES = [
  { name: 'Annual Review 2025-26', status: 'Active', progress: 68, due: 'Mar 31', employees: 450, type: 'Annual' },
  { name: 'Q4 OKR Check-in', status: 'Completed', progress: 100, due: 'Jan 15', employees: 380, type: 'Quarterly' },
  { name: 'Probation Review - Feb', status: 'In Progress', progress: 45, due: 'Feb 28', employees: 12, type: 'Probation' },
  { name: '360° Leadership Assessment', status: 'Scheduled', progress: 0, due: 'Apr 15', employees: 24, type: '360° Feedback' },
];

const NINE_BOX_DATA = [
  // [performance, potential, count, label]
  { perf: 'Low', pot: 'High', count: 8, label: 'Enigma', color: 'bg-amber-100 text-amber-700', emoji: '🌟' },
  { perf: 'Med', pot: 'High', count: 22, label: 'Growth Star', color: 'bg-emerald-100 text-emerald-700', emoji: '🚀' },
  { perf: 'High', pot: 'High', count: 35, label: 'Superstar', color: 'bg-indigo-100 text-indigo-700', emoji: '⭐' },
  { perf: 'Low', pot: 'Med', count: 15, label: 'Inconsistent', color: 'bg-rose-50 text-rose-600', emoji: '🔄' },
  { perf: 'Med', pot: 'Med', count: 180, label: 'Core Player', color: 'bg-slate-100 text-slate-600', emoji: '💎' },
  { perf: 'High', pot: 'Med', count: 95, label: 'High Performer', color: 'bg-blue-100 text-blue-700', emoji: '📈' },
  { perf: 'Low', pot: 'Low', count: 12, label: 'At Risk', color: 'bg-rose-100 text-rose-700', emoji: '⚠️' },
  { perf: 'Med', pot: 'Low', count: 45, label: 'Specialist', color: 'bg-slate-50 text-slate-500', emoji: '🔧' },
  { perf: 'High', pot: 'Low', count: 38, label: 'Workhorse', color: 'bg-emerald-50 text-emerald-600', emoji: '🏆' },
];

const COMPETENCIES = [
  { name: 'Leadership & Strategy', level: 4.2, benchmark: 4.0, trend: 'up' },
  { name: 'Technical Excellence', level: 4.5, benchmark: 4.0, trend: 'up' },
  { name: 'Communication', level: 3.8, benchmark: 4.0, trend: 'down' },
  { name: 'Innovation & Agility', level: 4.1, benchmark: 3.5, trend: 'up' },
  { name: 'Customer Focus', level: 3.9, benchmark: 4.0, trend: 'stable' },
  { name: 'Collaboration', level: 4.3, benchmark: 3.5, trend: 'up' },
];

export default function PerformanceCommandCenter() {
  const [activeTab, setActiveTab] = useState<'reviews' | 'goals' | 'ninebox' | 'calibration'>('reviews');
  const [aiInsight, setAiInsight] = useState('');

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
          <button className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:bg-amber-600 active:scale-95 transition-all">
            <Plus className="w-4 h-4" /> New Review Cycle
          </button>
        </div>
      </div>

      {/* AI Sentinel */}
      <div className="mb-8 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-[2rem] p-6 shadow-xl shadow-amber-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10"><Bot className="w-32 h-32" /></div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><Sparkles className="w-5 h-5 text-white" /></div>
          <div className="flex-1">
            <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-1">Aura Performance Intelligence</h3>
            <p className="text-sm text-white font-medium leading-relaxed">{aiInsight}</p>
          </div>
          <button className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/20 transition-all backdrop-blur-sm">Act Now</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {PERF_STATS.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl p-1.5 shadow-sm w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all",
              activeTab === tab.id ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-slate-50 dark:hover:bg-slate-800"
            )}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'reviews' && <ReviewsTab />}
      {activeTab === 'goals' && <GoalsTab />}
      {activeTab === 'ninebox' && <NineBoxTab />}
      {activeTab === 'calibration' && <CalibrationTab />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Reviews & Feedback
// ═══════════════════════════════════════════════════════════════
function ReviewsTab() {
  return (
    <div className="space-y-8">
      {/* Active Review Cycles */}
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">Review Cycles</h2>
          <button className="text-[10px] font-black text-amber-600 uppercase tracking-widest">View All Cycles</button>
        </div>
        <div className="space-y-4">
          {REVIEW_CYCLES.map((cycle, i) => (
            <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group cursor-pointer border border-transparent hover:border-amber-200/50">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-ink-black dark:text-pearl group-hover:text-amber-600 transition-colors">{cycle.name}</p>
                  <p className="text-[10px] text-silver-mist font-bold uppercase tracking-widest">{cycle.type} • Due {cycle.due} • {cycle.employees} employees</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 w-36">
                  <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all",
                      cycle.progress >= 100 ? "bg-emerald-500" : cycle.progress >= 50 ? "bg-amber-500" : "bg-indigo-500"
                    )} style={{ width: `${cycle.progress}%` }} />
                  </div>
                  <span className="text-xs font-black text-silver-mist tabular-nums w-10 text-right">{cycle.progress}%</span>
                </div>
                <span className={cn("text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                  cycle.status === 'Active' ? "bg-emerald-50 text-emerald-600" :
                    cycle.status === 'Completed' ? "bg-indigo-50 text-indigo-600" :
                      cycle.status === 'Scheduled' ? "bg-slate-100 text-slate-500" :
                        "bg-amber-50 text-amber-600"
                )}>{cycle.status}</span>
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
            <div className="p-2.5 bg-violet-50 dark:bg-violet-900/20 rounded-xl"><Users className="w-5 h-5 text-violet-600" /></div>
            <h3 className="text-lg font-black text-ink-black dark:text-pearl uppercase tracking-tight">360° Feedback</h3>
          </div>
          <div className="space-y-4">
            {[
              { source: 'Self Assessment', completed: 85, total: 100 },
              { source: 'Manager Review', completed: 72, total: 100 },
              { source: 'Peer Feedback', completed: 58, total: 100 },
              { source: 'Direct Reports', completed: 40, total: 100 },
              { source: 'Cross-Functional', completed: 25, total: 100 },
            ].map((src, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xs font-bold text-ink-black dark:text-pearl w-36">{src.source}</span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full transition-all duration-1000" style={{ width: `${src.completed}%` }} />
                </div>
                <span className="text-xs font-black text-silver-mist tabular-nums">{src.completed}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl"><MessageSquare className="w-5 h-5 text-emerald-600" /></div>
              <h3 className="text-lg font-black text-ink-black dark:text-pearl uppercase tracking-tight">Continuous Feedback</h3>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="space-y-3">
            {[
              { from: 'Sara Al Blooshi', to: 'Ahmed M.', type: 'Kudos', msg: 'Excellent client presentation — exceeded expectations!', time: '2h ago' },
              { from: 'Ravi Patel', to: 'Priya S.', type: 'Growth', msg: 'Consider deeper data analysis in quarterly reports.', time: '5h ago' },
              { from: 'Khalid R.', to: 'Team Ops', type: 'Kudos', msg: 'Flawless project delivery ahead of schedule 🎯', time: '1d ago' },
            ].map((fb, i) => (
              <div key={i} className="p-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-ink-black dark:text-pearl">{fb.from} → {fb.to}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                      fb.type === 'Kudos' ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                    )}>{fb.type}</span>
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
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <Target className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">OKR & Goal Engine</h2>
              <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">Cascading Objectives • Key Results Tracking • Auto-Alignment</p>
            </div>
            <button className="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all">+ Set Objective</button>
          </div>

          {/* OKR Cascade */}
          <div className="space-y-6">
            {[
              {
                objective: 'Achieve 95% customer satisfaction score',
                level: 'Company', owner: 'CEO',
                keyResults: [
                  { kr: 'NPS score ≥ 70', progress: 85, current: '67' },
                  { kr: 'Support resolution < 4hrs', progress: 72, current: '4.8h' },
                  { kr: 'Zero critical escalations', progress: 90, current: '1 pending' },
                ],
              },
              {
                objective: 'Launch 3 new product features',
                level: 'Department', owner: 'VP Engineering',
                keyResults: [
                  { kr: 'Feature A shipped by Feb', progress: 100, current: 'Done ✓' },
                  { kr: 'Feature B beta by Mar', progress: 60, current: 'In Dev' },
                  { kr: 'Feature C design approved', progress: 35, current: 'Review' },
                ],
              },
            ].map((okr, i) => (
              <div key={i} className="p-6 bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border border-cloud dark:border-nebula-purple/10">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="font-black text-ink-black dark:text-pearl text-sm">{okr.objective}</p>
                    <p className="text-[10px] text-silver-mist font-bold uppercase tracking-widest mt-1">{okr.level} • Owner: {okr.owner}</p>
                  </div>
                  <span className="text-[9px] font-black px-3 py-1 bg-amber-50 text-amber-600 rounded-full uppercase tracking-widest">{okr.level}</span>
                </div>
                <div className="space-y-3">
                  {okr.keyResults.map((kr, j) => (
                    <div key={j} className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900/50 rounded-xl">
                      <div className={cn("w-1 h-8 rounded-full",
                        kr.progress >= 80 ? "bg-emerald-500" : kr.progress >= 50 ? "bg-amber-500" : "bg-rose-500"
                      )} />
                      <span className="text-xs font-bold text-ink-black dark:text-pearl flex-1">{kr.kr}</span>
                      <div className="flex items-center gap-3 w-40">
                        <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full",
                            kr.progress >= 80 ? "bg-emerald-500" : kr.progress >= 50 ? "bg-amber-500" : "bg-rose-500"
                          )} style={{ width: `${kr.progress}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-silver-mist tabular-nums">{kr.progress}%</span>
                      </div>
                      <span className="text-[10px] font-bold text-silver-mist w-20 text-right">{kr.current}</span>
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
  const grid = [
    ['High', NINE_BOX_DATA[0], NINE_BOX_DATA[1], NINE_BOX_DATA[2]],
    ['Medium', NINE_BOX_DATA[3], NINE_BOX_DATA[4], NINE_BOX_DATA[5]],
    ['Low', NINE_BOX_DATA[6], NINE_BOX_DATA[7], NINE_BOX_DATA[8]],
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">9-Box Talent Grid</h2>
            <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">Performance × Potential Matrix • org-wide View</p>
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
            <span className="text-[10px] font-black text-silver-mist uppercase tracking-widest">Potential →</span>
          </div>

          <div className="ml-8">
            {/* X-axis label */}
            <div className="text-center mb-2">
              <span className="text-[10px] font-black text-silver-mist uppercase tracking-widest">Performance →</span>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-4 gap-3 mb-3">
              <div />
              <div className="text-center text-[10px] font-black text-silver-mist uppercase tracking-widest">Low</div>
              <div className="text-center text-[10px] font-black text-silver-mist uppercase tracking-widest">Medium</div>
              <div className="text-center text-[10px] font-black text-silver-mist uppercase tracking-widest">High</div>
            </div>

            {/* Grid Rows */}
            {grid.map((row, i) => (
              <div key={i} className="grid grid-cols-4 gap-3 mb-3">
                <div className="flex items-center justify-end pr-3">
                  <span className="text-[10px] font-black text-silver-mist uppercase tracking-widest">{row[0] as string}</span>
                </div>
                {[1, 2, 3].map(j => {
                  const cell = row[j] as typeof NINE_BOX_DATA[0];
                  return (
                    <div key={j} className={cn(
                      "p-5 rounded-2xl text-center cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] border border-transparent hover:border-amber-300/50",
                      cell.color
                    )}>
                      <span className="text-2xl block mb-1">{cell.emoji}</span>
                      <p className="font-black text-sm">{cell.label}</p>
                      <p className="text-2xl font-black mt-1">{cell.count}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 opacity-60">employees</p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Competency Framework */}
        <div className="mt-10 pt-8 border-t border-cloud dark:border-nebula-purple/20">
          <h3 className="text-lg font-black text-ink-black dark:text-pearl uppercase tracking-tight mb-6">Competency Framework</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMPETENCIES.map((comp, i) => (
              <div key={i} className="p-5 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-cloud dark:border-nebula-purple/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-ink-black dark:text-pearl">{comp.name}</span>
                  <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full uppercase",
                    comp.trend === 'up' ? "bg-emerald-50 text-emerald-600" :
                      comp.trend === 'down' ? "bg-rose-50 text-rose-600" :
                        "bg-slate-100 text-slate-500"
                  )}>
                    {comp.trend === 'up' ? '↑' : comp.trend === 'down' ? '↓' : '→'} {comp.level}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(comp.level / 5) * 100}%` }} />
                    <div className="absolute top-0 h-full w-0.5 bg-rose-500" style={{ left: `${(comp.benchmark / 5) * 100}%` }} />
                  </div>
                  <span className="text-[9px] font-bold text-silver-mist">BM: {comp.benchmark}</span>
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
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <Gauge className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">Rating Calibration</h2>
              <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">Cross-Functional Alignment • Bias Detection • Bell Curve</p>
            </div>
            <button className="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" /> Start Session
            </button>
          </div>

          {/* Bell Curve Visualization */}
          <div className="p-8 bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border border-cloud dark:border-nebula-purple/10 mb-8">
            <h3 className="text-xs font-black text-silver-mist uppercase tracking-widest mb-6">Rating Distribution vs. Expected Bell Curve</h3>
            <div className="flex items-end justify-center gap-6 h-48">
              {[
                { rating: '1', actual: 3, expected: 5, label: 'Below' },
                { rating: '2', actual: 12, expected: 15, label: 'Needs Improv.' },
                { rating: '3', actual: 45, expected: 50, label: 'Meets' },
                { rating: '4', actual: 30, expected: 22, label: 'Exceeds' },
                { rating: '5', actual: 10, expected: 8, label: 'Outstanding' },
              ].map((r, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group/bar cursor-pointer">
                  <div className="flex items-end gap-1">
                    <div className="w-10 bg-amber-500 rounded-t-xl transition-all group-hover/bar:bg-amber-600"
                      style={{ height: `${r.actual * 3}px` }} />
                    <div className="w-10 bg-slate-200 dark:bg-slate-700 rounded-t-xl border-2 border-dashed border-slate-300"
                      style={{ height: `${r.expected * 3}px` }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-ink-black dark:text-pearl">{r.rating}</p>
                    <p className="text-[8px] font-black text-silver-mist uppercase tracking-widest leading-tight">{r.label}</p>
                    <p className="text-[9px] font-bold text-amber-600 mt-0.5">{r.actual}%</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded" /><span className="text-[10px] font-bold text-silver-mist">Actual</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-200 border-2 border-dashed border-slate-300 rounded" /><span className="text-[10px] font-bold text-silver-mist">Expected</span></div>
            </div>
          </div>

          {/* Department Calibration */}
          <div className="overflow-hidden rounded-2xl border border-cloud dark:border-nebula-purple/20">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Department</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Avg Rating</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Org Average</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Deviation</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud dark:divide-nebula-purple/10">
                {[
                  { dept: 'Engineering', avg: 4.2, org: 3.8, dev: '+0.4', status: 'Over' },
                  { dept: 'Sales', avg: 3.9, org: 3.8, dev: '+0.1', status: 'Aligned' },
                  { dept: 'Finance', avg: 3.5, org: 3.8, dev: '-0.3', status: 'Under' },
                  { dept: 'Operations', avg: 3.8, org: 3.8, dev: '0.0', status: 'Aligned' },
                  { dept: 'HR', avg: 4.0, org: 3.8, dev: '+0.2', status: 'Aligned' },
                ].map((dept, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                    <td className="px-6 py-5 font-bold text-sm text-ink-black dark:text-pearl">{dept.dept}</td>
                    <td className="px-6 py-5 text-sm font-black text-ink-black dark:text-pearl">{dept.avg}</td>
                    <td className="px-6 py-5 text-sm font-bold text-silver-mist">{dept.org}</td>
                    <td className="px-6 py-5">
                      <span className={cn("text-sm font-black",
                        dept.dev.startsWith('+') && parseFloat(dept.dev) > 0.2 ? "text-amber-600" :
                          dept.dev.startsWith('-') ? "text-rose-600" : "text-emerald-600"
                      )}>{dept.dev}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn("text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                        dept.status === 'Aligned' ? "bg-emerald-50 text-emerald-600" :
                          dept.status === 'Over' ? "bg-amber-50 text-amber-600" :
                            "bg-rose-50 text-rose-600"
                      )}>{dept.status}</span>
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
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
    indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
    violet: "text-violet-600 bg-violet-50 dark:bg-violet-900/20",
    rose: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
  };
  return (
    <div className={cn("bg-white dark:bg-stellar-blue rounded-3xl p-5 border transition-all hover:shadow-xl group",
      alert ? "border-violet-100 dark:border-violet-900/20" : "border-cloud dark:border-nebula-purple/30"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn("p-2.5 rounded-2xl", colorMap[color])}><Icon className="w-5 h-5" /></div>
        {alert && <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />}
      </div>
      <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest leading-none mb-1">{title}</p>
      <div className="text-2xl font-black text-ink-black dark:text-pearl group-hover:text-amber-500 transition-colors">{value}</div>
    </div>
  );
}
