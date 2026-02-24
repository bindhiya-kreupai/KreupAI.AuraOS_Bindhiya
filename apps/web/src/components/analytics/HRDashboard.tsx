"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  UserMinus,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Building2,
} from "lucide-react";

interface MetricCard {
  id: string;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  color: string;
}

interface DepartmentMetric {
  name: string;
  headcount: number;
  openPositions: number;
  attrition: number;
  avgCompensation: number;
}

interface MonthlyTrend {
  month: string;
  hires: number;
  departures: number;
}

const mockMetrics: MetricCard[] = [
  {
    id: "headcount",
    label: "Total Headcount",
    value: "1,247",
    change: 3.2,
    changeLabel: "vs last quarter",
    icon: <Users className="w-5 h-5" />,
    color: "text-celestial-indigo",
  },
  {
    id: "hiring",
    label: "Open Positions",
    value: "42",
    change: -5.1,
    changeLabel: "vs last month",
    icon: <UserPlus className="w-5 h-5" />,
    color: "text-aurora-green",
  },
  {
    id: "attrition",
    label: "Attrition Rate",
    value: "4.8%",
    change: -0.6,
    changeLabel: "vs last quarter",
    icon: <UserMinus className="w-5 h-5" />,
    color: "text-coral-alert",
  },
  {
    id: "compensation",
    label: "Avg Compensation",
    value: "$87,500",
    change: 4.2,
    changeLabel: "vs last year",
    icon: <DollarSign className="w-5 h-5" />,
    color: "text-sunset-amber",
  },
  {
    id: "leave",
    label: "Leave Utilization",
    value: "68%",
    change: 2.1,
    changeLabel: "vs last month",
    icon: <Calendar className="w-5 h-5" />,
    color: "text-purple-500",
  },
];

const mockDepartments: DepartmentMetric[] = [
  { name: "Engineering", headcount: 420, openPositions: 18, attrition: 3.2, avgCompensation: 112000 },
  { name: "Sales", headcount: 280, openPositions: 8, attrition: 6.1, avgCompensation: 95000 },
  { name: "Customer Support", headcount: 185, openPositions: 5, attrition: 8.4, avgCompensation: 52000 },
  { name: "Marketing", headcount: 120, openPositions: 4, attrition: 3.8, avgCompensation: 85000 },
  { name: "HR & Admin", headcount: 95, openPositions: 3, attrition: 2.1, avgCompensation: 72000 },
  { name: "Operations", headcount: 147, openPositions: 4, attrition: 5.2, avgCompensation: 68000 },
];

const mockMonthlyTrends: MonthlyTrend[] = [
  { month: "Aug", hires: 28, departures: 12 },
  { month: "Sep", hires: 32, departures: 15 },
  { month: "Oct", hires: 25, departures: 18 },
  { month: "Nov", hires: 35, departures: 10 },
  { month: "Dec", hires: 18, departures: 14 },
  { month: "Jan", hires: 42, departures: 8 },
];

export default function HRDashboard() {
  const [metrics] = useState<MetricCard[]>(mockMetrics);
  const [departments] = useState<DepartmentMetric[]>(mockDepartments);
  const [trends] = useState<MonthlyTrend[]>(mockMonthlyTrends);

  const maxHeadcount = Math.max(...departments.map((d) => d.headcount));
  const maxTrendValue = Math.max(...trends.map((t) => Math.max(t.hires, t.departures)));

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-celestial-indigo/10 rounded-lg">
            <BarChart3 className="w-5 h-5 text-celestial-indigo" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
              HR Executive Dashboard
            </h2>
            <p className="text-sm text-silver-mist">
              Organization-wide people analytics overview
            </p>
          </div>
        </div>
        <select className="px-3 py-1.5 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl">
          <option>Last 30 Days</option>
          <option>Last Quarter</option>
          <option>Year to Date</option>
        </select>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={metric.color}>{metric.icon}</div>
            </div>
            <p className="text-2xl font-bold text-ink-black dark:text-pearl">
              {metric.value}
            </p>
            <p className="text-xs text-silver-mist mt-0.5">{metric.label}</p>
            <div className="flex items-center gap-1 mt-2">
              {metric.change > 0 ? (
                <TrendingUp className="w-3 h-3 text-aurora-green" />
              ) : (
                <TrendingDown className="w-3 h-3 text-coral-alert" />
              )}
              <span className={`text-xs ${metric.change > 0 ? "text-aurora-green" : "text-coral-alert"}`}>
                {Math.abs(metric.change)}%
              </span>
              <span className="text-xs text-silver-mist">{metric.changeLabel}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring/Departure Trend Bar Chart */}
        <div className="border border-cloud dark:border-nebula-purple/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
              Hiring vs Departures
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-aurora-green" />
                <span className="text-silver-mist">Hires</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-coral-alert" />
                <span className="text-silver-mist">Departures</span>
              </div>
            </div>
          </div>
          <div className="flex items-end gap-3 h-40">
            {trends.map((trend) => (
              <div key={trend.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex gap-0.5 items-end w-full justify-center h-32">
                  <div
                    className="w-3 bg-aurora-green/80 rounded-t"
                    style={{ height: `${(trend.hires / maxTrendValue) * 100}%` }}
                  />
                  <div
                    className="w-3 bg-coral-alert/80 rounded-t"
                    style={{ height: `${(trend.departures / maxTrendValue) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-silver-mist">{trend.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="border border-cloud dark:border-nebula-purple/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
              <Building2 className="w-4 h-4 text-celestial-indigo" />
              Department Headcount
            </h3>
          </div>
          <div className="space-y-3">
            {departments.map((dept) => (
              <div key={dept.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-black dark:text-pearl font-medium">
                    {dept.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-silver-mist">
                      {dept.openPositions} open
                    </span>
                    <span className="font-medium text-ink-black dark:text-pearl">
                      {dept.headcount}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-nebula-purple/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-celestial-indigo/70 rounded-full"
                    style={{ width: `${(dept.headcount / maxHeadcount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
