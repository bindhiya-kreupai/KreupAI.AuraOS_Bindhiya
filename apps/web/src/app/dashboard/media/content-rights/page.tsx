"use client";

import React, { useState } from 'react';
import {
    Copyright,
    FileSignature,
    Globe,
    AlertCircle
} from 'lucide-react';

export default function ContentRightsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Copyright className="w-6 h-6 text-indigo-500" />
                        Content Rights Management
                    </h1>
                    <p className="text-slate-500 text-sm">Track intellectual property, licensing, and royalties.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <FileSignature className="w-4 h-4" /> New Agreement
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-4">Expiring Licenses</h3>
                    <div className="space-y-4">
                        {[
                            { title: 'Summer Hit 2024', region: 'Europe', expires: '15 Days', type: 'Music' },
                            { title: 'Nature Docu-Series', region: 'Asia-Pacific', expires: '30 Days', type: 'Video' },
                            { title: 'Sports Highlights', region: 'Global', expires: '5 Days', type: 'Clip' },
                        ].map((lic, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                                <div>
                                    <div className="font-bold">{lic.title}</div>
                                    <div className="text-sm text-slate-500 flex items-center gap-1">
                                        <Globe className="w-3 h-3" /> {lic.region} • {lic.type}
                                    </div>
                                    <div className="text-xs font-bold text-rose-500 mt-1">Expires in {lic.expires}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-4">Rights Catalog</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-6 py-4">Asset</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Territory</th>
                                    <th className="px-6 py-4">Royalties</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { asset: 'Top 40 Countdown', type: 'Audio', terr: 'North America', roy: '12%', status: 'Active' },
                                    { asset: 'Cooking Masterclass', type: 'Video', terr: 'Global', roy: '15%', status: 'Active' },
                                    { asset: 'News Archive 2023', type: 'Archive', terr: 'Europe', roy: 'Flat Fee', status: 'Archived' },
                                    { asset: 'Live Concert Stream', type: 'Live', terr: 'LATAM', roy: '8%', status: 'Pending' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-bold">{row.asset}</td>
                                        <td className="px-6 py-4 text-slate-500">{row.type}</td>
                                        <td className="px-6 py-4">{row.terr}</td>
                                        <td className="px-6 py-4 font-mono text-indigo-600">{row.roy}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                                                    row.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-600'
                                                }`}>{row.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

