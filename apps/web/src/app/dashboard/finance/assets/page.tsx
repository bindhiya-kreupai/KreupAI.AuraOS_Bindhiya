"use client";

import React from 'react';
import {
    Monitor,
    Calculator,
    TrendingDown,
    Calendar,
    Download,
    RefreshCw
} from 'lucide-react';

export default function AssetDepreciationPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-indigo-500" />
                        Asset Depreciation
                    </h1>
                    <p className="text-slate-500 text-sm">Track asset value reduction and book value over time.</p>
                </div>
                <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                    <Download className="w-4 h-4 text-slate-500" /> Export Report
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Main Table */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg">Fixed Assets Register</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0">
                                <tr>
                                    <th className="p-4">Asset Name</th>
                                    <th className="p-4">Purchase Date</th>
                                    <th className="p-4">Original Cost</th>
                                    <th className="p-4">Book Value</th>
                                    <th className="p-4">Depreciation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { name: 'MacBook Pro M3 (10 Units)', date: 'Jan 2024', cost: 25000, value: 21000, method: 'Straight Line' },
                                    { name: 'Office Furniture Set A', date: 'Jun 2023', cost: 15000, value: 12000, method: 'Diminishing' },
                                    { name: 'Server Rack Dell', date: 'Mar 2023', cost: 45000, value: 30000, method: 'Straight Line' },
                                    { name: 'Meeting Room Pods', date: 'Aug 2024', cost: 12000, value: 11500, method: 'Straight Line' },
                                ].map((asset, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-slate-500">
                                                    <Monitor className="w-4 h-4" />
                                                </div>
                                                {asset.name}
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-500">{asset.date}</td>
                                        <td className="p-4 font-mono text-slate-600 dark:text-slate-400">${asset.cost.toLocaleString()}</td>
                                        <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">${asset.value.toLocaleString()}</td>
                                        <td className="p-4 text-xs">
                                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">{asset.method}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Calculator/Details Panel */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-indigo-500" /> Quick Calculator
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Asset Cost</label>
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 mt-1">
                                <span className="text-slate-400">$</span>
                                <input type="number" className="bg-transparent w-full outline-none font-bold" defaultValue="2500" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Useful Life (Years)</label>
                            <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 mt-1 outline-none font-bold" defaultValue="3" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Salvage Value</label>
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 mt-1">
                                <span className="text-slate-400">$</span>
                                <input type="number" className="bg-transparent w-full outline-none font-bold" defaultValue="500" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-500">Annual Depreciation</span>
                            <span className="font-bold text-rose-500">-$666.67</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Monthly Expense</span>
                            <span className="font-bold text-rose-500">-$55.56</span>
                        </div>
                    </div>

                    <button className="w-full mt-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Recalculate
                    </button>
                </div>
            </div>
        </div>
    );
}
