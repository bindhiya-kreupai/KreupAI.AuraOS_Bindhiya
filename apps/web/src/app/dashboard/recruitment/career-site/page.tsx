"use client";

import React, { useState, useEffect } from 'react';
import { JobPostingService, RecruitmentSettingsService } from '../services';
import type { JobPosting, RecruitmentSettings } from '../types';
import {
    Globe,
    Palette,
    Layout,
    Eye,
    Save,
    Image as ImageIcon,
    Loader2
} from 'lucide-react';

function getCompanyName(settings: RecruitmentSettings | null): string {
    return (settings as any)?.companyName || (settings as any)?.general?.companyName || 'Your Company';
}

function getCareerPageUrl(settings: RecruitmentSettings | null): string {
    return (settings as any)?.careerPageUrl || (settings as any)?.general?.careerPageUrl || 'careers.auraos.local';
}

function getFeatureFlags(settings: RecruitmentSettings | null) {
    const rawSettings = settings as any;
    return [
        {
            label: 'Direct Applications',
            enabled: rawSettings?.allowDirectApplications ?? rawSettings?.applicationSettings?.allowDirectApplications ?? false,
        },
        {
            label: 'Resume Required',
            enabled: rawSettings?.applicationSettings?.requireResume ?? true,
        },
        {
            label: 'Quick Apply',
            enabled: rawSettings?.applicationSettings?.enableQuickApply ?? false,
        },
        {
            label: 'Cover Letter',
            enabled: rawSettings?.applicationSettings?.requireCoverLetter ?? false,
        },
    ];
}

export default function CareerSitePage() {
    const [theme, setTheme] = useState('Modern Blue');
    const [settings, setSettings] = useState<RecruitmentSettings | null>(null);
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCareerSiteData();
    }, []);

    const fetchCareerSiteData = async () => {
        try {
            const [settingsData, jobsData] = await Promise.all([
                RecruitmentSettingsService.getSettings(),
                JobPostingService.getPostings({ isActive: true })
            ]);
            setSettings(settingsData);
            setJobs(jobsData);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const companyName = getCompanyName(settings);
    const careerPageUrl = getCareerPageUrl(settings);
    const featureFlags = getFeatureFlags(settings);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading career site...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Globe className="w-6 h-6 text-indigo-500" />
                        Career Site Builder
                    </h1>
                    <p className="text-slate-500 text-sm">Customize your public job board appearance and content.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <Eye className="w-4 h-4" /> Live Preview
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                        <Save className="w-4 h-4" /> Publish Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Settings Panel */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Palette className="w-4 h-4" /> Branding</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="blocks text-xs font-bold text-slate-500 mb-2">Color Theme</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Modern Blue', 'Classic Dark', 'Vibrant'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setTheme(t)}
                                            className={`p-2 text-xs font-bold rounded-lg border-2 transition-all ${theme === t ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="blocks text-xs font-bold text-slate-500 mb-2">Company Logo</label>
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer">
                                    <ImageIcon className="w-8 h-8 mb-2" />
                                    <span className="text-xs font-bold">Upload Logo</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Layout className="w-4 h-4" /> Sections</h3>
                        <div className="space-y-2">
                            {featureFlags.map((feature) => (
                                <div key={feature.label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <span className="text-sm font-bold">{feature.label}</span>
                                    <div className={`w-10 h-5 rounded-full relative ${feature.enabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${feature.enabled ? 'right-1' : 'left-1'}`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-950 rounded-2xl border-[10px] border-slate-800 overflow-hidden shadow-2xl flex flex-col">
                    <div className="bg-slate-800 p-2 flex gap-1.5 items-center justify-start px-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        <div className="flex-1 text-center text-[10px] text-slate-500 font-mono">{careerPageUrl}</div>
                    </div>

                    <div className="flex-1 bg-white dark:bg-slate-900 overflow-y-auto">
                        <div className="bg-indigo-600 text-white py-16 px-8 text-center">
                            <h2 className="text-3xl font-black mb-4">Join {companyName}</h2>
                            <p className="max-w-md mx-auto text-indigo-100 mb-8">Build your next move through {companyName}'s live career site and discover currently active roles.</p>
                            <button className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-full">View Openings</button>
                        </div>

                        <div className="p-8 grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-800/50">
                                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Career URL</div>
                                <div className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200 break-all">{careerPageUrl}</div>
                            </div>
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-800/50">
                                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Active Openings</div>
                                <div className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{jobs.length}</div>
                            </div>
                        </div>

                        <div className="px-8 pb-12">
                            <h3 className="font-bold text-xl mb-6">Open Roles ({jobs.length})</h3>
                            <div className="space-y-3">
                                {jobs.length === 0 && (
                                    <div className="p-4 text-center text-sm text-slate-400">No open positions to display.</div>
                                )}
                                {jobs.slice(0, 5).map((job) => (
                                    <div key={job.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-sm">{job.jobTitle}</div>
                                            <div className="text-xs text-slate-500">{job.departmentName} - {job.locationName}</div>
                                        </div>
                                        <div className="h-8 w-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-500 text-xs font-bold">
                                            {job.applicationCount || 0}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

