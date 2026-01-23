"use client";

import React from 'react';
import { Heart, Activity, Footprints, Moon, Droplets, Apple, Trophy, TrendingUp } from 'lucide-react';

interface WellnessMetric {
  label: string;
  value: string;
  target: string;
  progress: number;
  icon: React.ReactNode;
  color: string;
}

const metrics: WellnessMetric[] = [
  { label: 'Steps Today', value: '7,245', target: '10,000', progress: 72, icon: <Footprints className="w-5 h-5" />, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  { label: 'Sleep Last Night', value: '7.2 hrs', target: '8 hrs', progress: 90, icon: <Moon className="w-5 h-5" />, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  { label: 'Water Intake', value: '6 glasses', target: '8 glasses', progress: 75, icon: <Droplets className="w-5 h-5" />, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' },
  { label: 'Active Minutes', value: '35 min', target: '60 min', progress: 58, icon: <Activity className="w-5 h-5" />, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
];

interface Challenge {
  id: string;
  name: string;
  description: string;
  participants: number;
  daysLeft: number;
  yourProgress: number;
}

const challenges: Challenge[] = [
  { id: '1', name: '10K Steps Challenge', description: 'Walk 10,000 steps daily for 30 days', participants: 128, daysLeft: 12, yourProgress: 60 },
  { id: '2', name: 'Mindfulness Month', description: 'Meditate at least 10 minutes daily', participants: 85, daysLeft: 18, yourProgress: 40 },
  { id: '3', name: 'Hydration Hero', description: 'Drink 8 glasses of water daily for 2 weeks', participants: 200, daysLeft: 5, yourProgress: 78 },
];

const weeklyData = [
  { day: 'Mon', steps: 8500, active: 45 },
  { day: 'Tue', steps: 10200, active: 60 },
  { day: 'Wed', steps: 6800, active: 30 },
  { day: 'Thu', steps: 9100, active: 55 },
  { day: 'Fri', steps: 7245, active: 35 },
  { day: 'Sat', steps: 0, active: 0 },
  { day: 'Sun', steps: 0, active: 0 },
];

export default function WellnessTrackerPage() {
  const wellnessScore = 72;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Wellness Tracker</h1>
          <p className="text-sm text-silver-mist mt-1">Track your health goals and join wellness challenges</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
          <Heart className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-bold text-emerald-600">Wellness Score: {wellnessScore}/100</span>
        </div>
      </div>

      {/* Daily Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-2 rounded-lg ${metric.color}`}>
                {metric.icon}
              </div>
              <p className="text-xs text-silver-mist font-medium">{metric.label}</p>
            </div>
            <p className="text-2xl font-bold text-ink-black dark:text-pearl">{metric.value}</p>
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] text-silver-mist mb-1">
                <span>Progress</span>
                <span>{metric.target} goal</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${metric.progress >= 80 ? 'bg-emerald-500' : metric.progress >= 50 ? 'bg-celestial-indigo' : 'bg-sunset-amber'}`} style={{ width: `${metric.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Activity */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4">This Week&apos;s Activity</h3>
        <div className="flex items-end gap-2 h-32">
          {weeklyData.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center justify-end h-24">
                <div
                  className={`w-full rounded-t ${day.steps > 0 ? 'bg-celestial-indigo/80' : 'bg-slate-100 dark:bg-deep-cosmos'}`}
                  style={{ height: `${day.steps > 0 ? Math.max((day.steps / 12000) * 100, 10) : 10}%` }}
                />
              </div>
              <span className="text-[10px] text-silver-mist">{day.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Challenges */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50 flex items-center justify-between">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Active Challenges</h3>
          <button className="text-xs text-celestial-indigo font-medium hover:underline">Browse All</button>
        </div>
        <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-sunset-amber" />
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">{challenge.name}</p>
                </div>
                <span className="text-[10px] text-silver-mist">{challenge.daysLeft} days left</span>
              </div>
              <p className="text-xs text-silver-mist mb-2">{challenge.description}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
                  <div className="h-full bg-sunset-amber rounded-full" style={{ width: `${challenge.yourProgress}%` }} />
                </div>
                <span className="text-xs font-medium text-sunset-amber">{challenge.yourProgress}%</span>
                <span className="text-[10px] text-silver-mist">{challenge.participants} participants</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wellness Rewards */}
      <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/10 dark:to-cyan-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 flex items-start gap-3">
        <Apple className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Wellness Rewards</p>
          <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
            Earn up to $500/year in wellness incentives. Complete challenges and maintain your wellness score above 80 to qualify for premium discounts.
          </p>
        </div>
      </div>
    </div>
  );
}
