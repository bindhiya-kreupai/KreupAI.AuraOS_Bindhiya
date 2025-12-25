"use client";

import React, { useState, useEffect } from 'react';
import {
    FileText,
    TrendingUp,
    Plus,
    Filter,
    ChevronRight
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
            const data = await ClaimService.getClaims({ employeeId: 'EMP-001' });
            if (data.length === 0) {
                setClaims(mockClaims);
            } else {
                setClaims(data);
            }
        } catch (error) {
            console.error('Error fetching claims:', error);
            setClaims(mockClaims);
        } finally {
            setLoading(false);
        }
    };

    const mockClaims = [
        { id: 'CLM-001', date: 'Oct 24, 2024', provider: 'City Hospital', amount: '$150.00', status: 'Approved', type: 'Medical' },
        { id: 'CLM-002', date: 'Oct 10, 2024', provider: 'LensCrafters', amount: '$220.00', status: 'Pending', type: 'Vision' },
        { id: 'CLM-003', date: 'Sep 15, 2024', provider: 'Delta Dental', amount: '$850.00', status: 'Approved', type: 'Dental' },
        { id: 'CLM-004', date: 'Aug 01, 2024', provider: 'Walgreens Pharmacy', amount: '$45.00', status: 'Rejected', type: 'Rx' },
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 container mx-auto">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-sm bg-slate-50 dark:bg-slate-900/50">
                        Recent Claims
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : claims.map((claim, i) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer group transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold
                                        ${claim.type === 'Medical' ? 'bg-rose-50 text-rose-500' :
                                            claim.type === 'Dental' ? 'bg-indigo-50 text-indigo-500' :
                                                'bg-emerald-50 text-emerald-500'}`}>
                                        {claim.type.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{claim.provider}</h4>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <span>{claim.date}</span>
                                            <span>•</span>
                                            <span>{claim.id}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <span className="font-mono font-bold">{claim.amount}</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase min-w-[80px] text-center
                                        ${claim.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
                                            claim.status === 'Rejected' ? 'bg-rose-100 text-rose-600' :
                                                'bg-amber-100 text-amber-600'}`}>
                                        {claim.status}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-sm mb-4 text-slate-500 uppercase tracking-wider">Utilization Stats</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold">Deductible Met</span>
                                    <span>$1,200 / $1,500</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 w-[80%] h-full rounded-full"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold">Dental Max</span>
                                    <span>$850 / $2,000</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 w-[42%] h-full rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm text-indigo-500 mb-3">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-700 dark:text-slate-300">HSA Balance</h3>
                        <div className="text-3xl font-bold text-indigo-600 my-1">$3,450.00</div>
                        <p className="text-xs text-slate-400">Available to spend</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
