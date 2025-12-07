'use client';

import React from 'react';
import { Layers, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const SKILL_GAPS = [
    { role: 'Senior React Developer', available: 12, needed: 20, gap: -8, criticality: 'High' },
    { role: 'Data Scientist', available: 5, needed: 8, gap: -3, criticality: 'High' },
    { role: 'Project Manager', available: 15, needed: 15, gap: 0, criticality: 'Low' },
    { role: 'UX Designer', available: 8, needed: 12, gap: -4, criticality: 'Medium' },
    { role: 'QA Engineer', available: 22, needed: 25, gap: -3, criticality: 'Medium' },
];

export default function GapAnalysisPage() {
    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Layers className="w-6 h-6 text-rose-500" />
                        Gap Analysis
                    </h1>
                    <p className="text-slate-500 text-sm">Identify discrepancies between current capabilities and future needs.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4">Role / Skill Set</th>
                            <th className="px-6 py-4 text-center">Current Supply</th>
                            <th className="px-6 py-4 text-center">Future Demand</th>
                            <th className="px-6 py-4 text-center">Net Gap</th>
                            <th className="px-6 py-4">Criticality</th>
                            <th className="px-6 py-4">Action Plan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {SKILL_GAPS.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-bold">{item.role}</td>
                                <td className="px-6 py-4 text-center text-slate-500">{item.available}</td>
                                <td className="px-6 py-4 text-center text-slate-500">{item.needed}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`font-bold px-2 py-1 rounded ${item.gap < 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {item.gap > 0 ? '+' : ''}{item.gap}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-bold uppercase ${item.criticality === 'High' ? 'text-red-500' :
                                            item.criticality === 'Medium' ? 'text-orange-500' :
                                                'text-slate-400'
                                        }`}>
                                        {item.criticality}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {item.gap < 0 ? (
                                        <button className="text-indigo-600 font-medium text-xs hover:underline flex items-center gap-1">
                                            Start Hiring <ArrowRight className="w-3 h-3" />
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
                                            <CheckCircle className="w-3 h-3" /> Balanced
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
