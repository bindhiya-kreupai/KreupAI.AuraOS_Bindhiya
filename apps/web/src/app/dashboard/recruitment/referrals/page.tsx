"use client";

import React, { useState, useEffect } from 'react';
import { CandidateApplicationService, JobPostingService } from '../services';
import type { CandidateApplication, JobPosting } from '../types';
import {
    Gift,
    Briefcase,
    Users,
    Search,
    Copy,
    DollarSign,
    Target,
    ArrowRight,
    Sparkles,
    UserPlus,
    Linkedin,
    Twitter,
    Loader2
} from 'lucide-react';

export default function ReferralsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [referrals, setReferrals] = useState<CandidateApplication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [jobsData, applicationsData] = await Promise.all([
                JobPostingService.getPostings({ isActive: true }),
                CandidateApplicationService.getApplications(),
            ]);

            setJobs(jobsData);
            // Filter applications that were sourced via referral
            const referralApps = applicationsData.filter((app: any) =>
                app.source?.toLowerCase() === 'referral'
            );
            setReferrals(referralApps);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getReferralStats = () => {
        const hired = referrals.filter((r) => r.status === 'hired' || r.currentStage === 'hired').length;
        const active = referrals.filter((r) => !['hired', 'rejected'].includes(r.status)).length;
        return {
            totalReferrals: referrals.length,
            successfulHires: hired,
            activeProcess: active,
        };
    };

    const stats = getReferralStats();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading referrals...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Gift className="w-6 h-6 text-rose-500" />
                        Refer & Earn
                    </h1>
                    <p className="text-silver-mist text-sm">Help us grow the team and earn exciting bonuses.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20">
                        <UserPlus className="w-4 h-4" /> Refer a Friend
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-y-auto lg:overflow-visible">
                {/* Left: Stats & My Referrals */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Referral Stats Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <DollarSign className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 font-bold opacity-80 mb-4">
                                <Sparkles className="w-4 h-4 text-emerald-300" /> Referral Summary
                            </div>
                            <div className="flex items-end gap-2 mb-1">
                                <span className="text-4xl font-bold">{stats.totalReferrals}</span>
                                <span className="text-sm font-bold opacity-80 mb-1.5">Referrals</span>
                            </div>
                            <div className="text-xs opacity-70 mb-6">Total referrals submitted</div>

                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20">
                                <div>
                                    <div className="text-xl font-bold text-emerald-300">{stats.activeProcess}</div>
                                    <div className="text-[10px] font-bold uppercase opacity-60">Active</div>
                                </div>
                                <div>
                                    <div className="text-xl font-bold">{stats.successfulHires}</div>
                                    <div className="text-[10px] font-bold uppercase opacity-60">Hired</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* My Referrals List */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" /> My Referrals
                        </h3>

                        <div className="space-y-4">
                            {referrals.length === 0 && (
                                <div className="text-center py-8 text-slate-400">
                                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-xs">No referrals yet. Refer a friend to get started.</p>
                                </div>
                            )}
                            {referrals.map((ref) => {
                                const name = `${ref.firstName || ''} ${ref.lastName || ''}`.trim() || 'Unknown';
                                const role = ref.jobTitle || 'N/A';
                                const status = ref.status || ref.currentStage || 'applied';
                                const statusLabel = status === 'hired' ? 'Hired' :
                                    status === 'offer' ? 'Offer' :
                                        status === 'interview' ? 'Interviewing' :
                                            status === 'screening' ? 'Screening' : 'Applied';

                                return (
                                    <div key={ref.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="font-bold text-ink-black dark:text-pearl">{name}</div>
                                                <div className="text-xs text-silver-mist">{role}</div>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded
                                                ${statusLabel === 'Hired' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                    statusLabel === 'Offer' ? 'bg-indigo-100 text-indigo-600' :
                                                        'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'}
                                            `}>
                                                {statusLabel}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            Applied: {ref.appliedDate ? new Date(ref.appliedDate).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {referrals.length > 0 && (
                            <button className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:text-indigo-500 flex items-center justify-center gap-1">
                                View All Referrals <ArrowRight className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: Hot Jobs */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col h-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                            <div>
                                <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                    <Target className="w-5 h-5 text-rose-500" /> Open Opportunities
                                </h3>
                                <p className="text-xs text-silver-mist mt-1">Refer candidates for these open positions.</p>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder="Search roles..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-slate-800 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors"
                                />
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {jobs.length === 0 && (
                                <div className="col-span-full text-center py-12 text-slate-400">
                                    <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No open positions available for referrals.</p>
                                </div>
                            )}
                            {jobs.filter(job => {
                                if (!searchTerm) return true;
                                const term = searchTerm.toLowerCase();
                                return (job.jobTitle || '').toLowerCase().includes(term) ||
                                    (job.departmentName || '').toLowerCase().includes(term) ||
                                    (job.locationName || '').toLowerCase().includes(term);
                            }).map((job) => (
                                <div key={job.id} className="p-5 border border-cloud dark:border-slate-800 rounded-xl hover:border-indigo-300 hover:shadow-lg dark:hover:border-indigo-500/50 hover:-translate-y-1 transition-all bg-white dark:bg-slate-900/40 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                                            <Briefcase className="w-5 h-5 text-indigo-500" />
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-ink-black dark:text-pearl mb-1">{job.jobTitle}</h4>
                                    <div className="flex text-xs text-silver-mist gap-2 mb-4">
                                        <span>{job.departmentName}</span>
                                        <span>-</span>
                                        <span>{job.locationName}</span>
                                    </div>

                                    <div className="flex gap-2 mt-auto">
                                        <button className="flex-1 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
                                            Refer Now
                                        </button>
                                        <div className="flex gap-1">
                                            <button className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-cloud dark:border-slate-700 hover:text-[#0077b5] rounded-lg text-slate-400 transition-colors">
                                                <Linkedin className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-cloud dark:border-slate-700 hover:text-[black] dark:hover:text-white rounded-lg text-slate-400 transition-colors">
                                                <Twitter className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-cloud dark:border-slate-700 hover:text-indigo-500 rounded-lg text-slate-400 transition-colors">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

