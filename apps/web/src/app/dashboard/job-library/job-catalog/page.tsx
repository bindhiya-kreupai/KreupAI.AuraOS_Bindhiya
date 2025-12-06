"use client";

import React, { useState } from 'react';
import {
    Briefcase,
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    FileText
} from 'lucide-react';

export default function JobCatalogPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-indigo-500" />
                        Job Catalog
                    </h1>
                    <p className="text-slate-500 text-sm">Master list of all job roles and their definitions.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search job titles, code..."
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center gap-2 text-sm font-bold">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Role
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Job Code</th>
                            <th className="px-6 py-4">Job Title</th>
                            <th className="px-6 py-4">Job Family</th>
                            <th className="px-6 py-4">Grade</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Last Updated</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                            { code: 'IT-SWE-001', title: 'Senior Software Engineer', family: 'Engineering', grade: 'L4', status: 'Active', updated: 'Oct 24, 2024' },
                            { code: 'HR-GEN-003', title: 'HR Generalist', family: 'Human Resources', grade: 'L2', status: 'Active', updated: 'Sep 15, 2024' },
                            { code: 'MKT-MGR-002', title: 'Marketing Manager', family: 'Marketing', grade: 'L5', status: 'Active', updated: 'Oct 01, 2024' },
                            { code: 'FIN-ANA-001', title: 'Financial Analyst', family: 'Finance', grade: 'L3', status: 'Draft', updated: 'Nov 02, 2024' },
                        ].map((job, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">{job.code}</td>
                                <td className="px-6 py-4 font-bold flex items-center gap-2">
                                    <div className="p-1 bg-indigo-50 dark:bg-indigo-900/20 rounded text-indigo-600">
                                        <FileText className="w-3 h-3" />
                                    </div>
                                    {job.title}
                                </td>
                                <td className="px-6 py-4">{job.family}</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold">{job.grade}</span></td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${job.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                        }`}>
                                        {job.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{job.updated}</td>
                                <td className="px-6 py-4">
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
