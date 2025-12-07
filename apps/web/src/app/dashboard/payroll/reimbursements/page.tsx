"use client";

import React from 'react';
import {
    Receipt,
    Check,
    X,
    Clock,
    Paperclip,
    Filter
} from 'lucide-react';

export default function ReimbursementsPage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Receipt className="w-6 h-6 text-indigo-500" />
                        Reimbursements
                    </h1>
                    <p className="text-slate-500 text-sm">Approve and process employee expense claims.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                        Submit Claim
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
                <button className="pb-3 px-2 text-indigo-600 font-bold border-b-2 border-indigo-600 text-sm">Pending Approval (4)</button>
                <button className="pb-3 px-2 text-slate-500 font-medium hover:text-slate-700 text-sm transition-colors">Approved</button>
                <button className="pb-3 px-2 text-slate-500 font-medium hover:text-slate-700 text-sm transition-colors">Rejected</button>
            </div>

            {/* Claims List */}
            <div className="space-y-4">
                {[
                    { type: 'Travel', amount: 450, desc: 'Flight to NYC for client meeting', date: '2 days ago', user: 'Sarah Connor' },
                    { type: 'Internet', amount: 50, desc: 'Monthly reimbursement', date: '1 day ago', user: 'Mike Ross' },
                    { type: 'Team Lunch', amount: 200, desc: 'Q3 Team Lunch', date: '3 hours ago', user: 'Jessica Pearson' },
                    { type: 'Software', amount: 120, desc: 'Adobe Creative Cloud License', date: 'Just now', user: 'Harvey Specter' },
                ].map((claim, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Receipt className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">{claim.type} - ${claim.amount}</h4>
                                <p className="text-sm text-slate-500">{claim.desc}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                    <span className="font-medium text-slate-600 dark:text-slate-300">{claim.user}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {claim.date}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-indigo-600 cursor-pointer hover:underline"><Paperclip className="w-3 h-3" /> View Receipt</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm font-bold border border-rose-100 hover:bg-rose-100 transition-colors flex items-center gap-2">
                                <X className="w-4 h-4" /> Reject
                            </button>
                            <button className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center gap-2">
                                <Check className="w-4 h-4" /> Approve
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
