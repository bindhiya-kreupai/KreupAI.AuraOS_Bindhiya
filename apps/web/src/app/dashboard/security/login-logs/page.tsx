"use client";

import React from 'react';
import {
    History,
    MapPin,
    Smartphone,
    Monitor,
    ShieldCheck,
    AlertOctagon,
    Globe
} from 'lucide-react';

export default function LoginHistoryPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <History className="w-6 h-6 text-indigo-500" />
                        Login History
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor user sessions, device types, and suspicious login attempts.</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100 dark:border-emerald-800/30">
                    <ShieldCheck className="w-4 h-4" /> 0 Active Threats
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Map / Summary */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
                            <Globe className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">428</div>
                            <div className="text-xs text-slate-500 font-bold uppercase">Safe Logins (24h)</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center text-rose-600">
                            <AlertOctagon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">3</div>
                            <div className="text-xs text-slate-500 font-bold uppercase">Failed Attempts</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">45%</div>
                            <div className="text-xs text-slate-500 font-bold uppercase">Mobile Usage</div>
                        </div>
                    </div>
                </div>

                {/* Session List */}
                <div className="lg:col-span-3 overflow-y-auto pb-20">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                    <th className="py-3 pl-6">Time</th>
                                    <th className="py-3">User</th>
                                    <th className="py-3">Location (IP)</th>
                                    <th className="py-3">Device</th>
                                    <th className="py-3 text-right pr-6">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {[
                                    { user: 'admin@aura.os', ip: '192.168.1.1 (Dubai, AE)', device: 'Chrome / Mac', status: 'Success', method: 'MFA', time: 'Just Now' },
                                    { user: 'sarah.c@aura.os', ip: '10.2.4.55 (New York, US)', device: 'Safari / iPhone', status: 'Success', method: 'Pwd', time: '5m ago' },
                                    { user: 'john.d@aura.os', ip: '45.22.11.9 (London, UK)', device: 'Firefox / Win10', status: 'Failed', method: 'Bad Creds', time: '12m ago' },
                                    { user: 'system.svc', ip: 'Internal', device: 'API Client', status: 'Success', method: 'Token', time: '15m ago' },
                                    { user: 'mike.ross@aura.os', ip: '192.168.1.10 (Dubai, AE)', device: 'Chrome / Mac', status: 'Success', method: 'SSO', time: '22m ago' },
                                ].map((row, i) => (
                                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="py-4 pl-6 text-slate-500 font-mono text-xs font-bold">{row.time}</td>
                                        <td className="py-4 font-bold text-slate-700 dark:text-slate-300">{row.user}</td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                <MapPin className="w-3 h-3 text-slate-400" /> {row.ip}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                {row.device.includes('Phone') ? <Smartphone className="w-3 h-3 text-slate-400" /> : <Monitor className="w-3 h-3 text-slate-400" />}
                                                {row.device}
                                            </div>
                                        </td>
                                        <td className="py-4 text-right pr-6">
                                            <div className="flex flex-col items-end">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded mb-1
                                                    ${row.status === 'Success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}
                                                `}>
                                                    {row.status}
                                                </span>
                                                <span className="text-[10px] text-slate-400">{row.method}</span>
                                            </div>
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
