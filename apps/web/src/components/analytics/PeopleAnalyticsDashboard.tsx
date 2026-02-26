/**
 * @module PeopleAnalyticsDashboard
 * @description Enterprise people analytics — workforce, compensation, diversity,
 *              attrition, and custom report builder (Sec 23.2)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Globe,
  BarChart2,
  Download,
  Filter,
  Loader2,
  RefreshCw,
  AlertTriangle,
  UserPlus,
  UserMinus,
  Activity,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'workforce' | 'compensation' | 'diversity' | 'attrition' | 'reports';
type ChartBarItem = { label: string; value: number; color?: string };
type DonutSlice = { label: string; value: number; color: string };

// ── Mock Data ─────────────────────────────────────────────────────────────────

const DEPT_HEADCOUNT: ChartBarItem[] = [
  { label: 'Engineering', value: 68 },
  { label: 'Sales', value: 45 },
  { label: 'Operations', value: 38 },
  { label: 'Marketing', value: 28 },
  { label: 'Product', value: 22 },
  { label: 'HR', value: 18 },
  { label: 'Finance', value: 16 },
  { label: 'Legal', value: 8 },
];

const TOP_LOCATIONS = [
  { city: 'San Francisco, CA', count: 112, pct: 39 },
  { city: 'New York, NY', count: 68, pct: 23 },
  { city: 'Austin, TX', count: 42, pct: 14 },
  { city: 'Chicago, IL', count: 34, pct: 12 },
  { city: 'Remote (US)', count: 34, pct: 12 },
];

const GENDER_SLICES: DonutSlice[] = [
  { label: 'Male', value: 158, color: '#3b82f6' },
  { label: 'Female', value: 112, color: '#ec4899' },
  { label: 'Non-binary', value: 10, color: '#8b5cf6' },
  { label: 'Not specified', value: 5, color: '#94a3b8' },
];

const ETHNICITY_DATA = [
  { label: 'White', value: 42, color: '#3b82f6' },
  { label: 'Asian', value: 28, color: '#10b981' },
  { label: 'Hispanic/Latino', value: 12, color: '#f59e0b' },
  { label: 'Black/African Am.', value: 8, color: '#8b5cf6' },
  { label: 'Two or More', value: 5, color: '#ec4899' },
  { label: 'Other/Undisclosed', value: 5, color: '#94a3b8' },
];

const DIVERSITY_BY_LEVEL = [
  { level: 'C-Suite', femaleRatio: 40, minorityRatio: 20 },
  { level: 'VP', femaleRatio: 38, minorityRatio: 25 },
  { level: 'Director', femaleRatio: 42, minorityRatio: 30 },
  { level: 'Manager', femaleRatio: 44, minorityRatio: 35 },
  { level: 'IC', femaleRatio: 38, minorityRatio: 38 },
];

const ATTRITION_BY_DEPT = [
  { dept: 'Sales', rate: 18, regrettable: 8, voluntary: 14, involuntary: 4 },
  { dept: 'Operations', rate: 14, regrettable: 6, voluntary: 10, involuntary: 4 },
  { dept: 'Marketing', rate: 12, regrettable: 5, voluntary: 9, involuntary: 3 },
  { dept: 'Engineering', rate: 8, regrettable: 4, voluntary: 6, involuntary: 2 },
  { dept: 'Product', rate: 7, regrettable: 2, voluntary: 5, involuntary: 2 },
  { dept: 'HR', rate: 6, regrettable: 1, voluntary: 4, involuntary: 2 },
];

const EXIT_REASONS = [
  { reason: 'Better Opportunity', count: 32, pct: 40 },
  { reason: 'Compensation', count: 22, pct: 28 },
  { reason: 'Career Growth', count: 14, pct: 18 },
  { reason: 'Work-Life Balance', count: 8, pct: 10 },
  { reason: 'Management', count: 4, pct: 5 },
];

const SALARY_BANDS = [
  { band: '$50K–$75K', count: 38, compaRatio: 0.98 },
  { band: '$75K–$100K', count: 72, compaRatio: 1.02 },
  { band: '$100K–$150K', count: 88, compaRatio: 0.97 },
  { band: '$150K–$200K', count: 52, compaRatio: 1.05 },
  { band: '$200K+', count: 40, compaRatio: 1.08 },
];

const COMP_BREAKDOWN = [
  { component: 'Base Salary', amount: 8420000, pct: 62, color: 'bg-blue-500' },
  { component: 'Bonus', amount: 1840000, pct: 14, color: 'bg-purple-500' },
  { component: 'Equity (RSU)', amount: 2100000, pct: 15, color: 'bg-amber-500' },
  { component: 'Benefits', amount: 1220000, pct: 9, color: 'bg-emerald-500' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const TAB_LIST: { id: TabId; label: string }[] = [
  { id: 'workforce', label: 'Workforce' },
  { id: 'compensation', label: 'Compensation' },
  { id: 'diversity', label: 'Diversity' },
  { id: 'attrition', label: 'Attrition' },
  { id: 'reports', label: 'Custom Reports' },
];

function MetricCard({
  label,
  value,
  sub,
  color,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: React.ElementType;
  trend?: 'up' | 'down' | 'flat';
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      </div>
      <p className={`text-2xl font-bold ${color ?? 'text-gray-800'}`}>{value}</p>
      {sub && (
        <p className="text-xs mt-0.5 flex items-center gap-1">
          {trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
          <span
            className={
              trend === 'up'
                ? 'text-emerald-600'
                : trend === 'down'
                  ? 'text-red-600'
                  : 'text-gray-400'
            }
          >
            {sub}
          </span>
        </p>
      )}
    </div>
  );
}

function HorizontalBar({ items, maxValue }: { items: ChartBarItem[]; maxValue?: number }) {
  const max = maxValue ?? Math.max(...items.map((i) => i.value));
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3 text-sm">
          <span className="w-24 text-xs text-gray-600 truncate">{item.label}</span>
          <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${item.color ?? 'bg-blue-500'}`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <span className="w-8 text-right text-xs font-semibold text-gray-700">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ slices }: { slices: DonutSlice[] }) {
  const total = slices.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const r = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="w-32 h-32">
        {slices.map((slice, i) => {
          const pct = slice.value / total;
          const dashArray = circumference * pct;
          const dashOffset = -circumference * cumulative;
          cumulative += pct;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={slice.color}
              strokeWidth="28"
              strokeDasharray={`${dashArray} ${circumference}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
        })}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          className="text-xs"
          fontSize="14"
          fontWeight="700"
          fill="#1e293b"
        >
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#94a3b8">
          Total
        </text>
      </svg>
      <div className="space-y-1.5">
        {slices.map((slice) => (
          <div key={slice.label} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-gray-600">{slice.label}</span>
            <span className="font-semibold text-gray-800 ml-auto">{slice.value}</span>
            <span className="text-gray-400">({Math.round((slice.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Workforce ────────────────────────────────────────────────────────────

function WorkforceTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Headcount"
          value={290}
          sub="+8 this month"
          color="text-blue-600"
          icon={Users}
          trend="up"
        />
        <MetricCard
          label="New Hires (MTD)"
          value={8}
          sub="+2 vs last month"
          color="text-emerald-600"
          icon={UserPlus}
          trend="up"
        />
        <MetricCard
          label="Terminations (MTD)"
          value={3}
          sub="-1 vs last month"
          color="text-red-600"
          icon={UserMinus}
          trend="down"
        />
        <MetricCard
          label="Avg Tenure"
          value="3.2 yrs"
          sub="+0.2 vs last year"
          color="text-purple-600"
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="FTE Employees" value={268} sub="92% of total" color="text-indigo-600" />
        <MetricCard label="Contractors" value={22} sub="8% of total" color="text-amber-600" />
        <MetricCard
          label="Open Positions"
          value={18}
          sub="6.2% vacancy rate"
          color="text-gray-700"
        />
        <MetricCard
          label="Offer Acceptance"
          value="88%"
          sub="+3% vs last qtr"
          color="text-teal-600"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Headcount by Department</h3>
          <HorizontalBar items={DEPT_HEADCOUNT} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Top Locations</h3>
          <div className="space-y-3">
            {TOP_LOCATIONS.map((loc) => (
              <div key={loc.city} className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700 flex-1">{loc.city}</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${loc.pct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600 w-8 text-right">
                  {loc.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Compensation ─────────────────────────────────────────────────────────

function CompensationTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Comp Budget"
          value="$13.6M"
          sub="Annualized"
          color="text-blue-600"
        />
        <MetricCard
          label="Avg Base Salary"
          value="$124K"
          sub="+4.2% YoY"
          color="text-emerald-600"
          trend="up"
        />
        <MetricCard
          label="Avg Compa-Ratio"
          value="1.02"
          sub="2% above midpoint"
          color="text-amber-600"
        />
        <MetricCard
          label="Pay Equity Score"
          value="94/100"
          sub="Above industry avg"
          color="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Salary Band Distribution</h3>
          <div className="space-y-3">
            {SALARY_BANDS.map((band) => (
              <div key={band.band} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-700 font-medium">{band.band}</span>
                  <div className="flex gap-3">
                    <span className="text-gray-500">{band.count} employees</span>
                    <span
                      className={`font-semibold ${band.compaRatio >= 1.05 ? 'text-amber-600' : band.compaRatio < 0.95 ? 'text-red-500' : 'text-emerald-600'}`}
                    >
                      Compa: {band.compaRatio.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${band.compaRatio >= 1.05 ? 'bg-amber-500' : band.compaRatio < 0.95 ? 'bg-red-400' : 'bg-blue-500'}`}
                    style={{ width: `${(band.count / 100) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Total Compensation Breakdown</h3>
          <div className="space-y-3">
            {COMP_BREAKDOWN.map((c) => (
              <div key={c.component} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-32">{c.component}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.color}`}
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600 w-8 text-right">{c.pct}%</span>
                <span className="text-xs text-gray-400 w-16 text-right">
                  ${(c.amount / 1000000).toFixed(1)}M
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Pay Equity Indicators</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Gender Pay Gap', value: '3.2%', status: 'acceptable', note: 'Adjusted gap' },
            { label: 'Ethnicity Pay Gap', value: '2.8%', status: 'good', note: 'Adjusted gap' },
            {
              label: 'Disparate Impact Ratio',
              value: '0.94',
              status: 'acceptable',
              note: 'Threshold: 0.80',
            },
            {
              label: 'Pay Range Penetration',
              value: '52%',
              status: 'good',
              note: 'Avg of all employees',
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`p-3 rounded-lg border ${item.status === 'good' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}
            >
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p
                className={`text-xl font-bold ${item.status === 'good' ? 'text-emerald-700' : 'text-amber-700'}`}
              >
                {item.value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Diversity ────────────────────────────────────────────────────────────

function DiversityTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Female Representation"
          value="39%"
          sub="+2% vs last year"
          color="text-pink-600"
          trend="up"
        />
        <MetricCard
          label="Minority Representation"
          value="33%"
          sub="+1% vs last year"
          color="text-purple-600"
          trend="up"
        />
        <MetricCard label="DIB Index Score" value="72/100" sub="Good" color="text-blue-600" />
        <MetricCard
          label="Inclusive Hire Rate"
          value="48%"
          sub="Last 90 days"
          color="text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Gender Distribution</h3>
          <DonutChart slices={GENDER_SLICES} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Ethnicity Breakdown</h3>
          <div className="space-y-2">
            {ETHNICITY_DATA.map((e) => (
              <div key={e.label} className="flex items-center gap-3 text-sm">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: e.color }}
                />
                <span className="text-gray-600 w-36">{e.label}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${e.value}%`, backgroundColor: e.color }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-8 text-right">
                  {e.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Diversity by Level</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Level
                </th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Female %
                </th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Female Bar
                </th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Minority %
                </th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Minority Bar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DIVERSITY_BY_LEVEL.map((row) => (
                <tr key={row.level} className="hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-800">{row.level}</td>
                  <td className="py-3 text-pink-600 font-semibold">{row.femaleRatio}%</td>
                  <td className="py-3 w-32">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pink-400 rounded-full"
                        style={{ width: `${row.femaleRatio}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 text-purple-600 font-semibold">{row.minorityRatio}%</td>
                  <td className="py-3 w-32">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-400 rounded-full"
                        style={{ width: `${row.minorityRatio}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Attrition ────────────────────────────────────────────────────────────

function AttritionTab() {
  const flightRiskEmployees = [
    {
      name: 'Alex Thompson',
      dept: 'Sales',
      riskScore: 82,
      factors: ['Compensation below market', 'No promotion in 3+ years'],
    },
    {
      name: 'Maria Garcia',
      dept: 'Engineering',
      riskScore: 71,
      factors: ['Low engagement scores', 'Minimal learning opportunities'],
    },
    {
      name: 'David Kim',
      dept: 'Operations',
      riskScore: 68,
      factors: ['Long commute', 'No WFH flexibility'],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Overall Attrition (TTM)"
          value="11.2%"
          sub="-0.8% vs prev year"
          color="text-amber-600"
          icon={TrendingDown}
          trend="down"
        />
        <MetricCard
          label="Voluntary Attrition"
          value="8.6%"
          sub="77% of total"
          color="text-red-600"
        />
        <MetricCard
          label="Regrettable Attrition"
          value="4.1%"
          sub="36% of voluntary"
          color="text-orange-600"
        />
        <MetricCard
          label="High Performer Exit Rate"
          value="1.8%"
          sub="-0.5% improvement"
          color="text-purple-600"
          trend="down"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Attrition by Department</h3>
          <div className="space-y-3">
            {ATTRITION_BY_DEPT.map((d) => (
              <div key={d.dept} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-24">{d.dept}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${d.rate >= 15 ? 'bg-red-500' : d.rate >= 10 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${(d.rate / 20) * 100}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-bold w-10 text-right ${d.rate >= 15 ? 'text-red-600' : d.rate >= 10 ? 'text-amber-600' : 'text-emerald-600'}`}
                >
                  {d.rate}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Exit Reason Distribution</h3>
          <div className="space-y-3">
            {EXIT_REASONS.map((r) => (
              <div key={r.reason} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-36">{r.reason}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${r.pct}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-600 w-10 text-right">
                  {r.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Predicted Flight Risk</h3>
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> AI Prediction
          </span>
        </div>
        <div className="space-y-3">
          {flightRiskEmployees.map((emp) => (
            <div
              key={emp.name}
              className="flex items-start gap-4 p-3 bg-red-50 rounded-lg border border-red-100"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-800 text-sm">{emp.name}</p>
                  <span className="text-xs text-gray-500">— {emp.dept}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {emp.factors.map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 bg-white text-red-600 text-xs rounded border border-red-200"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="shrink-0 text-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${emp.riskScore >= 80 ? 'bg-red-500' : emp.riskScore >= 70 ? 'bg-orange-500' : 'bg-amber-500'}`}
                >
                  {emp.riskScore}
                </div>
                <p className="text-xs text-gray-500 mt-1">Risk</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Custom Reports ───────────────────────────────────────────────────────

function CustomReportsTab() {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['Headcount', 'Attrition Rate']);
  const [dimension, setDimension] = useState('department');
  const [dateRange, setDateRange] = useState('last_quarter');

  const metrics = [
    'Headcount',
    'Attrition Rate',
    'Avg Salary',
    'Promotion Rate',
    'Engagement Score',
    'Time to Fill',
    'Offer Acceptance',
    'Diversity %',
  ];

  const toggleMetric = (m: string) => {
    setSelectedMetrics((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Report Builder</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dimension</label>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="department">Department</option>
              <option value="location">Location</option>
              <option value="level">Level / Grade</option>
              <option value="gender">Gender</option>
              <option value="tenure">Tenure Band</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="last_month">Last Month</option>
              <option value="last_quarter">Last Quarter</option>
              <option value="ytd">Year to Date</option>
              <option value="last_year">Last 12 Months</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Bar Chart</option>
              <option>Line Chart</option>
              <option>Pie Chart</option>
              <option>Table</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Metrics to Include</label>
          <div className="flex flex-wrap gap-2">
            {metrics.map((m) => (
              <button
                key={m}
                onClick={() => toggleMetric(m)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-all ${selectedMetrics.includes(m) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium flex items-center gap-2">
            <BarChart2 className="w-4 h-4" /> Generate Report
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export as PDF
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export as Excel
          </button>
        </div>
      </div>

      {/* Preview placeholder */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">
          Report Preview — {selectedMetrics.join(', ')} by {dimension}
        </h3>
        <div className="space-y-3">
          {DEPT_HEADCOUNT.slice(0, 5).map((dept) => (
            <div key={dept.label} className="flex items-center gap-3 text-sm">
              <span className="w-24 text-gray-600">{dept.label}</span>
              {selectedMetrics.includes('Headcount') && (
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-24 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(dept.value / 68) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{dept.value}</span>
                </div>
              )}
              {selectedMetrics.includes('Attrition Rate') && (
                <span className="text-xs text-red-500 ml-4">
                  {(Math.random() * 15 + 5).toFixed(1)}% attrition
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PeopleAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('workforce');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">People Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Enterprise workforce intelligence and reporting
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-1">
          {TAB_LIST.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'workforce' && <WorkforceTab />}
          {activeTab === 'compensation' && <CompensationTab />}
          {activeTab === 'diversity' && <DiversityTab />}
          {activeTab === 'attrition' && <AttritionTab />}
          {activeTab === 'reports' && <CustomReportsTab />}
        </>
      )}
    </div>
  );
}
