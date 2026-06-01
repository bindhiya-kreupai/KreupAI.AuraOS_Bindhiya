'use client';

/**
 * @component AISchedulingDashboard
 * @description AI-powered workforce scheduling — schedule generation, demand forecasting,
 *   fatigue risk monitoring, fairness analytics, and what-if scenario simulation.
 * @project AURA HCM Platform
 * @section 22.1 — AI Scheduling Engine
 * @legal EU WTD (2003/88/EC): 48h max/week, 11h daily rest, 24h weekly rest;
 *   FLSA (29 U.S.C. § 207): 40h/week OT threshold;
 *   Predictive Scheduling Laws: SF, NYC, Chicago, Seattle, Oregon.
 */

import React, { useState, useEffect } from 'react';
import {
  Brain,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Loader2,
  Zap,
  ChevronRight,
} from 'lucide-react';
import type {
  GeneratedSchedule,
  DemandForecast,
  FatigueRiskResult,
  FairnessScore,
  WhatIfScenario,
  ScenarioImpact,
  FatigueLevel,
  SchedulePriority,
} from '@/services/aiSchedulingService';
import { aiSchedulingService } from '@/services/aiSchedulingService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(n);
}

function fmtPercent(n: number, d = 1): string {
  return `${n.toFixed(d)}%`;
}

// ── Fatigue Level Badge ────────────────────────────────────────────────────────

const FATIGUE_STYLES: Record<FatigueLevel, { bg: string; bar: string; text: string }> = {
  LOW: { bg: 'bg-green-100 text-green-800', bar: 'bg-green-500', text: 'text-green-600' },
  MODERATE: { bg: 'bg-yellow-100 text-yellow-800', bar: 'bg-yellow-500', text: 'text-yellow-600' },
  HIGH: { bg: 'bg-orange-100 text-orange-800', bar: 'bg-orange-500', text: 'text-orange-600' },
  CRITICAL: { bg: 'bg-red-100 text-red-800', bar: 'bg-red-500', text: 'text-red-600' },
};

