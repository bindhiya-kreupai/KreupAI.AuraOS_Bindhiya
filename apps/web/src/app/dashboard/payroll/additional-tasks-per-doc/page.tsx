"use client";

import React, { useState, useEffect } from 'react';
import {
    ListTodo,
    CheckSquare,
    Clock,
    UserPlus
} from 'lucide-react';
import { PayrollRunService } from '../services';

export default function AdditionalTasksPage() {
    const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await PayrollRunService.getPayrollRuns();
            if (result.length > 0) {
                setPayrollRuns(result);
            }
        } catch {
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                <div className="space-y-2">
                    {[
                        { task: 'Verify New Hire Bank Details', due: 'Dec 25', status: 'Pending', icon: UserPlus },
                        { task: 'Confirm Loss of Pay Data with HR', due: 'Dec 27', status: 'Pending', icon: Clock },
                        { task: 'Review Tax Declarations for Q4', due: 'Dec 28', status: 'In Progress', icon: CheckSquare },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                            <div className="mr-4">
                                <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                            </div>
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 mr-4">
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-sm">{item.task}</div>
                                <div className="text-xs text-slate-500">Due: {item.due}</div>
                            </div>
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">{item.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
