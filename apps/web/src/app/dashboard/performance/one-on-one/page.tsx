"use client";

import React from 'react';
import {
    MessageSquare,
    Calendar,
    Mic,
    CheckSquare,
    Smile,
    ArrowRight
} from 'lucide-react';

export default function OneOnOnePage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-emerald-500" />
                        1-on-1 Meetings
                    </h1>
                    <p className="text-slate-500 text-sm">Track manager-employee check-ins, talking points, and action items.</p>
                </div>
                <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20">
                    + Schedule New
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Meeting List */}
                <div className="lg:col-span-1 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-sm mb-2 text-slate-500 uppercase">Upcoming</h3>
                    {[
                        { with: 'Dwight Schrute', role: 'Assistant Regional Mgr', time: 'Today, 2:00 PM', type: 'Weekly Sync' },
                        { with: 'Jim Halpert', role: 'Sales Exec', time: 'Tomorrow, 10:00 AM', type: 'Career Dev' },
                    ].map((m, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border-l-4 border-emerald-500 shadow-sm cursor-pointer hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200">{m.with}</h4>
                                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-2 py-0.5 rounded font-bold">{m.type}</span>
                            </div>
                            <div className="text-xs text-slate-500 font-bold mb-1">{m.role}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {m.time}
                            </div>
                        </div>
                    ))}

                    <h3 className="font-bold text-sm mt-6 mb-2 text-slate-500 uppercase">Past Logs</h3>
                    {[
                        { with: 'Pam Beesly', date: 'Dec 01', note: 'Discussed design courses.' },
                        { with: 'Stanley Hudson', date: 'Nov 24', note: 'Retirement planning.' },
                    ].map((m, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 opacity-80 hover:opacity-100 transition-opacity">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">{m.with}</h4>
                                <span className="text-[10px] text-slate-400 font-bold">{m.date}</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{m.note}</p>
                        </div>
                    ))}
                </div>

                {/* Meeting Console */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-full flex flex-col">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    Dwight Schrute <span className="text-base font-normal text-slate-400">@ 2:00 PM</span>
                                </h2>
                                <p className="text-xs text-slate-500">Weekly Sync • 30 Mins</p>
                            </div>
                            <button className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30">
                                <Mic className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Talking Points */}
                        <div className="flex-1 space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" /> Talking Points
                                </h3>
                                <div className="space-y-2">
                                    {['Review Sales Numbers for Nov', 'Discuss new Beet Farm Policy', 'Safety Training Compliance'].map((p, i) => (
                                        <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"></div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{p}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-3 p-2 opacity-60">
                                        <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600"></div>
                                        <input type="text" placeholder="Add point..." className="bg-transparent text-sm outline-none w-full" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                    <CheckSquare className="w-4 h-4" /> Action Items
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                                        <input type="checkbox" className="accent-indigo-600 w-4 h-4" />
                                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Submit revised forecast by Friday</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sentiment */}
                        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="text-xs font-bold text-slate-400 uppercase">Meeting Vibe</div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button key={n} className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${n === 4 ? 'bg-emerald-100 text-emerald-600' : 'text-slate-400'}`}>
                                            <Smile className="w-4 h-4" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                                Complete Meeting <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
