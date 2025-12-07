"use client";

import React, { useState } from 'react';
import {
    Users,
    Target,
    BarChart2,
    ArrowUpRight,
    ShieldCheck,
    AlertTriangle,
    Clock,
    UserCheck,
    TrendingUp
} from 'lucide-react';

export default function SuccessionPoolPage() {
    const roles = [
        {
            id: 1,
            role: 'VP Engineering',
            incumbent: 'Sarah Connor',
            risk: 'High',
            successors: [
                { name: 'John Smith', readiness: 'Ready Now', fit: 95 },
                { name: 'Emily Chen', readiness: 'Ready in 1-2 Years', fit: 85 }
            ]
        },
        {
            id: 2,
            role: 'Head of Sales',
            incumbent: 'Mike Ross',
            risk: 'Medium',
            successors: [
                { name: 'Rachel Zane', readiness: 'Ready Now', fit: 92 },
            ]
        },
        {
            id: 3,
            role: 'Chief Product Officer',
            incumbent: 'James Cameron',
            risk: 'Low',
            successors: []
        }
    ];

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Target className="w-6 h-6 text-indigo-500" />
                        Succession Planning
                    </h1>
                    <p className="text-slate-500 text-sm">Identify critical roles and build talent pipelines.</p>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase">Succession Coverage</div>
                        <div className="text-2xl font-bold mt-1">68%</div>
                        <div className="text-xs text-indigo-500 font-bold flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3 h-3" /> +5% vs LY
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase">Critical Roles at Risk</div>
                        <div className="text-2xl font-bold mt-1 text-rose-600">3</div>
                        <div className="text-xs text-slate-400 mt-1">No identified successors</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase">Ready Now Band</div>
                        <div className="text-2xl font-bold mt-1">12</div>
                        <div className="text-xs text-slate-400 mt-1">Candidates ready immediately</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <UserCheck className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Detailed Rows */}
            <div className="grid gap-6">
                {roles.map(role => (
                    <div key={role.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-500 text-lg">
                                    {role.incumbent.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{role.role}</h3>
                                    <div className="text-sm text-slate-500">Incumbent: <span className="font-medium text-slate-900 dark:text-slate-100">{role.incumbent}</span></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-xs font-bold text-slate-500 uppercase">Retention Risk</div>
                                    <div className={`text-sm font-bold ${role.risk === 'High' ? 'text-rose-600' :
                                            role.risk === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                                        }`}>{role.risk}</div>
                                </div>
                                <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
                                    View Profile
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                            <h4 className="font-bold text-sm text-slate-500 uppercase mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Succession Pipeline
                            </h4>

                            {role.successors.length > 0 ? (
                                <div className="space-y-2">
                                    {role.successors.map((succ, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 font-bold text-xs">{succ.name.charAt(0)}</div>
                                                <div>
                                                    <div className="font-bold text-sm">{succ.name}</div>
                                                    <div className="text-xs text-slate-500">Current: Director</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Readiness</div>
                                                    <div className={`text-xs font-bold ${succ.readiness === 'Ready Now' ? 'text-emerald-600' : 'text-amber-500'}`}>
                                                        {succ.readiness}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Fit Score</div>
                                                    <div className="text-xs font-bold text-indigo-600">{succ.fit}%</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 text-sm gap-2">
                                    <AlertTriangle className="w-4 h-4" /> No successors identified yet.
                                    <button className="text-indigo-600 font-bold hover:underline">Launch Talent Search</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
