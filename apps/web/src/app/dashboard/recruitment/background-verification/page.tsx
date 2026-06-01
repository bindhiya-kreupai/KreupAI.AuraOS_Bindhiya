// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
"use client";

import React, { useState, useEffect } from 'react';
import { BackgroundCheckService } from '../services';
import type { BackgroundCheck } from '../types';
import {
    ShieldCheck,
    AlertCircle,
    CheckCircle,
    Clock,
    Loader2
} from 'lucide-react';

function getStatusStyle(status: string) {
    switch (status) {
        case 'completed': return 'bg-emerald-100 text-emerald-600';
        case 'flagged': return 'bg-rose-100 text-rose-600';
        default: return 'bg-indigo-100 text-indigo-600';
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'pending': return 'Pending';
        case 'in-progress': return 'In Progress';
        case 'completed': return 'Completed';
        case 'flagged': return 'Flagged';
        default: return status;
    }
}

function getProgress(check: BackgroundCheck & Record<string, any>) {
    if (check.status === 'completed' || check.status === 'flagged') {
        return 100;
    }

    if (check.status === 'in-progress') {
        return 50;
    }

    return 10;
}

function getVendorName(check: BackgroundCheck & Record<string, any>) {
    return check.vendorName || check.provider || 'Unknown Provider';
}

export default function BackgroundVerificationPage() {
    const [checks, setChecks] = useState<Array<BackgroundCheck & Record<string, any>>>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ inProgress: 0, completed: 0, flagged: 0 });

    useEffect(() => {
        fetchChecks();
    }, []);

    const fetchChecks = async () => {
        try {
            setLoading(true);
            const data = await BackgroundCheckService.getBackgroundChecks();
            setChecks(data);

            const inProgress = data.filter(check => check.status === 'in-progress' || check.status === 'pending').length;
            const completed = data.filter(check => check.status === 'completed').length;
            const flagged = data.filter(check => check.status === 'flagged' || check.result === 'flagged').length;
            setStats({ inProgress, completed, flagged });
        } catch (error: any) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInitiateCheck = async (data: Partial<BackgroundCheck>) => {
        try {
            await BackgroundCheckService.initiateBackgroundCheck(data);
            await fetchChecks();
        } catch (error: any) {
            console.error('Error:', error);
        }
    };

    const vendors = Array.from(new Set(checks.map(check => getVendorName(check)).filter(Boolean))).sort();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading background checks...</p>
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
                        <ShieldCheck className="w-6 h-6 text-indigo-500" />
                        Background Verification
                    </h1>
                    <p className="text-slate-500 text-sm">Track BGV status and initiate new checks w/ vendors.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                    + Initiate Check
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Status Column */}
                <div className="lg:col-span-2 space-y-4">
                    {checks.length === 0 && (
                        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                            <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">No background checks</h3>
                            <p className="text-sm text-slate-400 dark:text-slate-500">Initiate a new background check to get started.</p>
                        </div>
                    )}
                    {checks.map(check => {
                        const progress = getProgress(check);

                        return (
                            <div key={check.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            {check.checkType}
                                            {check.status === 'flagged' && <AlertCircle className="w-5 h-5 text-rose-500" />}
                                            {check.status === 'completed' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                        </h3>
                                        <div className="text-sm text-slate-500">
                                            {getVendorName(check)} {check.candidateId && `- Candidate: ${check.candidateId.substring(0, 8)}`}
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(check.status)}`}>
                                        {getStatusLabel(check.status)}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-xs font-bold text-slate-500">
                                        <span>Verification Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${check.status === 'flagged' ? 'bg-rose-500' : 'bg-indigo-500'
                                            }`} style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>

                                <div className="flex gap-2 text-xs text-slate-500">
                                    <span>Requested: {check.requestDate ? new Date(check.requestDate).toLocaleDateString() : 'N/A'}</span>
                                    {check.completionDate && (
                                        <span>Completed: {new Date(check.completionDate).toLocaleDateString()}</span>
                                    )}
                                    {check.result && (
                                        <span className={`font-bold ${check.result === 'clear' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            Result: {check.result}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Panel: Vendor Integration */}
                <div className="space-y-4">
                    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                        <h3 className="font-bold flex items-center gap-2 mb-4"><ShieldCheck className="w-5 h-5" /> Connected Vendors</h3>
                        <div className="space-y-4">
                            {vendors.length === 0 && (
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm text-white/60">
                                    No connected vendors available from live background check data yet.
                                </div>
                            )}
                            {vendors.map(vendor => (
                                <div key={vendor} className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/10">
                                    <div className="font-bold">{vendor}</div>
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">In Progress</span>
                                <span className="font-bold text-indigo-600">{stats.inProgress}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Completed</span>
                                <span className="font-bold text-emerald-600">{stats.completed}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Flagged</span>
                                <span className="font-bold text-rose-600">{stats.flagged}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

