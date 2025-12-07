"use client";

import React from 'react';
import {
    PieChart,
    TrendingUp,
    ArrowRight
} from 'lucide-react';

export default function BudgetAllocationPage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <PieChart className="w-6 h-6 text-indigo-500" />
                        Budget Allocation
                    </h1>
                    <p className="text-slate-500 text-sm">Distribute and monitor headcount budget across departments.</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800">
                    <span className="text-xs font-bold uppercase block">Total Budget (FY 2025)</span>
                    <span className="text-lg font-black">$12,500,000</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Dept List */}
                <div className="space-y-4">
                    {[
                        { dept: 'Engineering', budget: '$5.2M', allocated: '85%', remaining: '$780k', color: 'bg-indigo-500' },
                        { dept: 'Sales & Marketing', budget: '$3.8M', allocated: '92%', remaining: '$304k', color: 'bg-emerald-500' },
                        { dept: 'Product', budget: '$1.5M', allocated: '60%', remaining: '$600k', color: 'bg-amber-500' },
                        { dept: 'G&A', budget: '$2.0M', allocated: '75%', remaining: '$500k', color: 'bg-slate-500' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition-colors group cursor-pointer">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">{item.dept}</h3>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <div className="text-xs text-slate-500 font-bold uppercase">Budget</div>
                                    <div className="font-mono font-bold">{item.budget}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 font-bold uppercase">Allocated</div>
                                    <div className="font-mono font-bold">{item.allocated}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 font-bold uppercase">Remaining</div>
                                    <div className="font-mono font-bold text-emerald-600">{item.remaining}</div>
                                </div>
                            </div>

                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${item.color}`} style={{ width: item.allocated }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chart Mock */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <div className="w-48 h-48 rounded-full border-[16px] border-slate-100 dark:border-slate-800 border-t-indigo-500 border-r-emerald-500 mb-6"></div>
                    <h3 className="font-bold text-slate-500">Budget Distribution</h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-xs">Engineering consumes 42% of the total headcount budget, followed by Sales at 30%.</p>
                </div>
            </div>
        </div>
    );
}
