"use client";

import React, { useState, useEffect } from 'react';
import {
    Ticket,
    Filter,
    MoreHorizontal,
    Loader2
} from 'lucide-react';
import { TicketManagementService } from '../services';
import type { Ticket as TicketType } from '../types';

export default function TicketManagementPage() {
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await TicketManagementService.getAllTickets();
                setTickets(data);
            } catch {
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

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
                        {tickets.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                    No tickets found. Create a new ticket to get started.
                                </td>
                            </tr>
                        ) : (
                            tickets.map((ticket, i) => (
                                <tr key={ticket.ticketId || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">{ticket.ticketNumber}</td>
                                    <td className="px-6 py-4 font-bold">{ticket.subject}</td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                                            {ticket.requester?.employeeName?.[0] || '?'}
                                        </div>
                                        {ticket.requester?.employeeName || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${ticket.priority === 'high' || ticket.priority === 'critical' ? 'bg-rose-100 text-rose-600' :
                                                ticket.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{ticket.assignedAgent?.agentName || 'Unassigned'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${ticket.status === 'resolved' || ticket.status === 'closed' ? 'bg-emerald-100 text-emerald-600' :
                                                ticket.status === 'open' ? 'bg-indigo-100 text-indigo-600' :
                                                    ticket.status === 'pending' ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-600'
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
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
