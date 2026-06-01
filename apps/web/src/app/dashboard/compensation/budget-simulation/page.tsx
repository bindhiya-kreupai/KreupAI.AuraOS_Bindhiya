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
    Users,
    Loader2
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
import { BudgetSimulationService, CompensationAnalyticsService } from '../services';

export default function CostModelingPage() {
    const [simulations, setSimulations] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [meritIncrease, setMeritIncrease] = useState(3);
    const [bonusPool, setBonusPool] = useState(10);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [simData, metricsData] = await Promise.all([
                BudgetSimulationService.getSimulations(),
                CompensationAnalyticsService.getMetrics(),
            ]);
            setSimulations(simData);
            setMetrics(metricsData);
        } catch (error: any) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalCompensation = metrics?.totalCompensationCost || 0;
    const totalEmployees = metrics?.totalEmployees || 0;
    const costPerHead = totalEmployees > 0 ? totalCompensation / totalEmployees : 0;

    const projectedImpact = Math.round(totalCompensation * (meritIncrease / 100));
    const bonusImpact = Math.round(totalCompensation * (bonusPool / 100));
    const totalProjected = totalCompensation + projectedImpact + bonusImpact;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-celestial-indigo" />
                        Workforce Cost Modeling
                    </h1>
                    <p className="text-silver-mist text-sm">Forecast personnel expenses and model budget scenarios.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-white dark:bg-stellar-blue px-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/20">
                    <RefreshCw className="w-4 h-4" />
                    {totalEmployees} active employees
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-24 h-24 text-celestial-indigo" />
                    </div>
                    <div className="text-sm font-bold text-silver-mist uppercase mb-1">Current Total Cost</div>
                    <div className="text-3xl font-bold text-ink-black dark:text-pearl">
                        {totalCompensation > 0 ? `$${(totalCompensation / 1000000).toFixed(2)}M` : '--'}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">{totalEmployees} employees</div>
                </div>

                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="text-sm font-bold text-silver-mist uppercase mb-1">Projected Annual</div>
                    <div className="text-3xl font-bold text-ink-black dark:text-pearl">
                        {totalProjected > 0 ? `$${(totalProjected / 1000000).toFixed(2)}M` : '--'}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 mt-2">
                        <ArrowUpRight className="w-3 h-3" />
                        +{totalCompensation > 0 ? (((totalProjected - totalCompensation) / totalCompensation) * 100).toFixed(1) : 0}% projected increase
                    </div>
                </div>

                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-24 h-24 text-amber-500" />
                    </div>
                    <div className="text-sm font-bold text-silver-mist uppercase mb-1">Cost Per Head</div>
                    <div className="text-3xl font-bold text-ink-black dark:text-pearl">
                        {costPerHead > 0 ? `$${(costPerHead / 1000).toFixed(1)}k` : '--'}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                        Avg across {totalEmployees} employees
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Scenario Controls */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-500/30">
                        <h3 className="font-bold mb-6 flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-indigo-400" /> Scenario Planner
                        </h3>

                        <div className="space-y-4">
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
                                <div className="text-xs text-slate-400 mt-1">
                                    Impact: +${projectedImpact > 0 ? (projectedImpact / 1000).toFixed(1) + 'k' : '0'}
                                </div>
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
                                <div className="text-xs text-slate-400 mt-1">
                                    Impact: +${bonusImpact > 0 ? (bonusImpact / 1000).toFixed(1) + 'k' : '0'}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-300">Total Projected</span>
                                <span className="font-bold text-lg">
                                    {totalProjected > 0 ? `$${(totalProjected / 1000000).toFixed(2)}M` : '--'}
                                </span>
                            </div>
                            <button className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20">
                                Save Scenario
                            </button>
                        </div>
                    </div>

                    {/* Simulations */}
                    {simulations.length > 0 && (
                        <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                            <h3 className="font-bold text-ink-black dark:text-pearl mb-4">Saved Simulations</h3>
                            <div className="space-y-3">
                                {simulations.map((sim: any, i: number) => (
                                    <div key={sim.id || i} className="p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
                                        <div className="text-sm font-bold">{sim.simulationName || sim.name || `Scenario ${i + 1}`}</div>
                                        <div className="text-xs text-slate-400 mt-1">{sim.description || sim.fiscalYear || '--'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Summary */}
                <div className="lg:col-span-2 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col">
                    <div className="mb-6">
                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            Compensation Breakdown
                        </h3>
                        <p className="text-xs text-silver-mist">Current compensation distribution and projected changes.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="p-4 bg-slate-50 dark:bg-deep-cosmos rounded-xl">
                            <div className="text-xs text-slate-400 uppercase font-bold">Average Compensation</div>
                            <div className="text-xl font-bold text-ink-black dark:text-pearl mt-1">
                                ${metrics?.averageCompensation ? Math.round(metrics.averageCompensation).toLocaleString() : '--'}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-deep-cosmos rounded-xl">
                            <div className="text-xs text-slate-400 uppercase font-bold">Median Compensation</div>
                            <div className="text-xl font-bold text-ink-black dark:text-pearl mt-1">
                                ${metrics?.medianCompensation ? Math.round(metrics.medianCompensation).toLocaleString() : '--'}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-deep-cosmos rounded-xl">
                            <div className="text-xs text-slate-400 uppercase font-bold">Merit Impact</div>
                            <div className="text-xl font-bold text-emerald-600 mt-1">
                                +${projectedImpact > 0 ? (projectedImpact / 1000).toFixed(0) + 'K' : '0'}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-deep-cosmos rounded-xl">
                            <div className="text-xs text-slate-400 uppercase font-bold">Bonus Impact</div>
                            <div className="text-xl font-bold text-amber-600 mt-1">
                                +${bonusImpact > 0 ? (bonusImpact / 1000).toFixed(0) + 'K' : '0'}
                            </div>
                        </div>
                    </div>

                    {metrics?.bonusMetrics && (
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                            <div className="text-sm font-bold text-indigo-800 dark:text-indigo-200 mb-2">Bonus Metrics</div>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                                <div>
                                    <div className="text-slate-500">Total Bonuses</div>
                                    <div className="font-bold text-ink-black dark:text-pearl">{metrics.bonusMetrics.totalBonuses}</div>
                                </div>
                                <div>
                                    <div className="text-slate-500">Total Amount</div>
                                    <div className="font-bold text-ink-black dark:text-pearl">${Number(metrics.bonusMetrics.totalBonusAmount).toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-slate-500">Avg %</div>
                                    <div className="font-bold text-ink-black dark:text-pearl">{metrics.bonusMetrics.averageBonusPercentage?.toFixed(1)}%</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

