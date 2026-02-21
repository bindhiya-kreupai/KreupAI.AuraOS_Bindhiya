"use client";

import React, { useState, useEffect } from 'react';
import {
    Coins,
    TrendingUp,
    Gift,
    History,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from 'lucide-react';
import { PointsService } from '../services';

export default function PointsSystemPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await PointsService.getAllAccounts();
                setTransactions(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Coins className="w-6 h-6 text-amber-500" />
                        My Points
                    </h1>
                    <p className="text-slate-500 text-sm">Track your earnings and spending history.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <div className="md:col-span-3 lg:col-span-1 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl p-8 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden flex flex-col justify-between h-64">
                    <div className="relative z-10">
                        <h3 className="text-amber-100 font-bold uppercase text-sm mb-1">Total Balance</h3>
                        <div className="text-5xl font-bold mb-4">2,450</div>
                        <div className="flex items-center gap-2 text-sm bg-white/20 w-fit px-3 py-1 rounded-lg backdrop-blur-sm">
                            <TrendingUp className="w-4 h-4" /> Top 5% of earners
                        </div>
                    </div>
                    <div className="relative z-10">
                        <button className="w-full py-2 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
                            <Gift className="w-4 h-4" /> Redeem Rewards
                        </button>
                    </div>
                    {/* Decor */}
                    <Coins className="absolute -bottom-8 -right-8 w-48 h-48 text-white opacity-20 transform rotate-12" />
                </div>

                {/* History & Stats */}
                <div className="md:col-span-3 lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <h4 className="text-slate-500 text-xs font-bold uppercase mb-2">Earned this Month</h4>
                            <div className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                                +1,250 <ArrowUpRight className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <h4 className="text-slate-500 text-xs font-bold uppercase mb-2">Spent this Month</h4>
                            <div className="text-2xl font-bold text-rose-500 flex items-center gap-2">
                                -1,000 <ArrowDownRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex-1">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <History className="w-5 h-5 text-slate-400" /> Recent Activity
                        </h3>
                        <div className="space-y-4">
                            {transactions.map((tx, i) => (
                                <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'earn' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                            {tx.type === 'earn' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">{tx.title}</h4>
                                            <p className="text-xs text-slate-500">{tx.date}</p>
                                        </div>
                                    </div>
                                    <div className={`font-bold ${tx.type === 'earn' ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-100'}`}>
                                        {tx.amount} pts
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
