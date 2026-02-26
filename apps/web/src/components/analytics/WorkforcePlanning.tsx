/**
 * @module WorkforcePlanning
 * @description Workforce planning module — headcount vs plan, attrition forecast,
 *              cost projection, scenario modeling, skills gap heatmap,
 *              retirement risk analysis (Sec 23.2)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  AlertTriangle,
  Calculator,
  Target,
} from 'lucide-react';
import { HeatmapChart, LineChart, BarChart } from './PeopleAnalyticsCharts';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const DEPARTMENTS = ['Engineering', 'Sales', 'Operations', 'Marketing', 'Product', 'HR', 'Finance'];

const DEPT_HEADCOUNT_VS_PLAN = [
  { dept: 'Engineering', current: 68, planned: 80, openRoles: 12, attritionRisk: 8 },
  { dept: 'Sales', current: 45, planned: 52, openRoles: 7, attritionRisk: 5 },
  { dept: 'Operations', current: 38, planned: 38, openRoles: 0, attritionRisk: 3 },
  { dept: 'Marketing', current: 28, planned: 30, openRoles: 2, attritionRisk: 2 },
  { dept: 'Product', current: 22, planned: 25, openRoles: 3, attritionRisk: 2 },
  { dept: 'HR', current: 18, planned: 18, openRoles: 0, attritionRisk: 1 },
  { dept: 'Finance', current: 16, planned: 17, openRoles: 1, attritionRisk: 1 },
];

const FORECAST_SERIES = [
  {
    name: 'Current Headcount',
    color: '#3b82f6',
    data: [285, 287, 290, 293, 296, 298, 301, 304, 308, 312, 316, 320],
  },
  {
    name: 'Planned',
    color: '#10b981',
    data: [285, 290, 295, 300, 305, 310, 315, 320, 325, 330, 335, 340],
  },
  {
    name: 'Worst Case',
    color: '#f87171',
    data: [285, 283, 280, 278, 276, 274, 273, 272, 271, 270, 270, 269],
  },
];
const FORECAST_MONTHS = [
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
  'Jan',
];

// Skills gap heatmap: departments x skills (0=none, 10=critical gap)
const SKILLS = [
  'ML/AI',
  'Cloud',
  'DevOps',
  'React',
  'Sales',
  'PM',
  'Data Analytics',
  'Cybersecurity',
];
const SKILLS_GAP_DATA: number[][] = [
  [8.5, 7.2, 6.8, 5.0, 1.0, 2.0, 6.5, 5.8], // Engineering
  [2.0, 1.5, 1.0, 1.0, 7.5, 3.0, 4.0, 1.5], // Sales
  [1.5, 4.0, 5.0, 2.0, 3.0, 4.5, 5.5, 4.0], // Operations
  [1.0, 2.0, 1.5, 4.5, 5.0, 3.5, 6.0, 1.0], // Marketing
  [3.5, 3.0, 2.5, 5.0, 2.0, 7.5, 5.5, 2.0], // Product
  [0.5, 0.5, 0.5, 2.0, 1.0, 3.5, 4.5, 1.5], // HR
  [1.5, 2.0, 1.0, 1.5, 1.5, 2.5, 6.5, 2.5], // Finance
];

const RETIREMENT_RISK = [
  {
    name: 'Senior Engineer 4, Eng',
    yearsToRetirement: 3.2,
    role: 'Engineering',
    criticality: 'High',
  },
  { name: 'VP Sales, Sales', yearsToRetirement: 4.1, role: 'Sales', criticality: 'High' },
  {
    name: 'Finance Director, Finance',
    yearsToRetirement: 2.8,
    role: 'Finance',
    criticality: 'High',
  },
  {
    name: 'Sr. Ops Manager, Ops',
    yearsToRetirement: 4.8,
    role: 'Operations',
    criticality: 'Medium',
  },
  {
    name: 'Principal Architect, Eng',
    yearsToRetirement: 5.0,
    role: 'Engineering',
    criticality: 'Medium',
  },
  { name: 'HR Director, HR', yearsToRetirement: 3.5, role: 'HR', criticality: 'High' },
  { name: 'Sr. Sales Lead, Sales', yearsToRetirement: 4.6, role: 'Sales', criticality: 'Medium' },
];

const COST_PROJECTION = [
  { label: 'Q1', value: 8.2 },
  { label: 'Q2', value: 8.6 },
  { label: 'Q3', value: 9.1 },
  { label: 'Q4', value: 9.8 },
];

// ── Scenario Calculator ────────────────────────────────────────────────────────

interface ScenarioState {
  additionalHires: number;
  attritionRate: number;
  salaryBudgetIncrease: number;
}

function ScenarioModeler({ currentHeadcount }: { currentHeadcount: number }) {
  const [scenario, setScenario] = useState<ScenarioState>({
    additionalHires: 20,
    attritionRate: 8,
    salaryBudgetIncrease: 5,
  });

  const attritionCount = Math.round((currentHeadcount * scenario.attritionRate) / 100);
  const projectedHeadcount = currentHeadcount + scenario.additionalHires - attritionCount;
  const currentAnnualCost = 24.5; // $M
  const projectedCost =
    currentAnnualCost *
    (1 + scenario.salaryBudgetIncrease / 100) *
    (projectedHeadcount / currentHeadcount);
  const headcountChange = projectedHeadcount - currentHeadcount;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-4 h-4 text-violet-500" />
        <h2 className="font-semibold text-slate-800">What-If Scenario Modeler</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Additional Hires</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={scenario.additionalHires}
              onChange={(e) =>
                setScenario((s) => ({ ...s, additionalHires: Number(e.target.value) }))
              }
              className="flex-1 accent-blue-600"
            />
            <span className="text-sm font-semibold text-slate-700 w-10 text-right">
              +{scenario.additionalHires}
            </span>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">
            Annual Attrition Rate
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="30"
              value={scenario.attritionRate}
              onChange={(e) =>
                setScenario((s) => ({ ...s, attritionRate: Number(e.target.value) }))
              }
              className="flex-1 accent-amber-500"
            />
            <span className="text-sm font-semibold text-slate-700 w-10 text-right">
              {scenario.attritionRate}%
            </span>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">
            Salary Budget Increase
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="20"
              value={scenario.salaryBudgetIncrease}
              onChange={(e) =>
                setScenario((s) => ({ ...s, salaryBudgetIncrease: Number(e.target.value) }))
              }
              className="flex-1 accent-emerald-500"
            />
            <span className="text-sm font-semibold text-slate-700 w-10 text-right">
              +{scenario.salaryBudgetIncrease}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <div className="text-xs text-slate-500 mb-1">Current Headcount</div>
          <div className="text-2xl font-bold text-slate-700">{currentHeadcount}</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <div className="text-xs text-blue-500 mb-1">Projected Headcount</div>
          <div className="text-2xl font-bold text-blue-700">{projectedHeadcount}</div>
          <div
            className={`text-xs font-medium ${headcountChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
          >
            {headcountChange >= 0 ? '+' : ''}
            {headcountChange}
          </div>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 text-center">
          <div className="text-xs text-amber-600 mb-1">Projected Attrition</div>
          <div className="text-2xl font-bold text-amber-700">{attritionCount}</div>
          <div className="text-xs text-amber-500">this year</div>
        </div>
        <div className="bg-violet-50 rounded-xl p-3 text-center">
          <div className="text-xs text-violet-500 mb-1">Projected Payroll</div>
          <div className="text-2xl font-bold text-violet-700">${projectedCost.toFixed(1)}M</div>
          <div className="text-xs text-slate-400">annual</div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function WorkforcePlanning() {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'retirement' | 'costs'>(
    'overview'
  );

  return (
    <div className="space-y-5 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Workforce Planning</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Strategic headcount planning, forecasting &amp; risk analysis
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Current HC',
            value: '285',
            sub: 'employees',
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Open Roles',
            value: '25',
            sub: 'to fill',
            icon: Target,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Annual Payroll',
            value: '$24.5M',
            sub: 'total cost',
            icon: DollarSign,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Retirement Risk',
            value: '7',
            sub: 'within 5 years',
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">
              {stat.label} · {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {(['overview', 'skills', 'retirement', 'costs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'retirement' ? 'Retirement Risk' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Headcount vs Plan */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Headcount vs Plan by Department</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Department
                    </th>
                    <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Current
                    </th>
                    <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Planned
                    </th>
                    <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Open Roles
                    </th>
                    <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Attrition Risk
                    </th>
                    <th className="py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide pl-4">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DEPT_HEADCOUNT_VS_PLAN.map((dept) => {
                    const pct = (dept.current / dept.planned) * 100;
                    return (
                      <tr key={dept.dept} className="hover:bg-slate-50">
                        <td className="py-3 font-medium text-slate-800">{dept.dept}</td>
                        <td className="py-3 text-right text-slate-700">{dept.current}</td>
                        <td className="py-3 text-right text-slate-500">{dept.planned}</td>
                        <td className="py-3 text-right">
                          <span
                            className={`font-medium ${dept.openRoles > 0 ? 'text-amber-600' : 'text-emerald-600'}`}
                          >
                            {dept.openRoles > 0 ? `+${dept.openRoles}` : '—'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              dept.attritionRisk >= 6
                                ? 'bg-red-100 text-red-700'
                                : dept.attritionRisk >= 3
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {dept.attritionRisk} at risk
                          </span>
                        </td>
                        <td className="py-3 pl-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-100 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500">{pct.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Forecast */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-800 mb-4">12-Month Headcount Forecast</h2>
            <LineChart series={FORECAST_SERIES} labels={FORECAST_MONTHS} height={200} showLegend />
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>Best case: +55 hires, 8% attrition → 340 HC</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                <span>Worst case: hiring freeze, 15% attrition → 269 HC</span>
              </div>
            </div>
          </div>

          <ScenarioModeler currentHeadcount={285} />
        </div>
      )}

      {/* Skills Gap Tab */}
      {activeTab === 'skills' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-800 mb-1">Skills Gap Heatmap</h2>
            <p className="text-xs text-slate-400 mb-4">
              Intensity = severity of skill gap (0 = none, 10 = critical). Hover to see values.
            </p>
            <HeatmapChart
              data={SKILLS_GAP_DATA}
              rowLabels={DEPARTMENTS}
              colLabels={SKILLS}
              colorScale={['#eff6ff', '#1e3a8a']}
              height={180}
            />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-800 mb-4">
              Critical Skills Gaps (Score &gt; 6)
            </h2>
            <div className="space-y-2">
              {[
                {
                  dept: 'Engineering',
                  skill: 'ML/AI',
                  score: 8.5,
                  recommendation: 'Hire 3 ML Engineers; upskill 8 backend engineers',
                },
                {
                  dept: 'Engineering',
                  skill: 'Cloud',
                  score: 7.2,
                  recommendation: 'AWS/GCP certification program for 6 engineers',
                },
                {
                  dept: 'Product',
                  skill: 'Product Management',
                  score: 7.5,
                  recommendation: 'Hire 1 senior PM; send 3 engineers to PM bootcamp',
                },
                {
                  dept: 'Sales',
                  skill: 'Sales',
                  score: 7.5,
                  recommendation: 'Scale sales team with 7 SDRs and 2 AEs',
                },
                {
                  dept: 'Engineering',
                  skill: 'DevOps',
                  score: 6.8,
                  recommendation: 'Build dedicated platform/SRE team of 4',
                },
              ].map((gap) => (
                <div
                  key={`${gap.dept}-${gap.skill}`}
                  className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl"
                >
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {gap.score}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-800">
                      {gap.dept}: {gap.skill}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{gap.recommendation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Retirement Risk Tab */}
      {activeTab === 'retirement' && (
        <div className="space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                7 employees are within 5 years of retirement
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Succession planning should begin immediately for high-criticality roles.
              </p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Employee / Role
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Department
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Years to Retirement
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Criticality
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RETIREMENT_RISK.map((emp) => (
                  <tr key={emp.name} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{emp.name}</td>
                    <td className="px-4 py-3 text-slate-600">{emp.role}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-semibold ${emp.yearsToRetirement < 3.5 ? 'text-red-600' : 'text-amber-600'}`}
                      >
                        {emp.yearsToRetirement} yrs
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          emp.criticality === 'High'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {emp.criticality}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-xs text-blue-600 hover:underline font-medium">
                        Plan Succession
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cost Projection Tab */}
      {activeTab === 'costs' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-800 mb-4">
              Quarterly Payroll Cost Projection ($M)
            </h2>
            <BarChart
              data={COST_PROJECTION.map((d) => ({ ...d, value: d.value }))}
              height={180}
              color="#10b981"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Total Annual Payroll',
                value: '$24.5M',
                sub: 'FY 2026 current',
                trend: '+12%',
                trendColor: 'text-amber-600',
              },
              {
                label: 'Benefits & Overhead',
                value: '$8.2M',
                sub: '33% of payroll',
                trend: '+8%',
                trendColor: 'text-amber-600',
              },
              {
                label: 'Projected Year-End',
                value: '$35.1M',
                sub: 'Total comp cost',
                trend: '+15%',
                trendColor: 'text-amber-600',
              },
            ].map((item) => (
              <div key={item.label} className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{item.value}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-slate-400">{item.sub}</p>
                  <span className={`text-xs font-medium ${item.trendColor}`}>{item.trend} YoY</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Cost Breakdown</h2>
            <div className="space-y-3">
              {[
                { label: 'Base Salaries', value: 68, amount: '$16.7M', color: '#3b82f6' },
                { label: 'Health & Benefits', value: 15, amount: '$3.7M', color: '#10b981' },
                { label: 'Equity & Bonuses', value: 10, amount: '$2.5M', color: '#f59e0b' },
                { label: 'Training & Development', value: 4, amount: '$1.0M', color: '#8b5cf6' },
                { label: 'Recruitment Costs', value: 3, amount: '$0.6M', color: '#06b6d4' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-36 flex-shrink-0">{item.label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-700 w-14 text-right">
                    {item.amount}
                  </span>
                  <span className="text-xs text-slate-400 w-8">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
