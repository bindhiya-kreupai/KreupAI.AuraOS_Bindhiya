"use client";

import React from 'react';
import {
    Passport,
    Plane,
    Calendar,
    AlertCircle,
    CheckCircle,
    FileText,
    UploadCloud
} from 'lucide-react';

export default function ImmigrationPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Passport className="w-6 h-6 text-indigo-500" />
                        Visa & Immigration
                    </h1>
                    <p className="text-slate-500 text-sm">Track visa status, work permits, and travel documents.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Plane className="w-4 h-4" /> Initiate Transfer
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Cases List */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-500" /> Active Cases
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-4">
                        {[
                            { name: 'Sarah Jenkins', type: 'H-1B Renewal', country: 'USA', status: 'Processing', date: 'Oct 12, 2024' },
                            { name: 'Raj Patel', type: 'Work Permit (Tier 2)', country: 'UK', status: 'Approved', date: 'Nov 01, 2024' },
                            { name: 'Elena Rossi', type: 'Blue Card', country: 'Germany', status: 'Docs Required', date: 'Dec 03, 2024' },
                            { name: 'Kenji Sato', type: 'L-1 Transfer', country: 'USA', status: 'Pending Lottery', date: 'Jan 15, 2025' },
                        ].map((c, i) => (
                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div>
                                    <div className="font-bold text-slate-800 dark:text-slate-200">{c.name}</div>
                                    <div className="text-xs text-slate-500 mb-1">{c.type} • {c.country}</div>

                                </div>
                                <div className="mt-2 md:mt-0 flex items-center gap-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${c.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
                                            c.status === 'Docs Required' ? 'bg-rose-100 text-rose-600' :
                                                'bg-indigo-100 text-indigo-600'}
                                    `}>
                                        {c.status}
                                    </span>
                                    <button className="text-xs font-bold text-slate-400 hover:text-indigo-600">Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Expiry Alerts */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" /> Expiry Alerts
                        </h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-xl">
                                <h4 className="font-bold text-sm text-amber-900 dark:text-amber-400">Liam Smith - Visa Expiring</h4>
                                <p className="text-xs text-amber-800 dark:text-amber-500 mt-1">In 35 days (Jan 10, 2025). Renewal not yet started.</p>
                                <button className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-300 underline">Start Renewal</button>
                            </div>
                            <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl opacity-70">
                                <h4 className="font-bold text-sm">Passport Expiry - 3 Employees</h4>
                                <p className="text-xs text-slate-500 mt-1">Due in next 6 months. Notifications sent.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <UploadCloud className="w-5 h-5" /> Document Locker
                        </h3>
                        <p className="text-xs opacity-80 mb-4">Securely upload and share sensitive identity documents.</p>
                        <div className="bg-white/10 rounded-lg p-3 text-center border border-white/20 border-dashed cursor-pointer hover:bg-white/20 transition-colors">
                            <span className="text-xs font-bold">Drop files here</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
