"use client";

import React, { useState, useEffect } from 'react';
import { Link2, ArrowRightLeft } from 'lucide-react';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { StandardReportService } from '../services';

const SCATTER_DATA = [
    { x: 10, y: 30, z: 200 },
    { x: 30, y: 200, z: 260 },
    { x: 45, y: 100, z: 400 },
    { x: 50, y: 400, z: 280 },
    { x: 70, y: 150, z: 100 },
    { x: 100, y: 250, z: 500 },
    { x: 60, y: 320, z: 300 },
    { x: 80, y: 280, z: 380 },
];

export default function CrossModuleReportsPage() {
    return (
        <div className="p-6 space-y-8 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                    <Link2 className="w-8 h-8 text-indigo-500" />
                    Cross-module Reports
                </h1>
                <p className="text-slate-500 mt-2 text-lg">Correlate data across different functional areas.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <ArrowRightLeft className="w-5 h-5 text-indigo-500" /> Correlation Config
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">X-Axis Metric (Module A)</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm">
                                    <option>Attendance % (Attendance)</option>
                                    <option>Overtime Hours (Payroll)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Y-Axis Metric (Module B)</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm">
                                    <option>Sales Performance (CRM)</option>
                                    <option>Task Completion (Projects)</option>
                                </select>
                            </div>
                            <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                                Analyze Correlation
                            </button>
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2">Insight Detected</h4>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300">
                            strong positive correlation (0.85) observed between <strong>Attendance %</strong> and <strong>Task Completion</strong> scores in Q3.
                        </p>
                    </div>
                </div>

                {/* Visual */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm h-[400px]">
                    <h3 className="font-bold text-lg mb-4 text-center">Correlation Scatter Plot</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis type="number" dataKey="x" name="Attendance" unit="%" stroke="#94a3b8" />
                            <YAxis type="number" dataKey="y" name="Performance" unit="pts" stroke="#94a3b8" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                            <Scatter name="Employees" data={SCATTER_DATA} fill="#8884d8" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
