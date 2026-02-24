"use client";

import React, { useState } from 'react';
import {
    Microscope,
    DollarSign,
    PieChart,
    FileText
} from 'lucide-react';

export default function ResearchGrantsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Microscope className="w-6 h-6 text-indigo-500" />
                        Research Grants
                    </h1>
                    <p className="text-slate-500 text-sm">Manage funding, compliance, and reporting.</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Total Funding: $12.4M</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {[
                    { title: 'AI in Healthcare Diagnosis', pi: 'Dr. A. Turing', source: 'NSF', amount: '$450,000', end: 'Dec 2025', progress: 65 },
                    { title: 'Sustainable Energy Grid', pi: 'Dr. N. Tesla', source: 'DOE', amount: '$1,200,000', end: 'Jun 2026', progress: 30 },
                    { title: 'Marine Biology Study', pi: 'Dr. S. Earle', source: 'NOAA', amount: '$280,000', end: 'Mar 2025', progress: 85 },
                    { title: 'Quantum Computing Algo', pi: 'Dr. R. Feynman', source: 'DARPA', amount: '$850,000', end: 'Sep 2024', progress: 95 },
                ].map((grant, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{grant.title}</h3>
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-500">{grant.source}</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">PI: {grant.pi} • Ends: {grant.end}</p>

                        <div className="flex justify-between items-center mb-2">
                            <div className="text-2xl font-bold text-indigo-600">{grant.amount}</div>
                            <div className="flex gap-2">
                                <button className="p-2 text-slate-400 hover:text-indigo-500 bg-slate-50 dark:bg-slate-800 rounded-lg"><PieChart className="w-4 h-4" /></button>
                                <button className="p-2 text-slate-400 hover:text-indigo-500 bg-slate-50 dark:bg-slate-800 rounded-lg"><FileText className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div className={`h-full ${grant.progress > 90 ? 'bg-emerald-500' : 'bg-indigo-500'
                                }`} style={{ width: `${grant.progress}%` }}></div>
                        </div>
                        <div className="text-right text-xs font-bold text-slate-400 mt-1">{grant.progress}% utilized</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

