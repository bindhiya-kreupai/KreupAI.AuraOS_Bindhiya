"use client";

import React, { useState } from "react";
import {
  Trophy,
  Medal,
  TrendingUp,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

type TimePeriod = "week" | "month" | "quarter" | "year";

interface LeaderboardEntry {
  rank: number;
  previousRank: number;
  name: string;
  avatar: string;
  role: string;
  pointsReceived: number;
  recognitionsGiven: number;
  topBadge: { name: string; emoji: string };
}

const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    previousRank: 2,
    name: "Elena Rodriguez",
    avatar: "ER",
    role: "Tech Lead",
    pointsReceived: 485,
    recognitionsGiven: 32,
    topBadge: { name: "Innovator", emoji: "\u{1F4A1}" },
  },
  {
    rank: 2,
    previousRank: 1,
    name: "Alice Chen",
    avatar: "AC",
    role: "Senior Engineer",
    pointsReceived: 420,
    recognitionsGiven: 45,
    topBadge: { name: "Team Player", emoji: "\u{1F91D}" },
  },
  {
    rank: 3,
    previousRank: 4,
    name: "David Park",
    avatar: "DP",
    role: "Backend Engineer",
    pointsReceived: 375,
    recognitionsGiven: 28,
    topBadge: { name: "Problem Solver", emoji: "\u{1F527}" },
  },
  {
    rank: 4,
    previousRank: 3,
    name: "Sarah Williams",
    avatar: "SW",
    role: "UX Designer",
    pointsReceived: 340,
    recognitionsGiven: 38,
    topBadge: { name: "Customer Champion", emoji: "\u{1F451}" },
  },
  {
    rank: 5,
    previousRank: 5,
    name: "Marcus Johnson",
    avatar: "MJ",
    role: "Product Manager",
    pointsReceived: 310,
    recognitionsGiven: 52,
    topBadge: { name: "Culture Builder", emoji: "\u{1F3D7}\u{FE0F}" },
  },
  {
    rank: 6,
    previousRank: 8,
    name: "Priya Sharma",
    avatar: "PS",
    role: "QA Lead",
    pointsReceived: 285,
    recognitionsGiven: 22,
    topBadge: { name: "Quality Guardian", emoji: "\u{1F6E1}\u{FE0F}" },
  },
  {
    rank: 7,
    previousRank: 6,
    name: "James Wilson",
    avatar: "JW",
    role: "Data Analyst",
    pointsReceived: 260,
    recognitionsGiven: 18,
    topBadge: { name: "Knowledge Sharer", emoji: "\u{1F4DA}" },
  },
  {
    rank: 8,
    previousRank: 7,
    name: "Lisa Chang",
    avatar: "LC",
    role: "DevOps Engineer",
    pointsReceived: 235,
    recognitionsGiven: 15,
    topBadge: { name: "Early Bird", emoji: "\u{1F426}" },
  },
  {
    rank: 9,
    previousRank: 10,
    name: "Tom Baker",
    avatar: "TB",
    role: "Frontend Engineer",
    pointsReceived: 210,
    recognitionsGiven: 25,
    topBadge: { name: "Mentor", emoji: "\u{1F393}" },
  },
  {
    rank: 10,
    previousRank: 9,
    name: "Nina Patel",
    avatar: "NP",
    role: "Product Designer",
    pointsReceived: 195,
    recognitionsGiven: 30,
    topBadge: { name: "Rising Star", emoji: "\u{1F680}" },
  },
];

const getRankChange = (current: number, previous: number) => {
  if (current < previous) return { direction: "up" as const, diff: previous - current };
  if (current > previous) return { direction: "down" as const, diff: current - previous };
  return { direction: "same" as const, diff: 0 };
};

