"use client";

import React, { useState, useEffect } from 'react';
import {
    Crown,
    Users,
    TrendingUp,
    Lightbulb,
    Target,
    MoreHorizontal,
    Briefcase,
    Loader2
} from 'lucide-react';
import { LearningPathService } from '../services';

export default function LeadershipPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await LearningPathService.getLearningPaths();
                setData(result);
            } catch (error) {
                console.error('Error:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const leadershipPaths = data.filter((p) =>
        p.title?.toLowerCase().includes('leader') ||
        p.category?.toLowerCase().includes('leader') ||
        p.skills?.some((s: string) => s.toLowerCase().includes('leader'))
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Crown className="w-6 h-6 text-amber-500" />
                        Leadership Development
                    </h1>
                    <p className="text-silver-mist text-sm">Manage succession planning, mentorship programs, and high-potential talent.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20">
                        <Users className="w-4 h-4" /> Add Successor
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-y-auto lg:overflow-visible">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-500" /> Learning Paths ({data.length})
                            </h3>
                        </div>

                        {data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                                <Crown className="w-10 h-10 mb-2 opacity-30" />
                                <p className="text-sm">No learning paths found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.map((path, idx) => (
                                    <div key={path.id || idx} className="border border-cloud dark:border-slate-800 rounded-xl p-4 flex justify-between items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        <div>
                                            <div className="font-bold text-ink-black dark:text-pearl">{path.title}</div>
                                            <div className="text-xs text-silver-mist">{path.description || `${path.difficulty || 'General'} level`}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-[10px] font-bold uppercase text-silver-mist">Completion</div>
                                                <div className="font-bold text-indigo-500">{path.completionRate || path.enrollmentCount || 0}%</div>
                                            </div>
                                            <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                                                <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-rose-500" /> Leadership Focus Paths
                        </h3>
                        {leadershipPaths.length === 0 ? (
                            <p className="text-sm text-silver-mist">No leadership-specific paths found. Create paths with leadership skills to see them here.</p>
                        ) : (
                            <div className="space-y-3">
                                {leadershipPaths.map((path) => (
                                    <div key={path.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm font-bold">
                                            {path.title.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-ink-black dark:text-pearl">{path.title}</div>
                                            <div className="text-xs text-silver-mist">{path.skills?.join(', ') || 'Leadership'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col">
                    <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" /> Quick Stats
                    </h3>

                    <div className="space-y-4 flex-1">
                        <div className="p-4 rounded-xl border border-cloud dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                            <div className="text-2xl font-bold text-indigo-500">{data.length}</div>
                            <div className="text-xs text-silver-mist">Total Learning Paths</div>
                        </div>
                        <div className="p-4 rounded-xl border border-cloud dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                            <div className="text-2xl font-bold text-amber-500">{leadershipPaths.length}</div>
                            <div className="text-xs text-silver-mist">Leadership Paths</div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl text-white shadow-lg">
                        <div className="flex items-center gap-2 mb-2 font-bold">
                            <Briefcase className="w-4 h-4" />
                            <span>Executive Track</span>
                        </div>
                        <p className="text-xs opacity-90 mb-3 leading-relaxed">
                            Launch a new cohort for emerging leaders focusing on strategic thinking and P&L management.
                        </p>
                        <button className="w-full py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors">
                            Launch Program
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
