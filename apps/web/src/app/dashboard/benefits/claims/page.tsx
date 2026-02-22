"use client";

import React, { useState, useEffect } from 'react';
import {
    FileText,
    TrendingUp,
    Plus,
    Filter,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { ClaimService } from '../services';

export default function ClaimsPage() {
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const response = await ClaimService.getClaims();
            const data = response?.data || response || [];
            setClaims(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching claims:', error);
            setClaims([]);
        } finally {
            setLoading(false);
        }
    };

    const getClaimId = (claim: any) => claim.claimNumber || claim.id || 'N/A';
    const getDate = (claim: any) => {
        const d = claim.date || claim.claimDate || claim.serviceDate;
        if (!d) return 'N/A';
        return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    const getProvider = (claim: any) => claim.provider || claim.providerName || 'Unknown';
    const getAmount = (claim: any) => {
        const amt = claim.amount || claim.claimAmount;
        if (typeof amt === 'number') return `$${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        if (typeof amt === 'string' && amt.startsWith('$')) return amt;
        return amt ? `$${amt}` : '$0.00';
    };
    const getStatus = (claim: any) => {
        const s = claim.status || 'Pending';
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase().replace(/_/g, ' ');
    };
    const getType = (claim: any) => {
        const t = claim.type || claim.claimType || 'Other';
        return t.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    };

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-500" />
                        Claims History
                    </h1>
                    <p className="text-slate-500 text-sm">Track reimbursements and direct provider billings.</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-indigo-600">
                        <Filter className="w-5 h-5" />
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                        <Plus className="w-4 h-4" /> Submit Claim
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 container mx-auto">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-sm bg-slate-50 dark:bg-slate-900/50">
                        Recent Claims
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                            </div>
                        ) : claims.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <FileText className="w-12 h-12 text-slate-300 mb-4" />
                                <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">No Claims Found</h3>
                                <p className="text-sm text-slate-500 max-w-sm mt-1">Submit a new claim to track your reimbursements.</p>
                            </div>
                        ) : claims.map((claim, i) => {
                            const type = getType(claim);
                            const status = getStatus(claim);
                            return (
                                <div key={claim.id || i} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer group transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold
                                            ${type.includes('Health') || type.includes('Medical') ? 'bg-rose-50 text-rose-500' :
                                                type.includes('Dental') ? 'bg-indigo-50 text-indigo-500' :
                                                    'bg-emerald-50 text-emerald-500'}`}>
                                            {type.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200">{getProvider(claim)}</h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <span>{getDate(claim)}</span>
                                                <span>&#8226;</span>
                                                <span>{getClaimId(claim)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold">{getAmount(claim)}</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase min-w-[80px] text-center
                                            ${status === 'Approved' || status === 'Paid' ? 'bg-emerald-100 text-emerald-600' :
                                                status === 'Rejected' || status === 'Denied' ? 'bg-rose-100 text-rose-600' :
                                                    'bg-amber-100 text-amber-600'}`}>
                                            {status}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-sm mb-4 text-slate-500 uppercase tracking-wider">Utilization Stats</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold">Deductible Met</span>
                                    <span>{claims.length > 0 ? 'In Progress' : 'N/A'}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 w-[0%] h-full rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm text-indigo-500 mb-3">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-700 dark:text-slate-300">Claims Summary</h3>
                        <div className="text-3xl font-bold text-indigo-600 my-1">{claims.length}</div>
                        <p className="text-xs text-slate-400">Total claims submitted</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

