"use client";

import React, { useState, useEffect } from 'react';
import { JobPostingService } from '../services';
import type { JobPosting } from '../types';
import {
    Users,
    Building2,
    Briefcase,
    FileText,
    CheckCircle2,
} from 'lucide-react';

export default function AgencyPortalPage() {
    const [activeTab, setActiveTab] = useState<'Jobs' | 'Submissions' | 'Agencies'>('Jobs');
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await JobPostingService.getPostings();
            setJobs(data || []);
        } catch (error) {
            console.error('Error:', error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-indigo-500" />
                        Agency Portal
                    </h1>
                    <p className="text-slate-500 text-sm">Manage external recruitment agencies and candidate submissions.</p>
                </div>
                {activeTab === 'Jobs' && (
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                        <Users className="w-4 h-4" /> Invite Agency
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 w-fit">
                {['Jobs', 'Submissions', 'Agencies'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all
                            ${activeTab === tab
                                ? 'bg-white dark:bg-stellar-blue text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-20">
                {activeTab === 'Jobs' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {!loading && jobs.length === 0 && (
                            <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                                <p className="text-base font-semibold text-slate-700 dark:text-slate-200">No agency-shareable jobs available</p>
                                <p className="mt-2 text-sm text-slate-500">Publish external job postings to make them available in the agency portal.</p>
                            </div>
                        )}

                        {jobs.map(job => (
                            <div key={job.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs">
                                        {(job.departmentName || 'NA').substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${job.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {job.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg truncate">{job.jobTitle}</h3>
                                <div className="text-sm text-slate-500 mb-4">{job.departmentName}</div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Location</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{job.locationName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Applications</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{job.applicationCount}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">External Posting</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{job.isExternal ? 'Enabled' : 'Internal Only'}</span>
                                    </div>
                                </div>

                                <button className="w-full py-2 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-sm rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                    View Posting
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'Submissions' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
                        <FileText className="w-10 h-10 mx-auto mb-3 text-slate-400" />
                        <p className="text-base font-semibold text-slate-700 dark:text-slate-200">Agency submissions are not configured</p>
                        <p className="mt-2 text-sm text-slate-500">This tab will display real agency candidate submissions once a dedicated agency submission contract is implemented.</p>
                    </div>
                )}

                {activeTab === 'Agencies' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
                        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-slate-400" />
                        <p className="text-base font-semibold text-slate-700 dark:text-slate-200">Agency directory is not configured</p>
                        <p className="mt-2 text-sm text-slate-500">Use vendor management once a real agency directory model is available. This page currently exposes only live shared job postings.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

