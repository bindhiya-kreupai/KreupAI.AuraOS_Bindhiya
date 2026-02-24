"use client";

import React, { useState } from 'react';
import {
    Trophy,
    Car,
    TrendingUp,
    DollarSign
} from 'lucide-react';

export default function SalesCommissionsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-indigo-500" />
                        Sales Commissions
                    </h1>
                    <p className="text-slate-500 text-sm">Track sales performance and incentive payouts.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Sales (Oct)', val: '142', icon: Car, color: 'text-indigo-500', bg: 'bg-indigo-500' },
                    { label: 'Gross Profit', val: '$385k', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500' },
                    { label: 'Commission Pool', val: '$42k', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500' },
                    { label: 'Top Closer', val: 'D. LaRusso', icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden group">
                        <div className={`absolute top-0 left-0 w-full h-1 ${stat.bg}`}></div>
                        <div className="flex justify-center mb-3">
                            <div className={`p-3 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                        <div className="text-2xl font-bold mb-1">{stat.val}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-lg">Sales Leaderboard</h3>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Rank</th>
                            <th className="px-6 py-4">Salesperson</th>
                            <th className="px-6 py-4">Units Sold</th>
                            <th className="px-6 py-4">Gross Profit</th>
                            <th className="px-6 py-4 text-right">Commission Est.</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                            { rank: 1, name: 'Daniel LaRusso', units: 28, gp: '$82,400', comm: '$8,240' },
                            { rank: 2, name: 'Johnny Lawrence', units: 25, gp: '$71,200', comm: '$7,120' },
                            { rank: 3, name: 'Terry Silver', units: 22, gp: '$65,000', comm: '$6,500' },
                            { rank: 4, name: 'John Kreese', units: 18, gp: '$52,800', comm: '$5,280' },
                        ].map((person, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4 font-bold text-slate-400">#{person.rank}</td>
                                <td className="px-6 py-4 font-bold">{person.name}</td>
                                <td className="px-6 py-4">{person.units}</td>
                                <td className="px-6 py-4">{person.gp}</td>
                                <td className="px-6 py-4 font-bold text-right text-emerald-600">{person.comm}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

