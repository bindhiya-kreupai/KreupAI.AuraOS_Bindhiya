"use client";

import React, { useState } from 'react';
import {
    Inbox,
    Plus,
    MessageCircle
} from 'lucide-react';

export default function MyTicketsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Inbox className="w-6 h-6 text-indigo-500" />
                        My Tickets
                    </h1>
                    <p className="text-slate-500 text-sm">Track and manage your HR support requests.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Open New Ticket
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { id: 'HR-2034', subject: 'Payroll Discrepancy', text: 'My salary slip for March shows incorrect tax deduction...', status: 'Open', date: '2 days ago' },
                    { id: 'HR-1920', subject: 'Insurance Card', text: 'Where can I download my digital insurance card?', status: 'Resolved', date: 'Last week' },
                ].map((ticket, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-mono font-bold text-slate-400">#{ticket.id}</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
                                }`}>{ticket.status}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2">{ticket.subject}</h3>
                        <p className="text-sm text-slate-500 mb-6 line-clamp-2">{ticket.text}</p>

                        <div className="flex justify-between items-center text-xs text-slate-400 font-bold border-t border-slate-100 dark:border-slate-800 pt-4">
                            <span>{ticket.date}</span>
                            <div className="flex items-center gap-1 hover:text-indigo-500">
                                <MessageCircle className="w-4 h-4" /> 2 Responses
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State / Add New Placeholder */}
                <button className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-500 transition-colors">
                    <Plus className="w-12 h-12 mb-2" />
                    <span className="font-bold text-sm">Create New Ticket</span>
                </button>
            </div>
        </div>
    );
}
