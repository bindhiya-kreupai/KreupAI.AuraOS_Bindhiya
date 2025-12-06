"use client";

import React from 'react';
import {
    ShieldCheck,
    FileCheck,
    AlertCircle,
    Download,
    Eye
} from 'lucide-react';

export default function ComplianceDocsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-indigo-500" />
                        Vendor Compliance
                    </h1>
                    <p className="text-slate-500 text-sm">Track and verify mandatory legal and security documents.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Overview */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-emerald-900 rounded-full text-emerald-600">
                            <FileCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">92%</div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-300">Docs Verified</div>
                        </div>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-amber-900 rounded-full text-amber-600">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">3</div>
                            <div className="text-xs text-amber-600 dark:text-amber-300">Expiring Soon</div>
                        </div>
                    </div>
                </div>

                {/* Document List */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 font-bold">Document Repository</div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Vendor</th>
                                    <th className="px-6 py-4">Document Type</th>
                                    <th className="px-6 py-4">Expiry Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { vendor: 'TechStaff Solutions', doc: 'Master Service Agreement (MSA)', expiry: 'Dec 31, 2025', status: 'Valid' },
                                    { vendor: 'Global Manpower', doc: 'Liability Insurance', expiry: 'Jan 15, 2024', status: 'Expiring Soon' },
                                    { vendor: 'Design Hive', doc: 'Non-Disclosure Agreement (NDA)', expiry: 'Indefinite', status: 'Valid' },
                                    { vendor: 'CodeWorks Inc.', doc: 'ISO 27001 Certificate', expiry: 'Nov 20, 2023', status: 'Expired' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{row.vendor}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{row.doc}</td>
                                        <td className="px-6 py-4 font-mono text-slate-500">{row.expiry}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold 
                                                ${row.status === 'Valid' ? 'bg-emerald-100 text-emerald-700' :
                                                    row.status === 'Expiring Soon' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-rose-100 text-rose-700'}
                                            `}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex justify-end gap-2">
                                            <button className="p-1 hover:text-indigo-600"><Eye className="w-4 h-4" /></button>
                                            <button className="p-1 hover:text-indigo-600"><Download className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Upload Panel */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold mb-4">Request Document</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Select Vendor</label>
                            <select className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none">
                                <option>TechStaff Solutions</option>
                                <option>Global Manpower</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Document Type</label>
                            <select className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none">
                                <option>Updated Insurance Policy</option>
                                <option>Tax Compliance Certificate</option>
                            </select>
                        </div>
                        <button className="w-full py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 mt-2">
                            Send Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
