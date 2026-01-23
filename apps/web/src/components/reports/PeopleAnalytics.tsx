"use client";

import React, { useState } from "react";
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

interface MetricCard {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
  icon: React.ReactNode;
}

interface FlightRiskEmployee {
  id: string;
  name: string;
  department: string;
  riskLevel: "high" | "medium" | "low";
  riskScore: number;
  factors: string[];
}

interface DiversityMetric {
  category: string;
  segments: { label: string; value: number; color: string }[];
}

const metrics: MetricCard[] = [
  {
    label: "Headcount",
    value: "1,247",
    change: 3.2,
    trend: "up",
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: "Turnover Rate",
    value: "12.4%",
    change: -1.8,
    trend: "down",
    icon: <UserMinus className="w-5 h-5" />,
  },
  {
    label: "Avg. Tenure",
    value: "3.8 yrs",
    change: 0.4,
    trend: "up",
    icon: <Clock className="w-5 h-5" />,
  },
  {
    label: "Engagement Score",
    value: "78/100",
    change: 5,
    trend: "up",
    icon: <Target className="w-5 h-5" />,
  },
  {
    label: "New Hires (QTD)",
    value: "42",
    change: 12,
    trend: "up",
    icon: <UserPlus className="w-5 h-5" />,
  },
  {
    label: "Promotions (YTD)",
    value: "86",
    change: 8,
    trend: "up",
    icon: <Award className="w-5 h-5" />,
  },
];

const flightRiskEmployees: FlightRiskEmployee[] = [
  {
    id: "fr-1",
    name: "Alex Rodriguez",
    department: "Engineering",
    riskLevel: "high",
    riskScore: 87,
    factors: ["No promotion in 3 years", "Below market salary", "Low engagement survey"],
  },
  {
    id: "fr-2",
    name: "Maria Thompson",
    department: "Product",
    riskLevel: "high",
    riskScore: 82,
    factors: ["Manager change", "Reduced project involvement", "Tenure > 4 years"],
  },
  {
    id: "fr-3",
    name: "David Park",
    department: "Sales",
    riskLevel: "medium",
    riskScore: 65,
    factors: ["Missed quota 2 quarters", "Team restructuring"],
  },
  {
    id: "fr-4",
    name: "Sarah Mitchell",
    department: "Engineering",
    riskLevel: "medium",
    riskScore: 61,
    factors: ["Limited growth path", "Peer departures"],
  },
];

const diversityMetrics: DiversityMetric[] = [
  {
    category: "Gender",
    segments: [
      { label: "Male", value: 54, color: "bg-celestial-indigo" },
      { label: "Female", value: 42, color: "bg-purple-500" },
      { label: "Non-binary", value: 4, color: "bg-pink-400" },
    ],
  },
  {
    category: "Ethnicity",
    segments: [
      { label: "White", value: 45, color: "bg-blue-400" },
      { label: "Asian", value: 25, color: "bg-green-400" },
      { label: "Hispanic", value: 15, color: "bg-yellow-400" },
      { label: "Black", value: 12, color: "bg-orange-400" },
      { label: "Other", value: 3, color: "bg-gray-400" },
    ],
  },
  {
    category: "Age Group",
    segments: [
      { label: "18-25", value: 12, color: "bg-cyan-400" },
      { label: "26-35", value: 38, color: "bg-teal-400" },
      { label: "36-45", value: 28, color: "bg-emerald-400" },
      { label: "46-55", value: 15, color: "bg-lime-500" },
      { label: "55+", value: 7, color: "bg-amber-400" },
    ],
  },
];

const turnoverByDept = [
  { department: "Engineering", rate: 10.2 },
  { department: "Sales", rate: 18.5 },
  { department: "Marketing", rate: 14.1 },
  { department: "Product", rate: 8.7 },
  { department: "HR", rate: 6.3 },
  { department: "Finance", rate: 9.8 },
];

