"use client";

import React, { useState, useEffect } from 'react';
import { JobPostingService } from '../services';
import {
    Briefcase,
    Users,
    UploadCloud,
    CheckCircle2,
    Clock,
    XCircle,
    Building2,
    DollarSign,
    MoreVertical,
    FileText,
    Search,
    Filter
} from 'lucide-react';

const JOBS = [
    { id: 'JOB-101', title: 'Senior Backend Engineer', dept: 'Engineering', fee: '8.33%', status: 'Active', openings: 2 },
    { id: 'JOB-102', title: 'Product Manager', dept: 'Product', fee: '10%', status: 'Active', openings: 1 },
    { id: 'JOB-103', title: 'UX Designer', dept: 'Design', fee: '8.33%', status: 'Closed', openings: 0 },
];

const SUBMISSIONS = [
    { id: 1, candidate: 'Sarah Jenkins', job: 'Senior Backend Engineer', agency: 'TechHunters Inc.', status: 'Screening', submitted: '2 days ago' },
    { id: 2, candidate: 'Mike Ross', job: 'Product Manager', agency: 'Elite Talent', status: 'Interview', submitted: '1 week ago' },
    { id: 3, candidate: 'Rachel Green', job: 'UX Designer', agency: 'Creative Heads', status: 'Rejected', submitted: '2 weeks ago' },
];

export default function AgencyPortalPage() {
    const [activeTab, setActiveTab] = useState<'Jobs' | 'Submissions' | 'Agencies'>('Jobs');
    const [jobs, setJobs] = useState<any[]>(JOBS);
    const [submissions, setSubmissions] = useState<any[]>(SUBMISSIONS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await JobPostingService.getPostings();
            if (data && data.length > 0) {
                setJobs(data);
            }
        } catch (error) {
            console.error('Error:', error);
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map(job => (
                            <div key={job.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs">
                                        {job.dept.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${job.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {job.status}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg truncate">{job.title}</h3>
                                <div className="text-sm text-slate-500 mb-4">{job.dept}</div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Agency Fee</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{job.fee}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Openings</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{job.openings}</span>
                                    </div>
                                </div>

                                <button className="w-full py-2 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-sm rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                    View Submissions
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'Submissions' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-4">Candidate</th>
                                    <th className="p-4">Job Role</th>
                                    <th className="p-4">Agency</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Submitted</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {submissions.map(sub => (
                                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{sub.candidate}</td>
                                        <td className="p-4 text-slate-500">{sub.job}</td>
                                        <td className="p-4 text-slate-500 flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-slate-400" />
                                            {sub.agency}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                                ${sub.status === 'Screening' ? 'bg-indigo-100 text-indigo-600' :
                                                    sub.status === 'Interview' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-rose-100 text-rose-600'}
                                            `}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400 text-xs">{sub.submitted}</td>
                                        <td className="p-4 text-right">
                                            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
