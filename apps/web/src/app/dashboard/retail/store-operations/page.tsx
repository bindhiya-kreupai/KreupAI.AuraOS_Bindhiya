"use client";

import React from 'react';
import {
    ShoppingBag,
    LayoutGrid,
    Users,
    TrendingUp,
    Loader2
} from 'lucide-react';
import { useRetail } from '../hooks/useRetail';

export default function StoreOperationsPage() {
    const { stores, loading, error } = useRetail();

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center text-rose-500 font-bold">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-indigo-500" />
                        Store Operations
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor daily performance across all locations.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {stores.map((store, i) => (
                    <div key={store.storeId || i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{store.storeName}</h3>
                                <div className="text-sm text-slate-500">Mgr: {store.manager}</div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${store.status === 'open' ? 'bg-emerald-100 text-emerald-600' :
                                    store.status === 'closed' ? 'bg-rose-100 text-rose-600' :
                                        'bg-amber-100 text-amber-600'
                                }`}>
                                {store.status.charAt(0).toUpperCase() + store.status.slice(1).replace('_', ' ')}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">Daily Sales</span>
                                    <span className="font-bold">${store.performance.dailySales.toLocaleString()}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${store.performance.targetAchievement >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                        style={{ width: `${Math.min(store.performance.targetAchievement, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="text-right text-xs font-bold text-slate-400 mt-1">{store.performance.targetAchievement}% of Target</div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Roster</button>
                                <button className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Inventory</button>
                            </div>
                        </div>
                    </div>
                ))}
                {stores.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-400 font-bold">
                        No store data available.
                    </div>
                )}
            </div>
        </div>
    );
}
