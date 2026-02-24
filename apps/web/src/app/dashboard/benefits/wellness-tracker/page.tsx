"use client";

import React, { useState, useEffect } from 'react';
import { Heart, Activity, Footprints, Moon, Droplets, Apple, Trophy, Loader2 } from 'lucide-react';
import { BenefitPlanService } from '../services';

interface WellnessMetric {
  label: string;
  value: string;
  target: string;
  progress: number;
  icon: React.ReactNode;
  color: string;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  participants: number;
  daysLeft: number;
  yourProgress: number;
}

export default function WellnessTrackerPage() {
  const [metrics, setMetrics] = useState<WellnessMetric[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWellnessData();
  }, []);

  const fetchWellnessData = async () => {
    try {
      setLoading(true);
      // Load wellness-related plans to determine if wellness is available
      const response = await BenefitPlanService.getPlans({ category: 'WELLNESS' });
      const plans = response?.data || response || [];
      const hasWellness = Array.isArray(plans) && plans.length > 0;

      if (hasWellness) {
        setWellnessScore(72);
        setMetrics([
          { label: 'Steps Today', value: '0', target: '10,000', progress: 0, icon: <Footprints className="w-5 h-5" />, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Sleep Last Night', value: '-- hrs', target: '8 hrs', progress: 0, icon: <Moon className="w-5 h-5" />, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Water Intake', value: '0 glasses', target: '8 glasses', progress: 0, icon: <Droplets className="w-5 h-5" />, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' },
          { label: 'Active Minutes', value: '0 min', target: '60 min', progress: 0, icon: <Activity className="w-5 h-5" />, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
        ]);
        setChallenges([]);
      } else {
        setMetrics([]);
        setChallenges([]);
        setWellnessScore(0);
      }
    } catch (error) {
      console.error('Error fetching wellness data:', error);
      setMetrics([]);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-celestial-indigo animate-spin" />
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="space-y-4 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Wellness Tracker</h1>
          <p className="text-sm text-silver-mist mt-1">Track your health goals and join wellness challenges</p>
        </div>
        <div className="flex flex-col items-center justify-center h-[40vh] text-center">
          <Heart className="w-12 h-12 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-ink-black dark:text-pearl mb-2">Wellness Program Not Available</h2>
          <p className="text-silver-mist max-w-md">No wellness benefit plans are currently active. Contact HR to learn about available wellness programs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

      {/* Challenges */}
      {challenges.length > 0 && (
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
      )}

      {challenges.length === 0 && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-8 text-center">
          <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-1">No Active Challenges</h3>
          <p className="text-xs text-silver-mist">Check back later for new wellness challenges to participate in.</p>
        </div>
      )}

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

