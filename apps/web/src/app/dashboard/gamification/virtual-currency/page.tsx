"use client";

import React, { useState, useEffect } from 'react';
import {
    Wallet,
    Repeat,
    ArrowRightLeft,
    CreditCard,
    DollarSign,
    Loader2
} from 'lucide-react';
import { VirtualCurrencyService } from '../services';

export default function VirtualCurrencyPage() {
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await VirtualCurrencyService.getCurrencies();
                setCurrencies(data as any);
            } catch (error: any) {
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
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-indigo-500" />
                        Virtual Wallet
                    </h1>
                    <p className="text-slate-500 text-sm">Manage your Aura Coins and transactions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Visual Card */}
                <div className="lg:col-span-1 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-8 text-white shadow-xl shadow-indigo-900/30 flex flex-col justify-between min-h-[240px] relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="w-12 h-8 rounded bg-yellow-400/20 flex items-center justify-center border border-yellow-400/50">
                            <div className="w-8 h-5 border border-yellow-400/30 rounded-sm"></div>
                        </div>
                        <span className="font-mono tracking-widest opacity-50">AURA COIN</span>
                    </div>
                    <div className="relative z-10">
                        <div className="text-sm opacity-75 mb-1">Current Balance</div>
                        <div className="text-4xl font-mono tracking-wider mb-8">2,450 AC</div>
                        <div className="flex justify-between items-end">
                            <div className="font-mono text-sm opacity-75">sabujohnbosco</div>
                            <img src="/logo.png" className="w-8 h-8 opacity-50 grayscale" alt="" />
                        </div>
                    </div>
                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                </div>

                {/* Actions */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button className="h-full p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors flex flex-col items-center justify-center text-center group">
                        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ArrowRightLeft className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h3 className="font-bold text-lg">Transfer Points</h3>
                        <p className="text-sm text-slate-500">Send points to colleagues as a gift.</p>
                    </button>
                    <button className="h-full p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-colors flex flex-col items-center justify-center text-center group">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <CreditCard className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="font-bold text-lg">Cash Out</h3>
                        <p className="text-sm text-slate-500">Convert points to payroll credit.</p>
                    </button>
                </div>
            </div>

            {/* Exchange Rates / Market */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Currency Exchange</h3>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded shadow-sm"><DollarSign className="w-6 h-6 text-emerald-600" /></div>
                        <div>
                            <div className="font-bold">100 Aura Coins</div>
                            <div className="text-xs text-slate-500">= $1.00 USD</div>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold">
                        Convert
                    </button>
                </div>
            </div>
        </div>
    );
}

