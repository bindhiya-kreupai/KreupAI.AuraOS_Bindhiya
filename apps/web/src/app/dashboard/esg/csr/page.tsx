"use client";

import React from 'react';
import {
    Heart,
    Globe,
    Users,
    DollarSign,
    ArrowRight,
    Target,
    Loader2
} from 'lucide-react';
import { useESG } from '../hooks/useESG';

export default function CSRPage() {
    const { initiatives, loading, error } = useESG();

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center text-rose-500 font-bold">
                Error: {error}
            </div>
        );
    }

    const socialInitiatives = initiatives.filter(i => i.category === 'social');

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 overflow-y-auto pr-2">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Heart className="w-6 h-6 text-rose-500" />
                        CSR Initiatives
                    </h1>
                    <p className="text-slate-500 text-sm">Corporate Social Responsibility projects and community impact.</p>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-xl text-rose-700 dark:text-rose-400 text-sm font-bold border border-rose-100 dark:border-rose-800">
                    Budget Utilized: $450k / $1M
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 h-full min-h-0 pb-20">
                {socialInitiatives.map((proj, i) => (
                    <div key={proj.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-lg transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl">
                                {proj.category === 'social' ? '🤝' : '🌍'}
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                ${proj.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                    proj.status === 'planned' ? 'bg-slate-100 text-slate-500' :
                                        'bg-indigo-100 text-indigo-600'}
                            `}>
                                {proj.status.replace('_', ' ')}
                            </span>
                        </div>

                        <h3 className="font-bold text-lg mb-1 group-hover:text-indigo-600 transition-colors">{proj.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
                            <Globe className="w-3 h-3" /> Community
                        </div>

                        <div className="mt-auto">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <Target className="w-4 h-4 text-rose-500" />
                                    {proj.impact}
                                </div>
                            </div>

                            <div className="flex justify-between text-xs font-bold mb-1 text-slate-500">
                                <span>Progress</span>
                                <span>{proj.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${proj.progress}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}

                {socialInitiatives.length === 0 && (
                    <div className="col-span-full text-center py-20 text-slate-400">
                        No active CSR initiatives found.
                    </div>
                )}

                {/* New Project Card */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-80 hover:opacity-100 min-h-[300px]">
                    <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mb-3 shadow-sm">
                        <Users className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-slate-600 dark:text-slate-400">Propose New Initiative</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Submit a proposal for approval by the CSR committee.</p>
                </div>
            </div>
        </div>
    );
}


