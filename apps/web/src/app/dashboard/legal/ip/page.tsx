"use client";

import React from 'react';
import {
    Copyright,
    Award,
    Globe,
    ShieldCheck,
    Calendar,
    ExternalLink
} from 'lucide-react';

export default function IPRepositoryPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-indigo-500" />
                        IP Repository
                    </h1>
                    <p className="text-slate-500 text-sm">Manage patents, trademarks, copyrights, and trade secrets.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Award className="w-4 h-4" /> Register IP
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-y-auto pb-20">
                {/* Patents Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                            <Award className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-black">12</div>
                            <div className="text-xs text-slate-500 font-bold uppercase">Patents</div>
                        </div>
                    </div>

                    <div className="space-y-4 flex-1">
                        {[
                            { name: 'AI Optimization Algo', no: 'US-992381', status: 'Granted' },
                            { name: 'Blockchain Ledger', no: 'US-Pending', status: 'Pending' },
                            { name: 'Biometric Auth Sys', no: 'EU-22311', status: 'Granted' },
                        ].map((p, i) => (
                            <div key={i} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                                <div>
                                    <div className="font-bold text-sm text-slate-700 dark:text-slate-300">{p.name}</div>
                                    <div className="text-xs text-slate-400 font-mono">{p.no}</div>
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded
                                     ${p.status === 'Granted' ? 'text-emerald-600 bg-emerald-100' : 'text-amber-600 bg-amber-100'}
                                `}>
                                    {p.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trademarks Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-rose-100 dark:bg-rose-900/20 rounded-xl text-rose-600">
                            <Copyright className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-black">5</div>
                            <div className="text-xs text-slate-500 font-bold uppercase">Trademarks</div>
                        </div>
                    </div>

                    <div className="space-y-4 flex-1">
                        {[
                            { name: 'AuraOS Logo', region: 'Global', expiry: '2030' },
                            { name: 'KreupAI Brand', region: 'US, EU', expiry: '2028' },
                            { name: 'Slogan: Future Works', region: 'US', expiry: '2032' },
                        ].map((t, i) => (
                            <div key={i} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                                <div>
                                    <div className="font-bold text-sm text-slate-700 dark:text-slate-300">{t.name}</div>
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <Globe className="w-3 h-3" /> {t.region}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-500">Expiring</div>
                                    <div className="font-bold text-xs">{t.expiry}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Renewal Calendar */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-500" /> Upcoming Renewals
                    </h3>

                    <div className="space-y-4 flex-1">
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-bold text-amber-900 dark:text-amber-400 text-sm">Patent #US-992381</div>
                                <div className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">Due in 30 Days</div>
                            </div>
                            <p className="text-xs text-amber-800 dark:text-amber-500 mb-3">Maintenance fee payment required for AI Optimization Algorithm.</p>
                            <button className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm">
                                Initiate Renewal
                            </button>
                        </div>

                        <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl opacity-60">
                            <div className="flex justify-between items-start mb-1">
                                <div className="font-bold text-sm">Trademark: KreupAI</div>
                                <div className="text-xs text-slate-500">Due Nov 2024</div>
                            </div>
                            <p className="text-xs text-slate-400">No immediate action required.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
