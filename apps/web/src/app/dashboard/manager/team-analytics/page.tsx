"use client";

import React from 'react';
import {
  Users, TrendingDown, BarChart3, Clock, Calendar, Award
} from 'lucide-react';

const teamMetrics = [
  { label: 'Team Headcount', value: '12', change: '+1', trend: 'up' },
  { label: 'Attrition Rate', value: '8.3%', change: '-2.1%', trend: 'down' },
  { label: 'Avg Performance', value: '4.1/5', change: '+0.2', trend: 'up' },
  { label: 'Leave Utilization', value: '62%', change: '+5%', trend: 'up' },
];

const performanceDistribution = [
  { rating: 'Exceptional (5)', count: 2, percentage: 17 },
  { rating: 'Exceeds (4)', count: 5, percentage: 42 },
  { rating: 'Meets (3)', count: 4, percentage: 33 },
  { rating: 'Below (2)', count: 1, percentage: 8 },
  { rating: 'Needs Improvement (1)', count: 0, percentage: 0 },
];

const overtimeData = [
  { name: 'Raj Patel', hours: 12, week: 'This Week' },
  { name: 'David Wilson', hours: 8, week: 'This Week' },
  { name: 'Emily Davis', hours: 4, week: 'This Week' },
];

export default function TeamAnalyticsPage() {
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Team Analytics</h1>
        <p className="text-sm text-silver-mist mt-1">Key metrics and trends for your team</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {teamMetrics.map((metric) => (
          <div key={metric.label} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
            <p className="text-xs text-silver-mist uppercase font-medium">{metric.label}</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-2xl font-bold text-ink-black dark:text-pearl">{metric.value}</p>
              <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-emerald-500' : 'text-coral-alert'}`}>
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Distribution */}
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-celestial-indigo" /> Performance Distribution
          </h3>
          <div className="space-y-3">
            {performanceDistribution.map((item) => (
              <div key={item.rating} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-black dark:text-pearl">{item.rating}</span>
                  <span className="text-silver-mist">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
                  <div className="h-full bg-celestial-indigo rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overtime Hours */}
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sunset-amber" /> Overtime This Week
          </h3>
          {overtimeData.length > 0 ? (
            <div className="space-y-3">
              {overtimeData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
                  <span className="text-sm font-medium text-ink-black dark:text-pearl">{item.name}</span>
                  <span className="text-sm font-bold text-sunset-amber">{item.hours}h</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-silver-mist text-center py-6">No overtime logged this week</p>
          )}

          <div className="mt-4 pt-4 border-t border-cloud dark:border-nebula-purple/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-silver-mist">Total Team Overtime</span>
              <span className="text-sm font-bold text-ink-black dark:text-pearl">{overtimeData.reduce((sum, d) => sum + d.hours, 0)}h</span>
            </div>
          </div>
        </div>

        {/* Leave Utilization */}
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neural-mint" /> Leave Utilization
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
              <p className="text-xs text-silver-mist">Annual Leave Used</p>
              <p className="text-lg font-bold text-celestial-indigo mt-1">62%</p>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
              <p className="text-xs text-silver-mist">Sick Leave Used</p>
              <p className="text-lg font-bold text-sunset-amber mt-1">28%</p>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
              <p className="text-xs text-silver-mist">On Leave Today</p>
              <p className="text-lg font-bold text-quantum-rose mt-1">1</p>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
              <p className="text-xs text-silver-mist">Leave Next 7 Days</p>
              <p className="text-lg font-bold text-ink-black dark:text-pearl mt-1">2</p>
            </div>
          </div>
        </div>

        {/* Headcount Trend */}
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-celestial-indigo" /> Headcount Trend
          </h3>
          <div className="space-y-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
              const count = 10 + i + (i > 3 ? 1 : 0);
              return (
                <div key={month} className="flex items-center gap-3">
                  <span className="w-8 text-xs text-silver-mist">{month}</span>
                  <div className="flex-1 h-4 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
                    <div className="h-full bg-celestial-indigo/70 rounded-full" style={{ width: `${(count / 15) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium text-ink-black dark:text-pearl w-6">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
