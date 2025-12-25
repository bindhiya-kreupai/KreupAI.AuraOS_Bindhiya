"use client";

import React, { useState } from 'react';
import {
    ShieldCheck,
    FileCheck,
    AlertOctagon,
    LifeBuoy
} from 'lucide-react';

export default function OffshoreCompliancePage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-indigo-500" />
                        Offshore Compliance
                    </h1>
                    <p className="text-slate-500 text-sm">Track certifications, safety drills, and audits.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Safety Drills', val: '100%', status: 'Compliant', color: 'text-emerald-500' },
                    { label: 'Crew Certs', val: '98%', status: 'Action Req', color: 'text-amber-500' },
                    { label: 'Vessel Audits', val: '4/5', status: 'In Progress', color: 'text-indigo-500' },
                    { label: 'Incidents (YTD)', val: '0', status: 'Excellent', color: 'text-emerald-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.val}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">{stat.label}</div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${stat.status === 'Compliant' || stat.status === 'Excellent' ? 'bg-emerald-100 text-emerald-600' :
                                stat.status === 'Action Req' ? 'bg-amber-100 text-amber-600' :
                                    'bg-indigo-100 text-indigo-600'
                            }`}>{stat.status}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Certification Expiry Watchlist</h3>
                    <div className="space-y-3">
                        {[
                            { name: 'Capt. A. Haddock', cert: 'Master Unlimited', expiry: '15 Nov 2024', days: '12 days' },
                            { name: 'Off. W. Turner', cert: 'GMDSS', expiry: '01 Dec 2024', days: '28 days' },
                            { name: 'Eng. M. Quinn', cert: 'High Voltage', expiry: '10 Dec 2024', days: '37 days' },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <div className="font-bold text-sm">{item.name}</div>
                                    <div className="text-xs text-slate-500">{item.cert}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-amber-600">Expires in {item.days}</div>
                                    <div className="text-xs text-slate-400">{item.expiry}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Notify Crew</button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Latest Audit Reports</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors">
                            <FileCheck className="w-8 h-8 text-emerald-500" />
                            <div>
                                <div className="font-bold text-sm">ISM Code Audit - PASSED</div>
                                <div className="text-xs text-slate-500">MV Pacific Star • Conducted by Lloyd&apos;s Register</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors">
                            <AlertOctagon className="w-8 h-8 text-amber-500" />
                            <div>
                                <div className="font-bold text-sm">ISPS Security Update - REVIEW</div>
                                <div className="text-xs text-slate-500">Port of Rotterdam • Action Items Pending</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors">
                            <LifeBuoy className="w-8 h-8 text-indigo-500" />
                            <div>
                                <div className="font-bold text-sm">LSA Equipment Check - SUBMITTED</div>
                                <div className="text-xs text-slate-500">SS Northern Light • Routine Inspection</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
