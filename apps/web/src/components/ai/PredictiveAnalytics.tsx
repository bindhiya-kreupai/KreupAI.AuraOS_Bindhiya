// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * @module PredictiveAnalytics
 * @description AI-powered predictive analytics — attrition risk, workforce planning,
 *              performance prediction, and engagement forecast (Sec 31.3)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Loader2,
  RefreshCw,
  Download,
  Activity,
  Zap,
  Brain,
  ChevronRight,
  Minus,
  Info,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'attrition' | 'workforce' | 'performance' | 'engagement';
type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

interface AttritionEmployee {
  id: string;
  name: string;
  initials: string;
  color: string;
  department: string;
  title: string;
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactors: string[];
  tenure: string;
  lastPromotion: string;
}

interface WorkforceDemand {
  role: string;
  department: string;
  currentCount: number;
  demandForecast: number;
  gap: number;
  priority: 'critical' | 'high' | 'medium';
}

interface PerformancePrediction {
  id: string;
  name: string;
  initials: string;
  color: string;
  department: string;
  currentRating: number;
  predictedRating: number;
  confidence: number;
  trajectory: 'improving' | 'stable' | 'declining';
  highPotential: boolean;
}

interface EngagementForecast {
  period: string;
  predicted: number;
  confidenceLow: number;
  confidenceHigh: number;
  keyDriver: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const ATTRITION_EMPLOYEES: AttritionEmployee[] = [
  {
    id: 'e-001',
    name: 'Alex Thompson',
    initials: 'AT',
    color: 'bg-red-500',
    department: 'Sales',
    title: 'Sales Representative',
    riskScore: 87,
    riskLevel: 'critical',
    riskFactors: [
      'Compensation 18% below market',
      'No promotion in 3+ years',
      'Low engagement score (38/100)',
    ],
    tenure: '4.2 years',
    lastPromotion: '3.5 years ago',
  },
  {
    id: 'e-002',
    name: 'Maria Garcia',
    initials: 'MG',
    color: 'bg-orange-500',
    department: 'Engineering',
    title: 'Software Engineer',
    riskScore: 74,
    riskLevel: 'high',
    riskFactors: ['Low survey participation', 'Infrequent 1:1 meetings', 'Skills underutilization'],
    tenure: '2.8 years',
    lastPromotion: '1.2 years ago',
  },
  {
    id: 'e-003',
    name: 'David Kim',
    initials: 'DK',
    color: 'bg-amber-500',
    department: 'Operations',
    title: 'Operations Analyst',
    riskScore: 68,
    riskLevel: 'high',
    riskFactors: ['Long commute (45+ min)', 'No WFH flexibility', 'Manager conflict signal'],
    tenure: '1.5 years',
    lastPromotion: 'N/A (first role)',
  },
  {
    id: 'e-004',
    name: 'Rachel Lee',
    initials: 'RL',
    color: 'bg-yellow-500',
    department: 'Marketing',
    title: 'Marketing Specialist',
    riskScore: 54,
    riskLevel: 'medium',
    riskFactors: ['Compensation at market lower bound', 'Growth path unclear'],
    tenure: '3.1 years',
    lastPromotion: '2.2 years ago',
  },
  {
    id: 'e-005',
    name: 'James Porter',
    initials: 'JP',
    color: 'bg-yellow-400',
    department: 'Finance',
    title: 'Financial Analyst',
    riskScore: 48,
    riskLevel: 'medium',
    riskFactors: ['Low team engagement', 'Work-life balance signals'],
    tenure: '2.4 years',
    lastPromotion: '1.8 years ago',
  },
  {
    id: 'e-006',
    name: 'Susan Chen',
    initials: 'SC',
    color: 'bg-green-400',
    department: 'Product',
    title: 'Product Manager',
    riskScore: 22,
    riskLevel: 'low',
    riskFactors: ['Minor compensation gap'],
    tenure: '3.8 years',
    lastPromotion: '0.8 years ago',
  },
];

const DEPT_RISK_HEATMAP = [
  { dept: 'Sales', riskScore: 62, atRiskCount: 8 },
  { dept: 'Operations', riskScore: 48, atRiskCount: 5 },
  { dept: 'Marketing', riskScore: 42, atRiskCount: 4 },
  { dept: 'Engineering', riskScore: 35, atRiskCount: 6 },
  { dept: 'Finance', riskScore: 28, atRiskCount: 2 },
  { dept: 'Product', riskScore: 22, atRiskCount: 1 },
  { dept: 'HR', riskScore: 18, atRiskCount: 1 },
];

const WORKFORCE_DEMANDS: WorkforceDemand[] = [
  {
    role: 'Senior Software Engineer',
    department: 'Engineering',
    currentCount: 18,
    demandForecast: 26,
    gap: -8,
    priority: 'critical',
  },
  {
    role: 'Data Scientist',
    department: 'Analytics',
    currentCount: 4,
    demandForecast: 8,
    gap: -4,
    priority: 'critical',
  },
  {
    role: 'Account Executive',
    department: 'Sales',
    currentCount: 22,
    demandForecast: 28,
    gap: -6,
    priority: 'high',
  },
  {
    role: 'DevOps Engineer',
    department: 'Engineering',
    currentCount: 6,
    demandForecast: 9,
    gap: -3,
    priority: 'high',
  },
  {
    role: 'Marketing Manager',
    department: 'Marketing',
    currentCount: 8,
    demandForecast: 10,
    gap: -2,
    priority: 'medium',
  },
  {
    role: 'Product Manager',
    department: 'Product',
    currentCount: 8,
    demandForecast: 8,
    gap: 0,
    priority: 'medium',
  },
  {
    role: 'HR Business Partner',
    department: 'HR',
    currentCount: 6,
    demandForecast: 5,
    gap: 1,
    priority: 'medium',
  },
];

const PERFORMANCE_PREDICTIONS: PerformancePrediction[] = [
  {
    id: 'pe-001',
    name: 'James Miller',
    initials: 'JM',
    color: 'bg-blue-500',
    department: 'Engineering',
    currentRating: 4.2,
    predictedRating: 4.6,
    confidence: 82,
    trajectory: 'improving',
    highPotential: true,
  },
  {
    id: 'pe-002',
    name: 'Olivia Brown',
    initials: 'OB',
    color: 'bg-emerald-500',
    department: 'Design',
    currentRating: 4.0,
    predictedRating: 4.3,
    confidence: 76,
    trajectory: 'improving',
    highPotential: true,
  },
  {
    id: 'pe-003',
    name: 'Tom Johnson',
    initials: 'TJ',
    color: 'bg-amber-500',
    department: 'Engineering',
    currentRating: 3.8,
    predictedRating: 3.7,
    confidence: 71,
    trajectory: 'stable',
    highPotential: false,
  },
  {
    id: 'pe-004',
    name: 'Lisa Wang',
    initials: 'LW',
    color: 'bg-indigo-500',
    department: 'Marketing',
    currentRating: 3.5,
    predictedRating: 3.2,
    confidence: 68,
    trajectory: 'declining',
    highPotential: false,
  },
  {
    id: 'pe-005',
    name: 'Daniel Taylor',
    initials: 'DT',
    color: 'bg-cyan-500',
    department: 'Analytics',
    currentRating: 4.4,
    predictedRating: 4.7,
    confidence: 88,
    trajectory: 'improving',
    highPotential: true,
  },
];

const ENGAGEMENT_FORECAST: EngagementForecast[] = [
  {
    period: 'Q1 2026 (Actual)',
    predicted: 74,
    confidenceLow: 74,
    confidenceHigh: 74,
    keyDriver: 'Strong Q4 performance bonus payout',
  },
  {
    period: 'Q2 2026',
    predicted: 72,
    confidenceLow: 69,
    confidenceHigh: 75,
    keyDriver: 'Post-bonus adjustment period',
  },
  {
    period: 'Q3 2026',
    predicted: 76,
    confidenceLow: 72,
    confidenceHigh: 80,
    keyDriver: 'New L&D programs + mid-year reviews',
  },
  {
    period: 'Q4 2026',
    predicted: 78,
    confidenceLow: 74,
    confidenceHigh: 82,
    keyDriver: 'Year-end recognition + holiday events',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const TAB_LIST: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'attrition', label: 'Attrition Risk', icon: TrendingDown },
  { id: 'workforce', label: 'Workforce Planning', icon: Users },
  { id: 'performance', label: 'Performance Prediction', icon: Target },
  { id: 'engagement', label: 'Engagement Forecast', icon: Activity },
];

function riskLevelConfig(level: RiskLevel) {
  const map = {
    critical: {
      label: 'Critical',
      color: 'bg-red-100 text-red-700 border-red-200',
      barColor: 'bg-red-500',
    },
    high: {
      label: 'High',
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      barColor: 'bg-orange-500',
    },
    medium: {
      label: 'Medium',
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      barColor: 'bg-amber-500',
    },
    low: {
      label: 'Low',
      color: 'bg-green-100 text-green-700 border-green-200',
      barColor: 'bg-green-500',
    },
  };
  return map[level];
}

function trajectoryConfig(t: PerformancePrediction['trajectory']) {
  const map = {
    improving: { label: 'Improving', color: 'text-emerald-600', icon: TrendingUp },
    stable: { label: 'Stable', color: 'text-gray-500', icon: Minus },
    declining: { label: 'Declining', color: 'text-red-500', icon: TrendingDown },
  };
  return map[t];
}

function priorityColor(p: WorkforceDemand['priority']): string {
  const map = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-amber-100 text-amber-700',
    medium: 'bg-blue-100 text-blue-700',
  };
  return map[p];
}

