"use client";

import React, { useState, useEffect } from 'react';
import {
    PieChart,
    TrendingUp,
    Users,
    ArrowUpRight,
    DollarSign,
    Save,
    Send
} from 'lucide-react';
import { IncrementCycleService, IncrementProposalService } from '../services';

export default function CompPlanningPage() {
    const [cycles, setCycles] = useState<any[]>([]);
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [cyclesData, proposalsData] = await Promise.all([
                IncrementCycleService.getCycles(),
                IncrementProposalService.getProposals()
            ]);
            setCycles(cyclesData);
            setProposals(proposalsData);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                        Compensation Planning (2026)
                    </h1>
                    <p className="text-slate-500 text-sm">Manage annual merit increases, bonus allocations, and budget distributions.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <div className="text-xs text-slate-500 font-bold uppercase">Budget Utilization</div>
                        <div className="text-sm font-bold text-emerald-600">42% Used</div>
                    </div>
                    <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[42%]"></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
                {/* Sidebar Stats */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg">
                        <div className="text-indigo-100 font-bold text-sm mb-1">Total Budget</div>
                        <div className="text-3xl font-bold mb-4">$500,000</div>
                        <div className="flex justify-between text-xs opacity-80 border-t border-white/20 pt-3">
                            <span>Allocated: $210k</span>
                            <span>Remaining: $290k</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-sm mb-4">Guidelines</h3>
                        <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                            <li className="flex justify-between">
                                <span>Top Performer (5)</span>
                                <span className="font-bold text-emerald-600">8% - 12%</span>
                            </li>
                            <li className="flex justify-between">
                                <span>High Performer (4)</span>
                                <span className="font-bold text-emerald-600">5% - 8%</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Meets Expectations (3)</span>
                                <span className="font-bold text-emerald-600">3% - 5%</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Others (1-2)</span>
                                <span className="font-bold text-slate-400">0%</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Worksheet */}
                <div className="lg:col-span-3 overflow-y-auto pb-20">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300">Employee Worksheet</h3>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500">
                                    <Save className="w-4 h-4" />
                                </button>
                                <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                                    <Send className="w-3 h-3" /> Submit
                                </button>
                            </div>
                        </div>

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                                    <th className="py-3 pl-4">Employee</th>
                                    <th className="py-3">Rating</th>
                                    <th className="py-3">Current Pay</th>
                                    <th className="py-3">Guide %</th>
                                    <th className="py-3 w-24">Increase %</th>
                                    <th className="py-3 w-32 pr-4 text-right">New Pay</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {[
                                    { name: 'John Doe', rating: '5 - Outstanding', cur: '$95,000', guide: '8-12%', rec: 10 },
                                    { name: 'Jane Smith', rating: '4 - Exceeds', cur: '$88,000', guide: '5-8%', rec: 6 },
                                    { name: 'Mike Ross', rating: '3 - Meets', cur: '$72,000', guide: '3-5%', rec: 4 },
                                    { name: 'Rachel Zane', rating: '3 - Meets', cur: '$76,000', guide: '3-5%', rec: 3.5 },
                                    { name: 'Harvey Specter', rating: '5 - Outstanding', cur: '$150,000', guide: '8-12%', rec: 12 },
                                ].map((row, i) => (
                                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 group">
                                        <td className="py-4 pl-4 font-bold text-slate-700 dark:text-slate-300">{row.name}</td>
                                        <td className="py-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded 
                                                ${row.rating.startsWith('5') ? 'bg-emerald-100 text-emerald-600' :
                                                    row.rating.startsWith('4') ? 'bg-indigo-100 text-indigo-600' :
                                                        'bg-amber-100 text-amber-600'}
                                            `}>
                                                {row.rating}
                                            </span>
                                        </td>
                                        <td className="py-4 font-mono text-slate-500">{row.cur}</td>
                                        <td className="py-4 text-xs text-slate-400">{row.guide}</td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 w-20 group-hover:border-indigo-400">
                                                <input type="number" defaultValue={row.rec} className="w-full bg-transparent outline-none font-bold text-right" />
                                                <span className="text-slate-400">%</span>
                                            </div>
                                        </td>
                                        <td className="py-4 pr-4 text-right font-bold text-emerald-600">
                                            ${row.cur ? (parseInt(row.cur.replace('$', '').replace(',', '')) * (1 + row.rec / 100)).toLocaleString() : 'N/A'}
                                        </td>
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
