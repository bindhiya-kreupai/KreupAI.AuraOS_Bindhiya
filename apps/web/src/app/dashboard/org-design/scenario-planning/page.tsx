"use client";

import React, { useState } from 'react';
import {
    GitBranch,
    Plus,
    Users,
    DollarSign,
    ArrowRight,
    TrendingUp,
    TrendingDown,
    Save,
    MoreHorizontal,
    Layout,
    Check
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

// --- MOCK DATA ---

interface Scenario {
    id: string;
    name: string;
    description: string;
    status: 'Draft' | 'Active' | 'Archived';
    lastModified: string;
    metrics: {
        headcountChange: number;
        budgetChange: number; // in millions
    };
}

const SCENARIOS: Scenario[] = [
    {
        id: 'SCN-2025-A',
        name: 'Q1 Growth Plan',
        description: 'Expansion of Engineering and Sales teams for APAC region.',
        status: 'Active',
        lastModified: '2 hours ago',
        metrics: { headcountChange: 45, budgetChange: 1.2 }
    },
    {
        id: 'SCN-2025-B',
        name: 'Efficiency Model',
        description: 'Consolidation of support functions to Shared Services.',
        status: 'Draft',
        lastModified: '1 day ago',
        metrics: { headcountChange: -12, budgetChange: -0.8 }
    },
    {
        id: 'SCN-2024-FINAL',
        name: '2024 Baseline',
        description: 'Current operating structure.',
        status: 'Archived',
        lastModified: '1 year ago',
        metrics: { headcountChange: 0, budgetChange: 0 }
    }
];

const IMPACT_DATA = [
    { name: 'Engineering', current: 120, proposed: 150 },
    { name: 'Sales', current: 80, proposed: 95 },
    { name: 'Marketing', current: 40, proposed: 40 },
    { name: 'Support', current: 60, proposed: 45 },
];

export default function ScenarioPlanningPage() {
    const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <GitBranch className="w-6 h-6 text-celestial-indigo" />
                        Scenario Planning
                    </h1>
                    <p className="text-silver-mist text-sm">Model organizational changes, analyze impact, and plan for the future.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20">
                    <Plus className="w-4 h-4" /> New Model
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Scenarios List */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm min-h-[500px]">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4">Saved Models</h3>
                        <div className="space-y-3">
                            {SCENARIOS.map(scenario => (
                                <div
                                    key={scenario.id}
                                    onClick={() => setSelectedScenario(scenario)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all group ${selectedScenario.id === scenario.id
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-celestial-indigo ring-1 ring-celestial-indigo'
                                        : 'bg-white dark:bg-stellar-blue border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-sm text-ink-black dark:text-pearl group-hover:text-celestial-indigo transition-colors">{scenario.name}</div>
                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${scenario.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                                            scenario.status === 'Draft' ? 'bg-amber-100 text-amber-600' :
                                                'bg-slate-100 text-slate-500'
                                            }`}>
                                            {scenario.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-silver-mist mb-3 line-clamp-2">{scenario.description}</p>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                            <Users className="w-3 h-3" />
                                            <span className={scenario.metrics.headcountChange > 0 ? 'text-emerald-500' : scenario.metrics.headcountChange < 0 ? 'text-rose-500' : ''}>
                                                {scenario.metrics.headcountChange > 0 ? '+' : ''}{scenario.metrics.headcountChange}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                            <DollarSign className="w-3 h-3" />
                                            <span className={scenario.metrics.budgetChange > 0 ? 'text-rose-500' : scenario.metrics.budgetChange < 0 ? 'text-emerald-500' : ''}>
                                                {scenario.metrics.budgetChange > 0 ? '+' : ''}{scenario.metrics.budgetChange}M
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Analysis & Modeler */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Impact Analysis Widget */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                            <div className="text-xs font-bold text-silver-mist uppercase mb-1">Projected Headcount</div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-ink-black dark:text-pearl">345</span>
                                <span className={`flex items-center text-sm font-bold mb-1 ${selectedScenario.metrics.headcountChange >= 0 ? 'text-emerald-500' : 'text-rose-500'
                                    }`}>
                                    {selectedScenario.metrics.headcountChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                                    {Math.abs(selectedScenario.metrics.headcountChange)}
                                </span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                            <div className="text-xs font-bold text-silver-mist uppercase mb-1">Projected Cost</div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-ink-black dark:text-pearl">$14.2M</span>
                                <span className={`flex items-center text-sm font-bold mb-1 ${selectedScenario.metrics.budgetChange > 0 ? 'text-rose-500' : 'text-emerald-500'
                                    }`}>
                                    {selectedScenario.metrics.budgetChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                                    ${Math.abs(selectedScenario.metrics.budgetChange)}M
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Department Impact Chart */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4">Department Impact Analysis</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={IMPACT_DATA} barGap={4}>
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                                        itemStyle={{ color: '#f8fafc' }}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar dataKey="current" name="Current HC" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={32} />
                                    <Bar dataKey="proposed" name="Proposed HC" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Visual Tree Modeler (Mock) */}
                    <div className="bg-slate-50 dark:bg-deep-cosmos/50 p-1 rounded-2xl border border-cloud dark:border-nebula-purple/50 overflow-hidden relative min-h-[300px] flex flex-col">
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-stellar-blue rounded-xl shadow-sm mb-4 m-1">
                            <div className="flex items-center gap-2">
                                <Layout className="w-4 h-4 text-celestial-indigo" />
                                <span className="text-sm font-bold text-ink-black dark:text-pearl">Structure View</span>
                            </div>
                            <button className="text-xs font-bold text-celestial-indigo hover:underline">Full Screen Editor</button>
                        </div>

                        {/* Mock Tree */}
                        <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-4">
                            {/* CEO */}
                            <div className="bg-white dark:bg-stellar-blue px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-900 shadow-md flex flex-col items-center w-40 relative z-10">
                                <div className="text-xs font-bold text-indigo-600">CEO</div>
                                <div className="font-bold text-sm">Sarah C.</div>
                                {/* Connector */}
                                <div className="absolute top-full left-1/2 w-px h-8 bg-slate-300 dark:bg-slate-600"></div>
                            </div>

                            {/* Line */}
                            <div className="w-[300px] h-px bg-slate-300 dark:bg-slate-600 relative">
                                <div className="absolute top-0 left-0 w-px h-4 bg-slate-300 dark:bg-slate-600 transform translate-y-0"></div>
                                <div className="absolute top-0 right-0 w-px h-4 bg-slate-300 dark:bg-slate-600 transform translate-y-0"></div>
                                <div className="absolute top-0 left-1/2 w-px h-4 bg-slate-300 dark:bg-slate-600 transform translate-y-0"></div>
                            </div>

                            {/* VPs */}
                            <div className="flex gap-8">
                                <div className="bg-white dark:bg-stellar-blue px-4 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 shadow-sm w-32 text-center">
                                    <div className="text-[10px] text-silver-mist uppercase">CTO</div>
                                    <div className="font-bold text-sm">Tech</div>
                                    <div className="text-xs text-emerald-500 font-bold mt-1">+15 HC</div>
                                </div>
                                <div className="bg-white dark:bg-stellar-blue px-4 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 shadow-sm w-32 text-center">
                                    <div className="text-[10px] text-silver-mist uppercase">CFO</div>
                                    <div className="font-bold text-sm">Finance</div>
                                    <div className="text-xs text-slate-400 font-bold mt-1">No Change</div>
                                </div>
                                <div className="bg-white dark:bg-stellar-blue px-4 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 shadow-sm w-32 text-center border-dashed border-2 border-slate-300 opacity-70">
                                    <div className="text-[10px] text-silver-mist uppercase">COO</div>
                                    <div className="font-bold text-sm">Ops</div>
                                    <div className="text-xs text-rose-500 font-bold mt-1">-5 HC</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 border-t border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue flex justify-end gap-2">
                            <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-ink-black">Revert</button>
                            <button className="px-4 py-1.5 bg-celestial-indigo text-white rounded-lg text-xs font-bold hover:bg-celestial-indigo/90 shadow-lg shadow-celestial-indigo/20 flex items-center gap-2">
                                <Save className="w-3 h-3" /> Save Draft
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
