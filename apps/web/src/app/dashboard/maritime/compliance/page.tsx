"use client";

import React from 'react';
import {
    ShieldCheck,
    FileBadge,
    HeartPulse,
    AlertOctagon,
    Search
} from 'lucide-react';

export default function CompliancePage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        Offshore Compliance (STCW)
                    </h1>
                    <p className="text-slate-500 text-sm">Validating seafarer certificates, medicals (ENG1), and safety training.</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100 dark:border-emerald-800/30">
                    <FileBadge className="w-4 h-4" /> 98% Document Compliance
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-full min-h-0">
                {/* Expiry Sidebar */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full">
                    <h3 className="font-bold mb-4">Expiry Watchlist</h3>
                    <div className="space-y-4">
                        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-900/30">
                            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm mb-1">
                                <AlertOctagon className="w-4 h-4" /> Expired
                            </div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">2</div>
                            <div className="text-xs text-slate-500">Docs require immediate action</div>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm mb-1">
                                <AlertOctagon className="w-4 h-4" /> Expiring (30d)
                            </div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">5</div>
                            <div className="text-xs text-slate-500">Docs expiring soon</div>
                        </div>
                    </div>
                </div>

                {/* Crew Cert Grid */}
                <div className="lg:col-span-3 overflow-y-auto pb-20">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 flex gap-3 items-center">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input type="text" placeholder="Search seafarer..." className="bg-transparent outline-none flex-1 text-sm font-bold" />
                    </div>

                    <h3 className="font-bold text-lg mb-4">Crew Documentation</h3>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                                <th className="pb-3 pl-2">Seafarer</th>
                                <th className="pb-3">Rank</th>
                                <th className="pb-3">STCW Basic</th>
                                <th className="pb-3">ENG1 Medical</th>
                                <th className="pb-3 text-right pr-2">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {[
                                { name: 'Jack Sparrow', rank: 'Captain', stcw: 'Valid (2026)', med: 'Valid (2025)', status: 'OK' },
                                { name: 'Will Turner', rank: 'Bosun', stcw: 'Valid (2026)', med: 'Expiring (12 Days)', status: 'Warn' },
                                { name: 'Hector Barbossa', rank: 'Master', stcw: 'Valid (2027)', med: 'Valid (2025)', status: 'OK' },
                                { name: 'Joshamee Gibbs', rank: 'Chief Eng', stcw: 'Expired (Yesterday)', med: 'Valid (2025)', status: 'Crit' },
                                { name: 'Elizabeth Swann', rank: '3rd Off', stcw: 'Valid (2028)', med: 'Valid (2026)', status: 'OK' },
                            ].map((row, i) => (
                                <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="py-4 pl-2 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-xs">
                                            {row.name ? row.name.split(' ')[0][0] : '?'}
                                        </div>
                                        {row.name}
                                    </td>
                                    <td className="py-4 text-slate-600 dark:text-slate-400">{row.rank}</td>
                                    <td className={`py-4 font-bold ${row.stcw.includes('Expired') ? 'text-rose-500' : 'text-emerald-500'}`}>{row.stcw}</td>
                                    <td className={`py-4 font-bold ${row.med.includes('Expiring') ? 'text-amber-500' : 'text-emerald-500'}`}>{row.med}</td>
                                    <td className="py-4 text-right pr-2">
                                        <button className="text-xs font-bold text-indigo-500 hover:underline">Manage</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

