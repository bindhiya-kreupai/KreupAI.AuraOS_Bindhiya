"use client";

import React from 'react';
import {
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    FileText,
    Calendar
} from 'lucide-react';

export default function RegularizationPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6 text-amber-500" />
                        Regularization & Exceptions
                    </h1>
                    <p className="text-slate-500 text-sm">Handle missed punches, system errors, and attendance disputes.</p>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-xl text-sm font-bold border border-amber-100 dark:border-amber-800/30">
                    <AlertCircle className="w-4 h-4" /> 18 Pending Requests
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
                {/* Request List */}
                <div className="space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">Incoming Requests</h3>
                    {[
                        { name: 'John Doe', type: 'Missed Punch (Out)', date: 'Dec 05', reason: 'Forgot to punch out. System issue.', status: 'Pending' },
                        { name: 'Jane Smith', type: 'Late Entry', date: 'Dec 05', reason: 'Traffic due to rain. Req waive penalty.', status: 'Pending' },
                        { name: 'Mike Ross', type: 'Early Exit', date: 'Dec 04', reason: 'Doctor appointment. Approved by Manager.', status: 'Pending' },
                        { name: 'Rachel Zane', type: 'Absent to Present', date: 'Dec 01', reason: 'Biometric was down. Worked full day.', status: 'Pending' },
                    ].map((r, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                        {r.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{r.name}</h4>
                                        <div className="text-xs text-slate-500 font-bold flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {r.date}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded">
                                    {r.type}
                                </span>
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm text-slate-600 dark:text-slate-300 italic">
                                "{r.reason}"
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold">
                                    Accept
                                </button>
                                <button className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold">
                                    Deny
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* My Requests (Simulation) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-fit">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-500" /> Raise New Request
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Request Type</label>
                            <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold">
                                <option>Missed Punch Adjustment</option>
                                <option>Late Entry Waiver</option>
                                <option>Early Exit Permission</option>
                                <option>On Duty (Field Work)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
                            <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Time (In / Out)</label>
                            <div className="flex gap-2">
                                <input type="time" className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold" />
                                <input type="time" className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Reason</label>
                            <textarea rows={3} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold" placeholder="Reason for regularization..."></textarea>
                        </div>
                        <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700">Submit Request</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
