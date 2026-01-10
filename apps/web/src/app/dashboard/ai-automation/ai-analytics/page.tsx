"use client";

import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Filter,
  Calendar
} from 'lucide-react';
import { predictiveAttrition, performanceInsights } from '@/lib/services/ai-automation-client';

// ============================================================================
// MOCK DATA - In production, this would come from the AI services
// ============================================================================

const ATTRITION_DATA = {
  overallRisk: 12.5,
  trend: -2.3,
  highRiskCount: 23,
  mediumRiskCount: 45,
  lowRiskCount: 432,
  topFactors: [
    { factor: 'Compensation below market', factorAr: 'التعويض أقل من السوق', impact: 35 },
    { factor: 'Limited growth opportunities', factorAr: 'فرص نمو محدودة', impact: 28 },
    { factor: 'Work-life balance', factorAr: 'التوازن بين العمل والحياة', impact: 22 },
    { factor: 'Manager relationship', factorAr: 'العلاقة مع المدير', impact: 15 },
  ],
  byDepartment: [
    { department: 'Engineering', risk: 18.5 },
    { department: 'Sales', risk: 15.2 },
    { department: 'Marketing', risk: 10.8 },
    { department: 'Finance', risk: 8.3 },
    { department: 'HR', risk: 6.1 },
  ],
};

const PERFORMANCE_DATA = {
  averageScore: 78.5,
  trend: 3.2,
  topPerformers: 45,
  needsImprovement: 28,
  predictions: [
    { quarter: 'Q1 2025', predicted: 80.2 },
    { quarter: 'Q2 2025', predicted: 82.5 },
    { quarter: 'Q3 2025', predicted: 84.1 },
    { quarter: 'Q4 2025', predicted: 85.8 },
  ],
  indicators: [
    { name: 'Goal Completion', value: 82, weight: 0.25 },
    { name: 'Quality Score', value: 88, weight: 0.20 },
    { name: 'Collaboration', value: 75, weight: 0.15 },
    { name: 'Innovation', value: 70, weight: 0.15 },
    { name: 'Attendance', value: 95, weight: 0.10 },
    { name: 'Training', value: 65, weight: 0.15 },
  ],
};

const WORKFORCE_DATA = {
  currentHeadcount: 500,
  projectedHeadcount: 545,
  skillGapScore: 23,
  successionReadiness: 68,
  diversityScore: 72,
  keyMetrics: [
    { metric: 'Time to Fill', value: '28 days', trend: -3 },
    { metric: 'Cost per Hire', value: '$4,250', trend: -8 },
    { metric: 'Offer Acceptance', value: '87%', trend: 5 },
    { metric: 'Quality of Hire', value: '82%', trend: 2 },
  ],
};

const RECRUITMENT_DATA = {
  activeRequisitions: 42,
  candidatesInPipeline: 328,
  interviewsScheduled: 56,
  offersExtended: 12,
  applicationsBySource: [
    { source: 'LinkedIn', count: 145, percentage: 44 },
    { source: 'Indeed', count: 82, percentage: 25 },
    { source: 'Referrals', count: 56, percentage: 17 },
    { source: 'Career Page', count: 32, percentage: 10 },
    { source: 'Others', count: 13, percentage: 4 },
  ],
};

