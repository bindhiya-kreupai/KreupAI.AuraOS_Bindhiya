"use client";

import React, { useState } from 'react';
import {
    Medal,
    Lock,
    Star,
    Shield
} from 'lucide-react';

export default function BadgesPage() {
    const badges = [
        { title: 'Early Riser', desc: 'Clock in before 8AM for 5 days', tier: 'Common', icon: Star, color: 'text-slate-400', bg: 'bg-slate-100', status: 'Unlocked' },
        { title: 'Bug Hunter', desc: 'Report 10 verified bugs', tier: 'Rare', icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-50', status: 'Unlocked' },
        { title: 'Innovation Champion', desc: 'Win a hackathon', tier: 'Legendary', icon: Medal, color: 'text-amber-500', bg: 'bg-amber-50', status: 'Locked', progress: 50 },
        { title: 'Team Player', desc: 'Receive 50 peer recognitions', tier: 'Epic', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50', status: 'Locked', progress: 80 },
    ];

    // Quick fix for missing icon import
    function Users(props: any) { return <Medal {...props} /> }

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Medal className="w-6 h-6 text-indigo-500" />
                        My Badges
                    </h1>
                    <p className="text-slate-500 text-sm">Collect badges to showcase your achievements.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {badges.map((badge, i) => {
                    const Icon = badge.icon;
                    const isLocked = badge.status === 'Locked';

                    return (
                        <div key={i} className={`relative p-6 rounded-2xl border ${isLocked ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50' : 'border-indigo-100 dark:border-indigo-900 bg-white dark:bg-slate-900 shadow-lg shadow-indigo-500/5'} flex flex-col items-center text-center group transition-all hover:-translate-y-1`}>
                            {isLocked && <div className="absolute top-4 right-4 text-slate-400"><Lock className="w-4 h-4" /></div>}

                            <div className={`w-20 h-20 rounded-full mb-4 flex items-center justify-center ${isLocked ? 'bg-slate-200 grayscale' : badge.bg}`}>
                                <Icon className={`w-10 h-10 ${isLocked ? 'text-slate-400' : badge.color}`} />
                            </div>

                            <h3 className={`font-bold text-lg mb-1 ${isLocked ? 'text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>{badge.title}</h3>
                            <span className={`text-[10px] font-bold uppercase tracking-wider mb-2 px-2 py-0.5 rounded ${isLocked ? 'bg-slate-200 text-slate-500' : badge.bg + ' ' + badge.color}`}>
                                {badge.tier}
                            </span>
                            <p className="text-xs text-slate-500 mb-4">{badge.desc}</p>

                            {isLocked && badge.progress && (
                                <div className="w-full mt-auto">
                                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                                        <span>Progress</span>
                                        <span>{badge.progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-400" style={{ width: `${badge.progress}%` }}></div>
                                    </div>
                                </div>
                            )}

                            {!isLocked && (
                                <div className="mt-auto text-xs font-bold text-emerald-600 flex items-center gap-1">
                                    Unlocked Jan 2024
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
