"use client";

import React, { useState, useEffect } from 'react';
import {
    Gift,
    Calculator,
    PieChart,
    Users,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { BonusService } from '../services';
import type { Bonus } from '../types';

export default function BonusProcessingPage() {
    const [bonuses, setBonuses] = useState<Bonus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBonuses();
    }, []);

    const fetchBonuses = async () => {
        try {
            setLoading(true);
            const result = await BonusService.getBonuses();
            setBonuses(result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (amount: number) => {
        if (amount >= 1000) return (amount / 1000).toFixed(0) + 'k';
        return '$' + amount.toLocaleString();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const pendingBonuses = bonuses.filter(b => b.status === 'pending_approval' || b.status === 'approved');
    const paidBonuses = bonuses.filter(b => b.status === 'paid' || b.status === 'processed');
    const totalPool = pendingBonuses.reduce((sum, b) => sum + b.amount, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-slate-500 font-medium">Loading bonus data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Gift className="w-6 h-6 text-indigo-500" />
                        Bonus Processing
                    </h1>
                    <p className="text-slate-500 text-sm">Calculate and distribute performance bonuses and incentives.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                    Start New Cycle
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Active Cycle Card */}
                {pendingBonuses.length > 0 ? (
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group cursor-pointer lg:col-span-2">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-8 -translate-y-8"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-indigo-200 text-xs font-bold uppercase mb-1">Pending Bonuses</div>
                                    <h3 className="text-2xl font-bold">{pendingBonuses.length} Employee{pendingBonuses.length > 1 ? 's' : ''}</h3>
                                </div>
                                <span className="px-2 py-1 bg-white/20 rounded-lg text-xs font-bold backdrop-blur-sm">In Progress</span>
                            </div>
                            <div className="flex items-end gap-2 mb-6">
                                <span className="text-4xl font-bold">${totalPool.toLocaleString()}</span>
                                <span className="text-indigo-200 font-bold mb-1">Total Pool</span>
                            </div>
                            <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                                Review Distribution <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 lg:col-span-2 flex items-center justify-center">
                        <div className="text-center">
                            <Gift className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                            <p className="text-slate-500">No pending bonuses</p>
                        </div>
                    </div>
                )}

                {/* History Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-4">Past Payouts</h3>
                    {paidBonuses.length === 0 ? (
                        <div className="text-center text-slate-400 py-4 text-sm">No past bonus payouts.</div>
                    ) : (
                        <div className="space-y-4">
                            {paidBonuses.slice(0, 5).map((bonus) => (
                                <div key={bonus.id} className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded-lg transition-colors cursor-pointer">
                                    <div>
                                        <div className="font-bold text-sm">{bonus.employeeName}</div>
                                        <div className="text-xs text-slate-500">{bonus.bonusType} - {bonus.paymentMonth}</div>
                                    </div>
                                    <div className="font-mono font-bold text-slate-700 dark:text-slate-300">${bonus.amount.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    <button className="w-full mt-4 text-xs font-bold text-indigo-600 hover:underline">View All History</button>
                </div>
            </div>

            {/* Config Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-lg mb-4">Bonus Rules Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <Calculator className="w-5 h-5 text-indigo-500 mb-2" />
                        <h4 className="font-bold text-sm">Formula Builder</h4>
                        <p className="text-xs text-slate-500 mt-1">Configure payout based on salary % or fixed amount.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <Users className="w-5 h-5 text-indigo-500 mb-2" />
                        <h4 className="font-bold text-sm">Eligibility Criteria</h4>
                        <p className="text-xs text-slate-500 mt-1">Define active duration and performance rating rules.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <PieChart className="w-5 h-5 text-indigo-500 mb-2" />
                        <h4 className="font-bold text-sm">Budget Allocation</h4>
                        <p className="text-xs text-slate-500 mt-1">Set department-wise bonus pool limits.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

