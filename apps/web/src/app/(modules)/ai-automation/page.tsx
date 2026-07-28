'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Bot,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Search,
  BarChart3,
  Zap,
  Users,
  AlertCircle,
  CheckCircle2,
  PieChart,
  ArrowUpRight,
  Settings2,
  Globe,
  Type,
  Activity,
  Eye,
  FileText,
  Lightbulb,
  Target,
  Shield,
  ChevronRight,
  Plus,
  RefreshCw,
  Trash2,
  Download,
} from 'lucide-react';
import { cn } from '@aura/ui/utils';

// ── Mock Data ──────────────────────────────────────────────────────────
const AI_STATS = [
  { title: 'AI Interactions', value: '8.2K', icon: Bot, color: 'indigo' },
  { title: 'Predictions Made', value: '1.4K', icon: TrendingUp, color: 'violet' },
  { title: 'Attrition Alerts', value: '12', icon: AlertCircle, color: 'rose', alert: true },
  { title: 'Skills Mapped', value: '2.8K', icon: Target, color: 'emerald' },
  { title: 'Reports Generated', value: '342', icon: FileText, color: 'amber' },
];

const ATTRITION_DATA = [
  {
    dept: 'Engineering',
    risk: 18,
    high: 4,
    medium: 8,
    low: 6,
    trend: 'up',
    topReason: 'Compensation gap',
  },
  {
    dept: 'Sales',
    risk: 12,
    high: 2,
    medium: 5,
    low: 5,
    trend: 'stable',
    topReason: 'Career growth',
  },
  {
    dept: 'Operations',
    risk: 8,
    high: 1,
    medium: 3,
    low: 4,
    trend: 'down',
    topReason: 'Work-life balance',
  },
  {
    dept: 'Finance',
    risk: 5,
    high: 0,
    medium: 2,
    low: 3,
    trend: 'down',
    topReason: 'Manager satisfaction',
  },
  { dept: 'HR', risk: 3, high: 0, medium: 1, low: 2, trend: 'stable', topReason: 'Role clarity' },
];

const SKILLS_ONTOLOGY = [
  {
    category: 'Technical',
    skills: 245,
    mapped: 210,
    coverage: 86,
    trending: ['GenAI', 'Cloud', 'Cybersecurity'],
  },
  {
    category: 'Leadership',
    skills: 80,
    mapped: 72,
    coverage: 90,
    trending: ['Change Mgmt', 'DEI', 'Remote Mgmt'],
  },
  {
    category: 'Functional',
    skills: 320,
    mapped: 280,
    coverage: 88,
    trending: ['Analytics', 'Compliance', 'ESG'],
  },
  {
    category: 'Language',
    skills: 45,
    mapped: 38,
    coverage: 84,
    trending: ['Arabic (Business)', 'Urdu', 'Hindi'],
  },
];

const SENTIMENT_DATA = [
  { source: 'Pulse Surveys', score: 4.2, responses: 380, trend: 'up', emoji: '😊' },
  { source: 'Exit Interviews', score: 3.1, responses: 12, trend: 'down', emoji: '😐' },
  { source: 'HR Chatbot', score: 4.5, responses: 1200, trend: 'up', emoji: '😄' },
  { source: '1:1 Feedback', score: 4.0, responses: 95, trend: 'stable', emoji: '🙂' },
];

