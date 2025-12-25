"use client";

import React, { useState, useEffect } from 'react';
import {
    Handshake,
    Calendar,
    FileText,
    TrendingUp
} from 'lucide-react';
import { UnionService } from '../services';

export default function CollectiveBargainingPage() {
    const [agreements, setAgreements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAgreements();
    }, []);

    const fetchAgreements = async () => {
        try {
            const data = await UnionService.getCBAgreements();
            setAgreements(data);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Handshake className="w-6 h-6 text-indigo-500" />
                        Collective Bargaining
                    </h1>
                    <p className="text-slate-500 text-sm">Manage contract negotiations and proposals.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Active Negotiations</h3>
                    <div className="space-y-6">
                        {[
                            { title: 'Manufacturing Renewal 2025', union: 'Local 101', step: 'Proposal Stage', progress: 30, due: 'Dec 15' },
                            { title: 'Transport Wage Adjustment', union: 'Local 88', step: 'Mediation', progress: 85, due: 'Nov 30' },
                        ].map((neg, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-lg">{neg.title}</div>
                                        <div className="text-sm text-slate-500">Union: {neg.union}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-slate-400 uppercase">Deadline</div>
                                        <div className="font-bold text-rose-600">{neg.due}</div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-indigo-600">{neg.step}</span>
                                    <span className="font-bold">{neg.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500"
                                        style={{ width: `${neg.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Proposal Tracker</h3>
                    <div className="space-y-4">
                        {[
                            { item: 'Wage Increase (3%)', status: 'Agreed', icon: TrendingUp, color: 'text-emerald-500' },
                            { item: 'Health Benefits', status: 'Counter-Offer', icon: FileText, color: 'text-amber-500' },
                            { item: 'Shift Schedule', status: 'Rejected', icon: Calendar, color: 'text-rose-500' },
                        ].map((prop, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <prop.icon className={`w-5 h-5 ${prop.color}`} />
                                <div className="flex-1">
                                    <div className="font-bold text-sm">{prop.item}</div>
                                    <div className="text-xs text-slate-500">{prop.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Draft New Proposal</button>
                </div>
            </div>
        </div>
    );
}
