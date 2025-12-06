"use client";

import React from 'react';
import {
    Ticket,
    Filter,
    MoreHorizontal,
    User,
    CheckCircle2
} from 'lucide-react';

export default function TicketManagementPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Ticket className="w-6 h-6 text-indigo-500" />
                        Ticket Management
                    </h1>
                    <p className="text-slate-500 text-sm">Centralized dashboard for all incoming HR support requests.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center gap-2 text-sm font-bold">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                        Create Ticket
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Ticket ID</th>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Requester</th>
                            <th className="px-6 py-4">Priority</th>
                            <th className="px-6 py-4">Assigned To</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                            { id: 'HR-2034', subject: 'Payroll Discrepancy (March)', req: 'Alice Johnson', priority: 'High', agent: 'Mike Smith', status: 'Open' },
                            { id: 'HR-2035', subject: 'Laptop Upgrade Request', req: 'Bob Williams', priority: 'Medium', agent: 'Unassigned', status: 'New' },
                            { id: 'HR-2036', subject: 'Incorrect Leave Balance', req: 'Charlie Brown', priority: 'Low', agent: 'Sarah Connor', status: 'Resolved' },
                            { id: 'HR-2037', subject: 'Visa Renewal Inquiry', req: 'David Lee', priority: 'High', agent: 'Mike Smith', status: 'In Progress' },
                        ].map((ticket, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">{ticket.id}</td>
                                <td className="px-6 py-4 font-bold">{ticket.subject}</td>
                                <td className="px-6 py-4 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                                        {ticket.req[0]}
                                    </div>
                                    {ticket.req}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${ticket.priority === 'High' ? 'bg-rose-100 text-rose-600' :
                                            ticket.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-emarald-100 text-emerald-600'
                                        }`}>
                                        {ticket.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{ticket.agent}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-600' :
                                            ticket.status === 'Open' ? 'bg-indigo-100 text-indigo-600' :
                                                ticket.status === 'In Progress' ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {ticket.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
