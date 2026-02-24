"use client";

import React, { useState } from 'react';
import {
    Scale,
    FileCheck,
    AlertOctagon,
    Search,
    CheckCircle
} from 'lucide-react';

export default function RegulatoryCompliancePage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Scale className="w-6 h-6 text-indigo-500" />
                        Regulatory Compliance
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor adherence to financial regulations and KYC/AML policies.</p>
                </div>
                <button className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 flex items-center gap-2">
                    <FileCheck className="w-4 h-4" /> Run Audit
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Compliance Score</div>
                    <div className="text-4xl font-bold text-emerald-600">98%</div>
                    <div className="text-xs text-slate-400 mt-1">Last Audit: Today</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Pending KYC</div>
                    <div className="text-4xl font-bold text-slate-700 dark:text-slate-300">42</div>
                    <div className="text-xs text-amber-500 font-bold mt-1">Requires Attention</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">SAR Reports</div>
                    <div className="text-4xl font-bold text-rose-600">3</div>
                    <div className="text-xs text-slate-400 mt-1">Suspicious Activity Reports</div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-lg mb-4">Regulatory Checklist</h3>
                <div className="space-y-1">
                    {[
                        { item: 'AML Transaction Monitoring', status: 'Compliant', date: 'Continuous', level: 'High' },
                        { item: 'GDPR Data Privacy Review', status: 'Compliant', date: 'Dec 01, 2024', level: 'High' },
                        { item: 'Quarterly Federal Reporting', status: 'In Progress', date: 'Due Dec 15', level: 'Medium' },
                        { item: 'Staff Compliance Training', status: 'Warning', date: '85% Completed', level: 'Low' },
                    ].map((row, i) => (
                        <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${row.status === 'Compliant' ? 'bg-emerald-100 text-emerald-600' :
                                    row.status === 'Warning' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                                    }`}>
                                    {row.status === 'Compliant' ? <CheckCircle className="w-4 h-4" /> : <AlertOctagon className="w-4 h-4" />}
                                </div>
                                <div>
                                    <div className="font-bold">{row.item}</div>
                                    <div className="text-xs text-slate-500">{row.date}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-400 uppercase">{row.level} Priority</span>
                                <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-all">
                                    <Search className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

