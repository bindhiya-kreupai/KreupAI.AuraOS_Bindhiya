"use client";

import React, { useState, useEffect } from 'react';
import { Banknote, Plus, Clock, CheckCircle } from 'lucide-react';
import { TravelRequestService } from '../services';

const ADVANCES = [
    { id: 1, trip: 'London Client Visit', amount: '$500.00', date: 'Nov 10, 2024', status: 'Approved', type: 'Cash' },
    { id: 2, trip: 'Singapore Conference', amount: '$1,000.00', date: 'Dec 01, 2024', status: 'Pending', type: 'Forex Card' },
];

export default function AdvanceRequestPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const requests = await TravelRequestService.getRequests({ status: 'approved' });
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
                        <Banknote className="w-8 h-8 text-indigo-500" />
                        Advance Request
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Request cash or forex cards for upcoming travel.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                    <Plus className="w-5 h-5" /> New Request
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm h-fit">
                    <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-slate-100">Quick Request</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select Trip</label>
                            <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm">
                                <option>Select approved trip...</option>
                                <option>Dubai Sales Kickoff (Jan 10-14)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Amount Required</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm" placeholder="e.g. $500" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Payment Mode</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="radio" name="mode" className="text-indigo-600 focus:ring-indigo-500" /> Cash
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="radio" name="mode" className="text-indigo-600 focus:ring-indigo-500" /> Forex Card
                                </label>
                            </div>
                        </div>
                        <button className="w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold mt-2">
                            Submit Request
                        </button>
                    </div>
                </div>

                {/* History */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Recent Advances</h3>
                    <div className="space-y-4">
                        {ADVANCES.map((adv) => (
                            <div key={adv.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl flex items-center justify-center text-indigo-600">
                                        <Banknote className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-slate-100">{adv.trip}</div>
                                        <div className="text-sm text-slate-500">{adv.date} • {adv.type}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{adv.amount}</div>
                                    <div className={`flex items-center justify-end gap-1 text-xs font-bold mt-1 ${adv.status === 'Approved' ? 'text-emerald-500' : 'text-amber-500'
                                        }`}>
                                        {adv.status === 'Approved' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                        {adv.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
