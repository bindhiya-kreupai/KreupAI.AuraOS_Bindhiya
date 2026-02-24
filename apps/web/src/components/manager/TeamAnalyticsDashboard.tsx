/**
 * @module TeamAnalyticsDashboard
 * @description Comprehensive team analytics dashboard with headcount trend, attrition rate,
 *              performance distribution, leave utilization, and overtime hours charts
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Users,
  Minus,
  BarChart3,
  Palmtree,
  Clock,
  UserMinus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

// ── Types ────────────────────────────────────────────────────────────────────────

interface HeadcountTrend {
  month: string;
  totalHeadcount: number;
  newJoiners: number;
  separations: number;
  netChange: number;
}

interface AttritionData {
  month: string;
  attritionRate: number; // %
  voluntary: number;
  involuntary: number;
  target: number; // target attrition %
}

interface PerformanceDistribution {
  rating: string;
  label: string;
  count: number;
  percent: number;
  color: string;
}

interface LeaveUtilization {
  type: string;
  allocated: number;
  used: number;
  remaining: number;
  utilizationPercent: number;
  color: string;
}

interface OvertimeData {
  month: string;
  totalHours: number;
  engineering: number;
  product: number;
  support: number;
  avgPerEmployee: number;
}

interface TeamStat {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  color: string;
}

type ActiveChart = 'headcount' | 'attrition' | 'performance' | 'leave' | 'overtime';

// ── Mock Data ────────────────────────────────────────────────────────────────────

const HEADCOUNT_DATA: HeadcountTrend[] = [
  { month: 'Sep', totalHeadcount: 42, newJoiners: 3, separations: 1, netChange: 2 },
  { month: 'Oct', totalHeadcount: 44, newJoiners: 4, separations: 2, netChange: 2 },
  { month: 'Nov', totalHeadcount: 45, newJoiners: 2, separations: 1, netChange: 1 },
  { month: 'Dec', totalHeadcount: 44, newJoiners: 1, separations: 2, netChange: -1 },
  { month: 'Jan', totalHeadcount: 46, newJoiners: 3, separations: 1, netChange: 2 },
  { month: 'Feb', totalHeadcount: 48, newJoiners: 3, separations: 1, netChange: 2 },
];

const ATTRITION_DATA: AttritionData[] = [
  { month: 'Sep', attritionRate: 2.4, voluntary: 1, involuntary: 0, target: 3.0 },
  { month: 'Oct', attritionRate: 4.5, voluntary: 1, involuntary: 1, target: 3.0 },
  { month: 'Nov', attritionRate: 2.2, voluntary: 1, involuntary: 0, target: 3.0 },
  { month: 'Dec', attritionRate: 4.5, voluntary: 2, involuntary: 0, target: 3.0 },
  { month: 'Jan', attritionRate: 2.2, voluntary: 1, involuntary: 0, target: 3.0 },
  { month: 'Feb', attritionRate: 2.1, voluntary: 1, involuntary: 0, target: 3.0 },
];

const PERFORMANCE_DATA: PerformanceDistribution[] = [
  { rating: '5', label: 'Outstanding', count: 6, percent: 12.5, color: '#10b981' },
  { rating: '4', label: 'Exceeds', count: 14, percent: 29.2, color: '#6366f1' },
  { rating: '3', label: 'Meets', count: 18, percent: 37.5, color: '#f59e0b' },
  { rating: '2', label: 'Developing', count: 7, percent: 14.6, color: '#f97316' },
  { rating: '1', label: 'Needs Imp.', count: 3, percent: 6.3, color: '#ef4444' },
];

const LEAVE_DATA: LeaveUtilization[] = [
  {
    type: 'Annual',
    allocated: 480,
    used: 312,
    remaining: 168,
    utilizationPercent: 65,
    color: '#6366f1',
  },
  {
    type: 'Sick',
    allocated: 240,
    used: 96,
    remaining: 144,
    utilizationPercent: 40,
    color: '#ef4444',
  },
  {
    type: 'Casual',
    allocated: 192,
    used: 144,
    remaining: 48,
    utilizationPercent: 75,
    color: '#f59e0b',
  },
  {
    type: 'Compensatory',
    allocated: 96,
    used: 48,
    remaining: 48,
    utilizationPercent: 50,
    color: '#10b981',
  },
  { type: 'Unpaid', allocated: 0, used: 12, remaining: 0, utilizationPercent: 0, color: '#94a3b8' },
];

const OVERTIME_DATA: OvertimeData[] = [
  { month: 'Sep', totalHours: 186, engineering: 98, product: 48, support: 40, avgPerEmployee: 4.4 },
  {
    month: 'Oct',
    totalHours: 220,
    engineering: 120,
    product: 52,
    support: 48,
    avgPerEmployee: 5.0,
  },
  {
    month: 'Nov',
    totalHours: 194,
    engineering: 102,
    product: 44,
    support: 48,
    avgPerEmployee: 4.3,
  },
  {
    month: 'Dec',
    totalHours: 248,
    engineering: 140,
    product: 56,
    support: 52,
    avgPerEmployee: 5.6,
  },
  {
    month: 'Jan',
    totalHours: 210,
    engineering: 110,
    product: 50,
    support: 50,
    avgPerEmployee: 4.6,
  },
  { month: 'Feb', totalHours: 178, engineering: 90, product: 46, support: 42, avgPerEmployee: 3.7 },
];

const CHART_TABS: { key: ActiveChart; icon: LucideIcon; label: string }[] = [
  { key: 'headcount', icon: Users, label: 'Headcount' },
  { key: 'attrition', icon: UserMinus, label: 'Attrition' },
  { key: 'performance', icon: BarChart3, label: 'Performance' },
  { key: 'leave', icon: Palmtree, label: 'Leave' },
  { key: 'overtime', icon: Clock, label: 'Overtime' },
];

// ── Stat Card ────────────────────────────────────────────────────────────────────

const StatCard: React.FC<TeamStat> = ({ icon: Icon, label, value, change, changeLabel, color }) => (
  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue">
    <div className={`p-1.5 rounded-lg ${color}`}>
      <Icon className="w-3.5 h-3.5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-lg font-bold text-ink-black dark:text-pearl leading-none">{value}</p>
      <p className="text-[9px] text-silver-mist">{label}</p>
    </div>
    {change !== undefined && (
      <div
        className={`flex items-center gap-0.5 text-[9px] font-semibold ${
          change > 0 ? 'text-neural-mint' : change < 0 ? 'text-coral-alert' : 'text-silver-mist'
        }`}
      >
        {change > 0 ? (
          <ArrowUpRight className="w-3 h-3" />
        ) : change < 0 ? (
          <ArrowDownRight className="w-3 h-3" />
        ) : (
          <Minus className="w-3 h-3" />
        )}
        {change > 0 ? '+' : ''}
        {change}
        {changeLabel || '%'}
      </div>
    )}
  </div>
);

// ── Custom Tooltip ───────────────────────────────────────────────────────────────

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue shadow-lg p-2 text-[10px]">
      <p className="font-bold text-ink-black dark:text-pearl mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || '#6366f1' }} />
          <span className="text-silver-mist">{p.name}:</span>
          <span className="font-semibold text-ink-black dark:text-pearl">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────────

export const TeamAnalyticsDashboard: React.FC = () => {
  const [activeChart, setActiveChart] = useState<ActiveChart>('headcount');

  // Computed stats
  const latestHeadcount = HEADCOUNT_DATA[HEADCOUNT_DATA.length - 1];
  const prevHeadcount = HEADCOUNT_DATA[HEADCOUNT_DATA.length - 2];
  const headcountChange = latestHeadcount.totalHeadcount - prevHeadcount.totalHeadcount;

  const latestAttrition = ATTRITION_DATA[ATTRITION_DATA.length - 1];
  const prevAttrition = ATTRITION_DATA[ATTRITION_DATA.length - 2];
  const attritionChange = +(latestAttrition.attritionRate - prevAttrition.attritionRate).toFixed(1);

  const avgPerformance = (
    PERFORMANCE_DATA.reduce((s, d) => s + parseInt(d.rating) * d.count, 0) /
    PERFORMANCE_DATA.reduce((s, d) => s + d.count, 0)
  ).toFixed(1);
  const highPerformers = PERFORMANCE_DATA.filter((d) => parseInt(d.rating) >= 4).reduce(
    (s, d) => s + d.count,
    0
  );

  const totalLeaveUsed = LEAVE_DATA.reduce((s, d) => s + d.used, 0);
  const totalLeaveAllocated = LEAVE_DATA.filter((d) => d.allocated > 0).reduce(
    (s, d) => s + d.allocated,
    0
  );
  const overallLeaveUtil =
    totalLeaveAllocated > 0 ? Math.round((totalLeaveUsed / totalLeaveAllocated) * 100) : 0;

  const latestOvertime = OVERTIME_DATA[OVERTIME_DATA.length - 1];
  const prevOvertime = OVERTIME_DATA[OVERTIME_DATA.length - 2];
  const overtimeChange = Math.round(
    ((latestOvertime.totalHours - prevOvertime.totalHours) / prevOvertime.totalHours) * 100
  );

  const stats: TeamStat[] = [
    {
      icon: Users,
      label: 'Total Headcount',
      value: latestHeadcount.totalHeadcount,
      change: headcountChange,
      changeLabel: '',
      color: 'bg-celestial-indigo/10 text-celestial-indigo',
    },
    {
      icon: UserMinus,
      label: 'Attrition Rate',
      value: `${latestAttrition.attritionRate}%`,
      change: attritionChange,
      changeLabel: 'pp',
      color: 'bg-coral-alert/10 text-coral-alert',
    },
    {
      icon: BarChart3,
      label: 'Avg Rating',
      value: avgPerformance,
      change: highPerformers,
      changeLabel: ' high perf',
      color: 'bg-sunset-amber/10 text-sunset-amber',
    },
    {
      icon: Palmtree,
      label: 'Leave Utilization',
      value: `${overallLeaveUtil}%`,
      color: 'bg-neural-mint/10 text-neural-mint',
    },
    {
      icon: Clock,
      label: 'Overtime (hrs)',
      value: latestOvertime.totalHours,
      change: overtimeChange,
      changeLabel: '%',
      color: 'bg-nebula-purple/10 text-nebula-purple',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Chart Tabs */}
      <div className="flex items-center gap-1 bg-pearl dark:bg-deep-cosmos rounded-xl p-0.5 border border-cloud dark:border-nebula-purple/30 w-fit">
        {CHART_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveChart(tab.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeChart === tab.key
                ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
                : 'text-silver-mist hover:text-twilight dark:hover:text-pearl'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart Content */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4">
        {activeChart === 'headcount' && <HeadcountChart />}
        {activeChart === 'attrition' && <AttritionChart />}
        {activeChart === 'performance' && <PerformanceChart />}
        {activeChart === 'leave' && <LeaveChart />}
        {activeChart === 'overtime' && <OvertimeChart />}
      </div>
    </div>
  );
};

