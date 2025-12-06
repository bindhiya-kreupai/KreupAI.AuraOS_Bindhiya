"use client";

import React, { useState } from 'react';
import {
    Users,
    ArrowRightLeft,
    Search
} from 'lucide-react';

export default function AgentAssignmentPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ArrowRightLeft className="w-6 h-6 text-indigo-500" />
                        Agent Assignment
                    </h1>
                    <p className="text-slate-500 text-sm">Route tickets to the appropriate HR specialists.</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search unassigned tickets..."
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                {/* Unassigned Tickets */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
                        Unassigned Queue (5)
                    </div>
                    <div className="p-4 space-y-3 overflow-y-auto flex-1 h-96">
                        {[
                            { id: 'HR-2040', subject: 'Tax Declaration Help', queue: 'Payroll' },
                            { id: 'HR-2041', subject: 'Harassment Complaint', queue: 'Relations' },
                            { id: 'HR-2042', subject: 'Gym Reimbursement', queue: 'Benefits' },
                        ].map((t, i) => (
                            <div key={i} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md cursor-grab active:cursor-grabbing bg-white dark:bg-slate-900">
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-mono font-bold text-slate-400">#{t.id}</span>
                                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{t.queue}</span>
                                </div>
                                <h4 className="font-bold text-sm">{t.subject}</h4>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Agents */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
                        Available Agents
                    </div>
                    <div className="p-4 space-y-4 overflow-y-auto flex-1 h-96">
                        {[
                            { name: 'Mike Smith', role: 'Payroll Specialist', load: 85, color: 'bg-rose-500' },
                            { name: 'Sarah Connor', role: 'Generalist', load: 45, color: 'bg-emerald-500' },
                            { name: 'John Doe', role: 'Benefits Manager', load: 60, color: 'bg-amber-500' },
                        ].map((agent, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold">
                                    {agent.name[0]}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm">{agent.name}</h4>
                                    <div className="text-xs text-slate-500">{agent.role}</div>
                                </div>
                                <div className="w-24">
                                    <div className="text-xs text-right mb-1 text-slate-500">{agent.load}% Load</div>
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${agent.color}`} style={{ width: `${agent.load}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
