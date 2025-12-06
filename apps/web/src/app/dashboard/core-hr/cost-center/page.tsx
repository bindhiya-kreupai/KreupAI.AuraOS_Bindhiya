"use client";

import React, { useState } from 'react';
import {
    PieChart,
    Wallet,
    TrendingUp,
    Download,
    Edit2,
    X,
    Save
} from 'lucide-react';
import {
    Pie,
    ResponsiveContainer,
    Cell,
    PieChart as RePieChart,
    Tooltip,
    Legend
} from 'recharts';

export default function CostCenterPage() {
    const [showEditModal, setShowEditModal] = useState(false);

    const [data, setData] = useState([
        { name: 'Engineering', value: 4500000, color: '#6366f1' },
        { name: 'Sales', value: 3200000, color: '#10b981' },
        { name: 'Marketing', value: 1800000, color: '#f59e0b' },
        { name: 'Admin', value: 900000, color: '#94a3b8' },
    ]);

    const totalBudget = data.reduce((acc, curr) => acc + curr.value, 0);

    const handleExport = () => {
        alert("Downloading CostCenter_Report_FY24.pdf...");
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-indigo-500" />
                        Cost Center Management
                    </h1>
                    <p className="text-slate-500 text-sm">Budget allocation and expense tracking per department.</p>
                </div>
                <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                    <Edit2 className="w-4 h-4" /> Adjust Budgets
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Budget Distribution</h3>
                    <div className="flex-1 min-h-[300px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={data}
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val: number) => `$${(val / 1000).toFixed(0)}k`} contentStyle={{ borderRadius: 8 }} />
                                <Legend />
                            </RePieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold animate-in fade-in zoom-in duration-500">
                                ${(totalBudget / 1000000).toFixed(1)}M
                            </span>
                            <span className="text-xs text-slate-400">Total Budget</span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Cost Center Details</h3>
                        <button
                            onClick={handleExport}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors text-sm font-bold flex items-center gap-1"
                        >
                            <Download className="w-4 h-4" /> Export Report
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Cost Center Code</th>
                                    <th className="px-6 py-4">Department</th>
                                    <th className="px-6 py-4">Head</th>
                                    <th className="px-6 py-4 text-right">Allocated Budget</th>
                                    <th className="px-6 py-4 text-right">Utilized</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { code: 'CC-101', dept: 'Engineering', head: 'Marcus Chen', budget: '$4,500,000', utilized: '85%' },
                                    { code: 'CC-102', dept: 'Sales', head: 'David Miller', budget: '$3,200,000', utilized: '92%' },
                                    { code: 'CC-201', dept: 'Marketing', head: 'Charlie Puth', budget: '$1,800,000', utilized: '78%' },
                                    { code: 'CC-305', dept: 'Admin & Ops', head: 'Sarah Williams', budget: '$900,000', utilized: '60%' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-500">{row.code}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{row.dept}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{row.head}</td>
                                        <td className="px-6 py-4 text-right font-mono">{row.budget}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold 
                                                ${parseInt(row.utilized) > 90 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}
                                            `}>
                                                {row.utilized}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Budget Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Adjust Department Budgets</h2>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {data.map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                                    <div className="flex-1 font-bold">{item.name}</div>
                                    <input
                                        type="number"
                                        defaultValue={item.value}
                                        className="w-32 text-right p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                            <button onClick={() => setShowEditModal(false)} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                            <button
                                onClick={() => {
                                    alert('Budgets Updated!');
                                    setShowEditModal(false);
                                }}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
