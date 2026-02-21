'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Users, Calendar, ArrowUpRight, Crown, Loader2 } from 'lucide-react';
import { ChallengeService } from '../services';

const CHALLENGES = [
    {
        id: 1,
        title: 'Step Master 2024',
        description: 'Hit 10,000 steps daily for 30 days.',
        participants: 124,
        prize: 'Fitbit Charge 5',
        daysLeft: 14,
        progress: 65,
        status: 'Active',
        image: 'bg-rose-100 dark:bg-rose-900/20 text-rose-500',
        icon: Flame
    },
    {
        id: 2,
        title: 'Water Warrior',
        description: 'Drink 3 liters of water every day.',
        participants: 210,
        prize: '$50 HealthyEats Voucher',
        daysLeft: 5,
        progress: 80,
        status: 'Active',
        image: 'bg-blue-100 dark:bg-blue-900/20 text-blue-500',
        icon: Trophy
    },
    {
        id: 3,
        title: 'Zen Week',
        description: 'Complete 7 days of guided meditation.',
        participants: 45,
        prize: 'Calm Subscription',
        daysLeft: 0,
        progress: 0,
        status: 'Upcoming',
        image: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-500',
        icon: Crown
    },
];

const LEADERBOARD = [
    { rank: 1, name: 'Alex Johnson', points: 12500, avatar: 'AL' },
    { rank: 2, name: 'Maria Garcia', points: 11200, avatar: 'MA' },
    { rank: 3, name: 'David Kim', points: 10850, avatar: 'DA' },
    { rank: 4, name: 'Sarah Connor', points: 9500, avatar: 'SA' },
];

export default function WellnessChallengesPage() {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await ChallengeService.getChallenges();
                setChallenges(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-amber-500" />
                        Wellness Challenges
                    </h1>
                    <p className="text-slate-500 text-sm">Compete, stay active, and earn rewards together.</p>
                </div>
                <button className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20">
                    My Challenges
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {CHALLENGES.map(challenge => (
                        <div key={challenge.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                            {/* Background Decoration */}
                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none ${challenge.image.split(' ')[0]}`} />

                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${challenge.image}`}>
                                        <challenge.icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg">{challenge.title}</h3>
                                            {challenge.status === 'Active' && <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-bold uppercase rounded-full">Active</span>}
                                            {challenge.status === 'Upcoming' && <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase rounded-full">Starts Soon</span>}
                                        </div>
                                        <p className="text-slate-500 text-sm mb-3">{challenge.description}</p>

                                        <div className="flex gap-4 text-xs font-medium text-slate-400">
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {challenge.participants} Joined</span>
                                            <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> Prize: {challenge.prize}</span>
                                        </div>
                                    </div>
                                </div>

                                {challenge.status === 'Active' ? (
                                    <div className="text-right">
                                        <div className="text-2xl font-bold font-mono">{challenge.progress}%</div>
                                        <div className="text-xs text-slate-400">Complete</div>
                                    </div>
                                ) : (
                                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                        Join Waitlist
                                    </button>
                                )}
                            </div>

                            {challenge.status === 'Active' && (
                                <div className="mt-6">
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${challenge.image.split(' ')[2].replace('text', 'bg')} transition-all duration-1000`} style={{ width: `${challenge.progress}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Leaderboard */}
                <div>
                    <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl">
                        <h3 className="font-bold flex items-center gap-2 mb-6">
                            <Crown className="w-5 h-5 text-yellow-400" />
                            Leaderboard
                        </h3>
                        <div className="space-y-4">
                            {LEADERBOARD.map((user, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className={`font-bold font-mono w-6 text-center ${idx < 3 ? 'text-yellow-400' : 'text-slate-400'}`}>
                                        #{user.rank}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
                                        {user.avatar}
                                    </div>
                                    <div className="flex-1 font-medium text-sm">{user.name}</div>
                                    <div className="font-bold text-emerald-400 text-sm">{user.points.toLocaleString()} pts</div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 text-xs font-bold text-slate-400 hover:text-white transition-colors border-t border-white/10">
                            View Full Standings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
