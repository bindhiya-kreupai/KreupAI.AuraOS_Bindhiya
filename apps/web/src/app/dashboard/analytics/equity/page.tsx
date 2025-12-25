"use client";

import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    Scale,
    TrendingUp,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { StandardReportService } from '../services';

export default function EquityPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const data = await StandardReportService.getAllReports();
            setReports(data);
        } catch (error) {
            console.error('Error fetching equity reports:', error);
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
                        <Scale className="w-6 h-6 text-indigo-500" />
                        Compensation Equity
                    </h1>
                    <p className="text-slate-500 text-sm">Pay gap analysis and salary band deviations.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Gender Pay Gap</div>
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-3xl font-bold">2.4%</div>
                    <div className="text-xs text-amber-600 mt-1">Unadjusted Gap</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Compa-Ratio</div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-bold">0.98</div>
                    <div className="text-xs text-slate-500 mt-1">Market Healthy Range</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Equity Outliers</div>
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-3xl font-bold">5</div>
                    <div className="text-xs text-rose-500 mt-1">Employees below min band</div>
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col min-h-0 overflow-y-auto">
                <h3 className="font-bold text-lg mb-6">Salary Band Distribution</h3>
                <div className="space-y-6">
                    {[
                        { level: 'Senior Engineer', min: 120, max: 180, avg: 145, color: 'indigo' },
                        { level: 'Product Manager', min: 110, max: 160, avg: 135, color: 'emerald' },
                        { level: 'Sales Lead', min: 90, max: 150, avg: 110, color: 'amber' },
                    ].map(band => (
                        <div key={band.level}>
                            <div className="flex justify-between mb-2">
                                <span className="font-bold text-sm">{band.level}</span>
                                <span className="text-xs font-mono text-slate-500">${band.min}k - ${band.max}k</span>
                            </div>
                            <div className="relative h-12 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                {/* Band Range Bar */}
                                <div
                                    className={`absolute top-2 bottom-2 rounded opacity-30 bg-${band.color}-500`}
                                    style={{ left: '10%', right: '20%' }} // Mock positioning
                                ></div>
                                {/* Average Marker */}
                                <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-slate-100 border-l border-dashed z-10"
                                    style={{ left: '40%' }} // Mock positioning
                                >
                                    <div className="absolute -top-6 -translate-x-1/2 text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                                        Avg: ${band.avg}k
                                    </div>
                                </div>
                                {/* Distribution Dots (Mock) */}
                                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-500 opacity-60" style={{ left: '15%' }}></div>
                                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-500 opacity-60" style={{ left: '35%' }}></div>
                                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-500 opacity-60" style={{ left: '55%' }}></div>
                                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-rose-500 border border-white shadow-sm z-20" style={{ left: '8%' }} title="Outlier"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
