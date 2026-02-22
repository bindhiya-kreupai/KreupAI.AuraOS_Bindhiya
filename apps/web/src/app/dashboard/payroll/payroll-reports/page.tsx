"use client";

import React, { useState, useEffect } from 'react';
import {
    BarChart,
    FileText,
    Download,
    Table,
    PieChart,
    Loader2,
    TrendingUp,
    Users,
    DollarSign
} from 'lucide-react';
import { PayrollAnalyticsService } from '../services';
import type { PayrollStats } from '../types';

export default function PayrollReportsPage() {
    const [stats, setStats] = useState<PayrollStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await PayrollAnalyticsService.getStats();
            setStats(result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const reports = [
        { name: 'Salary Register', desc: 'Detailed monthly salary breakdown per employee.', icon: Table },
        { name: 'Tax Liability Report', desc: 'Summary of TDS deducted and liable payments.', icon: FileText },
        { name: 'Variance Report', desc: 'Month-on-month comparison of payroll costs.', icon: BarChart },
        { name: 'Cost Center Distribution', desc: 'Payroll cost allocation by department/project.', icon: PieChart },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-slate-500 font-medium">Loading reports...</p>
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
                        <BarChart className="w-6 h-6 text-indigo-500" />
                        Payroll Reports
                    </h1>
                    <p className="text-slate-500 text-sm">Comprehensive reports for finance and auditing.</p>
                </div>
            </div>

            {/* Stats Summary */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Employees</div>
                                <div className="text-xl font-bold">{stats.totalEmployees}</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Monthly Cost</div>
                                <div className="text-xl font-bold">${stats.monthlyPayrollCost.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Avg Salary</div>
                                <div className="text-xl font-bold">${stats.averageSalary.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-lg">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Pending Returns</div>
                                <div className="text-xl font-bold">{stats.pendingStatutoryReturns}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reports.map((report, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition-all cursor-pointer group">
                        <div className="flex items-start gap-3">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                                <report.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-lg mb-1">{report.name}</h4>
                                <p className="text-sm text-slate-500 mb-4">{report.desc}</p>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200 transition-colors flex items-center gap-2">
                                        <Download className="w-3 h-3" /> PDF
                                    </button>
                                    <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200 transition-colors flex items-center gap-2">
                                        <Download className="w-3 h-3" /> Excel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

