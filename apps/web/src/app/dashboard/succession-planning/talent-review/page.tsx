"use client";

import React from 'react';
import { Users2, Calendar, CheckSquare, MoreVertical, Plus } from 'lucide-react';

const REVIEWS = [
    { id: 1, name: 'Q4 2024 Executive Calibration', date: 'Oct 25, 2024', status: 'Scheduled', facilitators: 'John Smith, Sarah Connor', completion: 0 },
    { id: 2, name: 'Engineering Leadership Review', date: 'Sep 15, 2024', status: 'Completed', facilitators: 'David Kim', completion: 100 },
    { id: 3, name: 'Sales & Marketing Talent Assessment', date: 'Nov 10, 2024', status: 'Draft', facilitators: 'TBD', completion: 0 },
];

export default function TalentReviewPage() {
    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <Users2 className="w-8 h-8 text-indigo-500" />
                        Talent Review
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Manage calibration cycles and talent assessment meetings.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                    <Plus className="w-5 h-5" /> Schedule Review
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {REVIEWS.map((review) => (
                    <div key={review.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{review.name}</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${review.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                                            review.status === 'Scheduled' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20' :
                                                'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                                        }`}>
                                        {review.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-6 text-sm text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> {review.date}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users2 className="w-4 h-4" /> {review.facilitators}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right min-w-[100px]">
                                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Completion</div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${review.completion === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                            style={{ width: `${review.completion}%` }}
                                        />
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 group-hover:text-indigo-600 transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {review.status === 'Scheduled' && (
                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                                <button className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 font-bold rounded-xl text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/20 flex items-center justify-center gap-2">
                                    <CheckSquare className="w-4 h-4" /> Prepare Materials
                                </button>
                                <button className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-2">
                                    View Participant List
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
