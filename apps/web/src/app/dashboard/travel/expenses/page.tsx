"use client";

import React, { useState, useEffect } from 'react';
import {
    Receipt,
    ScanLine,
    Plus,
    Wallet,
    CheckCircle,
    AlertCircle,
    Camera
} from 'lucide-react';
import { TravelRequestService } from '../services';

export default function ExpensesPage() {
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
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-emerald-500" />
                        Expenses & Claims
                    </h1>
                    <p className="text-slate-500 text-sm">Submit receipts, track reimbursements, and manage corporate cards.</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100 dark:border-emerald-800/30">
                    <CheckCircle className="w-4 h-4" /> $1,250 Reimbursed YTD
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Reports List */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">Recent Reports</h3>
                    {[
                        { title: 'London Trip - Dec 2025', date: 'Dec 16, 2025', total: '£450.00', status: 'Processing', items: 8 },
                        { title: 'Client Dinner - Oct 2025', date: 'Oct 25, 2025', total: '$180.50', status: 'Paid', items: 1 },
                        { title: 'Office Supplies', date: 'Oct 10, 2025', total: '$45.00', status: 'Rejected', items: 2 },
                    ].map((r, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                                    <Receipt className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{r.title}</h4>
                                    <div className="text-xs text-slate-500 font-bold">{r.date} • {r.items} Items</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{r.total}</div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded inline-block mt-1
                                    ${r.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : r.status === 'Rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}
                                `}>
                                    {r.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Expense / OCR */}
                <div className="space-y-6">
                    <div className="bg-indigo-600 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden group">
                        {/* Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>

                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2 relative z-10">
                            <ScanLine className="w-5 h-5 text-indigo-200" /> Smart Scan
                        </h3>
                        <p className="text-xs text-indigo-100 mb-6 relative z-10">
                            Upload a receipt image. Our AI will auto-extract date, merchant, and amount.
                        </p>

                        <div className="border-2 border-dashed border-indigo-400 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-500/50 transition-colors relative z-10">
                            <Camera className="w-8 h-8 text-indigo-200 mb-2" />
                            <div className="text-sm font-bold">Snap Receipt</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-sm mb-4">Quick Add</h3>
                        <div className="space-y-3">
                            <input type="text" placeholder="Merchant (e.g. Starbucks)" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold" />
                            <div className="flex gap-2">
                                <input type="date" className="w-1/2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-xs font-bold" />
                                <input type="number" placeholder="0.00" className="w-1/2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold" />
                            </div>
                            <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold">
                                <option>Meals & Entertainment</option>
                                <option>Travel - Taxi</option>
                                <option>Office Supplies</option>
                            </select>
                            <button className="w-full py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-200 flex items-center justify-center gap-1">
                                <Plus className="w-4 h-4" /> Add Line Item
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
