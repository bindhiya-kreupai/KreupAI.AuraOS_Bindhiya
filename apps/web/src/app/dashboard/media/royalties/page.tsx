"use client";

import React from 'react';
import {
    CircleDollarSign,
    Repeat,
    Globe,
    FileSpreadsheet,
    CalendarClock,
    TrendingUp
} from 'lucide-react';

export default function RoyaltiesPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CircleDollarSign className="w-6 h-6 text-emerald-500" />
                        Residuals & Royalties
                    </h1>
                    <p className="text-slate-500 text-sm">Automated payout calculations for syndication and streaming.</p>
                </div>
                <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20">
                    <FileSpreadsheet className="w-4 h-4" /> Import Statement
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Dashboard Cards */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg"><Repeat className="w-5 h-5" /></div>
                        <span className="text-sm font-bold text-slate-500">Next Payout Run</span>
                    </div>
                    <div className="text-2xl font-bold">Dec 15, 2024</div>
                    <div className="text-xs text-indigo-500 font-bold flex items-center mt-2">
                        <CalendarClock className="w-3 h-3 mr-1" /> Processing 1,402 payees
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg"><Globe className="w-5 h-5" /></div>
                        <span className="text-sm font-bold text-slate-500">Total Residuals (YTD)</span>
                    </div>
                    <div className="text-2xl font-bold">$4,250,500</div>
                    <div className="text-xs text-emerald-500 font-bold flex items-center mt-2">
                        <TrendingUp className="w-3 h-3 mr-1" /> +12% vs last year
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg"><FileSpreadsheet className="w-5 h-5" /></div>
                        <span className="text-sm font-bold text-slate-500">Pending Audits</span>
                    </div>
                    <div className="text-2xl font-bold">24</div>
                    <div className="text-xs text-slate-400 mt-2">Principals requesting review</div>
                </div>
            </div>

            {/* Payout Details */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex-1 min-h-0 overflow-y-auto">
                <h3 className="font-bold text-lg mb-6">Recent Cycle: Q3 2024 Domestic</h3>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                            <th className="pb-3 pl-2">Talent / Beneficiary</th>
                            <th className="pb-3 text-right">Gross Amount</th>
                            <th className="pb-3 text-right">Agent Fee (10%)</th>
                            <th className="pb-3 text-right">Guild Fee (2%)</th>
                            <th className="pb-3 text-right pr-2">Net Payout</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {[
                            { name: 'Robert Downey Jr.', gross: '$120,000.00', fee: '$12,000.00', guild: '$2,400.00', net: '$105,600.00' },
                            { name: 'Chris Evans', gross: '$95,000.00', fee: '$9,500.00', guild: '$1,900.00', net: '$83,600.00' },
                            { name: 'Mark Ruffalo', gross: '$88,000.00', fee: '$8,800.00', guild: '$1,760.00', net: '$77,440.00' },
                            { name: 'Scarlett Johansson', gross: '$110,000.00', fee: '$11,000.00', guild: '$2,200.00', net: '$96,800.00' },
                        ].map((row, i) => (
                            <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="py-4 pl-2 font-bold text-slate-700 dark:text-slate-300">{row.name}</td>
                                <td className="py-4 text-right text-slate-600 dark:text-slate-400 font-mono">{row.gross}</td>
                                <td className="py-4 text-right text-slate-600 dark:text-slate-400 font-mono text-rose-500">-{row.fee}</td>
                                <td className="py-4 text-right text-slate-600 dark:text-slate-400 font-mono text-rose-500">-{row.guild}</td>
                                <td className="py-4 text-right pr-2 font-bold text-emerald-600 font-mono">{row.net}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

