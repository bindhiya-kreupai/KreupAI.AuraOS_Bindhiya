"use client";

import React, { useState, useEffect } from 'react';
import {
    AlertCircle,
    Gavel,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { GrievanceService } from '../services';

export default function GrievanceManagementPage() {
    const [grievances, setGrievances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGrievances();
    }, []);

    const fetchGrievances = async () => {
        try {
            const data = await GrievanceService.getGrievances();
            setGrievances(data);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Gavel className="w-6 h-6 text-indigo-500" />
                        Grievance Management
                    </h1>
                    <p className="text-slate-500 text-sm">Track and resolve employee grievances efficiently.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Open Cases', val: '8', color: 'text-indigo-500' },
                    { label: 'Pending Review', val: '3', color: 'text-amber-500' },
                    { label: 'Escalated', val: '1', color: 'text-rose-500' },
                    { label: 'Resolved (YTD)', val: '145', color: 'text-emerald-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.val}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-lg">Active Cases</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                        { id: 'GRV-24-001', type: 'Unfair Dismissal', employee: 'John Smith', date: 'Oct 24', status: 'Investigation' },
                        { id: 'GRV-24-002', type: 'Overtime Dispute', employee: 'Jane Doe', date: 'Oct 22', status: 'Hearing Scheduled' },
                        { id: 'GRV-24-003', type: 'Workplace Safety', employee: 'Mike Ross', date: 'Oct 20', status: 'Escalated to HR' },
                        { id: 'GRV-24-004', type: 'Harassment', employee: 'Confidential', date: 'Oct 18', status: 'Legal Review' },
                    ].map((caseItem, i) => (
                        <div key={i} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <AlertCircle className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{caseItem.id}</span>
                                        <span className="font-bold">{caseItem.type}</span>
                                    </div>
                                    <div className="text-sm text-slate-500">Employee: {caseItem.employee} • Filed: {caseItem.date}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-4 md:mt-0">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${caseItem.status.includes('Escalated') || caseItem.status.includes('Legal') ? 'bg-rose-100 text-rose-600' :
                                        caseItem.status.includes('Hearing') ? 'bg-amber-100 text-amber-600' :
                                            'bg-indigo-100 text-indigo-600'
                                    }`}>{caseItem.status}</span>
                                <button className="text-sm font-bold text-slate-500 hover:text-indigo-600">View Details</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

