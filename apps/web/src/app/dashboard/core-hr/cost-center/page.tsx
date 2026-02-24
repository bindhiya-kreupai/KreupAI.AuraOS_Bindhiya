"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    PieChart,
    Wallet,
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
import { CostCenterService } from '../services';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#94a3b8', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];

export default function CostCenterPage() {
    const [showEditModal, setShowEditModal] = useState(false);
    const [costCenters, setCostCenters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCostCenters();
    }, []);

    const fetchCostCenters = async () => {
        try {
            setLoading(true);
            const data = await CostCenterService.getAllCostCenters();
            setCostCenters(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Derive pie chart data from cost centers
    const chartData = useMemo(() => {
        return costCenters.map((cc, i) => ({
            name: cc.costCenterName || cc.department || 'Unknown',
            value: cc.budget?.totalBudget || cc.budget?.allocatedBudget || 0,
            color: CHART_COLORS[i % CHART_COLORS.length],
        }));
    }, [costCenters]);

    const totalBudget = useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.value, 0);
    }, [chartData]);

    const handleExport = () => {
        alert("Downloading CostCenter_Report_FY24.pdf...");
    };

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
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

            {loading && (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
            )}

            {!loading && costCenters.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Wallet className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No cost centers found</p>
                    <p className="text-sm">Cost centers will appear here once records are added.</p>
                </div>
            )}

            {!loading && costCenters.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    {/* Chart */}
                    <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Budget Distribution</h3>
                        {totalBudget > 0 ? (
                            <div className="flex-1 min-h-[300px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={80}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
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
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
                                <PieChart className="w-10 h-10 mb-3 opacity-50" />
                                <p className="text-sm">No budget data available for chart display.</p>
                            </div>
                        )}
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
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Department</th>
                                        <th className="px-6 py-4">Manager</th>
                                        <th className="px-6 py-4 text-right">Allocated Budget</th>
                                        <th className="px-6 py-4 text-right">Utilized</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {costCenters.map((cc, i) => {
                                        const allocated = cc.budget?.totalBudget || cc.budget?.allocatedBudget || 0;
                                        const spent = cc.budget?.spentBudget || 0;
                                        const utilizedPct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
                                        const budgetDisplay = allocated > 0
                                            ? `$${allocated.toLocaleString()}`
                                            : 'N/A';

                                        return (
                                            <tr key={cc.costCenterId || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-slate-500">{cc.costCenterCode || 'N/A'}</td>
                                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{cc.costCenterName || 'N/A'}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{cc.department || 'N/A'}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{cc.managerName || 'N/A'}</td>
                                                <td className="px-6 py-4 text-right font-mono">{budgetDisplay}</td>
                                                <td className="px-6 py-4 text-right">
                                                    {allocated > 0 ? (
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold
                                                            ${utilizedPct > 90 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}
                                                        `}>
                                                            {utilizedPct}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

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
                            {costCenters.length > 0 ? costCenters.map((cc, i) => (
                                <div key={cc.costCenterId || i} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></div>
                                    <div className="flex-1 font-bold">{cc.costCenterName || cc.department || 'Unknown'}</div>
                                    <input
                                        type="number"
                                        defaultValue={cc.budget?.totalBudget || cc.budget?.allocatedBudget || 0}
                                        className="w-32 text-right p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                                    />
                                </div>
                            )) : (
                                <p className="text-slate-400 text-sm text-center py-4">No cost centers available to adjust.</p>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                            <button onClick={() => setShowEditModal(false)} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                            <button
                                onClick={() => {
                                    alert('Budget adjustment requires API integration for updates.');
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

