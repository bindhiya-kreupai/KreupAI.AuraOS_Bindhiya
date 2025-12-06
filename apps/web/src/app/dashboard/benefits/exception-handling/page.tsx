"use client";

import React from 'react';
import {
    Gavel,
    AlertOctagon,
    Check,
    X,
    MessageSquare
} from 'lucide-react';

export default function ExceptionHandlingPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Gavel className="w-6 h-6 text-indigo-500" />
                        Exception Requests
                    </h1>
                    <p className="text-slate-500 text-sm">Review appeals for late enrollment or special coverage.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-20">
                {[
                    { id: 'EX-009', user: 'Michael Scott', type: 'Late Enrollment', reason: 'Hospitalized during window', status: 'Pending', date: '2 hours ago' },
                    { id: 'EX-008', user: 'Pam Beesly', type: 'Dependent Add', reason: 'Birth of child (Life Event)', status: 'Approved', date: 'Yesterday' },
                    { id: 'EX-007', user: 'Jim Halpert', type: 'Plan Upgrade', reason: 'Missed deadline by 1 day', status: 'Rejected', date: 'Oct 20, 2024' },
                ].map((req, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                {req.user.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg">{req.type}</h3>
                                    <span className="text-xs text-slate-400">• {req.id}</span>
                                </div>
                                <div className="text-sm font-bold text-indigo-600 mb-2">{req.user}</div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 italic">
                                    "{req.reason}"
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between items-end border-l border-slate-100 dark:border-slate-800 pl-6 min-w-[150px]">
                            <span className="text-xs text-slate-400 font-bold">{req.date}</span>

                            {req.status === 'Pending' ? (
                                <div className="flex gap-2">
                                    <button className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 border border-emerald-100">
                                        <Check className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 border border-rose-100">
                                        <X className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 border border-slate-200">
                                        <MessageSquare className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                                    ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                    {req.status}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
