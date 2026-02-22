"use client";

import React, { useState, useEffect } from 'react';
import {
    ClipboardCheck,
    AlertCircle,
    CheckCircle2,
    Calendar,
    ChevronRight,
    UploadCloud,
    PieChart
} from 'lucide-react';
import { ComplianceAuditService } from '../services';

export default function ComplianceAuditsPage() {
    const [audits, setAudits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAudits();
    }, []);

    const fetchAudits = async () => {
        try {
            const data = await ComplianceAuditService.getAudits();
            setAudits(data);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ClipboardCheck className="w-6 h-6 text-indigo-500" />
                        Compliance Audits
                    </h1>
                    <p className="text-slate-500 text-sm">Internal and external audit management, checklists, and evidence.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Calendar className="w-4 h-4" /> Schedule Audit
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Overall Compliance</div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-bold">92%</div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '92%' }}></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Open Non-Conformities</div>
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-3xl font-bold">3</div>
                    <div className="text-xs text-amber-600 mt-1">Due within 7 days</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Next External Audit</div>
                        <Calendar className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="text-2xl font-bold">Dec 15</div>
                    <div className="text-xs text-slate-500 mt-1">ISO 27001 Surveillance</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-0">
                {/* Active Audits */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-4">Active & Upcoming Audits</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto">
                        {[
                            { name: 'ISO 27001:2013', type: 'External', status: 'Upcoming', date: 'Dec 15-18', progress: 0 },
                            { name: 'Internal HR Audit Q4', type: 'Internal', status: 'In Progress', date: 'Dec 01-10', progress: 65 },
                            { name: 'GDPR Compliance Check', type: 'Internal', status: 'Completed', date: 'Nov 10', progress: 100 },
                        ].map(audit => (
                            <div key={audit.name} className="flex flex-col p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-sm">{audit.name}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-bold">{audit.type}</span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> {audit.date}</span>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${audit.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                                            audit.status === 'In Progress' ? 'bg-amber-100 text-amber-600' :
                                                'bg-slate-100 text-slate-500'}
                                    `}>
                                        {audit.status}
                                    </span>
                                </div>

                                {audit.status === 'In Progress' && (
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-500">Evidence Collection</span>
                                            <span className="font-bold">{audit.progress}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${audit.progress}%` }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Evidence Locker</h3>

                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mb-6">
                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                        <div className="font-bold text-sm text-slate-700 dark:text-slate-300">Upload Documents</div>
                        <div className="text-xs text-slate-400 mt-1">Policy docs, logs, screenshots</div>
                    </div>

                    <h4 className="font-bold text-sm text-slate-500 uppercase mb-3 text-xs">Recent Files</h4>
                    <div className="space-y-2">
                        {['Access_Logs_Nov.csv', 'HR_Policy_v2.pdf', 'Fire_Safety_Cert.jpg'].map(f => (
                            <div key={f} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                                <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                                </div>
                                <div className="text-sm truncate flex-1">{f}</div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

