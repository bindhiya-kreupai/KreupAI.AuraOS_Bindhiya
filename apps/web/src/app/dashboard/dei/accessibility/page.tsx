"use client";

import React from 'react';
import {
    Accessibility,
    Eye,
    Ear,
    MousePointer,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

export default function AccessibilityPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Accessibility className="w-6 h-6 text-indigo-500" />
                        Accessibility Center
                    </h1>
                    <p className="text-slate-500 text-sm">Manage workplace accommodations and digital accessibility compliance.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Scorecard */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-indigo-600">
                                <Eye className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase">Visual Aid Requests</div>
                                <div className="text-2xl font-bold">12</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full text-purple-600">
                                <Ear className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase">Hearing Support</div>
                                <div className="text-2xl font-bold">5</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-emerald-600">
                                <MousePointer className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase">Physical Access</div>
                                <div className="text-2xl font-bold">29</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Pending Accommodation Requests</h3>
                        <div className="space-y-4">
                            {[
                                { id: 'REQ-089', type: 'Screen Reader License', employee: 'John Doe', status: 'Pending Approval', date: 'Dec 05' },
                                { id: 'REQ-088', type: 'Adjustable Desk', employee: 'Jane Smith', status: 'Processing', date: 'Dec 03' },
                            ].map((req, i) => (
                                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-start gap-4 mb-2 md:mb-0">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400">
                                            <AlertCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{req.type}</div>
                                            <div className="text-xs text-slate-500">Requested by {req.employee} • {req.date}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
                                            {req.status}
                                        </span>
                                        <button className="text-xs font-bold hover:underline">Review</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Audit Score */}
                <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl flex flex-col items-center text-center justify-center">
                    <div className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center mb-4 relative">
                        <span className="text-4xl font-bold">94%</span>
                        <div className="absolute top-0 right-0 p-1 bg-emerald-500 rounded-full border-2 border-indigo-900">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold mb-1">WCAG 2.1 Compliant</h3>
                    <p className="text-indigo-200 text-sm mb-6">Your digital platforms meet most accessibility standards.</p>
                    <button className="w-full py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                        View Audit Report
                    </button>
                </div>
            </div>
        </div>
    );
}
