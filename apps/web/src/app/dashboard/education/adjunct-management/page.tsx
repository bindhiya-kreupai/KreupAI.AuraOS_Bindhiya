"use client";

import React, { useState } from 'react';
import {
    Users,
    Calendar,
    Briefcase,
    FileSignature
} from 'lucide-react';

export default function AdjunctManagementPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Adjunct Management
                    </h1>
                    <p className="text-slate-500 text-sm">Contract administration for adjunct faculty.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <FileSignature className="w-4 h-4" /> Issue Contract
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Adjunct Faculty</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Courses</th>
                            <th className="px-6 py-4">Contract Period</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                            { name: 'Prof. Minerva McGonagall', dept: 'Transfiguration', courses: 2, period: 'Fall 2024', status: 'Active' },
                            { name: 'Prof. Severus Snape', dept: 'Potions', courses: 3, period: 'Fall 2024', status: 'Active' },
                            { name: 'Prof. Gilderoy Lockhart', dept: 'Defense Stats', courses: 1, period: 'Spring 2025', status: 'Pending Sign' },
                            { name: 'Prof. Sybill Trelawney', dept: 'Divination', courses: 1, period: 'Spring 2025', status: 'Draft' },
                        ].map((adj, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4 font-bold">{adj.name}</td>
                                <td className="px-6 py-4">{adj.dept}</td>
                                <td className="px-6 py-4">{adj.courses} Classes</td>
                                <td className="px-6 py-4">{adj.period}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${adj.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                                            adj.status === 'Pending Sign' ? 'bg-amber-100 text-amber-600' :
                                                'bg-slate-200 text-slate-600'
                                        }`}>{adj.status}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-indigo-600 hover:underline font-bold">Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

