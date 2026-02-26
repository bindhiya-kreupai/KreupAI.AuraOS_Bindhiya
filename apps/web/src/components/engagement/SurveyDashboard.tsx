/**
 * @module SurveyDashboard
 * @description Employee Engagement Pulse Survey dashboard — eNPS gauge,
 *              active surveys, engagement trend chart, quick pulse check-in (Sec 13.1)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  CheckCircle,
  Clock,
  Plus,
  TrendingUp,
  Users,
  Star,
  Zap,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { SurveyService, type Survey, type SurveyAnalytics } from '@/services/surveyService';

// ── Types ─────────────────────────────────────────────────────────────────────

interface QuickPulseState {
  submitted: boolean;
  selected: number | null;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ENPSGauge({ score }: { score: number }) {
  // Score range: -100 to +100; display -100..+100 on a 180° arc
  const normalized = (score + 100) / 200; // 0..1
  const angle = normalized * 180 - 90; // -90° (far left) to +90° (far right)
  const rad = (angle * Math.PI) / 180;
  const cx = 100;
  const cy = 100;
  const r = 80;
  const needleX = cx + r * 0.75 * Math.cos(rad);
  const needleY = cy + r * 0.75 * Math.sin(rad);

  const getColor = () => {
    if (score >= 50) return '#10b981';
    if (score >= 20) return '#3b82f6';
    if (score >= 0) return '#f59e0b';
    return '#ef4444';
  };

  const getLabel = () => {
    if (score >= 50) return 'Excellent';
    if (score >= 20) return 'Good';
    if (score >= 0) return 'Needs Improvement';
    return 'Critical';
  };

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-48 h-28">
        {/* Background arc segments */}
        <path
          d="M 20 100 A 80 80 0 0 1 57 37"
          fill="none"
          stroke="#fee2e2"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M 57 37 A 80 80 0 0 1 100 20"
          fill="none"
          stroke="#fef3c7"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M 100 20 A 80 80 0 0 1 143 37"
          fill="none"
          stroke="#dbeafe"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M 143 37 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#d1fae5"
          strokeWidth="18"
          strokeLinecap="round"
        />
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke={getColor()}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="5" fill={getColor()} />
        {/* Score text */}
        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          fontSize="20"
          fontWeight="700"
          fill={getColor()}
        >
          {score > 0 ? `+${score}` : score}
        </text>
        {/* Labels */}
        <text x="10" y="116" fontSize="8" fill="#9ca3af">
          -100
        </text>
        <text x="88" y="14" fontSize="8" fill="#9ca3af">
          0
        </text>
        <text x="178" y="116" fontSize="8" fill="#9ca3af">
          +100
        </text>
      </svg>
      <span
        className="text-sm font-semibold mt-1 px-3 py-0.5 rounded-full"
        style={{ backgroundColor: getColor() + '20', color: getColor() }}
      >
        {getLabel()}
      </span>
    </div>
  );
}

