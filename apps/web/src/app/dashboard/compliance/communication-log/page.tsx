"use client";

import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Mail,
    PhoneCall,
    Filter
} from 'lucide-react';

export default function CommunicationLogPage() {
    const [communications, setCommunications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCommunications();
    }, []);

    const fetchCommunications = async () => {
        try {
            // Communication log could use Union or general service
            // For now, keep it as empty array with loading state
            setCommunications([]);
        } catch {
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-indigo-500" />
                        Communication Log
                    </h1>
                    <p className="text-slate-500 text-sm">Record of all official correspondence with unions and regulators.</p>
                </div>
                <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filter Logs
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-lg">Recent Logs</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                        { type: 'Email', subject: 'Re: Safety Inspection Findings', from: 'OSHA Region 4', to: 'Safety Director', date: 'Today, 10:42 AM', icon: Mail },
                        { type: 'Phone', subject: 'Grievance Hearing Scheduling', from: 'Local 42 Rep', to: 'HR Manager', date: 'Yesterday, 02:15 PM', icon: PhoneCall },
                        { type: 'Email', subject: 'Q4 Contract Proposal Draft', from: 'Legal Counsel', to: 'Union President', date: 'Oct 25, 09:00 AM', icon: Mail },
                        { type: 'Meeting', subject: 'Disciplanry Review Board', from: 'Internal', to: 'Committee', date: 'Oct 24, 01:30 PM', icon: MessageSquare },
                    ].map((log, i) => (
                        <div key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-start gap-4">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                                <log.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="font-bold">{log.subject}</div>
                                    <div className="text-xs text-slate-500">{log.date}</div>
                                </div>
                                <div className="text-sm text-slate-500">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">From:</span> {log.from} •
                                    <span className="font-bold text-slate-700 dark:text-slate-300 ml-2">To:</span> {log.to}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
