"use client";

import React from 'react';
import {
    DollarSign,
    Calculator,
    PieChart,
    Plus,
    Edit2,
    CheckCircle2
} from 'lucide-react';

export default function SalaryStructurePage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-indigo-500" />
                        Salary Structure Configuration
                    </h1>
                    <p className="text-slate-500 text-sm">Define components, formulas, and deduction rules.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                    <Plus className="w-4 h-4" /> Add Component
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Components List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Earnings</h3>
                        <div className="space-y-3">
                            {[
                                { name: 'Basic Salary', type: 'Fixed', calc: '40% of CTC', tax: 'Taxable', active: true },
                                { name: 'HRA', type: 'Formula', calc: '50% of Basic', tax: 'Exempt (Partial)', active: true },
                                { name: 'Special Allowance', type: 'Balancing', calc: 'Residual of CTC', tax: 'Taxable', active: true },
                                { name: 'LTA', type: 'Fixed', calc: 'Fixed Amount', tax: 'Exempt', active: true },
                                { name: 'Medical', type: 'Fixed', calc: '$1,200', tax: 'Exempt', active: false },
                            ].map((comp, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${comp.active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                                            <DollarSign className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 dark:text-slate-200">{comp.name}</div>
                                            <div className="text-xs text-slate-500 mt-1 flex gap-2">
                                                <span className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{comp.type}</span>
                                                <span>{comp.calc}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${comp.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {comp.tax}
                                        </span>
                                        <button className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3 className="font-bold text-lg mb-4 mt-8">Deductions</h3>
                        <div className="space-y-3">
                            {[
                                { name: 'Provident Fund', type: 'Statutory', calc: '12% of Basic', active: true },
                                { name: 'Professional Tax', type: 'Statutory', calc: 'State Rule', active: true },
                            ].map((comp, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                                            <MinusIcon />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 dark:text-slate-200">{comp.name}</div>
                                            <div className="text-xs text-slate-500 mt-1 flex gap-2">
                                                <span className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{comp.type}</span>
                                                <span>{comp.calc}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-bold px-2 py-1 rounded bg-rose-50 text-rose-700">Mandatory</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Preview */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 rounded-2xl shadow-lg">
                        <h3 className="font-bold mb-6">Structure Preview</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center opacity-80">
                                <span>Total CTC</span>
                                <span className="font-bold text-lg">$100,000</span>
                            </div>
                            <div className="h-px bg-white/20"></div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Fixed Pay</span>
                                    <span>$85,000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Variable Pay</span>
                                    <span>$10,000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Benefits</span>
                                    <span>$5,000</span>
                                </div>
                            </div>
                            <div className="h-px bg-white/20 mt-4"></div>
                            <div className="pt-2 text-indigo-100 text-xs">
                                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                                Compliant with 2024 Tax Regime
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MinusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
    )
}
