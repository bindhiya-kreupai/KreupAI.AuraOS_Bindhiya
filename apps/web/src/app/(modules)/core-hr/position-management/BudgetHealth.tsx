'use client';

import React from 'react';
import { DollarSign, AlertCircle, CheckCircle2, TrendingDown } from 'lucide-react';
import { cn } from '@aura/ui/src/lib/utils';

export function BudgetHealth() {
    const data = {
        totalBudget: 4500000,
        actualCost: 3850000,
        committedCost: 420000,
        remaining: 230000,
        utilization: 94.8
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 3 }).format(val);

    return (
        <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-ink-black dark:text-pearl">Headcount Budget Health</h3>
                    <p className="text-xs text-silver-mist">Fiscal Year 2026 • Global Consolidated</p>
                </div>
                <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5",
                    data.utilization > 95 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                )}>
                    {data.utilization > 95 ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    {data.utilization}% Utilized
                </div>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-silver-mist uppercase tracking-widest mb-1">Total Budget</p>
                        <p className="text-xl font-extrabold text-ink-black dark:text-pearl">{formatCurrency(data.totalBudget)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-silver-mist uppercase tracking-widest mb-1">Actual + Committed</p>
                        <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">{formatCurrency(data.actualCost + data.committedCost)}</p>
                    </div>
                </div>

                <div className="relative h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="absolute h-full bg-indigo-600 rounded-full transition-all duration-1000"
                        style={{ width: `${(data.actualCost / data.totalBudget) * 100}%` }}
                    />
                    <div
                        className="absolute h-full bg-indigo-400 opacity-50 rounded-full transition-all duration-1000"
                        style={{
                            width: `${(data.committedCost / data.totalBudget) * 100}%`,
                            left: `${(data.actualCost / data.totalBudget) * 100}%`
                        }}
                    />
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                        <span className="text-silver-mist">Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
                        <span className="text-silver-mist">Committed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                        <span className="text-silver-mist">Remaining</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-cloud dark:border-nebula-purple/20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                        <TrendingDown className="w-4 h-4" /> 2.4% over projections
                    </div>
                    <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Reallocate Budget</button>
                </div>
            </div>
        </div>
    );
}
