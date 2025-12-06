"use client";

import React from 'react';
import {
    DollarSign,
    Trophy,
    Car,
    TrendingUp,
    Target,
    Users
} from 'lucide-react';

export default function SalesPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-emerald-500" />
                        Sales Commissions
                    </h1>
                    <p className="text-slate-500 text-sm">Dealership incentive plans, monthly targets, and test drive logs.</p>
                </div>
                <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20">
                    <Trophy className="w-4 h-4" /> View Leaderboard
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Stats */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600"><Car className="w-6 h-6" /></div>
                        <div>
                            <div className="text-2xl font-bold">42</div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Units Sold (Nov)</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-500"><Target className="w-6 h-6" /></div>
                        <div>
                            <div className="text-2xl font-bold">85%</div>
                            <div className="text-xs text-slate-400 font-bold uppercase">To Goal</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-500"><DollarSign className="w-6 h-6" /></div>
                        <div>
                            <div className="text-2xl font-bold">$12.4k</div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Comm. Pool</div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 rounded-xl shadow-lg flex flex-col justify-between">
                        <div className="text-3xl font-bold">12</div>
                        <div className="text-xs opacity-80 uppercase font-bold">Days Left in Month</div>
                    </div>
                </div>

                {/* Sales Roster */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">Sales Team Performance</h3>
                    {[
                        { name: 'Dwight Schrute', tier: 'Platinum', units: '12', gross: '$420,000', comm: '$4,200', trend: 'up' },
                        { name: 'Jim Halpert', tier: 'Gold', units: '9', gross: '$310,000', comm: '$3,100', trend: 'steady' },
                        { name: 'Pam Beesly', tier: 'Silver', units: '6', gross: '$180,000', comm: '$1,800', trend: 'up' },
                        { name: 'Andy Bernard', tier: 'Bronze', units: '3', gross: '$95,000', comm: '$950', trend: 'down' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                    {s.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{s.name}</h3>
                                    <div className="text-xs text-slate-500 font-bold mb-1">{s.tier} Associate</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">
                                        <Car className="w-3 h-3" /> {s.units} Vehicles Sold
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div>
                                    <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{s.gross}</div>
                                    <div className="text-xs text-slate-400 text-right">Gross Sales</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-emerald-600 font-mono">{s.comm}</div>
                                    <div className="text-xs text-slate-400">Commission</div>
                                </div>

                                <div className="flex items-center text-slate-300">
                                    {s.trend === 'up' ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : s.trend === 'down' ? <TrendingUp className="w-5 h-5 text-rose-500 rotate-180" /> : <TrendingUp className="w-5 h-5 text-slate-400 rotate-90" />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Test Drive Log */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Test Drives (Today)</h3>
                    <div className="space-y-4">
                        {[
                            { client: 'M. Scott', car: 'Mustang GT', sales: 'Dwight', time: '10:00 AM' },
                            { client: 'S. Hudson', car: 'Explorer', sales: 'Jim', time: '11:15 AM' },
                            { client: 'K. Malone', car: 'F-150 Raptor', sales: 'Andy', time: '01:00 PM' },
                            { client: 'A. Martin', car: 'Focus RS', sales: 'Pam', time: '02:30 PM' },
                        ].map((d, i) => (
                            <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-sm text-slate-700 dark:text-slate-300">{d.car}</div>
                                    <div className="text-xs text-slate-500">{d.client} (w/ {d.sales})</div>
                                </div>
                                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                                    {d.time}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">
                        Log New Drive
                    </button>
                </div>
            </div>
        </div>
    );
}
