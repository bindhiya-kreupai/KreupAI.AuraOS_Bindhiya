"use client";

import React from 'react';
import {
    Landmark,
    TrendingUp,
    Users,
    Table,
    Award,
    Scale
} from 'lucide-react';

export default function CivilServicePage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Landmark className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        Civil Service Grades
                    </h1>
                    <p className="text-slate-500 text-sm">Manage GS levels, step promotions, and public sector pay scales.</p>
                </div>
                <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                    <Scale className="w-4 h-4" /> Adjust COLA
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Pay Matrix */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full overflow-hidden">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Table className="w-5 h-5 text-indigo-500" /> General Schedule (GS) Matrix - 2024
                    </h3>
                    <div className="overflow-auto flex-1 border rounded-xl border-slate-100 dark:border-slate-800">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-500">Grade</th>
                                    <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-500">Step 1</th>
                                    <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-500">Step 5</th>
                                    <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-500">Step 10</th>
                                    <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-500">Within-Grade Increase</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { grade: 'GS-15', s1: '$123,041', s5: '$139,445', s10: '$159,950', wait: '3 Years' },
                                    { grade: 'GS-14', s1: '$104,604', s5: '$118,552', s10: '$135,987', wait: '2 Years' },
                                    { grade: 'GS-13', s1: '$88,520', s5: '$100,320', s10: '$115,070', wait: '2 Years' },
                                    { grade: 'GS-12', s1: '$74,441', s5: '$84,365', s10: '$96,770', wait: '1 Year' },
                                    { grade: 'GS-11', s1: '$62,107', s5: '$70,387', s10: '$80,737', wait: '1 Year' },
                                    { grade: 'GS-09', s1: '$51,332', s5: '$58,176', s10: '$66,731', wait: '1 Year' },
                                    { grade: 'GS-07', s1: '$41,966', s5: '$47,561', s10: '$54,557', wait: '1 Year' },
                                    { grade: 'GS-05', s1: '$33,878', s5: '$38,394', s10: '$44,039', wait: '1 Year' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-50 dark:border-slate-900">
                                        <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{row.grade}</td>
                                        <td className="p-3 font-mono">{row.s1}</td>
                                        <td className="p-3 font-mono">{row.s5}</td>
                                        <td className="p-3 font-mono">{row.s10}</td>
                                        <td className="p-3 text-slate-500 text-xs font-bold uppercase">{row.wait}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Promotions Box */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-2xl p-6 shadow-lg">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" /> Promotion Eligibility
                        </h3>
                        <div className="text-4xl font-bold mb-1">128</div>
                        <div className="text-sm opacity-80 mb-6">Staff eligible for Step Increase next month.</div>
                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors">
                            Review List
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Grade Distribution</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Senior Executive (SES)', val: '2%', color: 'bg-purple-500' },
                                { label: 'GS-13 to GS-15', val: '18%', color: 'bg-indigo-500' },
                                { label: 'GS-09 to GS-12', val: '45%', color: 'bg-blue-500' },
                                { label: 'GS-01 to GS-08', val: '35%', color: 'bg-sky-400' },
                            ].map((d, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                        <span>{d.label}</span>
                                        <span>{d.val}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${d.color}`} style={{ width: d.val }}></div>
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

