"use client";

import React, { useState } from 'react';
import {
    Scale,
    CheckCircle2,
    AlertCircle,
    BarChart3
} from 'lucide-react';

export default function JobEvaluationPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Scale className="w-6 h-6 text-indigo-500" />
                        Job Evaluation
                    </h1>
                    <p className="text-slate-500 text-sm">Systematic scoring and grading of job roles.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Roles Pending Evaluation */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" /> Pending Evaluation
                    </h3>
                    <div className="space-y-3">
                        {[
                            { title: 'AI Research Scientist', family: 'Engineering', date: 'Submitted 2d ago', status: 'Pending Review' },
                            { title: 'Global Mobility Specialist', family: 'HR', date: 'Submitted 1w ago', status: 'Pending Review' },
                            { title: 'Sales Enablement Lead', family: 'Sales', date: 'Submitted 3d ago', status: 'Information Requested' },
                        ].map((role, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <div>
                                    <h4 className="font-bold text-sm">{role.title}</h4>
                                    <div className="text-xs text-slate-500">{role.family} • {role.date}</div>
                                </div>
                                <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">
                                    Start Grading
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Grade Distribution Chart Placeholder */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-80 flex flex-col items-center justify-center text-slate-400">
                    <BarChart3 className="w-16 h-16 opacity-20 mb-4" />
                    <span className="font-bold">Grade Distribution Chart</span>
                </div>

                {/* Recent Evaluations */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold bg-slate-50 dark:bg-slate-800/50">
                        Recently Completed Evaluations
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Job Title</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">Score</th>
                                <th className="px-6 py-4">Assigned Grade</th>
                                <th className="px-6 py-4">Evaluator</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { title: 'Senior Marketing Manager', method: 'Point Factor', score: 450, grade: 'L5', evaluator: 'Jane Doe' },
                                { title: 'Junior Accountant', method: 'Hay System', score: 120, grade: 'L2', evaluator: 'John Smith' },
                                { title: 'Staff Engineer', method: 'Point Factor', score: 600, grade: 'L6', evaluator: 'Jane Doe' },
                            ].map((evalItem, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4 font-bold">{evalItem.title}</td>
                                    <td className="px-6 py-4">{evalItem.method}</td>
                                    <td className="px-6 py-4 font-mono">{evalItem.score}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded text-xs font-bold">{evalItem.grade}</span></td>
                                    <td className="px-6 py-4 text-slate-500">{evalItem.evaluator}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
