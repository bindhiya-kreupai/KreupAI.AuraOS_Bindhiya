"use client";

import React from 'react';
import {
    HardHat,
    AlertTriangle,
    ClipboardCheck,
    Hammer,
    ShieldAlert,
    FileText
} from 'lucide-react';

export default function SafetyPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <HardHat className="w-6 h-6 text-orange-500" />
                        Site Safety (HSE)
                    </h1>
                    <p className="text-slate-500 text-sm">Incident logs, ToolBox Talks, and PPE compliance.</p>
                </div>
                <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20">
                    <ShieldAlert className="w-4 h-4" /> Report Hazard
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Stats */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg flex flex-col justify-between">
                        <div className="text-4xl font-bold">142</div>
                        <div className="text-xs opacity-80 uppercase font-bold">Days Without Injury</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500"><ClipboardCheck className="w-6 h-6" /></div>
                        <div>
                            <div className="text-2xl font-bold">12/15</div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Sites Audited</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-500"><FileText className="w-6 h-6" /></div>
                        <div>
                            <div className="text-2xl font-bold">98%</div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Training Compliant</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-500"><AlertTriangle className="w-6 h-6" /></div>
                        <div>
                            <div className="text-2xl font-bold">3</div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Open Hazards</div>
                        </div>
                    </div>
                </div>

                {/* Toolbox Talks */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">ToolBox Talks Log</h3>
                    {[
                        { topic: 'Working at Heights', site: 'Skyline Tower', foreman: 'Bob Builder', date: 'Today, 07:00 AM', attendees: 24, status: 'Completed' },
                        { topic: 'Electrical Safety', site: 'Metro Station', foreman: 'Fix-It Felix', date: 'Yesterday', attendees: 18, status: 'Completed' },
                        { topic: 'PPE Inspection', site: 'River Bridge', foreman: 'Mario', date: 'Dec 04', attendees: 32, status: 'Missed' },
                    ].map((talk, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center font-bold text-orange-600">
                                    <Hammer className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{talk.topic}</h3>
                                    <div className="text-xs text-slate-500 font-bold mb-1 flex items-center gap-1">
                                        @ {talk.site} • Led by {talk.foreman}
                                    </div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">
                                        {talk.date} • {talk.attendees} Workers
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                    ${talk.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                                        'bg-rose-100 text-rose-600'}
                                `}>
                                    {talk.status}
                                </span>
                                <button className="text-xs font-bold text-indigo-500 hover:underline">View Signatures</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Inspections */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4 text-slate-700 dark:text-slate-300">Daily Inspections</h3>
                    <div className="space-y-4">
                        {[
                            { item: 'Scaffolding Check', status: 'Pass' },
                            { item: 'Fire Extinguishers', status: 'Pass' },
                            { item: 'Perimeter Fence', status: 'Flagged' },
                            { item: 'Crane Stability', status: 'Pass' },
                        ].map((check, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{check.item}</span>
                                <span className={`text-xs font-bold uppercase px-2 py-1 rounded
                                    ${check.status === 'Pass' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}
                                `}>{check.status}</span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                        Start New Inspection
                    </button>
                </div>
            </div>
        </div>
    );
}
