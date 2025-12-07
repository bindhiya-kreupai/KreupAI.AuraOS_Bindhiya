"use client";

import React from 'react';
import {
    FileText,
    ShieldCheck,
    Download,
    Clock,
    Users,
    Search
} from 'lucide-react';

export default function RemotePolicyPage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-500" />
                        Remote Work Policies
                    </h1>
                    <p className="text-slate-500 text-sm">Guidelines and eligibility for remote and hybrid work.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: 'Global Remote Work Policy', desc: 'Standard guidelines for all remote employees including hours and conduct.', date: 'Updated 2 days ago', version: 'v2.4' },
                    { title: 'Home Office Stipend Policy', desc: 'Eligibility and claim process for equipment allowances.', date: 'Updated last week', version: 'v1.1' },
                    { title: 'IT Security for Remote Teams', desc: 'Required security protocols, VPN usage, and data handling.', date: 'Updated 1 month ago', version: 'v3.0' },
                    { title: 'Virtual Meeting Etiquette', desc: 'Best practices for Zoom/Teams calls and asynchronous communication.', date: 'Updated 3 months ago', version: 'v1.0' },
                    { title: 'Hybrid Work Guidelines', desc: 'Schedule coordination for employees splitting time between home and office.', date: 'Updated 2 weeks ago', version: 'v1.2' },
                    { title: 'Disconnection Policy', desc: 'Right to disconnect and guidelines for after-hours communication.', date: 'Updated yesterday', version: 'v1.0' }
                ].map((policy, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                <FileText className="w-5 h-5" />
                            </div>
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-500">{policy.version}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors">{policy.title}</h3>
                        <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">{policy.desc}</p>

                        <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {policy.date}
                            </div>
                            <button className="flex items-center gap-1 hover:text-indigo-500 font-bold transition-colors">
                                <Download className="w-3 h-3" /> PDF
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
                        <ShieldCheck className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-300">Policy Agreement Required</h3>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400">You have 1 pending policy acknowledgement.</p>
                    </div>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                    Review & Sign
                </button>
            </div>
        </div>
    );
}