const SENTIMENT_DATA = {
  overallScore: 7.2,
  trend: 0.3,
  categories: [
    { category: 'Work Environment', score: 7.8 },
    { category: 'Leadership', score: 7.5 },
    { category: 'Growth', score: 6.8 },
    { category: 'Compensation', score: 6.5 },
    { category: 'Work-Life Balance', score: 7.0 },
  ],
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, value, subtitle, trend, icon, color }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-silver-mist">{title}</h3>
        <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">{value}</p>
        {subtitle && <p className="text-xs text-silver-mist mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

function ProgressBar({ label, value, max = 100, color = 'bg-indigo-500' }: ProgressBarProps) {
  const percentage = (value / max) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-silver-mist">{label}</span>
        <span className="font-medium text-ink-black dark:text-pearl">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AIAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [attritionData, setAttritionData] = useState<any>(ATTRITION_DATA);
  const [performanceData, setPerformanceData] = useState<any>(PERFORMANCE_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [attritionResult, performanceResult] = await Promise.all([
        predictiveAttrition.getRiskScores(),
        performanceInsights.getInsights(),
      ]);

      if (attritionResult.success) {
        setAttritionData(attritionResult.data || ATTRITION_DATA);
      }
      if (performanceResult.success) {
        setPerformanceData(performanceResult.data || PERFORMANCE_DATA);
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAnalytics();
    } finally {
      setTimeout(() => setIsRefreshing(false), 1500);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Brain className="w-7 h-7 text-indigo-500" />
            AI Analytics Dashboard
          </h1>
          <p className="text-silver-mist text-sm mt-1">
            Comprehensive AI-powered insights for workforce management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 border border-cloud dark:border-nebula-purple/50 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-silver-mist ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Attrition Risk"
          value={`${ATTRITION_DATA.overallRisk}%`}
          subtitle={`${ATTRITION_DATA.highRiskCount} high-risk employees`}
          trend={ATTRITION_DATA.trend}
          icon={<AlertTriangle className="w-6 h-6 text-amber-600" />}
          color="bg-amber-50 dark:bg-amber-900/20"
        />
        <MetricCard
          title="Avg Performance"
          value={`${PERFORMANCE_DATA.averageScore}%`}
          subtitle={`${PERFORMANCE_DATA.topPerformers} top performers`}
          trend={PERFORMANCE_DATA.trend}
          icon={<Target className="w-6 h-6 text-emerald-600" />}
          color="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <MetricCard
          title="Workforce Growth"
          value={WORKFORCE_DATA.projectedHeadcount}
          subtitle={`+${WORKFORCE_DATA.projectedHeadcount - WORKFORCE_DATA.currentHeadcount} projected`}
          trend={9}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50 dark:bg-blue-900/20"
        />
        <MetricCard
          title="Sentiment Score"
          value={`${SENTIMENT_DATA.overallScore}/10`}
          subtitle="Employee satisfaction"
          trend={SENTIMENT_DATA.trend * 10}
          icon={<Activity className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50 dark:bg-purple-900/20"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attrition Prediction */}
        <div className="lg:col-span-2 bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-amber-500" />
              Attrition Risk Analysis
            </h2>
            <span className="text-xs text-silver-mist">AI Confidence: 94%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <div>
              <h3 className="text-sm font-medium text-silver-mist mb-4">Risk Distribution</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">High Risk</span>
                  <span className="text-lg font-bold text-red-600">{ATTRITION_DATA.highRiskCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Medium Risk</span>
                  <span className="text-lg font-bold text-amber-600">{ATTRITION_DATA.mediumRiskCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Low Risk</span>
                  <span className="text-lg font-bold text-emerald-600">{ATTRITION_DATA.lowRiskCount}</span>
                </div>
              </div>
            </div>

            {/* Top Factors */}
            <div>
              <h3 className="text-sm font-medium text-silver-mist mb-4">Contributing Factors</h3>
              <div className="space-y-3">
                {ATTRITION_DATA.topFactors.map((factor, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-black dark:text-pearl">{factor.factor}</span>
                      <span className="font-medium text-amber-600">{factor.impact}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full"
                        style={{ width: `${factor.impact}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Department Risk */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-medium text-silver-mist mb-4">Risk by Department</h3>
            <div className="flex items-end gap-4 h-32">
              {ATTRITION_DATA.byDepartment.map((dept, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      dept.risk > 15 ? 'bg-red-400' : dept.risk > 10 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ height: `${dept.risk * 5}px` }}
                  />
                  <span className="text-xs text-silver-mist text-center">{dept.department}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            Performance Indicators
          </h2>

          <div className="space-y-4">
            {PERFORMANCE_DATA.indicators.map((indicator, idx) => (
              <ProgressBar
                key={idx}
                label={indicator.name}
                value={indicator.value}
                color={
                  indicator.value >= 85
                    ? 'bg-emerald-500'
                    : indicator.value >= 70
                    ? 'bg-blue-500'
                    : 'bg-amber-500'
                }
              />
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-medium text-silver-mist mb-3">Q1-Q4 2025 Forecast</h3>
            <div className="flex items-end gap-2 h-24">
              {PERFORMANCE_DATA.predictions.map((pred, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-emerald-600">{pred.predicted}%</span>
                  <div
                    className="w-full bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t-lg"
                    style={{ height: `${(pred.predicted - 75) * 4}px` }}
                  />
                  <span className="text-xs text-silver-mist">{pred.quarter.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruitment Pipeline */}
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-blue-500" />
            Recruitment Pipeline
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-center">
              <p className="text-2xl font-bold text-indigo-600">{RECRUITMENT_DATA.activeRequisitions}</p>
              <p className="text-xs text-silver-mist mt-1">Open Positions</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
              <p className="text-2xl font-bold text-blue-600">{RECRUITMENT_DATA.candidatesInPipeline}</p>
              <p className="text-xs text-silver-mist mt-1">Candidates</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
              <p className="text-2xl font-bold text-purple-600">{RECRUITMENT_DATA.interviewsScheduled}</p>
              <p className="text-xs text-silver-mist mt-1">Interviews Scheduled</p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
              <p className="text-2xl font-bold text-emerald-600">{RECRUITMENT_DATA.offersExtended}</p>
              <p className="text-xs text-silver-mist mt-1">Offers Extended</p>
            </div>
          </div>

          <h3 className="text-sm font-medium text-silver-mist mb-3">Applications by Source</h3>
          <div className="space-y-2">
            {RECRUITMENT_DATA.applicationsBySource.map((source, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-20 text-sm text-ink-black dark:text-pearl">{source.source}</span>
                <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${source.percentage}%` }}
                  >
                    <span className="text-xs text-white font-medium">{source.count}</span>
                  </div>
                </div>
                <span className="w-12 text-right text-sm text-silver-mist">{source.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Workforce Planning */}
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-purple-500" />
            Workforce Analytics
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {WORKFORCE_DATA.keyMetrics.map((metric, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-ink-black dark:text-pearl">{metric.value}</p>
                  <span className={`text-xs font-medium ${metric.trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {metric.trend >= 0 ? '+' : ''}{metric.trend}%
                  </span>
                </div>
                <p className="text-xs text-silver-mist mt-1">{metric.metric}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="35" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="8"
                    strokeDasharray={`${WORKFORCE_DATA.successionReadiness * 2.2} 220`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-ink-black dark:text-pearl">
                  {WORKFORCE_DATA.successionReadiness}%
                </span>
              </div>
              <p className="text-xs text-silver-mist mt-2">Succession Ready</p>
            </div>
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="35" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeDasharray={`${WORKFORCE_DATA.diversityScore * 2.2} 220`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-ink-black dark:text-pearl">
                  {WORKFORCE_DATA.diversityScore}%
                </span>
              </div>
              <p className="text-xs text-silver-mist mt-2">Diversity Score</p>
            </div>
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="35" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="8"
                    strokeDasharray={`${(100 - WORKFORCE_DATA.skillGapScore) * 2.2} 220`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-ink-black dark:text-pearl">
                  {100 - WORKFORCE_DATA.skillGapScore}%
                </span>
              </div>
              <p className="text-xs text-silver-mist mt-2">Skills Coverage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Sentiment */}
      <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            Employee Sentiment Analysis
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-purple-600">{SENTIMENT_DATA.overallScore}</span>
            <span className="text-silver-mist">/10</span>
            <span className={`ml-2 text-sm font-medium ${SENTIMENT_DATA.trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {SENTIMENT_DATA.trend >= 0 ? '+' : ''}{SENTIMENT_DATA.trend}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {SENTIMENT_DATA.categories.map((cat, idx) => (
            <div key={idx} className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div
                className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-lg font-bold ${
                  cat.score >= 7.5
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                    : cat.score >= 6.5
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                    : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'
                }`}
              >
                {cat.score}
              </div>
              <p className="text-xs text-silver-mist mt-2">{cat.category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-xl text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold mb-2">AI-Generated Insights</h2>
            <ul className="space-y-2 text-sm text-white/90">
              <li className="flex items-start gap-2">
                <span className="text-amber-300">•</span>
                Engineering department shows 18.5% attrition risk - consider targeted retention initiatives
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-300">•</span>
                Performance scores trending upward - Q4 2025 projected to reach 85.8% average
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-300">•</span>
                LinkedIn driving 44% of applications - optimize job postings for this platform
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-300">•</span>
                Compensation satisfaction at 6.5/10 - market benchmarking recommended
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
