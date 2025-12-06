"use client";

import React, { useState } from 'react';
import {
    Timer,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

export default function SlaTrackingPage() {
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
                {/* Overall Stats */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold uppercase text-slate-500 mb-1">SLA Adherence Rate</div>
                        <div className="text-3xl font-bold text-emerald-600">94.2%</div>
                    </div>
                    <CheckCircle className="w-10 h-10 text-emerald-100" />
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold uppercase text-slate-500 mb-1">Breached Today</div>
                        <div className="text-3xl font-bold text-rose-600">3</div>
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

                {/* SLA Rules & Status */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">SLA Policies Status</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'High Priority (Payroll)', time: '4 Hours', compliance: 98, status: 'Healthy' },
                            { name: 'Medium Priority (General)', time: '24 Hours', compliance: 92, status: 'Healthy' },
                            { name: 'Low Priority (Info)', time: '48 Hours', compliance: 88, status: 'At Risk' },
                            { name: 'IT Hardware Requests', time: '72 Hours', compliance: 75, status: 'Critical' },
                        ].map((sla, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="w-1/3">
                                    <div className="font-bold text-sm">{sla.name}</div>
                                    <div className="text-xs text-slate-500">Target: {sla.time}</div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span>Compliance</span>
                                        <span>{sla.compliance}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${sla.compliance > 95 ? 'bg-emerald-500' :
                                                sla.compliance > 90 ? 'bg-blue-500' :
                                                    sla.compliance > 80 ? 'bg-amber-500' : 'bg-rose-500'
                                            }`} style={{ width: `${sla.compliance}%` }}></div>
                                    </div>
                                </div>
                                <div className="w-24 text-right">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${sla.status === 'Healthy' ? 'bg-emerald-100 text-emerald-700' :
                                            sla.status === 'At Risk' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                        }`}>
                                        {sla.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
