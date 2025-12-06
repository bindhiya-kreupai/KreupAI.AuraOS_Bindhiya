"use client";

import React, { useState } from 'react';
import {
    FileCheck,
    Search,
    Plane,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

export default function VisaImmigrationPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileCheck className="w-6 h-6 text-indigo-500" />
                        Visa & Immigration
                    </h1>
                    <p className="text-slate-500 text-sm">Track visa status, work permits, and residency.</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search employee or visa..."
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Critical Alerts */}
                <div className="lg:col-span-3 bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-800 flex items-center gap-4">
                    <div className="p-3 bg-rose-100 text-rose-600 rounded-lg"><AlertTriangle className="w-6 h-6" /></div>
                    <div>
                        <h3 className="font-bold text-rose-700 dark:text-rose-400">Expiring Visas</h3>
                        <p className="text-sm text-rose-600 dark:text-rose-300">3 Work Permits are expiring within the next 30 days. Action required.</p>
                    </div>
                </div>

                {/* Visa List */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Country</th>
                                <th className="px-6 py-4">Visa Type</th>
                                <th className="px-6 py-4">Expiry Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { emp: 'John Smith', country: 'United Kingdom', type: 'Skilled Worker', exp: 'Nov 15, 2024', status: 'Expiring Soon' },
                                { emp: 'Maria Garcia', country: 'United States', type: 'H-1B', exp: 'Jun 20, 2026', status: 'Active' },
                                { emp: 'Yuki Tanaka', country: 'Japan', type: 'Intra-Company', exp: 'Feb 10, 2025', status: 'Active' },
                                { emp: 'Ahmed Hassan', country: 'UAE', type: 'Golden Visa', exp: 'Jan 01, 2030', status: 'Active' },
                            ].map((visa, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-bold">{visa.emp}</td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <Plane className="w-4 h-4 text-slate-400" /> {visa.country}
                                    </td>
                                    <td className="px-6 py-4">{visa.type}</td>
                                    <td className={`px-6 py-4 font-mono ${visa.status === 'Expiring Soon' ? 'text-rose-600 font-bold' : ''}`}>{visa.exp}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${visa.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                            }`}>{visa.status}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-indigo-600 font-bold hover:underline">Details</button>
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
