"use client";

import React, { useState, useEffect } from 'react';
import { DevelopmentPlanService } from '../core/services';
import {
    TrendingDown,
    Target,
    CalendarCheck,
    CheckCircle2,
    Clock,
    UserX,
    FolderCheck,
    Loader2
} from 'lucide-react';

export default function PipPage() {
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState<any[]>([]);

    useEffect(() => {
        async function loadPlans() {
            try {
                const data = await DevelopmentPlanService.getPlans();
                // Filter for PIP-type plans
                const pips = data.filter((p: any) =>
                    p.type?.toLowerCase().includes('pip') ||
                    p.name?.toLowerCase().includes('improvement') ||
                    p.type?.toLowerCase().includes('improvement')
                );
                setPlans(pips);
            } catch (error) {
                console.error('Failed to load PIPs:', error);
            } finally {
                setLoading(false);
            }
        }
        loadPlans();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingDown className="w-6 h-6 text-rose-500" />
                        Performance Improvement Plans (PIP)
                    </h1>
                    <p className="text-slate-500 text-sm">Manage structured improvement plans for underperforming employees.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700">
                    <UserX className="w-4 h-4" /> {plans.length} Active PIPs
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* PIP List */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">Active Plans</h3>
                    {plans.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <TrendingDown className="w-10 h-10 mb-2 opacity-30" />
                            <p className="text-sm font-medium">No active PIPs</p>
                            <p className="text-xs mt-1">Performance improvement plans will appear here</p>
                        </div>
                    ) : (
                        plans.map((p) => {
                            const completedActivities = p.activities?.filter((a: any) => a.status === 'Completed').length || 0;
                            const totalActivities = p.activities?.length || 1;
                            const progressPct = Math.round((completedActivities / totalActivities) * 100);
                            const endDate = p.endDate ? new Date(p.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No end date';

                            return (
                                <div key={p.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200">{p.name}</h3>
                                            <div className="text-xs text-slate-500 font-bold">{p.type}</div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${p.status === 'In Progress' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                                            {p.status}
                                        </span>
                                    </div>

                                    {p.description && (
                                        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl text-sm text-rose-800 dark:text-rose-300 italic border border-rose-100 dark:border-rose-900/30">
                                            "{p.description}"
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>Plan Progress</span>
                                            <span className="font-bold">{progressPct}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progressPct}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold pt-2 border-t border-slate-50 dark:border-slate-800">
                                        <div className="flex items-center gap-1">
                                            <CalendarCheck className="w-3 h-3" /> Ends: {endDate}
                                        </div>
                                        <button className="text-indigo-500 hover:text-indigo-600">View Objectives</button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Tracking & Evaluation */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-indigo-500" /> Evaluation Checklist
                        </h3>
                        <div className="space-y-3">
                            {[
                                { item: 'Weekly Check-in Logged', checked: false },
                                { item: 'Mentorship Session Completed', checked: false },
                                { item: 'Target A Achieved', checked: false },
                                { item: 'Target B Achieved', checked: false },
                            ].map((c, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border
                                        ${c.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent'}`}>
                                        <CheckCircle2 className="w-3 h-3" />
                                    </div>
                                    <span className={`text-sm font-bold ${c.checked ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{c.item}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">
                            Update Checklist
                        </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-800 text-white flex items-center gap-4">
                        <FolderCheck className="w-8 h-8 text-emerald-400" />
                        <div>
                            <div className="font-bold text-sm">Outcome Archives</div>
                            <div className="text-xs opacity-60">View history of successful/failed PIPs.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
