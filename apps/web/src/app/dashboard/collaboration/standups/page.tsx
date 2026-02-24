"use client";

import React from 'react';
import {
    MessageCircle,
    Video,
    Clock,
    CheckCircle,
    Calendar,
    Mic
} from 'lucide-react';

export default function StandupsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageCircle className="w-6 h-6 text-indigo-500" />
                        Daily Standups
                    </h1>
                    <p className="text-slate-500 text-sm">Async updates to keep the team aligned without meetings.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Mic className="w-4 h-4" /> Post Update
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Updates Feed */}
                <div className="lg:col-span-2 flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="font-bold flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>Today, Dec 06</span>
                        </div>
                        <div className="text-xs font-bold text-slate-500">
                            12/15 Updates Submitted (80%)
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {[
                            { name: 'Sarah Jenkins', role: 'Frontend Dev', time: '9:15 AM', status: 'Working on Dashboard UI', blocker: 'None' },
                            { name: 'Raj Patel', role: 'Backend Lead', time: '9:30 AM', status: 'Fixing API latency issues', blocker: 'Need DB credentials update' },
                            { name: 'Elena Rossi', role: 'Designer', time: '10:05 AM', status: 'Finalizing icon set', blocker: 'None' },
                            { name: 'Kenji Sato', role: 'Product Manager', time: '10:15 AM', status: 'Reviewing Q1 roadmap', blocker: 'Waiting for stakeholder feedback' },
                        ].map((update, i) => (
                            <div key={i} className="flex gap-3 group">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                        {update.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="w-px h-full bg-slate-100 dark:bg-slate-800 my-2 group-last:hidden"></div>
                                </div>
                                <div className="flex-1 pb-6 group-last:pb-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200">{update.name}</h3>
                                            <div className="text-xs text-slate-500">{update.role}</div>
                                        </div>
                                        <div className="text-xs text-slate-400 font-mono">{update.time}</div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-sm space-y-2">
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase mb-0.5">Focus Today</div>
                                            <p className="text-slate-700 dark:text-slate-300">{update.status}</p>
                                        </div>
                                        {update.blocker !== 'None' && (
                                            <div>
                                                <div className="text-xs font-bold text-rose-400 uppercase mb-0.5">Blockers</div>
                                                <p className="text-rose-600 dark:text-rose-400 font-medium">{update.blocker}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3 mt-2">
                                        <button className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1">
                                            👍 Like
                                        </button>
                                        <button className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1">
                                            💬 Reply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="bg-indigo-600 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">Team Mood</h3>
                            <div className="text-4xl mb-4">🔥 On Fire</div>
                            <p className="text-xs opacity-80 mb-4">
                                Most of the team is feeling productive today. Keep up the momentum!
                            </p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-20">
                            <CheckCircle className="w-32 h-32" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 text-rose-500 flex items-center gap-2">
                            <Clock className="w-5 h-5" /> Missing Updates
                        </h3>
                        <div className="space-y-3">
                            {['Michael Scott', 'Jim Halpert', 'Pam Beesly'].map((name, i) => (
                                <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                                            {name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{name}</span>
                                    </div>
                                    <button className="text-xs text-indigo-500 font-bold hover:underline">Nudge</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

