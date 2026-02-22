"use client";

import React, { useState, useEffect } from 'react';
import {
    ListTodo,
    CheckSquare,
    Clock,
    UserPlus,
    Loader2
} from 'lucide-react';
import { PayrollRunService } from '../services';
import type { PayrollRun, PayrollException } from '../types';

export default function AdditionalTasksPage() {
    const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await PayrollRunService.getPayrollRuns();
            setPayrollRuns(result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Derive tasks from unresolved exceptions across payroll runs
    const tasks = payrollRuns.flatMap(run =>
        (run.exceptions || [])
            .filter(exc => !exc.resolved)
            .map(exc => ({
                id: exc.id,
                task: exc.message,
                type: exc.type,
                severity: exc.severity,
                employeeName: exc.employeeName,
                runMonth: run.monthName,
                icon: exc.type === 'missing_bank_details' ? UserPlus :
                    exc.type === 'missing_attendance' ? Clock : CheckSquare,
                status: exc.severity === 'high' ? 'Urgent' : 'Pending',
            }))
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-slate-500 font-medium">Loading tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ListTodo className="w-6 h-6 text-indigo-500" />
                        Additional Tasks
                    </h1>
                    <p className="text-slate-500 text-sm">Ad-hoc checklist for monthly payroll closure.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                    Add Task
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <CheckSquare className="w-12 h-12 text-emerald-400 mb-3" />
                        <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">All Tasks Complete</h3>
                        <p className="text-sm text-slate-500 mt-1">No pending tasks for payroll closure.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {tasks.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <div key={item.id} className="flex items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                                    <div className="mr-4">
                                        <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                    </div>
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 mr-4">
                                        <IconComponent className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm">{item.task}</div>
                                        <div className="text-xs text-slate-500">{item.employeeName} - {item.runMonth}</div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'Urgent' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                                        {item.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

