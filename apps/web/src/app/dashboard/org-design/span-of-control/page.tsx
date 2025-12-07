"use client";

import React from 'react';
import {
    GitCommit,
    Info,
    ArrowRight,
    TrendingUp,
    Users,
    AlertCircle
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

export default function SpanOfControlPage() {
    const spanData = [
        { reports: 1, managers: 45, type: 'Under-managed' },
        { reports: 2, managers: 80, type: 'Optimal' },
        { reports: 3, managers: 120, type: 'Optimal' },
        { reports: 4, managers: 200, type: 'Optimal' },
        { reports: 5, managers: 150, type: 'Optimal' },
        { reports: 6, managers: 90, type: 'Optimal' },
        { reports: 7, managers: 60, type: 'Stretched' },
        { reports: 8, managers: 40, type: 'Stretched' },
        { reports: 9, managers: 25, type: 'Overloaded' },
        { reports: 10, managers: 15, type: 'Overloaded' },
        { reports: '10+', managers: 10, type: 'Critical' },
    ];

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GitCommit className="w-6 h-6 text-indigo-500 rotate-90" />
                        Span of Control Analysis
                    </h1>
                    <p className="text-slate-500 text-sm">Evaluate management layers and direct report distribution.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold border border-indigo-100">
                        Avg Span: 4.8
                    </span>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold border border-emerald-100">
                        Target: 5-7
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Distribution Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-6">Manager Distribution by Direct Reports</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={spanData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="reports" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} label={{ value: 'Number of Direct Reports', position: 'insideBottom', offset: -5, fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="managers" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                <ReferenceLine x={4} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Ideal Min', position: 'top', fill: '#10b981', fontSize: 10 }} />
                                <ReferenceLine x={6} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Ideal Max', position: 'top', fill: '#10b981', fontSize: 10 }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Insights Panel */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100">Optimization Opportunity</h4>
                                <p className="text-xs text-slate-500 mt-1">45 managers have only 1 direct report. Consider merging teams to reduce hierarchy depth.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100">Overloaded Managers</h4>
                                <p className="text-xs text-slate-500 mt-1">35 managers have 8+ reports. Risk of bottleneck and burnout. Promote team leads.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 p-6">
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-100 text-sm mb-4">Span by Department</h4>
                        <div className="space-y-3">
                            {[
                                { name: 'Sales', span: 8.2, status: 'High' },
                                { name: 'Engineering', span: 5.5, status: 'Optimal' },
                                { name: 'Design', span: 3.2, status: 'Low' },
                            ].map((dept, i) => (
                                <div key={i} className="flex justify-between items-center bg-white/50 p-2 rounded-lg">
                                    <span className="text-xs font-bold">{dept.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-indigo-600">{dept.span}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${dept.status === 'Optimal' ? 'bg-emerald-100 text-emerald-600' :
                                                dept.status === 'High' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-slate-100 text-slate-500'
                                            }`}>{dept.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Department Breakdown Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-sm">Detailed Breakdown</h3>
                    <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                        View Full Report <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Department</th>
                                <th className="px-6 py-3">Total Managers</th>
                                <th className="px-6 py-3">Avg Span</th>
                                <th className="px-6 py-3">Max Layers</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { name: 'Engineering', mgrs: 42, avg: 5.5, layers: 4, status: 'Healthy' },
                                { name: 'Sales', mgrs: 18, avg: 8.2, layers: 3, status: 'Stretched' },
                                { name: 'Product', mgrs: 12, avg: 4.1, layers: 3, status: 'Healthy' },
                                { name: 'HR', mgrs: 8, avg: 2.5, layers: 2, status: 'Inefficient' },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-bold">{row.name}</td>
                                    <td className="px-6 py-4">{row.mgrs}</td>
                                    <td className="px-6 py-4 font-bold text-indigo-600">{row.avg}</td>
                                    <td className="px-6 py-4">{row.layers}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${row.status === 'Healthy' ? 'bg-emerald-100 text-emerald-600' :
                                                row.status === 'Stretched' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-rose-100 text-rose-600'
                                            }`}>{row.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
