"use client";

import React from 'react';
import {
    Briefcase,
    DollarSign,
    MapPin,
    Globe,
    Send,
    Bookmark,
    Building2
} from 'lucide-react';

export default function AlumniJobsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-emerald-500" />
                        Alumni Jobs
                    </h1>
                    <p className="text-slate-500 text-sm">Exclusive opportunities and Boomerang hiring program.</p>
                </div>
                <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20">
                    <Send className="w-4 h-4" /> Post a Job
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Job List */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    {[
                        { title: 'Senior Product Designer', company: 'Airbnb', loc: 'Remote', salary: '$160k - $220k', type: 'Full-time', posted: '2 days ago', source: 'Alumni Referral' },
                        { title: 'Director of Engineering', company: 'AuraOS (Boomerang)', loc: 'San Francisco', salary: 'Competitive', type: 'Full-time', posted: 'Today', source: 'Internal' },
                        { title: 'Growth Marketing Manager', company: 'Stripe', loc: 'Dublin', salary: '€80k - €120k', type: 'Contract', posted: '1 week ago', source: 'Alumni Referral' },
                    ].map((job, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-all group cursor-pointer relative overflow-hidden">
                            {job.source === 'Internal' && (
                                <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-500 text-white text-[10px] font-bold rounded-bl-xl">
                                    We Want You Back!
                                </div>
                            )}

                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-1 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                                    <div className="text-sm text-slate-500 font-bold mb-3">{job.company}</div>

                                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.loc}</span>
                                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {job.salary}</span>
                                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{job.type}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-between items-end">
                                    <button className="text-slate-400 hover:text-indigo-600">
                                        <Bookmark className="w-5 h-5" />
                                    </button>
                                    <div className="text-xs text-slate-400">{job.posted}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-indigo-600 text-white rounded-2xl p-6 shadow-lg shadow-indigo-500/20">
                        <h3 className="font-bold text-lg mb-2">Boomerang Program</h3>
                        <p className="text-xs opacity-80 mb-4">
                            Thinking of returning? Fast-track your application and restart your journey with us.
                        </p>
                        <button className="w-full py-2 bg-white text-indigo-600 rounded-xl text-xs font-bold">
                            Explore Internal Roles
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-emerald-500" /> Top Hiring Partners
                        </h3>
                        <div className="space-y-3">
                            {['Google', 'Microsoft', 'Spotify', 'Uber'].map(p => (
                                <div key={p} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800"></div>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{p}</span>
                                    </div>
                                    <span className="text-xs text-slate-500">3 Jobs</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
