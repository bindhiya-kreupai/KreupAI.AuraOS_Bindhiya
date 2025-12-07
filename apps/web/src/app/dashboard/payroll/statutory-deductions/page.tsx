"use client";

import React, { useState } from 'react';
import {
    PiggyBank,
    Calendar,
    Download,
    FileText,
    AlertCircle,
    CheckCircle2,
    DollarSign,
    MoreVertical
} from 'lucide-react';

export default function StatutoryDeductionsPage() {
    const deductions = [
        {
            id: 1,
            name: 'Provident Fund (PF)',
            type: 'Monthly',
            dueDate: '15th',
            status: 'Pending',
            amount: 452000,
            employees: 142
        },
        {
            id: 2,
            name: 'Employee State Insurance (ESI)',
            type: 'Monthly',
            dueDate: '15th',
            status: 'Paid',
            amount: 85600,
            employees: 45
        },
        {
            id: 3,
            name: 'Professional Tax (PT)',
            type: 'Monthly',
            dueDate: '10th',
            status: 'Pending',
            amount: 32000,
            employees: 158
        },
        {
            id: 4,
            name: 'TDS (Income Tax)',
            type: 'Monthly',
            dueDate: '7th',
            status: 'Overdue',
            amount: 1250000,
            employees: 110
        }
    ];

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <PiggyBank className="w-6 h-6 text-indigo-500" />
                        Statutory Deductions
                    </h1>
                    <p className="text-slate-500 text-sm">Track and manage statutory compliance payments (PF, ESI, TDS).</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                        <Download className="w-4 h-4" /> Reports
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                        Record Payment
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase">Total Liability</div>
                        <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">$18,196</div>
                        <div className="text-xs text-slate-400 mt-1">For current month</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase">Overdue Amount</div>
                        <div className="text-2xl font-bold mt-1 text-rose-600">$12,500</div>
                        <div className="text-xs text-rose-400 mt-1 font-bold">Action Required</div>
                    </div>
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase">Compliance Score</div>
                        <div className="text-2xl font-bold mt-1 text-emerald-600">92%</div>
                        <div className="text-xs text-slate-400 mt-1">Last audit: Nov 01</div>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-sm">Deduction Tracker (December 2025)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Statutory Head</th>
                                <th className="px-6 py-3">Due Date</th>
                                <th className="px-6 py-3">Employees</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {deductions.map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold">{row.name}</div>
                                        <div className="text-xs text-slate-500">{row.type} Filing</div>
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        {row.dueDate}
                                    </td>
                                    <td className="px-6 py-4">{row.employees}</td>
                                    <td className="px-6 py-4 font-mono font-bold">${row.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${row.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' :
                                                row.status === 'Overdue' ? 'bg-rose-100 text-rose-600' :
                                                    'bg-amber-100 text-amber-600'
                                            }`}>{row.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
