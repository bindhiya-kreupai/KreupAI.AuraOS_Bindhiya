"use client";

import React, { useState, useEffect } from 'react';
import { CandidateApplicationService, JobPostingService } from '../services';
import {
    Layout,
    FileText,
    CheckCircle2,
    Clock,
    UploadCloud,
    Briefcase,
    Building2,
    MapPin,
    AlertCircle,
    ChevronRight,
    Search
} from 'lucide-react';

export default function CandidatePortalPage() {
    const [activeTab, setActiveTab] = useState('Applications');
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const data = await CandidateApplicationService.getApplications();
            if (data && data.length > 0) {
                setApplications(data);
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
                        <Layout className="w-6 h-6 text-indigo-500" />
                        Candidate Portal
                    </h1>
                    <p className="text-slate-500 text-sm">Manage candidate experience and application statuses.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-hidden">
                {/* Left: Application List */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-6">
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 w-fit">
                        {['Applications', 'Documents', 'Offers'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
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

                    <div className="flex-1 overflow-y-auto pr-2">
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
                                                <Briefcase className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">Senior Product Designer</h3>
                                                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> Design Team</span>
                                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Remote</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg text-xs font-bold uppercase">
                                            Interview Stage
                                        </div>
                                    </div>

                                    <div className="relative pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div className="absolute top-0 left-6 w-0.5 h-6 bg-slate-100 dark:bg-slate-800 -translate-y-full"></div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Screening</span>
                                                <div className="w-8 h-0.5 bg-emerald-500 mx-2"></div>
                                                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white ring-4 ring-indigo-100 dark:ring-indigo-900/30">
                                                    <Clock className="w-3 h-3" />
                                                </div>
                                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Technical Round</span>
                                                <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-700 mx-2"></div>
                                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                            </div>
                                            <button className="text-sm text-indigo-500 font-bold hover:underline">View Details</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Quick Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                        <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2">Complete Profile</h3>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-4">
                            Your profile is 85% complete. Add your certifications to increase your chances.
                        </p>
                        <button className="w-full py-2 bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-600 transition-colors">
                            Update Profile
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold mb-4">Pending Tasks</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold truncate">Upload Salary Slips</div>
                                    <div className="text-xs text-slate-500">Required for Offer</div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold truncate">Sign NDA</div>
                                    <div className="text-xs text-slate-500">Pending Action</div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
