"use client";

import React from "react";
import {
  Heart,
  Trophy,
  Flame,
  Star,
  Gift,
  Target,
  Users,
  Calendar,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "steps" | "meditation" | "nutrition" | "fitness";
  startDate: string;
  endDate: string;
  progress: number;
  target: number;
  unit: string;
  participants: number;
  status: "active" | "completed" | "upcoming";
  reward: number;
}

interface WellnessData {
  totalPoints: number;
  pointsThisMonth: number;
  currentStreak: number;
  longestStreak: number;
  rewardsRedeemed: number;
  rewardsAvailable: number;
  challenges: Challenge[];
  recentRewards: { id: string; name: string; points: number; date: string }[];
}

const mockData: WellnessData = {
  totalPoints: 4250,
  pointsThisMonth: 380,
  currentStreak: 12,
  longestStreak: 34,
  rewardsRedeemed: 3,
  rewardsAvailable: 8,
  challenges: [
    {
      id: "ch-001",
      title: "10K Steps Daily",
      description: "Walk 10,000 steps every day for 30 days",
      type: "steps",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      progress: 18,
      target: 30,
      unit: "days",
      participants: 156,
      status: "active",
      reward: 200,
    },
    {
      id: "ch-002",
      title: "Mindfulness Month",
      description: "Complete 10 minutes of meditation daily",
      type: "meditation",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      progress: 15,
      target: 30,
      unit: "sessions",
      participants: 89,
      status: "active",
      reward: 150,
    },
    {
      id: "ch-003",
      title: "Hydration Challenge",
      description: "Drink 8 glasses of water daily for 2 weeks",
      type: "nutrition",
      startDate: "2025-12-15",
      endDate: "2025-12-29",
      progress: 14,
      target: 14,
      unit: "days",
      participants: 203,
      status: "completed",
      reward: 100,
    },
    {
      id: "ch-004",
      title: "February Fitness",
      description: "Complete 20 workout sessions in February",
      type: "fitness",
      startDate: "2026-02-01",
      endDate: "2026-02-28",
      progress: 0,
      target: 20,
      unit: "workouts",
      participants: 45,
      status: "upcoming",
      reward: 250,
    },
  ],
  recentRewards: [
    { id: "r-001", name: "Amazon Gift Card ($25)", points: 1000, date: "2026-01-10" },
    { id: "r-002", name: "Extra PTO Day", points: 2000, date: "2025-12-20" },
    { id: "r-003", name: "Fitness Gear Voucher ($50)", points: 1500, date: "2025-11-15" },
  ],
};

const statusConfig = {
  active: { bg: "bg-aurora-green/10", text: "text-aurora-green", label: "Active" },
  completed: { bg: "bg-celestial-indigo/10", text: "text-celestial-indigo", label: "Completed" },
  upcoming: { bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-600", label: "Upcoming" },
};

export default function WellnessTracker() {
  const data = mockData;

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6 text-celestial-indigo" />
          <div>
            <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
              Wellness Tracker
            </h1>
            <p className="text-sm text-silver-mist">
              Track your wellness journey and earn rewards
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 text-center">
            <Star className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-ink-black dark:text-pearl">{data.totalPoints.toLocaleString()}</p>
            <p className="text-xs text-silver-mist">Total Points</p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 text-center">
            <Trophy className="w-5 h-5 text-celestial-indigo mx-auto mb-2" />
            <p className="text-2xl font-bold text-ink-black dark:text-pearl">+{data.pointsThisMonth}</p>
            <p className="text-xs text-silver-mist">This Month</p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 text-center">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-ink-black dark:text-pearl">{data.currentStreak}</p>
            <p className="text-xs text-silver-mist">Day Streak</p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 text-center">
            <Gift className="w-5 h-5 text-aurora-green mx-auto mb-2" />
            <p className="text-2xl font-bold text-ink-black dark:text-pearl">{data.rewardsRedeemed}</p>
            <p className="text-xs text-silver-mist">Rewards Earned</p>
          </div>
        </div>

        {/* Active Challenges */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-celestial-indigo" />
            Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.challenges.map((challenge) => {
              const config = statusConfig[challenge.status];
              const progressPercent = (challenge.progress / challenge.target) * 100;

              return (
                <div
                  key={challenge.id}
                  className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                      {config.label}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-silver-mist">
                      <Users className="w-3.5 h-3.5" />
                      <span>{challenge.participants}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-ink-black dark:text-pearl">
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-silver-mist mt-1">{challenge.description}</p>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-silver-mist">
                        {challenge.progress}/{challenge.target} {challenge.unit}
                      </span>
                      <span className="font-medium text-ink-black dark:text-pearl">
                        {Math.round(progressPercent)}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-cloud dark:bg-nebula-purple/30">
                      <div
                        className={`h-full rounded-full transition-all ${
                          challenge.status === "completed" ? "bg-aurora-green" : "bg-celestial-indigo"
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-silver-mist">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{challenge.endDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="text-ink-black dark:text-pearl font-medium">{challenge.reward} pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Rewards */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <h2 className="text-base font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-celestial-indigo" />
            Rewards Redeemed
          </h2>
          <div className="space-y-3">
            {data.recentRewards.map((reward) => (
              <div key={reward.id} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-aurora-green flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">{reward.name}</p>
                  <p className="text-xs text-silver-mist">{reward.date}</p>
                </div>
                <span className="text-sm text-celestial-indigo font-medium">{reward.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
