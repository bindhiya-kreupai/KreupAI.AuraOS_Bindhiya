"use client";

import React, { useState, useEffect } from 'react';
import {
    Receipt,
    Check,
    X,
    Clock,
    Paperclip,
    Filter
} from 'lucide-react';
import { ReimbursementService } from '../services';

interface Reimbursement {
    id: string;
    employeeId: string;
    employeeName: string;
    type: string;
    amount: number;
    description: string;
    date: string;
    status: string;
    createdAt: string;
}

export default function ReimbursementsPage() {
    const [claims, setClaims] = useState<Reimbursement[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

    useEffect(() => {
        fetchClaims();
    }, [activeTab]);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const result = await ReimbursementService.getClaims();
            if (result.length > 0) {
                setClaims(result);
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await ReimbursementService.updateClaimStatus(id, 'APPROVED');
            fetchClaims();
        } catch (error) {
            console.error('Error:', error);
                    }
    };

    const handleReject = async (id: string) => {
        try {
            await ReimbursementService.updateClaimStatus(id, 'REJECTED');
            fetchClaims();
        } catch (error) {
            console.error('Error:', error);
                    }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffDays > 0) return `${diffDays} days ago`;
        if (diffHours > 0) return `${diffHours} hours ago`;
        return 'Just now';
    };

    const pendingCount = claims.filter(c => c.status === 'PENDING').length;

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Receipt className="w-6 h-6 text-indigo-500" />
                        Reimbursements
                    </h1>
                    <p className="text-slate-500 text-sm">Approve and process employee expense claims.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                        Submit Claim
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('PENDING')}
                    className={`pb-3 px-2 text-sm transition-colors ${activeTab === 'PENDING' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600' : 'text-slate-500 font-medium hover:text-slate-700'}`}
                >
                    Pending Approval ({pendingCount})
                </button>
                <button
                    onClick={() => setActiveTab('APPROVED')}
                    className={`pb-3 px-2 text-sm transition-colors ${activeTab === 'APPROVED' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600' : 'text-slate-500 font-medium hover:text-slate-700'}`}
                >
                    Approved
                </button>
                <button
                    onClick={() => setActiveTab('REJECTED')}
                    className={`pb-3 px-2 text-sm transition-colors ${activeTab === 'REJECTED' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600' : 'text-slate-500 font-medium hover:text-slate-700'}`}
                >
                    Rejected
                </button>
            </div>

            {/* Claims List */}
            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : (
                <div className="space-y-4">
                    {claims.map((claim) => (
                        <div key={claim.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">{claim.type} - ${claim.amount}</h4>
                                    <p className="text-sm text-slate-500">{claim.description}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                        <span className="font-medium text-slate-600 dark:text-slate-300">{claim.employeeName}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {getTimeAgo(claim.date)}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 text-indigo-600 cursor-pointer hover:underline"><Paperclip className="w-3 h-3" /> View Receipt</span>
                                    </div>
                                </div>
                            </div>
                            {activeTab === 'PENDING' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleReject(claim.id)}
                                        className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm font-bold border border-rose-100 hover:bg-rose-100 transition-colors flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(claim.id)}
                                        className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center gap-2"
                                    >
                                        <Check className="w-4 h-4" /> Approve
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
}
