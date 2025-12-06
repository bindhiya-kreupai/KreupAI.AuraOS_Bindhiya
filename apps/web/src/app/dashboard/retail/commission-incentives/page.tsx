"use client";

import React, { useState } from 'react';
import {
    DollarSign,
    Trophy,
    TrendingUp,
    User
} from 'lucide-react';

export default function CommissionIncentivesPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-indigo-500" />
                        Commission & Incentives
                    </h1>
                    <p className="text-slate-500 text-sm">Track sales performance and calculate payouts.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-lg">Top Performers (This Month)</h3>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Associate</th>
                                <th className="px-6 py-4">Store</th>
                                <th className="px-6 py-4">Sales</th>
                                <th className="px-6 py-4">Commission Rate</th>
                                <th className="px-6 py-4">Estimated Payout</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { name: 'Jessica M.', store: 'Fifth Ave', sales: '$84,500', rate: '5%', payout: '$4,225' },
                                { name: 'Tom H.', store: 'SoHo', sales: '$72,100', rate: '5%', payout: '$3,605' },
                                { name: 'Amanda B.', store: 'Queens', sales: '$68,900', rate: '4.5%', payout: '$3,100' },
                                { name: 'Chris P.', store: 'Fifth Ave', sales: '$65,200', rate: '4.5%', payout: '$2,934' },
                            ].map((person, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-bold flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-600' :
                                                i === 1 ? 'bg-slate-200 text-slate-600' :
                                                    'bg-orange-100 text-orange-600'
                                            }`}>
                                            {i + 1}
                                        </div>
                                        {person.name}
                                    </td>
                                    <td className="px-6 py-4">{person.store}</td>
                                    <td className="px-6 py-4">{person.sales}</td>
                                    <td className="px-6 py-4">{person.rate}</td>
                                    <td className="px-6 py-4 font-bold text-emerald-600">{person.payout}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-xl">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <Trophy className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase">Store Contest</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">Holiday Sales Sprint</h3>
                        <p className="text-indigo-100 text-sm mb-6">Highest total sales by Dec 24th wins a team dinner!</p>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm font-bold">
                                <span>1. Fifth Avenue</span>
                                <span>$145k</span>
                            </div>
                            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white w-[85%]"></div>
                            </div>

                            <div className="flex justify-between text-sm font-bold opacity-80">
                                <span>2. Queens Outlet</span>
                                <span>$98k</span>
                            </div>
                            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white/70 w-[60%]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold mb-4">Commission Calculator</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Sales Amount</label>
                                <input type="text" className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm" placeholder="$0.00" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Tier</label>
                                <select className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
                                    <option>Standard (3%)</option>
                                    <option>Senior (5%)</option>
                                    <option>Manager (7%)</option>
                                </select>
                            </div>
                            <div className="pt-2">
                                <div className="text-xs font-bold text-slate-400 uppercase">Estimated Payout</div>
                                <div className="text-2xl font-bold text-indigo-600">$0.00</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
