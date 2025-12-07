"use client";

import React, { useState } from 'react';
import {
    Scale,
    ShieldCheck,
    AlertOctagon,
    BookOpen
} from 'lucide-react';

export default function LaborLawCompliancePage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Scale className="w-6 h-6 text-indigo-500" />
                        Labor Law Compliance
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor adherence to labor laws and regulations.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Compliance Status</h3>
                        <div className="space-y-4">
                            {[
                                { law: 'Fair Labor Standards Act (FLSA)', status: 'Compliant', date: 'Last Audit: Nov 01' },
                                { law: 'OSHA Regulations', status: 'Action Required', date: 'Inspection: Today' },
                                { law: 'Equal Employment Opportunity (EEO)', status: 'Compliant', date: 'Last Audit: Oct 15' },
                                { law: 'Family and Medical Leave Act (FMLA)', status: 'Compliant', date: 'Last Review: Sep 30' },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        {item.status === 'Compliant' ? (
                                            <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                        ) : (
                                            <AlertOctagon className="w-6 h-6 text-amber-500" />
                                        )}
                                        <div>
                                            <div className="font-bold">{item.law}</div>
                                            <div className="text-sm text-slate-500">{item.date}</div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'Compliant' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                        }`}>{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-6 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="w-6 h-6" />
                            <h3 className="font-bold text-lg">Regulatory Updates</h3>
                        </div>
                        <div className="space-y-4 text-indigo-100 text-sm">
                            <div className="p-3 bg-white/10 rounded-xl">
                                <span className="font-bold block text-white mb-1">Minimum Wage Increase</span>
                                Effective Jan 1, 2025. Prepare payroll adjustments.
                            </div>
                            <div className="p-3 bg-white/10 rounded-xl">
                                <span className="font-bold block text-white mb-1">New Safety Protocols</span>
                                OSHA guideline update for warehouse operations.
                            </div>
                        </div>
                        <button className="w-full mt-4 py-2 bg-white text-indigo-900 rounded-lg font-bold hover:bg-slate-50">View All Updates</button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Risk Assessment</h3>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-500">Legal Risk Level</span>
                            <span className="text-sm font-bold text-emerald-600">Low</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-4">
                            <div className="bg-emerald-500 h-full w-[20%] rounded-full"></div>
                        </div>
                        <p className="text-xs text-slate-400">Based on active grievances and audit results.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