export default function AIAnalyticsCommandCenter() {
  const [activeTab, setActiveTab] = useState<'chatbot' | 'predictive' | 'skills' | 'reports'>(
    'chatbot'
  );
  const [aiInsight, setAiInsight] = useState('');

  useEffect(() => {
    const insights = [
      'Agentic AI auto-resolved 67 HR queries today. Escalation rate: 4.2% — down from 12% last quarter.',
      'Attrition model predicts 4 high-risk departures in Engineering within 60 days. Recommend retention interviews.',
      'Arabic NLP processed 1,200 chatbot queries with 94% intent accuracy. Top topics: leave balance, payslip.',
      'Skills ontology detected 45 employees with GenAI skills gap. Auto-enrolled in recommended learning path.',
    ];
    setAiInsight(insights[Math.floor(Math.random() * insights.length)]);
  }, [activeTab]);

  const tabs = [
    { id: 'chatbot', label: 'AI Chatbot & Agentic', icon: Bot },
    { id: 'predictive', label: 'Predictive Analytics', icon: TrendingUp },
    { id: 'skills', label: 'Skills Ontology', icon: Target },
    { id: 'reports', label: 'Report Builder', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-ghost-white dark:bg-deep-space p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-ink-black dark:text-pearl tracking-tight uppercase italic">
                AI & Analytics Hub
              </h1>
              <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">
                Agentic AI • Predictive Analytics • Arabic NLP • Skills Ontology
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all">
            <Sparkles className="w-4 h-4" /> Ask Aura AI
          </button>
        </div>
      </div>

      {/* AI Sentinel */}
      <div className="mb-8 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-[2rem] p-6 shadow-xl shadow-indigo-600/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Brain className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-1">
              Aura Intelligence Engine
            </h3>
            <p className="text-sm text-white font-medium leading-relaxed">{aiInsight}</p>
          </div>
          <button className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/20 transition-all backdrop-blur-sm">
            Explore
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {AI_STATS.map((stat, i) => (
          <div
            key={i}
            className={cn(
              'bg-white dark:bg-stellar-blue rounded-3xl p-5 border transition-all hover:shadow-xl group',
              stat.alert
                ? 'border-rose-100 dark:border-rose-900/20'
                : 'border-cloud dark:border-nebula-purple/30'
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={cn(
                  'p-2.5 rounded-2xl',
                  stat.color === 'indigo'
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                    : stat.color === 'violet'
                      ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600'
                      : stat.color === 'rose'
                        ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                        : stat.color === 'emerald'
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                          : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                )}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              {stat.alert && <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />}
            </div>
            <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest leading-none mb-1">
              {stat.title}
            </p>
            <div className="text-2xl font-black text-ink-black dark:text-pearl group-hover:text-indigo-600 transition-colors">
              {stat.value}
            </div>
          </div>
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
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-slate-50 dark:hover:bg-slate-800'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'chatbot' && <ChatbotTab />}
      {activeTab === 'predictive' && <PredictiveTab />}
      {activeTab === 'skills' && <SkillsOntologyTab />}
      {activeTab === 'reports' && <ReportBuilderTab />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: AI Chatbot & Agentic
// ═══════════════════════════════════════════════════════════════
function ChatbotTab() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* AI Chatbot */}
        <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <Bot className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-black text-ink-black dark:text-pearl uppercase tracking-tight">
              Aura AI Chatbot
            </h3>
          </div>

          <div className="space-y-4 mb-6">
            {[
              {
                q: 'What is my leave balance?',
                a: 'You have 12 annual leave days, 3 sick leave, and 2 comp-off days remaining.',
                lang: 'EN',
              },
              {
                q: 'كم رصيد إجازتي؟',
                a: 'لديك 12 يوم إجازة سنوية، و3 أيام مرضية، ويومان تعويضيان متبقية.',
                lang: 'AR',
              },
              {
                q: 'Show me team attendance today',
                a: 'Team has 95% attendance. 2 late arrivals flagged. Tap to see details.',
                lang: 'EN',
              },
            ].map((chat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-end">
                  <div className="px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl rounded-tr-sm max-w-xs">
                    <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      {chat.q}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/30 rounded-2xl rounded-tl-sm max-w-sm">
                    <p className="text-xs text-ink-black dark:text-pearl leading-relaxed">
                      {chat.a}
                    </p>
                    <span className="text-[8px] font-black text-silver-mist uppercase tracking-widest">
                      {chat.lang} • 0.3s
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-center flex-1">
              <p className="text-lg font-black text-emerald-600">94%</p>
              <p className="text-[8px] font-black text-silver-mist uppercase tracking-widest">
                Intent Accuracy
              </p>
            </div>
            <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl text-center flex-1">
              <p className="text-lg font-black text-indigo-600">1.2K</p>
              <p className="text-[8px] font-black text-silver-mist uppercase tracking-widest">
                Queries Today
              </p>
            </div>
            <div className="px-4 py-2 bg-violet-50 dark:bg-violet-900/10 rounded-xl text-center flex-1">
              <p className="text-lg font-black text-violet-600">4.2%</p>
              <p className="text-[8px] font-black text-silver-mist uppercase tracking-widest">
                Escalation
              </p>
            </div>
          </div>
        </div>

        {/* Agentic AI */}
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/10 dark:to-indigo-900/10 rounded-[2.5rem] p-8 border border-violet-200/50 dark:border-violet-800/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
              <Zap className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="text-lg font-black text-ink-black dark:text-pearl uppercase tracking-tight">
              Agentic AI Workflows
            </h3>
          </div>
          <p className="text-xs text-silver-mist leading-relaxed mb-6">
            Autonomous AI agents that complete multi-step HR tasks. Approve leave, process payroll
            adjustments, schedule interviews, and handle onboarding — all with human-in-the-loop
            oversight.
          </p>

          <div className="space-y-3">
            {[
              {
                agent: 'Leave Auto-Approver',
                tasks: 67,
                saved: '14h',
                status: 'Active',
                accuracy: '99.1%',
              },
              {
                agent: 'Payroll Anomaly Detector',
                tasks: 23,
                saved: '8h',
                status: 'Active',
                accuracy: '97.5%',
              },
              {
                agent: 'Interview Scheduler',
                tasks: 45,
                saved: '22h',
                status: 'Active',
                accuracy: '98.8%',
              },
              {
                agent: 'Document Classifier',
                tasks: 180,
                saved: '36h',
                status: 'Active',
                accuracy: '96.2%',
              },
              {
                agent: 'Onboarding Orchestrator',
                tasks: 12,
                saved: '6h',
                status: 'Learning',
                accuracy: '94.0%',
              },
            ].map((agent, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/50 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold text-ink-black dark:text-pearl group-hover:text-violet-600 transition-colors">
                      {agent.agent}
                    </p>
                    <p className="text-[9px] text-silver-mist font-bold">
                      {agent.tasks} tasks • {agent.saved} saved
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-emerald-600">{agent.accuracy}</span>
                  <span
                    className={cn(
                      'text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest',
                      agent.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                    )}
                  >
                    {agent.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Arabic NLP */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-3xl p-8 border border-emerald-200/50 dark:border-emerald-800/20">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
            <Type className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-ink-black dark:text-pearl uppercase tracking-tight mb-2">
              Arabic NLP Engine
            </h3>
            <p className="text-xs text-silver-mist leading-relaxed mb-4 max-w-xl">
              Native Arabic language processing with dialect support (MSA, Gulf, Levantine). Named
              entity recognition for Arabic names, diacritics handling, and morphological analysis.
              Bilingual intent classification for HR queries.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="px-4 py-3 bg-white/80 dark:bg-slate-900/50 rounded-xl text-center">
                <p className="text-lg font-black text-ink-black dark:text-pearl">MSA + Gulf</p>
                <p className="text-[8px] font-black text-silver-mist uppercase tracking-widest">
                  Dialects
                </p>
              </div>
              <div className="px-4 py-3 bg-white/80 dark:bg-slate-900/50 rounded-xl text-center">
                <p className="text-lg font-black text-emerald-600">94%</p>
                <p className="text-[8px] font-black text-silver-mist uppercase tracking-widest">
                  AR Accuracy
                </p>
              </div>
              <div className="px-4 py-3 bg-white/80 dark:bg-slate-900/50 rounded-xl text-center">
                <p className="text-lg font-black text-ink-black dark:text-pearl">NER</p>
                <p className="text-[8px] font-black text-silver-mist uppercase tracking-widest">
                  Entity Recog.
                </p>
              </div>
              <div className="px-4 py-3 bg-white/80 dark:bg-slate-900/50 rounded-xl text-center">
                <p className="text-lg font-black text-ink-black dark:text-pearl">RTL</p>
                <p className="text-[8px] font-black text-silver-mist uppercase tracking-widest">
                  Full Support
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Predictive Analytics
// ═══════════════════════════════════════════════════════════════
function PredictiveTab() {
  return (
    <div className="space-y-8">
      {/* Attrition Prediction */}
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <TrendingUp className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">
                Attrition Prediction Engine
              </h2>
              <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">
                ML-Powered Flight Risk • 90-Day Forecast • Retention Playbook
              </p>
            </div>
            <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">
              Run Model
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-cloud dark:border-nebula-purple/20">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Department
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    At Risk
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    High / Med / Low
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Top Reason
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud dark:divide-nebula-purple/10">
                {ATTRITION_DATA.map((dept, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-5 font-bold text-sm text-ink-black dark:text-pearl">
                      {dept.dept}
                    </td>
                    <td className="px-6 py-5 text-sm font-black text-ink-black dark:text-pearl">
                      {dept.risk}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
                          {dept.high}
                        </span>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                          {dept.medium}
                        </span>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                          {dept.low}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs text-silver-mist font-bold">
                      {dept.topReason}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={cn(
                          'text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest',
                          dept.trend === 'up'
                            ? 'bg-rose-50 text-rose-600'
                            : dept.trend === 'down'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-slate-100 text-slate-500'
                        )}
                      >
                        {dept.trend === 'up'
                          ? '↑ Rising'
                          : dept.trend === 'down'
                            ? '↓ Falling'
                            : '→ Stable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <Activity className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-black text-ink-black dark:text-pearl uppercase tracking-tight">
            Sentiment Analysis
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {SENTIMENT_DATA.map((s, i) => (
            <div
              key={i}
              className="p-5 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-cloud dark:border-nebula-purple/10 text-center"
            >
              <span className="text-3xl block mb-2">{s.emoji}</span>
              <p className="text-2xl font-black text-ink-black dark:text-pearl">{s.score}</p>
              <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest mb-2">
                {s.source}
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-[10px] font-bold text-silver-mist">
                  {s.responses} responses
                </span>
                <span
                  className={cn(
                    'text-[8px] font-black px-2 py-0.5 rounded-full uppercase',
                    s.trend === 'up'
                      ? 'bg-emerald-50 text-emerald-600'
                      : s.trend === 'down'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {s.trend === 'up' ? '↑' : s.trend === 'down' ? '↓' : '→'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Skills Ontology
// ═══════════════════════════════════════════════════════════════
function SkillsOntologyTab() {
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Target className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">
                Skills Ontology Graph
              </h2>
              <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">
                AI-Curated Taxonomy • Auto-Inference • Career Pathing
              </p>
            </div>
            <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">
              + Add Skills
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SKILLS_ONTOLOGY.map((cat, i) => (
              <div
                key={i}
                className="p-6 bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border border-cloud dark:border-nebula-purple/10 hover:shadow-lg transition-all cursor-pointer group/cat"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-black text-sm text-ink-black dark:text-pearl group-hover/cat:text-indigo-600 transition-colors">
                      {cat.category}
                    </h4>
                    <p className="text-[10px] text-silver-mist font-bold">
                      {cat.skills} skills • {cat.mapped} mapped
                    </p>
                  </div>
                  <span className="text-sm font-black text-indigo-600">{cat.coverage}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${cat.coverage}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.trending.map((skill, j) => (
                    <span
                      key={j}
                      className="text-[9px] font-black px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full uppercase tracking-widest"
                    >
                      🔥 {skill}
                    </span>
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
// TAB: Report Builder
// ═══════════════════════════════════════════════════════════════
function ReportBuilderTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Dashboard', schedule: 'Daily' });
  const [reports, setReports] = useState([
    { name: 'Headcount by Department', type: 'Dashboard', schedule: 'Daily', lastRun: '2h ago' },
    { name: 'Attrition Analysis', type: 'AI-Generated', schedule: 'Weekly', lastRun: '1d ago' },
    { name: 'Payroll Summary UAE', type: 'Compliance', schedule: 'Monthly', lastRun: '5d ago' },
    { name: 'WPS Compliance Report', type: 'Regulatory', schedule: 'Monthly', lastRun: '5d ago' },
    { name: 'Diversity & Inclusion', type: 'Dashboard', schedule: 'Quarterly', lastRun: '2w ago' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = reports.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateReport = () => {
    setIsModalOpen(false);
  };

  const handleDelete = (index: number) => {
    if (confirm('Delete this report?')) {
      const updated = reports.filter((_, i) => i !== index);
      setReports(updated);
    }
  };

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Name,Type,Schedule,Last Run\n' +
      reports.map((r) => `${r.name},${r.type},${r.schedule},${r.lastRun}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'reports.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <BarChart3 className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">
                Report Builder
              </h2>
              <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">
                Drag & Drop • Natural Language Queries • Scheduled Delivery
              </p>
            </div>
            <button
              onClick={() => {
                setFormData({ name: '', type: 'Dashboard', schedule: 'Daily' });
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20"
            >
              + New Report
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-silver-mist" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleExport}
              className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl text-silver-mist hover:text-indigo-600 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              {
                icon: PieChart,
                label: 'Visual Builder',
                desc: 'Drag-and-drop charts, tables, KPIs. 40+ visualization types with real-time data binding.',
                color: 'indigo',
              },
              {
                icon: MessageSquare,
                label: 'Ask in English or Arabic',
                desc: 'Type "show me attrition by department" and Aura AI generates the report instantly.',
                color: 'violet',
              },
              {
                icon: FileText,
                label: 'Scheduled & Shared',
                desc: 'Auto-email PDF/Excel reports daily, weekly, or monthly. Role-based access control.',
                color: 'emerald',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-6 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-cloud dark:border-nebula-purple/10"
              >
                <div
                  className={cn(
                    'inline-flex p-2.5 rounded-xl mb-3',
                    f.color === 'indigo'
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                      : f.color === 'violet'
                        ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600'
                        : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                  )}
                >
                  <f.icon className="w-5 h-5" />
                </div>
                <h4 className="font-black text-sm text-ink-black dark:text-pearl uppercase tracking-tight mb-1">
                  {f.label}
                </h4>
                <p className="text-xs text-silver-mist leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-cloud dark:border-nebula-purple/20">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Report
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Type
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Schedule
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Last Run
                  </th>
                  <th className="text-right px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud dark:divide-nebula-purple/10">
                {filteredReports.map((r, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-5 font-bold text-sm text-ink-black dark:text-pearl group-hover:text-indigo-600 transition-colors">
                      {r.name}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[9px] font-black px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-widest">
                        {r.type}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-silver-mist">{r.schedule}</td>
                    <td className="px-6 py-5 text-sm font-bold text-silver-mist">{r.lastRun}</td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(i);
                        }}
                        className="p-2 text-silver-mist hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-stellar-blue p-8 rounded-3xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-black text-ink-black dark:text-pearl uppercase tracking-tight mb-6">
              New Report
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Report Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl focus:border-indigo-500 outline-none"
                  placeholder="e.g. Diversity & Inclusion"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl focus:border-indigo-500 outline-none"
                >
                  <option value="Dashboard">Dashboard</option>
                  <option value="AI-Generated">AI-Generated</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Regulatory">Regulatory</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-silver-mist uppercase tracking-widest mb-1">
                  Schedule
                </label>
                <select
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-xl focus:border-indigo-500 outline-none"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                </select>
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
                onClick={handleCreateReport}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
              >
                Create Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
