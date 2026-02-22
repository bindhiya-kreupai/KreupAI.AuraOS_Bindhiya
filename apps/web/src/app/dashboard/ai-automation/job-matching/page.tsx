"use client";

import React, { useState, useEffect } from 'react';
import {
    GitMerge,
    User,
    Briefcase,
    Check,
    X,
    Star
} from 'lucide-react';
import { jobMatching } from '@/lib/services/ai-automation-client';

export default function JobMatchingPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const result = await jobMatching.getMatches();
            if (result.success) {
                setMatches(result.data?.matches || []);
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <GitMerge className="w-6 h-6 text-indigo-500" />
                        Internal Mobility Matcher
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Match existing employees to open roles to boost retention.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

                {/* Profile Card */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full mb-4 flex items-center justify-center">
                            <User className="w-10 h-10 text-slate-500" />
                        </div>
                        <h2 className="text-lg font-bold text-ink-black dark:text-pearl">Alex Johnson</h2>
                        <p className="text-sm text-silver-mist">Mid-Level Developer • 3 Years Tenure</p>

                        <div className="mt-6 w-full text-left space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-silver-mist uppercase mb-2">Top Skills</h4>
                                <div className="flex flex-wrap gap-1">
                                    {['React', 'Node.js', 'Mentoring', 'Agile'].map(s => (
                                        <span key={s} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs rounded font-medium">{s}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-silver-mist uppercase mb-2">Career Goal</h4>
                                <p className="text-sm text-slate-700 dark:text-slate-300 italic">"Transition into Product Management or Technical Leadership"</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Matches */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl">Open Opportunities</h2>

                    {matches.map((match, i) => (
                        <div key={i} className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative overflow-hidden">
                            {match.action === 'Recommended' && (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">
                                    Top Pick
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{match.role}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600">IT Department</span>
                                        <span className="text-xs text-silver-mist">• Remote</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className={`text-2xl font-bold ${match.match_score > 90 ? 'text-emerald-500' : match.match_score > 70 ? 'text-amber-500' : 'text-rose-500'}`}>
                                        {match.match_score}%
                                    </div>
                                    <div className="text-[10px] text-silver-mist uppercase font-bold">Fit Score</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <h4 className="text-xs font-bold text-emerald-600 mb-2 flex items-center gap-1"><Check className="w-3 h-3" /> Strengths</h4>
                                    <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
                                        {match.strengths.map(s => <li key={s}>{s}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-rose-500 mb-2 flex items-center gap-1"><X className="w-3 h-3" /> Gaps</h4>
                                    <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
                                        {match.gaps.map(s => <li key={s}>{s}</li>)}
                                    </ul>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-cloud dark:border-nebula-purple/20">
                                <button className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-sm hover:bg-indigo-100 transition-colors">
                                    Compare Side-by-Side
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

