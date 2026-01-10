"use client";

import React from 'react';
import {
    Receipt,
    Upload,
    DollarSign,
    CreditCard,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { useRemoteWork } from '../hooks/useRemoteWork';

export default function ExpenseManagementPage() {
    const { loading, error, employees } = useRemoteWork();

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center text-rose-500 font-bold">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Receipt className="w-6 h-6 text-indigo-500" />
                        Remote Expenses
                    </h1>
                    <p className="text-slate-500 text-sm">Submit and track reimbursements for home office setups.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                    <Upload className="w-4 h-4" /> New Claim
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-indigo-500 text-white p-6 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none lg:col-span-2 flex flex-col justify-between">
                    <div>
                        <div className="text-sm font-bold opacity-80 mb-1">Available Allowance</div>
                        <div className="text-4xl font-black">$850.00</div>
                    </div>
                    <div className="text-xs font-bold bg-white/20 self-start px-2 py-1 rounded mt-4">Resets Jan 1st</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Pending</div>
                    <div className="text-3xl font-black text-amber-500">$120.00</div>
                    <div className="text-xs text-slate-400 mt-2">1 active claim</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Total Paid</div>
                    <div className="text-3xl font-black text-emerald-500">$2,150</div>
                    <div className="text-xs text-slate-400 mt-2">Year to date</div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                    <h3 className="font-bold text-sm text-slate-500">Recent Claims</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                        { item: 'Ergonomic Chair', date: 'Oct 24, 2024', amount: '$250.00', status: 'Approved', cat: 'Furniture' },
                        { item: 'Monthly Internet', date: 'Nov 01, 2024', amount: '$60.00', status: 'Processing', cat: 'Connectivity' },
                        { item: 'Monitor Stand', date: 'Sep 15, 2024', amount: '$45.00', status: 'Paid', cat: 'Furniture' },
                    ].map((claim, i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{claim.item}</div>
                                    <div className="text-xs text-slate-500">{claim.date} • {claim.cat}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold">{claim.amount}</div>
                                <div className={`text-[10px] font-bold uppercase ${claim.status === 'Paid' || claim.status === 'Approved' ? 'text-emerald-500' : 'text-amber-500'
                                    }`}>{claim.status}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
