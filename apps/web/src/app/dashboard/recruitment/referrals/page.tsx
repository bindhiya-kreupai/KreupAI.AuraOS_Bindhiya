"use client";

import React, { useState, useEffect } from 'react';
import { CandidateApplicationService, JobPostingService } from '../services';
import {
    Gift,
    Briefcase,
    Users,
    Search,
    Copy,
    Share2,
    CheckCircle2,
    Clock,
    DollarSign,
    Target,
    ArrowRight,
    Sparkles,
    UserPlus,
    Linkedin,
    Twitter
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- MOCK DATA ---

const REFERRAL_STATS = {
    totalEarned: 1500,
    pendingBonus: 500,
    successfulHires: 3,
    activeProcess: 2
};

const HOT_JOBS = [
    { id: 1, title: 'Senior React Developer', department: 'Engineering', location: 'Remote', bonus: 2000, urgency: 'High' },
    { id: 2, title: 'Product Manager - AI', department: 'Product', location: 'New York', bonus: 2500, urgency: 'Critical' },
    { id: 3, title: 'UX Designer', department: 'Design', location: 'London', bonus: 1500, urgency: 'Medium' },
    { id: 4, title: 'DevOps Engineer', department: 'Engineering', location: 'Remote', bonus: 1800, urgency: 'High' },
];

const MY_REFERRALS = [
    {
        id: 1,
        candidate: 'John Doe',
        role: 'Senior React Developer',
        date: 'Oct 24, 2025',
        status: 'Interviewing',
        progress: 60,
        timeline: [
            { stage: 'Applied', status: 'completed', date: 'Oct 24' },
            { stage: 'Screening', status: 'completed', date: 'Oct 26' },
            { stage: 'Interview', status: 'current', date: 'In Progress' },
            { stage: 'Offer', status: 'pending', date: '-' }
        ]
    },
    {
        id: 2,
        candidate: 'Jane Smith',
        role: 'UX Designer',
        date: 'Nov 10, 2025',
        status: 'Screening',
        progress: 25,
        timeline: [
            { stage: 'Applied', status: 'completed', date: 'Nov 10' },
            { stage: 'Screening', status: 'current', date: 'In Progress' },
            { stage: 'Interview', status: 'pending', date: '-' },
            { stage: 'Offer', status: 'pending', date: '-' }
        ]
    },
    {
        id: 3,
        candidate: 'Robert Wilson',
        role: 'Marketing Lead',
        date: 'Sep 15, 2025',
        status: 'Hired',
        progress: 100,
        timeline: [
            { stage: 'Applied', status: 'completed', date: 'Sep 15' },
            { stage: 'Screening', status: 'completed', date: 'Sep 18' },
            { stage: 'Interview', status: 'completed', date: 'Sep 25' },
            { stage: 'Offer', status: 'completed', date: 'Oct 01' }
        ]
    }
];

export default function ReferralsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [jobs, setJobs] = useState<any[]>(HOT_JOBS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHotJobs();
    }, []);

    const fetchHotJobs = async () => {
        try {
            setLoading(true);
            const data = await JobPostingService.getPostings({ isActive: true });
            if (data && data.length > 0) {
                setJobs(data);
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-y-auto lg:overflow-visible">
                {/* Left: Stats & My Referrals */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Bonus Wallet Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <DollarSign className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 font-bold opacity-80 mb-4">
                                <Sparkles className="w-4 h-4 text-emerald-300" /> Referral Wallet
                            </div>
                            <div className="flex items-end gap-2 mb-1">
                                <span className="text-4xl font-bold">${REFERRAL_STATS.totalEarned}</span>
                                <span className="text-sm font-bold opacity-80 mb-1.5">Earned</span>
                            </div>
                            <div className="text-xs opacity-70 mb-6">Total payouts received to date</div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                                <div>
                                    <div className="text-xl font-bold text-emerald-300">${REFERRAL_STATS.pendingBonus}</div>
                                    <div className="text-[10px] font-bold uppercase opacity-60">Pending</div>
                                </div>
                                <div>
                                    <div className="text-xl font-bold">{REFERRAL_STATS.successfulHires}</div>
                                    <div className="text-[10px] font-bold uppercase opacity-60">Friends Hired</div>
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
                            {MY_REFERRALS.map(ref => (
                                <div key={ref.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="font-bold text-ink-black dark:text-pearl">{ref.candidate}</div>
                                            <div className="text-xs text-silver-mist">{ref.role}</div>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded
                                            ${ref.status === 'Hired' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                ref.status === 'Offer' ? 'bg-indigo-100 text-indigo-600' :
                                                    'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'}
                                        `}>
                                            {ref.status}
                                        </span>
                                    </div>

                                    {/* Timeline Steps */}
                                    <div className="flex items-center justify-between relative mt-4">
                                        {/* Connecting Line */}
                                        <div className="absolute top-1.5 left-0 w-full h-0.5 bg-cloud dark:bg-slate-700 -z-0"></div>

                                        {ref.timeline.map((step, idx) => (
                                            <div key={idx} className="flex flex-col items-center relative z-10 gap-1">
                                                <div className={`w-3 h-3 rounded-full border-2 
                                                    ${step.status === 'completed' ? 'bg-emerald-500 border-emerald-500' :
                                                        step.status === 'current' ? 'bg-white dark:bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/20' :
                                                            'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}
                                                `}></div>
                                                <span className={`text-[9px] font-bold ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>{step.stage}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:text-indigo-500 flex items-center justify-center gap-1">
                            View All Referrals <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* Right: Hot Jobs */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col h-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                    <Target className="w-5 h-5 text-rose-500" /> Hot Opportunities
                                </h3>
                                <p className="text-xs text-silver-mist mt-1">High priority roles with boosted bonuses.</p>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {jobs.map(job => (
                                <div key={job.id} className="p-5 border border-cloud dark:border-slate-800 rounded-xl hover:border-indigo-300 hover:shadow-lg dark:hover:border-indigo-500/50 hover:-translate-y-1 transition-all bg-white dark:bg-slate-900/40 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                                            <Briefcase className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        {job.urgency === 'Critical' && (
                                            <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 px-2 py-1 rounded flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" /> Urgently Hiring
                                            </span>
                                        )}
                                    </div>

                                    <h4 className="font-bold text-ink-black dark:text-pearl mb-1">{job.title}</h4>
                                    <div className="flex text-xs text-silver-mist gap-2 mb-4">
                                        <span>{job.department}</span>
                                        <span>•</span>
                                        <span>{job.location}</span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-4 p-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-lg w-fit">
                                        <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Bonus: ${job.bonus}</span>
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
