"use client";

import React from 'react';
import {
    Landmark,
    FileCheck,
    Users,
    AlertCircle,
    CheckCircle2,
    CalendarDays,
    Loader2
} from 'lucide-react';
import { useESG } from '../hooks/useESG';
import { toast } from 'sonner';

export default function GovernancePage() {
    const { metrics, initiatives, loading, error, generateReport } = useESG();

    const handleGenerateReport = async () => {
        try {
            await generateReport(new Date().getFullYear());
            toast.success('Governance report generated successfully');
        } catch (error: any) {
            toast.error('Failed to generate report');
        }
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center text-rose-500 font-bold">
                Error: {error}
            </div>
        );
    }

    const governanceInitiatives = initiatives.filter(i => i.category === 'governance');

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 overflow-y-auto pr-2">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Landmark className="w-6 h-6 text-indigo-500" />
                        Governance Scorecard
                    </h1>
                    <p className="text-slate-500 text-sm">Board oversight, compliance scoring, and policy adherence.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-xs font-bold text-slate-500 uppercase">Diversity Score</div>
                        <div className="text-2xl font-black text-emerald-600">{metrics?.boardDiversity || '85'}%</div>
                    </div>
                    <div className="h-10 w-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-slate-500 uppercase">Legal Score</div>
                        <div className="text-2xl font-black text-indigo-600">{metrics?.dataPrivacyCompliance || '92'}/100</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-0 flex-1">
                {/* Governance Initiatives */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" /> Active Oversight
                    </h3>

                    <div className="space-y-4 flex-1 overflow-y-auto">
                        {governanceInitiatives.map((m, i) => (
                            <div key={m.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-sm">{m.name}</h4>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                         ${m.status === 'completed' ? 'bg-slate-200 text-slate-600' : 'bg-indigo-100 text-indigo-600'}
                                    `}>
                                        {m.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                    <CalendarDays className="w-3 h-3" /> {new Date(m.startDate).toLocaleDateString()}
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded">{m.impact}</span>
                            </div>
                        ))}

                        {governanceInitiatives.length === 0 && (
                            <div className="text-center py-10 text-slate-400 text-xs">
                                No active governance initiatives.
                            </div>
                        )}
                    </div>
                </div>

                {/* Compliance Checklist */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-emerald-500" /> Compliance Framework
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-y-auto">
                        {[
                            { area: 'Data Privacy (GDPR/CCPA)', status: 'Compliant', score: metrics?.dataPrivacyCompliance || 95 },
                            { area: 'Ethics Training', status: 'Compliant', score: metrics?.ethicsTraining || 100 },
                            { area: 'Board Diversity', status: 'In Progress', score: metrics?.boardDiversity || 85 },
                            { area: 'Financial Reporting', status: 'Compliant', score: 98 },
                            { area: 'Anti-Corruption Policy', status: 'Compliant', score: 100 },
                            { area: 'Labor Standards', status: 'Audit Phase', score: 88 },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div>
                                    <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.area}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        {item.status === 'Compliant' ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                                                <CheckCircle2 className="w-3 h-3" /> Compliant
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase">
                                                <AlertCircle className="w-3 h-3" /> {item.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={`text-xl font-black ${item.score >= 90 ? 'text-emerald-500' : item.score >= 70 ? 'text-amber-500' : 'text-rose-500'}`}>
                                    {item.score}%
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-xl flex justify-between items-center shrink-0">
                        <div>
                            <h4 className="font-bold text-indigo-900 dark:text-indigo-400 text-sm">Download Annual Governance Report</h4>
                            <p className="text-xs text-indigo-700 dark:text-indigo-500 mt-1">PDF format, generated automatically from live data.</p>
                        </div>
                        <button
                            onClick={handleGenerateReport}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                        >
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


