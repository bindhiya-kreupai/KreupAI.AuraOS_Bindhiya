"use client";

import React, { useState, useEffect } from 'react';
import {
    PiggyBank,
    Calendar,
    Download,
    FileText,
    AlertCircle,
    CheckCircle2,
    DollarSign,
    MoreVertical,
    Loader2
} from 'lucide-react';
import { StatutoryReportService } from '../services';
import type { StatutoryReport } from '../types';

const REPORT_TYPE_LABELS: Record<string, string> = {
    pf_ecr: 'Provident Fund (PF)',
    esi_return: 'Employee State Insurance (ESI)',
    professional_tax: 'Professional Tax (PT)',
    tds_return: 'TDS (Income Tax)',
    form_16: 'Form 16',
};

export default function StatutoryDeductionsPage() {
    const [reports, setReports] = useState<StatutoryReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await StatutoryReportService.getReports();
            setReports(result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalLiability = reports.reduce((sum, r) => sum + r.totalAmount, 0);
    const overdueAmount = reports.filter(r => r.status === 'overdue').reduce((sum, r) => sum + r.totalAmount, 0);
    const filedCount = reports.filter(r => r.status === 'filed').length;
    const complianceScore = reports.length > 0 ? Math.round((filedCount / reports.length) * 100) : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-slate-500 font-medium">Loading statutory deductions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <PiggyBank className="w-6 h-6 text-indigo-500" />
                        Statutory Deductions
                    </h1>
                    <p className="text-slate-500 text-sm">Track and manage statutory compliance payments (PF, ESI, TDS).</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                        <Download className="w-4 h-4" /> Reports
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                        Record Payment
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase">Total Liability</div>
                        <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">${totalLiability.toLocaleString()}</div>
                        <div className="text-xs text-slate-400 mt-1">For current period</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase">Overdue Amount</div>
                        <div className="text-2xl font-bold mt-1 text-rose-600">{overdueAmount > 0 ? `$${overdueAmount.toLocaleString()}` : '$0'}</div>
                        <div className="text-xs text-rose-400 mt-1 font-bold">{overdueAmount > 0 ? 'Action Required' : 'All Clear'}</div>
                    </div>
                    <div className={`p-3 rounded-xl ${overdueAmount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {overdueAmount > 0 ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase">Compliance Score</div>
                        <div className="text-2xl font-bold mt-1 text-emerald-600">{complianceScore}%</div>
                        <div className="text-xs text-slate-400 mt-1">{filedCount} of {reports.length} filed</div>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-sm">Deduction Tracker</h3>
                </div>
                {reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <PiggyBank className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                        <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No Statutory Reports</h3>
                        <p className="text-sm text-slate-500 mt-1">No statutory deduction records found for the current period.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Statutory Head</th>
                                    <th className="px-6 py-3">Due Date</th>
                                    <th className="px-6 py-3">Employees</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {reports.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold">{REPORT_TYPE_LABELS[row.reportType] || row.reportType}</div>
                                            <div className="text-xs text-slate-500">{row.month} {row.year}</div>
                                        </td>
                                        <td className="px-6 py-4 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {row.dueDate}
                                        </td>
                                        <td className="px-6 py-4">{row.totalEmployees}</td>
                                        <td className="px-6 py-4 font-mono font-bold">${row.totalAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${row.status === 'filed' ? 'bg-emerald-100 text-emerald-600' :
                                                    row.status === 'overdue' ? 'bg-rose-100 text-rose-600' :
                                                        'bg-amber-100 text-amber-600'
                                                }`}>{row.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
