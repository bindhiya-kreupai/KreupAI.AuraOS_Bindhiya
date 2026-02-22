"use client";

import React from 'react';
import {
    Calculator,
    Globe,
    FileText,
    TrendingUp,
    Briefcase
} from 'lucide-react';

export default function ExpatTaxPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-indigo-500" />
                        Expat Tax Manager
                    </h1>
                    <p className="text-slate-500 text-sm">Tax equalization, hypo-tax calculations, and compliance.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full min-h-0">
                {/* Tax Equalization Calculator */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-indigo-500" /> Hypothetical Tax Calc
                    </h3>

                    <div className="space-y-4 flex-1">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Home Country</label>
                                <select className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-bold">
                                    <option>United States</option>
                                    <option>United Kingdom</option>
                                    <option>Germany</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Host Country</label>
                                <select className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-bold">
                                    <option>United Arab Emirates</option>
                                    <option>Singapore</option>
                                    <option>Japan</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Gross Salary (Home Currency)</label>
                            <input type="text" defaultValue="$120,000" className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold" />
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Hypothetical Tax (Stay-at-Home)</span>
                                <span className="font-bold text-rose-500">-$28,400</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Host Country Tax (Actual)</span>
                                <span className="font-bold text-emerald-500">$0 (UAE)</span>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-bold">
                                <span>Net Benefit</span>
                                <span className="text-indigo-600">+$28,400</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compliance Tracker */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-500" /> Filing Status
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-4">
                        {[
                            { name: 'Sarah Jenkins', filing: 'US 1040', status: 'Pending', due: 'Apr 15' },
                            { name: 'Raj Patel', filing: 'UK Self Assessment', status: 'Filed', due: 'Jan 31' },
                            { name: 'Elena Rossi', filing: 'German Einkommensteuer', status: 'In Review', due: 'Jul 31' },
                        ].map((f, i) => (
                            <div key={i} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                                <div>
                                    <div className="font-bold text-slate-800 dark:text-slate-200">{f.name}</div>
                                    <div className="text-xs text-slate-500 font-mono mt-0.5">{f.filing}</div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${f.status === 'Filed' ? 'bg-emerald-100 text-emerald-600' :
                                            f.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                                                'bg-indigo-100 text-indigo-600'}
                                    `}>
                                        {f.status}
                                    </span>
                                    <div className="text-[10px] text-slate-400 mt-1">Due {f.due}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800">
                        Generate Tax Reports
                    </button>
                </div>
            </div>
        </div>
    );
}

