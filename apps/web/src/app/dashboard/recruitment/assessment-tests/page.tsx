"use client";

import React from 'react';
import {
    BrainCircuit,
    Plus,
    BarChart3,
    AlertCircle,
    FileCode,
    Link2,
    CheckCircle2
} from 'lucide-react';

export default function AssessmentsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BrainCircuit className="w-6 h-6 text-indigo-500" />
                        Assessment Tests
                    </h1>
                    <p className="text-slate-500 text-sm">Track recruitment assessments once a dedicated assessment workflow is connected.</p>
                </div>
                <button
                    type="button"
                    disabled
                    className="flex items-center gap-2 bg-slate-200 text-slate-500 px-4 py-2 rounded-xl text-sm font-bold cursor-not-allowed"
                >
                    <Plus className="w-4 h-4" /> Create Test
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-y-auto pb-20">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 flex items-center justify-center mb-5">
                        <AlertCircle className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Assessments not yet connected</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mb-6">
                        This dashboard no longer fabricates assessment tests from application stages. Recruitment assessments will appear here only after a dedicated assessment service is wired into the recruitment module.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-5">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                                <Link2 className="w-4 h-4 text-indigo-500" />
                                Integration Requirement
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Add a normalized recruitment assessment contract before enabling test creation, candidate assignment, or analytics.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-5">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Current Scope
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Candidate applications, interviews, offers, background checks, and portal flows now reflect live recruitment contracts without synthetic assessment rows.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <FileCode className="w-4 h-4 text-indigo-500" />
                        Assessment authoring and analytics stay disabled until the dedicated recruitment assessment integration is available.
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold mb-2">
                            <BarChart3 className="w-4 h-4" />
                            Assessment Analytics
                        </div>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-4">
                            No live assessment metrics are shown because recruitment assessments are not yet backed by a dedicated dashboard service.
                        </p>
                        <div className="w-full py-2 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold text-sm text-center">
                            Awaiting dedicated service contract
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold mb-4">What this page needs</h3>
                        <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">Assessment definitions scoped to recruitment workflows</div>
                            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">Candidate assignment and submission tracking</div>
                            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">Truthful analytics sourced from completed assessments</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

