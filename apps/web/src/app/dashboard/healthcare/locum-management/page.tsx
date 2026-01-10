"use client";

import React from 'react';
import {
    Briefcase,
    Calendar,
    DollarSign,
    UserPlus,
    Loader2
} from 'lucide-react';
import { useHealthcare } from '../hooks/useHealthcare';

export default function LocumManagementPage() {
    const { locumProviders, locumAssignments, loading, error } = useHealthcare();

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center text-rose-500 font-bold">
                Error: {error}
            </div>
        );
    }

    const openAssignments = locumAssignments.filter(a => a.status === 'pending');
    const totalBudgetUsage = locumAssignments.reduce((acc, a) => acc + a.totalCompensation, 0);
    const averageRating = locumProviders.length > 0
        ? locumProviders.reduce((acc, p) => acc + p.performanceRating, 0) / locumProviders.length
        : 0;

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-indigo-500" />
                        Locum Management
                    </h1>
                    <p className="text-slate-500 text-sm">Fill temporary vacancies and manage agency staff.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Request Locum
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Current Assignments</h3>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {locumAssignments.map((assignment, i) => (
                            <div key={assignment.assignmentId || i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <div>
                                    <div className="font-bold">{assignment.specialty} @ {assignment.facility}</div>
                                    <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                        <Calendar className="w-3 h-3" /> {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.endDate).toLocaleDateString()}
                                    </div>
                                    <div className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-1">
                                        <DollarSign className="w-3 h-3" /> ${assignment.rate}/hr
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${assignment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' :
                                        assignment.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                            'bg-indigo-100 text-indigo-600'
                                    }`}>
                                    {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                </span>
                            </div>
                        ))}
                        {locumAssignments.length === 0 && (
                            <div className="text-center py-10 text-slate-400">No locum assignments found.</div>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Agency Stats</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-bold text-slate-500">Total Compensation Commit</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">${totalBudgetUsage.toLocaleString()}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[65%]" style={{ width: `${Math.min((totalBudgetUsage / 100000) * 100, 100)}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-bold text-slate-500">Average Provider Performance</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{(averageRating * 20).toFixed(1)}% Fill Satisfaction</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[85%]" style={{ width: `${(averageRating / 5) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
