"use client";

import React, { useState, useEffect } from 'react';
import { CompetencyService } from '../../core/services';
import {
    PieChart,
    BarChart3,
    AlertTriangle,
    CheckCircle,
    ArrowUpRight
} from 'lucide-react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend
} from 'recharts';

export default function GapAnalysisPage() {
    const data = [
        { subject: 'Java', A: 4, B: 3, fullMark: 5 },
        { subject: 'System Design', A: 3, B: 2, fullMark: 5 },
        { subject: 'Cloud (AWS)', A: 3, B: 4, fullMark: 5 },
        { subject: 'Teamwork', A: 5, B: 4, fullMark: 5 },
        { subject: 'Communication', A: 4, B: 3, fullMark: 5 },
        { subject: 'Leadership', A: 3, B: 2, fullMark: 5 },
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <PieChart className="w-6 h-6 text-indigo-500" />
                        Skill Gap Analysis
                    </h1>
                    <p className="text-slate-500 text-sm">Visualize discrepancies between required proficiency and actual skills.</p>
                </div>
                <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm">
                    <option>Scope: My Team</option>
                    <option>Scope: Organization</option>
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center">
                    <h3 className="font-bold text-lg mb-2 self-start">Team Aggregate View</h3>
                    <div className="w-full h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748b' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                                <Radar
                                    name="Required Level"
                                    dataKey="A"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fill="#6366f1"
                                    fillOpacity={0.2}
                                />
                                <Radar
                                    name="Actual Level (Avg)"
                                    dataKey="B"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fill="#10b981"
                                    fillOpacity={0.3}
                                />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Insights Panel */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold mb-2">
                            <AlertTriangle className="w-5 h-5" /> Critical Gap Identified
                        </div>
                        <p className="text-sm text-rose-800 dark:text-rose-300 mb-3">
                            <strong>System Design:</strong> 40% of Senior Engineers are below the required proficiency (L3).
                        </p>
                        <button className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
                            Assign Training <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-2">
                            <CheckCircle className="w-5 h-5" /> Strength Area
                        </div>
                        <p className="text-sm text-emerald-800 dark:text-emerald-300 relative">
                            <strong>Cloud (AWS):</strong> Team average exceeds expectation by 15%.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h4 className="font-bold text-sm mb-3">Top Training Recommendations</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                <span>Advanced System Architecture</span>
                                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Course</span>
                            </li>
                            <li className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                <span>Effective Leadership</span>
                                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Workshop</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
