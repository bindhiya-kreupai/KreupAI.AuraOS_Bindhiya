"use client";

import React, { useState, useEffect } from 'react';
import { CalibrationService } from '../core/services';
import {
    Scale,
    BarChart2,
    Users,
    Settings,
    ChevronRight,
    AlertTriangle,
    Save
} from 'lucide-react';

export default function CalibrationCyclesPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Scale className="w-6 h-6 text-indigo-500" />
                        Performance Calibration
                    </h1>
                    <p className="text-slate-500 text-sm">Normalize ratings across departments and enforce bell curves.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Save className="w-4 h-4" /> Finalize Cycle
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Bell Curve Config */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-indigo-500" /> Rating Distribution
                    </h3>

                    <div className="flex-1 flex items-end justify-between px-10 gap-2 pb-10 border-b border-slate-100 dark:border-slate-800">
                        {[
                            { label: 'Unsatisfactory', target: 5, current: 4, h: 'h-10' },
                            { label: 'Needs Imp.', target: 10, current: 12, h: 'h-24' },
                            { label: 'Meets Exp.', target: 60, current: 55, h: 'h-64' },
                            { label: 'Exceeds', target: 20, current: 22, h: 'h-40' },
                            { label: 'Outstanding', target: 5, current: 7, h: 'h-16' },
                        ].map((bucket, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 w-full group">
                                <div className="text-xs font-bold text-slate-500 mb-1">{bucket.current}%</div>
                                <div className={`w-full max-w-[80px] ${bucket.h} bg-indigo-100 dark:bg-indigo-900/30 rounded-t-xl relative overflow-hidden`}>
                                    <div className="absolute bottom-0 w-full bg-indigo-500 transition-all hover:bg-indigo-600 cursor-pointer" style={{ height: `${(bucket.current / bucket.target) * 100}%`, maxHeight: '100%' }}></div>
                                </div>
                                <div className={`w-full h-1 rounded-full mt-2 ${Math.abs(bucket.current - bucket.target) > 2 ? &apos;bg-rose-500' : 'bg-emerald-500'}`}></div>
                                <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">{bucket.label}</div>
                                <div className="text-[10px] text-slate-400">Target: {bucket.target}%</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-amber-900 dark:text-amber-500 text-sm">Distribution Alert</h4>
                            <p className="text-xs text-amber-800 dark:text-amber-400 mt-1">
                                "Outstanding" category is currently over-allocated by 2%. Please review top performers in Engineering department.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Department List */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" /> Departments
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-2">
                        {[
                            { name: 'Engineering', status: 'Pending', deviation: '+5%' },
                            { name: 'Sales', status: 'Calibrated', deviation: '0%' },
                            { name: 'Product', status: 'In Progress', deviation: '-2%' },
                            { name: 'Marketing', status: 'Calibrated', deviation: '0%' },
                            { name: 'HR', status: 'Pending', deviation: '+1%' },
                        ].map(dept => (
                            <div key={dept.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                                <div>
                                    <div className="font-bold text-sm">{dept.name}</div>
                                    <div className="text-xs text-slate-500">{dept.status}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-bold text-sm ${dept.deviation === '0%' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {dept.deviation}
                                    </div>
                                    <div className="text-[10px] text-slate-400">Deviation</div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
