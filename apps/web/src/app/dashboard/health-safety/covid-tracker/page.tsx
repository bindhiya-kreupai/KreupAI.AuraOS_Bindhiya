"use client";

import React, { useState } from 'react';
import {
    Activity,
    Thermometer,
    Syringe,
    FileCheck,
    AlertCircle
} from 'lucide-react';

export default function COVIDTrackerPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="w-6 h-6 text-indigo-500" />
                        COVID-19 Tracker
                    </h1>
                    <p className="text-slate-500 text-sm">Status reporting and vaccination records.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Status */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Daily Health Check</h3>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-4 text-center">
                        <Thermometer className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                        <h4 className="font-bold">Not Submitted Today</h4>
                        <p className="text-xs text-slate-500 mb-4">Please report your temperature and symptoms.</p>
                        <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors">
                            Submit Report
                        </button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">Yesterday</span>
                            <span className="font-bold text-emerald-600">Healthy (36.6°C)</span>
                        </div>
                        <div className="flex justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">Dec 04</span>
                            <span className="font-bold text-emerald-600">Healthy (36.5°C)</span>
                        </div>
                    </div>
                </div>

                {/* Vaccination */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Syringe className="w-5 h-5 text-emerald-500" /> Vaccination Record
                        </h3>
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <FileCheck className="w-3 h-3" /> VERIFIED
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { dose: '1st Dose', date: 'Jan 15, 2021', vaccine: 'Pfizer-BioNTech', batch: 'ER8901' },
                            { dose: '2nd Dose', date: 'Feb 15, 2021', vaccine: 'Pfizer-BioNTech', batch: 'EW3321' },
                            { dose: 'Booster', date: 'Oct 10, 2021', vaccine: 'Pfizer-BioNTech', batch: 'FC1244' },
                        ].map((vax, i) => (
                            <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 relative overflow-hidden">
                                <span className="absolute top-0 right-0 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold px-2 py-1 rounded-bl-xl text-slate-500">{vax.dose}</span>
                                <div className="font-bold text-lg mb-1">{vax.vaccine}</div>
                                <div className="text-xs text-slate-500">Date: {vax.date}</div>
                                <div className="text-xs text-slate-500">Batch: {vax.batch}</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex gap-3 text-sm text-amber-800 dark:text-amber-200 border border-amber-100 dark:border-amber-800/50">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>New booster shots are available for eligible employees. Check the 'Health Checkups' page to schedule an appointment.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
