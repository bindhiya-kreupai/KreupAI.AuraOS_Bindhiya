"use client";

import React, { useState, useEffect } from 'react';
import { Banknote, Plus, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { TravelRequestService } from '../services';

export default function AdvanceRequestPage() {
    const [advances, setAdvances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const requests = await TravelRequestService.getRequests({ status: 'approved' });
            setAdvances(Array.isArray(requests) ? requests : []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="ml-2 text-sm text-slate-500">Loading advance requests...</span>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm h-fit">
                    <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-slate-100">Quick Request</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select Trip</label>
                            <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm">
                                <option>Select approved trip...</option>
                                {advances.map((adv: any) => (
                                    <option key={adv.id} value={adv.id}>{adv.destination || adv.title || 'Trip'} ({new Date(adv.departureDate || adv.createdAt).toLocaleDateString()})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Amount Required</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm" placeholder="e.g. $500" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Payment Mode</label>
                            <div className="flex gap-3">
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

                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Recent Advances</h3>
                    {advances.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Banknote className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No advance requests found</p>
                            <p className="text-sm mt-1">Submit a request for your next approved trip.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {advances.map((adv: any) => (
                                <div key={adv.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl flex items-center justify-center text-indigo-600">
                                            <Banknote className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-slate-100">{adv.destination || adv.title || 'Travel Advance'}</div>
                                            <div className="text-sm text-slate-500">{new Date(adv.createdAt).toLocaleDateString()} {adv.currency || 'USD'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">${adv.estimatedCost || adv.amount || 0}</div>
                                        <div className={`flex items-center justify-end gap-1 text-xs font-bold mt-1 ${adv.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {adv.status === 'approved' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {adv.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

