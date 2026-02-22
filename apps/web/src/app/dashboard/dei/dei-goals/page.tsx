"use client";

import React, { useState, useEffect } from 'react';
import {
    Target,
    CheckCircle2,
    Calendar,
    ArrowRight,
    Plus,
    Loader2
} from 'lucide-react';
import { DEIGoalsService } from '../services';

export default function DeiGoalsPage() {
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await DEIGoalsService.getAllGoals();
                setGoals(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Target className="w-6 h-6 text-indigo-500" />
                        DEI Goals & OKRs
                    </h1>
                    <p className="text-slate-500 text-sm">Track progress towards organizational diversity objectives.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add New Goal
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                {goals.map((goal, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{goal.title}</h3>
                                <div className="text-sm text-slate-500 mt-1">{goal.target}</div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${goal.status === 'On Track' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                {goal.status}
                            </span>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between text-sm font-bold mb-2">
                                <span className="text-slate-500">Progress</span>
                                <span>{goal.current}</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${goal.color} transition-all duration-1000`}
                                    style={{ width: `${goal.progress}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Calendar className="w-4 h-4" />
                                <span>Due: {goal.deadline}</span>
                            </div>
                            <button className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:underline">
                                View Key Results <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Create Goal Checkpoint */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group min-h-[200px]">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-slate-500" />
                    </div>
                    <h3 className="font-bold text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300">Create Annual Goal</h3>
                    <p className="text-xs mt-1">Set new targets for FY 2025</p>
                </div>
            </div>
        </div>
    );
}

