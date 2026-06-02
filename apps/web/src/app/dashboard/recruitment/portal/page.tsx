"use client";

import React, { useState, useEffect } from 'react';
import { CandidateApplicationService } from '../services';
import type { CandidateApplication } from '../types';
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
    Loader2
} from 'lucide-react';

type PortalTab = 'Applications' | 'Documents' | 'Offers';

function getCandidateName(application: CandidateApplication): string {
    return `${application.firstName || ''} ${application.lastName || ''}`.trim() || 'Candidate';
}

function getStageLabel(application: CandidateApplication): string {
    const stage = application.currentStage || application.status || 'applied';
    return String(stage)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, character => character.toUpperCase());
}

function getStageSteps(application: CandidateApplication): Array<{ label: string; state: 'done' | 'current' | 'upcoming' }> {
    const stage = String(application.currentStage || application.status || 'applied').toLowerCase();
    const steps = ['screening', 'interview', 'offer'];
    const currentIndex = stage.includes('offer')
        ? 2
        : stage.includes('interview')
            ? 1
            : 0;

    return steps.map((label, index) => ({
        label: label === 'offer' ? 'Offer' : label === 'interview' ? 'Interview' : 'Screening',
        state: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming',
    }));
}

export default function CandidatePortalPage() {
    const [activeTab, setActiveTab] = useState<PortalTab>('Applications');
    const [applications, setApplications] = useState<CandidateApplication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const data = await CandidateApplicationService.getApplications();
            setApplications(data || []);
        } catch (error: any) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading candidate portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Layout className="w-6 h-6 text-indigo-500" />
                        Candidate Portal
                    </h1>
                    <p className="text-slate-500 text-sm">Manage candidate experience and application statuses.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-hidden">
                {/* Left: Application List */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-4">
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 w-fit">
                        {(['Applications', 'Documents', 'Offers'] as PortalTab[]).map(tab => (
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
                            {activeTab === 'Applications' && applications.length === 0 && (
                                <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                                    <Layout className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">No applications in the portal</h3>
                                    <p className="text-sm text-slate-400 dark:text-slate-500">Candidate-facing application entries will appear here when live applications are available.</p>
                                </div>
                            )}

                            {activeTab === 'Applications' && applications.map(application => {
                                const steps = getStageSteps(application);

                                return (
                                    <div key={application.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-3">
                                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
                                                    <Briefcase className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">{application.jobTitle}</h3>
                                                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {getCandidateName(application)}</span>
                                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {application.location || 'Unknown'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg text-xs font-bold uppercase">
                                                {getStageLabel(application)}
                                            </div>
                                        </div>

                                        <div className="relative pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                                            <div className="absolute top-0 left-6 w-0.5 h-6 bg-slate-100 dark:bg-slate-800 -translate-y-full"></div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {steps.map((step, index) => (
                                                        <React.Fragment key={step.label}>
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${step.state === 'done'
                                                                ? 'bg-emerald-500'
                                                                : step.state === 'current'
                                                                    ? 'bg-indigo-500 ring-4 ring-indigo-100 dark:ring-indigo-900/30'
                                                                    : 'bg-slate-200 dark:bg-slate-700'
                                                                }`}>
                                                                {step.state === 'done' ? <CheckCircle2 className="w-3 h-3" /> : step.state === 'current' ? <Clock className="w-3 h-3" /> : null}
                                                            </div>
                                                            <span className={`text-sm font-bold ${step.state === 'current' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{step.label}</span>
                                                            {index < steps.length - 1 && <div className={`w-8 h-0.5 mx-2 ${step.state === 'upcoming' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-emerald-500'}`}></div>}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                                <button className="text-sm text-indigo-500 font-bold hover:underline">View Details</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {activeTab !== 'Applications' && (
                                <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                                    <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">{activeTab} not yet connected</h3>
                                    <p className="text-sm text-slate-400 dark:text-slate-500">This tab will switch to live portal data once candidate document and offer workflows are backed by dedicated services.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Quick Actions */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                        <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2">Portal Overview</h3>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-4">
                            {applications.length > 0
                                ? `${applications.length} live application${applications.length === 1 ? '' : 's'} currently available in the candidate portal.`
                                : 'No live candidate portal applications are available yet.'}
                        </p>
                        <div className="w-full py-2 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold text-sm text-center">
                            Live application status only
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold mb-4">Portal Tasks</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold truncate">No live candidate tasks</div>
                                    <div className="text-xs text-slate-500">Document uploads and offer actions are not wired to dedicated portal services yet.</div>
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

