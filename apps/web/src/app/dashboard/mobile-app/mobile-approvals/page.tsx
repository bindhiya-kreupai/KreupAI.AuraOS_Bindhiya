"use client";

import React, { useState, useEffect } from 'react';
import {
    CheckSquare,
    ThumbsUp,
    ThumbsDown,
    Clock,
    FileText,
    Plane,
    CreditCard,
    CalendarOff,
    User,
    ArrowRight
} from 'lucide-react';
import { MobileApprovalsService } from '../services';

export default function MobileApprovalsPage() {
    const [approvals, setApprovals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await MobileApprovalsService.getAllApprovals();
            if (result.length > 0) {
                setApprovals(result);
            }
        } catch {
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CheckSquare className="w-6 h-6 text-indigo-500" />
                        Mobile Approvals
                    </h1>
                    <p className="text-slate-500 text-sm">Review & act on requests submitted via mobile app.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                    14 Pending Requests
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Card Stack / List */}
                <div className="lg:col-span-2 space-y-4">
                    {[
                        { type: 'Leave', user: 'Emma Stone', detail: 'Sick Leave • 2 Days', sub: 'Mar 18 - Mar 19', icon: CalendarOff, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                        { type: 'Expense', user: 'Ryan Gosling', detail: 'Client Dinner • $124.50', sub: 'Project Alpha', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                        { type: 'Travel', user: 'Margot Robbie', detail: 'Flight to London', sub: 'Apr 05 - Apr 12', icon: Plane, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20' },
                        { type: 'Document', user: 'Cillian Murphy', detail: 'Tax Declaration', sub: 'Pending Review', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    ].map((req, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${req.bg}`}>
                                        <req.icon className={`w-6 h-6 ${req.color}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-lg text-slate-900 dark:text-slate-100">{req.type} Request</span>
                                            <span className="text-xs font-normal text-slate-400">• 2h ago</span>
                                        </div>
                                        <div className="text-slate-600 dark:text-slate-300 font-medium mb-0.5">{req.detail}</div>
                                        <div className="text-xs text-slate-400 flex items-center gap-1">
                                            <User className="w-3 h-3" /> {req.user} • {req.sub}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors">
                                        <ThumbsDown className="w-5 h-5" />
                                    </button>
                                    <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center transition-colors">
                                        <ThumbsUp className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button className="w-full py-3 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Load More Requests</button>
                </div>

                {/* Summary Panel */}
                <div className="space-y-6">
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-4">Approval Velocity</h3>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-bold">4.2h</span>
                                <span className="text-sm text-indigo-200 mb-1.5">avg. time</span>
                            </div>
                            <p className="text-xs text-indigo-200 mb-6">You&apos;re 15% faster than last week. Keep it up!</p>

                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-medium">
                                    <span>Approvals</span>
                                    <span>86%</span>
                                </div>
                                <div className="w-full bg-indigo-900/30 rounded-full h-1.5">
                                    <div className="bg-white h-full rounded-full w-[86%]"></div>
                                </div>
                                <div className="flex justify-between text-xs font-medium mt-2">
                                    <span>Rejections</span>
                                    <span>14%</span>
                                </div>
                                <div className="w-full bg-indigo-900/30 rounded-full h-1.5">
                                    <div className="bg-white/50 h-full rounded-full w-[14%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold mb-4">Pending by Category</h3>
                        <div className="space-y-4">
                            {[
                                { cat: 'Expense Claims', count: 8, color: 'bg-emerald-500' },
                                { cat: 'Leave Requests', count: 4, color: 'bg-rose-500' },
                                { cat: 'Travel', count: 2, color: 'bg-sky-500' },
                            ].map((c, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${c.color}`}></div>
                                        <span className="text-slate-600 dark:text-slate-300">{c.cat}</span>
                                    </div>
                                    <span className="font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-400">{c.count}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <span>View All Categories</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
