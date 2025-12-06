"use client";

import React, { useState } from 'react';
import {
    Landmark,
    TrendingUp,
    Users,
    FileText
} from 'lucide-react';

export default function CivilServiceGradesPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Landmark className="w-6 h-6 text-indigo-500" />
                        Civil Service Grades
                    </h1>
                    <p className="text-slate-500 text-sm">Manage pay scales and grade progression.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Grade Structure (FY 2024-25)</h3>
                    <div className="space-y-3">
                        {[
                            { grade: 'GS-15', level: 'Senior Executive', range: '$123,000 - $152,000', headcount: 12 },
                            { grade: 'GS-14', level: 'Executive', range: '$105,000 - $136,000', headcount: 45 },
                            { grade: 'GS-13', level: 'Senior Manager', range: '$89,000 - $115,000', headcount: 82 },
                            { grade: 'GS-12', level: 'Manager', range: '$74,000 - $96,000', headcount: 156 },
                            { grade: 'GS-11', level: 'Specialist', range: '$62,000 - $80,000', headcount: 210 },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-indigo-600">{item.grade}</span>
                                        <span className="text-slate-400">•</span>
                                        <span className="font-medium text-slate-900 dark:text-slate-100">{item.level}</span>
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">{item.range}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-slate-700 dark:text-slate-300">{item.headcount}</div>
                                    <div className="text-xs text-slate-400 uppercase">Staff</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-bold text-indigo-900 dark:text-indigo-300">Annual Increase</h3>
                        </div>
                        <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-1">3.2%</div>
                        <p className="text-sm text-indigo-600/80 dark:text-indigo-400/70 mb-4">Projected alignment for next fiscal year based on inflation index.</p>
                        <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">View Proposal</button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Policy Documents</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm">Pay Act 2024.pdf</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm">Grade Classification.pdf</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
