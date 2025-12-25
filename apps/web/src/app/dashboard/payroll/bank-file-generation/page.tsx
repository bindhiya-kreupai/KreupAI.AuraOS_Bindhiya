"use client";

import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    FileSpreadsheet,
    Download,
    CheckCircle2,
    Settings,
    ArrowRight,
    RefreshCw
} from 'lucide-react';
import { BankFileService } from '../services';

export default function BankFileGenerationPage() {
    const [bankFiles, setBankFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // BankFileService doesn't have a getAll method, keeping mock data
        } catch {
                    } finally {
            setLoading(false);
        }
    };
    const banks = [
        { id: 1, name: 'HDFC Bank', format: 'Excel (.xlsx)', status: 'Ready', lastGenerated: '2 mins ago' },
        { id: 2, name: 'ICICI Bank', format: 'Text (.txt)', status: 'Pending', lastGenerated: '1 month ago' },
        { id: 3, name: 'SBI', format: 'CSV', status: 'Ready', lastGenerated: '5 mins ago' }
    ];

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-indigo-500" />
                        Bank File Generation
                    </h1>
                    <p className="text-slate-500 text-sm">Generate salary transfer files compatible with corporate banking portals.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Configure Formats
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Generator */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Select Bank Format</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {banks.map(bank => (
                                <div key={bank.id} className={`p-4 rounded-xl border cursor-pointer transition-all ${bank.status === 'Ready'
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-500'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60'
                                    }`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold">{bank.name}</div>
                                        {bank.status === 'Ready' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                    </div>
                                    <div className="text-xs text-slate-500 mb-4">Format: {bank.format}</div>
                                    <button className="w-full py-2 bg-white dark:bg-slate-900 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-900 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                                        <Download className="w-3 h-3" /> Download File
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-4">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                            <CreditCard className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-indigo-900 dark:text-indigo-100">Direct Integration Available</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 mb-3">Connect directly with HDFC and ICICI corporate banking to process salaries without manual file uploads.</p>
                            <button className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                                Setup Integration <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status Sidebar */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h4 className="font-bold mb-4">Batch Summary</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Total Employees</span>
                                <span className="font-bold">158</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Total Net Pay</span>
                                <span className="font-bold font-mono">$452,100.00</span>
                            </div>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Payment Date</span>
                                <span className="font-bold">31 Dec 2025</span>
                            </div>
                        </div>
                        <button className="hidden w-full mt-6 py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" /> Regenerating...
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
