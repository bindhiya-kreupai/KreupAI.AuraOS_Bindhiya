"use client";

import React, { useState, useEffect } from 'react';
import {
    Banknote,
    PieChart,
    ArrowRight,
    TrendingDown,
    Calendar,
    FileMinus,
    Loader2
} from 'lucide-react';
import { LoanService } from '../services';
import type { EmployeeLoan } from '../types';

export default function LoansPage() {
    const [loans, setLoans] = useState<EmployeeLoan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await LoanService.getLoans();
            setLoans(result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'disbursed');
    const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.remainingBalance, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-slate-500 font-medium">Loading loan data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Banknote className="w-6 h-6 text-emerald-500" />
                        Loans & Recoveries
                    </h1>
                    <p className="text-slate-500 text-sm">Track active employee loans and manage monthly EMI deductions.</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100 dark:border-emerald-800/30">
                    <TrendingDown className="w-4 h-4" /> Total Outstanding: ${totalOutstanding.toLocaleString()}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Active Loans */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">Active Loan Deductions</h3>
                    {activeLoans.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Banknote className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No Active Loans</h3>
                            <p className="text-sm text-slate-500 mt-1">There are no active loan deductions at this time.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeLoans.map((l) => {
                                const progressPct = l.principalAmount > 0 ? (l.totalRecovered / l.principalAmount) * 100 : 0;
                                const remainingInstallments = l.emiAmount > 0 ? Math.ceil(l.remainingBalance / l.emiAmount) : 0;
                                const isClosingSoon = remainingInstallments <= 2;

                                return (
                                    <div key={l.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-slate-800 dark:text-slate-200">{l.employeeName}</h3>
                                                <div className="text-xs text-slate-500 font-bold">{l.loanType.replace(/_/g, ' ')} - {l.loanNumber}</div>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded
                                                ${isClosingSoon ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}
                                            `}>
                                                {isClosingSoon ? 'Closing Soon' : 'Active'}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>Progress</span>
                                                <span className="font-bold text-slate-700 dark:text-slate-300">${l.totalRecovered.toLocaleString()} / ${l.principalAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(progressPct, 100)}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800">
                                            <div className="text-center">
                                                <div className="text-xs text-slate-400 font-bold uppercase">Monthly EMI</div>
                                                <div className="text-lg font-bold text-slate-700 dark:text-slate-300">${l.emiAmount.toLocaleString()}</div>
                                            </div>
                                            <div className="text-center border-l border-slate-100 dark:border-slate-800 pl-4">
                                                <div className="text-xs text-slate-400 font-bold uppercase">Installments Left</div>
                                                <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{remainingInstallments}</div>
                                            </div>
                                            <div className="text-right">
                                                <button className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                                                    View Schedule <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <FileMinus className="w-5 h-5 text-rose-500" /> Stop / Skip EMI
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">Temporarily pause deduction for a month.</p>

                        <div className="space-y-3">
                            <input type="text" placeholder="Employee Name..." className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold" />
                            <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold">
                                <option>Skip current month only</option>
                                <option>Defer to end of tenure</option>
                                <option>Stop permanently (Settled)</option>
                            </select>
                            <textarea placeholder="Reason for skipping..." rows={2} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold"></textarea>
                            <button className="w-full py-2 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600">
                                Update Deduction
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

