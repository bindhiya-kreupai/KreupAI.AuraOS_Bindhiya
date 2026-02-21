"use client";

import React, { useState, useEffect } from 'react';
import {
    PieChart,
    Building2,
    DollarSign,
    Loader2
} from 'lucide-react';
import { BudgetService } from '../../services';

export default function DepartmentAllocationPage() {
    const [budgets, setBudgets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await BudgetService.getBudgets();
                setBudgets(data);
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

    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-purple-500'];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <PieChart className="w-6 h-6 text-indigo-500" />
                        Department Allocation
                    </h1>
                    <p className="text-slate-500 text-sm">Distribute budget across organizational units.</p>
                </div>
            </div>

            {budgets.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-slate-400">
                        <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="font-bold">No department allocations found</p>
                        <p className="text-sm">Budget data will appear here once configured.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.map((dept: any, i: number) => {
                        const color = colors[i % colors.length];
                        const used = dept.totalAmount > 0 ? Math.round((dept.spentAmount / dept.totalAmount) * 100) : 0;
                        return (
                            <div key={dept.id || i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center`}>
                                            <Building2 className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{dept.name || dept.department || 'Department'}</h3>
                                            <div className="text-xs text-slate-500">{dept.headcount || 0} Employees</div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-lg">${((dept.totalAmount || 0) / 1000000).toFixed(1)}M</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-500">
                                        <span>Budget Utilization</span>
                                        <span>{used}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${color}`} style={{ width: `${used}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
