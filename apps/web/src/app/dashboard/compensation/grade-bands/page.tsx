"use client";

import React, { useState, useEffect } from 'react';
import {
    Layers,
    TrendingUp,
    Users,
    ArrowRight,
    Edit2,
    BarChart3
} from 'lucide-react';
import { GradeService } from '../services';

export default function SalaryBandsPage() {
    const [grades, setGrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await GradeService.getGrades();
            setGrades(data);
        } catch (error) {
            console.error('Error fetching grades:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Layers className="w-6 h-6 text-indigo-500" />
                        Salary Bands & Grades
                    </h1>
                    <p className="text-slate-500 text-sm">Define pay ranges, designations, and market positioning for each job grade.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    + Add New Grade
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
                {/* Grade List */}
                <div className="lg:col-span-1 space-y-4 overflow-y-auto pb-20">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                        <h3 className="font-bold text-sm mb-4">Grade Hierarchy</h3>
                        <div className="space-y-1">
                            {['Executive (E-Level)', 'Senior Mgmt (M-Level)', 'Middle Mgmt (L-Level)', 'Professional (P-Level)', 'Entry (A-Level)', 'Support (S-Level)'].map((g, i) => (
                                <button key={i} className={`w-full text-left px-3 py-3 rounded-lg text-sm font-bold flex items-center justify-between ${i === 3 ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border border-indigo-100 dark:border-indigo-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}>
                                    {g}
                                    <ArrowRight className={`w-4 h-4 ${i === 3 ? 'opacity-100' : 'opacity-0'}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Selected Grade</div>
                            <div className="text-xl font-bold text-indigo-600">Professional (P-Level)</div>
                            <div className="text-xs text-slate-400 mt-1">Software Engineer, Analyst, Consultant</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Pay Range (Annual)</div>
                            <div className="text-xl font-bold text-slate-800 dark:text-slate-200">$60k - $140k</div>
                            <div className="text-xs text-slate-400 mt-1">Midpoint: $100k</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Headcount</div>
                            <div className="text-xl font-bold text-slate-800 dark:text-slate-200">145 Employees</div>
                            <div className="text-xs text-emerald-500 font-bold mt-1">+12 Hired this Qtr</div>
                        </div>
                    </div>

                    {/* Band Details */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-slate-400" /> Band Penetration
                            </h3>
                            <button className="text-xs font-bold text-indigo-500 flex items-center gap-1 hover:underline">
                                <Edit2 className="w-3 h-3" /> Edit Structure
                            </button>
                        </div>

                        {/* Visual Range */}
                        <div className="relative h-12 bg-slate-100 dark:bg-slate-800 rounded-xl mb-20 md:mb-12 mt-8 mx-4">
                            {/* Min/Max Labels */}
                            <div className="absolute -top-6 left-0 text-xs font-bold text-slate-500">$60,000</div>
                            <div className="absolute -top-6 right-0 text-xs font-bold text-slate-500">$140,000</div>
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-500">$100,000 (Mid)</div>

                            {/* Segments */}
                            <div className="absolute top-0 bottom-0 left-[25%] right-[25%] bg-indigo-100 dark:bg-indigo-900/30 border-x border-dashed border-indigo-300"></div>

                            {/* Marker - Avg */}
                            <div className="absolute top-0 bottom-0 left-[42%] w-1 bg-emerald-500 shadow-sm z-10 group">
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap opacity-100">
                                    Avg: $92,500
                                </div>
                            </div>
                        </div>

                        {/* Sub-bands Table */}
                        <div className="mt-8">
                            <h4 className="text-sm font-bold mb-4">Sub-Grades / Levels</h4>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                                        <th className="pb-3 pl-2">Level Code</th>
                                        <th className="pb-3">Min</th>
                                        <th className="pb-3">Midpoint</th>
                                        <th className="pb-3">Max</th>
                                        <th className="pb-3 text-right pr-2">Spread</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {[
                                        { code: 'P1 - Junior', min: '$60k', mid: '$75k', max: '$90k', spread: '50%' },
                                        { code: 'P2 - Intermediate', min: '$80k', mid: '$100k', max: '$120k', spread: '50%' },
                                        { code: 'P3 - Senior', min: '$100k', mid: '$125k', max: '$150k', spread: '50%' },
                                    ].map((row, i) => (
                                        <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="py-3 pl-2 font-bold text-slate-700 dark:text-slate-300">{row.code}</td>
                                            <td className="py-3 text-slate-600 dark:text-slate-400">{row.min}</td>
                                            <td className="py-3 font-bold text-indigo-600">{row.mid}</td>
                                            <td className="py-3 text-slate-600 dark:text-slate-400">{row.max}</td>
                                            <td className="py-3 text-right pr-2 text-slate-400 font-mono text-xs">{row.spread}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
