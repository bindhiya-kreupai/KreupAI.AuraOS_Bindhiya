"use client";

import React, { useState, useEffect } from 'react';
import {
    CheckCircle2,
    Clock,
    UserCheck,
    FileText,
    Loader2
} from 'lucide-react';
import { BudgetService } from '../../services';

export default function ApprovalWorkflowPage() {
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

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-indigo-500" />
                        Budget Approvals
                    </h1>
                    <p className="text-slate-500 text-sm">Review and approve department budget requests.</p>
                </div>
            </div>

            {budgets.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-slate-400">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="font-bold">No approval requests found</p>
                        <p className="text-sm">Budget approval requests will appear here.</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {budgets.map((req: any) => {
                            const status = req.approvalStatus || req.status || 'pending';
                            return (
                                <div key={req.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-3 rounded-xl ${status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                                                status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
                                            }`}>
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{req.name || req.title || 'Budget Request'}</h3>
                                            <div className="text-sm text-slate-500 flex gap-3">
                                                <span>{req.department || '-'}</span>
                                                <span>•</span>
                                                <span>Period: {req.fiscalYear || '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="font-bold text-lg">${(req.totalAmount || 0).toLocaleString()}</div>
                                            <div className={`text-xs font-bold ${status === 'approved' ? 'text-emerald-500' :
                                                    status === 'pending' ? 'text-amber-500' : 'text-indigo-500'
                                                }`}>{status}</div>
                                        </div>

                                        {status !== 'approved' && (
                                            <div className="flex gap-2">
                                                <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold text-sm hover:bg-emerald-600">Approve</button>
                                                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-200">Reject</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

