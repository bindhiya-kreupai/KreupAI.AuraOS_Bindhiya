/**
 * @module ReferralTracking
 * @description Track referral status with pipeline stages, timeline events,
 *              candidate progress indicators, and filtering
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  Briefcase,
  ArrowRight,
  Star,
  Mail,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

export type ReferralStage =
  | 'submitted'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export interface ReferralTimelineEvent {
  stage: string;
  status: 'completed' | 'current' | 'pending' | 'skipped';
  date?: string;
  note?: string;
}

export interface TrackedReferral {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  department: string;
  stage: ReferralStage;
  progress: number; // 0-100
  bonus: number;
  currency: string;
  bonusStatus: 'pending' | 'eligible' | 'paid' | 'not_applicable';
  referredDate: string;
  lastUpdate: string;
  timeline: ReferralTimelineEvent[];
}

interface ReferralTrackingProps {
  referrals: TrackedReferral[];
}

// ── Config ───────────────────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<
  ReferralStage,
  { label: string; icon: LucideIcon; color: string; bg: string }
> = {
  submitted: {
    label: 'Submitted',
    icon: Clock,
    color: 'text-silver-mist',
    bg: 'bg-silver-mist/10',
  },
  screening: {
    label: 'Screening',
    icon: Clock,
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
  },
  interview: {
    label: 'Interview',
    icon: Users,
    color: 'text-sunset-amber',
    bg: 'bg-sunset-amber/10',
  },
  offer: { label: 'Offer', icon: Star, color: 'text-quantum-rose', bg: 'bg-quantum-rose/10' },
  hired: { label: 'Hired', icon: CheckCircle2, color: 'text-neural-mint', bg: 'bg-neural-mint/10' },
  rejected: {
    label: 'Not Selected',
    icon: XCircle,
    color: 'text-coral-alert',
    bg: 'bg-coral-alert/10',
  },
  withdrawn: {
    label: 'Withdrawn',
    icon: XCircle,
    color: 'text-silver-mist',
    bg: 'bg-silver-mist/10',
  },
};

const BONUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'text-silver-mist' },
  eligible: { label: 'Eligible', color: 'text-sunset-amber' },
  paid: { label: 'Paid', color: 'text-neural-mint' },
  not_applicable: { label: '—', color: 'text-silver-mist/40' },
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ── Mock Data ────────────────────────────────────────────────────────────────────

export const MOCK_TRACKED_REFERRALS: TrackedReferral[] = [
  {
    id: 'tr-1',
    candidateName: 'John Doe',
    candidateEmail: 'john.doe@email.com',
    jobTitle: 'Senior React Developer',
    department: 'Engineering',
    stage: 'interview',
    progress: 60,
    bonus: 2000,
    currency: 'USD',
    bonusStatus: 'pending',
    referredDate: '2026-01-15',
    lastUpdate: '2026-02-20',
    timeline: [
      { stage: 'Submitted', status: 'completed', date: 'Jan 15' },
      { stage: 'Screening', status: 'completed', date: 'Jan 20' },
      { stage: 'Interview', status: 'current', date: 'In Progress' },
      { stage: 'Offer', status: 'pending' },
      { stage: 'Hired', status: 'pending' },
    ],
  },
  {
    id: 'tr-2',
    candidateName: 'Jane Smith',
    candidateEmail: 'jane.smith@email.com',
    jobTitle: 'UX Designer',
    department: 'Design',
    stage: 'screening',
    progress: 25,
    bonus: 1500,
    currency: 'USD',
    bonusStatus: 'pending',
    referredDate: '2026-02-10',
    lastUpdate: '2026-02-18',
    timeline: [
      { stage: 'Submitted', status: 'completed', date: 'Feb 10' },
      { stage: 'Screening', status: 'current', date: 'In Progress' },
      { stage: 'Interview', status: 'pending' },
      { stage: 'Offer', status: 'pending' },
      { stage: 'Hired', status: 'pending' },
    ],
  },
  {
    id: 'tr-3',
    candidateName: 'Robert Wilson',
    candidateEmail: 'robert.wilson@email.com',
    jobTitle: 'Marketing Lead',
    department: 'Marketing',
    stage: 'hired',
    progress: 100,
    bonus: 1800,
    currency: 'USD',
    bonusStatus: 'paid',
    referredDate: '2025-11-05',
    lastUpdate: '2026-01-10',
    timeline: [
      { stage: 'Submitted', status: 'completed', date: 'Nov 5' },
      { stage: 'Screening', status: 'completed', date: 'Nov 10' },
      { stage: 'Interview', status: 'completed', date: 'Nov 20' },
      { stage: 'Offer', status: 'completed', date: 'Dec 1' },
      { stage: 'Hired', status: 'completed', date: 'Jan 10' },
    ],
  },
  {
    id: 'tr-4',
    candidateName: 'Emily Chen',
    candidateEmail: 'emily.chen@email.com',
    jobTitle: 'Data Scientist',
    department: 'Analytics',
    stage: 'offer',
    progress: 80,
    bonus: 2200,
    currency: 'USD',
    bonusStatus: 'eligible',
    referredDate: '2026-01-20',
    lastUpdate: '2026-02-22',
    timeline: [
      { stage: 'Submitted', status: 'completed', date: 'Jan 20' },
      { stage: 'Screening', status: 'completed', date: 'Jan 25' },
      { stage: 'Interview', status: 'completed', date: 'Feb 8' },
      { stage: 'Offer', status: 'current', date: 'Feb 22' },
      { stage: 'Hired', status: 'pending' },
    ],
  },
  {
    id: 'tr-5',
    candidateName: 'Alex Kim',
    candidateEmail: 'alex.kim@email.com',
    jobTitle: 'Product Manager — AI',
    department: 'Product',
    stage: 'rejected',
    progress: 50,
    bonus: 2500,
    currency: 'USD',
    bonusStatus: 'not_applicable',
    referredDate: '2026-01-08',
    lastUpdate: '2026-02-05',
    timeline: [
      { stage: 'Submitted', status: 'completed', date: 'Jan 8' },
      { stage: 'Screening', status: 'completed', date: 'Jan 12' },
      { stage: 'Interview', status: 'completed', date: 'Jan 25', note: 'Did not advance' },
      { stage: 'Offer', status: 'skipped' },
      { stage: 'Hired', status: 'skipped' },
    ],
  },
];

// ── Component ────────────────────────────────────────────────────────────────────

export const ReferralTracking: React.FC<ReferralTrackingProps> = ({
  referrals = MOCK_TRACKED_REFERRALS,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<ReferralStage | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = referrals;
    if (stageFilter !== 'all') {
      result = result.filter((r) => r.stage === stageFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) => r.candidateName.toLowerCase().includes(q) || r.jobTitle.toLowerCase().includes(q)
      );
    }
    return result;
  }, [referrals, stageFilter, searchQuery]);

  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    referrals.forEach((r) => {
      counts[r.stage] = (counts[r.stage] || 0) + 1;
    });
    return counts;
  }, [referrals]);

  return (
    <div className="space-y-4">
      {/* Pipeline Summary */}
      <div className="flex items-center gap-1 p-2 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-x-auto">
        {(['submitted', 'screening', 'interview', 'offer', 'hired'] as ReferralStage[]).map(
          (stage, idx, arr) => {
            const cfg = STAGE_CONFIG[stage];
            const count = pipelineCounts[stage] || 0;
            return (
              <React.Fragment key={stage}>
                <button
                  onClick={() => setStageFilter(stageFilter === stage ? 'all' : stage)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-bold transition-colors shrink-0 ${
                    stageFilter === stage
                      ? `${cfg.bg} ${cfg.color}`
                      : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                  }`}
                >
                  <cfg.icon className="w-3 h-3" />
                  {cfg.label}
                  <span
                    className={`px-1 py-0.5 rounded text-[8px] ${stageFilter === stage ? cfg.bg : 'bg-pearl dark:bg-deep-cosmos/30'}`}
                  >
                    {count}
                  </span>
                </button>
                {idx < arr.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-silver-mist/30 shrink-0" />
                )}
              </React.Fragment>
            );
          }
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-3 h-3 text-silver-mist absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search referrals..."
          className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
        />
      </div>

      {/* Referral List */}
      <div className="space-y-2">
        {filtered.map((ref) => {
          const stageCfg = STAGE_CONFIG[ref.stage];
          const StageIcon = stageCfg.icon;
          const bonusCfg = BONUS_CONFIG[ref.bonusStatus] || BONUS_CONFIG.pending;
          const isExpanded = expandedId === ref.id;

          return (
            <div
              key={ref.id}
              className={`rounded-xl border transition-all ${
                ref.stage === 'hired'
                  ? 'border-neural-mint/20 bg-neural-mint/5'
                  : ref.stage === 'rejected'
                    ? 'border-cloud/50 dark:border-nebula-purple/10 opacity-70'
                    : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue'
              }`}
            >
              {/* Main Row */}
              <div className="flex items-center gap-3 p-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[9px] font-bold text-celestial-indigo shrink-0">
                  {ref.candidateName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[10px] font-bold text-ink-black dark:text-pearl truncate">
                      {ref.candidateName}
                    </p>
                    <span
                      className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold ${stageCfg.bg} ${stageCfg.color}`}
                    >
                      <StageIcon className="w-2.5 h-2.5" />
                      {stageCfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[8px] text-silver-mist">
                    <span className="flex items-center gap-0.5">
                      <Briefcase className="w-2.5 h-2.5" /> {ref.jobTitle}
                    </span>
                    <span>·</span>
                    <span>{ref.department}</span>
                    <span>·</span>
                    <span>Referred {formatDate(ref.referredDate)}</span>
                  </div>
                </div>

                {/* Bonus */}
                <div className="text-right shrink-0">
                  <p className={`text-[10px] font-bold ${bonusCfg.color}`}>
                    {ref.bonusStatus === 'not_applicable' ? '—' : `$${ref.bonus.toLocaleString()}`}
                  </p>
                  <p className="text-[7px] text-silver-mist">{bonusCfg.label}</p>
                </div>

                {/* Progress */}
                <div className="w-14 shrink-0">
                  <div className="h-1.5 rounded-full bg-pearl dark:bg-deep-cosmos/30 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        ref.stage === 'hired'
                          ? 'bg-neural-mint'
                          : ref.stage === 'rejected' || ref.stage === 'withdrawn'
                            ? 'bg-coral-alert'
                            : 'bg-celestial-indigo'
                      }`}
                      style={{ width: `${ref.progress}%` }}
                    />
                  </div>
                </div>

                {/* Expand */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : ref.id)}
                  className="p-1 text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors shrink-0"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </div>

              {/* Expanded: Timeline */}
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-cloud/50 dark:border-nebula-purple/10 pt-2 ml-11">
                  <div className="flex items-center justify-between relative">
                    {/* Connector line */}
                    <div className="absolute top-[7px] left-0 right-0 h-0.5 bg-cloud dark:bg-nebula-purple/20" />

                    {ref.timeline.map((evt, idx) => {
                      const isCompleted = evt.status === 'completed';
                      const isCurrent = evt.status === 'current';
                      const isSkipped = evt.status === 'skipped';

                      return (
                        <div key={idx} className="flex flex-col items-center relative z-10 gap-1">
                          <div
                            className={`w-3.5 h-3.5 rounded-full border-2 ${
                              isCompleted
                                ? 'bg-neural-mint border-neural-mint'
                                : isCurrent
                                  ? 'bg-white dark:bg-stellar-blue border-celestial-indigo ring-2 ring-celestial-indigo/20'
                                  : isSkipped
                                    ? 'bg-coral-alert/20 border-coral-alert/30'
                                    : 'bg-white dark:bg-stellar-blue border-cloud dark:border-nebula-purple/30'
                            }`}
                          >
                            {isCompleted && <CheckCircle2 className="w-2 h-2 text-white m-auto" />}
                          </div>
                          <span
                            className={`text-[8px] font-bold ${
                              isCompleted
                                ? 'text-ink-black dark:text-pearl'
                                : isCurrent
                                  ? 'text-celestial-indigo'
                                  : isSkipped
                                    ? 'text-coral-alert/50 line-through'
                                    : 'text-silver-mist'
                            }`}
                          >
                            {evt.stage}
                          </span>
                          <span className="text-[7px] text-silver-mist">{evt.date || '—'}</span>
                          {evt.note && (
                            <span className="text-[7px] text-coral-alert">{evt.note}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-3 mt-3 text-[8px] text-silver-mist">
                    <span className="flex items-center gap-0.5">
                      <Mail className="w-2.5 h-2.5" /> {ref.candidateEmail}
                    </span>
                    <span>·</span>
                    <span>Last updated: {formatDate(ref.lastUpdate)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-6">
            <Users className="w-5 h-5 text-silver-mist/20 mx-auto mb-2" />
            <p className="text-[10px] text-silver-mist">No referrals match your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralTracking;
