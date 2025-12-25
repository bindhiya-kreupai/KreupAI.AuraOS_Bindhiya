"use client";

import React, { useState, useEffect } from 'react';
import { DevelopmentPlanService } from '../core/services';
import {
    Users,
    UserPlus,
    MessageCircle,
    Calendar,
    CheckCircle2,
    Search,
    Filter,
    MoreVertical
} from 'lucide-react';

const PROGRAMS = [
    { id: 1, name: 'Engineering Leaders 2024', activePairs: 12, duration: '6 Months', status: 'Active' },
    { id: 2, name: 'Onboarding Buddies', activePairs: 45, duration: 'Ongoing', status: 'Active' },
    { id: 3, name: 'Women in Tech 2024', activePairs: 8, duration: '12 Months', status: 'Draft' },
];

const PAIRS = [
    { id: 1, mentor: 'Alice Chen', mentee: 'David Kim', program: 'Engineering Leaders 2024', lastSession: '2 days ago', progress: 45 },
    { id: 2, mentor: 'Bob Smith', mentee: 'Sarah Jones', program: 'Onboarding Buddies', lastSession: '1 week ago', progress: 80 },
    { id: 3, mentor: 'Carol Williams', mentee: 'Mike Ross', program: 'Engineering Leaders 2024', lastSession: '1 month ago', progress: 10 },
];

export default function MentorshipPage() {
    const [activeTab, setActiveTab] = useState<'Overview' | 'Pairs'>('Overview');

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Mentorship Programs
                    </h1>
                    <p className="text-slate-500 text-sm">Facilitate professional growth through structured guidance.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <UserPlus className="w-4 h-4" /> New Program
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 w-fit">
                {['Overview', 'Pairs'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all
                            ${activeTab === tab
                                ? 'bg-white dark:bg-stellar-blue text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pb-20">
                {activeTab === 'Overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PROGRAMS.map(prog => (
                            <div key={prog.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${prog.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}
                                    `}>
                                        {prog.status}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg mb-2">{prog.name}</h3>
                                <div className="space-y-2 mb-6 text-sm text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" /> {prog.activePairs} Active Pairs
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> {prog.duration}
                                    </div>
                                </div>
                                <button className="w-full py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    Manage Program
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'Pairs' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-4">Mentor</th>
                                    <th className="p-4">Mentee</th>
                                    <th className="p-4">Program</th>
                                    <th className="p-4">Progress</th>
                                    <th className="p-4">Last Session</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {PAIRS.map(pair => (
                                    <tr key={pair.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 font-bold text-indigo-600 dark:text-indigo-400">{pair.mentor}</td>
                                        <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{pair.mentee}</td>
                                        <td className="p-4 text-slate-500">{pair.program}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 w-32">
                                                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pair.progress}%` }}></div>
                                                </div>
                                                <span className="text-xs text-slate-500">{pair.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-400 text-xs">{pair.lastSession}</td>
                                        <td className="p-4 text-right">
                                            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
