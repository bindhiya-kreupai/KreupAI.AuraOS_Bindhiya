"use client";

import React from "react";
import {
  Users,
  Send,
  Search,
  MessageSquare,
  UserCheck,
  XCircle,
  Award,
  CheckCircle,
} from "lucide-react";

type ReferralStage = "submitted" | "screening" | "interview" | "hired" | "rejected";

interface ReferralCandidate {
  id: string;
  candidateName: string;
  position: string;
  referredBy: string;
  referralDate: string;
  currentStage: ReferralStage;
  rewardEligible: boolean;
  rewardAmount?: string;
}

interface ReferralTrackingProps {
  candidates?: ReferralCandidate[];
}

const stageConfig: Record<ReferralStage, { label: string; icon: typeof Send; classes: string; dotClasses: string }> = {
  submitted: {
    label: "Submitted",
    icon: Send,
    classes: "text-blue-600 dark:text-blue-400",
    dotClasses: "bg-blue-500",
  },
  screening: {
    label: "Screening",
    icon: Search,
    classes: "text-yellow-600 dark:text-yellow-400",
    dotClasses: "bg-yellow-500",
  },
  interview: {
    label: "Interview",
    icon: MessageSquare,
    classes: "text-purple-600 dark:text-purple-400",
    dotClasses: "bg-purple-500",
  },
  hired: {
    label: "Hired",
    icon: UserCheck,
    classes: "text-green-600 dark:text-green-400",
    dotClasses: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    classes: "text-red-500 dark:text-red-400",
    dotClasses: "bg-red-500",
  },
};

const stageOrder: ReferralStage[] = ["submitted", "screening", "interview", "hired"];

const mockCandidates: ReferralCandidate[] = [
  {
    id: "ref-001",
    candidateName: "David Wilson",
    position: "Backend Engineer",
    referredBy: "John Smith",
    referralDate: "2025-12-15",
    currentStage: "hired",
    rewardEligible: true,
    rewardAmount: "$5,000",
  },
  {
    id: "ref-002",
    candidateName: "Maria Garcia",
    position: "Product Designer",
    referredBy: "John Smith",
    referralDate: "2026-01-05",
    currentStage: "interview",
    rewardEligible: true,
    rewardAmount: "$3,500",
  },
  {
    id: "ref-003",
    candidateName: "James Lee",
    position: "DevOps Engineer",
    referredBy: "Jane Doe",
    referralDate: "2026-01-15",
    currentStage: "screening",
    rewardEligible: true,
    rewardAmount: "$4,000",
  },
  {
    id: "ref-004",
    candidateName: "Anna Kim",
    position: "Frontend Engineer",
    referredBy: "Mike Johnson",
    referralDate: "2026-01-10",
    currentStage: "rejected",
    rewardEligible: false,
  },
  {
    id: "ref-005",
    candidateName: "Robert Chen",
    position: "Data Analyst",
    referredBy: "Jane Doe",
    referralDate: "2026-01-20",
    currentStage: "submitted",
    rewardEligible: true,
    rewardAmount: "$3,000",
  },
];

function StageTimeline({ currentStage }: { currentStage: ReferralStage }) {
  const isRejected = currentStage === "rejected";
  const currentIdx = stageOrder.indexOf(currentStage);

  return (
    <div className="flex items-center gap-1 mt-2">
      {stageOrder.map((stage, idx) => {
        const isActive = !isRejected && idx <= currentIdx;
        const isCurrent = !isRejected && idx === currentIdx;

        return (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  isActive
                    ? `${stageConfig[stage].dotClasses} border-transparent`
                    : isRejected
                      ? "bg-red-200 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                      : "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                } ${isCurrent ? "ring-2 ring-offset-1 ring-celestial-indigo/30" : ""}`}
              />
              <span className={`text-[9px] mt-0.5 ${isActive ? "text-ink-black dark:text-pearl" : "text-silver-mist"}`}>
                {stageConfig[stage].label}
              </span>
            </div>
            {idx < stageOrder.length - 1 && (
              <div
                className={`flex-1 h-0.5 -mt-3 ${
                  !isRejected && idx < currentIdx
                    ? "bg-celestial-indigo"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
      {isRejected && (
        <>
          <div className="flex-1 h-0.5 -mt-3 bg-red-300 dark:bg-red-700" />
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-transparent" />
            <span className="text-[9px] mt-0.5 text-red-500 dark:text-red-400">Rejected</span>
          </div>
        </>
      )}
    </div>
  );
}

export function ReferralTracking({ candidates = mockCandidates }: ReferralTrackingProps) {
  return (
    <div className="bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center gap-2 mb-5">
        <Users className="w-5 h-5 text-celestial-indigo" />
        <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
          Referral Tracking
        </h3>
        <span className="ml-auto text-xs text-silver-mist">
          {candidates.length} referrals
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {(["submitted", "screening", "interview", "hired"] as ReferralStage[]).map((stage) => {
          const count = candidates.filter((c) => c.currentStage === stage).length;
          const config = stageConfig[stage];
          const StageIcon = config.icon;
          return (
            <div
              key={stage}
              className="p-3 rounded-lg bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50 text-center"
            >
              <StageIcon className={`w-4 h-4 mx-auto mb-1 ${config.classes}`} />
              <p className="text-lg font-bold text-ink-black dark:text-pearl">{count}</p>
              <p className="text-xs text-silver-mist">{config.label}</p>
            </div>
          );
        })}
      </div>

      {/* Candidate List */}
      <div className="space-y-3">
        {candidates.map((candidate) => {
          const config = stageConfig[candidate.currentStage];
          const StageIcon = config.icon;

          return (
            <div
              key={candidate.id}
              className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50"
            >
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">
                    {candidate.candidateName}
                  </p>
                  <p className="text-xs text-silver-mist">
                    {candidate.position} | Referred by {candidate.referredBy}
                  </p>
                  <p className="text-xs text-silver-mist">
                    Submitted: {new Date(candidate.referralDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`flex items-center gap-1 text-xs font-medium ${config.classes}`}>
                    <StageIcon className="w-3.5 h-3.5" />
                    {config.label}
                  </span>
                  {candidate.rewardEligible && candidate.rewardAmount && (
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <Award className="w-3 h-3" />
                      {candidate.currentStage === "hired" ? (
                        <span className="flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3" />
                          {candidate.rewardAmount} earned
                        </span>
                      ) : (
                        <span>{candidate.rewardAmount} if hired</span>
                      )}
                    </span>
                  )}
                  {!candidate.rewardEligible && (
                    <span className="text-xs text-silver-mist">Not eligible</span>
                  )}
                </div>
              </div>

              <StageTimeline currentStage={candidate.currentStage} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
