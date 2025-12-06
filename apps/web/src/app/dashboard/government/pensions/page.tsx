"use client";

import React from 'react';
import {
    PiggyBank,
    Calculator,
    TrendingUp,
    Briefcase,
    CalendarCheck,
    ScrollText
} from 'lucide-react';

export default function PensionPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ScrollText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        Civil Service Pension
                    </h1>
                    <p className="text-slate-500 text-sm">Defined Benefit plans, service history, and retirement calculators.</p>
                </div>
                <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20">
                    <Calculator className="w-4 h-4" /> Run Projection
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Pension Calculator Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 text-emerald-700 dark:text-emerald-400">Quick Estimate</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Years of Creditable Service</label>
                                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl font-bold text-lg">25 Years</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">High-3 Average Salary</label>
                                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl font-bold text-lg">$110,000</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Pension Formula</label>
                                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl font-mono text-sm text-slate-600 dark:text-slate-400">1.1% x Years x High-3</div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Estimated Annual Benefit</div>
                                <div className="text-3xl font-bold text-emerald-600">$30,250 <span className="text-sm text-slate-400 font-normal">/ yr</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/30">
                        <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2">Service Buyback</h3>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-4">
                            You may be eligible to buy back military service time to increase your pension multiplier.
                        </p>
                        <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Check Eligibility &rarr;</button>
                    </div>
                </div>

                {/* Service History & Plans */}
                <div className="lg:col-span-2 overflow-y-auto pb-20 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600"><PiggyBank className="w-8 h-8" /></div>
                            <div>
                                <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">$482k</div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Fund Balance (FERS)</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600"><Briefcase className="w-8 h-8" /></div>
                            <div>
                                <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">2032</div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Eligible Retirement</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Creditable Service History</h3>
                        <div className="space-y-4">
                            {[
                                { agency: 'Dept of Interior', dates: '2015 - Present', role: 'Park Ranger (GS-09)', years: '9 Years' },
                                { agency: 'U.S. Postal Service', dates: '2010 - 2015', role: 'Carrier', years: '5 Years' },
                                { agency: 'U.S. Army', dates: '2006 - 2010', role: 'Infantry (E-4)', years: '4 Years (Bought Back)' },
                            ].map((s, i) => (
                                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-4 mb-2 md:mb-0">
                                        <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center font-bold text-slate-400 shadow-sm border border-slate-100 dark:border-slate-600">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200">{s.agency}</h4>
                                            <div className="text-sm text-slate-500">{s.role}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-indigo-600 dark:text-indigo-400">{s.years}</div>
                                        <div className="text-xs text-slate-400">{s.dates}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
