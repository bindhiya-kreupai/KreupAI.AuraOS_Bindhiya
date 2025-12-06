"use client";

import React, { useState } from 'react';
import {
    CheckCircle2,
    Clock,
    UserCheck,
    FileText
} from 'lucide-react';

export default function ApprovalWorkflowPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-indigo-500" />
                        Budget Approvals
                    </h1>
                    <p className="text-slate-500 text-sm">Review and approve department budget requests.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                        { title: 'Q2 Engineering Equipment', dept: 'Engineering', amount: '$45,000', reqBy: 'Sarah Connor', status: 'Pending' },
                        { title: 'Sales Offsite Event', dept: 'Sales', amount: '$12,000', reqBy: 'Kyle Reese', status: 'Reviewing' },
                        { title: 'Recruitment Agency Fee', dept: 'HR', amount: '$8,500', reqBy: 'John Doe', status: 'Approved' },
                    ].map((req, i) => (
                        <div key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
                                        req.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
                                    }`}>
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{req.title}</h3>
                                    <div className="text-sm text-slate-500 flex gap-4">
                                        <span>{req.dept}</span>
                                        <span>•</span>
                                        <span>Req: {req.reqBy}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="font-bold text-lg">{req.amount}</div>
                                    <div className={`text-xs font-bold ${req.status === 'Approved' ? 'text-emerald-500' :
                                            req.status === 'Pending' ? 'text-amber-500' : 'text-indigo-500'
                                        }`}>{req.status}</div>
                                </div>

                                {req.status !== 'Approved' && (
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold text-sm hover:bg-emerald-600">Approve</button>
                                        <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-200">Reject</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
