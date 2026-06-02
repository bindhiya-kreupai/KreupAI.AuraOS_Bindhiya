"use client";

import React, { useState, useEffect } from 'react';
import {
    Trophy,
    Medal,
    Crown,
    TrendingUp,
    Users,
    Loader2
} from 'lucide-react';
import { LeaderboardsService } from '../services';

export default function LeaderboardsPage() {
    const [leaderboards, setLeaderboards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await LeaderboardsService.getLeaderboards();
                setLeaderboards(data as any);
            } catch (error: any) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const leaderboard = leaderboards;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        Leaderboards
                    </h1>
                    <p className="text-slate-500 text-sm">See who's leading the pack this month.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    {['Global', 'Team', 'Regional'].map((tab, i) => (
                        <button key={tab} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${i === 0 ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end mb-8">
                {/* Top 3 Podium Visual */}
                <div className="lg:col-span-3 flex justify-center items-end gap-3 h-64 mb-4">
                    {/* 2nd Place */}
                    <div className="flex flex-col items-center gap-2">
                        <img src={leaderboard[1].avatar} className="w-16 h-16 rounded-full border-4 border-slate-300 shadow-lg" />
                        <div className="font-bold text-sm text-slate-600 dark:text-slate-300">{leaderboard[1].name}</div>
                        <div className="w-24 h-32 bg-slate-200 dark:bg-slate-800 rounded-t-xl flex flex-col items-center justify-start pt-4 relative">
                            <span className="text-4xl font-bold text-slate-400 opacity-50">2</span>
                            <div className="text-xs font-bold mt-auto pb-2 text-slate-500">{leaderboard[1].points} pts</div>
                        </div>
                    </div>
                    {/* 1st Place */}
                    <div className="flex flex-col items-center gap-2 mb-4">
                        <Crown className="w-8 h-8 text-yellow-500 animate-bounce" />
                        <img src={leaderboard[0].avatar} className="w-20 h-20 rounded-full border-4 border-yellow-400 shadow-xl" />
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{leaderboard[0].name}</div>
                        <div className="w-28 h-48 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-t-xl flex flex-col items-center justify-start pt-6 shadow-lg shadow-orange-500/20">
                            <span className="text-5xl font-bold text-white mb-1">1</span>
                            <div className="text-sm font-bold text-white/90 mt-auto pb-4">{leaderboard[0].points} pts</div>
                        </div>
                    </div>
                    {/* 3rd Place */}
                    <div className="flex flex-col items-center gap-2">
                        <img src={leaderboard[2].avatar} className="w-16 h-16 rounded-full border-4 border-orange-300 shadow-lg" />
                        <div className="font-bold text-sm text-slate-600 dark:text-slate-300">{leaderboard[2].name}</div>
                        <div className="w-24 h-24 bg-orange-100 dark:bg-slate-800 rounded-t-xl flex flex-col items-center justify-start pt-4 relative">
                            <span className="text-4xl font-bold text-orange-800/30">3</span>
                            <div className="text-xs font-bold mt-auto pb-2 text-slate-500">{leaderboard[2].points} pts</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* List View */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm max-w-4xl mx-auto w-full">
                <div className="space-y-2">
                    {leaderboard.map((user, i) => (
                        <div key={i} className={`flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all ${user.name === 'Dr. Silberman' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200' : 'bg-white dark:bg-slate-900'}`}>
                            <div className="flex items-center gap-3">
                                <span className={`font-bold w-6 text-center ${i < 3 ? 'text-indigo-600' : 'text-slate-400'}`}>{user.rank}</span>
                                <img src={user.avatar} className="w-10 h-10 rounded-full bg-slate-200" />
                                <div>
                                    <h4 className="font-bold text-sm">{user.name}</h4>
                                    <p className="text-xs text-slate-500">Global Rank: #{user.rank}</p>
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-3">
                                <div className="text-xs text-slate-400 hidden md:block">
                                    {user.change === 'up' && <span className="text-emerald-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +2</span>}
                                    {user.change === 'down' && <span className="text-rose-500 flex items-center gap-1"><TrendingUp className="w-3 h-3 rotate-180" /> -1</span>}
                                    {user.change === 'same' && <span className="text-slate-400">-</span>}
                                </div>
                                <div className="font-bold text-slate-700 dark:text-slate-300 w-20 text-right">{user.points} pts</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

