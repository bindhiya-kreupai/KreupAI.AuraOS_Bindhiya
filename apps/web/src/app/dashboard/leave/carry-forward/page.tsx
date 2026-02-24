"use client";

import React, { useState, useEffect } from 'react';
import {
    ArrowRightCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { CarryForwardService } from '../services';
import type { CarryForward } from '../types';

export default function CarryForwardPage() {
    const [carryForwards, setCarryForwards] = useState<CarryForward[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCarryForwards();
    }, []);

    const fetchCarryForwards = async () => {
        try {
            setLoading(true);
            const result = await CarryForwardService.getCarryForwards();
            setCarryForwards(result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ArrowRightCircle className="w-6 h-6 text-indigo-500" />
                        Carry Forward
                    </h1>
                    <p className="text-slate-500 text-sm">Manage annual leave balances carried over to the next year.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-lg mb-4">Year-End Processing</h3>

                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 mb-6">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-1" />
                    <div>
                        <h4 className="font-bold text-amber-900 dark:text-amber-200">Policy Limit</h4>
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                            Maximum carry forward limit is defined per leave type policy. Any excess balance will lapse.
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Leave Type</th>
                                <th className="px-6 py-4">Eligible Balance</th>
                                <th className="px-6 py-4">Carry Forward</th>
                                <th className="px-6 py-4">Lapsed</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Loading carry forward data...
                                        </div>
                                    </td>
                                </tr>
                            ) : carryForwards.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No carry forward records found.
                                    </td>
                                </tr>
                            ) : carryForwards.map((emp, i) => (
                                <tr key={emp.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-bold">{emp.employeeName}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{emp.leaveTypeName || emp.leaveTypeId}</td>
                                    <td className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400">{emp.eligibleBalance ?? 0}</td>
                                    <td className="px-6 py-4 font-bold text-indigo-600">{emp.actualCarryForward ?? 0}</td>
                                    <td className="px-6 py-4 font-bold text-rose-600">{emp.lapsedBalance ?? 0}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${emp.status === 'processed' ? 'bg-emerald-100 text-emerald-600' : emp.status === 'utilized' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'
                                            }`}>{emp.status === 'processed' ? 'Processed' : emp.status === 'utilized' ? 'Utilized' : emp.status === 'expired' ? 'Expired' : emp.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex justify-end">
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Process All</button>
                </div>
            </div>
        </div>
    );
}

