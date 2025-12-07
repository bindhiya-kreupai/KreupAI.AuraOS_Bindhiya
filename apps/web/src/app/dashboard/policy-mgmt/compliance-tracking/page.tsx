"use client";

import React from 'react';
import {
    ShieldCheck,
    PieChart
} from 'lucide-react';

export default function ComplianceTrackingPage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-indigo-500" />
                        Compliance Tracking
                    </h1>
                    <p className="text-slate-500 text-sm">Regulatory compliance and risk adherence dashboard.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center min-h-[300px]">
                    <div className="text-center">
                        <PieChart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="font-bold text-slate-500">Overall Adherence</h3>
                        <p className="text-sm text-slate-400 mt-2">Chart component visualization goes here.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {[
                        { area: 'GDPR Compliance', score: '98%', status: 'Excellent', color: 'bg-emerald-500' },
                        { area: 'ISO 27001 InfoSec', score: '92%', status: 'Good', color: 'bg-teal-500' },
                        { area: 'Anti-Harassment', score: '100%', status: 'Perfect', color: 'bg-indigo-500' },
                        { area: 'Code of Ethics', score: '88%', status: 'Needs Attention', color: 'bg-amber-500' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <div className="font-bold text-sm mb-1">{item.area}</div>
                                    <div className="text-xs text-slate-500 font-bold">{item.status}</div>
                                </div>
                                <div className="text-2xl font-bold font-mono">{item.score}</div>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${item.color}`} style={{ width: item.score }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
