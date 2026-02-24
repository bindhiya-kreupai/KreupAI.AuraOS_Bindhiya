"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  UserMinus,
  UserPlus,
  Clock,
  Award,
} from "lucide-react";

interface DepartmentBreakdown {
  department: string;
  headcount: number;
  avgTenure: number;
  avgSalary: number;
  turnoverRate: number;
  engagementScore: number;
  openRoles: number;
}

interface WorkforceData {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  averageTenure: number;
  averageAge: number;
  newHiresThisMonth: number;
  separationsThisMonth: number;
  netGrowth: number;
  growthRate: number;
  openPositions: number;
  timeToFill: number;
}

interface PerformanceData {
  averageRating: number;
  reviewCompletionRate: number;
  highPerformers: number;
  solidPerformers: number;
  lowPerformers: number;
  ratingDistribution: { rating: string; count: number; percentage: number }[];
}

interface RetentionData {
  overallRetentionRate: number;
  voluntaryTurnoverRate: number;
  involuntaryTurnoverRate: number;
  avgTimeToTermination: number;
  retentionByTenure: unknown[];
  topExitReasons: unknown[];
}

interface RiskIndicators {
  attritionRisk: { high: number; medium: number; low: number };
  criticalRolesAtRisk: number;
  successionCoverage: number;
  burnoutRisk: number;
  complianceIssues: number;
}

interface PeopleAnalyticsData {
  workforce: WorkforceData;
  departmentBreakdown: DepartmentBreakdown[];
  performance: PerformanceData;
  retention: RetentionData;
  riskIndicators: RiskIndicators;
  engagement: { overallScore: number; responseRate: number; enps: number };
  generatedAt: string;
}

interface MetricCard {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
  icon: React.ReactNode;
}

