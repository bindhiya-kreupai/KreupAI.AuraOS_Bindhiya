"use client";

import React, { useState } from 'react';
import {
    DoorOpen,
    PieChart,
    MessageSquare,
    ThumbsDown,
    ThumbsUp,
    AlertCircle,
    ArrowRight,
    Users,
    Search,
    Filter,
    Briefcase,
    DollarSign,
    UserX
} from 'lucide-react';
import {
    PieChart as RePieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';

// --- MOCK DATA ---

const ATTRITION_REASONS = [
    { name: 'Better Opportunity', value: 45, color: '#6366f1' },
    { name: 'Compensation', value: 25, color: '#10b981' },
    { name: 'Management', value: 15, color: '#f59e0b' },
    { name: 'Personal', value: 10, color: '#ec4899' },
    { name: 'Relocation', value: 5, color: '#64748b' },
];

const EXIT_INTERVIEWS = [
    {
        id: 'EX-042',
        employee: 'Sarah Jenkins',
        role: 'Senior FE Developer',
        dept: 'Engineering',
        date: '2025-11-28',
        reason: 'Better Opportunity',
        sentiment: 'Neutral',
        rehire: true,
        feedback: 'Great team culture, but I received an offer with 40% hike that I couldn\'t refuse. The learning curve was good initially but stagnated recently.'
    },
    {
        id: 'EX-043',
        employee: 'Michael Chen',
        role: 'Sales Executive',
        dept: 'Sales',
        date: '2025-11-25',
        reason: 'Management',
        sentiment: 'Negative',
        rehire: false,
        feedback: 'Felt micro-managed by the new lead. Targets were unrealistic and changed weekly without notice. Environment became too competitive.'
    },
    {
        id: 'EX-044',
        employee: 'Priya Patel',
        role: 'UX Designer',
        dept: 'Product',
        date: '2025-11-20',
        reason: 'Compensation',
        sentiment: 'Positive',
        rehire: true,
        feedback: 'Loved the work and the people. Unfortunately, the salary bands are below market average for my experience level. Would love to return if that changes.'
    }
];

export default function ExitInterviewsPage() {
    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <DoorOpen className="w-6 h-6 text-rose-500" />
                        Exit Interviews
                    </h1>
                    <p className="text-silver-mist text-sm">Analyze attrition drivers and departure feedback.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-rose-500/20">
                        Download Report
                    </button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-silver-mist uppercase">Exit Count (Nov)</div>
                        <UserX className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-3xl font-bold text-ink-black dark:text-pearl">12</div>
                    <div className="text-xs text-rose-500 mt-1 font-bold">+2 vs last month</div>
                </div>

                <div className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-silver-mist uppercase">Avg Tenure</div>
                        <Briefcase className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="text-3xl font-bold text-ink-black dark:text-pearl">2.4 <span className="text-base font-normal text-slate-400">yrs</span></div>
                    <div className="text-xs text-indigo-500 mt-1 font-bold">-0.3 vs last year</div>
                </div>

                <div className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-silver-mist uppercase">Regrettable Loss</div>
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-3xl font-bold text-ink-black dark:text-pearl">45%</div>
                    <div className="text-xs text-slate-400 mt-1">High performers leaving</div>
                </div>

                <div className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-silver-mist uppercase">Rehire Eligible</div>
                        <ThumbsUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-bold text-ink-black dark:text-pearl">68%</div>
                    <div className="text-xs text-emerald-500 mt-1 font-bold">Good terms</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Attrition Chart */}
                <div className="lg:col-span-1 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col">
                    <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-indigo-500" /> Reasons for Leaving
                    </h3>
                    <div className="flex-1 min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={ATTRITION_REASONS}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {ATTRITION_REASONS.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                            </RePieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                            <div className="text-2xl font-black text-ink-black dark:text-pearl">Q4</div>
                            <div className="text-[10px] uppercase text-silver-mist font-bold">Analysis</div>
                        </div>
                    </div>
                </div>

                {/* Right: Recent Interviews */}
                <div className="lg:col-span-2 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-500" /> Recent Feedback
                        </h3>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search feedback..."
                                className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {EXIT_INTERVIEWS.map((interview, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-slate-50/50 dark:bg-slate-900/20 hover:border-indigo-200 transition-colors group">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                            {interview.employee.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-ink-black dark:text-pearl text-sm">{interview.employee}</div>
                                            <div className="text-xs text-silver-mist">{interview.role} • {interview.dept}</div>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase
                                        ${interview.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                            interview.sentiment === 'Negative' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                                                'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                                        }`
                                    }>
                                        {interview.sentiment} Feedback
                                    </div>
                                </div>

                                <div className="pl-13 ml-13">
                                    <div className="relative bg-white dark:bg-slate-800 p-3 rounded-lg border border-cloud dark:border-slate-700">
                                        <div className="absolute -left-2 top-4 w-4 h-4 bg-white dark:bg-slate-800 border-l border-b border-cloud dark:border-slate-700 transform rotate-45"></div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">"{interview.feedback}"</p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 text-[10px] text-silver-mist font-bold uppercase">
                                        <span className="flex items-center gap-1">
                                            <UserX className="w-3 h-3" /> Reason: {interview.reason}
                                        </span>
                                        <span className={`flex items-center gap-1 ${interview.rehire ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {interview.rehire ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
                                            Rehire: {interview.rehire ? 'Yes' : 'No'}
                                        </span>
                                        <span className="ml-auto flex items-center gap-1 text-indigo-500 cursor-pointer hover:underline">
                                            Full Report <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
