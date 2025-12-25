"use client";

import React, { useState, useEffect } from 'react';
import { Gauge, Plus, MapPin, Car } from 'lucide-react';
import { TravelRequestService } from '../services';

const LOGS = [
    { id: 1, date: 'Oct 28', from: 'Office', to: 'Client Site A', dist: '12 mi', amount: '$7.80', vehicle: 'Personal Car' },
    { id: 2, date: 'Oct 29', from: 'Client Site A', to: 'Warehouse', dist: '24 mi', amount: '$15.60', vehicle: 'Personal Car' },
    { id: 3, date: 'Oct 30', from: 'Warehouse', to: 'Office', dist: '18 mi', amount: '$11.70', vehicle: 'Company Van' },
];

export default function MileageTrackingPage() {
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
                        <Gauge className="w-8 h-8 text-indigo-500" />
                        Mileage Tracking
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Log vehicle mileage for reimbursement.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                    <Plus className="w-5 h-5" /> Add Log
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats */}
                <div className="col-span-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-6 opacity-80">
                        <Car className="w-6 h-6" />
                        <span className="font-bold text-sm uppercase tracking-wider">Current Rate</span>
                    </div>
                    <div className="text-5xl font-bold mb-2">$0.65</div>
                    <div className="text-indigo-100 text-sm font-medium">per mile</div>

                    <div className="mt-8 pt-8 border-t border-white/20">
                        <div className="text-3xl font-bold mb-1">2,450 mi</div>
                        <div className="text-indigo-100 text-sm">YTD Distance Logged</div>
                    </div>
                </div>

                {/* Table */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Route</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Distance</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Reimbursement</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {LOGS.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{log.date}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            {log.from} <span className="text-slate-300">→</span> {log.to}
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{log.dist}</td>
                                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{log.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
