"use client";

import React from 'react';
import {
    History,
    CalendarClock,
    Calculator,
    CheckCircle2,
    DollarSign,
    AlertCircle
} from 'lucide-react';

export default function ArrearsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <History className="w-6 h-6 text-indigo-500" />
                        Arrears & Retroactive Pay
                    </h1>
                    <p className="text-slate-500 text-sm">Process retroactive salary adjustments and past-dated payments.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-800/30">
                    <CalendarClock className="w-4 h-4" /> Period: Nov 2025
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Pending Arrears */}
                <div className="lg:col-span-2 space-y-6 overflow-y-auto pb-20">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">Pending Calculation</h3>
                        <button className="text-xs font-bold text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition-colors">
                            Recalculate All
                        </button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { name: 'Alice Johnson', type: 'Salary Revision', period: 'Oct 2025', amount: '$450.00', reason: 'Increment effective Oct 1st, processed Nov.' },
                            { name: 'Bob Smith', type: 'Unpaid Leave Reversal', period: 'Sep 2025', amount: '$120.50', reason: 'LOP reversed after medical proof.' },
                            { name: 'Charlie Brown', type: 'Overtime Adjustment', period: 'Oct 2025', amount: '$75.00', reason: 'Missed OT hours log.' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row gap-4 hover:shadow-md transition-all">
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{item.name}</h4>
                                        <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 px-2 py-1 rounded">
                                            {item.type}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 font-bold mb-2">Period: {item.period}</div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{item.reason}"</p>
                                </div>
                                <div className="flex flex-col items-end justify-between border-l border-slate-100 dark:border-slate-800 pl-4 min-w-[120px]">
                                    <div className="text-xl font-bold text-emerald-600">{item.amount}</div>
                                    <div className="flex gap-2 w-full mt-3">
                                        <button className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded text-xs font-bold">Hold</button>
                                        <button className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold">Approve</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calculator Widget */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-indigo-500" /> Manual Entry
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Employee</label>
                                <input type="text" placeholder="Search ID..." className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Component</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold">
                                    <option>Basic Salary</option>
                                    <option>HRA</option>
                                    <option>Special Allowance</option>
                                    <option>Bonus</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Due Amount</label>
                                    <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Paid Amount</label>
                                    <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold" placeholder="0.00" />
                                </div>
                            </div>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
                                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mb-1">Net Arrears</div>
                                <div className="text-2xl font-bold text-emerald-600">$0.00</div>
                            </div>
                            <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">
                                Add to Payroll
                            </button>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm">Tax Implication</h4>
                                <p className="text-xs opacity-80 mt-1 leading-relaxed">
                                    Arrears are taxed in the year of receipt unless Section 89 relief is claimed. Ensure TDS is deducted on payout.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