export default function RecognitionLeaderboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");

  const periods: { key: TimePeriod; label: string }[] = [
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "quarter", label: "This Quarter" },
    { key: "year", label: "This Year" },
  ];

  const topThree = mockLeaderboard.slice(0, 3);

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-celestial-indigo" />
          <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
            Recognition Leaderboard
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-silver-mist" />
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
            className="text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg px-3 py-1.5 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
          >
            {periods.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 mb-8 pt-4">
        {/* 2nd Place */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-nebula-purple/30 flex items-center justify-center text-sm font-bold text-ink-black dark:text-pearl mb-2">
            {topThree[1]?.avatar}
          </div>
          <span className="text-xs font-medium text-ink-black dark:text-pearl mb-1">
            {topThree[1]?.name.split(" ")[0]}
          </span>
          <div className="w-16 h-16 bg-gray-200 dark:bg-nebula-purple/20 rounded-t-lg flex items-center justify-center">
            <Medal className="w-5 h-5 text-gray-500" />
          </div>
        </div>
        {/* 1st Place */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-sm font-bold text-amber-700 dark:text-amber-400 mb-2 ring-2 ring-amber-400">
            {topThree[0]?.avatar}
          </div>
          <span className="text-xs font-semibold text-ink-black dark:text-pearl mb-1">
            {topThree[0]?.name.split(" ")[0]}
          </span>
          <div className="w-16 h-24 bg-amber-100 dark:bg-amber-900/20 rounded-t-lg flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-500" />
          </div>
        </div>
        {/* 3rd Place */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center text-sm font-bold text-amber-800 dark:text-amber-300 mb-2">
            {topThree[2]?.avatar}
          </div>
          <span className="text-xs font-medium text-ink-black dark:text-pearl mb-1">
            {topThree[2]?.name.split(" ")[0]}
          </span>
          <div className="w-16 h-12 bg-amber-50 dark:bg-amber-900/10 rounded-t-lg flex items-center justify-center">
            <Medal className="w-5 h-5 text-amber-700 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* Full Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cloud dark:border-nebula-purple/30">
              <th className="text-left text-xs font-semibold text-silver-mist uppercase tracking-wider py-3 px-2">
                Rank
              </th>
              <th className="text-left text-xs font-semibold text-silver-mist uppercase tracking-wider py-3 px-2">
                Employee
              </th>
              <th className="text-center text-xs font-semibold text-silver-mist uppercase tracking-wider py-3 px-2">
                Points
              </th>
              <th className="text-center text-xs font-semibold text-silver-mist uppercase tracking-wider py-3 px-2">
                Given
              </th>
              <th className="text-center text-xs font-semibold text-silver-mist uppercase tracking-wider py-3 px-2">
                Top Badge
              </th>
              <th className="text-center text-xs font-semibold text-silver-mist uppercase tracking-wider py-3 px-2">
                Trend
              </th>
            </tr>
          </thead>
          <tbody>
            {mockLeaderboard.map((entry) => {
              const change = getRankChange(entry.rank, entry.previousRank);
              return (
                <tr
                  key={entry.rank}
                  className="border-b border-cloud/50 dark:border-nebula-purple/20 hover:bg-gray-50 dark:hover:bg-nebula-purple/10 transition-colors"
                >
                  <td className="py-3 px-2">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        entry.rank === 1
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : entry.rank === 2
                          ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          : entry.rank === 3
                          ? "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                          : "text-silver-mist"
                      }`}
                    >
                      {entry.rank}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-xs font-semibold text-celestial-indigo">
                        {entry.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-ink-black dark:text-pearl">
                          {entry.name}
                        </div>
                        <div className="text-xs text-silver-mist">{entry.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="text-sm font-semibold text-ink-black dark:text-pearl">
                      {entry.pointsReceived}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="text-sm text-silver-mist">
                      {entry.recognitionsGiven}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span title={entry.topBadge.name} className="text-lg">
                      {entry.topBadge.emoji}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    {change.direction === "up" ? (
                      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-aurora-green">
                        <ArrowUp className="w-3 h-3" />
                        {change.diff}
                      </span>
                    ) : change.direction === "down" ? (
                      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-coral-alert">
                        <ArrowDown className="w-3 h-3" />
                        {change.diff}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs text-silver-mist">
                        <Minus className="w-3 h-3" />
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-cloud dark:border-nebula-purple/30">
        <div className="text-center">
          <div className="text-lg font-bold text-ink-black dark:text-pearl">3,115</div>
          <div className="text-xs text-silver-mist">Total Points Awarded</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-ink-black dark:text-pearl">305</div>
          <div className="text-xs text-silver-mist">Total Recognitions</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <TrendingUp className="w-4 h-4 text-aurora-green" />
            <span className="text-lg font-bold text-aurora-green">+18%</span>
          </div>
          <div className="text-xs text-silver-mist">vs Last Period</div>
        </div>
      </div>
    </div>
  );
}