// ── 1. Headcount Trend Chart ─────────────────────────────────────────────────────

const HeadcountChart: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Users className="w-4 h-4 text-celestial-indigo" />
          Headcount Trend
        </p>
        <p className="text-[10px] text-silver-mist mt-0.5">6-month team composition overview</p>
      </div>
      <div className="flex items-center gap-4 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-1.5 rounded-full bg-celestial-indigo" />
          <span className="text-silver-mist">Headcount</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-1.5 rounded-full bg-neural-mint" />
          <span className="text-silver-mist">Joiners</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-1.5 rounded-full bg-coral-alert" />
          <span className="text-silver-mist">Separations</span>
        </div>
      </div>
    </div>

    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={HEADCOUNT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="totalHeadcount"
            name="Headcount"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.1}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>

    {/* Joiners vs Separations bar */}
    <div className="grid grid-cols-6 gap-2">
      {HEADCOUNT_DATA.map((d) => (
        <div key={d.month} className="text-center">
          <p className="text-[9px] font-semibold text-silver-mist mb-1">{d.month}</p>
          <div className="flex items-end justify-center gap-0.5 h-10">
            <div
              className="w-3 rounded-t bg-neural-mint/70"
              style={{ height: `${(d.newJoiners / 5) * 100}%` }}
              title={`+${d.newJoiners}`}
            />
            <div
              className="w-3 rounded-t bg-coral-alert/70"
              style={{ height: `${(d.separations / 5) * 100}%` }}
              title={`-${d.separations}`}
            />
          </div>
          <p
            className={`text-[9px] font-bold mt-0.5 ${d.netChange >= 0 ? 'text-neural-mint' : 'text-coral-alert'}`}
          >
            {d.netChange >= 0 ? '+' : ''}
            {d.netChange}
          </p>
        </div>
      ))}
    </div>
  </div>
);

