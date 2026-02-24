"use client";

import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    ShieldCheck,
    Users,
    Clock,
    Loader2
} from 'lucide-react';
import { LeavePolicyService } from '../services';
import type { LeavePolicy } from '../types';

export default function LeavePolicyPage() {
    const [policies, setPolicies] = useState<LeavePolicy[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const result = await LeavePolicyService.getPolicies();
            setPolicies(result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-indigo-500" />
                        Leave Policy
                    </h1>
                    <p className="text-slate-500 text-sm">Define accrual rules and policy assignments.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {loading ? (
                    <div className="col-span-2 text-center py-8 text-slate-500 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading leave policies...
                    </div>
                ) : policies.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-slate-500">
                        No leave policies configured yet.
                    </div>
                ) : policies.map((pol, i) => (
                    <div key={pol.id || i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{pol.name}</h3>
                            <button className="text-sm font-bold text-slate-500 hover:underline">Edit</button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <span className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                    <Users className="w-4 h-4" /> Assigned Group
                                </span>
                                <span className="font-bold text-sm">{pol.description || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <span className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                    <Clock className="w-4 h-4" /> Weekend Counting
                                </span>
                                <span className="font-bold text-sm capitalize">
                                    {pol.weekendCounting || 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <span className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                    <ShieldCheck className="w-4 h-4" /> Approval
                                </span>
                                <span className="font-bold text-sm">
                                    {pol.managerApprovalRequired ? 'Manager Required' : pol.hrApprovalRequired ? 'HR Required' : 'Auto-approve'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

