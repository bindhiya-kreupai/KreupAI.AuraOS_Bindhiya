"use client";

import React, { useState, useEffect } from 'react';
import { BackgroundCheckService } from '../services';
import {
    ShieldCheck,
    AlertCircle,
    CheckCircle,
    Clock,
    User,
    FileText
} from 'lucide-react';

export default function BackgroundVerificationPage() {
    const [checks, setChecks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ inProgress: 0, completed: 0, flagged: 0 });

    useEffect(() => {
        fetchChecks();
    }, []);

    const fetchChecks = async () => {
        try {
            const data = await BackgroundCheckService.getBackgroundChecks();
            setChecks(data);

            const inProgress = data.filter((c: any) => c.status === 'in-progress').length;
            const completed = data.filter((c: any) => c.status === 'completed').length;
            const flagged = data.filter((c: any) => c.status === 'flagged').length;
            setStats({ inProgress, completed, flagged });
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const handleInitiateCheck = async (data: any) => {
        try {
            await BackgroundCheckService.initiateBackgroundCheck(data);
            await fetchChecks();
        } catch (error) {
            console.error('Error:', error);
                    }
    };

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                    {[
                        { name: 'Michael Chen', role: 'Senior Frontend Engineer', vendor: 'Checkr', status: 'In Progress', progress: 65, checks: ['Identity', 'Criminal', 'Education'] },
                        { name: 'James Wilson', role: 'DevOps Engineer', vendor: 'Hireright', status: 'Completed', progress: 100, checks: ['Identity', 'Criminal', 'Education', 'Employment'], result: 'Clear' },
                        { name: 'Emily Davis', role: 'UX Designer', vendor: 'Checkr', status: 'Flagged', progress: 100, checks: ['Identity', 'Employment'], result: 'Discrepancy' },
                    ].map((check, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        {check.name}
                                        {check.status === 'Flagged' && <AlertCircle className="w-5 h-5 text-rose-500" />}
                                        {check.status === 'Completed' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                    </h3>
                                    <div className="text-sm text-slate-500">{check.role} • via {check.vendor}</div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${check.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                                        check.status === 'Flagged' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
                                    }`}>
                                    {check.status}
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-xs font-bold text-slate-500">
                                    <span>Verification Progress</span>
                                    <span>{check.progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${check.status === 'Flagged' ? 'bg-rose-500' : 'bg-indigo-500'
                                        }`} style={{ width: `${check.progress}%` }}></div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {check.checks.map((c, j) => (
                                    <span key={j} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3 text-emerald-500" /> {c}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Panel: Vendor Integration */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                        <h3 className="font-bold flex items-center gap-2 mb-4"><ShieldCheck className="w-5 h-5" /> Connected Vendors</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/10">
                                <div className="font-bold">Checkr</div>
                                <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/10">
                                <div className="font-bold">Hireright</div>
                                <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 opacity-50">
                                <div className="font-bold">FirstAdvantage</div>
                                <div className="text-[10px] uppercase font-bold border border-white/20 px-1 rounded">Connect</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Pending Requests</h3>
                        <div className="text-center py-8 text-slate-400">
                            <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No pending BGV requests</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
