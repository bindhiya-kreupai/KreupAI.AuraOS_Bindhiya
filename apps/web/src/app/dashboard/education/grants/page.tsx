"use client";

import React from 'react';
import {
    Banknote,
    PieChart,
    Users,
    Calendar,
    FileCheck
} from 'lucide-react';

export default function GrantsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Banknote className="w-6 h-6 text-emerald-500" />
                        Research Grants
                    </h1>
                    <p className="text-slate-500 text-sm">Manage grant budgets, salary allocations, and compliance.</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-bold border border-emerald-100 dark:border-emerald-800/30">
                    Total Funding: $12.5M
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full min-h-0 overflow-y-auto pb-20">
                {[
                    { title: 'AI in Healthcare', pi: 'Dr. Sarah Connor', funder: 'NIH', budget: '$1,200,000', start: 'Jan 2024', end: 'Dec 2026', staff: 4 },
                    { title: 'Quantum Computing Materials', pi: 'Prof. Sheldon Cooper', funder: 'NSF', budget: '$850,000', start: 'Jun 2024', end: 'May 2027', staff: 3 },
                    { title: 'Climate Change Impact', pi: 'Dr. Ellie Sattler', funder: 'EPA', budget: '$2,100,000', start: 'Sep 2023', end: 'Aug 2028', staff: 6 },
                ].map((grant, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{grant.title}</h3>
                                <div className="text-sm font-bold text-indigo-600">PI: {grant.pi}</div>
                            </div>
                            <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400">
                                {grant.funder}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase mb-1">Total Budget</div>
                                <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{grant.budget}</div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="text-xs text-slate-500 font-bold uppercase mb-1">Timeline</div>
                                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{grant.start} - {grant.end}</div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                                    <Users className="w-4 h-4" /> {grant.staff} Researchers Funded
                                </div>
                                <button className="text-xs font-bold text-indigo-500 hover:underline">View Team</button>
                            </div>

                            {/* Salary Allocation Bar */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                    <span>Salary Allocation</span>
                                    <span>$320k Used / $450k Cap</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[70%] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* New Grant Button */}
                <button className="h-full min-h-[200px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors group">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20">
                        <FileCheck className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-sm">Register New Grant</span>
                </button>
            </div>
        </div>
    );
}

