"use client";

import React from 'react';
import {
    Trophy,
    Medal,
    Crown,
    Star,
    Zap,
    TrendingUp,
    Shield,
    Users,
    ArrowUp
} from 'lucide-react';

// --- MOCK DATA ---

const TOP_THREE = [
    {
        id: '2',
        rank: 2,
        name: 'Michael Chen',
        role: 'Senior Dev',
        points: 4250,
        level: 18,
        avatar: 'https://i.pravatar.cc/150?u=EMP002',
        badge: 'Bug Hunter',
        badgeColor: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30'
    },
    {
        id: '1',
        rank: 1,
        name: 'Sarah Anderson',
        role: 'Team Lead',
        points: 5100,
        level: 21,
        avatar: 'https://i.pravatar.cc/150?u=EMP001',
        badge: 'Champion',
        badgeColor: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30'
    },
    {
        id: '3',
        rank: 3,
        name: 'Priya Sharma',
        role: 'UX Designer',
        points: 3900,
        level: 16,
        avatar: 'https://i.pravatar.cc/150?u=EMP003',
        badge: 'Creative Soul',
        badgeColor: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30'
    },
];

const LEADERBOARD = [
    { rank: 4, name: 'James Wilson', role: 'DevOps', points: 3450, level: 15, avatar: 'https://i.pravatar.cc/150?u=EMP004', change: 'up' },
    { rank: 5, name: 'David Kim', role: 'QA Eng', points: 3200, level: 14, avatar: 'https://i.pravatar.cc/150?u=EMP008', change: 'same' },
    { rank: 6, name: 'Elena Rodriguez', role: 'Frontend', points: 2950, level: 12, avatar: 'https://i.pravatar.cc/150?u=EMP007', change: 'down' },
    { rank: 7, name: 'Omar Al-Fayed', role: 'Sales', points: 2800, level: 11, avatar: 'https://i.pravatar.cc/150?u=EMP006', change: 'up' },
    { rank: 8, name: 'Anita Desai', role: 'Marketing', points: 2650, level: 10, avatar: 'https://i.pravatar.cc/150?u=EMP005', change: 'same' },
];

const MY_STATS = {
    level: 12,
    currentXP: 2950,
    nextLevelXP: 3500,
    rank: 6,
    badges: ['Early Bird', 'Team Player', 'Fast Learner', 'Problem Solver']
};

