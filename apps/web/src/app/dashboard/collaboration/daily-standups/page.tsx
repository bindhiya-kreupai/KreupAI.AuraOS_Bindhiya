"use client";

import React, { useState } from 'react';
import {
    MessagesSquare,
    Clock,
    CheckCircle2,
    Smile
} from 'lucide-react';

export default function DailyStandupsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessagesSquare className="w-6 h-6 text-indigo-500" />
                        Daily Standups
                    </h1>
                    <p className="text-slate-500 text-sm">Async status updates for distributed teams.</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Next Standup: <span className="text-emerald-600">Opens in 14h</span></span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Submit Update Form */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-fit">
                    <h3 className="font-bold text-lg mb-4">My Update</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1 uppercase">What did you do yesterday?</label>
                            <textarea className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="- Completed dashboard API..." />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1 uppercase">What will you do today?</label>
                            <textarea className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="- Fix login bug..." />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1 uppercase">Any blockers?</label>
                            <input type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm" placeholder="None" />
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <button className="text-slate-400 hover:text-amber-500"><Smile className="w-5 h-5" /></button>
                            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Post Update</button>
                        </div>
                    </div>
                </div>

                {/* Team Updates Feed */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg px-2">Team Updates (Today)</h3>
                    {[
                        { name: 'Sarah Connor', role: 'Frontend Lead', time: '9:30 AM', yesterday: 'Finished Kanban drag-and-drop.', today: 'Working on whiteboard drawing logic.', blockers: 'None.' },
                        { name: 'James Bond', role: 'Security Engineer', time: '9:15 AM', yesterday: 'Audited API endpoints.', today: 'Implementing new auth flow.', blockers: 'Waiting for design review.' },
                        { name: 'Indiana Jones', role: 'Product Manager', time: '8:45 AM', yesterday: 'Reviewed Q4 roadmap.', today: 'Client meeting at 2pm.', blockers: 'None.' },
                    ].map((update, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold">
                                        {update.name[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold">{update.name}</div>
                                        <div className="text-xs text-slate-500">{update.role}</div>
                                    </div>
                                </div>
                                <div className="text-xs font-mono text-slate-400">{update.time}</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase">Yesterday</div>
                                    <p className="text-slate-700 dark:text-slate-300">{update.yesterday}</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 uppercase">Today</div>
                                    <p className="text-slate-700 dark:text-slate-300">{update.today}</p>
                                </div>
                                <div className="bg-rose-50 dark:bg-rose-900/10 p-3 rounded-lg border border-rose-100 dark:border-rose-900/30">
                                    <div className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-1 uppercase">Blockers</div>
                                    <p className="text-slate-700 dark:text-slate-300">{update.blockers}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

