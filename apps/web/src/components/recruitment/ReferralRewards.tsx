"use client";

import React from "react";
import {
  Award,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
} from "lucide-react";

type PayoutStatus = "paid" | "pending" | "processing" | "scheduled";

interface RewardHistoryEntry {
  id: string;
  candidateName: string;
  position: string;
  hiredDate: string;
  rewardAmount: number;
  payoutStatus: PayoutStatus;
  payoutDate?: string;
}

interface RewardSummary {
  totalEarnings: number;
  pendingRewards: number;
  paidRewards: number;
  totalReferrals: number;
  successfulHires: number;
}

interface ReferralRewardsProps {
  summary?: RewardSummary;
  history?: RewardHistoryEntry[];
}

const payoutStatusConfig: Record<PayoutStatus, { label: string; classes: string; icon: typeof CheckCircle }> = {
  paid: {
    label: "Paid",
    classes: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    icon: CheckCircle,
  },
  pending: {
    label: "Pending",
    classes: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    classes: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    icon: TrendingUp,
  },
  scheduled: {
    label: "Scheduled",
    classes: "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
    icon: Calendar,
  },
};

const mockSummary: RewardSummary = {
  totalEarnings: 13500,
  pendingRewards: 7500,
  paidRewards: 6000,
  totalReferrals: 8,
  successfulHires: 3,
};

const mockHistory: RewardHistoryEntry[] = [
  {
    id: "rw-001",
    candidateName: "David Wilson",
    position: "Backend Engineer",
    hiredDate: "2025-11-15",
    rewardAmount: 5000,
    payoutStatus: "paid",
    payoutDate: "2026-01-15",
  },
  {
    id: "rw-002",
    candidateName: "Emily Zhang",
    position: "Senior Product Manager",
    hiredDate: "2025-12-01",
    rewardAmount: 4000,
    payoutStatus: "processing",
    payoutDate: "2026-02-01",
  },
  {
    id: "rw-003",
    candidateName: "Carlos Rivera",
    position: "UX Designer",
    hiredDate: "2025-12-20",
    rewardAmount: 3500,
    payoutStatus: "scheduled",
    payoutDate: "2026-02-20",
  },
  {
    id: "rw-004",
    candidateName: "Maria Garcia",
    position: "Product Designer",
    hiredDate: "2026-01-10",
    rewardAmount: 3500,
    payoutStatus: "pending",
  },
  {
    id: "rw-005",
    candidateName: "Tom Anderson",
    position: "QA Engineer",
    hiredDate: "2025-10-05",
    rewardAmount: 1000,
    payoutStatus: "paid",
    payoutDate: "2025-12-05",
  },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ReferralRewards({
  summary = mockSummary,
  history = mockHistory,
}: ReferralRewardsProps) {
  return (
    <div className="bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center gap-2 mb-5">
        <Award className="w-5 h-5 text-celestial-indigo" />
        <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
          Referral Rewards
        </h3>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist">Total Earnings</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">
            {formatCurrency(summary.totalEarnings)}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-xs text-silver-mist">Pending</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">
            {formatCurrency(summary.pendingRewards)}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs text-silver-mist">Paid Out</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">
            {formatCurrency(summary.paidRewards)}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist">Hire Rate</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">
            {summary.successfulHires}/{summary.totalReferrals}
          </p>
          <p className="text-xs text-silver-mist">
            {Math.round((summary.successfulHires / summary.totalReferrals) * 100)}% success
          </p>
        </div>
      </div>

      {/* Reward History */}
      <div>
        <h4 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3">
          Reward History
        </h4>
        <div className="space-y-2">
          {history.map((entry) => {
            const statusConf = payoutStatusConfig[entry.payoutStatus];
            const StatusIcon = statusConf.icon;

            return (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-celestial-indigo" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-black dark:text-pearl">
                      {entry.candidateName}
                    </p>
                    <p className="text-xs text-silver-mist">
                      {entry.position} | Hired{" "}
                      {new Date(entry.hiredDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold text-ink-black dark:text-pearl">
                    {formatCurrency(entry.rewardAmount)}
                  </p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusConf.classes}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConf.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payout Note */}
        <div className="mt-4 p-3 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/20">
          <p className="text-xs text-celestial-indigo">
            Rewards are paid out 60 days after the hire start date, subject to the new hire completing their probation period.
          </p>
        </div>
      </div>
    </div>
  );
}
