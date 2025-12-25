"use client";

import React, { useState, useEffect } from 'react';
import {
    Scale,
    Gavel,
    Calendar,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { LoanService } from '../services';

export default function GarnishmentsPage() {
    const [loans, setLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await LoanService.getLoans();
            if (result.length > 0) {
                setLoans(result);
            }
        } catch {
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Scale className="w-6 h-6 text-indigo-500" />
                        Garnishments
                    </h1>
                    <p className="text-slate-500 text-sm">Manage court-ordered wage garnishments and levies.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                    Add New Order
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { name: 'John Doe', type: 'Child Support', amount: '$450/mo', case: 'CS-9281', status: 'Active' },
                    { name: 'Michael Scott', type: 'Tax Levy', amount: '$200/mo', case: 'IRS-1120', status: 'Active' },
                ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative group">
                        <div className="absolute top-4 right-4 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{item.status}</div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                                {item.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold">{item.name}</h4>
                                <p className="text-xs text-slate-500">Case ID: {item.case}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><Gavel className="w-4 h-4" /> Type</span>
                                <span className="font-bold">{item.type}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Deducted</span>
                                <span className="font-bold font-mono">{item.amount}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                            <button className="flex-1 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50">View Order</button>
                        </div>
                    </div>
                ))}

                {/* No active garnishments placeholder card */}
                <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-full mb-3 shadow-sm">
                        <CheckCircle2 className="w-6 h-6 text-slate-300" />
                    </div>
                    <h4 className="font-bold text-slate-500">No other active orders</h4>
                    <p className="text-xs text-slate-400 mt-1">System is monitoring for new updates.</p>
                </div>
            </div>
        </div>
    );
}
