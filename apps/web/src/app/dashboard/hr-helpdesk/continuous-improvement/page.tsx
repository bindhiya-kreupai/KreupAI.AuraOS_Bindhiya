"use client";

import React, { useState } from 'react';
import {
    RefreshCw,
    TrendingUp,
    Lightbulb
} from 'lucide-react';

export default function ContinuousImprovementPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <RefreshCw className="w-6 h-6 text-indigo-500" />
                        Continuous Improvement
                    </h1>
                    <p className="text-slate-500 text-sm">Feedback loops and process optimization initiatives.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Improvement Opportunities */}
                <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" /> Improvement Opportunities
                    </h3>
                    <div className="space-y-4">
                        {[
                            { title: 'Simplify Travel Expense Form', impact: 'High', effort: 'Medium', status: 'In Progress' },
                            { title: 'Automate Visa Letter Generation', impact: 'Medium', effort: 'Low', status: 'Planned' },
                            { title: 'Update Onboarding Knowledge Base', impact: 'High', effort: 'Low', status: 'Completed' },
                        ].map((opt, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold">{opt.title}</h4>
                                    <div className="text-xs text-slate-500 flex gap-2 mt-1">
                                        <span>Impact: <b>{opt.impact}</b></span>
                                        <span>Effort: <b>{opt.effort}</b></span>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${opt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                        opt.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                                    }`}>{opt.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feedback Highlights */}
                <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" /> Feedback Highlights
                    </h3>
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-800">
                        <p className="italic text-amber-900 dark:text-amber-100 font-medium text-lg mb-4">
                            "The new chatbot is helpful, but sometimes it gets stuck in a loop when asking about partial day leaves."
                        </p>
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-bold text-amber-700 dark:text-amber-300">- Employee Survey (Q3)</span>
                            <button className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600">Create Task</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
