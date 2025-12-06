"use client";

import React from 'react';
import {
    Users,
    Crown,
    TrendingUp,
    AlertTriangle,
    UserPlus,
    ArrowRight
} from 'lucide-react';

export default function TalentPoolsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-amber-500" />
                        Talent Pools
                    </h1>
                    <p className="text-slate-500 text-sm">Manage high-potential groups for succession and critical roles.</p>
                </div>
                <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20">
                    <UserPlus className="w-4 h-4" /> Create Pool
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
                {/* Pools List */}
                <div className="space-y-4 overflow-y-auto pb-20">
                    {[
                        { title: 'Executive Leadership Track', count: 12, ready: '4 Ready Now', risk: 'High Risk', color: 'bg-indigo-500' },
                        { title: 'Engineering Fellows', count: 25, ready: '8 Ready Now', risk: 'Stable', color: 'bg-emerald-500' },
                        { title: 'Global Sales Leads', count: 18, ready: '5 Ready Now', risk: 'Medium Risk', color: 'bg-purple-500' },
                        { title: 'Future Plant Managers', count: 8, ready: '1 Ready Now', risk: 'Critical', color: 'bg-rose-500' },
                    ].map((p, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all cursor-pointer group">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${p.color}`}></div>
                                    {p.title}
                                </h3>
                                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Pool Size</div>
                                    <div className="font-bold text-slate-700 dark:text-slate-300">{p.count}</div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Readiness</div>
                                    <div className="font-bold text-emerald-600">{p.ready}</div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Retention Risk</div>
                                    <div className={`font-bold ${p.risk.includes('High') || p.risk.includes('Critical') ? 'text-rose-500' : 'text-slate-600'}`}>{p.risk}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pool Detail View */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-600">
                            <Crown className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Executive Leadership Track</h2>
                            <p className="text-xs text-slate-500">Pipeline for C-Level and VP roles.</p>
                        </div>
                    </div>

                    <h3 className="font-bold text-sm text-slate-500 uppercase mb-4">Top Candidates</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto">
                        {[
                            { name: 'Sarah Connor', role: 'Dir. Operations', ready: 'Ready Now', gap: 'None', trend: 'up' },
                            { name: 'Kyle Reese', role: 'Head of Sales', ready: 'Ready in 1-2 Yrs', gap: 'Strategic Vision', trend: 'flat' },
                            { name: 'T-800', role: 'Chief Security', ready: 'Ready in 3+ Yrs', gap: 'People Mgmt', trend: 'up' },
                        ].map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-500 text-xs">
                                        {c.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{c.name}</div>
                                        <div className="text-xs text-slate-500">{c.role}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xs font-bold ${c.ready.includes('Now') ? 'text-emerald-600' : 'text-amber-600'}`}>{c.ready}</div>
                                    <div className="text-[10px] text-slate-400">Gap: {c.gap}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
