"use client";

import React from 'react';
import {
    Coins,
    Users,
    Percent,
    Receipt,
    Wallet,
    TrendingUp
} from 'lucide-react';

export default function TipsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Coins className="w-6 h-6 text-amber-500" />
                        Tip Management
                    </h1>
                    <p className="text-slate-500 text-sm">Automated tip pooling, point-based distribution, and payout logs.</p>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-xl text-sm font-bold border border-amber-100 dark:border-amber-800/30">
                    <Wallet className="w-4 h-4" /> Next Payout: Friday
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Daily Pool Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-6 shadow-lg">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-amber-200" /> Today's Pool
                        </h3>
                        <div className="text-4xl font-bold mb-1">$4,250.50</div>
                        <div className="text-sm opacity-90 mb-6">Collected from 145 checks.</div>

                        <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
                            <div>
                                <div className="text-xs font-bold uppercase opacity-80">Cash Tips</div>
                                <div className="text-lg font-bold">$850.00</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase opacity-80">Digital / CC</div>
                                <div className="text-lg font-bold">$3,400.50</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Distribution Logic</h3>
                        <div className="space-y-3">
                            {[
                                { role: 'Wait Staff', points: '10 pts', share: '60%' },
                                { role: 'Bartenders', points: '8 pts', share: '25%' },
                                { role: 'Bus/Runners', points: '5 pts', share: '10%' },
                                { role: 'Host', points: '3 pts', share: '5%' },
                            ].map((d, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{d.role}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-slate-400">{d.points}</span>
                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">{d.share}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 text-xs font-bold text-indigo-500 hover:underline">Adjust Points Model</button>
                    </div>
                </div>

                {/* Staff Payouts */}
                <div className="lg:col-span-2 overflow-y-auto pb-20">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg">Staff Allocations (Yesterday)</h3>
                            <button className="px-3 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg text-xs font-bold hover:opacity-90">
                                Process Payroll
                            </button>
                        </div>

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                                    <th className="pb-3 pl-2">Employee</th>
                                    <th className="pb-3">Role</th>
                                    <th className="pb-3">Hours</th>
                                    <th className="pb-3 text-right">Points</th>
                                    <th className="pb-3 text-right pr-2">Payout</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {[
                                    { name: 'Sarah Connor', role: 'Wait Staff', hours: '8.0h', points: '80', pay: '$145.20' },
                                    { name: 'John Wick', role: 'Bartender', hours: '8.0h', points: '64', pay: '$116.15' },
                                    { name: 'Marty McFly', role: 'Bus Boy', hours: '6.5h', points: '32.5', pay: '$58.90' },
                                    { name: 'Ellen Ripley', role: 'Wait Staff', hours: '7.5h', points: '75', pay: '$136.12' },
                                    { name: 'Tony Stark', role: 'Host', hours: '5.0h', points: '15', pay: '$27.22' },
                                ].map((row, i) => (
                                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="py-4 pl-2 font-bold text-slate-700 dark:text-slate-300">{row.name}</td>
                                        <td className="py-4 text-slate-600 dark:text-slate-400">{row.role}</td>
                                        <td className="py-4 text-slate-500 font-mono text-xs">{row.hours}</td>
                                        <td className="py-4 text-right font-mono text-slate-500">{row.points}</td>
                                        <td className="py-4 text-right pr-2 font-bold text-emerald-600 font-mono">{row.pay}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
