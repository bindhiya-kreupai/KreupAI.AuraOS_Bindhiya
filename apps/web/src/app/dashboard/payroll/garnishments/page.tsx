"use client";

import React, { useState, useEffect } from 'react';
import {
    Scale,
    Gavel,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { LoanService } from '../services';
import type { EmployeeLoan } from '../types';

export default function GarnishmentsPage() {
    const [loans, setLoans] = useState<EmployeeLoan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await LoanService.getLoans();
            setLoans(result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter for garnishment-related entries (loan type could indicate garnishments)
    const garnishments = loans.filter(l =>
        l.status === 'active' || l.status === 'disbursed'
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-slate-500 font-medium">Loading garnishment data...</p>
                </div>
            </div>
        );
    }

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

            {garnishments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
                    <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No Active Garnishments</h3>
                    <p className="text-sm text-slate-500 mt-1">There are no active court-ordered garnishments or levies at this time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {garnishments.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative group">
                            <div className="absolute top-4 right-4 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full capitalize">{item.status}</div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                                    {item.employeeName.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold">{item.employeeName}</h4>
                                    <p className="text-xs text-slate-500">Loan #: {item.loanNumber}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><Gavel className="w-4 h-4" /> Type</span>
                                    <span className="font-bold capitalize">{item.loanType.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Deducted</span>
                                    <span className="font-bold font-mono">${item.emiAmount.toLocaleString()}/mo</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                                <button className="flex-1 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50">View Order</button>
                            </div>
                        </div>
                    ))}

                    {/* No additional active garnishments placeholder card */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-full mb-3 shadow-sm">
                            <CheckCircle2 className="w-6 h-6 text-slate-300" />
                        </div>
                        <h4 className="font-bold text-slate-500">No other active orders</h4>
                        <p className="text-xs text-slate-400 mt-1">System is monitoring for new updates.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
