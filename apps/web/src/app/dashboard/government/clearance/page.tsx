"use client";

import React from 'react';
import {
    Shield,
    Lock,
    FileSearch,
    UserCheck,
    AlertTriangle,
    Eye
} from 'lucide-react';

export default function ClearancePage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        Security Clearance Management
                    </h1>
                    <p className="text-slate-500 text-sm">Track vetting status, renewals, and clearance levels.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-800/30">
                    <UserCheck className="w-4 h-4" /> Vetting Queue: 12 Pending
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Clearance List */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">Personnel Clearance Status</h3>

                    {[
                        { name: 'Jack Bauer', level: 'Top Secret / SCI', status: 'Active', renewal: 'Jun 2028', dept: 'Counter Terrorism' },
                        { name: 'Ethan Hunt', level: 'Top Secret', status: 'Under Review', renewal: 'Pending', dept: 'IMF' },
                        { name: 'James Bond', level: 'Secret', status: 'Suspended', renewal: 'N/A', dept: 'MI6 Liaison' },
                        { name: 'Jason Bourne', level: 'Top Secret', status: 'Revoked', renewal: 'N/A', dept: 'Treadstone' },
                    ].map((p, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all border-l-4"
                            style={{ borderLeftColor: p.status === 'Active' ? '#10b981' : p.status === 'Suspended' ? '#f59e0b' : p.status === 'Under Review' ? '#6366f1' : '#ef4444' }}
                        >
                            <div className="flex items-center gap-3 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{p.name}</h3>
                                    <div className="text-xs text-slate-500 font-bold mb-1">{p.dept}</div>
                                    <div className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                                        {p.level}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-xs font-bold text-slate-500">Renewal Date</div>
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{p.renewal}</div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${p.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                                            p.status === 'Suspended' ? 'bg-amber-100 text-amber-600' :
                                                p.status === 'Under Review' ? 'bg-indigo-100 text-indigo-600' :
                                                    'bg-rose-100 text-rose-600'}
                                    `}>
                                        {p.status}
                                    </span>
                                    <button className="text-xs font-bold text-indigo-500 hover:underline">View Dossier</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Investigations Sidebar */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <FileSearch className="w-5 h-5 text-indigo-500" /> Open Investigations
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-sm">Background Check #8821</h4>
                                    <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-bold">In Progress</span>
                                </div>
                                <p className="text-xs text-slate-500">Subject: Sarah Conner • Exp: 2 Days</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-sm">Polygraph Review #442</h4>
                                    <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold">Scheduled</span>
                                </div>
                                <p className="text-xs text-slate-500">Subject: Dana Scully • Date: Dec 12</p>
                            </div>
                        </div>
                        <button className="w-full mt-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">
                            Start New Investigation
                        </button>
                    </div>

                    <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 p-6">
                        <h3 className="font-bold text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Expiring clearances
                        </h3>
                        <p className="text-sm text-rose-600 dark:text-rose-300">
                            4 staff members have clearances expiring within 30 days. Action required immediately.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