export function PeopleAnalytics() {
  const [data, setData] = useState<PeopleAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "turnover" | "diversity" | "flight-risk">("overview");

  useEffect(() => {
    fetch('/api/v1/analytics/people/')
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError('Failed to load people analytics data');
        }
      })
      .catch((err) => {
        console.error('PeopleAnalytics fetch error:', err);
        setError('Failed to load people analytics data');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-72" />
        </div>
        <div className="flex gap-4 border-b border-cloud dark:border-nebula-purple/50 pb-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 h-24" />
          ))}
        </div>
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 h-48" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
        {error || 'No analytics data available'}
      </div>
    );
  }

  const wf = data.workforce;
  const perf = data.performance;
  const ret = data.retention;
  const risk = data.riskIndicators;
  const engagement = data.engagement;

  const metrics: MetricCard[] = [
    {
      label: "Headcount",
      value: wf.totalEmployees.toLocaleString(),
      change: wf.growthRate,
      trend: wf.growthRate >= 0 ? "up" : "down",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Turnover Rate",
      value: `${(ret.voluntaryTurnoverRate + ret.involuntaryTurnoverRate).toFixed(1)}%`,
      change: ret.voluntaryTurnoverRate,
      trend: "down",
      icon: <UserMinus className="w-5 h-5" />,
    },
    {
      label: "Avg. Tenure",
      value: `${wf.averageTenure} yrs`,
      change: 0,
      trend: "up",
      icon: <Clock className="w-5 h-5" />,
    },
    {
      label: "Engagement Score",
      value: engagement.overallScore > 0 ? `${engagement.overallScore}/100` : "N/A",
      change: 0,
      trend: "up",
      icon: <Target className="w-5 h-5" />,
    },
    {
      label: "New Hires (MTD)",
      value: wf.newHiresThisMonth.toString(),
      change: 0,
      trend: "up",
      icon: <UserPlus className="w-5 h-5" />,
    },
    {
      label: "Open Positions",
      value: wf.openPositions.toString(),
      change: 0,
      trend: "up",
      icon: <Award className="w-5 h-5" />,
    },
  ];

  const turnoverByDept = data.departmentBreakdown.map(d => ({
    department: d.department,
    rate: d.turnoverRate,
  }));
  const maxTurnover = Math.max(...turnoverByDept.map((d) => d.rate), 1);

  const highRiskCount = risk.attritionRisk.high;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">People Analytics</h2>
        <p className="text-sm text-silver-mist mt-1">
          Workforce insights and analytics
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-cloud dark:border-nebula-purple/50">
        {[
          { key: "overview", label: "Overview" },
          { key: "turnover", label: "Turnover Analysis" },
          { key: "diversity", label: "Performance" },
          { key: "flight-risk", label: "Risk Indicators" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-celestial-indigo text-celestial-indigo"
                : "border-transparent text-silver-mist hover:text-ink-black dark:hover:text-pearl"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4"
              >
                <div className="flex items-center gap-2 mb-2 text-silver-mist">
                  {metric.icon}
                  <span className="text-xs font-medium">{metric.label}</span>
                </div>
                <p className="text-xl font-bold text-ink-black dark:text-pearl">{metric.value}</p>
                {metric.change !== 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {metric.trend === "up" ? (
                      <ArrowUpRight className="w-3 h-3 text-aurora-green" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-aurora-green" />
                    )}
                    <span className="text-xs text-aurora-green">
                      {Math.abs(metric.change)}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Insights */}
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-celestial-indigo" />
              Key Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-aurora-green/5 border border-aurora-green/20">
                <TrendingUp className="w-5 h-5 text-aurora-green flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">
                    Retention Rate: {ret.overallRetentionRate}%
                  </p>
                  <p className="text-xs text-silver-mist mt-0.5">
                    {wf.activeEmployees} active employees out of {wf.totalEmployees} total.
                  </p>
                </div>
              </div>
              {wf.newHiresThisMonth > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/20">
                  <UserPlus className="w-5 h-5 text-celestial-indigo flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-ink-black dark:text-pearl">
                      {wf.newHiresThisMonth} New Hires This Month
                    </p>
                    <p className="text-xs text-silver-mist mt-0.5">
                      Net growth: {wf.netGrowth >= 0 ? '+' : ''}{wf.netGrowth} ({wf.separationsThisMonth} separations).
                    </p>
                  </div>
                </div>
              )}
              {perf.averageRating > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/20">
                  <Award className="w-5 h-5 text-celestial-indigo flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-ink-black dark:text-pearl">
                      Avg Performance Rating: {perf.averageRating}
                    </p>
                    <p className="text-xs text-silver-mist mt-0.5">
                      {perf.highPerformers} high performers, {perf.reviewCompletionRate}% review completion.
                    </p>
                  </div>
                </div>
              )}
              {highRiskCount > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <TrendingDown className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-ink-black dark:text-pearl">
                      {highRiskCount} High Attrition Risk
                    </p>
                    <p className="text-xs text-silver-mist mt-0.5">
                      {risk.attritionRisk.medium} medium risk, {risk.attritionRisk.low} low risk employees.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Turnover Tab */}
      {activeTab === "turnover" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-4">
              Turnover Rate by Department
            </h3>
            <div className="space-y-3">
              {turnoverByDept.map((dept) => (
                <div key={dept.department} className="flex items-center gap-3">
                  <span className="text-sm text-ink-black dark:text-pearl w-28 truncate">
                    {dept.department}
                  </span>
                  <div className="flex-1 h-6 bg-slate-50 dark:bg-deep-cosmos rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full flex items-center justify-end pr-2 ${
                        dept.rate > 15
                          ? "bg-coral-alert/70"
                          : dept.rate > 10
                          ? "bg-yellow-400/70"
                          : "bg-aurora-green/70"
                      }`}
                      style={{ width: `${maxTurnover > 0 ? (dept.rate / maxTurnover) * 100 : 0}%` }}
                    >
                      {dept.rate >= 10 && (
                        <span className="text-[10px] font-medium text-white">
                          {dept.rate}%
                        </span>
                      )}
                    </div>
                  </div>
                  {dept.rate < 10 && (
                    <span className="text-xs font-medium text-ink-black dark:text-pearl w-10">
                      {dept.rate}%
                    </span>
                  )}
                </div>
              ))}
              {turnoverByDept.length === 0 && (
                <p className="text-sm text-silver-mist text-center py-4">No department turnover data available</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
              <p className="text-xs text-silver-mist mb-1">Voluntary Turnover</p>
              <p className="text-xl font-bold text-ink-black dark:text-pearl">{ret.voluntaryTurnoverRate}%</p>
            </div>
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
              <p className="text-xs text-silver-mist mb-1">Involuntary Turnover</p>
              <p className="text-xl font-bold text-ink-black dark:text-pearl">{ret.involuntaryTurnoverRate}%</p>
            </div>
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
              <p className="text-xs text-silver-mist mb-1">Overall Retention</p>
              <p className="text-xl font-bold text-ink-black dark:text-pearl">{ret.overallRetentionRate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab (was Diversity) */}
      {activeTab === "diversity" && (
        <div className="space-y-6">
          {/* Rating Distribution */}
          {perf.ratingDistribution && perf.ratingDistribution.length > 0 && (
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
              <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-4">
                Performance Rating Distribution
              </h3>
              <div className="space-y-3">
                {perf.ratingDistribution.map((rd) => (
                  <div key={rd.rating} className="flex items-center gap-3">
                    <span className="text-sm text-ink-black dark:text-pearl w-40 truncate">
                      {rd.rating}
                    </span>
                    <div className="flex-1 h-6 bg-slate-50 dark:bg-deep-cosmos rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-celestial-indigo/70 flex items-center justify-end pr-2"
                        style={{ width: `${rd.percentage}%` }}
                      >
                        {rd.percentage >= 10 && (
                          <span className="text-[10px] font-medium text-white">
                            {rd.percentage}%
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-ink-black dark:text-pearl w-16 text-right">
                      {rd.count} ({rd.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
              <p className="text-xs text-silver-mist mb-1">Average Rating</p>
              <p className="text-xl font-bold text-ink-black dark:text-pearl">{perf.averageRating || 'N/A'}</p>
            </div>
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
              <p className="text-xs text-silver-mist mb-1">High Performers</p>
              <p className="text-xl font-bold text-aurora-green">{perf.highPerformers}</p>
            </div>
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
              <p className="text-xs text-silver-mist mb-1">Review Completion</p>
              <p className="text-xl font-bold text-ink-black dark:text-pearl">{perf.reviewCompletionRate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Risk Indicators Tab (was Flight Risk) */}
      {activeTab === "flight-risk" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-ink-black dark:text-pearl">
              <span className="font-medium">{risk.attritionRisk.high} employees</span> identified as high attrition risk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
              <p className="text-xs text-silver-mist mb-2">Attrition Risk Distribution</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-red-500 font-medium">High Risk</span>
                  <span className="text-sm font-bold text-ink-black dark:text-pearl">{risk.attritionRisk.high}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-yellow-500 font-medium">Medium Risk</span>
                  <span className="text-sm font-bold text-ink-black dark:text-pearl">{risk.attritionRisk.medium}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-500 font-medium">Low Risk</span>
                  <span className="text-sm font-bold text-ink-black dark:text-pearl">{risk.attritionRisk.low}</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
              <p className="text-xs text-silver-mist mb-2">Critical Roles at Risk</p>
              <p className="text-2xl font-bold text-ink-black dark:text-pearl">{risk.criticalRolesAtRisk}</p>
              <p className="text-xs text-silver-mist mt-1">Succession coverage: {risk.successionCoverage}%</p>
            </div>
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
              <p className="text-xs text-silver-mist mb-2">Compliance Issues</p>
              <p className="text-2xl font-bold text-ink-black dark:text-pearl">{risk.complianceIssues}</p>
              <p className="text-xs text-silver-mist mt-1">Burnout risk score: {risk.burnoutRisk}</p>
            </div>
          </div>

          {/* Department breakdown with risk info */}
          {data.departmentBreakdown.length > 0 && (
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
              <div className="px-4 py-3 border-b border-cloud dark:border-nebula-purple/50">
                <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">Department Overview</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-deep-cosmos text-xs text-silver-mist">
                      <th className="text-left px-4 py-2 font-medium">Department</th>
                      <th className="text-right px-4 py-2 font-medium">Headcount</th>
                      <th className="text-right px-4 py-2 font-medium">Avg Tenure</th>
                      <th className="text-right px-4 py-2 font-medium">Turnover %</th>
                      <th className="text-right px-4 py-2 font-medium">Open Roles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cloud dark:divide-nebula-purple/50">
                    {data.departmentBreakdown.map((dept) => (
                      <tr key={dept.department} className="hover:bg-slate-50/50 dark:hover:bg-deep-cosmos/50">
                        <td className="px-4 py-2 text-sm font-medium text-ink-black dark:text-pearl">{dept.department}</td>
                        <td className="px-4 py-2 text-sm text-right text-ink-black dark:text-pearl">{dept.headcount}</td>
                        <td className="px-4 py-2 text-sm text-right text-silver-mist">{dept.avgTenure} yrs</td>
                        <td className="px-4 py-2 text-sm text-right">
                          <span className={dept.turnoverRate > 15 ? 'text-red-500 font-medium' : dept.turnoverRate > 10 ? 'text-yellow-500' : 'text-aurora-green'}>
                            {dept.turnoverRate}%
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-ink-black dark:text-pearl">{dept.openRoles}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
