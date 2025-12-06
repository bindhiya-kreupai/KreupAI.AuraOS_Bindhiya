"use client";

import React, { useState } from 'react';
import {
    Globe,
    Linkedin,
    Share2,
    BarChart2,
    Eye,
    MousePointer2,
    FileText,
    MoreHorizontal,
    Plus,
    Megaphone,
    Copy,
    Check
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

// --- MOCK DATA ---

interface JobPosting {
    id: string;
    title: string;
    department: string;
    location: string;
    type: 'Full-time' | 'Contract' | 'Remote';
    status: 'Active' | 'Draft' | 'Paused';
    postedDate: string;
    metrics: {
        views: number;
        clicks: number;
        applies: number;
    };
    channels: {
        linkedin: boolean;
        indeed: boolean;
        website: boolean;
        glassdoor: boolean;
    };
}

const POSTINGS: JobPosting[] = [
    {
        id: 'JOB-2024-001',
        title: 'Senior Product Designer',
        department: 'Design',
        location: 'Remote (US)',
        type: 'Remote',
        status: 'Active',
        postedDate: '2 days ago',
        metrics: { views: 1250, clicks: 450, applies: 42 },
        channels: { linkedin: true, indeed: true, website: true, glassdoor: false }
    },
    {
        id: 'JOB-2024-004',
        title: 'Backend Engineer (Go)',
        department: 'Engineering',
        location: 'New York, NY',
        type: 'Full-time',
        status: 'Active',
        postedDate: '5 days ago',
        metrics: { views: 890, clicks: 120, applies: 15 },
        channels: { linkedin: true, indeed: false, website: true, glassdoor: true }
    },
    {
        id: 'JOB-2024-012',
        title: 'Marketing Manager',
        department: 'Marketing',
        location: 'London, UK',
        type: 'Full-time',
        status: 'Draft',
        postedDate: '-',
        metrics: { views: 0, clicks: 0, applies: 0 },
        channels: { linkedin: false, indeed: false, website: false, glassdoor: false }
    }
];

export default function JobPostingsPage() {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopyLink = (id: string) => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-celestial-indigo" />
                        Job Postings
                    </h1>
                    <p className="text-silver-mist text-sm">Manage campaigns, track reach, and publish to job boards.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20">
                    <Plus className="w-4 h-4" /> Create Posting
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="text-silver-mist text-xs font-bold uppercase">Active Campaigns</div>
                    <div className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">8</div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="text-silver-mist text-xs font-bold uppercase">Total Views (7d)</div>
                    <div className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">4.2k</div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="text-silver-mist text-xs font-bold uppercase">New Applicants</div>
                    <div className="text-2xl font-bold text-celestial-indigo mt-1">156</div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="text-silver-mist text-xs font-bold uppercase">Avg. Conv. Rate</div>
                    <div className="text-2xl font-bold text-emerald-500 mt-1">3.8%</div>
                </div>
            </div>

            {/* Postings Grid */}
            <div className="grid grid-cols-1 gap-6">
                {POSTINGS.map(job => (
                    <div key={job.id} className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm p-6 hover:shadow-md transition-all group">
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Job Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-lg text-ink-black dark:text-pearl group-hover:text-celestial-indigo transition-colors cursor-pointer">{job.title}</h3>
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${job.status === 'Active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                            job.status === 'Draft' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' :
                                                'bg-amber-100 text-amber-600'
                                        }`}>
                                        {job.status}
                                    </span>
                                </div>
                                <div className="text-sm text-silver-mist mb-6">
                                    {job.department} • {job.location} • {job.type} • Posted {job.postedDate}
                                </div>

                                {/* Channels */}
                                <div>
                                    <div className="text-[10px] font-bold text-silver-mist uppercase mb-2">Active Channels</div>
                                    <div className="flex gap-2">
                                        <div className={`p-2 rounded-lg border ${job.channels.linkedin ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-transparent text-slate-300'} transition-colors`} title="LinkedIn">
                                            <Linkedin className="w-4 h-4" />
                                        </div>
                                        <div className={`p-2 rounded-lg border ${job.channels.website ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-transparent text-slate-300'} transition-colors`} title="Career Site">
                                            <Globe className="w-4 h-4" />
                                        </div>
                                        <div className={`p-2 rounded-lg border ${job.channels.indeed ? 'bg-blue-50 border-blue-200 text-blue-500' : 'bg-slate-50 border-transparent text-slate-300'} transition-colors`} title="Indeed">
                                            <span className="font-bold text-xs">In</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Funnel Metrics */}
                            <div className="flex-1 border-l border-cloud dark:border-nebula-purple/20 pl-0 lg:pl-6 pt-4 lg:pt-0">
                                <div className="text-[10px] font-bold text-silver-mist uppercase mb-4">Performance Funnel</div>
                                <div className="flex items-center justify-between gap-2 max-w-md">
                                    <div className="text-center flex-1">
                                        <div className="text-xs text-silver-mist flex items-center justify-center gap-1 mb-1"><Eye className="w-3 h-3" /> Views</div>
                                        <div className="font-bold text-lg text-ink-black dark:text-pearl">{job.metrics.views}</div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-blue-400 w-full"></div>
                                        </div>
                                    </div>
                                    <div className="h-px w-8 bg-slate-300 dark:bg-slate-600"></div>
                                    <div className="text-center flex-1">
                                        <div className="text-xs text-silver-mist flex items-center justify-center gap-1 mb-1"><MousePointer2 className="w-3 h-3" /> Clicks</div>
                                        <div className="font-bold text-lg text-ink-black dark:text-pearl">{job.metrics.clicks}</div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${(job.metrics.clicks / (job.metrics.views || 1)) * 100}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="h-px w-8 bg-slate-300 dark:bg-slate-600"></div>
                                    <div className="text-center flex-1">
                                        <div className="text-xs text-silver-mist flex items-center justify-center gap-1 mb-1"><FileText className="w-3 h-3" /> Applies</div>
                                        <div className="font-bold text-lg text-ink-black dark:text-pearl">{job.metrics.applies}</div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: `${(job.metrics.applies / (job.metrics.clicks || 1)) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex lg:flex-col items-center justify-end gap-2 pl-0 lg:pl-4 border-l-0 lg:border-l border-cloud dark:border-nebula-purple/20">
                                <button
                                    onClick={() => handleCopyLink(job.id)}
                                    className="p-2 text-slate-500 hover:text-celestial-indigo hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
                                    title="Copy Tracking Link"
                                >
                                    {copiedId === job.id ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                                </button>
                                <button className="p-2 text-slate-500 hover:text-celestial-indigo hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    <Share2 className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-slate-500 hover:text-celestial-indigo hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