function Avatar({
  initials,
  color,
  size = 'md',
}: {
  initials: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass =
    size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
  return (
    <div
      className={`${sizeClass} ${color} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
    >
      {initials}
    </div>
  );
}

// ── Tab: Attrition Risk ───────────────────────────────────────────────────────

function AttritionRiskTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Critical Risk',
            value: ATTRITION_EMPLOYEES.filter((e) => e.riskLevel === 'critical').length,
            sub: 'Needs immediate action',
            color: 'text-red-600',
          },
          {
            label: 'High Risk',
            value: ATTRITION_EMPLOYEES.filter((e) => e.riskLevel === 'high').length,
            sub: 'Requires attention',
            color: 'text-orange-600',
          },
          {
            label: 'Medium Risk',
            value: ATTRITION_EMPLOYEES.filter((e) => e.riskLevel === 'medium').length,
            sub: 'Monitor closely',
            color: 'text-amber-600',
          },
          {
            label: 'Predicted 90-Day Attrition',
            value: '8.2%',
            sub: '+1.4% vs last quarter',
            color: 'text-purple-600',
          },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              {m.label}
            </p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800">Employee Risk Scores</h3>
          {ATTRITION_EMPLOYEES.map((emp) => {
            const { label, color, barColor } = riskLevelConfig(emp.riskLevel);
            return (
              <div
                key={emp.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
              >
                <div className="flex items-start gap-3">
                  <Avatar initials={emp.initials} color={emp.color} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-gray-800 text-sm">{emp.name}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}
                      >
                        {label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {emp.title} — {emp.department}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor}`}
                          style={{ width: `${emp.riskScore}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${barColor.replace('bg-', 'text-')}`}>
                        {emp.riskScore}/100
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {emp.riskFactors.map((f) => (
                        <span
                          key={f}
                          className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded border border-red-100"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="shrink-0 text-xs px-2 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium whitespace-nowrap">
                    Intervene
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Department Risk Heatmap</h3>
          <div className="space-y-3">
            {DEPT_RISK_HEATMAP.map((dept) => (
              <div key={dept.dept} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-24">{dept.dept}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden relative">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-lg ${dept.riskScore >= 55 ? 'bg-red-500' : dept.riskScore >= 40 ? 'bg-amber-500' : dept.riskScore >= 25 ? 'bg-yellow-400' : 'bg-green-400'}`}
                    style={{ width: `${dept.riskScore}%`, opacity: 0.85 }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600 w-8 text-right">
                  {dept.riskScore}
                </span>
                <span className="text-xs text-gray-400 w-14 text-right">
                  {dept.atRiskCount} at risk
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
            <Info className="w-3 h-3" /> Scores are aggregated from individual employee risk
            predictions
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Workforce Planning ───────────────────────────────────────────────────

function WorkforcePlanningTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Forecasted Demand Gap',
            value: '-22',
            sub: 'Across all critical roles',
            color: 'text-red-600',
          },
          {
            label: 'Critical Role Gaps',
            value: '2',
            sub: '8+ headcount shortage',
            color: 'text-orange-600',
          },
          {
            label: 'Pipeline Coverage',
            value: '64%',
            sub: 'Of forecast needs',
            color: 'text-amber-600',
          },
          {
            label: 'Time to Fill (avg)',
            value: '42 days',
            sub: 'Open requisitions',
            color: 'text-blue-600',
          },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              {m.label}
            </p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Demand Forecast vs Supply Analysis</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            12-month outlook based on growth plan and attrition predictions
          </p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Department
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Current
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Forecast
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Gap
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {WORKFORCE_DEMANDS.map((d) => (
              <tr key={d.role} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800 text-sm">{d.role}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{d.department}</td>
                <td className="px-4 py-3 text-right text-gray-700">{d.currentCount}</td>
                <td className="px-4 py-3 text-right text-gray-700">{d.demandForecast}</td>
                <td
                  className={`px-4 py-3 text-right font-bold ${d.gap < 0 ? 'text-red-600' : d.gap > 0 ? 'text-green-600' : 'text-gray-500'}`}
                >
                  {d.gap < 0 ? d.gap : d.gap > 0 ? `+${d.gap}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor(d.priority)}`}
                  >
                    {d.priority.charAt(0).toUpperCase() + d.priority.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {d.gap < 0 && (
                    <button className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                      Create Req <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                  {d.gap >= 0 && <span className="text-xs text-gray-400">Staffed</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Internal Pipeline',
            desc: '14 employees in development programs eligible for promotion to critical roles',
            color: 'border-blue-200 bg-blue-50',
            textColor: 'text-blue-800',
          },
          {
            title: 'External Talent Pool',
            desc: '38 candidates in ATS pipeline for critical roles. 12 in final stages.',
            color: 'border-purple-200 bg-purple-50',
            textColor: 'text-purple-800',
          },
          {
            title: 'Contractor Bridge',
            desc: 'Consider 6-month contractor arrangements for 4 critical Engineering gaps while hiring progresses.',
            color: 'border-amber-200 bg-amber-50',
            textColor: 'text-amber-800',
          },
        ].map((rec) => (
          <div key={rec.title} className={`rounded-xl border p-4 ${rec.color}`}>
            <p className={`font-semibold text-sm mb-1 ${rec.textColor}`}>{rec.title}</p>
            <p className={`text-xs ${rec.textColor} opacity-80`}>{rec.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Performance Prediction ───────────────────────────────────────────────

function PerformancePredictionTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'High Potential Identified',
            value: PERFORMANCE_PREDICTIONS.filter((p) => p.highPotential).length,
            color: 'text-purple-600',
          },
          {
            label: 'Improving Trajectory',
            value: PERFORMANCE_PREDICTIONS.filter((p) => p.trajectory === 'improving').length,
            color: 'text-emerald-600',
          },
          {
            label: 'Declining Trajectory',
            value: PERFORMANCE_PREDICTIONS.filter((p) => p.trajectory === 'declining').length,
            color: 'text-red-600',
          },
          {
            label: 'Avg Prediction Confidence',
            value: `${Math.round(PERFORMANCE_PREDICTIONS.reduce((s, p) => s + p.confidence, 0) / PERFORMANCE_PREDICTIONS.length)}%`,
            color: 'text-blue-600',
          },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              {m.label}
            </p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {PERFORMANCE_PREDICTIONS.map((pred) => {
          const {
            label: trajLabel,
            color: trajColor,
            icon: TrajIcon,
          } = trajectoryConfig(pred.trajectory);
          const ratingDiff = pred.predictedRating - pred.currentRating;
          return (
            <div key={pred.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar initials={pred.initials} color={pred.color} size="lg" />
                  {pred.highPotential && (
                    <div
                      className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
                      title="High Potential"
                    >
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-semibold text-gray-800">{pred.name}</p>
                    {pred.highPotential && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                        High Potential
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{pred.department}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400">Current Rating</span>
                      <p className="text-xl font-bold text-gray-800 mt-0.5">
                        {pred.currentRating.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Predicted Rating</span>
                      <p
                        className={`text-xl font-bold mt-0.5 ${ratingDiff > 0 ? 'text-emerald-600' : ratingDiff < 0 ? 'text-red-600' : 'text-gray-600'}`}
                      >
                        {pred.predictedRating.toFixed(1)}
                        <span className="text-sm ml-1">
                          {ratingDiff > 0
                            ? `(+${ratingDiff.toFixed(1)})`
                            : `(${ratingDiff.toFixed(1)})`}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Trajectory</span>
                      <p
                        className={`text-sm font-semibold mt-0.5 flex items-center gap-1 ${trajColor}`}
                      >
                        <TrajIcon className="w-4 h-4" /> {trajLabel}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Model Confidence</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-12 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${pred.confidence}%` }}
                          />
                        </div>
                        <span className="font-semibold text-gray-700">{pred.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab: Engagement Forecast ──────────────────────────────────────────────────

function EngagementForecastTab() {
  const interventions = [
    {
      title: 'Compensation Review Cycle',
      impact: 'High',
      timing: 'Q2 2026',
      desc: 'Market adjustment for below-market employees can boost engagement by 3-5 points',
    },
    {
      title: 'Manager Effectiveness Training',
      impact: 'Medium',
      timing: 'Q2-Q3 2026',
      desc: 'Targeted coaching for low-scoring managers across Sales and Operations',
    },
    {
      title: 'Career Framework Launch',
      impact: 'High',
      timing: 'Q3 2026',
      desc: 'Clear promotion criteria and career paths are top driver of engagement for 28% of workforce',
    },
    {
      title: 'Recognition Program Expansion',
      impact: 'Medium',
      timing: 'Q1-Q2 2026',
      desc: 'Increase peer recognition program adoption from 72% to 90%',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Current Engagement', value: '74%', sub: 'Q1 2026', color: 'text-blue-600' },
          {
            label: 'Q2 2026 Forecast',
            value: '72%',
            sub: '-2% adjustment period',
            color: 'text-amber-600',
          },
          {
            label: 'Q4 2026 Target',
            value: '78%',
            sub: 'With interventions',
            color: 'text-emerald-600',
          },
          {
            label: 'Forecast Accuracy',
            value: '±4%',
            sub: '80% confidence interval',
            color: 'text-purple-600',
          },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              {m.label}
            </p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Engagement Score Forecast by Quarter</h3>
        <div className="space-y-4">
          {ENGAGEMENT_FORECAST.map((row, _idx) => {
            const isActual = row.confidenceLow === row.confidenceHigh;
            return (
              <div key={row.period} className="flex items-center gap-4">
                <span className="text-sm text-gray-700 w-40">{row.period}</span>
                <div className="flex-1 relative h-8 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                  {/* Confidence range */}
                  {!isActual && (
                    <div
                      className="absolute top-0 h-full bg-blue-100 rounded-lg"
                      style={{
                        left: `${row.confidenceLow - 50}%`,
                        width: `${row.confidenceHigh - row.confidenceLow}%`,
                      }}
                    />
                  )}
                  {/* Predicted value marker */}
                  <div
                    className={`absolute top-1 bottom-1 w-1 rounded-full ${isActual ? 'bg-blue-600' : 'bg-blue-500'}`}
                    style={{ left: `${row.predicted - 50}%` }}
                  />
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    50%
                  </span>
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    100%
                  </span>
                </div>
                <span
                  className={`text-sm font-bold w-12 text-right ${row.predicted >= 76 ? 'text-emerald-600' : row.predicted >= 72 ? 'text-blue-600' : 'text-amber-600'}`}
                >
                  {row.predicted}%
                </span>
                {!isActual && (
                  <span className="text-xs text-gray-400 w-20">
                    {row.confidenceLow}–{row.confidenceHigh}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {ENGAGEMENT_FORECAST.map((row) => (
          <div key={row.period} className="flex items-start gap-2 mt-2 text-xs text-gray-500">
            <span className="font-medium text-gray-600 w-40 shrink-0">{row.period}:</span>
            <span>{row.keyDriver}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-gray-800">AI-Recommended Interventions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interventions.map((item) => (
            <div key={item.title} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${item.impact === 'High' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}
                >
                  {item.impact} Impact
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2 leading-relaxed">{item.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Activity className="w-3 h-3" /> {item.timing}
                </span>
                <button className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                  Plan <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PredictiveAnalytics() {
  const [activeTab, setActiveTab] = useState<TabId>('attrition');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Predictive Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            AI-powered workforce intelligence and forecasting
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 600);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Models
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            <Download className="w-4 h-4" /> Export Insights
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-1">
          {TAB_LIST.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'attrition' && <AttritionRiskTab />}
          {activeTab === 'workforce' && <WorkforcePlanningTab />}
          {activeTab === 'performance' && <PerformancePredictionTab />}
          {activeTab === 'engagement' && <EngagementForecastTab />}
        </>
      )}
    </div>
  );
}
