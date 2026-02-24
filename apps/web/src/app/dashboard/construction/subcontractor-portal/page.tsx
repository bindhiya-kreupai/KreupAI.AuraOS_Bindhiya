"use client";

import React, { useState } from 'react';
import {
    Users,
    FileSignature,
    CreditCard,
    Plus
} from 'lucide-react';

export default function SubcontractorPortalPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Subcontractor Portal
                    </h1>
                    <p className="text-slate-500 text-sm">Manage contracts, invoices, and performance of subcontractors.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Vendor
                </button>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Subcontractor</th>
                            <th className="px-6 py-4">Specialty</th>
                            <th className="px-6 py-4">Active Contract</th>
                            <th className="px-6 py-4">Pending Invoice</th>
                            <th className="px-6 py-4">Performance</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                            { name: 'ABC Electricals', type: 'Electrical', contract: '$250k', invoice: '$12,500', rating: 4.8 },
                            { name: 'StrongBuild Concrete', type: 'Civil', contract: '$1.2M', invoice: '$85,000', rating: 4.2 },
                            { name: 'Flow Plumbing Co.', type: 'Plumbing', contract: 'Ended', invoice: '--', rating: 3.5 },
                            { name: 'SafeGlass Solutions', type: 'Glazing', contract: '$150k', invoice: '$4,200', rating: 4.9 },
                        ].map((sub, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4 font-bold">{sub.name}</td>
                                <td className="px-6 py-4 text-slate-500">{sub.type}</td>
                                <td className="px-6 py-4 font-mono">{sub.contract}</td>
                                <td className="px-6 py-4 font-mono text-indigo-600 font-bold">{sub.invoice}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1">
                                        <span className={`font-bold ${sub.rating >= 4.5 ? 'text-emerald-600' : 'text-amber-600'
                                            }`}>{sub.rating}</span>
                                        <span className="text-xs text-slate-400">/ 5.0</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center flex justify-center gap-2">
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500"><FileSignature className="w-4 h-4" /></button>
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500"><CreditCard className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

