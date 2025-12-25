"use client";
// Force rebuild

import React, { useState, useEffect } from 'react';
import {
    CalendarRange,
    CheckCheck,
    AlertTriangle,
    FileBarChart,
    Printer,
    Hourglass
} from 'lucide-react';
import { PayrollRunService } from '../services';

export default function YearEndPage() {
    const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await PayrollRunService.getPayrollRuns();
            if (result.length > 0) {
                setPayrollRuns(result);
            }
        } catch {
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarRange className="w-6 h-6 text-purple-500" />
                        Year-End Processing (FY 2024-25)
                    </h1>
                    <p className="text-slate-500 text-sm">Final settlement, tax reconciliation, and Form 16 generation.</p>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-xl text-sm font-bold border border-purple-100 dark:border-purple-800/30">
                    <Hourglass className="w-4 h-4" /> 25 Days Remaining
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
                {/* Checklist */}
                <div className="lg:col-span-3 space-y-6 overflow-y-auto pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { title: 'Tax Reconciliation', status: 'In Progress', progress: '65%', desc: 'Match TDS deducted vs Tax Payable.' },
                            { title: 'Investment Proofs', status: 'Completed', progress: '100%', desc: 'Verify all 80C/80D proofs.' },
                            { title: 'Full & Final', status: 'Pending', progress: '12%', desc: 'Settle exits before March 31.' },
                        ].map((c, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">{c.title}</h3>
                                <p className="text-xs text-slate-500 mb-4 h-8">{c.desc}</p>
                                <div className="flex justify-between items-end mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded 
                                        ${c.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : c.status === 'In Progress' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}
                                     `}>
                                        {c.status}
                                    </span>
                                    <span className="font-bold text-lg">{c.progress}</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${c.status === 'Completed' ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: c.progress }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" /> Discrepancy Report
                        </h3>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                                    <th className="pb-3 pl-2">Employee</th>
                                    <th className="pb-3">Issue</th>
                                    <th className="pb-3">Impact</th>
                                    <th className="pb-3 text-right pr-2">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {[
                                    { name: 'John Doe', issue: 'PAN Invalid', impact: '20% TDS', action: 'Notify' },
                                    { name: 'Jane Smith', issue: 'Rent Receipts Missing', impact: 'HRA Taxable', action: 'Request' },
                                    { name: 'Mike Ross', issue: 'Negative Salary', impact: 'Recovery Pending', action: 'Adjust' },
                                ].map((row, i) => (
                                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="py-4 pl-2 font-bold text-slate-700 dark:text-slate-300">{row.name}</td>
                                        <td className="py-4 text-rose-500 font-bold">{row.issue}</td>
                                        <td className="py-4 text-slate-600 dark:text-slate-400">{row.impact}</td>
                                        <td className="py-4 text-right pr-2">
                                            <button className="text-xs font-bold text-indigo-500 hover:underline">{row.action}</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Exports */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-indigo-600 text-white rounded-2xl p-6 shadow-lg">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Printer className="w-5 h-5 text-indigo-200" /> Generate Forms
                        </h3>
                        <div className="space-y-2">
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold flex items-center gap-3 px-4 transition-colors">
                                <FileBarChart className="w-4 h-4" /> Form 16 (Part A & B)
                            </button>
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold flex items-center gap-3 px-4 transition-colors">
                                <FileBarChart className="w-4 h-4" /> Form 24Q (Returns)
                            </button>
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold flex items-center gap-3 px-4 transition-colors">
                                <FileBarChart className="w-4 h-4" /> Tax Computation Sheet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
