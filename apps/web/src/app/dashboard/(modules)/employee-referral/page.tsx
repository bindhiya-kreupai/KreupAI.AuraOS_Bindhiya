'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Users, Search, Gift, Send, Loader2 } from 'lucide-react';
import { ReferralPortal } from '@/components/recruitment/ReferralPortal';
import type { ReferralFormData, ReferralJob } from '@/components/recruitment/ReferralPortal';
import { ReferralTracking } from '@/components/recruitment/ReferralTracking';
import type { TrackedReferral, ReferralStage } from '@/components/recruitment/ReferralTracking';
import { ReferralRewards } from '@/components/recruitment/ReferralRewards';
import type { RewardsData } from '@/components/recruitment/ReferralRewards';
import { APIClient } from '@/lib/api-client';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

const TABS = [
  { key: 'refer' as const, label: 'Refer Someone', icon: Send },
  { key: 'tracking' as const, label: 'My Referrals', icon: Search },
  { key: 'rewards' as const, label: 'Rewards', icon: Gift },
] as const;

type TabKey = (typeof TABS)[number]['key'];

interface JobRecord {
  id: string;
  title?: string;
  department?: string;
  location?: string;
  type?: string;
  employmentType?: string;
  currency?: string;
  referralBonus?: number;
  openings?: number;
  openPositions?: number;
}

interface ReferralRecord {
  id?: string;
  candidateName?: string;
  candidateEmail?: string;
  jobTitle?: string;
  department?: string;
  status?: string;
  currentStage?: string;
  appliedDate?: string;
}

function toReferralJob(job: JobRecord): ReferralJob {
  return {
    id: job.id,
    title: job.title ?? 'Open Position',
    department: job.department ?? '—',
    location: job.location ?? 'Remote',
    type: job.type ?? job.employmentType ?? 'full_time',
    mode: job.location?.toLowerCase().includes('remote') ? 'remote' : 'onsite',
    bonus: job.referralBonus ?? 0,
    currency: job.currency ?? 'USD',
    urgency: 'medium',
    openings: job.openings ?? job.openPositions ?? 1,
  };
}

const STAGE_FROM_STATUS: Record<string, ReferralStage> = {
  APPLIED: 'submitted',
  SCREENING: 'screening',
  PHONE_INTERVIEW: 'interview',
  HIRING_MANAGER_INTERVIEW: 'interview',
  TECHNICAL_INTERVIEW: 'interview',
  OFFER: 'offer',
  HIRED: 'hired',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

const STAGE_PROGRESS: Record<ReferralStage, number> = {
  submitted: 15,
  screening: 35,
  interview: 60,
  offer: 85,
  hired: 100,
  rejected: 100,
  withdrawn: 100,
};

function toTrackedReferral(record: ReferralRecord): TrackedReferral {
  const stage =
    STAGE_FROM_STATUS[(record.currentStage ?? record.status ?? 'APPLIED').toUpperCase()] ??
    'submitted';
  const referredDate = record.appliedDate ?? new Date().toISOString();
  return {
    id: record.id ?? '',
    candidateName: record.candidateName ?? 'Candidate',
    candidateEmail: record.candidateEmail ?? '',
    jobTitle: record.jobTitle ?? 'Position',
    department: record.department ?? '—',
    stage,
    progress: STAGE_PROGRESS[stage],
    bonus: 0,
    currency: 'USD',
    bonusStatus: stage === 'hired' ? 'eligible' : 'pending',
    referredDate,
    lastUpdate: referredDate,
    timeline: [
      {
        stage: 'Submitted',
        status: 'completed',
        date: new Date(referredDate).toLocaleDateString(),
      },
    ],
  };
}

export default function EmployeeReferralPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<TabKey>('refer');
  const [jobs, setJobs] = useState<ReferralJob[]>([]);
  const [tracked, setTracked] = useState<TrackedReferral[]>([]);
  const [rewards, setRewards] = useState<RewardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const referralLink =
    typeof window !== 'undefined' && user?.employeeId
      ? `${window.location.origin}/careers?ref=${encodeURIComponent(user.employeeId)}`
      : '';

  const loadData = useCallback(async () => {
    if (!user?.employeeId) return;
    setLoading(true);
    try {
      const [jobsRes, referralsRes] = await Promise.all([
        APIClient.get<{ data?: JobRecord[] }>('/v1/recruitment/jobs', {
          status: 'OPEN',
          limit: 50,
        }),
        APIClient.get<{ data?: { referrals?: ReferralRecord[] } }>('/v1/recruitment/referrals', {
          referrerId: user.employeeId,
          limit: 50,
        }),
      ]);
      const jobList = jobsRes.data ?? [];
      setJobs(jobList.map(toReferralJob));

      const referralList = referralsRes.data?.referrals ?? [];
      const trackedList = referralList.map(toTrackedReferral);
      setTracked(trackedList);

      const successfulHires = trackedList.filter((r) => r.stage === 'hired').length;
      setRewards({
        totalEarned: 0,
        pendingAmount: 0,
        totalReferrals: trackedList.length,
        successfulHires,
        currentTier: 'bronze',
        currency: 'USD',
        payouts: [],
        leaderboard: [],
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to load referral data',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.employeeId]);

  useEffect(() => {
    if (!userLoading && user?.employeeId) {
      void loadData();
    }
  }, [userLoading, user?.employeeId, loadData]);

  const handleSubmitReferral = useCallback(
    async (data: ReferralFormData) => {
      setFeedback(null);
      try {
        await APIClient.post('/v1/recruitment/referrals', {
          candidateName: data.candidateName,
          candidateEmail: data.candidateEmail,
          candidatePhone: data.candidatePhone || undefined,
          candidateLinkedin: data.candidateLinkedin || undefined,
          jobId: data.jobId,
          relationship: data.relationship || undefined,
          howLongKnown: data.howLongKnown || undefined,
          recommendation: data.recommendation || undefined,
        });
        setFeedback({ type: 'success', text: 'Referral submitted successfully.' });
        setActiveTab('tracking');
        await loadData();
      } catch (err) {
        setFeedback({
          type: 'error',
          text: err instanceof Error ? err.message : 'Failed to submit referral',
        });
      }
    },
    [loadData]
  );

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-celestial-indigo" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-celestial-indigo" />
        <div>
          <p className="text-sm font-bold text-ink-black dark:text-pearl">
            Employee Referral Portal
          </p>
          <p className="text-[9px] text-silver-mist">
            Refer great talent, track progress, and earn rewards
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-lg border px-3 py-2 text-[11px] font-medium ${
            feedback.type === 'success'
              ? 'border-emerald-mint/40 bg-emerald-mint/10 text-emerald-mint'
              : 'border-coral-alert/40 bg-coral-alert/10 text-coral-alert'
          }`}
          role="status"
        >
          {feedback.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold transition-colors ${
              activeTab === tab.key
                ? 'text-celestial-indigo bg-celestial-indigo/5 border-b-2 border-celestial-indigo'
                : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-celestial-indigo" />
        </div>
      ) : (
        <>
          {activeTab === 'refer' && (
            <ReferralPortal
              jobs={jobs}
              onSubmitReferral={handleSubmitReferral}
              referralLink={referralLink}
            />
          )}

          {activeTab === 'tracking' && <ReferralTracking referrals={tracked} />}

          {activeTab === 'rewards' && rewards && <ReferralRewards data={rewards} />}
        </>
      )}
    </div>
  );
}
