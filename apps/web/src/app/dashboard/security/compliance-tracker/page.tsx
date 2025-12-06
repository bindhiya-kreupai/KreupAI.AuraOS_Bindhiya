"use client";

import React from 'react';
import {
    CheckCircle,
    Calendar,
    Users,
    FileText,
    ExternalLink,
    AlertTriangle,
    PieChart
} from 'lucide-react';

export default function ComplianceTrackerPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                        Compliance Tracker
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor adherence to regulatory standards (ISO, SOC2, GDPR, HIPAA).</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Overall Score:</span>
                    <div className="w-32 h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[85%] rounded-full"></div>
                    </div>
                    <span className="text-emerald-600 font-bold">85%</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0 overflow-y-auto pb-20">

                {/* SOC2 Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 rounded-xl flex items-center justify-center text-xl font-bold">
                                S
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">SOC 2 Type II</h3>
                                <p className="text-xs text-slate-500">Security, Availability & Confidentiality</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Compliant</span>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Controls Met</span>
                            <span className="font-bold">45 / 50</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-[90%] rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                                <span className="text-xs text-slate-500 block">Next Audit</span>
                                <span className="font-bold text-sm">Oct 15, 2025</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                                <span className="text-xs text-slate-500 block">Auditor</span>
                                <span className="font-bold text-sm">PWC Global</span>
                            </div>
                        </div>
                    </div>

                    <button className="mt-auto w-full py-2 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors">
                        View Evidence
                    </button>
                </div>

                {/* GDPR Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-xl flex items-center justify-center text-xl font-bold">
                                G
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">GDPR</h3>
                                <p className="text-xs text-slate-500">Data Privacy & Protection</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Review Needed</span>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Requirements Met</span>
                            <span className="font-bold">28 / 35</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 w-[80%] rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                                <span className="text-xs text-slate-500 block">DPO Appointed</span>
                                <span className="font-bold text-sm">Yes (External)</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                <div>
                                    <span className="text-xs text-slate-500 block">Open Risks</span>
                                    <span className="font-bold text-sm text-amber-600">3 High</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="mt-auto w-full py-2 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 font-bold rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
                        Manage Compliance
                    </button>
                </div>

                {/* ISO Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/20 text-sky-600 rounded-xl flex items-center justify-center text-xl font-bold">
                                I
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">ISO 27001</h3>
                                <p className="text-xs text-slate-500">Information Security Management</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Certified</span>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Controls Implemented</span>
                            <span className="font-bold">114 / 114</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-full rounded-full"></div>
                        </div>
                        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
                            <p className="text-xs text-slate-500 mb-1">Valid Until</p>
                            <p className="font-bold text-sm">December 2026</p>
                        </div>
                    </div>

                    <button className="mt-auto w-full py-2 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 font-bold rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/10 transition-colors">
                        Certificate Details
                    </button>
                </div>

            </div>
        </div>
    );
}
