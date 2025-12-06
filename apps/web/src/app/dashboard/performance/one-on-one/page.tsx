"use client";

import React, { useState } from 'react';
import {
    MessageSquare,
    Calendar,
    CheckSquare,
    Plus,
    Clock,
    User,
    ChevronRight,
    MoreVertical
} from 'lucide-react';

const MEETINGS = [
    { id: 1, title: 'Weekly Sync: Alice', date: 'Today, 2:00 PM', with: 'Alice Chen', status: 'Scheduled', items: 2 },
    { id: 2, title: 'Career Growth: Bob', date: 'Tomorrow, 11:00 AM', with: 'Bob Smith', status: 'Scheduled', items: 1 },
    { id: 3, title: 'Monthly Review: Charlie', date: 'Dec 15, 3:00 PM', with: 'Charlie D.', status: 'Pending', items: 0 },
];

export default function OneOnOnePage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-indigo-500" />
                        One-on-Ones
                    </h1>
                    <p className="text-slate-500 text-sm">Manage agendas and action items for direct reports.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Plus className="w-4 h-4" /> Schedule Meeting
                </button>
            </div>

            <div className="flex h-full min-h-0 gap-6 overflow-hidden">
                {/* Upcoming List */}
                <div className="w-80 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm">
                        Upcoming Meetings
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {MEETINGS.map(mtg => (
                            <button key={mtg.id} className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-sm truncate">{mtg.with}</span>
                                    <span className="text-[10px] text-slate-400">{mtg.status}</span>
                                </div>
                                <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {mtg.date}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 px-2 py-0.5 rounded w-fit">
                                    <CheckSquare className="w-3 h-3" /> {mtg.items} Action Items
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main View - Workspace */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                    {/* Workspace Header */}
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start">
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Agenda for</div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Weekly Sync: Alice</h2>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                <span className="flex items-center gap-1"><User className="w-4 h-4" /> Alice Chen</span>
                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 30 mins</span>
                            </div>
                        </div>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Agenda Items */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" /> Discussion Points
                            </h3>

                            <div className="space-y-2">
                                {[
                                    'Review Q4 Goals progress',
                                    'Discuss training budget approval',
                                    'Feedback on last sprint demo'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 group">
                                        <div className="mt-1 w-4 h-4 rounded border border-slate-300 dark:border-slate-600 group-hover:border-indigo-500 cursor-pointer"></div>
                                        <input
                                            type="text"
                                            defaultValue={item}
                                            className="flex-1 bg-transparent outline-none border-b border-transparent focus:border-indigo-200 text-sm py-0.5"
                                        />
                                    </div>
                                ))}
                                <div className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-indigo-500 mt-2">
                                    <Plus className="w-4 h-4" /> Add talking point
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold text-lg text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                <CheckSquare className="w-5 h-5" /> Action Items
                            </h3>

                            <div className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                                        <CheckSquare className="w-3 h-3 text-emerald-600" />
                                    </div>
                                    <span className="text-sm line-through text-slate-400">Send updated roadmap deck</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 w-4 h-4 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"></div>
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Schedule team lunch</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                        <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Add Private Note</button>
                        <button className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-600">Complete Meeting</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
