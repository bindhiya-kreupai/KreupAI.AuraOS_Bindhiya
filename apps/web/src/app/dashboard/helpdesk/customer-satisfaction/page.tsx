"use client";

import React, { useState } from 'react';
import {
    Smile,
    Meh,
    Frown,
    MessageSquare
} from 'lucide-react';

export default function CustomerSatisfactionPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Smile className="w-6 h-6 text-emerald-500" />
                        Customer Satisfaction (CSAT)
                    </h1>
                    <p className="text-slate-500 text-sm">Employee feedback on helpdesk resolution quality.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800 text-center">
                    <Smile className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
                    <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">85%</div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-300 font-bold">Positive</div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-800 text-center">
                    <Meh className="w-12 h-12 mx-auto text-amber-500 mb-2" />
                    <div className="text-3xl font-bold text-amber-700 dark:text-amber-400">10%</div>
                    <div className="text-sm text-amber-600 dark:text-amber-300 font-bold">Neutral</div>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-2xl border border-rose-100 dark:border-rose-800 text-center">
                    <Frown className="w-12 h-12 mx-auto text-rose-500 mb-2" />
                    <div className="text-3xl font-bold text-rose-700 dark:text-rose-400">5%</div>
                    <div className="text-sm text-rose-600 dark:text-rose-300 font-bold">Negative</div>
                </div>
            </div>

            <h3 className="font-bold text-lg mt-4">Recent Feedback</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[
                    { score: 'Positive', comment: 'Mike resolved my issue very quickly. Thanks!', agent: 'Mike Smith', user: 'Alice', time: '2h ago' },
                    { score: 'Negative', comment: 'Took too long to get a response.', agent: 'Unassigned', user: 'Bob', time: '5h ago' },
                    { score: 'Positive', comment: 'Very helpful guidance on the tax forms.', agent: 'Sarah Connor', user: 'Charlie', time: '1d ago' },
                ].map((fb, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex gap-4">
                        <div className={`mt-1 ${fb.score === 'Positive' ? 'text-emerald-500' :
                                fb.score === 'Neutral' ? 'text-amber-500' : 'text-rose-500'
                            }`}>
                            <MessageSquare className="w-5 h-5 fill-current opacity-20" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium mb-2">"{fb.comment}"</p>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>For: <b>{fb.agent}</b></span>
                                <span>{fb.time}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
