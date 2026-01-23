"use client";

import React from 'react';
import { Users, Heart, TrendingUp, Award, BarChart3, Globe } from 'lucide-react';

interface DemographicData {
  category: string;
  groups: { label: string; percent: number; color: string }[];
}

const demographics: DemographicData[] = [
  {
    category: 'Gender',
    groups: [
      { label: 'Male', percent: 55, color: 'bg-blue-500' },
      { label: 'Female', percent: 40, color: 'bg-pink-500' },
      { label: 'Non-binary', percent: 5, color: 'bg-purple-500' },
    ],
  },
  {
    category: 'Ethnicity',
    groups: [
      { label: 'White', percent: 42, color: 'bg-blue-400' },
      { label: 'Asian', percent: 28, color: 'bg-emerald-500' },
      { label: 'Hispanic/Latino', percent: 15, color: 'bg-amber-500' },
      { label: 'Black', percent: 10, color: 'bg-purple-500' },
      { label: 'Other', percent: 5, color: 'bg-slate-400' },
    ],
  },
  {
    category: 'Age Distribution',
    groups: [
      { label: '18-25', percent: 12, color: 'bg-cyan-500' },
      { label: '26-35', percent: 38, color: 'bg-blue-500' },
      { label: '36-45', percent: 30, color: 'bg-indigo-500' },
      { label: '46-55', percent: 15, color: 'bg-purple-500' },
      { label: '55+', percent: 5, color: 'bg-pink-500' },
    ],
  },
];

const leadershipDiversity = [
  { level: 'C-Suite', diversity: 33 },
  { level: 'VP', diversity: 38 },
  { level: 'Director', diversity: 42 },
  { level: 'Manager', diversity: 48 },
  { level: 'IC', diversity: 52 },
];

const inclusionMetrics = [
  { metric: 'Belonging Score', score: 4.2, max: 5, change: +0.3 },
  { metric: 'Inclusion Index', score: 78, max: 100, change: +5 },
  { metric: 'Equity Perception', score: 3.8, max: 5, change: +0.2 },
  { metric: 'Psychological Safety', score: 4.0, max: 5, change: +0.1 },
];

export default function DEIDashboardPage() {
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">DEI Dashboard</h1>
        <p className="text-sm text-silver-mist mt-1">Diversity, Equity & Inclusion metrics and progress</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Diversity Score</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">72/100</p>
          <p className="text-[10px] text-emerald-600">+4 vs last year</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Gender Pay Gap</p>
          <p className="text-2xl font-bold text-sunset-amber mt-1">3.2%</p>
          <p className="text-[10px] text-emerald-600">-1.5% vs last year</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Diverse Hires (YTD)</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">58%</p>
          <p className="text-[10px] text-silver-mist">Target: 50%</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">ERG Participation</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">34%</p>
          <p className="text-[10px] text-silver-mist">6 active groups</p>
        </div>
      </div>

      {/* Demographics */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4">Workforce Demographics</h3>
        <div className="space-y-6">
          {demographics.map((demo) => (
            <div key={demo.category}>
              <p className="text-xs font-medium text-ink-black dark:text-pearl mb-2">{demo.category}</p>
              <div className="w-full h-6 rounded-full overflow-hidden flex">
                {demo.groups.map((group) => (
                  <div
                    key={group.label}
                    className={`h-full ${group.color} first:rounded-l-full last:rounded-r-full`}
                    style={{ width: `${group.percent}%` }}
                    title={`${group.label}: ${group.percent}%`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                {demo.groups.map((group) => (
                  <span key={group.label} className="flex items-center gap-1.5 text-[10px] text-silver-mist">
                    <span className={`w-2 h-2 rounded-full ${group.color}`} />
                    {group.label} ({group.percent}%)
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leadership Diversity */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4">Leadership Diversity (% Underrepresented)</h3>
        <div className="space-y-3">
          {leadershipDiversity.map((level) => (
            <div key={level.level} className="flex items-center gap-3">
              <span className="text-xs text-ink-black dark:text-pearl w-20">{level.level}</span>
              <div className="flex-1 h-3 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${level.diversity >= 45 ? 'bg-emerald-500' : level.diversity >= 35 ? 'bg-celestial-indigo' : 'bg-sunset-amber'}`}
                  style={{ width: `${level.diversity}%` }}
                />
              </div>
              <span className="text-xs font-medium text-ink-black dark:text-pearl w-10 text-right">{level.diversity}%</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-silver-mist mt-3">Target: 45% at all levels by 2026</p>
      </div>

      {/* Inclusion Metrics */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4">Inclusion Survey Results</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {inclusionMetrics.map((item) => (
            <div key={item.metric} className="text-center p-4 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
              <p className="text-xs text-silver-mist mb-1">{item.metric}</p>
              <p className="text-2xl font-bold text-ink-black dark:text-pearl">
                {item.score}<span className="text-sm text-silver-mist font-normal">/{item.max}</span>
              </p>
              <p className="text-[10px] text-emerald-600 mt-1">+{item.change} vs prior</p>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
        <Globe className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Data Privacy Notice</p>
          <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">
            All demographic data is self-reported and aggregated. Individual responses are confidential. Data is shown only where groups have 5+ members to protect anonymity.
          </p>
        </div>
      </div>
    </div>
  );
}
