"use client";

import React, { useState, useEffect } from 'react';
import {
    ShieldAlert,
    Lock,
    Users,
    FileText,
    EyeOff,
    CheckCircle
} from 'lucide-react';
import { POSHService } from '../services';

export default function POSHPage() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [committees, setCommittees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [complaintsData, committeesData] = await Promise.all([
                POSHService.getComplaints(),
                POSHService.getCommittees()
            ]);
            setComplaints(complaintsData);
            setCommittees(committeesData);
        } catch (error) {
            console.error('Error fetching POSH data:', error);
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
                        <ShieldAlert className="w-6 h-6 text-indigo-500" />
                        POSH Compliance
                    </h1>
                    <p className="text-slate-500 text-sm">Prevention of Sexual Harassment - Internal Committee Portal.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-xl">
                        <FileText className="w-4 h-4" /> Policy Doc
                    </button>
                    <button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20">
                        <Lock className="w-4 h-4" /> Secure Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto pb-20">
                {/* ICC Committee */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" /> Internal Complaints Committee (ICC)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { name: 'Dr. Sarah Smith', role: 'Presiding Officer', type: 'Internal' },
                            { name: 'Adv. Raj Malhotra', role: 'Legal Member', type: 'External' },
                            { name: 'Emily Davis', role: 'HR Representative', type: 'Internal' },
                            { name: 'John Wilson', role: 'Employee Rep', type: 'Internal' },
                        ].map(c => (
                            <div key={c.name} className="flex items-center gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-indigo-600 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    {c.name.substring(0, 1)}
                                </div>
                                <div>
                                    <div className="font-bold">{c.name}</div>
                                    <div className="text-xs text-slate-500">{c.role}</div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 mt-1 inline-block">{c.type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Training Stats */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Training Compliance</h3>
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="w-32 h-32 rounded-full border-8 border-emerald-500 flex items-center justify-center mb-4">
                            <span className="text-3xl font-black text-emerald-600">85%</span>
                        </div>
                        <p className="text-sm text-center text-slate-500 mb-4">Employees certified this year</p>
                        <button className="w-full py-2 border border-indigo-200 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
                            Send Reminders
                        </button>
                    </div>
                </div>

                {/* Confidential Reports */}
                <div className="lg:col-span-3 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-800 p-6">
                    <h3 className="font-bold text-lg mb-4 text-rose-800 dark:text-rose-400 flex items-center gap-2">
                        <EyeOff className="w-5 h-5" /> Confidential Reports Area
                    </h3>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-rose-100 dark:border-rose-900/50 p-6 flex flex-col items-center justify-center text-center">
                        <Lock className="w-12 h-12 text-rose-300 mb-4" />
                        <h4 className="font-bold text-lg text-slate-700 dark:text-slate-300">Restricted Access</h4>
                        <p className="text-slate-500 text-sm max-w-md mt-2">
                            Access to active POSH reports is strictly limited to the ICC Presiding Officer and designated legal counsel.
                        </p>
                        <button className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800">
                            Login as ICC Member
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
