"use client";

import React, { useState, useEffect } from 'react';
import { RecruitmentSettingsService } from '../../services';
import {
    FileText,
    DollarSign,
    CheckCircle,
    Clock,
    Download
} from 'lucide-react';

export default function InvoiceProcessingPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-500" />
                        Vendor Invoices
                    </h1>
                    <p className="text-slate-500 text-sm">Process payments and reconcile with timesheets.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Invoices */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-500" /> Pending Approval
                    </h3>
                    {[
                        { id: 'INV-2023-001', vendor: 'TechStaff Solutions', amount: '$12,450.00', date: 'Dec 01, 2023', items: 'Nov Timesheets (140 Hrs)' },
                        { id: 'INV-2023-089', vendor: 'Design Hive', amount: '$4,200.00', date: 'Dec 03, 2023', items: 'Project Milestone: UI Kit' },
                    ].map((inv, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-bold text-lg text-slate-900 dark:text-slate-100">{inv.vendor}</span>
                                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{inv.id}</span>
                                </div>
                                <div className="text-sm text-slate-500">{inv.items}</div>
                                <div className="text-xs text-slate-400 mt-2">Received: {inv.date}</div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-xl font-bold text-indigo-600">{inv.amount}</div>
                                    <div className="text-xs text-slate-400">Net 45</div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700">Approve</button>
                                    <button className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800">Reject</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-2xl p-6 shadow-lg">
                        <h4 className="font-bold text-indigo-100 mb-2">Total Payable (Dec)</h4>
                        <div className="text-3xl font-bold mb-4">$45,280.00</div>
                        <div className="h-px bg-white/20 mb-4"></div>
                        <div className="space-y-2 text-sm opacity-90">
                            <div className="flex justify-between">
                                <span>Tech Services</span>
                                <span>$32k</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Design</span>
                                <span>$13k</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h4 className="font-bold mb-4">Recent Payments</h4>
                        <div className="space-y-4">
                            {[
                                { vendor: 'Global Manpower', amt: '$8,500', date: 'Nov 28' },
                                { vendor: 'TechStaff Solutions', amt: '$11,200', date: 'Nov 15' },
                            ].map((pay, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-full">
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-700 dark:text-slate-300">{pay.vendor}</div>
                                            <div className="text-xs text-slate-400">{pay.date}</div>
                                        </div>
                                    </div>
                                    <div className="font-mono text-slate-600 dark:text-slate-400">{pay.amt}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
