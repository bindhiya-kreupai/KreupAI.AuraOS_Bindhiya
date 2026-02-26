/**
 * @module AIInsightsDashboard
 * @description AI Insights Dashboard — flight risk summary, sentiment trend,
 *              anomaly alerts, workforce forecast, recommended actions (Sec 7.1)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart2,
  MessageSquare,
  Zap,
  ChevronRight,
  Activity,
} from 'lucide-react';
import {
  AIService,
  type AttritionRiskProfile,
  type AnomalyAlert,
  type WorkforceForecast,
  type SentimentAnalysis,
} from '@/services/aiService';
import { LineChart } from '@/components/analytics/PeopleAnalyticsCharts';

// ── Sub-components ─────────────────────────────────────────────────────────────

function ConfidenceBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'text-emerald-600 bg-emerald-50'
      : score >= 60
        ? 'text-amber-600 bg-amber-50'
        : 'text-red-500 bg-red-50';
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${color}`}>
      {score}% confidence
    </span>
  );
}

function RiskScoreCircle({ score, size = 48 }: { score: number; size?: number }) {
  const r = size / 2 - 5;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference * (1 - score / 100);
  const color =
    score >= 75 ? '#ef4444' : score >= 50 ? '#f97316' : score >= 25 ? '#f59e0b' : '#10b981';

  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="4" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text
        x={size / 2}
        y={size / 2 + 4}
        textAnchor="middle"
        fontSize={size / 4}
        fontWeight="700"
        fill={color}
      >
        {score}
      </text>
    </svg>
  );
}

function SentimentBar({
  positive,
  neutral,
  negative,
}: {
  positive: number;
  neutral: number;
  negative: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex rounded-full overflow-hidden h-4">
        <div className="bg-emerald-500 transition-all" style={{ width: `${positive}%` }} />
        <div className="bg-slate-300 transition-all" style={{ width: `${neutral}%` }} />
        <div className="bg-red-400 transition-all" style={{ width: `${negative}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span className="text-emerald-600 font-medium">😊 {positive}% Positive</span>
        <span>{neutral}% Neutral</span>
        <span className="text-red-500 font-medium">{negative}% Negative</span>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface AIInsightsDashboardProps {
  onViewAttritionDetails?: (employeeId: string) => void;
  onOpenChatbot?: () => void;
}

export default function AIInsightsDashboard({
  onViewAttritionDetails,
  onOpenChatbot,
}: AIInsightsDashboardProps) {
  const [flightRisk, setFlightRisk] = useState<AttritionRiskProfile[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [forecasts, setForecasts] = useState<WorkforceForecast[]>([]);
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);
  const [summary, setSummary] = useState<{
    high: number;
    medium: number;
    low: number;
    totalAtRisk: number;
    avgRiskScore: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [risk, alerts, fc, sent, sum] = await Promise.all([
        AIService.getFlightRiskEmployees(55),
        AIService.getAnomalyDetection(),
        AIService.getWorkforceForecasts(6),
        AIService.getSentimentAnalysis(),
        AIService.getAttritionSummary(),
      ]);
      setFlightRisk(risk.slice(0, 5));
      setAnomalies(alerts);
      setForecasts(fc);
      setSentiment(sent);
      setSummary(sum);
      setLoading(false);
    };
    load();
  }, []);

  const forecastSeries = [
    {
      name: 'Headcount',
      color: '#3b82f6',
      data: forecasts.map((f) => f.predictedHeadcount),
    },
    {
      name: 'Confidence Low',
      color: '#93c5fd',
      data: forecasts.map((f) => f.confidenceLow),
    },
    {
      name: 'Confidence High',
      color: '#bfdbfe',
      data: forecasts.map((f) => f.confidenceHigh),
    },
  ];
  const forecastLabels = forecasts.map((f) => f.month.split(' ')[0]);

  const sentimentTrendSeries = sentiment
    ? [
        {
          name: 'Sentiment Score',
          color: '#10b981',
          data: sentiment.trend.map((t) => Math.round((t.score + 1) * 50)),
        },
      ]
    : [];
  const sentimentLabels = sentiment?.trend.map((t) => t.period.split(' ')[0]) ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="w-10 h-10 text-blue-400 mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-slate-500">Loading AI insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Insights</h1>
            <p className="text-sm text-slate-500">
              Predictive analytics powered by machine learning
            </p>
          </div>
        </div>
        <button
          onClick={onOpenChatbot}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          HR Chatbot
        </button>
      </div>

      {/* Summary KPIs */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'High Risk Employees',
              value: summary.high,
              icon: AlertTriangle,
              color: 'text-red-600',
              bg: 'bg-red-50',
              sub: 'need attention',
            },
            {
              label: 'Medium Risk',
              value: summary.medium,
              icon: Activity,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
              sub: 'monitor closely',
            },
            {
              label: 'Total At-Risk',
              value: summary.totalAtRisk,
              icon: Users,
              color: 'text-orange-600',
              bg: 'bg-orange-50',
              sub: 'above threshold',
            },
            {
              label: 'Avg Risk Score',
              value: `${summary.avgRiskScore}`,
              icon: BarChart2,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              sub: 'out of 100',
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-4">
              <div
                className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}
              >
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
              <div className="text-[10px] text-slate-400">{stat.sub}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flight Risk */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="font-semibold text-slate-800">Top Flight Risk Employees</h2>
          </div>
          <div className="space-y-3">
            {flightRisk.map((emp) => (
              <div
                key={emp.employeeId}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <RiskScoreCircle score={emp.riskScore} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-slate-800">{emp.employeeName}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: AIService.getRiskBgColor(emp.riskLevel),
                        color: AIService.getRiskColor(emp.riskLevel),
                      }}
                    >
                      {emp.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {emp.role} · {emp.department}
                  </p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {emp.riskFactors.slice(0, 2).map((f) => (
                      <span
                        key={f.factor}
                        className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full truncate max-w-[100px]"
                      >
                        {f.factor}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ConfidenceBadge score={emp.confidenceScore} />
                  <button
                    onClick={() => onViewAttritionDetails?.(emp.employeeId)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anomaly Alerts */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-slate-800">Anomaly Alerts</h2>
          </div>
          <div className="space-y-3">
            {anomalies.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border ${
                  alert.severity === 'high'
                    ? 'border-red-200 bg-red-50'
                    : alert.severity === 'medium'
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      alert.severity === 'high'
                        ? 'text-red-500'
                        : alert.severity === 'medium'
                          ? 'text-amber-500'
                          : 'text-blue-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-slate-800">{alert.metric}</span>
                      {alert.affectedDepartment && (
                        <span className="text-xs text-slate-500 bg-white/80 px-1.5 py-0.5 rounded-full">
                          {alert.affectedDepartment}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span>
                        Current: <strong>{alert.currentValue}</strong>
                      </span>
                      <span>
                        Expected: <strong>{alert.expectedValue}</strong>
                      </span>
                      <span
                        className={`font-medium ${alert.deviation > 0 ? 'text-red-600' : 'text-emerald-600'}`}
                      >
                        {alert.deviation > 0 ? '+' : ''}
                        {alert.deviation.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sentiment Trend */}
      {sentiment && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-violet-500" />
              <h2 className="font-semibold text-slate-800">Employee Sentiment Analysis</h2>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  sentiment.overallSentiment === 'positive'
                    ? 'bg-emerald-100 text-emerald-700'
                    : sentiment.overallSentiment === 'neutral'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-red-100 text-red-600'
                }`}
              >
                {sentiment.overallSentiment === 'positive'
                  ? '😊'
                  : sentiment.overallSentiment === 'neutral'
                    ? '😐'
                    : '😟'}{' '}
                {sentiment.overallSentiment.charAt(0).toUpperCase() +
                  sentiment.overallSentiment.slice(1)}
              </span>
              <ConfidenceBadge score={82} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <SentimentBar
                positive={sentiment.positive}
                neutral={sentiment.neutral}
                negative={sentiment.negative}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-emerald-700 mb-1.5">
                    Top Positive Themes
                  </p>
                  <ul className="space-y-1">
                    {sentiment.topPositiveThemes.map((t) => (
                      <li key={t} className="text-xs text-emerald-700 flex items-start gap-1">
                        <span>✓</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-red-600 mb-1.5">Top Negative Themes</p>
                  <ul className="space-y-1">
                    {sentiment.topNegativeThemes.map((t) => (
                      <li key={t} className="text-xs text-red-600 flex items-start gap-1">
                        <span>✗</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Sentiment Score Trend (0–100 scale)</p>
              <LineChart
                series={sentimentTrendSeries}
                labels={sentimentLabels}
                height={130}
                showLegend={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Workforce Forecast */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <h2 className="font-semibold text-slate-800">6-Month Workforce Forecast</h2>
          <ConfidenceBadge score={79} />
        </div>
        <LineChart series={forecastSeries} labels={forecastLabels} height={160} showLegend />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {forecasts.slice(0, 3).map((fc) => (
            <div key={fc.month} className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-500 font-medium">{fc.month}</p>
              <p className="text-lg font-bold text-blue-600 mt-0.5">{fc.predictedHeadcount}</p>
              <div className="flex justify-center gap-3 mt-1 text-[10px] text-slate-400">
                <span className="text-emerald-600">+{fc.predictedHires} hires</span>
                <span className="text-red-500">-{fc.predictedAttrition} exits</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-blue-500" />
          <h2 className="font-semibold text-slate-800">AI-Recommended Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              priority: 'High',
              action: 'Conduct salary review for 3 high-risk engineers (avg 18% below market)',
              impact: 'Reduces risk by ~25%',
              icon: '💰',
              color: 'border-red-200 bg-red-50',
            },
            {
              priority: 'High',
              action:
                'Schedule retention conversations with James Wilson and Maria Santos this week',
              impact: 'Critical attrition risk',
              icon: '🤝',
              color: 'border-red-200 bg-red-50',
            },
            {
              priority: 'Medium',
              action: 'Launch ML/AI upskilling program for Engineering — 8 candidates identified',
              impact: 'Closes critical skill gap',
              icon: '🎓',
              color: 'border-amber-200 bg-amber-50',
            },
            {
              priority: 'Medium',
              action: 'Investigate Sales department absenteeism spike — engage team managers',
              impact: 'Early burnout prevention',
              icon: '📊',
              color: 'border-amber-200 bg-amber-50',
            },
            {
              priority: 'Low',
              action: 'Assign mentors to 5 new graduates (under 18 months tenure)',
              impact: 'Reduces early attrition',
              icon: '⭐',
              color: 'border-blue-200 bg-blue-50',
            },
            {
              priority: 'Low',
              action: 'Equity refresh for Principal Engineer role — 2 employees flagged',
              impact: 'Retention improvement',
              icon: '📈',
              color: 'border-blue-200 bg-blue-50',
            },
          ].map((item) => (
            <div key={item.action} className={`border rounded-xl p-3.5 ${item.color}`}>
              <div className="flex items-start gap-2">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                        item.priority === 'High'
                          ? 'bg-red-100 text-red-700'
                          : item.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-snug">{item.action}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-emerald-500" />
                    {item.impact}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
