/**
 * @module ReferralRewards
 * @description Referral rewards dashboard showing earnings wallet, payout
 *              history, tier progress, leaderboard, and bonus breakdown
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Gift,
  Trophy,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Award,
  Wallet,
  CreditCard,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

export interface RewardPayout {
  id: string;
  candidateName: string;
  jobTitle: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid';
  bonusType: 'referral' | 'milestone' | 'special';
  earnedDate: string;
  paidDate?: string;
  paymentMethod?: string;
}

export interface RewardTier {
  id: string;
  name: string;
  minReferrals: number;
  bonusMultiplier: number;
  perks: string[];
  color: string;
  icon: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  department: string;
  hires: number;
  totalEarned: number;
  isCurrentUser: boolean;
}

export interface RewardsData {
  totalEarned: number;
  pendingAmount: number;
  totalReferrals: number;
  successfulHires: number;
  currentTier: string;
  currency: string;
  payouts: RewardPayout[];
  leaderboard: LeaderboardEntry[];
}

interface ReferralRewardsProps {
  data: RewardsData;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const TIERS: RewardTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    minReferrals: 0,
    bonusMultiplier: 1.0,
    perks: ['Standard referral bonus'],
    color: 'text-sunset-amber',
    icon: '🥉',
  },
  {
    id: 'silver',
    name: 'Silver',
    minReferrals: 3,
    bonusMultiplier: 1.15,
    perks: ['15% bonus boost', 'Priority processing'],
    color: 'text-silver-mist',
    icon: '🥈',
  },
  {
    id: 'gold',
    name: 'Gold',
    minReferrals: 5,
    bonusMultiplier: 1.25,
    perks: ['25% bonus boost', 'Priority processing', 'Gift card bonus'],
    color: 'text-sunset-amber',
    icon: '🥇',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    minReferrals: 10,
    bonusMultiplier: 1.5,
    perks: ['50% bonus boost', 'VIP processing', 'Exclusive rewards', 'Recognition event'],
    color: 'text-celestial-indigo',
    icon: '💎',
  },
];

const PAYOUT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-silver-mist', bg: 'bg-silver-mist/10' },
  processing: { label: 'Processing', color: 'text-sunset-amber', bg: 'bg-sunset-amber/10' },
  paid: { label: 'Paid', color: 'text-neural-mint', bg: 'bg-neural-mint/10' },
};

const formatCurrency = (amount: number, currency: string): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    amount
  );

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ── Mock Data ────────────────────────────────────────────────────────────────────

export const MOCK_REWARDS_DATA: RewardsData = {
  totalEarned: 5800,
  pendingAmount: 2200,
  totalReferrals: 8,
  successfulHires: 4,
  currentTier: 'silver',
  currency: 'USD',
  payouts: [
    {
      id: 'p1',
      candidateName: 'Robert Wilson',
      jobTitle: 'Marketing Lead',
      amount: 1800,
      currency: 'USD',
      status: 'paid',
      bonusType: 'referral',
      earnedDate: '2026-01-10',
      paidDate: '2026-01-25',
      paymentMethod: 'Payroll',
    },
    {
      id: 'p2',
      candidateName: 'Sarah Lee',
      jobTitle: 'Frontend Developer',
      amount: 2000,
      currency: 'USD',
      status: 'paid',
      bonusType: 'referral',
      earnedDate: '2025-11-15',
      paidDate: '2025-12-01',
      paymentMethod: 'Payroll',
    },
    {
      id: 'p3',
      candidateName: 'Emily Chen',
      jobTitle: 'Data Scientist',
      amount: 2200,
      currency: 'USD',
      status: 'pending',
      bonusType: 'referral',
      earnedDate: '2026-02-22',
    },
    {
      id: 'p4',
      candidateName: 'Milestone Bonus',
      jobTitle: '3 Successful Hires',
      amount: 500,
      currency: 'USD',
      status: 'paid',
      bonusType: 'milestone',
      earnedDate: '2026-01-10',
      paidDate: '2026-01-25',
      paymentMethod: 'Gift Card',
    },
    {
      id: 'p5',
      candidateName: 'John Doe',
      jobTitle: 'Senior React Developer',
      amount: 2000,
      currency: 'USD',
      status: 'processing',
      bonusType: 'referral',
      earnedDate: '2026-02-20',
    },
  ],
  leaderboard: [
    {
      rank: 1,
      name: 'Priya Sharma',
      avatar: 'PS',
      department: 'Engineering',
      hires: 7,
      totalEarned: 12500,
      isCurrentUser: false,
    },
    {
      rank: 2,
      name: 'David Kim',
      avatar: 'DK',
      department: 'Product',
      hires: 5,
      totalEarned: 9200,
      isCurrentUser: false,
    },
    {
      rank: 3,
      name: 'You',
      avatar: 'ME',
      department: 'Engineering',
      hires: 4,
      totalEarned: 5800,
      isCurrentUser: true,
    },
    {
      rank: 4,
      name: 'Lisa Wang',
      avatar: 'LW',
      department: 'Design',
      hires: 3,
      totalEarned: 4500,
      isCurrentUser: false,
    },
    {
      rank: 5,
      name: 'James Brown',
      avatar: 'JB',
      department: 'Sales',
      hires: 2,
      totalEarned: 3000,
      isCurrentUser: false,
    },
  ],
};

// ── Component ────────────────────────────────────────────────────────────────────

export const ReferralRewards: React.FC<ReferralRewardsProps> = ({ data = MOCK_REWARDS_DATA }) => {
  const [showAllPayouts, setShowAllPayouts] = useState(false);
  const [expandedLeaderboard, setExpandedLeaderboard] = useState(true);

  const currentTier = useMemo(
    () => TIERS.find((t) => t.id === data.currentTier) || TIERS[0],
    [data.currentTier]
  );

  const nextTier = useMemo(() => {
    const idx = TIERS.findIndex((t) => t.id === data.currentTier);
    return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
  }, [data.currentTier]);

  const tierProgress = useMemo(() => {
    if (!nextTier) return 100;
    const range = nextTier.minReferrals - currentTier.minReferrals;
    const progress = data.successfulHires - currentTier.minReferrals;
    return range > 0 ? Math.min(100, Math.round((progress / range) * 100)) : 100;
  }, [data.successfulHires, currentTier, nextTier]);

  const displayedPayouts = showAllPayouts ? data.payouts : data.payouts.slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Wallet Card */}
      <div className="rounded-xl border border-celestial-indigo/20 bg-gradient-to-br from-celestial-indigo to-celestial-indigo/80 p-4 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-5">
          <DollarSign className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 opacity-70" />
            <span className="text-[10px] font-bold opacity-70">Referral Wallet</span>
            <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded bg-white/20 font-bold">
              {currentTier.icon} {currentTier.name} Tier
            </span>
          </div>

          <div className="flex items-end gap-2 mb-1">
            <span className="text-2xl font-bold">
              {formatCurrency(data.totalEarned, data.currency)}
            </span>
            <span className="text-[10px] opacity-70 mb-1">earned</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/20">
            <div>
              <p className="text-lg font-bold text-neural-mint">
                {formatCurrency(data.pendingAmount, data.currency)}
              </p>
              <p className="text-[8px] font-bold uppercase opacity-60">Pending</p>
            </div>
            <div>
              <p className="text-lg font-bold">{data.successfulHires}</p>
              <p className="text-[8px] font-bold uppercase opacity-60">Hired</p>
            </div>
            <div>
              <p className="text-lg font-bold">{data.totalReferrals}</p>
              <p className="text-[8px] font-bold uppercase opacity-60">Referred</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Progress */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-3">
        <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Trophy className="w-4 h-4 text-sunset-amber" />
          Tier Progress
        </p>

        <div className="flex items-center gap-1">
          {TIERS.map((tier, idx) => {
            const isActive = tier.id === data.currentTier;
            const isPast = TIERS.findIndex((t) => t.id === data.currentTier) > idx;
            return (
              <React.Fragment key={tier.id}>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-bold ${
                    isActive
                      ? 'bg-celestial-indigo/10 text-celestial-indigo border border-celestial-indigo/20'
                      : isPast
                        ? 'bg-neural-mint/10 text-neural-mint'
                        : 'text-silver-mist'
                  }`}
                >
                  <span>{tier.icon}</span>
                  {tier.name}
                </div>
                {idx < TIERS.length - 1 && (
                  <ArrowRight className="w-2.5 h-2.5 text-silver-mist/30 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {nextTier && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-silver-mist">
                {data.successfulHires}/{nextTier.minReferrals} hires to {nextTier.name}
              </span>
              <span className="text-[9px] font-bold text-celestial-indigo">{tierProgress}%</span>
            </div>
            <div className="h-2 rounded-full bg-pearl dark:bg-deep-cosmos/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-celestial-indigo transition-all"
                style={{ width: `${tierProgress}%` }}
              />
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-[8px] text-silver-mist">
              <Sparkles className="w-2.5 h-2.5 text-sunset-amber" />
              Next tier: {nextTier.bonusMultiplier}x bonus multiplier +{' '}
              {nextTier.perks[1] || nextTier.perks[0]}
            </div>
          </div>
        )}

        {/* Current Tier Perks */}
        <div>
          <p className="text-[8px] font-bold text-silver-mist uppercase tracking-wider mb-1">
            Your Perks
          </p>
          <div className="flex flex-wrap gap-1">
            {currentTier.perks.map((perk, i) => (
              <span
                key={i}
                className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/10 text-[8px] font-semibold text-celestial-indigo"
              >
                <CheckCircle2 className="w-2.5 h-2.5" /> {perk}
              </span>
            ))}
            <span className="px-2 py-0.5 rounded-lg bg-sunset-amber/10 text-[8px] font-bold text-sunset-amber">
              {currentTier.bonusMultiplier}x multiplier
            </span>
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-3">
        <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-celestial-indigo" />
          Payout History
          <span className="text-[9px] font-normal text-silver-mist">
            ({data.payouts.length} transactions)
          </span>
        </p>

        <div className="space-y-1.5">
          {displayedPayouts.map((payout) => {
            const stCfg = PAYOUT_STATUS_CONFIG[payout.status] || PAYOUT_STATUS_CONFIG.pending;
            return (
              <div
                key={payout.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-pearl/20 dark:hover:bg-deep-cosmos/10 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    payout.bonusType === 'milestone'
                      ? 'bg-sunset-amber/10'
                      : payout.bonusType === 'special'
                        ? 'bg-quantum-rose/10'
                        : 'bg-celestial-indigo/10'
                  }`}
                >
                  {payout.bonusType === 'milestone' ? (
                    <Award className="w-4 h-4 text-sunset-amber" />
                  ) : payout.bonusType === 'special' ? (
                    <Gift className="w-4 h-4 text-quantum-rose" />
                  ) : (
                    <DollarSign className="w-4 h-4 text-celestial-indigo" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-ink-black dark:text-pearl">
                    {payout.candidateName}
                  </p>
                  <p className="text-[8px] text-silver-mist">
                    {payout.jobTitle} · {formatDate(payout.earnedDate)}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`text-[11px] font-bold ${payout.status === 'paid' ? 'text-neural-mint' : 'text-ink-black dark:text-pearl'}`}
                  >
                    +{formatCurrency(payout.amount, payout.currency)}
                  </p>
                  <span className={`text-[7px] font-bold ${stCfg.color}`}>{stCfg.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {data.payouts.length > 4 && (
          <button
            onClick={() => setShowAllPayouts(!showAllPayouts)}
            className="w-full flex items-center justify-center gap-1 py-1.5 text-[9px] font-semibold text-celestial-indigo hover:text-celestial-indigo/80 transition-colors"
          >
            {showAllPayouts ? 'Show Less' : `Show All (${data.payouts.length})`}
            {showAllPayouts ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      {/* Leaderboard */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-3">
        <button
          onClick={() => setExpandedLeaderboard(!expandedLeaderboard)}
          className="w-full flex items-center justify-between"
        >
          <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Trophy className="w-4 h-4 text-sunset-amber" />
            Leaderboard
          </p>
          {expandedLeaderboard ? (
            <ChevronUp className="w-3.5 h-3.5 text-silver-mist" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-silver-mist" />
          )}
        </button>

        {expandedLeaderboard && (
          <div className="space-y-1">
            {data.leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  entry.isCurrentUser
                    ? 'bg-celestial-indigo/5 border border-celestial-indigo/20'
                    : 'hover:bg-pearl/20 dark:hover:bg-deep-cosmos/10'
                }`}
              >
                <span
                  className={`text-[11px] font-bold w-5 text-center ${
                    entry.rank === 1
                      ? 'text-sunset-amber'
                      : entry.rank === 2
                        ? 'text-silver-mist'
                        : entry.rank === 3
                          ? 'text-sunset-amber/60'
                          : 'text-silver-mist/60'
                  }`}
                >
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                </span>

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0 ${
                    entry.isCurrentUser ? 'bg-celestial-indigo' : 'bg-silver-mist/40'
                  }`}
                >
                  {entry.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[10px] font-semibold ${
                      entry.isCurrentUser
                        ? 'text-celestial-indigo'
                        : 'text-ink-black dark:text-pearl'
                    }`}
                  >
                    {entry.name} {entry.isCurrentUser && <span className="text-[8px]">(You)</span>}
                  </p>
                  <p className="text-[8px] text-silver-mist">{entry.department}</p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[10px] font-bold text-ink-black dark:text-pearl">
                    {entry.hires} hires
                  </p>
                  <p className="text-[8px] text-neural-mint">
                    {formatCurrency(entry.totalEarned, 'USD')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralRewards;
