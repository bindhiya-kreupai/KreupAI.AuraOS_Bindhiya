"use client";

import React from 'react';
import {
    Briefcase,
    MapPin,
    Building2,
    DollarSign,
    ArrowRight
} from 'lucide-react';

export default function InternalMobilityPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-indigo-500" />
                        Internal Mobility
                    </h1>
                    <p className="text-slate-500 text-sm">Explore open roles within the organization.</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                        My Applications (2)
                    </button>
                </div>
            </div>

            {/* Suggestions */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shrink-0">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" /> Recommended for You
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { title: 'Tech Lead', dept: 'Platform Engineering', loc: 'Remote', match: '95%' },
                        { title: 'Product Manager', dept: 'Growth', loc: 'New York', match: '88%' },
                        { title: 'Sol. Architect', dept: 'Professional Svs', loc: 'London', match: '82%' },
                    ].map((job, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors cursor-pointer group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-emerald-400/20 text-emerald-200 text-xs font-bold px-2 py-0.5 rounded">
                                    {job.match} Match
                                </span>
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </div>
                            <div className="font-bold text-lg leading-tight mb-1">{job.title}</div>
                            <div className="text-sm text-indigo-100 opacity-80">{job.dept} • {job.loc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Job Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-20">
                {[
                    { title: 'Senior UX Designer', dept: 'Design', loc: 'San Francisco', date: 'Posted 2d ago', type: 'Full-time' },
                    { title: 'Backend Engineer (Go)', dept: 'Infrastructure', loc: 'Remote', date: 'Posted 3d ago', type: 'Full-time' },
                    { title: 'Marketing Lead', dept: 'Marketing', loc: 'London', date: 'Posted 5d ago', type: 'Full-time' },
                    { title: 'Data Scientist', dept: 'AI Research', loc: 'Toronto', date: 'Posted 1w ago', type: 'Full-time' },
                    { title: 'HR Business Partner', dept: 'People', loc: 'New York', date: 'Posted 1w ago', type: 'Contract' },
                    { title: 'Security Analyst', dept: 'InfoSec', loc: 'Remote', date: 'Posted 2w ago', type: 'Full-time' }
                ].map((job, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-indigo-500 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                                <p className="text-slate-500">{job.dept}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <Briefcase className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" /> {job.loc}
                            </span>
                            <span className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" /> {job.type}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-xs font-bold text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <span>{job.date}</span>
                            <span className="uppercase tracking-wider">View Details</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
