"use client";

import React from 'react';
import {
    Star,
    Video,
    User,
    FileText,
    Mic2,
    Search
} from 'lucide-react';

export default function TalentPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Star className="w-6 h-6 text-amber-500" />
                        Talent Management
                    </h1>
                    <p className="text-slate-500 text-sm">Casting database, audition tracking, and agent directory.</p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 w-full md:w-96">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input type="text" placeholder="Search talent by skill, look, or name..." className="bg-transparent outline-none flex-1 text-sm" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-full min-h-0">
                {/* Filters */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full">
                    <h3 className="font-bold mb-4">Filters</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-2 block">Role Type</label>
                            <div className="space-y-2">
                                {['Lead Actor', 'Supporting', 'Voice Over', 'Stunt Double', 'Extra'].map(s => (
                                    <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input type="checkbox" className="rounded text-indigo-500 focus:ring-indigo-500" /> {s}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-2 block">Union Status</label>
                            <div className="space-y-2">
                                {['SAG-AFTRA', 'Equity', 'Non-Union'].map(s => (
                                    <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input type="checkbox" className="rounded text-indigo-500 focus:ring-indigo-500" /> {s}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Talent Grid */}
                <div className="lg:col-span-3 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-4">Top Matches</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { name: 'Emma Watson', type: 'Lead Actor', union: 'SAG-AFTRA', agency: 'CAA', rating: 5.0 },
                            { name: 'Tom Hardy', type: 'Lead Actor', union: 'Equity', agency: 'United Agents', rating: 4.8 },
                            { name: 'Morgan Freeman', type: 'Voice Over', union: 'SAG-AFTRA', agency: 'WME', rating: 5.0 },
                            { name: 'Jackie Chan', type: 'Stunt / Lead', union: 'SAG-AFTRA', agency: 'CAA', rating: 4.9 },
                            { name: 'Andy Serkis', type: 'Mo-Cap Specialist', union: 'Equity', agency: 'Independent', rating: 5.0 },
                            { name: 'Zendaya', type: 'Lead Actor', union: 'SAG-AFTRA', agency: 'CAA', rating: 4.9 },
                        ].map((t, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 bg-amber-400 text-white text-xs font-bold rounded-bl-xl shadow-sm z-10 flex items-center gap-1">
                                    {t.rating} <Star className="w-3 h-3 fill-current" />
                                </div>
                                <div className="w-20 h-20 mx-auto rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-2xl text-slate-500 mb-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 transition-colors">
                                    {t.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{t.name}</h3>
                                    <div className="text-xs font-bold text-indigo-500 mb-1">{t.type}</div>
                                    <div className="text-xs text-slate-400 mb-4">{t.union} • {t.agency}</div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button className="flex items-center justify-center gap-1.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700">
                                            <FileText className="w-3 h-3" /> Reel
                                        </button>
                                        <button className="flex items-center justify-center gap-1.5 py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600">
                                            <Mic2 className="w-3 h-3" /> Audition
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

