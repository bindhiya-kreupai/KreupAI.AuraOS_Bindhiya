"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Clock, Target, Plus, ChevronRight, Loader2 } from 'lucide-react';
import { DevelopmentPlanService } from '../services';
import type { DevelopmentPlan } from '../types';

export default function DevelopmentPlanningPage() {
    const [plans, setPlans] = useState<DevelopmentPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await DevelopmentPlanService.getPlans();
                setPlans(data);
            } catch {
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const activeGoals = plans.filter(p => p.status === 'active').length;
    const completedGoals = plans.filter(p => p.status === 'completed').length;
    const completionRate = plans.length > 0 ? Math.round((completedGoals / plans.length) * 100) : 0;

    const filteredPlans = filter === 'All' ? plans : plans.filter(p => {
        if (filter === 'In Progress') return p.status === 'active';
        if (filter === 'Completed') return p.status === 'completed';
        if (filter === 'Not Started') return p.status === 'draft' || p.status === 'pending';
        return true;
    });

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <BookOpen className="w-8 h-8 text-indigo-500" />
                        Development Planning (IDP)
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Track individual development plans and skill acquisitions.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                    <Plus className="w-5 h-5" /> Assign New Goal
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg text-indigo-600">
                            <Target className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-500">Active Goals</span>
                    </div>
                    <div className="text-4xl font-bold text-slate-900 dark:text-slate-100">{activeGoals}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg text-emerald-600">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-500">Completion Rate</span>
                    </div>
                    <div className="text-4xl font-bold text-slate-900 dark:text-slate-100">{completionRate}%</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg text-amber-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-500">Total Plans</span>
                    </div>
                    <div className="text-4xl font-bold text-slate-900 dark:text-slate-100">{plans.length}</div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex gap-4 overflow-x-auto">
                    {['All', 'In Progress', 'Completed', 'Not Started'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Employee</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Development Goal</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Progress</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Target Date</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredPlans.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-400">No development plans found.</td>
                            </tr>
                        ) : (
                            filteredPlans.map((plan, i) => {
                                const progress = plan.overallProgress || 0;
                                return (
                                    <tr key={plan.planId || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group cursor-pointer">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900 dark:text-slate-100">{plan.employeeName || 'N/A'}</div>
                                            <div className="text-xs text-slate-500">{plan.targetPosition || 'N/A'}</div>
                                        </td>
                                        <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                                            {plan.planName || 'Development Plan'}
                                        </td>
                                        <td className="p-4 w-48">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                                                            }`}
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-slate-500 w-8">{progress}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">{plan.targetCompletionDate || 'N/A'}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${plan.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' :
                                                    plan.status === 'active' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10' :
                                                        'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                                }`}>
                                                {plan.status || 'draft'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
