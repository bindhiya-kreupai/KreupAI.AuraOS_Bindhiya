// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
"use client";

import React, { useState, useEffect } from 'react';
import { CandidateApplicationService } from '../services';
import type { CandidateApplication } from '../types';
import {
    Filter,
    CheckSquare,
    XSquare,
    Users,
    MessageSquare,
    MoreHorizontal,
    Loader2
} from 'lucide-react';

function getCandidateName(candidate: CandidateApplication, index: number): string {
    const fullName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim();
    return fullName || (candidate as any).candidateName || `Candidate ${index + 1}`;
}

function getCandidateRole(candidate: CandidateApplication): string {
    return candidate.jobTitle || (candidate as any).positionAppliedFor || 'N/A';
}

function getMatchScore(candidate: CandidateApplication): number {
    return candidate.rating ? Math.round(candidate.rating * 20) : 0;
}

export default function CandidateScreeningPage() {
    const [candidates, setCandidates] = useState<CandidateApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ pending: 0, shortlisted: 0, rejected: 0 });

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const data = await CandidateApplicationService.getApplications({ status: 'screening' });
            setCandidates(data);

            // Calculate stats from real data
            const pending = data.filter((candidate: any) => !candidate.screeningStatus || candidate.screeningStatus === 'pending').length;
            const shortlisted = data.filter((candidate: any) => candidate.screeningStatus === 'shortlisted').length;
            const rejected = data.filter((candidate: any) => candidate.screeningStatus === 'rejected' || candidate.status === 'rejected').length;
            setStats({ pending, shortlisted, rejected });
        } catch (error: any) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShortlist = async (id: string) => {
        try {
            await CandidateApplicationService.updateApplication(id, { screeningStatus: 'shortlisted' });
            await fetchCandidates();
        } catch (error: any) {
            console.error('Error:', error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await CandidateApplicationService.updateApplication(id, { screeningStatus: 'rejected' });
            await fetchCandidates();
        } catch (error: any) {
            console.error('Error:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading candidates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Filter className="w-6 h-6 text-indigo-500" />
                        Candidate Screening
                    </h1>
                    <p className="text-slate-500 text-sm">Review initial applications and shortlist qualified candidates.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Queue Stats */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                    <div className="text-3xl font-black text-indigo-600">{stats.pending}</div>
                    <div className="text-sm font-bold text-indigo-800 dark:text-indigo-400">Pending Review</div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                    <div className="text-3xl font-black text-emerald-600">{stats.shortlisted}</div>
                    <div className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Shortlisted</div>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-2xl border border-rose-100 dark:border-rose-900/50">
                    <div className="text-3xl font-black text-rose-600">{stats.rejected}</div>
                    <div className="text-sm font-bold text-rose-800 dark:text-rose-400">Rejected</div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700">All Roles</button>
                    <button className="px-4 py-2 bg-white dark:bg-slate-900 rounded-lg text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-800">Engineering</button>
                    <button className="px-4 py-2 bg-white dark:bg-slate-900 rounded-lg text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-800">Sales</button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {candidates.length === 0 && (
                        <div className="p-12 text-center">
                            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">No candidates in screening</h3>
                            <p className="text-sm text-slate-400 dark:text-slate-500">Candidates will appear here when they move to the screening stage.</p>
                        </div>
                    )}
                    {candidates.map((candidate, i) => {
                        const name = getCandidateName(candidate, i);
                        const role = getCandidateRole(candidate);
                        const matchScore = getMatchScore(candidate);

                        return (
                            <div key={candidate.id || i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-500">
                                        {name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{name}</h3>
                                        <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                            <span>{role}</span>
                                            {candidate.source && (
                                                <>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                    <span>Source: {candidate.source}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-center">
                                        <div className={`text-xl font-black ${matchScore > 80 ? 'text-emerald-500' :
                                                matchScore > 50 ? 'text-amber-500' : 'text-rose-500'
                                            }`}>{matchScore}%</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg hover:border-indigo-500 hover:text-indigo-500 transition-colors" title="Message">
                                            <MessageSquare className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleShortlist(candidate.id)}
                                            className="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-emerald-200 transition-colors"
                                        >
                                            <CheckSquare className="w-4 h-4" /> Shortlist
                                        </button>
                                        <button
                                            onClick={() => handleReject(candidate.id)}
                                            className="px-4 py-2 bg-rose-100 text-rose-600 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-rose-200 transition-colors"
                                        >
                                            <XSquare className="w-4 h-4" /> Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