// ── 2. Attrition Rate Chart ──────────────────────────────────────────────────────

const AttritionChart: React.FC = () => {
  const avgAttrition = (
    ATTRITION_DATA.reduce((s, d) => s + d.attritionRate, 0) / ATTRITION_DATA.length
  ).toFixed(1);
  const totalSeparations = ATTRITION_DATA.reduce((s, d) => s + d.voluntary + d.involuntary, 0);
  const totalVoluntary = ATTRITION_DATA.reduce((s, d) => s + d.voluntary, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <UserMinus className="w-4 h-4 text-coral-alert" />
            Attrition Rate
          </p>
          <p className="text-[10px] text-silver-mist mt-0.5">Monthly attrition trends vs target</p>
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-3 h-1.5 rounded-full bg-coral-alert" />
            <span className="text-silver-mist">Attrition %</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-1.5 rounded-full bg-silver-mist/40 border border-dashed border-silver-mist" />
            <span className="text-silver-mist">Target</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={ATTRITION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              unit="%"
              domain={[0, 'dataMax + 1']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="target"
              name="Target"
              stroke="#94a3b8"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="attritionRate"
              name="Attrition %"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="px-3 py-2 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10 text-center">
          <p className="text-lg font-bold text-coral-alert">{avgAttrition}%</p>
          <p className="text-[9px] text-silver-mist">Avg Attrition</p>
        </div>
        <div className="px-3 py-2 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10 text-center">
          <p className="text-lg font-bold text-ink-black dark:text-pearl">{totalSeparations}</p>
          <p className="text-[9px] text-silver-mist">Total Separations</p>
        </div>
        <div className="px-3 py-2 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10 text-center">
          <p className="text-lg font-bold text-sunset-amber">
            {totalSeparations > 0 ? Math.round((totalVoluntary / totalSeparations) * 100) : 0}%
          </p>
          <p className="text-[9px] text-silver-mist">Voluntary Rate</p>
        </div>
      </div>
    </div>
  );
};

// ── 3. Performance Distribution Chart ────────────────────────────────────────────

const PerformanceChart: React.FC = () => {
  const totalCount = PERFORMANCE_DATA.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sunset-amber" />
            Performance Distribution
          </p>
          <p className="text-[10px] text-silver-mist mt-0.5">
            {totalCount} employees across 5 rating bands
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Employees" radius={[6, 6, 0, 0]} barSize={36}>
                {PERFORMANCE_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={PERFORMANCE_DATA.map((d) => ({
                  name: d.label,
                  value: d.count,
                  color: d.color,
                }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {PERFORMANCE_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => (
                  <span className="text-[10px] text-silver-mist">{value}</span>
                )}
              />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rating Band Cards */}
      <div className="grid grid-cols-5 gap-2">
        {PERFORMANCE_DATA.map((d) => (
          <div
            key={d.rating}
            className="rounded-lg border border-cloud dark:border-nebula-purple/20 p-2 text-center"
          >
            <div
              className="w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: d.color }}
            >
              {d.rating}
            </div>
            <p className="text-sm font-bold text-ink-black dark:text-pearl">{d.count}</p>
            <p className="text-[8px] text-silver-mist">{d.label}</p>
            <p className="text-[8px] font-semibold text-silver-mist">{d.percent}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── 4. Leave Utilization Chart ───────────────────────────────────────────────────

const LeaveChart: React.FC = () => {
  const totalAllocated = LEAVE_DATA.filter((d) => d.allocated > 0).reduce(
    (s, d) => s + d.allocated,
    0
  );
  const totalUsed = LEAVE_DATA.reduce((s, d) => s + d.used, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Palmtree className="w-4 h-4 text-neural-mint" />
            Leave Utilization
          </p>
          <p className="text-[10px] text-silver-mist mt-0.5">
            Team leave allocation vs usage by type
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-ink-black dark:text-pearl">
            {totalUsed} / {totalAllocated} days
          </p>
          <p className="text-[9px] text-silver-mist">
            {totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0}% overall
            utilization
          </p>
        </div>
      </div>

      {/* Horizontal Bars */}
      <div className="space-y-3">
        {LEAVE_DATA.map((d) => (
          <div key={d.type} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[11px] font-semibold text-ink-black dark:text-pearl">
                  {d.type}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-silver-mist">
                  {d.used} / {d.allocated > 0 ? d.allocated : '—'} days
                </span>
                {d.allocated > 0 && (
                  <span
                    className={`font-bold ${
                      d.utilizationPercent >= 80
                        ? 'text-coral-alert'
                        : d.utilizationPercent >= 50
                          ? 'text-sunset-amber'
                          : 'text-neural-mint'
                    }`}
                  >
                    {d.utilizationPercent}%
                  </span>
                )}
              </div>
            </div>
            {d.allocated > 0 && (
              <div className="h-2.5 rounded-full bg-pearl dark:bg-deep-cosmos/30 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${d.utilizationPercent}%`, backgroundColor: d.color }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Stacked Bar Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={LEAVE_DATA.filter((d) => d.allocated > 0)}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="type"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="used" name="Used" stackId="a" radius={[0, 0, 0, 0]}>
              {LEAVE_DATA.filter((d) => d.allocated > 0).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
            <Bar
              dataKey="remaining"
              name="Remaining"
              stackId="a"
              fill="#e2e8f0"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ── 5. Overtime Hours Chart ──────────────────────────────────────────────────────

const OvertimeChart: React.FC = () => {
  const totalOT = OVERTIME_DATA.reduce((s, d) => s + d.totalHours, 0);
  const avgMonthlyOT = Math.round(totalOT / OVERTIME_DATA.length);
  const peakMonth = OVERTIME_DATA.reduce(
    (max, d) => (d.totalHours > max.totalHours ? d : max),
    OVERTIME_DATA[0]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Clock className="w-4 h-4 text-nebula-purple" />
            Overtime Hours
          </p>
          <p className="text-[10px] text-silver-mist mt-0.5">Department-wise overtime breakdown</p>
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-3 h-1.5 rounded-full bg-celestial-indigo" />
            <span className="text-silver-mist">Engineering</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-1.5 rounded-full bg-sunset-amber" />
            <span className="text-silver-mist">Product</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-1.5 rounded-full bg-neural-mint" />
            <span className="text-silver-mist">Support</span>
          </div>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={OVERTIME_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="h" />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="engineering"
              name="Engineering"
              stackId="a"
              fill="#6366f1"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="product"
              name="Product"
              stackId="a"
              fill="#f59e0b"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="support"
              name="Support"
              stackId="a"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Avg per Employee Line */}
      <div className="h-32">
        <p className="text-[10px] font-semibold text-silver-mist mb-1">
          Average Overtime per Employee
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={OVERTIME_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} unit="h" />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="avgPerEmployee"
              name="Avg/Employee"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="px-3 py-2 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10 text-center">
          <p className="text-lg font-bold text-ink-black dark:text-pearl">{totalOT}h</p>
          <p className="text-[9px] text-silver-mist">Total (6 mo)</p>
        </div>
        <div className="px-3 py-2 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10 text-center">
          <p className="text-lg font-bold text-celestial-indigo">{avgMonthlyOT}h</p>
          <p className="text-[9px] text-silver-mist">Avg/Month</p>
        </div>
        <div className="px-3 py-2 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10 text-center">
          <p className="text-lg font-bold text-sunset-amber">{peakMonth.month}</p>
          <p className="text-[9px] text-silver-mist">Peak ({peakMonth.totalHours}h)</p>
        </div>
      </div>
    </div>
  );
};

export default TeamAnalyticsDashboard;
