"use client";

import React, { useState } from 'react';
import {
    Map,
    CheckSquare,
    Gift,
    Lock
} from 'lucide-react';

export default function MissionsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Map className="w-6 h-6 text-indigo-500" />
                        Daily Missions
                    </h1>
                    <p className="text-slate-500 text-sm">Complete tasks to earn streak bonuses.</p>
                </div>
            </div>

            {/* Streak Banner */}
            <div className="bg-indigo-600 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-indigo-600/20">
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold">5</div>
                        <div className="text-[10px] uppercase font-bold text-indigo-200">Day Streak</div>
                    </div>
                    <div className="h-10 w-px bg-indigo-400/50"></div>
                    <div>
                        <div className="font-bold">You're on fire! 🔥</div>
                        <div className="text-sm text-indigo-100">Complete today's missions to keep the streak alive.</div>
                    </div>
                </div>
                <div className="hidden md:flex gap-2">
                    {[1, 2, 3, 4, 5].map(d => (
                        <div key={d} className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center text-emerald-900 font-bold text-xs ring-2 ring-indigo-500">
                            ✓
                        </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs border-2 border-white/50 border-dashed">
                        6
                    </div>
                </div>
            </div>

            {/* Missions List */}
            <div className="space-y-4">
                {[
                    { title: 'Update Profile Picture', reward: '50 XP', status: 'Completed' },
                    { title: 'React to a Social Post', reward: '20 XP', status: 'Pending' },
                    { title: 'Submit Weekly Timesheet', reward: '100 XP', status: 'Locked' },
                ].map((m, i) => (
                    <div key={i} className={`flex items-center justify-between p-5 rounded-2xl border ${m.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.status === 'Completed' ? 'bg-emerald-500 text-white' :
                                    m.status === 'Locked' ? 'bg-slate-200 text-slate-400' : 'border-2 border-slate-300'
                                }`}>
                                {m.status === 'Completed' ? <CheckSquare className="w-4 h-4" /> : m.status === 'Locked' ? <Lock className="w-4 h-4" /> : null}
                            </div>
                            <div className={m.status === 'Completed' ? 'opacity-50 line-through' : ''}>
                                <h4 className="font-bold">{m.title}</h4>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-amber-500">
                            <Gift className="w-4 h-4" /> {m.reward}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
