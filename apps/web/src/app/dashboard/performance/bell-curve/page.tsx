"use client";

import React from 'react';
import {
    Activity,
    Info
} from 'lucide-react';

export default function BellCurvePage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="w-6 h-6 text-indigo-500" />
                        Bell Curve
                    </h1>
                    <p className="text-slate-500 text-sm">Visualize performance distribution across the organization.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold mb-4">Distribution Targets</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Top Performers (5)', target: '10%', actual: '12%', color: 'bg-emerald-500' },
                                { label: 'High Performers (4)', target: '20%', actual: '25%', color: 'bg-teal-500' },
                                { label: 'Meet Expectations (3)', target: '40%', actual: '38%', color: 'bg-indigo-500' },
                                { label: 'Needs Improvement (2)', target: '20%', actual: '18%', color: 'bg-amber-500' },
                                { label: 'Unsatisfactory (1)', target: '10%', actual: '7%', color: 'bg-rose-500' },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs mb-1 font-bold">
                                        <span>{item.label}</span>
                                        <span className={
                                            parseInt(item.actual) > parseInt(item.target) ? 'text-rose-500' : 'text-slate-500'
                                        }>{item.actual} / {item.target}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: item.actual }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl flex gap-3 text-sm text-indigo-800 dark:text-indigo-200">
                        <Info className="w-5 h-5 shrink-0" />
                        <p>The current cycle deviates by +5% in the "High Performers" category. Consider forced ranking optimization.</p>
                    </div>
                </div>

                {/* Chart Mock */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Activity className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="font-bold text-slate-500">Normal Distribution Chart</h3>
                        <p className="text-sm text-slate-400 mt-2">Interactive visualization component goes here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
