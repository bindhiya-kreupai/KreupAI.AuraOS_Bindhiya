"use client";

import React from 'react';
import {
    FileText,
    Plus,
    Variable,
    AlertCircle,
    Link2,
    CheckCircle2
} from 'lucide-react';

export default function OfferTemplatesPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-500" />
                        Offer Templates
                    </h1>
                    <p className="text-slate-500 text-sm">Standardize offer letters with dynamic fields.</p>
                </div>
                <button
                    type="button"
                    disabled
                    className="flex items-center gap-2 bg-slate-200 text-slate-500 px-4 py-2 rounded-xl text-sm font-bold cursor-not-allowed"
                >
                    <Plus className="w-4 h-4" /> New Template
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-y-auto pb-20">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 flex items-center justify-center mb-5">
                        <AlertCircle className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Offer templates not yet connected</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mb-6">
                        This page no longer shows fabricated offer letter templates. Recruitment offer templates will appear here only after a dedicated template contract is wired into the offer workflow.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-5">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                                <Link2 className="w-4 h-4 text-indigo-500" />
                                Integration Requirement
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Add a normalized offer-template service before enabling template authoring, previewing, or reuse.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-5">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Current Scope
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Offer management now reflects live job offers, but template storage and document generation are still outside the normalized recruitment dashboard contract.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Variable className="w-4 h-4 text-indigo-500" />
                        Dynamic placeholders remain disabled until template persistence and document rendering are backed by a dedicated service.
                    </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 p-6 rounded-2xl flex flex-col justify-center">
                    <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
                        <Variable className="w-5 h-5" /> Template Variables
                    </h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-4">
                        Placeholder examples such as {'{candidate_name}'}, {'{salary}'}, and {'{joining_date}'} should only appear once a real offer-template editor is connected.
                    </p>
                    <div className="w-full py-2 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold text-sm text-center">
                        Awaiting template service contract
                    </div>
                </div>
            </div>
        </div>
    );
}


