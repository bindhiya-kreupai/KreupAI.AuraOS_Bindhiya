"use client";

import React, { useState } from 'react';
import {
    Ticket,
    Plus,
    Filter,
    MessageSquare,
    Clock,
    CheckCircle2,
    Search
} from 'lucide-react';

export default function RequestCenterPage() {
    const tickets = [
        { id: 'TIC-1024', subject: 'Laptop battery issue', category: 'IT Support', status: 'In Progress', date: 'Dec 05', priority: 'High' },
        { id: 'TIC-1023', subject: 'Access to Jira', category: 'Access Rights', status: 'Resolved', date: 'Dec 03', priority: 'Medium' },
        { id: 'TIC-1021', subject: 'Payslip discrepancy', category: 'Payroll', status: 'Pending', date: 'Nov 28', priority: 'High' },
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Ticket className="w-6 h-6 text-indigo-500" />
                        Request Center
                    </h1>
                    <p className="text-slate-500 text-sm">Raise tickets for IT, HR, or Facility related issues.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create New Ticket
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filters */}
                <div className="space-y-2">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                            <Filter className="w-4 h-4" /> Filter By
                        </h3>
                        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" /> Open Tickets
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" /> Resolved
                            </label>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" /> IT Support
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" /> HR Queries
                            </label>
                        </div>
                    </div>
                </div>

                {/* Ticket List */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Search Bar */}
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input type="text" placeholder="Search tickets by ID or subject..." className="bg-transparent outline-none w-full text-sm" />
                    </div>

                    {tickets.map((ticket, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">{ticket.id}</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ticket.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                                        }`}>{ticket.priority}</span>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                                        ticket.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {ticket.status === 'Resolved' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                    {ticket.status}
                                </span>
                            </div>

                            <h3 className="font-bold text-lg mb-1 group-hover:text-indigo-600 transition-colors">{ticket.subject}</h3>
                            <div className="text-sm text-slate-500 mb-4">{ticket.category} • Raised on {ticket.date}</div>

                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">
                                <MessageSquare className="w-3 h-3" /> View Description & Comments
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
