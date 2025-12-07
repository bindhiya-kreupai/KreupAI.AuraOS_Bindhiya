"use client";

import React from 'react';
import {
    BarChart,
    FileText,
    Download,
    Table,
    PieChart
} from 'lucide-react';

export default function PayrollReportsPage() {
    const reports = [
        { name: 'Salary Register', desc: 'Detailed monthly salary breakdown per employee.', icon: Table },
        { name: 'Tax Liability Report', desc: 'Summary of TDS deducted and liable payments.', icon: FileText },
        { name: 'Variance Report', desc: 'Month-on-month comparison of payroll costs.', icon: BarChart },
        { name: 'Cost Center Distribution', desc: 'Payroll cost allocation by department/project.', icon: PieChart },
    ];

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart className="w-6 h-6 text-indigo-500" />
                        Payroll Reports
                    </h1>
                    <p className="text-slate-500 text-sm">Comprehensive reports for finance and auditing.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.map((report, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition-all cursor-pointer group">
                        <div className="flex items-start gap-4">
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
