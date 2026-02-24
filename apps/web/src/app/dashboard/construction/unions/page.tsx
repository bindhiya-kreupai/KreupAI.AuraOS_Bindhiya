"use client";

import React from 'react';
import {
    Users,
    MessageSquare,
    FileSignature,
    Scale,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

export default function UnionsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Scale className="w-6 h-6 text-indigo-500" />
                        Union Management
                    </h1>
                    <p className="text-slate-500 text-sm">Grievance logs, CBA negotiations, and steward contacts.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-800/30">
                    <FileSignature className="w-4 h-4" /> CBA Renewal: 6 Months Left
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Grievance Log */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">Active Grievances</h3>
                    {[
                        { id: 'G-2024-042', subject: 'Overtime Pay Dispute', steward: 'Jimmy Hoffa Jr.', status: 'Mediation', date: '3 days ago', priority: 'High' },
                        { id: 'G-2024-041', subject: 'Safety Gear Quality', steward: 'Norma Rae', status: 'Under Review', date: '1 week ago', priority: 'Medium' },
                        { id: 'G-2024-038', subject: 'Shift Allowances', steward: 'Cesar C.', status: 'Resolved', date: '2 weeks ago', priority: 'Low' },
                    ].map((g, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-4 md:mb-0">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold
                                     ${g.priority === 'High' ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-500'}
                                `}>
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{g.subject}</h3>
                                    <div className="text-xs text-slate-500 font-bold mb-1">{g.id} • Steward: {g.steward}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">
                                        Submitted {g.date}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                    ${g.status === 'Resolved' ? 'bg-emerald-100 text-emerald-600' :
                                        g.status === 'Mediation' ? 'bg-indigo-100 text-indigo-600' :
                                            'bg-amber-100 text-amber-600'}
                                `}>
                                    {g.status}
                                </span>
                                <button className="text-xs font-bold text-indigo-500 hover:underline">View Details</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Union Reps Sidebar */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 text-slate-700 dark:text-slate-300">Registered Unions</h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-l-4 border-indigo-500">
                                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Local 104 (Electricians)</h4>
                                <div className="flex justify-between mt-2 text-xs text-slate-500">
                                    <span>Members: 142</span>
                                    <span className="text-emerald-500 font-bold">Good Standing</span>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-l-4 border-orange-500">
                                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Local 52 (Carpenters)</h4>
                                <div className="flex justify-between mt-2 text-xs text-slate-500">
                                    <span>Members: 89</span>
                                    <span className="text-amber-500 font-bold">Negotiation Open</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 p-6 flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        <div>
                            <h3 className="font-bold text-emerald-900 dark:text-emerald-300">No Strikes</h3>
                            <p className="text-xs text-emerald-800 dark:text-emerald-400">Operations running smoothly. Last stoppage: 2021.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

