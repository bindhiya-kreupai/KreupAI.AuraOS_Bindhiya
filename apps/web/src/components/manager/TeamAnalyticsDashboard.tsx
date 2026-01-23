"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Users,
  TrendingDown,
  Award,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface HeadcountData {
  month: string;
  count: number;
}

interface AttritionData {
  month: string;
  rate: number;
}

interface PerformanceDistribution {
  rating: string;
  count: number;
  percentage: number;
}

interface LeaveUtilization {
  type: string;
  used: number;
  total: number;
}

interface OvertimeData {
  employee: string;
  hours: number;
}

const mockHeadcount: HeadcountData[] = [
  { month: "Aug", count: 42 },
  { month: "Sep", count: 44 },
  { month: "Oct", count: 45 },
  { month: "Nov", count: 43 },
  { month: "Dec", count: 46 },
  { month: "Jan", count: 48 },
];

const mockAttrition: AttritionData[] = [
  { month: "Aug", rate: 3.2 },
  { month: "Sep", rate: 2.8 },
  { month: "Oct", rate: 4.1 },
  { month: "Nov", rate: 2.5 },
  { month: "Dec", rate: 3.0 },
  { month: "Jan", rate: 2.1 },
];

const mockPerformance: PerformanceDistribution[] = [
  { rating: "Exceptional", count: 5, percentage: 10 },
  { rating: "Exceeds", count: 15, percentage: 31 },
  { rating: "Meets", count: 22, percentage: 46 },
  { rating: "Developing", count: 5, percentage: 10 },
  { rating: "Below", count: 1, percentage: 3 },
];

const mockLeaveUtilization: LeaveUtilization[] = [
  { type: "Annual Leave", used: 320, total: 480 },
  { type: "Sick Leave", used: 45, total: 240 },
  { type: "Personal", used: 28, total: 96 },
  { type: "Parental", used: 60, total: 120 },
];

const mockOvertime: OvertimeData[] = [
  { employee: "Maria Rodriguez", hours: 24 },
  { employee: "Sarah Chen", hours: 18 },
  { employee: "David Kim", hours: 15 },
  { employee: "Priya Patel", hours: 12 },
  { employee: "Alex Thompson", hours: 8 },
];

export default function TeamAnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"month" | "quarter" | "year">("quarter");

  const maxHeadcount = Math.max(...mockHeadcount.map((d) => d.count));
  const maxAttrition = Math.max(...mockAttrition.map((d) => d.rate));
  const maxOvertime = Math.max(...mockOvertime.map((d) => d.hours));

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-celestial-indigo" />
          <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
            Team Analytics Dashboard
          </h2>
        </div>
        <div className="flex gap-1 p-1 bg-cloud/30 dark:bg-nebula-purple/10 rounded-lg">
          {(["month", "quarter", "year"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedPeriod === period
                  ? "bg-celestial-indigo text-white"
                  : "text-silver-mist hover:text-ink-black dark:hover:text-pearl"
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Headcount Trend */}
        <div className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-celestial-indigo" />
              <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
                Headcount Trend
              </h3>
            </div>
            <div className="flex items-center gap-1 text-aurora-green">
              <ArrowUp className="w-3 h-3" />
              <span className="text-xs font-medium">+4.3%</span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-32">
            {mockHeadcount.map((data) => (
              <div key={data.month} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs font-medium text-ink-black dark:text-pearl">
                  {data.count}
                </span>
                <div
                  className="w-full bg-celestial-indigo/80 rounded-t transition-all"
                  style={{ height: `${(data.count / maxHeadcount) * 100}%` }}
                />
                <span className="text-xs text-silver-mist">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Attrition Rate */}
        <div className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-coral-alert" />
              <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
                Attrition Rate
              </h3>
            </div>
            <div className="flex items-center gap-1 text-aurora-green">
              <ArrowDown className="w-3 h-3" />
              <span className="text-xs font-medium">-1.1%</span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-32">
            {mockAttrition.map((data) => (
              <div key={data.month} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs font-medium text-ink-black dark:text-pearl">
                  {data.rate}%
                </span>
                <div
                  className="w-full bg-coral-alert/70 rounded-t transition-all"
                  style={{ height: `${(data.rate / maxAttrition) * 100}%` }}
                />
                <span className="text-xs text-silver-mist">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Distribution */}
        <div className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-celestial-indigo" />
            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
              Performance Distribution
            </h3>
          </div>
          <div className="space-y-3">
            {mockPerformance.map((data) => {
              const barColor =
                data.rating === "Exceptional" || data.rating === "Exceeds"
                  ? "bg-aurora-green"
                  : data.rating === "Meets"
                  ? "bg-celestial-indigo"
                  : "bg-coral-alert";

              return (
                <div key={data.rating} className="flex items-center gap-3">
                  <span className="text-xs text-ink-black dark:text-pearl w-24 truncate">
                    {data.rating}
                  </span>
                  <div className="flex-1 h-3 bg-cloud dark:bg-nebula-purple/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-silver-mist w-16 text-right">
                    {data.count} ({data.percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave Utilization */}
        <div className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-celestial-indigo" />
            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
              Leave Utilization
            </h3>
          </div>
          <div className="space-y-3">
            {mockLeaveUtilization.map((data) => {
              const utilization = Math.round((data.used / data.total) * 100);
              return (
                <div key={data.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-ink-black dark:text-pearl">{data.type}</span>
                    <span className="text-xs text-silver-mist">
                      {data.used}/{data.total} days ({utilization}%)
                    </span>
                  </div>
                  <div className="h-2 bg-cloud dark:bg-nebula-purple/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        utilization >= 80
                          ? "bg-coral-alert"
                          : utilization >= 50
                          ? "bg-celestial-indigo"
                          : "bg-aurora-green"
                      }`}
                      style={{ width: `${utilization}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overtime Hours - Full Width */}
        <div className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-celestial-indigo" />
            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
              Overtime Hours (This Month)
            </h3>
          </div>
          <div className="space-y-3">
            {mockOvertime.map((data) => (
              <div key={data.employee} className="flex items-center gap-3">
                <span className="text-xs text-ink-black dark:text-pearl w-36 truncate">
                  {data.employee}
                </span>
                <div className="flex-1 h-4 bg-cloud dark:bg-nebula-purple/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full flex items-center justify-end pr-2 ${
                      data.hours >= 20
                        ? "bg-coral-alert"
                        : data.hours >= 12
                        ? "bg-celestial-indigo"
                        : "bg-aurora-green"
                    }`}
                    style={{ width: `${(data.hours / maxOvertime) * 100}%` }}
                  >
                    {data.hours >= 12 && (
                      <span className="text-[10px] font-medium text-white">
                        {data.hours}h
                      </span>
                    )}
                  </div>
                </div>
                {data.hours < 12 && (
                  <span className="text-xs font-medium text-ink-black dark:text-pearl w-8">
                    {data.hours}h
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
