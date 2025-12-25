"use client";

import React, { useState, useEffect } from 'react';
import {
    GitCompare,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
    Search
} from 'lucide-react';
import { PayrollRunService } from '../services';

export default function PayrollReconciliationPage() {
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
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GitCompare className="w-6 h-6 text-indigo-500" />
                        Payroll Reconciliation
                    </h1>
                    <p className="text-slate-500 text-sm">Compare current payroll run against previous month to identify variances.</p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-sm font-bold">
                        <option>Dec 2025 vs Nov 2025</option>
                    </select>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                        Run Comparison
                    </button>
                </div>
            </div>

            {/* Summary Variance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase">Gross Pay Variance</div>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-indigo-600">+$12,450</span>
                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold mb-1">+2.4%</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase">Headcount Change</div>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-emerald-600">+4</span>
                        <span className="text-xs text-slate-400 mb-1 font-medium">New Joinees</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase">Deduction Variance</div>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-slate-700 dark:text-slate-300">-$240</span>
                        <span className="text-xs text-slate-400 mb-1 font-medium">Marginal Drop</span>
                    </div>
                </div>
            </div>

            {/* Detailed Variances */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-sm">Discrepancy Report</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">3 High Priority</span>
                    </div>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                        { type: 'Salary', desc: 'Base salary increase for Engineering Dept', amount: '+$8,000', impact: 'High' },
                        { type: 'New Hire', desc: '3 new Developers joined Dec 1st', amount: '+$4,500', impact: 'High' },
                        { type: 'LOP', desc: 'Loss of Pay recorded for 5 employees', amount: '-$1,200', impact: 'Medium' },
                        { type: 'Tax', desc: 'TDS adjustment for year-end', amount: '+$1,150', impact: 'Low' },
                    ].map((item, i) => (
                        <div key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-lg ${item.amount.startsWith('+') ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                    {item.amount.startsWith('+') ? <ArrowRight className="w-5 h-5 -rotate-45" /> : <ArrowRight className="w-5 h-5 rotate-45" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{item.type} Variance</h4>
                                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono font-bold">{item.amount}</div>
                                <div className={`text-[10px] font-bold uppercase mt-1 ${item.impact === 'High' ? 'text-rose-600' : 'text-slate-400'
                                    }`}>{item.impact} Impact</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
