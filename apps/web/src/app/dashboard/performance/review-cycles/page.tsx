"use client";

import React, { useState, useEffect } from 'react';
import { ReviewCycleService } from '../core/services';
import {
    CalendarRange,
    Plus,
    Clock,
    CheckCircle2,
    Users,
    Loader2
} from 'lucide-react';

export default function ReviewCyclesPage() {
    const [loading, setLoading] = useState(true);
    const [cycles, setCycles] = useState<any[]>([]);

    useEffect(() => {
        async function loadCycles() {
            try {
                const data = await ReviewCycleService.getCycles();
                setCycles(data);
            } catch (error) {
                console.error('Failed to load review cycles:', error);
            } finally {
                setLoading(false);
            }
        }
        loadCycles();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarRange className="w-6 h-6 text-indigo-500" />
                        Review Cycles
                    </h1>
                    <p className="text-slate-500 text-sm">Manage performance review periods and timelines.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create Cycle
                </button>
            </div>

            {cycles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <CalendarRange className="w-12 h-12 mb-3 opacity-30" />
                    <p className="font-bold text-lg">No review cycles found</p>
                    <p className="text-sm mt-1">Create your first review cycle to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {cycles.map((cycle) => {
                        const reviewCount = cycle.reviews?.length || 0;
                        const completedCount = cycle.reviews?.filter((r: any) => r.status === 'completed').length || 0;
                        const completionPct = reviewCount > 0 ? Math.round((completedCount / reviewCount) * 100) : 0;
                        const isCompleted = cycle.status === 'completed';
                        const dueDate = cycle.endDate ? new Date(cycle.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No end date';

                        return (
                            <div key={cycle.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 group hover:border-indigo-300 transition-colors cursor-pointer">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold">{cycle.cycleName}</h3>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${cycle.isActive && cycle.status !== 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                            }`}>{cycle.status}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Due: {dueDate}</span>
                                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {reviewCount} Participants</span>
                                    </div>
                                </div>

                                <div className="flex-1 w-full md:w-auto">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">Phase: {cycle.cycleType}</span>
                                        <span className="font-bold">{completionPct}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${isCompleted ? 'bg-slate-400' : 'bg-indigo-500'
                                            }`} style={{ width: `${completionPct}%` }}></div>
                                    </div>
                                </div>

                                <div>
                                    <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800">
                                        Manage
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

