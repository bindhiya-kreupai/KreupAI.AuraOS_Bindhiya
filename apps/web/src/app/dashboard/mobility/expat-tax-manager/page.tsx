"use client";

import React, { useState } from 'react';
import {
    Calculator,
    PieChart,
    FileText,
    Globe
} from 'lucide-react';

export default function ExpatTaxManagerPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-indigo-500" />
                        Expat Tax Manager
                    </h1>
                    <p className="text-slate-500 text-sm">Handle tax equalization and compliance for assignees.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calculator Widget */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-indigo-500" />
                        Tax Equalization Estimator
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">Home Country</label>
                                <select className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
                                    <option>United States</option>
                                    <option>United Kingdom</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">Host Country</label>
                                <select className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
                                    <option>France</option>
                                    <option>Singapore</option>
                                    <option>UAE</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">Annual Base Salary</label>
                            <input type="text" className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm" placeholder="$100,000" />
                        </div>
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-slate-500">Estimated Tax Liability (Hypo)</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">$24,500</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-slate-500">Host Country Tax</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">$18,200</span>
                            </div>
                            <div className="flex justify-between p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg text-emerald-700 dark:text-emerald-400 font-bold">
                                <span>Company Cost Differential</span>
                                <span>-$6,300</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compliance Status */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">Compliance Deadlines</h3>
                        <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded">Tax Year 2024</span>
                    </div>
                    <div className="space-y-4">
                        {[
                            { item: 'US Tax Returns (Expats)', due: 'Jun 15', status: 'Pending', color: 'border-l-amber-500' },
                            { item: 'FBAR Filing', due: 'Apr 15', status: 'Completed', color: 'border-l-emerald-500' },
                            { item: 'UK Self Assessment', due: 'Jan 31', status: 'Attention', color: 'border-l-rose-500' },
                        ].map((task, i) => (
                            <div key={i} className={`p-4 bg-slate-50 dark:bg-slate-800/50 rounded-r-xl border-l-4 ${task.color} flex justify-between items-center`}>
                                <div>
                                    <div className="font-bold text-sm">{task.item}</div>
                                    <div className="text-xs text-slate-500">Due: {task.due}</div>
                                </div>
                                <span className="text-xs font-bold uppercase opacity-70">{task.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
