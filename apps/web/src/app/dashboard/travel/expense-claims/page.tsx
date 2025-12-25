"use client";

import React, { useState, useEffect } from 'react';
import { Receipt, UploadCloud, DollarSign, Calendar, MoreVertical, Plus } from 'lucide-react';
import { TravelRequestService } from '../services';

const CLAIMS = [
    { id: 1, title: 'San Francisco Trip Expenses', date: 'Oct 30, 2024', amount: '$450.25', status: 'Submitted', items: 5 },
    { id: 2, title: 'Client Dinner - London', date: 'Nov 14, 2024', amount: '$185.00', status: 'Approved', items: 1 },
    { id: 3, title: 'Office Supplies', date: 'Sep 21, 2024', amount: '$45.99', status: 'Paid', items: 2 },
];

export default function ExpenseClaimsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const requests = await TravelRequestService.getRequests();
            setData(requests);
        } catch {
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <Receipt className="w-8 h-8 text-indigo-500" />
                        Expense Claims
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Track reimbursements and upload receipts.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                    <Plus className="w-5 h-5" /> New Claim
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Area */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer group h-full min-h-[300px]">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                            <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Drop Receipts Here</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Drag & drop PDF, JPG, or PNG files to instantly create a draft claim.
                        </p>
                        <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            Browse Files
                        </button>
                    </div>
                </div>

                {/* Claims List */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100">Recent Claims</h3>
                    <div className="space-y-4">
                        {CLAIMS.map((claim) => (
                            <div key={claim.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">{claim.title}</h4>
                                            <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {claim.date}</span>
                                                <span>•</span>
                                                <span>{claim.items} Receipts</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{claim.amount}</div>
                                        <div className={`text-xs font-bold mt-1 ${claim.status === 'Approved' || claim.status === 'Paid' ? 'text-emerald-500' : 'text-indigo-500'
                                            }`}>{claim.status}</div>
                                    </div>
                                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
