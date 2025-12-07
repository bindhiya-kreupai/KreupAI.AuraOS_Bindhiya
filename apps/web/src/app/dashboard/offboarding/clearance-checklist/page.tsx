"use client";

import React, { useState } from 'react';
import {
    CheckSquare,
    Search,
    Filter,
    AlertCircle,
    CheckCircle2,
    Clock,
    Laptop,
    CreditCard,
    Key,
    FileSignature,
    MoreHorizontal,
    ArrowRight
} from 'lucide-react';

export default function ClearanceChecklistPage() {
    const [filter, setFilter] = useState('All');

    const clearanceItems = [
        { id: 1, employee: 'Sarah Jenkins', dept: 'IT', item: 'Return MacBook Pro (M2)', status: 'Pending', dueDate: 'Oct 30, 2024' },
        { id: 2, employee: 'Sarah Jenkins', dept: 'IT', item: 'Revoke AWS Access', status: 'Completed', dueDate: 'Oct 30, 2024' },
        { id: 3, employee: 'Michael Chen', dept: 'Finance', item: 'Clear Corporate Card Dues', status: 'Pending', dueDate: 'Nov 05, 2024' },
        { id: 4, employee: 'Michael Chen', dept: 'Admin', item: 'Return Parking Tag', status: 'Pending', dueDate: 'Nov 05, 2024' },
        { id: 5, employee: 'Priya Patel', dept: 'HR', item: 'Exit Interview Completed', status: 'Completed', dueDate: 'Nov 15, 2024' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
            case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getDeptIcon = (dept: string) => {
        switch (dept) {
            case 'IT': return <Laptop className="w-4 h-4" />;
            case 'Finance': return <CreditCard className="w-4 h-4" />;
            case 'Admin': return <Key className="w-4 h-4" />;
            default: return <FileSignature className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CheckSquare className="w-6 h-6 text-indigo-500" />
                        Clearance Checklist
                    </h1>
                    <p className="text-slate-500 text-sm">Track asset returns and clearance tasks across departments.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:text-indigo-600 transition-colors flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter by Dept
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">12</div>
                        <div className="text-sm text-slate-500">Pending Clearances</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">45</div>
                        <div className="text-sm text-slate-500">Completed this Month</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">3</div>
                        <div className="text-sm text-slate-500">Overdue Items</div>
                    </div>
                </div>
            </div>

            {/* Task List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="font-bold flex items-center gap-2">
                        Active Tasks
                    </h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {clearanceItems.map(task => (
                        <div key={task.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-500`}>
                                    {getDeptIcon(task.dept)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{task.item}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                        <span className="font-medium text-indigo-600 dark:text-indigo-400">{task.employee}</span>
                                        <span>•</span>
                                        <span>Due: {task.dueDate}</span>
                                        <span>•</span>
                                        <span className="uppercase tracking-wide font-bold">{task.dept}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${getStatusColor(task.status)}`}>
                                        {task.status}
                                    </span>

                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {task.status === 'Pending' && (
                                            <button className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors">
                                                Mark Done
                                            </button>
                                        )}
                                        <button className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
