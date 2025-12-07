"use client";

import React, { useState } from 'react';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Filter,
    Search,
    FileText,
    Calendar,
    DollarSign,
    MoreHorizontal,
    ArrowRight
} from 'lucide-react';

export default function ApprovalCenterPage() {
    const [filter, setFilter] = useState('All');

    const approvals = [
        { id: 1, type: 'Leave Request', user: 'David Kim', avatar: 'DK', subject: 'Sick Leave (2 Days)', date: 'Today, 9:30 AM', status: 'Pending', meta: 'Oct 24 - Oct 25' },
        { id: 2, type: 'Expense Claim', user: 'Sarah Jenkins', avatar: 'SJ', subject: 'Client Lunch with Acme Corp', date: 'Yesterday, 2:15 PM', status: 'Pending', meta: '$45.00' },
        { id: 3, type: 'Timesheet', user: 'Mike Chen', avatar: 'MC', subject: 'Week 42 Timesheet', date: 'Yesterday, 10:00 AM', status: 'Pending', meta: '40 Hours' },
        { id: 4, type: 'Training Request', user: 'Jessica Wu', avatar: 'JW', subject: 'Advanced React Pattern Course', date: 'Oct 20', status: 'Pending', meta: '$150.00' },
        { id: 5, type: 'Leave Request', user: 'Alex Thompson', avatar: 'AT', subject: 'Annual Leave', date: 'Oct 19', status: 'Approved', meta: 'Dec 20 - Jan 05' },
    ];

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-indigo-500" />
                        Approval Center
                    </h1>
                    <p className="text-slate-500 text-sm">Review and act on pending requests from your team.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 4 Pending
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex gap-1 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto text-sm">
                    {['All', 'Leave', 'Expenses', 'Timesheets', 'Training'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${filter === f ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search requester or subject..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* Approvals List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {approvals.map((item) => (
                        <div key={item.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                {/* Type Icon */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 
                                    ${item.type === 'Leave Request' ? 'bg-amber-50 text-amber-500 dark:bg-amber-900/20' :
                                        item.type === 'Expense Claim' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20' :
                                            item.type === 'Timesheet' ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/20' :
                                                'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20'}`}>
                                    {item.type === 'Leave Request' && <Calendar className="w-6 h-6" />}
                                    {item.type === 'Expense Claim' && <DollarSign className="w-6 h-6" />}
                                    {item.type === 'Timesheet' && <Clock className="w-6 h-6" />}
                                    {item.type === 'Training Request' && <FileText className="w-6 h-6" />}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-slate-900 dark:text-slate-100 text-lg">{item.subject}</span>
                                            {item.status === 'Pending' && <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">New</span>}
                                        </div>
                                        <span className="text-xs text-slate-400 whitespace-nowrap">{item.date}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                                {item.avatar}
                                            </div>
                                            <span>{item.user}</span>
                                        </div>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <div className="font-medium text-slate-700 dark:text-slate-300">{item.meta}</div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className={`flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity ${item.status === 'Approved' ? 'hidden' : ''}`}>
                                    <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm shadow-emerald-200 dark:shadow-none transition-all flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Approve
                                    </button>
                                    <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 rounded-lg text-sm font-bold text-slate-500 transition-all flex items-center gap-2">
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bulk Actions Footer */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="text-sm text-slate-500">
                        Showing <span className="font-bold">5</span> requests
                    </div>
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        View All History <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
