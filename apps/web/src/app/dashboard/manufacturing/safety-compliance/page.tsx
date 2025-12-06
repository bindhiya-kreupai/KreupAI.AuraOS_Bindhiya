"use client";

import React, { useState } from 'react';
import {
    ShieldCheck,
    AlertOctagon,
    FileText,
    Download
} from 'lucide-react';

export default function SafetyCompliancePage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-indigo-500" />
                        Safety Compliance
                    </h1>
                    <p className="text-slate-500 text-sm">Review incidents, audits, and safety protocols.</p>
                </div>
                <button className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-500/20 flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4" /> Report Incident
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Recent Incidents</h3>
                    <div className="space-y-4">
                        {[
                            { title: 'Minor Slip on Floor 2', date: '2 days ago', severity: 'Low', status: 'Resolved' },
                            { title: 'Equipment Malfunction (Line B)', date: '1 week ago', severity: 'Medium', status: 'Investigating' },
                        ].map((incident, i) => (
                            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-slate-900 dark:text-slate-100">{incident.title}</div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${incident.severity === 'Low' ? 'bg-slate-200 text-slate-600' :
                                            incident.severity === 'Medium' ? 'bg-amber-100 text-amber-600' :
                                                'bg-rose-100 text-rose-600'
                                        }`}>{incident.severity}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <AlertOctagon className="w-3 h-3" /> {incident.date}
                                    </div>
                                    <span className="font-bold text-indigo-500">{incident.status}</span>
                                </div>
                            </div>
                        ))}
                        {/* Empty state if needed, or add more mock data */}
                        {/* <div className="text-center py-8 text-slate-400 italic">No recent incidents. Keep it up!</div> */}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Safety Documents</h3>
                    <div className="space-y-2">
                        {[
                            { name: 'OSHA Compliance Guide 2024', size: '2.4 MB' },
                            { name: 'Emergency Evacuation Plan', size: '1.1 MB' },
                            { name: 'Hazardous Material Handling', size: '3.5 MB' },
                            { name: 'PPE Usage Guidelines', size: '0.8 MB' },
                        ].map((doc, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">{doc.name}</div>
                                        <div className="text-xs text-slate-400">{doc.size}</div>
                                    </div>
                                </div>
                                <button className="text-slate-300 hover:text-indigo-500">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
