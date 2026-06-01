"use client";

import React, { useState, useEffect } from 'react';
import {
    Megaphone,
    Shield,
    Users,
    AlertTriangle
} from 'lucide-react';
import { StrikeService } from '../services';

export default function StrikeManagementPage() {
    const [strikes, setStrikes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStrikes();
    }, []);

    const fetchStrikes = async () => {
        try {
            const data = await StrikeService.getStrikes();
            setStrikes(data);
        } catch (error: any) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-rose-500" />
                        Strike Management
                    </h1>
                    <p className="text-slate-500 text-sm">Contingency planning and strike impact monitoring.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Active Threats / Actions</h3>
                    <div className="space-y-4">
                        {[
                            { union: 'Local 88 - Transport', type: 'Wildcat Strike', status: 'Active', impact: 'Critical' },
                            { union: 'Local 101 - Mfg', type: 'Work-to-Rule', status: 'Potential', impact: 'High' },
                        ].map((strike, i) => (
                            <div key={i} className="p-4 border border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/10 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                                        <div className="font-bold text-rose-900 dark:text-rose-200">{strike.union}</div>
                                    </div>
                                    <span className="px-2 py-1 bg-white dark:bg-slate-900 rounded text-xs font-bold text-rose-600 uppercase">{strike.status}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <div>
                                        <span className="block text-xs uppercase font-bold text-slate-400">Type</span>
                                        {strike.type}
                                    </div>
                                    <div>
                                        <span className="block text-xs uppercase font-bold text-slate-400">Projected Impact</span>
                                        {strike.impact}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Contingency Plans</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-indigo-500" />
                                    <div className="font-bold text-sm">Security Detail Activation</div>
                                </div>
                                <button className="text-xs font-bold text-white bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700">Deploy</button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-emerald-500" />
                                    <div className="font-bold text-sm">Replacement Workers</div>
                                </div>
                                <button className="text-xs font-bold text-slate-500 bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded cursor-not-allowed">Standby</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

