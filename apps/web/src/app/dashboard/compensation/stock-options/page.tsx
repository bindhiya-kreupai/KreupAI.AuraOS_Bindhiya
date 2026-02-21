"use client";

import React, { useState, useEffect } from 'react';
import {
    PieChart,
    TrendingUp,
    FileText,
    Clock,
    Award,
    Loader2
} from 'lucide-react';
import {
    Pie,
    ResponsiveContainer,
    Cell,
    PieChart as RePieChart
} from 'recharts';
import { StockGrantService } from '../services';

export default function StockOptionsPage() {
    const [grants, setGrants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await StockGrantService.getGrants();
            setGrants(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalVested = grants.reduce((sum: number, g: any) => sum + (g.vestedShares || g.vestedUnits || g.sharesVested || 0), 0);
    const totalUnvested = grants.reduce((sum: number, g: any) => {
        const total = g.totalShares || g.numberOfUnits || g.grantedShares || 0;
        const vested = g.vestedShares || g.vestedUnits || g.sharesVested || 0;
        return sum + (total - vested);
    }, 0);
    const totalExercised = grants.reduce((sum: number, g: any) => sum + (g.exercisedUnits || g.sharesExercised || 0), 0);
    const totalUnits = totalVested + totalUnvested + totalExercised;

    const chartData = [
        { name: 'Vested', value: totalVested || 1, color: '#10b981' },
        { name: 'Unvested', value: totalUnvested || 1, color: '#6366f1' },
        { name: 'Exercised', value: totalExercised || 0, color: '#f59e0b' },
    ].filter(d => d.value > 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-indigo-500" />
                        Stock Options (ESOP)
                    </h1>
                    <p className="text-slate-500 text-sm">Track grant lifecycle, vesting schedules, and cap table impact.</p>
                </div>
                {grants.length > 0 && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-300 font-bold text-sm">
                        FMV: ${grants[0].fairMarketValue || grants[0].currentPrice || '--'}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center">
                    {grants.length === 0 ? (
                        <p className="text-sm text-slate-400">No stock grants found.</p>
                    ) : (
                        <>
                            <div className="w-48 h-48 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                    </RePieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold">{totalUnits > 1000 ? `${(totalUnits / 1000).toFixed(0)}k` : totalUnits}</span>
                                    <span className="text-xs text-slate-400 uppercase">Total Units</span>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-6 text-xs">
                                {chartData.map((d, i) => (
                                    <div key={i} className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                                        <span>{d.name}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Grants Table */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden flex flex-col">
                    <h3 className="font-bold text-lg mb-4">Your Grants</h3>
                    {grants.length === 0 ? (
                        <p className="text-sm text-slate-400 py-4">No stock option grants found.</p>
                    ) : (
                        <div className="overflow-y-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Grant</th>
                                        <th className="px-4 py-3">Units</th>
                                        <th className="px-4 py-3">Strike Price</th>
                                        <th className="px-4 py-3">Grant Date</th>
                                        <th className="px-4 py-3 rounded-r-lg">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {grants.map((grant: any) => {
                                        const total = grant.totalShares || grant.numberOfUnits || grant.grantedShares || 0;
                                        const exercisePrice = grant.exercisePrice || grant.grantPrice || grant.strikePrice || 0;
                                        return (
                                            <tr key={grant.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-slate-400" />
                                                    {grant.grantCode || grant.id?.substring(0, 12)}
                                                </td>
                                                <td className="px-4 py-3 font-mono">{total.toLocaleString()}</td>
                                                <td className="px-4 py-3 font-mono">
                                                    {exercisePrice > 0 ? `$${exercisePrice.toFixed(2)}` : '$0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">{grant.grantDate || '--'}</td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                                                        {grant.status || 'Active'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
