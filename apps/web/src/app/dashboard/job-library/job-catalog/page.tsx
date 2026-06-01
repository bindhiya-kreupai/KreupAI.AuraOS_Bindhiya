"use client";

import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    FileText,
    Loader2
} from 'lucide-react';

interface JobProfile {
    id: string;
    code: string;
    title: string;
    family: { name: string };
    grade?: { code: string };
    status: string;
    updatedAt: string;
}

export default function JobCatalogPage() {
    const [jobs, setJobs] = useState<JobProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await fetch('/api/job-library/catalog');
                if (!res.ok) throw new Error('Failed to fetch job catalog');
                const data = await res.json();
                setJobs(data);
            } catch (error: any) {
            console.error('Error:', error);
                console.error(error);
                setError('Failed to load job catalog');
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
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

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex-1 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase sticky top-0 backdrop-blur-sm z-10">
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
                        {jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">{job.code}</td>
                                <td className="px-6 py-4 font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    <div className="p-1 bg-indigo-50 dark:bg-indigo-900/20 rounded text-indigo-600">
                                        <FileText className="w-3 h-3" />
                                    </div>
                                    {job.title}
                                </td>
                                <td className="px-6 py-4">{job.family?.name || '-'}</td>
                                <td className="px-6 py-4">
                                    {job.grade ? (
                                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold">{job.grade.code}</span>
                                    ) : (
                                        <span className="text-slate-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${job.status === 'Active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                        job.status === 'Draft' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                            'bg-slate-100 text-slate-500'
                                        }`}>
                                        {job.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {new Date(job.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="px-6 py-4">
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors">
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

