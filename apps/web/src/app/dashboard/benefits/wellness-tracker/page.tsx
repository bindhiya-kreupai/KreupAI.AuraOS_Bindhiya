'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart,
  Activity,
  Footprints,
  Moon,
  Droplets,
  Apple,
  Trophy,
  Loader2,
  Watch,
  X,
  Building2,
} from 'lucide-react';
import { BenefitPlanService } from '../services';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

interface WellnessMetric {
  label: string;
  target: string;
  icon: React.ReactNode;
  color: string;
}

interface WellnessProgram {
  id: string;
  name: string;
  description: string;
  provider: string;
}

// Metrics we would surface once a wearable/activity-tracking integration is connected.
// No values are shown until such a source exists — see the "connect a device" CTA state.
const TRACKABLE_METRICS: WellnessMetric[] = [
  {
    label: 'Steps',
    target: '10,000 / day',
    icon: <Footprints className="w-5 h-5" />,
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  },
  {
    label: 'Sleep',
    target: '8 hrs / night',
    icon: <Moon className="w-5 h-5" />,
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  },
  {
    label: 'Water Intake',
    target: '8 glasses / day',
    icon: <Droplets className="w-5 h-5" />,
    color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
  },
  {
    label: 'Active Minutes',
    target: '60 min / day',
    icon: <Activity className="w-5 h-5" />,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  },
];

export default function WellnessTrackerPage() {
  const [programs, setPrograms] = useState<WellnessProgram[]>([]);
  const [hasWellness, setHasWellness] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPrograms, setShowPrograms] = useState(false);
  const toast = useToast();

  const fetchWellnessData = useCallback(async () => {
    try {
      setLoading(true);
      // Only real, known signal: whether WELLNESS benefit plans exist for this tenant.
      const response = await BenefitPlanService.getPlans({ category: 'WELLNESS' });
      const rawPlans = (response as { data?: unknown })?.data ?? response ?? [];
      const plans = Array.isArray(rawPlans) ? rawPlans : [];

      const mapped: WellnessProgram[] = plans.map((plan: Record<string, unknown>) => ({
        id: String(plan.id ?? plan.planCode ?? plan.name ?? ''),
        name: String(plan.name ?? 'Wellness Program'),
        description: String(plan.description ?? ''),
        provider: String(plan.carrierName ?? plan.provider ?? ''),
      }));

      setPrograms(mapped);
      setHasWellness(mapped.length > 0);
    } catch (error) {
      console.error('Error fetching wellness data:', error);
      setPrograms([]);
      setHasWellness(false);
      toast.error('Unable to load wellness programs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchWellnessData();
    // fetchWellnessData is stable via useCallback; run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-celestial-indigo animate-spin" />
      </div>
    );
  }

  if (!hasWellness) {
    return (
      <>
        <div className="space-y-4 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Wellness Tracker</h1>
            <p className="text-sm text-silver-mist mt-1">
              Track your health goals and join wellness challenges
            </p>
          </div>
          <div className="flex flex-col items-center justify-center h-[40vh] text-center">
            <Heart className="w-12 h-12 text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-ink-black dark:text-pearl mb-2">
              Wellness Program Not Available
            </h2>
            <p className="text-silver-mist max-w-md">
              No wellness benefit plans are currently active. Contact HR to learn about available
              wellness programs.
            </p>
          </div>
        </div>
        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4 pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Wellness Tracker</h1>
            <p className="text-sm text-silver-mist mt-1">
              Track your health goals and join wellness challenges
            </p>
          </div>
          {/* Honest status: derived from the real number of active wellness plans — no fabricated score. */}
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <Heart className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-bold text-emerald-600">
              {programs.length} wellness {programs.length === 1 ? 'program' : 'programs'} active
            </span>
          </div>
        </div>

        {/* Activity tracking — no wearable/activity backend exists, so we show an honest connect-a-device CTA
            rather than presenting fabricated zeros as tracked data. */}
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50 flex items-center gap-2">
            <Watch className="w-4 h-4 text-celestial-indigo" />
            <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Activity Tracking</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TRACKABLE_METRICS.map((metric) => (
              <div
                key={metric.label}
                className="bg-slate-50 dark:bg-deep-cosmos p-4 rounded-xl border border-dashed border-cloud dark:border-nebula-purple/50"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded-lg ${metric.color}`}>{metric.icon}</div>
                  <p className="text-xs text-silver-mist font-medium">{metric.label}</p>
                </div>
                <p className="text-sm font-semibold text-silver-mist">Not tracked</p>
                <p className="text-[10px] text-silver-mist mt-1">Goal: {metric.target}</p>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-cloud dark:border-nebula-purple/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs text-silver-mist">
              Connect a wearable or fitness app to start tracking your daily activity.
            </p>
            <button
              type="button"
              onClick={() =>
                toast.info(
                  'Wearable device integration is coming soon. Ask HR about supported fitness apps.'
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-celestial-indigo rounded-lg hover:bg-celestial-indigo/90 transition-colors self-start sm:self-auto"
            >
              <Watch className="w-3.5 h-3.5" />
              Connect a device
            </button>
          </div>
        </div>

        {/* Challenges — no challenge-tracking backend exists. "Browse All" opens the real wellness programs. */}
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-8 text-center">
          <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-1">
            No Active Challenges
          </h3>
          <p className="text-xs text-silver-mist mb-4">
            You are not enrolled in any wellness challenges yet. Browse your available wellness
            programs to get started.
          </p>
          <button
            type="button"
            onClick={() => setShowPrograms(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-celestial-indigo bg-celestial-indigo/10 rounded-lg hover:bg-celestial-indigo/20 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5" />
            Browse All Programs
          </button>
        </div>

        {/* Wellness Rewards */}
        <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/10 dark:to-cyan-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 flex items-start gap-3">
          <Apple className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Wellness Rewards
            </p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
              Your employer offers wellness incentives through the programs above. Contact HR to
              learn how participation qualifies you for premium discounts and rewards.
            </p>
          </div>
        </div>
      </div>

      {/* Browse All — real wellness benefit plans */}
      {showPrograms && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowPrograms(false)}
        >
          <div
            className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-cloud dark:border-nebula-purple/50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-ink-black dark:text-pearl">
                  Wellness Programs
                </h3>
                <p className="text-xs text-silver-mist mt-0.5">
                  Active wellness benefit plans available to you
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPrograms(false)}
                className="p-1 text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto divide-y divide-cloud dark:divide-nebula-purple/50">
              {programs.map((program) => (
                <div key={program.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex-shrink-0">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-black dark:text-pearl">
                        {program.name}
                      </p>
                      {program.provider && (
                        <p className="text-[11px] text-silver-mist flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" />
                          {program.provider}
                        </p>
                      )}
                      {program.description && (
                        <p className="text-xs text-silver-mist mt-1">{program.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-cloud dark:border-nebula-purple/50 text-center">
              <p className="text-[11px] text-silver-mist">
                Contact HR to enrol in a wellness program.
              </p>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </>
  );
}
