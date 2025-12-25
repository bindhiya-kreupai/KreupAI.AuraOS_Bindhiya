"use client";

import React from 'react';
import {
    ShieldCheck,
    AlertOctagon,
    FileText,
    TrendingDown,
    Activity
} from 'lucide-react';

export default function SafetyPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        Fleet Safety & Compliance
                    </h1>
                    <p className="text-slate-500 text-sm">Incident logs, safety audits, and preventive maintenance.</p>
                </div>
                <button className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20">
                    <AlertOctagon className="w-4 h-4" /> Report Accident
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Safety Score Card */}
                <div className="bg-emerald-600 text-white rounded-2xl p-6 shadow-lg shadow-emerald-500/20 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-lg mb-2">Fleet Safety Score</h3>
                        <div className="text-5xl font-bold mb-2">92<span className="text-2xl opacity-60">/100</span></div>
                        <div className="text-sm font-bold bg-white/20 inline-block px-2 py-1 rounded">
                            Top 10% in Industry
                        </div>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-xs font-bold opacity-80">
                        <Activity className="w-4 h-4" /> Updated: Today, 09:00 AM
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg"><TrendingDown className="w-5 h-5" /></div>
                        <span className="text-sm font-bold text-slate-500">Incident Rate</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">0.45</div>
                    <div className="text-xs text-slate-400">accidents per million miles</div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[20%] rounded-full"></div>
                    </div>
                    <div className="text-[10px] text-right mt-1 text-slate-400">Target: {&apos;<'} 1.0</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg"><FileText className="w-5 h-5" /></div>
                        <span className="text-sm font-bold text-slate-500">Audit Status</span>
                    </div>
                    <div className="text-3xl font-bold mb-1 text-emerald-600">Passed</div>
                    <div className="text-xs text-slate-400">Last DOT Audit: Nov 12</div>
                    <button className="w-full mt-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700">
                        View Report
                    </button>
                </div>
            </div>

            {/* Incident Log */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex-1 min-h-0 overflow-y-auto">
                <h3 className="font-bold text-lg mb-6">Recent Incidents</h3>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                            <th className="pb-3 pl-2">Date</th>
                            <th className="pb-3">Driver</th>
                            <th className="pb-3">Incident Type</th>
                            <th className="pb-3">Severity</th>
                            <th className="pb-3 text-right pr-2">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {[
                            { date: 'Dec 05', driver: 'John Wick', type: 'Minor Scrape', sev: 'Low', status: 'Resolved' },
                            { date: 'Nov 28', driver: 'Max Rockatansky', type: 'Tire Blowout', sev: 'Medium', status: 'Under Review' },
                            { date: 'Nov 15', driver: 'Baby Driver', type: 'Speeding Violation', sev: 'High', status: 'Action Taken' },
                        ].map((row, i) => (
                            <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="py-4 pl-2 text-slate-500 font-mono text-xs">{row.date}</td>
                                <td className="py-4 font-bold text-slate-700 dark:text-slate-300">{row.driver}</td>
                                <td className="py-4 text-slate-600 dark:text-slate-400">{row.type}</td>
                                <td className="py-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                        ${row.sev === 'Low' ? 'bg-slate-100 text-slate-600' :
                                            row.sev === 'Medium' ? 'bg-amber-100 text-amber-600' :
                                                'bg-rose-100 text-rose-600'}
                                    `}>
                                        {row.sev}
                                    </span>
                                </td>
                                <td className="py-4 text-right pr-2 font-bold text-slate-500 text-xs">{row.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
