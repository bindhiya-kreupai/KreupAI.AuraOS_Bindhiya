"use client";

import React, { useState } from 'react';
import {
    Briefcase,
    Building2,
    MapPin,
    ArrowUpRight
} from 'lucide-react';

export default function AlumniJobsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-indigo-500" />
                        Alumni Jobs
                    </h1>
                    <p className="text-slate-500 text-sm">Exclusive opportunities shared by the alumni network.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4" /> Post a Job
                </button>
            </div>

            <div className="space-y-4">
                {[
                    { title: 'Senior VP of Engineering', company: 'FutureTech', loc: 'San Francisco, CA', type: 'Full-time', posted: '2 days ago', alum: 'Shared by Alice Chen' },
                    { title: 'Product Design Lead', company: 'Creative Studio', loc: 'Remote', type: 'Contract', posted: '5 days ago', alum: 'Shared by Bob Wilson' },
                    { title: 'Head of People', company: 'GrowFast', loc: 'London, UK', type: 'Full-time', posted: '1 week ago', alum: 'Shared by Charlie Davis' },
                ].map((job, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
                                    <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{job.company}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.loc}</span>
                                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold uppercase">{job.type}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-indigo-500">{job.posted}</div>
                                <div className="text-xs text-slate-400 mt-1">{job.alum}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
