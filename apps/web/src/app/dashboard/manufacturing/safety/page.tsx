"use client";

import React from 'react';
import {
    ShieldAlert,
    HardHat,
    ClipboardCheck,
    AlertTriangle,
    Eye
} from 'lucide-react';

export default function SafetyPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-rose-500" />
                        Safety & Compliance
                    </h1>
                    <p className="text-slate-500 text-sm">Incident logs, PPE tracking, and safety audits.</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-bold border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-2">
                    <CheckCircleIcon /> 145 Days Without Incident
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Incident Log */}
                <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" /> Incident Log
                        </h3>
                        <button className="text-xs font-bold bg-rose-500 text-white px-3 py-1.5 rounded-lg shadow hover:bg-rose-600 transition-colors">
                            Report New
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {[
                            { title: 'Minor Slip', loc: 'Warehouse Zone B', date: 'Oct 24, 2024', severity: 'Low', status: 'Resolved' },
                            { title: 'PPE Non-Compliance', loc: 'Assembly Line 1', date: 'Sep 12, 2024', severity: 'Medium', status: 'Closed' },
                            { title: 'Equipment Malfunction', loc: 'Mixing Unit', date: 'Aug 05, 2024', severity: 'High', status: 'Resolved' },
                        ].map((inc, i) => (
                            <div key={i} className="flex justify-between items-center p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{inc.title}</h4>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                            ${inc.severity === 'High' ? 'bg-rose-100 text-rose-600' :
                                                inc.severity === 'Medium' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-blue-100 text-blue-600'}
                                        `}>
                                            {inc.severity}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500">{inc.loc} • {inc.date}</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                                        {inc.status}
                                    </span>
                                    <button className="block mt-2 text-xs font-bold text-slate-400 hover:text-indigo-600 text-right w-full">View Report</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PPE Inventory */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <HardHat className="w-5 h-5 text-indigo-500" /> PPE Inventory
                    </h3>
                    <div className="space-y-6">
                        {[
                            { name: 'Safety Helmets', count: 45, total: 50, color: 'indigo' },
                            { name: 'Reflective Vests', count: 120, total: 150, color: 'orange' },
                            { name: 'Gloves (Pairs)', count: 320, total: 500, color: 'blue' },
                            { name: 'Safety Goggles', count: 25, total: 60, color: 'emerald' }, // Reorder needed?
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
                                    <span>{item.name}</span>
                                    <span className="opacity-70">{item.count}/{item.total}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-${item.color}-500 rounded-full`}
                                        style={{ width: `${(item.count / item.total) * 100}%` }}
                                    ></div>
                                </div>
                                {item.count / item.total < 0.5 && (
                                    <div className="text-[10px] text-rose-500 font-bold mt-1">Low Stock - Reorder Soon</div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        Manage Inventory
                    </button>
                </div>
            </div>
        </div>
    );
}

function CheckCircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    )
}
