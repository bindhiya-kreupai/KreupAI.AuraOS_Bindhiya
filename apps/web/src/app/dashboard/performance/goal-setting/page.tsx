"use client";

import React, { useState, useEffect } from 'react';
import { GoalService } from '../core/services';
import {
    Target,
    Plus,
    Calendar,
    CheckCircle2,
    TrendingUp,
    MoreVertical,
    Loader2
} from 'lucide-react';

export default function GoalSettingPage() {
    const [activeTab, setActiveTab] = useState('active');
    const [loading, setLoading] = useState(true);
    const [goals, setGoals] = useState<any[]>([]);

    useEffect(() => {
        async function loadGoals() {
            try {
                const data = await GoalService.getGoals();
                setGoals(data);
            } catch (error) {
                console.error('Failed to load goals:', error);
            } finally {
                setLoading(false);
            }
        }
        loadGoals();
    }, []);

    const activeGoals = goals.filter(g => g.status !== 'completed' && g.status !== 'archived');
    const archivedGoals = goals.filter(g => g.status === 'completed' || g.status === 'archived');
    const displayGoals = activeTab === 'active' ? activeGoals : archivedGoals;

    const getStatusLabel = (goal: any) => {
        if (goal.status === 'completed') return 'Completed';
        if (goal.progress < 30) return 'At Risk';
        return 'On Track';
    };

    const getTypeLabel = (goal: any) => {
        if (goal.type === 'objective' || goal.category === 'Objective') return 'Objective';
        if (goal.type === 'key_result' || goal.category === 'Key Result') return 'Key Result';
        return 'Personal';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Target className="w-6 h-6 text-indigo-500" />
                        Goal Setting
                    </h1>
                    <p className="text-slate-500 text-sm">Define and track your OKRs and performance objectives.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Goal
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`pb-3 px-2 font-bold text-sm transition-colors ${activeTab === 'active' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Active Goals ({activeGoals.length})
                </button>
                <button
                    onClick={() => setActiveTab('archived')}
                    className={`pb-3 px-2 font-bold text-sm transition-colors ${activeTab === 'archived' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Archived ({archivedGoals.length})
                </button>
            </div>

            {/* Goals List */}
            {displayGoals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <Target className="w-12 h-12 mb-3 opacity-30" />
                    <p className="font-bold text-lg">No goals found</p>
                    <p className="text-sm mt-1">Create your first goal to get started</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {displayGoals.map((goal) => {
                        const statusLabel = getStatusLabel(goal);
                        const typeLabel = getTypeLabel(goal);
                        const progress = `${goal.progress || 0}%`;
                        const dueDate = goal.dueDate ? new Date(goal.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date';

                        return (
                            <div key={goal.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 group hover:border-indigo-300 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${typeLabel === 'Objective' ? 'bg-purple-100 text-purple-600' :
                                                    typeLabel === 'Key Result' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                                                }`}>{typeLabel}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${statusLabel === 'On Track' ? 'bg-emerald-100 text-emerald-600' :
                                                    statusLabel === 'At Risk' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                                                }`}>{statusLabel}</span>
                                        </div>
                                        <h3 className="font-bold text-lg">{goal.title}</h3>
                                    </div>
                                    <button className="text-slate-400 hover:text-slate-600">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-bold text-slate-500">Progress</span>
                                            <span className="font-bold">{progress}</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${statusLabel === 'On Track' ? 'bg-emerald-500' :
                                                    statusLabel === 'At Risk' ? 'bg-rose-500' : 'bg-indigo-500'
                                                }`} style={{ width: progress }}></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Due: {dueDate}</span>
                                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {goal.type || 'Individual'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Quick Add Placeholder */}
            <button className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-500 transition-all">
                <Plus className="w-5 h-5" /> Add New Goal
            </button>
        </div>
    );
}
