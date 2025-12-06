"use client";

import React, { useState } from 'react';
import {
    PieChart,
    Building2,
    DollarSign
} from 'lucide-react';

export default function DepartmentAllocationPage() {
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { name: 'Engineering', budget: '$12.5M', headcount: 450, color: 'bg-indigo-500', used: 85 },
                    { name: 'Sales', budget: '$8.2M', headcount: 210, color: 'bg-emerald-500', used: 92 },
                    { name: 'Marketing', budget: '$4.1M', headcount: 85, color: 'bg-rose-500', used: 60 },
                    { name: 'HR', budget: '$2.5M', headcount: 45, color: 'bg-amber-500', used: 75 },
                    { name: 'Finance', budget: '$3.0M', headcount: 50, color: 'bg-cyan-500', used: 80 },
                    { name: 'Operations', budget: '$5.5M', headcount: 120, color: 'bg-purple-500', used: 88 },
                ].map((dept, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl ${dept.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center`}>
                                    <Building2 className={`w-5 h-5 ${dept.color.replace('bg-', 'text-')}`} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{dept.name}</h3>
                                    <div className="text-xs text-slate-500">{dept.headcount} Employees</div>
                                </div>
                            </div>
                            <div className="font-bold text-lg">{dept.budget}</div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-500">
                                <span>Budget Utilization</span>
                                <span>{dept.used}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${dept.color}`} style={{ width: `${dept.used}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
