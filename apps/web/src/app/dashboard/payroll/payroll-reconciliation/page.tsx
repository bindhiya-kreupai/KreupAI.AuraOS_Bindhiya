"use client";

import React, { useState, useEffect } from 'react';
import {
    GitCompare,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
    Search,
    Loader2
} from 'lucide-react';
import { PayrollRunService } from '../services';
import type { PayrollRun } from '../types';

export default function PayrollReconciliationPage() {
    const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await PayrollRunService.getPayrollRuns();
            setPayrollRuns(result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-slate-500 font-medium">Loading reconciliation data...</p>
                </div>
            </div>
        );
    }

    const currentRun = payrollRuns[0];
    const previousRun = payrollRuns[1];

    const grossPayVariance = currentRun && previousRun ? currentRun.totalGrossPay - previousRun.totalGrossPay : 0;
    const grossPayPct = previousRun?.totalGrossPay ? ((grossPayVariance / previousRun.totalGrossPay) * 100).toFixed(1) : '0.0';
    const headcountChange = currentRun && previousRun ? currentRun.totalEmployees - previousRun.totalEmployees : 0;
    const deductionVariance = currentRun && previousRun ? currentRun.totalDeductions - previousRun.totalDeductions : 0;

    const discrepancies = currentRun?.exceptions?.map(exc => ({
        type: exc.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        desc: exc.message,
        amount: '',
        impact: exc.severity === 'high' ? 'High' : exc.severity === 'medium' ? 'Medium' : 'Low',
    })) || [];

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
                        {currentRun && previousRun ? (
                            <option>{currentRun.monthName} vs {previousRun.monthName}</option>
                        ) : (
                            <option>No data to compare</option>
                        )}
                    </select>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                        Run Comparison
                    </button>
                </div>
            </div>

            {payrollRuns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <GitCompare className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                    <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No Payroll Runs Available</h3>
                    <p className="text-sm text-slate-500 mt-1">Process payroll runs to enable reconciliation comparisons.</p>
                </div>
            ) : (
                <>
                    {/* Summary Variance */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="text-xs font-bold text-slate-500 uppercase">Gross Pay Variance</div>
                            <div className="flex items-end gap-2 mt-2">
                                <span className="text-3xl font-bold text-indigo-600">
                                    {grossPayVariance >= 0 ? '+' : ''}${Math.abs(grossPayVariance).toLocaleString()}
                                </span>
                                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold mb-1">{grossPayVariance >= 0 ? '+' : ''}{grossPayPct}%</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="text-xs font-bold text-slate-500 uppercase">Headcount Change</div>
                            <div className="flex items-end gap-2 mt-2">
                                <span className="text-3xl font-bold text-emerald-600">
                                    {headcountChange >= 0 ? '+' : ''}{headcountChange}
                                </span>
                                <span className="text-xs text-slate-400 mb-1 font-medium">{headcountChange >= 0 ? 'New Joinees' : 'Exits'}</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="text-xs font-bold text-slate-500 uppercase">Deduction Variance</div>
                            <div className="flex items-end gap-2 mt-2">
                                <span className="text-3xl font-bold text-slate-700 dark:text-slate-300">
                                    {deductionVariance >= 0 ? '+' : '-'}${Math.abs(deductionVariance).toLocaleString()}
                                </span>
                                <span className="text-xs text-slate-400 mb-1 font-medium">{Math.abs(deductionVariance) < 500 ? 'Marginal' : 'Significant'} Change</span>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Variances */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-sm">Discrepancy Report</h3>
                            <div className="flex items-center gap-2">
                                {discrepancies.filter(d => d.impact === 'High').length > 0 && (
                                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">
                                        {discrepancies.filter(d => d.impact === 'High').length} High Priority
                                    </span>
                                )}
                            </div>
                        </div>
                        {discrepancies.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
                                <p className="text-sm text-slate-500 font-medium">No discrepancies found. Payroll is clean.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {discrepancies.map((item, i) => (
                                    <div key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2 rounded-lg ${item.impact === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm">{item.type}</h4>
                                                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-[10px] font-bold uppercase mt-1 ${item.impact === 'High' ? 'text-rose-600' : 'text-slate-400'}`}>{item.impact} Impact</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
