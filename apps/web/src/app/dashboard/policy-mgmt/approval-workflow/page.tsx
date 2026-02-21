"use client";

import React, { useState, useEffect } from 'react';
import {
    GitPullRequest,
    CheckCircle2,
    XCircle,
    Clock,
    FileText,
    Loader2
} from 'lucide-react';
import { PolicyService } from '../services';
import type { Policy } from '../types';

export default function ApprovalWorkflowPage() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await PolicyService.getAll();
                setPolicies(data);
            } catch {
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    // Filter to policies that are in review or draft (pending approval)
    const pendingPolicies = policies.filter(p => p.status === 'in_review' || p.status === 'draft');

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GitPullRequest className="w-6 h-6 text-indigo-500" />
                        Approval Workflow
                    </h1>
                    <p className="text-slate-500 text-sm">Review pending policies and track approval history.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-slate-500 uppercase text-xs">Pending Review ({pendingPolicies.length})</h3>
                    {pendingPolicies.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400">
                            No policies pending approval.
                        </div>
                    ) : (
                        pendingPolicies.map((item, i) => (
                            <div key={item.policyId || i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 group hover:border-indigo-300 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">{item.policyName}</h3>
                                            <div className="flex gap-4 text-xs text-slate-500">
                                                <span>Author: {item.createdBy}</span>
                                                <span>Submitted: {new Date(item.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="bg-amber-100 text-amber-600 text-xs font-bold px-3 py-1 rounded-full">{item.status === 'in_review' ? 'In Review' : 'Draft'}</span>
                                </div>

                                <div className="flex items-center gap-3 pl-[3.5rem]">
                                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Approve
                                    </button>
                                    <button className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 border border-rose-200 dark:border-rose-900 rounded-lg text-sm font-bold hover:bg-rose-100 transition-colors flex items-center gap-2">
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                    <button className="px-4 py-2 text-slate-500 text-sm font-bold hover:text-indigo-600">View Details</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-slate-500 uppercase text-xs mb-4">Approval Chain</h3>
                        <div className="relative pl-4 space-y-6 border-l-2 border-slate-100 dark:border-slate-800">
                            {[
                                { role: 'Policy Owner', status: 'Completed', time: '1d ago' },
                                { role: 'Department Head', status: 'Current', time: 'Now' },
                                { role: 'Compliance Officer', status: 'Pending', time: '-' },
                                { role: 'CEO / CHRO', status: 'Pending', time: '-' },
                            ].map((step, i) => (
                                <div key={i} className="relative pl-6">
                                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${step.status === 'Completed' ? 'bg-emerald-500' :
                                            step.status === 'Current' ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'
                                        }`}></div>
                                    <div className="text-sm font-bold">{step.role}</div>
                                    <div className="text-xs text-slate-400">{step.status} • {step.time}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