function EngagementTrendChart({ data }: { data: { quarter: string; score: number }[] }) {
  const maxScore = 100;
  const minScore = 50;
  const w = 320;
  const h = 100;
  const padL = 30;
  const padR = 10;
  const padT = 10;
  const padB = 24;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  const xStep = chartW / (data.length - 1);
  const toY = (v: number) => padT + chartH - ((v - minScore) / (maxScore - minScore)) * chartH;

  const pathD = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${padL + i * xStep} ${toY(d.score)}`)
    .join(' ');

  const areaD =
    pathD + ` L ${padL + (data.length - 1) * xStep} ${padT + chartH} L ${padL} ${padT + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24">
      {/* Grid lines */}
      {[60, 70, 80, 90].map((v) => (
        <line
          key={v}
          x1={padL}
          y1={toY(v)}
          x2={w - padR}
          y2={toY(v)}
          stroke="#f1f5f9"
          strokeWidth="1"
        />
      ))}
      {/* Area fill */}
      <path d={areaD} fill="#3b82f620" />
      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Data points */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={padL + i * xStep} cy={toY(d.score)} r="4" fill="#3b82f6" />
          <text x={padL + i * xStep} y={h - 4} textAnchor="middle" fontSize="8" fill="#94a3b8">
            {d.quarter}
          </text>
          <text
            x={padL + i * xStep}
            y={toY(d.score) - 7}
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fill="#3b82f6"
          >
            {d.score}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ParticipationBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#3b82f6' : '#f59e0b';
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface SurveyDashboardProps {
  onCreateSurvey?: () => void;
  onViewSurvey?: (surveyId: string) => void;
  onViewResults?: (surveyId: string) => void;
}

export default function SurveyDashboard({
  onCreateSurvey,
  onViewSurvey,
  onViewResults,
}: SurveyDashboardProps) {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickPulse, setQuickPulse] = useState<QuickPulseState>({
    submitted: false,
    selected: null,
  });
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'draft'>('active');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [allSurveys, analyticsData] = await Promise.all([
        SurveyService.getSurveys(),
        SurveyService.getSurveyAnalytics(),
      ]);
      setSurveys(allSurveys);
      setAnalytics(analyticsData);
      setLoading(false);
    };
    load();
  }, []);

  const filteredSurveys = surveys.filter((s) => s.status === activeTab);
  const _activeSurveys = surveys.filter((s) => s.status === 'active');

  const handleQuickPulse = (rating: number) => {
    setQuickPulse({ submitted: true, selected: rating });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pulse Surveys</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Employee engagement measurement &amp; insights
          </p>
        </div>
        <button
          onClick={onCreateSurvey}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Survey
        </button>
      </div>

      {/* Stats row */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Active Surveys',
              value: analytics.activeSurveysCount,
              icon: Activity,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              label: 'Participation Rate',
              value: `${analytics.overallParticipationRate.toFixed(1)}%`,
              icon: Users,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
            {
              label: 'Responses This Month',
              value: analytics.totalResponsesThisMonth,
              icon: BarChart2,
              color: 'text-violet-600',
              bg: 'bg-violet-50',
            },
            {
              label: 'Surveys Completed',
              value: analytics.completedSurveysCount,
              icon: CheckCircle,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-4">
              <div
                className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}
              >
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* eNPS Gauge */}
        {analytics && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-amber-500" />
              <h2 className="font-semibold text-slate-800">Employee NPS (eNPS)</h2>
            </div>
            <ENPSGauge score={analytics.eNPSScore} />
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div>
                <div className="text-lg font-bold text-emerald-600">{analytics.eNPSPromoters}%</div>
                <div className="text-xs text-slate-500">Promoters</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-500">{analytics.eNPSPassives}%</div>
                <div className="text-xs text-slate-500">Passives</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-500">{analytics.eNPSDetractors}%</div>
                <div className="text-xs text-slate-500">Detractors</div>
              </div>
            </div>
          </div>
        )}

        {/* Engagement Trend */}
        {analytics && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <h2 className="font-semibold text-slate-800">Engagement Score Trend</h2>
            </div>
            <EngagementTrendChart data={analytics.engagementScoreTrend} />
            <div className="flex items-center gap-1.5 mt-3 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+5.4% vs last quarter</span>
            </div>
          </div>
        )}

        {/* Quick Pulse */}
        <div className="bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4" />
            <h2 className="font-semibold">Daily Pulse Check</h2>
          </div>
          {quickPulse.submitted ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <CheckCircle className="w-10 h-10 text-white/90 mb-2" />
              <p className="font-medium">Thanks for sharing!</p>
              <p className="text-sm text-white/70 mt-1">Your response helps us improve.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-white/80 mb-4">How are you feeling about work today?</p>
              <div className="flex items-center justify-between gap-1">
                {[
                  { emoji: '😞', label: 'Rough', value: 1 },
                  { emoji: '😐', label: 'Okay', value: 2 },
                  { emoji: '🙂', label: 'Good', value: 3 },
                  { emoji: '😊', label: 'Great', value: 4 },
                  { emoji: '🤩', label: 'Amazing', value: 5 },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleQuickPulse(opt.value)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                      quickPulse.selected === opt.value
                        ? 'bg-white/30 scale-110'
                        : 'hover:bg-white/20'
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="text-[10px] text-white/70">{opt.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active Surveys */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center border-b border-slate-200 px-5">
          {(['active', 'completed', 'draft'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3.5 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {surveys.filter((s) => s.status === tab).length}
              </span>
            </button>
          ))}
        </div>
        <div className="divide-y divide-slate-100">
          {filteredSurveys.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No {activeTab} surveys</div>
          ) : (
            filteredSurveys.map((survey) => (
              <div
                key={survey.id}
                className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-800 truncate">{survey.title}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        survey.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : survey.status === 'completed'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {survey.status}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                      {survey.audience === 'all'
                        ? 'All Employees'
                        : survey.audienceValue || survey.audience}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {survey.questions.length} questions
                  </div>
                  {survey.status === 'active' && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>
                          {survey.actualResponses} / {survey.targetResponses} responses
                        </span>
                        <span className="font-medium">{survey.participationRate.toFixed(0)}%</span>
                      </div>
                      <ParticipationBar value={survey.participationRate} />
                    </div>
                  )}
                  {survey.status === 'draft' && survey.scheduledDate && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>Scheduled: {new Date(survey.scheduledDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {survey.status === 'active' && (
                    <button
                      onClick={() => onViewSurvey?.(survey.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Take Survey
                    </button>
                  )}
                  {survey.status === 'completed' && (
                    <button
                      onClick={() => onViewResults?.(survey.id)}
                      className="px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-900 transition-colors"
                    >
                      View Results
                    </button>
                  )}
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Insights */}
      {analytics && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-violet-500" />
            <h2 className="font-semibold text-slate-800">AI-Powered Insights</h2>
          </div>
          <ul className="space-y-2">
            {analytics.topInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                  {i + 1}
                </span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
