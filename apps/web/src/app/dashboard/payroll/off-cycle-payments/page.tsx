"use client";

import React, { useState, useEffect } from 'react';
import {
    Zap,
    Calendar,
    ArrowRight,
    Play
} from 'lucide-react';
import { PayrollRunService } from '../services';

export default function OffCyclePaymentsPage() {
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
        } catch (error) {
            console.error('Error fetching payroll runs:', error);
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
                        <Zap className="w-6 h-6 text-amber-500" />
                        Off-cycle Payments
                    </h1>
                    <p className="text-slate-500 text-sm">Process ad-hoc payments outside the regular payroll schedule.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                    <Play className="w-4 h-4" /> Start New Run
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-lg mb-4">Run History</h3>
                <div className="space-y-4">
                    {[
                        { title: 'Correction Run - Nov', date: 'Nov 05, 2025', count: 2, total: '$1,200', status: 'Completed' },
                        { title: 'Immediate Termination', date: 'Oct 22, 2025', count: 1, total: '$4,500', status: 'Completed' },
                    ].map((run, i) => (
                        <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-lg group-hover:bg-white transition-colors">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold">{run.title}</h4>
                                    <div className="text-xs text-slate-500 flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> {run.date} • {run.count} Payees
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 mt-4 md:mt-0">
                                <div className="font-mono font-bold text-lg">{run.total}</div>
                                <div className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold">
                                    {run.status}
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
