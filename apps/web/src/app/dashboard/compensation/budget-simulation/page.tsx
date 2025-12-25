"use client";

import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    TrendingUp,
    PieChart,
    Sliders,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Building2,
    Users
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { BudgetSimulationService } from '../services';

// --- MOCK DATA ---

const MONTHLY_TRENDS = [
    { month: 'Jan', budget: 150000, actual: 148000 },
    { month: 'Feb', budget: 150000, actual: 152000 },
    { month: 'Mar', budget: 150000, actual: 149000 },
    { month: 'Apr', budget: 155000, actual: 156000 },
    { month: 'May', budget: 155000, actual: 158000 },
    { month: 'Jun', budget: 155000, actual: 160000 },
    { month: 'Jul', budget: 160000, actual: 162000 }, // Projected starts here
    { month: 'Aug', budget: 160000, actual: 162000 },
    { month: 'Sep', budget: 160000, actual: 162000 },
    { month: 'Oct', budget: 160000, actual: 162000 },
    { month: 'Nov', budget: 160000, actual: 162000 },
    { month: 'Dec', budget: 170000, actual: 172000 }, // Bonus month
];

const DEPT_COSTS = [
    { name: 'Engineering', cost: 850000, employees: 42, color: '#6366f1' },
    { name: 'Sales', cost: 620000, employees: 28, color: '#10b981' },
    { name: 'Marketing', cost: 320000, employees: 14, color: '#f59e0b' },
    { name: 'Product', cost: 450000, employees: 18, color: '#8b5cf6' },
    { name: 'HR & Admin', cost: 210000, employees: 8, color: '#ec4899' },
];

export default function CostModelingPage() {
    const [simulations, setSimulations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [meritIncrease, setMeritIncrease] = useState(3);
    const [bonusPool, setBonusPool] = useState(10);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await BudgetSimulationService.getSimulations();
            setSimulations(data);
        } catch {
                    } finally {
            setLoading(false);
        }
    };

    // Simple calculation logic for "What-If"
    const baseTotal = 2450000; // Annual base
    const projectedImpact = Math.round(baseTotal * (meritIncrease / 100));
    const bonusImpact = Math.round(baseTotal * (bonusPool / 100));
    const totalProjected = baseTotal + projectedImpact + bonusImpact;

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-celestial-indigo" />
                        Workforce Cost Modeling
                    </h1>
                    <p className="text-silver-mist text-sm">Forecast personnel expenses and model budget scenarios.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-white dark:bg-stellar-blue px-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/20">
                    <RefreshCw className="w-4 h-4" />
                    Last updated: Today, 09:00 AM
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-24 h-24 text-celestial-indigo" />
                    </div>
                    <div className="text-sm font-bold text-silver-mist uppercase mb-1">YTD Spend</div>
                    <div className="text-3xl font-bold text-ink-black dark:text-pearl">$1.82M</div>
                    <div className="flex items-center gap-1 text-xs font-bold text-rose-500 mt-2">
                        <ArrowUpRight className="w-3 h-3" /> 2.4% over budget
                    </div>
                </div>

                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="text-sm font-bold text-silver-mist uppercase mb-1">Forecasted Annual</div>
                    <div className="text-3xl font-bold text-ink-black dark:text-pearl">${(totalProjected / 1000000).toFixed(2)}M</div>
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 mt-2">
                        <ArrowDownRight className="w-3 h-3" /> Within 5% variance
                    </div>
                </div>

                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-24 h-24 text-amber-500" />
                    </div>
                    <div className="text-sm font-bold text-silver-mist uppercase mb-1">Cost Per Head</div>
                    <div className="text-3xl font-bold text-ink-black dark:text-pearl">$82.5k</div>
                    <div className="text-xs text-slate-400 mt-2">
                        Avg across 110 employees
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Scenario Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-500/30">
                        <h3 className="font-bold mb-6 flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-indigo-400" /> Scenario Planner
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span>Merit Increase</span>
                                    <span className="text-indigo-300">{meritIncrease}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="10" step="0.5"
                                    value={meritIncrease}
                                    onChange={(e) => setMeritIncrease(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                <div className="text-xs text-slate-400 mt-1">Impact: +${(projectedImpact / 1000).toFixed(1)}k</div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span>Bonus Pool</span>
                                    <span className="text-indigo-300">{bonusPool}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="25" step="1"
                                    value={bonusPool}
                                    onChange={(e) => setBonusPool(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                <div className="text-xs text-slate-400 mt-1">Impact: +${(bonusImpact / 1000).toFixed(1)}k</div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-300">Total Projected</span>
                                <span className="font-bold text-lg">${(totalProjected / 1000000).toFixed(2)}M</span>
                            </div>
                            <button className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20">
                                Save Scenario
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-silver-mist" /> Department Spend
                        </h3>
                        <div className="space-y-4">
                            {DEPT_COSTS.map(dept => (
                                <div key={dept.name}>
                                    <div className="flex justify-between text-xs font-bold text-ink-black dark:text-pearl mb-1">
                                        <span>{dept.name}</span>
                                        <span>${(dept.cost / 1000).toFixed(0)}k</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${(dept.cost / 850000) * 100}%`, backgroundColor: dept.color }}
                                        ></div>
                                    </div>
                                    <div className="text-[10px] text-silver-mist mt-1 text-right">{dept.employees} Employees</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Trend Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col">
                    <div className="mb-6">
                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            Budget vs Actual Trends
                        </h3>
                        <p className="text-xs text-silver-mist">Monthly payroll expense tracking for current fiscal year.</p>
                    </div>

                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MONTHLY_TRENDS} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <Tooltip
                                    cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="budget"
                                    stroke="#94a3b8"
                                    strokeDasharray="5 5"
                                    fillOpacity={1}
                                    fill="url(#colorBudget)"
                                    name="Budget"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="actual"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorActual)"
                                    name="Actual Spend"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
