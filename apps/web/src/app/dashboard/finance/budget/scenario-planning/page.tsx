"use client";

import React, { useState, useEffect } from 'react';
import {
    GitBranch,
    Play,
    Save,
    Trash2
} from 'lucide-react';
import { BudgetScenarioService } from '../../services';

export default function ScenarioPlanningPage() {
    const [scenarios, setScenarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await BudgetScenarioService.getScenarios();
            if (result.length > 0) {
                setScenarios(result);
            }
        } catch {
                    } finally {
            setLoading(false);
        }
    };

    // Fallback mock data when no scenarios from API
    const displayScenarios = scenarios.length > 0 ? scenarios : [
        { id: '1', scenarioName: 'High Growth (Aggressive)', description: 'Assumes 20% headcount increase & 5% salary hike.', status: 'draft', impact: '+$2.4M Cost' },
        { id: '2', scenarioName: 'Market Downturn (Conservative)', description: 'Hiring freeze, 0% bonus payout.', status: 'saved', impact: '-$1.2M Savings' },
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GitBranch className="w-6 h-6 text-indigo-500" />
                        Scenario Planning
                    </h1>
                    <p className="text-slate-500 text-sm">Create &apos;What-if' scenarios to test budget resilience.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Play className="w-4 h-4" /> Run New Simulation
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-slate-500">Loading scenarios...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {displayScenarios.map((s, i) => (
                        <div key={s.id || i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg">{s.scenarioName || s.title}</h3>
                                <span className="bg-slate-100 dark:bg-slate-800 text-xs font-bold px-2 py-1 rounded text-slate-500 capitalize">{s.status}</span>
                            </div>
                            <p className="text-sm text-slate-500 mb-6">{s.description || s.desc}</p>

                            <div className="flex items-center justify-between mt-auto">
                                <span className={`font-bold text-sm ${(s.impact || '').includes('+') ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    Impact: {s.impact || 'N/A'}
                                </span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><Save className="w-4 h-4" /></button>
                                    <button className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-rose-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
