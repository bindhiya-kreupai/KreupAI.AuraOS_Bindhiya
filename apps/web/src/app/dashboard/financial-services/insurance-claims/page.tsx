"use client";

import React, { useState } from 'react';
import {
    ShieldCheck,
    FileText,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

export default function InsuranceClaimsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-indigo-500" />
                        Insurance Claims
                    </h1>
                    <p className="text-slate-500 text-sm">Process and track insurance claims efficiently.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-4">Active Claims</h3>
                    <div className="space-y-4">
                        {[
                            { id: 'CLM-0012', policy: 'Auto-Basic', holder: 'John Doe', amount: '$4,500', status: 'Under Review', risk: 'Low' },
                            { id: 'CLM-0015', policy: 'Home-Prem', holder: 'Sarah Smith', amount: '$22,000', status: 'Investigation', risk: 'High' },
                            { id: 'CLM-0018', policy: 'Health-Std', holder: 'Mike Jones', amount: '$1,200', status: 'Approved', risk: 'Low' },
                        ].map((claim, i) => (
                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                        <FileText className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">{claim.holder}</div>
                                        <div className="text-sm text-slate-500">Policy: {claim.policy} • ID: {claim.id}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-right">
                                    <div>
                                        <div className="font-bold text-lg">{claim.amount}</div>
                                        <div className={`text-xs font-bold ${claim.risk === 'High' ? 'text-rose-500' : 'text-emerald-500'
                                            }`}>{claim.risk} Risk</div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${claim.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
                                            claim.status === 'Investigation' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                                        }`}>{claim.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-6">Processing Metrics</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-500">Avg Processing Time</span>
                                <span className="font-bold">4.2 Days</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: '65%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-500">Approval Rate</span>
                                <span className="font-bold">88%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: '88%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-500">Fraud Detection</span>
                                <span className="font-bold">2.1% Flagged</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div className="h-full bg-rose-500" style={{ width: '12%' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
                        <div className="text-sm text-indigo-800 dark:text-indigo-200">
                            <strong>AI Insight:</strong> Claims from Region B have spiked by 15% this week due to severe weather events.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
