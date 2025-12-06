"use client";

import React, { useState } from 'react';
import {
    FileText,
    Search,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Plus,
    Calendar,
    PenTool
} from 'lucide-react';

const CONTRACTS = [
    { id: 'CNT-001', title: 'Service Agreement - Acme', party: 'Acme Corp', value: '$120,000', status: 'Active', expiry: 'Jan 2026' },
    { id: 'CNT-002', title: 'NDA - TechStart', party: 'TechStart Inc', value: 'N/A', status: 'Pending Sig', expiry: 'Dec 2025' },
    { id: 'CNT-003', title: 'Lease Agreement - HQ', party: 'RealEstate Ltd', value: '$500,000', status: 'Expiring Soon', expiry: 'Next Month' },
    { id: 'CNT-004', title: 'Software License', party: 'SoftCo', value: '$50,000', status: 'Active', expiry: 'Mar 2026' },
];

export default function ContractsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-500" />
                        Contract Lifecycle
                    </h1>
                    <p className="text-slate-500 text-sm">Draft, review, sign, and track legal agreements.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Plus className="w-4 h-4" /> New Contract
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Active Contracts</div>
                    <div className="text-3xl font-black">142</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Pending Signature</div>
                    <div className="text-3xl font-black text-indigo-600">8</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Expiring (30 Days)</div>
                    <div className="text-3xl font-black text-amber-600">3</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Total Value</div>
                    <div className="text-3xl font-black text-emerald-600">$4.2M</div>
                </div>
            </div>

            {/* Contract List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search contracts..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none border border-transparent focus:border-indigo-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0">
                            <tr>
                                <th className="p-4">Contract Title</th>
                                <th className="p-4">Counterparty</th>
                                <th className="p-4">Value</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Expiry</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {CONTRACTS.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-700 dark:text-slate-300">{c.title}</div>
                                        <div className="text-xs text-slate-400 font-mono">{c.id}</div>
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">{c.party}</td>
                                    <td className="p-4 font-mono font-bold">{c.value}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit
                                            ${c.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                                                c.status === 'Expiring Soon' ? 'bg-rose-100 text-rose-600' :
                                                    'bg-indigo-100 text-indigo-600'}
                                        `}>
                                            {c.status === 'Active' && <CheckCircle2 className="w-3 h-3" />}
                                            {c.status === 'Expiring Soon' && <AlertTriangle className="w-3 h-3" />}
                                            {c.status === 'Pending Sig' && <PenTool className="w-3 h-3" />}
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs font-bold text-slate-500">{c.expiry}</td>
                                    <td className="p-4">
                                        <button className="text-indigo-600 hover:text-indigo-800 font-bold text-xs">View</button>
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
