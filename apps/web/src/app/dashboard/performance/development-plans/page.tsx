"use client";

import React, { useState, useEffect } from 'react';
import { DevelopmentPlanService } from '../core/services';
import {
    Rocket,
    Target,
    BookOpen,
    Loader2
} from 'lucide-react';

export default function DevelopmentPlansPage() {
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState<any[]>([]);

    useEffect(() => {
        async function loadPlans() {
            try {
                const data = await DevelopmentPlanService.getPlans();
                setPlans(data);
            } catch (error) {
                console.error('Failed to load development plans:', error);
            } finally {
                setLoading(false);
            }
        }
        loadPlans();
    }, []);

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
                        <Rocket className="w-6 h-6 text-indigo-500" />
                        Development Plans
                    </h1>
                    <p className="text-slate-500 text-sm">Create and track Individual Development Plans (IDPs).</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                    <Target className="w-4 h-4" /> New Plan
                </button>
            </div>

            {plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <Rocket className="w-12 h-12 mb-3 opacity-30" />
                    <p className="font-bold text-lg">No development plans found</p>
                    <p className="text-sm mt-1">Create your first IDP to start tracking growth</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const completedActivities = plan.activities?.filter((a: any) => a.status === 'Completed').length || 0;
                        const totalActivities = plan.activities?.length || 0;
                        const progressPct = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
                        const isCompleted = plan.status === 'Completed';
                        const isInProgress = plan.status === 'In Progress' || plan.status === 'Active';
                        const dueDate = plan.endDate ? new Date(plan.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'No due date';

                        return (
                            <div key={plan.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative group overflow-hidden">
                                <div className={`absolute top-0 left-0 w-1 h-full ${isCompleted ? 'bg-emerald-500' :
                                        isInProgress ? 'bg-indigo-500' : 'bg-slate-300'
                                    }`}></div>

                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold uppercase">{plan.type}</span>
                                    <span className="text-xs font-bold text-slate-500">Due: {dueDate}</span>
                                </div>

                                <h3 className="font-bold text-lg mb-2">{plan.name}</h3>

                                <div className="mt-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-slate-500">{plan.status}</span>
                                        <span className="font-bold">{progressPct}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'
                                            }`} style={{ width: `${progressPct}%` }}></div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button className="text-sm font-bold text-indigo-600 hover:underline">View Details</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
