"use client";

import React, { useState, useEffect } from 'react';
import {
    History,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Calculator,
    Loader2
} from 'lucide-react';
import { ArrearsService } from '../services';

export default function ArrearsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await ArrearsService.getRequests();
            setRequests(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    const pendingRequests = requests.filter((r: any) => r.status === 'pending' || r.status === 'submitted' || r.status === 'Pending');
    const totalPendingAmount = pendingRequests.reduce((sum: number, r: any) => sum + (Number(r.totalArrears) || Number(r.arrearsAmount) || Number(r.amount) || 0), 0);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <History className="w-6 h-6 text-amber-500" />
                        Arrears Processing
                    </h1>
                    <p className="text-slate-500 text-sm">Calculate and process back-dated salary adjustments.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                    <Calculator className="w-4 h-4" /> Run Calculation
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {pendingRequests.length > 0 && (
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-amber-50 dark:bg-amber-900/10">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>Pending Arrears: ${totalPendingAmount.toLocaleString()} ({pendingRequests.length} request{pendingRequests.length !== 1 ? 's' : ''})</span>
                        </div>
                    </div>
                )}

                {requests.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-400">
                        No arrears requests found. Use "Run Calculation" to detect and process arrears.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Effective Date</th>
                                    <th className="px-6 py-4">Reason</th>
                                    <th className="px-6 py-4 text-right">Arrear Amount</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {requests.map((row: any) => {
                                    const amount = Number(row.totalArrears) || Number(row.arrearsAmount) || Number(row.amount) || 0;
                                    return (
                                        <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group">
                                            <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                                                {row.employeeName || row.employeeId || '--'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 font-mono">
                                                {row.effectiveFrom || row.periodStart || '--'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {row.reason || row.arrearsType || '--'}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-indigo-600">
                                                ${amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    row.status === 'approved' || row.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                                    row.status === 'processed' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