export default function LeaderboardPage() {
    const xpProgress = (MY_STATS.currentXP / MY_STATS.nextLevelXP) * 100;

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-500" />
                    Leaderboard & Rewards
                </h1>
                <p className="text-silver-mist text-sm">Recognizing our top performers this month.</p>
            </div>

            {/* Podium Section */}
            <div className="relative pt-10 pb-6">
                <div className="flex justify-center items-end gap-4 md:gap-8">
                    {/* Rank 2 */}
                    <div className="flex flex-col items-center">
                        <div className="relative mb-3">
                            <img src={TOP_THREE[0].avatar} alt={TOP_THREE[0].name} className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-700 shadow-lg object-cover" />
                            <div className="absolute -bottom-2 -right-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-md">2</div>
                        </div>
                        <div className="text-center mb-2">
                            <div className="font-bold text-ink-black dark:text-pearl text-sm">{TOP_THREE[0].name}</div>
                            <div className="text-xs text-celestial-indigo font-bold">{TOP_THREE[0].points} XP</div>
                        </div>
                        <div className="w-20 md:w-32 h-24 bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-t-lg shadow-inner flex items-center justify-center">
                            <Medal className="w-8 h-8 text-slate-400" />
                        </div>
                    </div>

                    {/* Rank 1 */}
                    <div className="flex flex-col items-center">
                        <div className="relative mb-3">
                            <Crown className="w-8 h-8 text-amber-500 absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce" />
                            <img src={TOP_THREE[1].avatar} alt={TOP_THREE[1].name} className="w-20 h-20 rounded-full border-4 border-amber-400 dark:border-amber-500 shadow-xl object-cover" />
                            <div className="absolute -bottom-2 -right-1 bg-amber-400 dark:bg-amber-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shadow-md">1</div>
                        </div>
                        <div className="text-center mb-2">
                            <div className="font-bold text-ink-black dark:text-pearl text-base">{TOP_THREE[1].name}</div>
                            <div className="text-xs text-celestial-indigo font-bold">{TOP_THREE[1].points} XP</div>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${TOP_THREE[1].badgeColor}`}>
                                {TOP_THREE[1].badge}
                            </span>
                        </div>
                        <div className="w-24 md:w-40 h-32 bg-gradient-to-b from-amber-200 to-amber-300 dark:from-amber-600 dark:to-amber-700 rounded-t-lg shadow-inner flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 skew-y-12 translate-y-10" />
                            <Trophy className="w-12 h-12 text-amber-100" />
                        </div>
                    </div>

                    {/* Rank 3 */}
                    <div className="flex flex-col items-center">
                        <div className="relative mb-3">
                            <img src={TOP_THREE[2].avatar} alt={TOP_THREE[2].name} className="w-16 h-16 rounded-full border-4 border-orange-200 dark:border-orange-800 shadow-lg object-cover" />
                            <div className="absolute -bottom-2 -right-1 bg-orange-300 dark:bg-orange-700 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-md">3</div>
                        </div>
                        <div className="text-center mb-2">
                            <div className="font-bold text-ink-black dark:text-pearl text-sm">{TOP_THREE[2].name}</div>
                            <div className="text-xs text-celestial-indigo font-bold">{TOP_THREE[2].points} XP</div>
                        </div>
                        <div className="w-20 md:w-32 h-16 bg-gradient-to-b from-orange-200 to-orange-300 dark:from-orange-700 dark:to-orange-800 rounded-t-lg shadow-inner flex items-center justify-center">
                            <Medal className="w-8 h-8 text-orange-100" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ranking List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Users className="w-5 h-5 text-celestial-indigo" />
                        Top Performers
                    </h3>
                    <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-silver-mist uppercase">
                                <tr>
                                    <th className="px-6 py-3 text-left w-20">Rank</th>
                                    <th className="px-6 py-3 text-left">Employee</th>
                                    <th className="px-6 py-3 text-center">Level</th>
                                    <th className="px-6 py-3 text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
                                {LEADERBOARD.map((user) => (
                                    <tr key={user.rank} className="hover:bg-slate-50 dark:hover:bg-deep-cosmos/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 font-bold text-silver-mist">
                                                #{user.rank}
                                                {user.change === 'up' && <ArrowUp className="w-3 h-3 text-emerald-500" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-slate-200" />
                                                <div>
                                                    <div className="font-bold text-ink-black dark:text-pearl text-sm">{user.name}</div>
                                                    <div className="text-xs text-silver-mist">{user.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-cloud dark:bg-deep-cosmos text-sm font-bold text-ink-black dark:text-pearl">
                                                {user.level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-celestial-indigo">
                                            {user.points.toLocaleString()} XP
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-4 border-t border-cloud dark:border-nebula-purple/20 text-center">
                            <button className="text-sm font-medium text-celestial-indigo hover:underline">View Full Leaderboard</button>
                        </div>
                    </div>
                </div>

                {/* My Stats Card */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-celestial-indigo to-nebula-purple p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />

                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Zap className="w-5 h-5" /> My Progress</h3>

                        <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-col">
                                <span className="text-white/80 text-xs uppercase tracking-wider font-semibold">Current Level</span>
                                <span className="text-3xl font-black">{MY_STATS.level}</span>
                            </div>
                            <div className="w-12 h-12 rounded-full border-4 border-white/20 flex items-center justify-center font-bold text-lg bg-white/10">
                                #{MY_STATS.rank}
                            </div>
                        </div>

                        <div className="mb-2">
                            <div className="flex justify-between text-xs font-medium mb-1.5 opacity-90">
                                <span>{MY_STATS.currentXP} XP</span>
                                <span>{MY_STATS.nextLevelXP} XP</span>
                            </div>
                            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                                <div className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${xpProgress}%` }} />
                            </div>
                            <div className="text-xs text-center mt-2 opacity-80">
                                {MY_STATS.nextLevelXP - MY_STATS.currentXP} XP to Level {MY_STATS.level + 1}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-500" />
                            Earned Badges
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {MY_STATS.badges.map((badge, i) => (
                                <div key={i} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-deep-cosmos/50 border border-cloud dark:border-nebula-purple/20 text-center hover:scale-105 transition-transform">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-800 dark:to-amber-900 flex items-center justify-center mb-2 shadow-sm text-amber-600 dark:text-amber-200">
                                        <Star className="w-5 h-5 fill-current" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{badge}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
