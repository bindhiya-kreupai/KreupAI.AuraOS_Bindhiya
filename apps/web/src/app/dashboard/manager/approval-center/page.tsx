"use client";

import React, { useState, useEffect } from 'react';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    FileText,
    Calendar,
    ArrowRight,
    Loader2,
    ClipboardCheck,
    Gift,
    Award,
    ArrowLeftRight,
    Receipt,
    Shuffle,
    ArrowRightLeft,
} from 'lucide-react';

interface ApprovalItem {
    requestId: string;
    requestType: string;
    requestTitle: string;
    requestDate: string;
    requestedBy: string;
    requestedByName: string;
    requestedByDepartment: string;
    approvalStatus: string;
    priority: string;
    details: any;
}

interface ApprovalSummary {
    total: number;
    expense: number;
    'employment-history': number;
    'inter-company-transfer': number;
    leave: number;
    overtime: number;
    exit: number;
    attendance: number;
    'comp-off': number;
    confirmation: number;
    'shift-swap': number;
}

export default function ApprovalCenterPage() {
    const [filter, setFilter] = useState('All');
    const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
    const [summary, setSummary] = useState<ApprovalSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [processing, setProcessing] = useState<string | null>(null);

    const filterOptions: Array<{ label: string; key?: keyof ApprovalSummary }> = [
        { label: 'All' },
        { label: 'Expense', key: 'expense' },
        { label: 'Employment History', key: 'employment-history' },
        { label: 'Company Transfer', key: 'inter-company-transfer' },
        { label: 'Leave', key: 'leave' },
        { label: 'Overtime', key: 'overtime' },
        { label: 'Comp-Off', key: 'comp-off' },
        { label: 'Confirmation', key: 'confirmation' },
        { label: 'Shift Swap', key: 'shift-swap' },
        { label: 'Attendance', key: 'attendance' },
        { label: 'Exit', key: 'exit' },
    ];

    useEffect(() => {
        fetchApprovals();
    }, []);

    async function fetchApprovals() {
        try {
            const res = await fetch('/api/manager/approvals');
            if (res.ok) {
                const data = await res.json();
                setApprovals(data.approvals || []);
                setSummary(data.summary || null);
            }
        } catch (err) {
            console.error('Failed to fetch approvals:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleAction(requestId: string, requestType: string, action: 'approve' | 'reject') {
        setProcessing(requestId);
        try {
            const res = await fetch('/api/manager/approvals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, requestType, action }),
            });
            if (res.ok) {
                setApprovals(prev => prev.filter(a => a.requestId !== requestId));
                if (summary) {
                    setSummary({
                        ...summary,
                        total: summary.total - 1,
                        [requestType]: (summary as any)[requestType] - 1,
                    });
                }
            }
        } catch (err) {
            console.error('Failed to process approval:', err);
        } finally {
            setProcessing(null);
        }
    }

    const filteredApprovals = approvals.filter(item => {
        const matchesFilter = filter === 'All' ||
            (filter === 'Expense' && item.requestType === 'expense') ||
            (filter === 'Employment History' && item.requestType === 'employment-history') ||
            (filter === 'Company Transfer' && item.requestType === 'inter-company-transfer') ||
            (filter === 'Leave' && item.requestType === 'leave') ||
            (filter === 'Overtime' && item.requestType === 'overtime') ||
            (filter === 'Comp-Off' && item.requestType === 'comp-off') ||
            (filter === 'Confirmation' && item.requestType === 'confirmation') ||
            (filter === 'Shift Swap' && item.requestType === 'shift-swap') ||
            (filter === 'Attendance' && item.requestType === 'attendance') ||
            (filter === 'Exit' && item.requestType === 'exit');
        const matchesSearch = searchQuery === '' ||
            item.requestedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.requestTitle.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getTypeIcon = (type: string) => {
        if (type === 'expense') return <Receipt className="w-6 h-6" />;
        if (type === 'employment-history') return <Shuffle className="w-6 h-6" />;
        if (type === 'inter-company-transfer') return <ArrowRightLeft className="w-6 h-6" />;
        if (type === 'leave') return <Calendar className="w-6 h-6" />;
        if (type === 'overtime') return <Clock className="w-6 h-6" />;
        if (type === 'comp-off') return <Gift className="w-6 h-6" />;
        if (type === 'confirmation') return <Award className="w-6 h-6" />;
        if (type === 'shift-swap') return <ArrowLeftRight className="w-6 h-6" />;
        if (type === 'attendance') return <ClipboardCheck className="w-6 h-6" />;
        if (type === 'exit') return <FileText className="w-6 h-6" />;
        return <FileText className="w-6 h-6" />;
    };

    const getTypeStyle = (type: string) => {
        if (type === 'expense') return 'bg-pink-50 text-pink-500 dark:bg-pink-900/20';
        if (type === 'employment-history') return 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20';
        if (type === 'inter-company-transfer') return 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20';
        if (type === 'leave') return 'bg-amber-50 text-amber-500 dark:bg-amber-900/20';
        if (type === 'overtime') return 'bg-blue-50 text-blue-500 dark:bg-blue-900/20';
        if (type === 'comp-off') return 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20';
        if (type === 'confirmation') return 'bg-sky-50 text-sky-500 dark:bg-sky-900/20';
        if (type === 'shift-swap') return 'bg-teal-50 text-teal-500 dark:bg-teal-900/20';
        if (type === 'attendance') return 'bg-violet-50 text-violet-500 dark:bg-violet-900/20';
        if (type === 'exit') return 'bg-rose-50 text-rose-500 dark:bg-rose-900/20';
        return 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20';
    };

    const getDetailMeta = (item: ApprovalItem) => {
        if (item.requestType === 'expense') {
            return `${item.details?.currency || ''} ${item.details?.totalAmount || 0}`.trim();
        }
        if (item.requestType === 'employment-history') {
            return item.details?.changeType?.replaceAll('_', ' ') || 'Employment Change';
        }
        if (item.requestType === 'inter-company-transfer') {
            return `${item.details?.fromCompanyName || item.details?.fromCompanyId || ''} → ${item.details?.toCompanyName || item.details?.toCompanyId || ''}`.trim();
        }
        if (item.requestType === 'leave') {
            return `${item.details?.totalDays || 0} Days`;
        }
        if (item.requestType === 'overtime') {
            return `${item.details?.totalHours || 0} Hours`;
        }
        if (item.requestType === 'comp-off') {
            return `${item.details?.creditedDays || 0} Day Credit`;
        }
        if (item.requestType === 'attendance') {
            return item.details?.regularizationType || 'Regularization';
        }
        if (item.requestType === 'confirmation') {
            return item.details?.managerApproval || 'Confirmation';
        }
        if (item.requestType === 'shift-swap') {
            return item.details?.peerApproval || 'Shift Swap';
        }
        if (item.requestType === 'exit') {
            return item.details?.exitType || 'Exit';
        }
        return '';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="ml-2 text-sm text-silver-mist">Loading approvals...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-indigo-500" />
                        Approval Center
                    </h1>
                    <p className="text-slate-500 text-sm">Review and act on pending expense, employment history, company transfer, leave, overtime, attendance, comp-off, confirmation, shift swap, and exit requests from your team.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {summary?.total || 0} Pending
                    </span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex gap-1 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto text-sm">
                    {filterOptions.map(({ label, key }) => (
                        <button
                            key={label}
                            onClick={() => setFilter(label)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${filter === label ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            {label}
                            {key && summary && (
                                <span className="ml-1 text-xs">({summary[key] || 0})</span>
                            )}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search requester or subject..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {filteredApprovals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <CheckCircle2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="text-sm font-medium text-slate-500">No pending approvals</p>
                        <p className="text-xs text-slate-400 mt-1">All requests have been processed</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredApprovals.map((item) => (
                            <div key={item.requestId} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                <div className="flex flex-col md:flex-row md:items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getTypeStyle(item.requestType)}`}>
                                        {getTypeIcon(item.requestType)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-slate-900 dark:text-slate-100 text-lg">{item.requestTitle}</span>
                                                <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">New</span>
                                            </div>
                                            <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(item.requestDate).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-3 text-sm text-slate-500 items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                                    {item.requestedByName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                </div>
                                                <span>{item.requestedByName}</span>
                                            </div>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <div className="font-medium text-slate-700 dark:text-slate-300">{getDetailMeta(item)}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            disabled={processing === item.requestId}
                                            onClick={() => handleAction(item.requestId, item.requestType, 'approve')}
                                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm shadow-emerald-200 dark:shadow-none transition-all flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {processing === item.requestId ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve
                                        </button>
                                        <button
                                            disabled={processing === item.requestId}
                                            onClick={() => handleAction(item.requestId, item.requestType, 'reject')}
                                            className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 rounded-lg text-sm font-bold text-slate-500 transition-all flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <XCircle className="w-4 h-4" /> Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="text-sm text-slate-500">
                        Showing <span className="font-bold">{filteredApprovals.length}</span> requests
                    </div>
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        View All History <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

