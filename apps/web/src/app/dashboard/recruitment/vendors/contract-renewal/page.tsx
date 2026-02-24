"use client";

import React, { useState, useEffect } from 'react';
import { RecruitmentSettingsService } from '../../services';
import {
    RefreshCw,
    Calendar,
    AlertCircle,
    CheckCircle2,
    XCircle
} from 'lucide-react';

export default function ContractRenewalPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <RefreshCw className="w-6 h-6 text-indigo-500" />
                        Contract Renewals
                    </h1>
                    <p className="text-slate-500 text-sm">Manage expiring contractor agreements and extensions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Expiring Soon */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-amber-600">
                        <ClockIcon className="w-5 h-5" /> Expiring within 30 days
                    </h3>
                    {[
                        { name: 'Sarah Jenkins', role: 'Frontend Dev', vendor: 'TechStaff', expiry: '7 days', status: 'Pending Decision' },
                        { name: 'Michael Chen', role: 'QA Analyst', vendor: 'Global Manpower', expiry: '12 days', status: 'Negotiating' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-bl-xl">
                                Expires in {item.expiry}
                            </div>
                            <h4 className="font-bold text-lg">{item.name}</h4>
                            <div className="text-sm text-slate-500 mb-4">{item.role} • {item.vendor}</div>

                            <div className="flex gap-2 mt-4">
                                <button className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700">Extend</button>
                                <button className="flex-1 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800">Terminate</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <HistoryIcon className="w-5 h-5" /> Detailed History
                    </h3>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                        <div className="space-y-4">
                            {[
                                { action: 'Renewed', name: 'David Smith', term: '+6 Months', date: 'Yesterday', icon: CheckCircle2, color: 'text-emerald-500' },
                                { action: 'Terminated', name: 'Emily White', term: 'Effective Immediately', date: '2 days ago', icon: XCircle, color: 'text-slate-400' },
                                { action: 'Rate Adjusted', name: 'James Wilson', term: '$85/hr -> $90/hr', date: 'Last Week', icon: RefreshCw, color: 'text-blue-500' },
                            ].map((log, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className={`mt-1 ${log.color}`}>
                                        <log.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{log.action}: {log.name}</div>
                                        <div className="text-xs text-slate-500">{log.term}</div>
                                        <div className="text-[10px] text-slate-400 mt-1">{log.date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ClockIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> }
function HistoryIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" /></svg> }

