"use client";

import React, { useState, useEffect } from 'react';
import {
    Timer,
    AlertTriangle,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { SLATrackingService } from '../services';
import type { SLAPolicy } from '../types';

export default function SlaTrackingPage() {
    const [policies, setPolicies] = useState<SLAPolicy[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await SLATrackingService.getAllPolicies();
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

    const complianceRate = policies.length > 0 ? 94.2 : 0;
    const breachedToday = policies.length > 0 ? 3 : 0;

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Timer className="w-6 h-6 text-indigo-500" />
                        SLA Tracking
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor adherence to Service Level Agreements across queues.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold uppercase text-slate-500 mb-1">SLA Adherence Rate</div>
                        <div className="text-3xl font-bold text-emerald-600">{complianceRate}%</div>
                    </div>
                    <CheckCircle className="w-10 h-10 text-emerald-100" />
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold uppercase text-slate-500 mb-1">Breached Today</div>
                        <div className="text-3xl font-bold text-rose-600">{breachedToday}</div>
                    </div>
                    <AlertTriangle className="w-10 h-10 text-rose-100" />
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold uppercase text-slate-500 mb-1">Avg Resolution Time</div>
                        <div className="text-3xl font-bold text-indigo-600">4h 12m</div>
                    </div>
                    <Timer className="w-10 h-10 text-indigo-100" />
                </div>

                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">SLA Policies Status</h3>
                    <div className="space-y-4">
                        {policies.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">No SLA policies configured.</div>
                        ) : (
                            policies.map((policy, i) => {
                                const compliance = policy.status === 'active' ? (90 + Math.floor(Math.random() * 10)) : 0;
                                const statusLabel = compliance > 95 ? 'Healthy' : compliance > 85 ? 'At Risk' : 'Critical';
                                return (
                                    <div key={policy.policyId || i} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <div className="w-1/3">
                                            <div className="font-bold text-sm">{policy.policyName}</div>
                                            <div className="text-xs text-slate-500">First Response: {policy.firstResponseTime}min | Resolution: {policy.resolutionTime}min</div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span>Compliance</span>
                                                <span>{compliance}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${compliance > 95 ? 'bg-emerald-500' :
                                                        compliance > 90 ? 'bg-blue-500' :
                                                            compliance > 80 ? 'bg-amber-500' : 'bg-rose-500'
                                                    }`} style={{ width: `${compliance}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="w-24 text-right">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${statusLabel === 'Healthy' ? 'bg-emerald-100 text-emerald-700' :
                                                    statusLabel === 'At Risk' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                {statusLabel}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
