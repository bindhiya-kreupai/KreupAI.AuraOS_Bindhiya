"use client";

import React, { useState, useEffect } from 'react';
import {
    Receipt,
    Check,
    X,
    Clock,
    Paperclip,
    Loader2
} from 'lucide-react';
import { ReimbursementService } from '@/app/dashboard/payroll/services';
import type { ReimbursementClaim } from '@/app/dashboard/payroll/types';

export default function ReimbursementsPage() {
    const [claims, setClaims] = useState<ReimbursementClaim[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'submitted' | 'approved' | 'rejected'>('submitted');

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const result = await ReimbursementService.getClaims();
            setClaims(result);
        } catch (error) {
            console.error('Error fetching claims:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await ReimbursementService.updateClaimStatus(id, 'approved');
            fetchClaims();
        } catch (error) {
            console.error('Error approving claim:', error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await ReimbursementService.updateClaimStatus(id, 'rejected');
            fetchClaims();
        } catch (error) {
            console.error('Error rejecting claim:', error);
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

    const filteredClaims = claims.filter(c => c.status === activeTab || (activeTab === 'submitted' && (c.status === 'submitted' || c.status === 'under_review')));
    const pendingCount = claims.filter(c => c.status === 'submitted' || c.status === 'under_review').length;

    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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
            <div className="flex gap-3 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('submitted')}
                    className={`pb-3 px-2 text-sm transition-colors ${activeTab === 'submitted' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600' : 'text-slate-500 font-medium hover:text-slate-700'}`}
                >
                    Pending Approval ({pendingCount})
                </button>
                <button
                    onClick={() => setActiveTab('approved')}
                    className={`pb-3 px-2 text-sm transition-colors ${activeTab === 'approved' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600' : 'text-slate-500 font-medium hover:text-slate-700'}`}
                >
                    Approved
                </button>
                <button
                    onClick={() => setActiveTab('rejected')}
                    className={`pb-3 px-2 text-sm transition-colors ${activeTab === 'rejected' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600' : 'text-slate-500 font-medium hover:text-slate-700'}`}
                >
                    Rejected
                </button>
            </div>

            {/* Claims List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        <p className="text-sm text-slate-500 font-medium">Loading claims...</p>
                    </div>
                </div>
            ) : filteredClaims.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                    <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No Claims Found</h3>
                    <p className="text-sm text-slate-500 mt-1">No reimbursement claims in this category.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredClaims.map((claim) => (
                        <div key={claim.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">{claim.category} - ${claim.amount.toLocaleString()}</h4>
                                    <p className="text-sm text-slate-500">{claim.description}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                        <span className="font-medium text-slate-600 dark:text-slate-300">{claim.employeeName}</span>
                                        <span>-</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {getTimeAgo(claim.claimDate)}</span>
                                        <span>-</span>
                                        <span className="flex items-center gap-1 text-indigo-600 cursor-pointer hover:underline"><Paperclip className="w-3 h-3" /> View Receipt</span>
                                    </div>
                                </div>
                            </div>
                            {activeTab === 'submitted' && (
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
            )}
        </div>
    );
}

