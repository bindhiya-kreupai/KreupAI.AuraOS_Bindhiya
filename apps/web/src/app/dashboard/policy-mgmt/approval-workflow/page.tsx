"use client";

import React from 'react';
import {
    GitPullRequest,
    CheckCircle2,
    XCircle,
    Clock,
    FileText
} from 'lucide-react';

export default function ApprovalWorkflowPage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GitPullRequest className="w-6 h-6 text-indigo-500" />
                        Approval Workflow
                    </h1>
                    <p className="text-slate-500 text-sm">Review pending policies and track approval history.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-slate-500 uppercase text-xs">Pending Review (3)</h3>
                    {[
                        { title: 'IT Acceptable Use Policy v2.0', author: 'Sarah Connor', date: 'Oct 24, 2025', status: 'Pending Legal' },
                        { title: 'Travel Expense Guidelines 2026', author: 'Mike Ross', date: 'Oct 23, 2025', status: 'Pending Finance' },
                        { title: 'Annual Leave Policy Amendment', author: 'John Doe', date: 'Oct 22, 2025', status: 'Pending HR Head' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 group hover:border-indigo-300 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                                        <div className="flex gap-4 text-xs text-slate-500">
                                            <span>Author: {item.author}</span>
                                            <span>Submitted: {item.date}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="bg-amber-100 text-amber-600 text-xs font-bold px-3 py-1 rounded-full">{item.status}</span>
                            </div>

                            <div className="flex items-center gap-3 pl-[3.5rem]">
                                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Approve
                                </button>
                                <button className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 border border-rose-200 dark:border-rose-900 rounded-lg text-sm font-bold hover:bg-rose-100 transition-colors flex items-center gap-2">
                                    <XCircle className="w-4 h-4" /> Reject
                                </button>
                                <button className="px-4 py-2 text-slate-500 text-sm font-bold hover:text-indigo-600">View Details</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-slate-500 uppercase text-xs mb-4">Approval Chain</h3>
                        <div className="relative pl-4 space-y-6 border-l-2 border-slate-100 dark:border-slate-800">
                            {[
                                { role: 'Policy Owner', status: 'Completed', time: '1d ago' },
                                { role: 'Department Head', status: 'Current', time: 'Now' },
                                { role: 'Compliance Officer', status: 'Pending', time: '-' },
                                { role: 'CEO / CHRO', status: 'Pending', time: '-' },
                            ].map((step, i) => (
                                <div key={i} className="relative pl-6">
                                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${step.status === 'Completed' ? 'bg-emerald-500' :
                                            step.status === 'Current' ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'
                                        }`}></div>
                                    <div className="text-sm font-bold">{step.role}</div>
                                    <div className="text-xs text-slate-400">{step.status} • {step.time}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
