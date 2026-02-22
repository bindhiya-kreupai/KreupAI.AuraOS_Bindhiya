"use client";

import React from 'react';
import {
    Clapperboard,
    Calendar,
    Users,
    Clock,
    FileText,
    Megaphone
} from 'lucide-react';

export default function CastCrewPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Clapperboard className="w-6 h-6 text-fuchsia-500" />
                        Cast & Crew Real-time
                    </h1>
                    <p className="text-slate-500 text-sm">Digital call sheets, production roster, and set check-ins.</p>
                </div>
                <div className="flex items-center gap-2 bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400 px-4 py-2 rounded-xl text-sm font-bold border border-fuchsia-100 dark:border-fuchsia-800/30 font-mono">
                    <Megaphone className="w-4 h-4" /> ON AIR / RECORDING
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Call Sheet */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold font-serif mb-1">Production: "Neon Nights"</h2>
                            <div className="text-xs font-bold opacity-70 uppercase tracking-wider">Day 14 of 45 • Scene 24B • Location: Downtown Diner</div>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold text-fuchsia-400">07:30</div>
                            <div className="text-xs font-bold uppercase">Call Time</div>
                        </div>
                    </div>

                    <h3 className="font-bold text-lg mt-4 mb-2">Today's Roster</h3>
                    {[
                        { name: 'Leonardo D.', role: 'Lead Actor', call: '06:00 AM', status: 'On Set', makeup: 'Done' },
                        { name: 'Scarlett J.', role: 'Lead Actress', call: '07:30 AM', status: 'In Makeup', makeup: 'In Progress' },
                        { name: 'Christopher N.', role: 'Director', call: '05:30 AM', status: 'On Set', makeup: 'N/A' },
                        { name: 'Extras Group A', role: 'Background', call: '08:00 AM', status: 'Holding', makeup: 'Pending' },
                    ].map((c, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                    {c.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{c.name}</h3>
                                    <div className="text-xs text-slate-500 font-bold mb-1">{c.role}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> Call: {c.call}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right hidden md:block">
                                    <div className="text-xs font-bold text-slate-500">Makeup/Wardrobe</div>
                                    <div className={`text-xs font-bold ${c.makeup === 'Done' ? 'text-emerald-500' : 'text-amber-500'}`}>{c.makeup}</div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${c.status === 'On Set' ? 'bg-fuchsia-100 text-fuchsia-600 animate-pulse' :
                                            c.status === 'Holding' ? 'bg-slate-100 text-slate-600' :
                                                'bg-amber-100 text-amber-600'}
                                    `}>
                                        {c.status}
                                    </span>
                                    <button className="text-xs font-bold text-indigo-500 hover:underline">Message Agent</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Production Stats */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-500" /> Daily Report
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500 uppercase">Pages Shot</span>
                                <span className="text-xl font-bold text-slate-800 dark:text-slate-200">5.2 <span className="text-xs font-normal text-slate-400">/ 4.0 Goal</span></span>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500 uppercase">Overtime Hrs</span>
                                <span className="text-xl font-bold text-rose-500">1.5 <span className="text-xs font-normal text-slate-400">hrs</span></span>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-3 bg-indigo-500 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors shadow">
                            Generate Wrap Report
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
                        <h3 className="font-bold text-lg mb-2">Notice</h3>
                        <p className="text-sm opacity-90 mb-4">
                            Rain expected tomorrow. Schedule shifting to Soundstage 4.
                        </p>
                        <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-100">
                            Send Blast Alert
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

