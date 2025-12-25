"use client";

import React, { useState, useEffect } from 'react';
import { CandidateApplicationService } from '../services';
import {
    Filter,
    CheckSquare,
    XSquare,
    Users,
    MessageSquare,
    MoreHorizontal
} from 'lucide-react';

export default function CandidateScreeningPage() {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ pending: 0, shortlisted: 0, rejected: 0 });

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const data = await CandidateApplicationService.getApplications({ status: 'screening' });
            setCandidates(data);

            // Calculate stats
            const pending = data.filter((c: any) => c.screeningStatus === 'pending').length;
            const shortlisted = data.filter((c: any) => c.screeningStatus === 'shortlisted').length;
            const rejected = data.filter((c: any) => c.screeningStatus === 'rejected').length;
            setStats({ pending, shortlisted, rejected });
        } catch (error) {
            console.error('Error fetching candidates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShortlist = async (id: string) => {
        try {
            await CandidateApplicationService.updateApplication(id, { screeningStatus: 'shortlisted' });
            await fetchCandidates();
        } catch (error) {
            console.error('Error shortlisting candidate:', error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await CandidateApplicationService.updateApplication(id, { screeningStatus: 'rejected' });
            await fetchCandidates();
        } catch (error) {
            console.error('Error rejecting candidate:', error);
        }
    };

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Filter className="w-6 h-6 text-indigo-500" />
                        Candidate Screening
                    </h1>
                    <p className="text-slate-500 text-sm">Review initial applications and shortlist qualified candidates.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Queue Stats */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                    <div className="text-3xl font-black text-indigo-600">42</div>
                    <div className="text-sm font-bold text-indigo-800 dark:text-indigo-400">Pending Review</div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                    <div className="text-3xl font-black text-emerald-600">18</div>
                    <div className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Shortlisted Today</div>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-2xl border border-rose-100 dark:border-rose-900/50">
                    <div className="text-3xl font-black text-rose-600">15</div>
                    <div className="text-sm font-bold text-rose-800 dark:text-rose-400">Auto-Rejected</div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700">All Roles</button>
                    <button className="px-4 py-2 bg-white dark:bg-slate-900 rounded-lg text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-800">Engineering</button>
                    <button className="px-4 py-2 bg-white dark:bg-slate-900 rounded-lg text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-800">Sales</button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                        { name: 'Michael Chen', role: 'Frontend Engineer', exp: '5 Yrs', match: '92%', status: 'New' },
                        { name: 'Sarah Miller', role: 'Product Manager', exp: '3 Yrs', match: '85%', status: 'New' },
                        { name: 'James Wilson', role: 'Frontend Engineer', exp: '2 Yrs', match: '45%', status: 'Low Match' },
                        { name: 'Emily Davis', role: 'UX Designer', exp: '4 Yrs', match: '78%', status: 'New' },
                    ].map((candidate, i) => (
                        <div key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-500">
                                    {candidate.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{candidate.name}</h3>
                                    <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                        <span>{candidate.role}</span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span>{candidate.exp} Experience</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className={`text-xl font-black ${parseInt(candidate.match) > 80 ? 'text-emerald-500' :
                                            parseInt(candidate.match) > 50 ? 'text-amber-500' : 'text-rose-500'
                                        }`}>{candidate.match}</div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400">AI Score</div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg hover:border-indigo-500 hover:text-indigo-500 transition-colors" title="Message">
                                        <MessageSquare className="w-5 h-5" />
                                    </button>
                                    <button className="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-emerald-200 transition-colors">
                                        <CheckSquare className="w-4 h-4" /> Shortlist
                                    </button>
                                    <button className="px-4 py-2 bg-rose-100 text-rose-600 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-rose-200 transition-colors">
                                        <XSquare className="w-4 h-4" /> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
