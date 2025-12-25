"use client";

import React, { useState, useEffect } from 'react';
import {
    Activity,
    CheckCircle,
    Clock,
    XCircle,
    FileText
} from 'lucide-react';
import { ClaimService } from '../services';

export default function ClaimStatusPage() {
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClaimStatus();
    }, []);

    const fetchClaimStatus = async () => {
        try {
            setLoading(true);
            const data = await ClaimService.getClaims({ employeeId: 'EMP-001' });
            setClaims(data);
        } catch (error) {
            console.error('Error fetching claim status:', error);
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
                        <Activity className="w-6 h-6 text-indigo-500" />
                        Claim Status Tracker
                    </h1>
                    <p className="text-slate-500 text-sm">Real-time updates on your submitted claims.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 container mx-auto">
                {/* Detail View */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <div className="text-sm text-slate-500 mb-1">Claim ID: #CLM-002</div>
                            <h2 className="text-2xl font-bold">Vision Exam & Frames</h2>
                            <div className="text-indigo-600 font-medium">LensCrafters • Oct 10, 2024</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-500 mb-1">Claim Amount</div>
                            <div className="text-2xl font-mono font-bold">$220.00</div>
                        </div>
                    </div>

                    <div className="space-y-8 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800 -z-10"></div>

                        {[
                            { title: 'Claim Submitted', date: 'Oct 10, 10:30 AM', status: 'completed', desc: 'Successfully received by TPA.' },
                            { title: 'Provider Verification', date: 'Oct 11, 09:00 AM', status: 'completed', desc: 'Contacted LensCrafters for invoice confirmation.' },
                            { title: 'Adjudication', date: 'In Progress', status: 'current', desc: 'Determining coverage and co-pay amount.' },
                            { title: 'Payment Processing', date: 'Pending', status: 'pending', desc: 'Funds released to provider or employee.' },
                        ].map((step, i) => (
                            <div key={i} className="flex gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white dark:ring-slate-900
                                    ${step.status === 'completed' ? 'bg-emerald-500 text-white' :
                                        step.status === 'current' ? 'bg-indigo-500 text-white animate-pulse' :
                                            'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                                    {step.status === 'completed' ? <CheckCircle className="w-5 h-5" /> :
                                        step.status === 'current' ? <Clock className="w-5 h-5" /> :
                                            <div className="w-3 h-3 bg-slate-400 rounded-full"></div>}
                                </div>
                                <div className="pt-1 pb-4">
                                    <h4 className={`font-bold ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{step.title}</h4>
                                    <div className="text-xs font-bold text-slate-400 mb-1">{step.date}</div>
                                    <p className="text-sm text-slate-500">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl">
                        <h3 className="font-bold text-sm mb-4">Documents</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-500 transition-colors">
                                <FileText className="w-8 h-8 text-rose-400" />
                                <div>
                                    <div className="font-bold text-sm">Invoice.pdf</div>
                                    <div className="text-xs text-slate-400">1.2 MB</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-500 transition-colors">
                                <FileText className="w-8 h-8 text-indigo-400" />
                                <div>
                                    <div className="font-bold text-sm">Claim_Form.pdf</div>
                                    <div className="text-xs text-slate-400">0.8 MB</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
