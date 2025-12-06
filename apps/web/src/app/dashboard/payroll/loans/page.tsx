"use client";

import React from 'react';
import {
    Banknote,
    PieChart,
    ArrowRight,
    TrendingDown,
    Calendar,
    FileMinus
} from 'lucide-react';

export default function LoansPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Banknote className="w-6 h-6 text-emerald-500" />
                        Loans & Recoveries
                    </h1>
                    <p className="text-slate-500 text-sm">Track active employee loans and manage monthly EMI deductions.</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100 dark:border-emerald-800/30">
                    <TrendingDown className="w-4 h-4" /> Total Outstanding: $45,200
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Active Loans */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">Active Loan Deductions</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Michael Scott', purpose: 'Personal Loan', total: '$5,000', paid: '$2,500', emi: '$500', remaining: 5, status: 'Active' },
                            { name: 'Jim Halpert', purpose: 'Car Advance', total: '$10,000', paid: '$1,000', emi: '$1,000', remaining: 9, status: 'Active' },
                            { name: 'Pam Beesly', purpose: 'Education Loan', total: '$3,000', paid: '$2,800', emi: '$200', remaining: 1, status: 'Closing Soon' },
                        ].map((l, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200">{l.name}</h3>
                                        <div className="text-xs text-slate-500 font-bold">{l.purpose}</div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded 
                                        ${l.status === 'Closing Soon' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}
                                    `}>
                                        {l.status}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Progress</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{l.paid} / {l.total}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(parseInt(l.paid.replace('$', '').replace(',', '')) / parseInt(l.total.replace('$', '').replace(',', ''))) * 100}%` }}></div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800">
                                    <div className="text-center">
                                        <div className="text-xs text-slate-400 font-bold uppercase">Monthly EMI</div>
                                        <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{l.emi}</div>
                                    </div>
                                    <div className="text-center border-l border-slate-100 dark:border-slate-800 pl-4">
                                        <div className="text-xs text-slate-400 font-bold uppercase">Installments Left</div>
                                        <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{l.remaining}</div>
                                    </div>
                                    <div className="text-right">
                                        <button className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                                            View Schedule <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-6">
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
