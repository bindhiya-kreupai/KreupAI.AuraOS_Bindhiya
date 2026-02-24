"use client";

import React, { useState } from 'react';
import {
    LayoutList,
    Clock,
    CheckCircle2,
    XCircle,
    Plus
} from 'lucide-react';

export default function RequestPortalPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <LayoutList className="w-6 h-6 text-indigo-500" />
                        My Requests
                    </h1>
                    <p className="text-slate-500 text-sm">Track the status of your service requests.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Request
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Request ID</th>
                            <th className="px-6 py-4">Service</th>
                            <th className="px-6 py-4">Submitted On</th>
                            <th className="px-6 py-4">Current Stage</th>
                            <th className="px-6 py-4">Est. Completion</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                            { id: 'REQ-8821', service: 'MacBook Pro 16" Request', date: 'Oct 24, 2024', stage: 'Procurement Approval', eta: 'Oct 30', status: 'In Progress' },
                            { id: 'REQ-8755', service: 'Address Proof Letter', date: 'Oct 20, 2024', stage: '-', eta: '-', status: 'Completed' },
                            { id: 'REQ-8610', service: 'Gym Reimbursement', date: 'Oct 15, 2024', stage: 'Manager Rejection', eta: '-', status: 'Rejected' },
                        ].map((req, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">{req.id}</td>
                                <td className="px-6 py-4 font-bold">{req.service}</td>
                                <td className="px-6 py-4 text-slate-500">{req.date}</td>
                                <td className="px-6 py-4 text-slate-500">{req.stage}</td>
                                <td className="px-6 py-4 text-slate-500">{req.eta}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit ${req.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                            req.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                                        }`}>
                                        {req.status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> :
                                            req.status === 'Rejected' ? <XCircle className="w-3 h-3" /> :
                                                <Clock className="w-3 h-3" />}
                                        {req.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

