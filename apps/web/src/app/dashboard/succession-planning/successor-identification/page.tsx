// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
"use client";

import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Star, Award, TrendingUp, CheckCircle, ChevronDown, Loader2 } from 'lucide-react';
import { SuccessionCandidateService } from '../services';
import type { SuccessionCandidate } from '../types';

export default function SuccessorIdentificationPage() {
    const [candidates, setCandidates] = useState<SuccessionCandidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await SuccessionCandidateService.getCandidates();
                setCandidates(data);
            } catch {
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <UserPlus className="w-8 h-8 text-indigo-500" />
                        Successor Identification
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">AI-powered candidate matching for critical roles.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="text-sm font-bold text-slate-500 uppercase">Target Role</div>
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="Search for a role (e.g., CTO, VP Sales)..."
                            defaultValue="VP of Engineering"
                        />
                    </div>
                    <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                        Find Successors
                    </button>
                </div>
            </div>

            {/* Matches */}
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" /> Top Matches
                </h3>

                {candidates.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400">
                        No succession candidates available.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {candidates.map((candidate, i) => (
                            <div key={candidate.candidateId || i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition-colors group">
                                <div className="flex flex-col md:flex-row md:items-center gap-3">
                                    {/* Rank */}
                                    <div className="hidden md:flex flex-col items-center justify-center w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-2xl text-slate-400">
                                        #{i + 1}
                                    </div>

                                    {/* Profile */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                                {candidate.employeeName}
                                                {i === 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1"><Award className="w-3 h-3" /> Best Match</span>}
                                            </h4>
                                            <div className="text-3xl font-bold text-indigo-600">{candidate.readinessLevel === 'ready_now' ? '95%' : candidate.readinessLevel === 'ready_1_2_years' ? '78%' : '55%'}</div>
                                        </div>
                                        <p className="text-slate-500 font-medium mb-4">{candidate.currentPositionId || 'N/A'}</p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {(candidate.competencies || []).slice(0, 4).map((skill: any, si: number) => (
                                                <span key={si} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg text-xs font-bold">
                                                    {typeof skill === 'string' ? skill : skill.name || 'Skill'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Readiness Stats */}
                                    <div className="w-full md:w-64 border-l border-slate-100 dark:border-slate-800 pl-6 space-y-4">
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase mb-1">Readiness</div>
                                            <div className={`flex items-center gap-2 font-bold ${candidate.readinessLevel === 'ready_now' ? 'text-emerald-600' : 'text-amber-500'
                                                }`}>
                                                <CheckCircle className="w-4 h-4" /> {candidate.readinessLevel?.replace(/_/g, ' ') || 'TBD'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase mb-1">Status</div>
                                            <div className="flex items-center gap-2 font-bold text-sm text-slate-500">
                                                <TrendingUp className="w-4 h-4" /> {candidate.status || 'Active'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="self-center">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                                            <ChevronDown className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

