"use client";

import React from 'react';
import {
    Map,
    Tent,
    ShieldAlert,
    Users,
    Plane,
    CheckCircle
} from 'lucide-react';

export default function DeploymentPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Tent className="w-6 h-6 text-orange-500" />
                        Field Deployment
                    </h1>
                    <p className="text-slate-500 text-sm">Manage missions, staff safety, and emergency evacuations.</p>
                </div>
                <div className="bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 animate-pulse flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> Global Alert Level: Elevated
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0 overflow-y-auto pb-20">
                {[
                    { mission: 'Clean Water Initiative', loc: 'Sub-Saharan Africa', status: 'Active', staff: 12, threat: 'Low' },
                    { mission: 'Earthquake Response', loc: 'South Asia', status: 'Critical', staff: 45, threat: 'High' },
                    { mission: 'Refugee Shelter', loc: 'Eastern Europe', status: 'Active', staff: 28, threat: 'Medium' },
                ].map((m, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{m.mission}</h3>
                                <div className="text-sm font-bold text-slate-500 flex items-center gap-1">
                                    <Map className="w-3 h-3" /> {m.loc}
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                ${m.threat === 'Low' ? 'bg-emerald-100 text-emerald-600' :
                                    m.threat === 'Medium' ? 'bg-amber-100 text-amber-600' :
                                        'bg-rose-100 text-rose-600'}
                            `}>
                                Threat: {m.threat}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="text-xs text-slate-500 font-bold uppercase mb-1">Deployed Staff</div>
                                <div className="text-2xl font-bold flex items-center gap-2">
                                    {m.staff} <Users className="w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="text-xs text-slate-500 font-bold uppercase mb-1">Status</div>
                                <div className="text-lg font-bold text-indigo-600 capitalize">{m.status}</div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto space-y-3">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Evacuation Plan</span>
                                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Ready</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Next Supply Drop</span>
                                <span className="text-xs font-bold text-slate-500">2 Days</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <button className="py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-colors">
                                    Manage Roster
                                </button>
                                <button className="py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 border border-rose-100 dark:border-rose-900/30 rounded-lg text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors flex items-center justify-center gap-2">
                                    <Plane className="w-3 h-3" /> Initiate Evac
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