function FatigueBadge({ level }: { level: FatigueLevel }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${FATIGUE_STYLES[level].bg}`}
    >
      {level}
    </span>
  );
}

// ── Tab Types ──────────────────────────────────────────────────────────────────

type TabId = 'generate' | 'demand' | 'fatigue' | 'fairness' | 'what-if';

const TABS: { id: TabId; label: string }[] = [
  { id: 'generate', label: 'Generate Schedule' },
  { id: 'demand', label: 'Demand Forecast' },
  { id: 'fatigue', label: 'Fatigue Monitor' },
  { id: 'fairness', label: 'Fairness' },
  { id: 'what-if', label: 'What-If' },
];

const DEPARTMENTS = [
  { id: 'dept-ops', name: 'Operations' },
  { id: 'dept-cs', name: 'Customer Service' },
  { id: 'dept-eng', name: 'Engineering' },
  { id: 'dept-hr', name: 'Human Resources' },
  { id: 'dept-fin', name: 'Finance' },
];

const PRIORITIES: { value: SchedulePriority; label: string }[] = [
  { value: 'COVERAGE', label: 'Coverage (Maximize coverage)' },
  { value: 'COST', label: 'Cost (Minimize labor cost)' },
  { value: 'FAIRNESS', label: 'Fairness (Equal distribution)' },
  { value: 'PREFERENCE', label: 'Preference (Employee preferences)' },
  { value: 'FATIGUE', label: 'Fatigue (Minimize fatigue risk)' },
];

const MOCK_EMPLOYEE_IDS = ['emp-001', 'emp-002', 'emp-003', 'emp-004', 'emp-005'];

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AISchedulingDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('generate');
  const [_loading, _setLoading] = useState(false);

  // Generate Schedule states
  const [scheduleParams, setScheduleParams] = useState({
    departmentId: 'dept-ops',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    priority: 'COVERAGE' as SchedulePriority,
  });
  const [generatedSchedule, setGeneratedSchedule] = useState<GeneratedSchedule | null>(null);
  const [generating, setGenerating] = useState(false);

  // Demand Forecast states
  const [demandForecast, setDemandForecast] = useState<DemandForecast | null>(null);
  const [demandLoading, setDemandLoading] = useState(false);
  const [forecastDept, setForecastDept] = useState('dept-ops');

  // Fatigue Monitor states
  const [fatigueResults, setFatigueResults] = useState<FatigueRiskResult[]>([]);
  const [fatigueLoading, setFatigueLoading] = useState(false);

  // Fairness states
  const [fairnessScore, setFairnessScore] = useState<FairnessScore | null>(null);
  const [fairnessLoading, setFairnessLoading] = useState(false);

  // What-If states
  const [whatIfScenario, setWhatIfScenario] = useState<WhatIfScenario>({
    scenarioName: 'Scenario 1',
    changes: [{ changeType: 'ADD_EMPLOYEE', description: 'Add 1 full-time employee', value: 1 }],
    projectedImpact: {
      coverageChange: 0,
      costChange: 0,
      overtimeChange: 0,
      fatigueChange: 0,
      fairnessChange: 0,
      feasible: true,
      warnings: [],
    },
  });
  const [scenarioImpact, setScenarioImpact] = useState<ScenarioImpact | null>(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);

  const handleGenerateSchedule = async () => {
    setGenerating(true);
    try {
      const schedule = await aiSchedulingService.generateSchedule({
        departmentId: scheduleParams.departmentId,
        startDate: scheduleParams.startDate,
        endDate: scheduleParams.endDate,
        priority: scheduleParams.priority,
        constraints: [
          {
            type: 'MIN_REST_HOURS',
            value: 11,
            mandatory: true,
            description: 'Minimum 11 hours rest between shifts (EU WTD)',
          },
          {
            type: 'MAX_WEEKLY_HOURS',
            value: 48,
            mandatory: true,
            description: 'Maximum 48 hours per week (EU WTD)',
          },
        ],
        minimumCoverage: [],
        includePartTime: true,
        respectPreferences: true,
      });
      setGeneratedSchedule(schedule);
    } catch (err) {
      console.error('Schedule generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleLoadForecast = async () => {
    setDemandLoading(true);
    try {
      const forecast = await aiSchedulingService.getDemandForecast(
        forecastDept,
        scheduleParams.startDate
      );
      setDemandForecast(forecast);
    } catch (err) {
      console.error('Demand forecast error:', err);
    } finally {
      setDemandLoading(false);
    }
  };

  const handleLoadFatigue = async () => {
    setFatigueLoading(true);
    try {
      const results = await Promise.all(
        MOCK_EMPLOYEE_IDS.map((id) => aiSchedulingService.checkFatigueRisk(id))
      );
      setFatigueResults(results);
    } catch (err) {
      console.error('Fatigue check error:', err);
    } finally {
      setFatigueLoading(false);
    }
  };

  const handleLoadFairness = async () => {
    setFairnessLoading(true);
    try {
      const score = await aiSchedulingService.calculateFairnessScore('sched-001');
      setFairnessScore(score);
    } catch (err) {
      console.error('Fairness score error:', err);
    } finally {
      setFairnessLoading(false);
    }
  };

  const handleRunScenario = async () => {
    setScenarioLoading(true);
    try {
      const impact = await aiSchedulingService.runWhatIfScenario(whatIfScenario);
      setScenarioImpact(impact);
    } catch (err) {
      console.error('Scenario error:', err);
    } finally {
      setScenarioLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'demand' && !demandForecast) handleLoadForecast();
    if (activeTab === 'fatigue' && fatigueResults.length === 0) handleLoadFatigue();
    if (activeTab === 'fairness' && !fairnessScore) handleLoadFairness();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Scheduling Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            AI-powered schedule generation, demand forecasting, and fatigue risk management
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg">
          <Brain className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-indigo-700">AI Engine Active</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 px-4 pt-4 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* ── Generate Schedule Tab ─────────────────────────────────────── */}
          {activeTab === 'generate' && (
            <div className="space-y-5">
              {/* Parameters */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Schedule Parameters</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Department
                    </label>
                    <select
                      value={scheduleParams.departmentId}
                      onChange={(e) =>
                        setScheduleParams((p) => ({ ...p, departmentId: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={scheduleParams.startDate}
                      onChange={(e) =>
                        setScheduleParams((p) => ({ ...p, startDate: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={scheduleParams.endDate}
                      onChange={(e) =>
                        setScheduleParams((p) => ({ ...p, endDate: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Optimization Priority
                    </label>
                    <select
                      value={scheduleParams.priority}
                      onChange={(e) =>
                        setScheduleParams((p) => ({
                          ...p,
                          priority: e.target.value as SchedulePriority,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleGenerateSchedule}
                  disabled={generating}
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  {generating ? 'AI Generating Schedule...' : 'Generate AI Schedule'}
                </button>
              </div>

              {/* Generated Schedule Results */}
              {generatedSchedule && (
                <div className="space-y-4">
                  {/* Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      {
                        label: 'Coverage Rate',
                        value: fmtPercent(generatedSchedule.metrics.coverageRate),
                        color:
                          generatedSchedule.metrics.coverageRate >= 95
                            ? 'text-green-600'
                            : 'text-orange-600',
                      },
                      {
                        label: 'Fairness Score',
                        value: generatedSchedule.metrics.fairnessScore,
                        color: 'text-blue-600',
                      },
                      {
                        label: 'Estimated Cost',
                        value: fmtCurrency(generatedSchedule.metrics.estimatedCost),
                        color: 'text-gray-900',
                      },
                      {
                        label: 'AI Confidence',
                        value: fmtPercent(generatedSchedule.metrics.aiConfidenceScore),
                        color: 'text-indigo-600',
                      },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center"
                      >
                        <p className="text-xs text-gray-500 mb-1">{m.label}</p>
                        <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Additional metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                      <p className="text-xs text-gray-500">Total Hours Scheduled</p>
                      <p className="text-lg font-bold text-gray-900 mt-0.5">
                        {generatedSchedule.metrics.totalHoursScheduled.toLocaleString()}
                      </p>
                      <p className="text-xs text-orange-600 mt-0.5">
                        OT: {generatedSchedule.metrics.totalOvertimeHours}h
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                      <p className="text-xs text-gray-500">Preference Match Rate</p>
                      <p className="text-lg font-bold text-gray-900 mt-0.5">
                        {fmtPercent(generatedSchedule.metrics.preferenceMatchRate)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                      <p className="text-xs text-gray-500">Constraint Violations</p>
                      <p
                        className={`text-lg font-bold mt-0.5 ${generatedSchedule.metrics.constraintViolations > 0 ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {generatedSchedule.metrics.constraintViolations}
                      </p>
                    </div>
                  </div>

                  {/* Violations */}
                  {generatedSchedule.violations.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-red-800 mb-2">
                        Schedule Violations ({generatedSchedule.violations.length})
                      </p>
                      {generatedSchedule.violations.slice(0, 5).map((v, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-red-700 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span>
                            <span className="font-medium">{v.employeeName}</span> — {v.description}{' '}
                            ({v.date})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Coverage Gaps */}
                  {generatedSchedule.coverageGaps.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-yellow-800 mb-2">
                        Coverage Gaps ({generatedSchedule.coverageGaps.length})
                      </p>
                      {generatedSchedule.coverageGaps.map((gap, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-1.5 border-b border-yellow-100 last:border-0"
                        >
                          <div className="text-xs text-yellow-700">
                            <span className="font-medium">{gap.date}</span>
                            <span className="ml-2">
                              {gap.shiftStart}–{gap.shiftEnd}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-yellow-700">
                              Need {gap.required}, have {gap.scheduled}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded font-medium ${gap.impact === 'CRITICAL' ? 'bg-red-100 text-red-700' : gap.impact === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}
                            >
                              {gap.impact}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Assignments Preview */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Schedule Assignments ({generatedSchedule.assignments.length} shifts)
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-200 text-gray-500 text-left bg-gray-50">
                            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">
                              Employee
                            </th>
                            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">
                              Date
                            </th>
                            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">
                              Shift
                            </th>
                            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">
                              Hours
                            </th>
                            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">
                              Fatigue
                            </th>
                            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">
                              AI Score
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {generatedSchedule.assignments.slice(0, 10).map((a, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-800">
                                {a.employeeName}
                              </td>
                              <td className="px-3 py-2 text-gray-600">{a.date}</td>
                              <td className="px-3 py-2 text-gray-700">
                                {a.shiftName} ({a.startTime}–{a.endTime})
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`font-medium ${a.isOvertime ? 'text-orange-600' : 'text-gray-800'}`}
                                >
                                  {a.hoursScheduled}h{a.isOvertime ? ' (OT)' : ''}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1">
                                  <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className={`h-1.5 rounded-full ${a.fatigueScoreAtAssignment < 40 ? 'bg-green-500' : a.fatigueScoreAtAssignment < 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                      style={{ width: `${a.fatigueScoreAtAssignment}%` }}
                                    />
                                  </div>
                                  <span className="text-gray-500">
                                    {a.fatigueScoreAtAssignment}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`font-medium ${a.confidence >= 80 ? 'text-green-600' : a.confidence >= 60 ? 'text-yellow-600' : 'text-red-600'}`}
                                >
                                  {a.confidence}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {generatedSchedule.assignments.length > 10 && (
                        <p className="text-xs text-gray-400 px-3 py-2">
                          + {generatedSchedule.assignments.length - 10} more assignments...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Demand Forecast Tab ───────────────────────────────────────── */}
          {activeTab === 'demand' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <select
                  value={forecastDept}
                  onChange={(e) => {
                    setForecastDept(e.target.value);
                    setDemandForecast(null);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleLoadForecast}
                  disabled={demandLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  {demandLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  Load Forecast
                </button>
              </div>

              {demandLoading && (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mr-2" />
                  <span className="text-sm text-gray-500">Generating AI demand forecast...</span>
                </div>
              )}

              {demandForecast && !demandLoading && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Avg FTE Demand', value: demandForecast.weeklyAvgFTE.toFixed(1) },
                      { label: 'Peak FTE Demand', value: demandForecast.peakDemandFTE.toFixed(1) },
                      {
                        label: 'Forecast Confidence',
                        value: fmtPercent(demandForecast.confidenceInterval),
                      },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center"
                      >
                        <p className="text-xs text-gray-500 mb-0.5">{m.label}</p>
                        <p className="text-xl font-bold text-gray-900">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* 14-Day Forecast Bars */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      14-Day Demand Forecast with Confidence Bands
                    </p>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {demandForecast.forecastByDay.slice(0, 14).map((day, i) => {
                        const maxFTE = Math.max(
                          ...demandForecast.forecastByDay.map((d) => d.upperBound)
                        );
                        const forecastPct = (day.forecastedFTE / maxFTE) * 100;
                        const upperPct = (day.upperBound / maxFTE) * 100;
                        const lowerPct = (day.lowerBound / maxFTE) * 100;
                        const hasEvents = day.specialEvents.length > 0;
                        return (
                          <div
                            key={i}
                            className={`p-2.5 rounded-lg border ${hasEvents ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-700">
                                  {day.date}
                                </span>
                                <span className="text-xs text-gray-500">{day.dayOfWeek}</span>
                                {hasEvents && (
                                  <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200">
                                    {day.specialEvents.join(', ')}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600">
                                <span className="text-gray-400">
                                  {day.lowerBound.toFixed(1)} –{' '}
                                </span>
                                <span className="font-bold text-indigo-700">
                                  {day.forecastedFTE.toFixed(1)}
                                </span>
                                <span className="text-gray-400">
                                  {' '}
                                  – {day.upperBound.toFixed(1)} FTE
                                </span>
                              </div>
                            </div>
                            <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                              {/* Confidence band */}
                              <div
                                className="absolute h-full bg-indigo-100 rounded-full"
                                style={{ left: `${lowerPct}%`, width: `${upperPct - lowerPct}%` }}
                              />
                              {/* Forecast value */}
                              <div
                                className="absolute h-full bg-indigo-500 rounded-full"
                                style={{ width: `${forecastPct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Demand Factors */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Demand Drivers</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {demandForecast.factors.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${f.impact === 'HIGH' ? 'bg-red-100' : f.impact === 'MEDIUM' ? 'bg-yellow-100' : 'bg-green-100'}`}
                          >
                            <TrendingUp
                              className={`w-4 h-4 ${f.impact === 'HIGH' ? 'text-red-600' : f.impact === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-800">{f.factor}</p>
                            <p className="text-xs text-gray-500">{f.description}</p>
                          </div>
                          <span
                            className={`text-xs font-medium flex-shrink-0 ${f.direction === 'INCREASE' ? 'text-red-600' : f.direction === 'DECREASE' ? 'text-green-600' : 'text-gray-500'}`}
                          >
                            {f.direction}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Fatigue Monitor Tab ───────────────────────────────────────── */}
          {activeTab === 'fatigue' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">
                  Employee Fatigue Risk Assessment
                </h4>
                <button
                  onClick={handleLoadFatigue}
                  disabled={fatigueLoading}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${fatigueLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {fatigueLoading && (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500 mr-2" />
                  <span className="text-sm text-gray-500">Calculating fatigue risk scores...</span>
                </div>
              )}

              {fatigueResults.length > 0 && !fatigueLoading && (
                <div className="space-y-3">
                  {fatigueResults
                    .sort((a, b) => b.fatigueScore - a.fatigueScore)
                    .map((result) => {
                      const style = FATIGUE_STYLES[result.fatigueLevel];
                      return (
                        <div
                          key={result.employeeId}
                          className={`bg-white border rounded-xl p-4 ${
                            result.fatigueLevel === 'CRITICAL'
                              ? 'border-red-300'
                              : result.fatigueLevel === 'HIGH'
                                ? 'border-orange-300'
                                : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-gray-900">
                                  {result.employeeName}
                                </p>
                                <FatigueBadge level={result.fatigueLevel} />
                                {!result.canWorkNextShift && (
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200 font-medium">
                                    Cannot Work Next Shift
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Assessed: {result.assessedAt}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-2xl font-bold ${style.text}`}>
                                {result.fatigueScore}
                              </p>
                              <p className="text-xs text-gray-400">/100</p>
                            </div>
                          </div>

                          {/* Score Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-500 ${style.bar}`}
                              style={{ width: `${result.fatigueScore}%` }}
                            />
                          </div>

                          {/* Work Pattern */}
                          <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                            {[
                              {
                                label: 'Last 7d Hours',
                                value: `${result.recentWorkPattern.last7DaysHours}h`,
                              },
                              {
                                label: 'Consecutive Days',
                                value: result.recentWorkPattern.consecutiveDaysWorked,
                              },
                              {
                                label: 'Last 24h Hours',
                                value: `${result.recentWorkPattern.hoursLast24}h`,
                              },
                              {
                                label: 'Night Shifts/7d',
                                value: result.recentWorkPattern.nightShiftsLast7Days,
                              },
                            ].map((p) => (
                              <div
                                key={p.label}
                                className="text-center bg-gray-50 rounded-lg py-1.5"
                              >
                                <p className="text-gray-400">{p.label}</p>
                                <p className="font-bold text-gray-800 mt-0.5">{p.value}</p>
                              </div>
                            ))}
                          </div>

                          {/* Risk Factors */}
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {result.factors.slice(0, 4).map((f, j) => (
                              <span
                                key={j}
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  f.risk === 'HIGH'
                                    ? 'bg-red-100 text-red-700'
                                    : f.risk === 'MEDIUM'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {f.factor} ({f.weight}%)
                              </span>
                            ))}
                          </div>

                          {/* Recommendations */}
                          {result.recommendations.length > 0 && (
                            <div className="text-xs text-gray-600 mt-2">
                              <span className="font-medium text-gray-700">Recommendation: </span>
                              {result.recommendations[0]}
                            </div>
                          )}
                          {result.earliestSafeStartTime && (
                            <p className="text-xs text-orange-600 mt-1 font-medium">
                              Earliest safe start: {result.earliestSafeStartTime}
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* ── Fairness Tab ──────────────────────────────────────────────── */}
          {activeTab === 'fairness' && (
            <div className="space-y-5">
              {fairnessLoading && (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                  <span className="text-sm text-gray-500">Calculating fairness scores...</span>
                </div>
              )}

              {fairnessScore && !fairnessLoading && (
                <>
                  {/* Overall Score */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-blue-800">Overall Fairness Score</p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        {fairnessScore.period} • {fairnessScore.departmentId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-3xl font-bold ${fairnessScore.overallScore >= 80 ? 'text-green-600' : fairnessScore.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}
                      >
                        {fairnessScore.overallScore}
                      </p>
                      <p className="text-xs text-blue-500">/ 100</p>
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Fairness Dimensions</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {fairnessScore.dimensions.map((dim, i) => (
                        <div
                          key={i}
                          className={`bg-white border rounded-xl p-4 ${dim.acceptable ? 'border-gray-200' : 'border-yellow-300'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-800">{dim.dimension}</p>
                            <div className="flex items-center gap-1">
                              {dim.acceptable ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              )}
                              <span
                                className={`text-sm font-bold ${dim.score >= 80 ? 'text-green-600' : dim.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}
                              >
                                {dim.score}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className={`h-2 rounded-full ${dim.score >= 80 ? 'bg-green-500' : dim.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${dim.score}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500">{dim.description}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span>Min: {dim.minValue}</span>
                            <span>Max: {dim.maxValue}</span>
                            <span>StdDev: {dim.standardDeviation.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Outliers */}
                  {fairnessScore.employeeOutliers.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-3">Employee Outliers</p>
                      <div className="space-y-2">
                        {fairnessScore.employeeOutliers.map((outlier, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-xl"
                          >
                            <div>
                              <span className="text-sm font-semibold text-gray-800">
                                {outlier.employeeName}
                              </span>
                              <p className="text-xs text-gray-500 mt-0.5">{outlier.dimension}</p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`text-sm font-bold ${outlier.direction === 'OVER_ASSIGNED' ? 'text-red-600' : 'text-blue-600'}`}
                              >
                                {outlier.value.toFixed(1)}
                              </span>
                              <p className="text-xs text-gray-400">
                                Avg: {outlier.departmentAverage.toFixed(1)} (
                                {outlier.deviationPercent > 0 ? '+' : ''}
                                {outlier.deviationPercent.toFixed(0)}%)
                              </p>
                            </div>
                            <span
                              className={`ml-3 text-xs px-2 py-0.5 rounded-full font-medium ${outlier.direction === 'OVER_ASSIGNED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}
                            >
                              {outlier.direction.replace('_', ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">
                      Recommendations
                    </p>
                    <ul className="space-y-1">
                      {fairnessScore.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-indigo-700">
                          <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── What-If Tab ───────────────────────────────────────────────── */}
          {activeTab === 'what-if' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Scenario Builder</h4>
                <p className="text-xs text-gray-500">
                  Simulate workforce changes and see projected impact on coverage, cost, and
                  fatigue.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Scenario Name
                    </label>
                    <input
                      type="text"
                      value={whatIfScenario.scenarioName}
                      onChange={(e) =>
                        setWhatIfScenario((s) => ({ ...s, scenarioName: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Change Type
                    </label>
                    <select
                      value={whatIfScenario.changes[0]?.changeType}
                      onChange={(e) =>
                        setWhatIfScenario((s) => ({
                          ...s,
                          changes: [{ ...s.changes[0], changeType: e.target.value as any }],
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ADD_EMPLOYEE">Add Employee</option>
                      <option value="REMOVE_EMPLOYEE">Remove Employee</option>
                      <option value="CHANGE_DEMAND">Change Demand (+/-20%)</option>
                      <option value="CHANGE_BUDGET">Change Budget</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleRunScenario}
                  disabled={scenarioLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  {scenarioLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  Run Scenario
                </button>
              </div>

              {scenarioImpact && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700">Projected Impact</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${scenarioImpact.feasible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {scenarioImpact.feasible ? 'FEASIBLE' : 'NOT FEASIBLE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      {
                        label: 'Coverage',
                        value: scenarioImpact.coverageChange,
                        fmt: (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`,
                        good: (v: any) => v >= 0,
                      },
                      {
                        label: 'Cost Change',
                        value: scenarioImpact.costChange,
                        fmt: (v: number) => `${v > 0 ? '+' : ''}${fmtCurrency(v)}`,
                        good: (v: any) => v <= 0,
                      },
                      {
                        label: 'Overtime Hours',
                        value: scenarioImpact.overtimeChange,
                        fmt: (v: number) => `${v > 0 ? '+' : ''}${v}h`,
                        good: (v: any) => v <= 0,
                      },
                      {
                        label: 'Fatigue Change',
                        value: scenarioImpact.fatigueChange,
                        fmt: (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}`,
                        good: (v: any) => v <= 0,
                      },
                      {
                        label: 'Fairness Change',
                        value: scenarioImpact.fairnessChange,
                        fmt: (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}`,
                        good: (v: any) => v >= 0,
                      },
                    ].map((item) => {
                      const isGood = item.good(item.value);
                      return (
                        <div
                          key={item.label}
                          className={`text-center rounded-xl p-3 border ${isGood ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                        >
                          <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                          <p
                            className={`text-sm font-bold ${isGood ? 'text-green-700' : 'text-red-700'}`}
                          >
                            {item.fmt(item.value)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {scenarioImpact.warnings.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                      {scenarioImpact.warnings.map((w, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-yellow-700">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          {w}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
