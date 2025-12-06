"use client";

import React, { useState } from 'react';
import {
    Users,
    TrendingUp,
    Shield,
    AlertCircle,
    UserCheck,
    ChevronRight,
    MoreVertical
} from 'lucide-react';

const POOLS = [
    { id: 1, name: 'VP Engineering Successors', count: 5, readiness: 'High', gap: 'Low' },
    { id: 2, name: 'Sales Director Successors', count: 3, readiness: 'Medium', gap: 'Medium' },
    { id: 3, name: 'Product Head Successors', count: 2, readiness: 'Low', gap: 'High' },
];

const CANDIDATES = [
    { id: 1, name: 'Sarah Connor', role: 'Staff Engineer', readiness: 'Ready Now', potential: 'High' },
    { id: 2, name: 'Kyle Reese', role: 'Engineering Manager', readiness: 'Ready in 1-2 Years', potential: 'High' },
    { id: 3, name: 'John Doe', role: 'Senior Dev', readiness: 'Ready in 3-5 Years', potential: 'Medium' },
];

export default function SuccessionPoolsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Succession Pools
                    </h1>
                    <p className="text-slate-500 text-sm">Identify and groom talent for critical leadership roles.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Left: Pools List */}
                <div className="lg:col-span-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm bg-slate-50 dark:bg-slate-800/50">
                        Critical Roles
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {POOLS.map(pool => (
                            <div key={pool.id} className="p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all select-none group active:scale-95">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-sm text-indigo-900 dark:text-indigo-300">{pool.name}</h3>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                    <UserCheck className="w-3 h-3" /> {pool.count} Candidates
                                </div>
                                <div className="flex gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                        ${pool.readiness === 'High' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}
                                     `}>
                                        {pool.readiness} Readiness
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Pool Details */}
                <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-indigo-50 dark:bg-indigo-900/10 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-300">VP Engineering Successors</h2>
                            <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">Talent pipeline for executive leadership.</p>
                        </div>
                        <button className="px-4 py-2 bg-white dark:bg-slate-800 text-indigo-600 font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all">
                            Add Candidate
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-4">
                            {CANDIDATES.map(cand => (
                                <div key={cand.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 font-bold flex items-center justify-center">
                                            {cand.name.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="font-bold">{cand.name}</div>
                                            <div className="text-xs text-slate-500">{cand.role}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">Readiness</div>
                                            <div className={`text-sm font-bold ${cand.readiness === 'Ready Now' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {cand.readiness}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">Potential</div>
                                            <div className="text-sm font-bold text-indigo-600">{cand.potential}</div>
                                        </div>
                                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Gap Analysis */}
                        <div className="mt-8 p-4 border border-rose-200 bg-rose-50 dark:bg-rose-900/10 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-rose-700 dark:text-rose-400 text-sm">Pipeline Risk Alert</h4>
                                <p className="text-xs text-rose-600 dark:text-rose-300 mt-1">
                                    No "Ready Now" successors identified for diversity quota. Consider external mapping or accelerated grooming for high-potential female leaders.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
