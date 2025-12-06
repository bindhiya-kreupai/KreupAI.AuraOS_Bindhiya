"use client";

import React, { useState } from 'react';
import {
    Truck,
    FileText,
    CreditCard,
    CheckCircle2,
    Clock,
    Search,
    UserPlus,
    MoreHorizontal
} from 'lucide-react';

const VENDORS = [
    { id: 1, name: 'Acme Corp', service: 'Office Supplies', outstanding: 1200, lastPaid: '2 days ago', health: 'Good' },
    { id: 2, name: 'TechSolution Inc', service: 'IT Hardware', outstanding: 54000, lastPaid: '1 month ago', health: 'Warning' },
    { id: 3, name: 'CleanSweep Services', service: 'Facilities', outstanding: 0, lastPaid: '1 week ago', health: 'Good' },
];

export default function VendorFinancePage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Truck className="w-6 h-6 text-indigo-500" />
                        Vendor Finances
                    </h1>
                    <p className="text-slate-500 text-sm">Manage invoices, payments, and vendor contracts.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <UserPlus className="w-4 h-4" /> Add Vendor
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Vendor List */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search vendors..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0">
                                <tr>
                                    <th className="p-4">Vendor</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Outstanding</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {VENDORS.map(v => (
                                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{v.name}</td>
                                        <td className="p-4 text-slate-500">{v.service}</td>
                                        <td className="p-4 font-mono font-bold">${v.outstanding.toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                                ${v.health === 'Warning' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-emerald-100 text-emerald-600'}
                                            `}>
                                                {v.health}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Panel: Pending Invoices */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-500" /> Pending Invoices
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-4">
                        {[
                            { id: 'INV-2029', vendor: 'TechSolution Inc', amount: '$12,400', due: 'Tomorrow' },
                            { id: 'INV-2030', vendor: 'Acme Corp', amount: '$450', due: 'In 5 days' },
                            { id: 'INV-2035', vendor: 'Global Logistics', amount: '$3,200', due: 'Next Week' },
                        ].map(inv => (
                            <div key={inv.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-sm text-slate-700 dark:text-slate-300">{inv.vendor}</div>
                                    <div className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/10 px-2 py-1 rounded">Due {inv.due}</div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="text-xs text-slate-400 font-mono">{inv.id}</div>
                                    <div className="text-lg font-black">{inv.amount}</div>
                                </div>
                                <button className="w-full mt-3 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    Approve Payment
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-500 font-bold">Total Payable</span>
                            <span className="text-lg font-black text-slate-900 dark:text-white">$16,050</span>
                        </div>
                        <button className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md transition-all">
                            Process Batch Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