export function PeopleAnalytics() {
  const [activeTab, setActiveTab] = useState<"overview" | "turnover" | "diversity" | "flight-risk">("overview");

  const maxTurnover = Math.max(...turnoverByDept.map((d) => d.rate));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">People Analytics</h2>
        <p className="text-sm text-silver-mist mt-1">
          AI-powered workforce insights and predictive analytics
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-cloud dark:border-nebula-purple/50">
        {[
          { key: "overview", label: "Overview" },
          { key: "turnover", label: "Turnover Analysis" },
          { key: "diversity", label: "Diversity & Inclusion" },
          { key: "flight-risk", label: "Flight Risk" },
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
                    Engagement Improving
                  </p>
                  <p className="text-xs text-silver-mist mt-0.5">
                    Employee engagement scores are up 5% from last quarter, driven by new learning programs.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-coral-alert/5 border border-coral-alert/20">
                <AlertTriangle className="w-5 h-5 text-coral-alert flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">
                    Sales Turnover High
                  </p>
                  <p className="text-xs text-silver-mist mt-0.5">
                    Sales department turnover at 18.5% exceeds the company average of 12.4%. Review compensation.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/20">
                <UserPlus className="w-5 h-5 text-celestial-indigo flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">
                    Strong Hiring Quarter
                  </p>
                  <p className="text-xs text-silver-mist mt-0.5">
                    42 new hires this quarter, 12% above target. Engineering filled 85% of open requisitions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                <TrendingDown className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">
                    4 High Flight Risk
                  </p>
                  <p className="text-xs text-silver-mist mt-0.5">
                    Predictive model identified 4 employees with high departure probability in next 90 days.
                  </p>
                </div>
              </div>
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
                      style={{ width: `${(dept.rate / maxTurnover) * 100}%` }}
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
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
              <p className="text-xs text-silver-mist mb-1">Voluntary Turnover</p>
              <p className="text-xl font-bold text-ink-black dark:text-pearl">9.1%</p>
              <p className="text-xs text-silver-mist mt-1">73% of total turnover</p>
            </div>
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
              <p className="text-xs text-silver-mist mb-1">Involuntary Turnover</p>
              <p className="text-xl font-bold text-ink-black dark:text-pearl">3.3%</p>
              <p className="text-xs text-silver-mist mt-1">27% of total turnover</p>
            </div>
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
              <p className="text-xs text-silver-mist mb-1">Avg. Cost per Departure</p>
              <p className="text-xl font-bold text-ink-black dark:text-pearl">$45.2K</p>
              <p className="text-xs text-silver-mist mt-1">Including recruitment + onboarding</p>
            </div>
          </div>
        </div>
      )}

      {/* Diversity Tab */}
      {activeTab === "diversity" && (
        <div className="space-y-6">
          {diversityMetrics.map((metric) => (
            <div
              key={metric.category}
              className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5"
            >
              <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-4">
                {metric.category} Distribution
              </h3>
              {/* Stacked bar */}
              <div className="flex h-8 rounded-full overflow-hidden mb-3">
                {metric.segments.map((seg) => (
                  <div
                    key={seg.label}
                    className={`${seg.color} flex items-center justify-center`}
                    style={{ width: `${seg.value}%` }}
                  >
                    {seg.value >= 10 && (
                      <span className="text-[10px] font-medium text-white">{seg.value}%</span>
                    )}
                  </div>
                ))}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-3">
                {metric.segments.map((seg) => (
                  <div key={seg.label} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-full ${seg.color}`} />
                    <span className="text-xs text-ink-black dark:text-pearl">{seg.label}</span>
                    <span className="text-xs text-silver-mist">({seg.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flight Risk Tab */}
      {activeTab === "flight-risk" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-ink-black dark:text-pearl">
              <span className="font-medium">4 employees</span> identified as elevated flight risk based on predictive modeling.
            </p>
          </div>

          {flightRiskEmployees.map((emp) => (
            <div
              key={emp.id}
              className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">{emp.name}</p>
                  <p className="text-xs text-silver-mist">{emp.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      emp.riskLevel === "high"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        : emp.riskLevel === "medium"
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    }`}
                  >
                    {emp.riskLevel} risk
                  </span>
                  <span className="text-sm font-bold text-ink-black dark:text-pearl">
                    {emp.riskScore}%
                  </span>
                </div>
              </div>
              {/* Risk score bar */}
              <div className="w-full h-2 rounded-full bg-slate-50 dark:bg-deep-cosmos overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full ${
                    emp.riskScore >= 80
                      ? "bg-red-500"
                      : emp.riskScore >= 60
                      ? "bg-yellow-400"
                      : "bg-green-400"
                  }`}
                  style={{ width: `${emp.riskScore}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {emp.factors.map((factor) => (
                  <span
                    key={factor}
                    className="text-xs px-2 py-1 rounded bg-cloud/50 dark:bg-nebula-purple/10 text-silver-mist"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
