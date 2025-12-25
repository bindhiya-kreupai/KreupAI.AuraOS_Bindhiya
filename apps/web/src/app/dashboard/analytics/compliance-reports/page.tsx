"use client";

import React, { useState, useEffect } from 'react';
import { Scale, CheckCircle, AlertTriangle, XCircle, FileText } from 'lucide-react';
import { ComplianceReportService } from '../services';

const COMPLIANCE_ITEMS = [
    { id: 1, standard: 'Labor Law (Fair Work Act)', status: 'Compliant', score: 98, issues: 0, date: 'Oct 20, 2024' },
    { id: 2, standard: 'GDPR Data Privacy', status: 'At Risk', score: 75, issues: 3, date: 'Oct 15, 2024' },
    { id: 3, standard: 'Health & Safety (OSHA)', status: 'Compliant', score: 100, issues: 0, date: 'Oct 01, 2024' },
    { id: 4, standard: 'ISO 27001 Security', status: 'Non-Compliant', score: 45, issues: 12, date: 'Sep 28, 2024' },
];

export default function ComplianceReportsPage() {
    return (
        <div className="p-6 space-y-8 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                    <Scale className="w-8 h-8 text-indigo-500" />
                    Compliance Reports
                </h1>
                <p className="text-slate-500 mt-2 text-lg">Regulatory adherence tracking and audit readiness.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold mb-1">Overall Score</div>
                    <div className="text-4xl font-bold text-slate-900 dark:text-slate-100">82%</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-500 font-bold mb-1">Pending Audits</div>
                    <div className="text-4xl font-bold text-slate-900 dark:text-slate-100">2</div>
                </div>
                <div className="bg-rose-50 dark:bg-rose-500/10 p-6 rounded-2xl border border-rose-100 dark:border-rose-500/20">
                    <div className="text-rose-600 dark:text-rose-400 font-bold mb-1">Critical Issues</div>
                    <div className="text-4xl font-bold text-slate-900 dark:text-slate-100">15</div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Standard / Regulation</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Current Status</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Score</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Open Issues</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Last Audit</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {COMPLIANCE_ITEMS.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="p-4">
                                    <div className="font-bold text-slate-900 dark:text-slate-100">{item.standard}</div>
                                </td>
                                <td className="p-4">
                                    {item.status === 'Compliant' && (
                                        <span className="flex items-center gap-1 text-emerald-600 font-bold text-sm"><CheckCircle className="w-4 h-4" /> Compliant</span>
                                    )}
                                    {item.status === 'At Risk' && (
                                        <span className="flex items-center gap-1 text-amber-500 font-bold text-sm"><AlertTriangle className="w-4 h-4" /> At Risk</span>
                                    )}
                                    {item.status === 'Non-Compliant' && (
                                        <span className="flex items-center gap-1 text-rose-500 font-bold text-sm"><XCircle className="w-4 h-4" /> Non-Compliant</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 max-w-[100px]">
                                        <div
                                            className={`h-2 rounded-full ${item.score >= 90 ? 'bg-emerald-500' : item.score >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                            style={{ width: `${item.score}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 mt-1 block">{item.score}%</span>
                                </td>
                                <td className="p-4 font-mono text-slate-600 dark:text-slate-400">{item.issues}</td>
                                <td className="p-4 text-sm text-slate-500">{item.date}</td>
                                <td className="p-4 text-right">
                                    <button className="text-indigo-600 font-bold text-sm hover:underline flex items-center justify-end gap-1">
                                        View Report <FileText className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
