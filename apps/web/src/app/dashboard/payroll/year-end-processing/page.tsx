"use client";

import React, { useState, useEffect } from 'react';
import {
    CalendarRange,
    CheckCheck,
    AlertTriangle,
    FileBarChart,
    Printer,
    Hourglass,
    Loader2
} from 'lucide-react';
import { PayrollRunService, TaxDeclarationService } from '../services';
import type { PayrollRun, TaxDeclaration } from '../types';

export default function YearEndPage() {
    const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
    const [declarations, setDeclarations] = useState<TaxDeclaration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [runs, decls] = await Promise.all([
                PayrollRunService.getPayrollRuns(),
                TaxDeclarationService.getTaxDeclarations(),
            ]);
            setPayrollRuns(runs);
            setDeclarations(decls);
        } catch (error: any) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-slate-500 font-medium">Loading year-end data...</p>
                </div>
            </div>
        );
    }

    // Derive checklist status from actual data
    const totalRuns = payrollRuns.length;
    const disbursedRuns = payrollRuns.filter(r => r.status === 'disbursed').length;
    const taxReconciliationPct = totalRuns > 0 ? Math.round((disbursedRuns / totalRuns) * 100) : 0;

    const approvedDeclarations = declarations.filter(d => d.status === 'approved').length;
    const proofsPct = declarations.length > 0 ? Math.round((approvedDeclarations / declarations.length) * 100) : 0;

    // Exceptions from all payroll runs
    const unresolvedExceptions = payrollRuns.flatMap(r => (r.exceptions || []).filter(e => !e.resolved));

    const checklist = [
        {
            title: 'Tax Reconciliation',
            status: taxReconciliationPct === 100 ? 'Completed' : taxReconciliationPct > 0 ? 'In Progress' : 'Pending',
            progress: `${taxReconciliationPct}%`,
            desc: 'Match TDS deducted vs Tax Payable.',
        },
        {
            title: 'Investment Proofs',
            status: proofsPct === 100 ? 'Completed' : proofsPct > 0 ? 'In Progress' : 'Pending',
            progress: `${proofsPct}%`,
            desc: 'Verify all 80C/80D proofs.',
        },
        {
            title: 'Full & Final',
            status: unresolvedExceptions.length === 0 ? 'Completed' : 'Pending',
            progress: unresolvedExceptions.length === 0 ? '100%' : `${Math.max(0, 100 - unresolvedExceptions.length * 10)}%`,
            desc: 'Settle all pending exceptions.',
        },
    ];

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarRange className="w-6 h-6 text-purple-500" />
                        Year-End Processing
                    </h1>
                    <p className="text-slate-500 text-sm">Final settlement, tax reconciliation, and Form 16 generation.</p>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-xl text-sm font-bold border border-purple-100 dark:border-purple-800/30">
                    <Hourglass className="w-4 h-4" /> {unresolvedExceptions.length} Pending Items
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-full min-h-0">
                {/* Checklist */}
                <div className="lg:col-span-3 space-y-4 overflow-y-auto pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {checklist.map((c, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">{c.title}</h3>
                                <p className="text-xs text-slate-500 mb-4 h-8">{c.desc}</p>
                                <div className="flex justify-between items-end mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded
                                        ${c.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : c.status === 'In Progress' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}
                                     `}>
                                        {c.status}
                                    </span>
                                    <span className="font-bold text-lg">{c.progress}</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${c.status === 'Completed' ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: c.progress }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" /> Discrepancy Report
                        </h3>
                        {unresolvedExceptions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <CheckCheck className="w-10 h-10 text-emerald-400 mb-3" />
                                <p className="text-sm text-slate-500 font-medium">No discrepancies found. All clear for year-end closure.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                                        <th className="pb-3 pl-2">Employee</th>
                                        <th className="pb-3">Issue</th>
                                        <th className="pb-3">Severity</th>
                                        <th className="pb-3 text-right pr-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {unresolvedExceptions.slice(0, 10).map((exc) => (
                                        <tr key={exc.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="py-4 pl-2 font-bold text-slate-700 dark:text-slate-300">{exc.employeeName}</td>
                                            <td className="py-4 text-rose-500 font-bold">{exc.type.replace(/_/g, ' ')}</td>
                                            <td className="py-4 text-slate-600 dark:text-slate-400 capitalize">{exc.severity}</td>
                                            <td className="py-4 text-right pr-2">
                                                <button className="text-xs font-bold text-indigo-500 hover:underline">Resolve</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Exports */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-indigo-600 text-white rounded-2xl p-6 shadow-lg">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Printer className="w-5 h-5 text-indigo-200" /> Generate Forms
                        </h3>
                        <div className="space-y-2">
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold flex items-center gap-3 px-4 transition-colors">
                                <FileBarChart className="w-4 h-4" /> Form 16 (Part A & B)
                            </button>
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold flex items-center gap-3 px-4 transition-colors">
                                <FileBarChart className="w-4 h-4" /> Form 24Q (Returns)
                            </button>
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold flex items-center gap-3 px-4 transition-colors">
                                <FileBarChart className="w-4 h-4" /> Tax Computation Sheet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

