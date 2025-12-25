'use client';

import React, { useState } from 'react';
import { GitFork, Play, Plus, RefreshCw, Sliders } from 'lucide-react';

export default function ScenarioModelingPage() {
    const [budgetChange, setBudgetChange] = useState(10);
    const [hiringFreeze, setHiringFreeze] = useState(false);

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GitFork className="w-6 h-6 text-purple-500" />
                        Scenario Modeling
                    </h1>
                    <p className="text-slate-500 text-sm">Simulate "What-if" scenarios to prepare for future changes.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Reset
                    </button>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20 flex items-center gap-2">
                        <Play className="w-4 h-4" /> Run Simulation
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Controls */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-slate-500" /> Parameters
                    </h3>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Budget Adjustment: {budgetChange > 0 ? '+' : ''}{budgetChange}%
                        </label>
                        <input
                            type="range"
                            min="-50"
                            max="50"
                            value={budgetChange}
                            onChange={(e) => setBudgetChange(parseInt(e.target.value))}
                            className="w-full accent-purple-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>-50%</span>
                            <span>0%</span>
                            <span>+50%</span>
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${hiringFreeze ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-700'}`} onClick={() => setHiringFreeze(!hiringFreeze)}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${hiringFreeze ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                            <span className="text-sm font-medium group-hover:text-purple-600 transition-colors">Implement Hiring Freeze</span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Market Growth Rate
                        </label>
                        <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 text-sm">
                            <option>Conservative (5%)</option>
                            <option>Moderate (10%)</option>
                            <option>Aggressive (20%)</option>
                        </select>
                    </div>
                </div>

                {/* Results Preview */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                            <div className="text-slate-500 text-sm mb-1">Projected Headcount</div>
                            <div className="text-3xl font-bold text-slate-800 dark:text-white">1,342</div>
                            <div className="text-xs text-emerald-500 font-bold mt-2">Safe Capacity</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                            <div className="text-slate-500 text-sm mb-1">Est. Payroll Cost</div>
                            <div className={`text-3xl font-bold ${budgetChange > 20 ? &apos;text-red-500' : 'text-slate-800 dark:text-white'}`}>$14.2M</div>
                            <div className="text-xs text-slate-400 mt-2">Per Quarter</div>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 h-[300px] flex items-center justify-center text-slate-400 border-dashed">
                        [Impact Simulation Chart Placeholder]
                    </div>
                </div>
            </div>
        </div>
    );
}
