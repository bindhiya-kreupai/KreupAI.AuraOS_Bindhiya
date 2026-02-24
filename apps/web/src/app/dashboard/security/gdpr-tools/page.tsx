"use client";

import React from 'react';
import {
    Database,
    Eraser,
    Download,
    Search,
    UserX,
    History,
    FileCheck,
    Clock
} from 'lucide-react';

export default function GDPRToolsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Database className="w-6 h-6 text-indigo-500" />
                        GDPR Tools
                    </h1>
                    <p className="text-slate-500 text-sm">Manage Data Subject Access Requests (DSAR) and Right to be Forgotten.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                    <Search className="w-4 h-4" /> New DSAR Request
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 container mx-auto">
                {/* Stats */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">12</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pending Requests</div>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600">
                            <History className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">48h</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Avg Response Time</div>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">5</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Deleted Users</div>
                        </div>
                        <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-600">
                            <UserX className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Request List */}
                <div className="lg:col-span-2 overflow-y-auto pb-20">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-sm">
                            Active Requests
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { id: 'REQ-2024-88', user: 'Alex Johnson', type: 'Data Export', status: 'Processing', due: '2 Days' },
                                { id: 'REQ-2024-89', user: 'Maria Garcia', type: 'Deletion', status: 'Pending Approval', due: '5 Days' },
                                { id: 'REQ-2024-90', user: 'David Kim', type: 'Rectification', status: 'Completed', due: '-' },
                            ].map((req, i) => (
                                <div key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800 dark:text-slate-200">{req.user}</span>
                                            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{req.id}</span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-0.5">{req.type} Request</div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto justify-between">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold 
                                            ${req.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                req.status.includes('Pending') ? 'bg-amber-100 text-amber-700' :
                                                    'bg-indigo-100 text-indigo-700'}`}>
                                            {req.status}
                                        </div>
                                        <button className="text-sm font-bold text-slate-400 hover:text-indigo-600">View</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-sm mb-4 text-slate-500 uppercase tracking-wider">Consent Manager</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-xl">
                                <div>
                                    <div className="font-bold text-sm">Cookie Policy</div>
                                    <div className="text-xs text-slate-500">v2.1 (Active)</div>
                                </div>
                                <div className="w-10 h-6 bg-emerald-500 rounded-full flex items-center px-1 justify-end">
                                    <div className="w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-xl">
                                <div>
                                    <div className="font-bold text-sm">Marketing Emails</div>
                                    <div className="text-xs text-slate-500">Opt-in Required</div>
                                </div>
                                <div className="w-10 h-6 bg-emerald-500 rounded-full flex items-center px-1 justify-end">
                                    <div className="w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20 p-6">
                        <h3 className="font-bold text-sm mb-4 text-rose-600 uppercase tracking-wider flex items-center gap-2">
                            <UserX className="w-4 h-4" /> Danger Zone
                        </h3>
                        <button className="w-full py-3 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-rose-600 font-bold rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex items-center justify-center gap-2">
                            <Eraser className="w-4 h-4" /> Anonymize User Data
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

