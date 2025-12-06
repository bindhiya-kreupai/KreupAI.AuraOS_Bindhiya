"use client";

import React from 'react';
import {
    ShieldAlert,
    Plus,
    Lock,
    Globe,
    AlertTriangle,
    Trash2
} from 'lucide-react';

const WHITELIST = [
    { id: 1, name: 'Office VPN', ip: '192.168.1.0/24', type: 'Range (CIDR)', addedBy: 'Admin', date: 'Jan 12, 2025' },
    { id: 2, name: 'Dubai Static Head', ip: '203.0.113.45', type: 'Single IP', addedBy: 'Sabu John', date: 'Mar 01, 2025' },
];

const BLOCKED_ATTEMPTS = [
    { id: 1, ip: '103.45.2.12', location: 'Unknown', time: '10 mins ago', reason: 'Not in whitelist' },
    { id: 2, ip: '45.12.33.19', location: 'Moscow, RU', time: '2 hours ago', reason: 'Geo-block' },
    { id: 3, ip: '201.22.10.99', location: 'Brazil', time: '5 hours ago', reason: 'Not in whitelist' },
];

export default function IPRestrictionPage() {
    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Lock className="w-6 h-6 text-indigo-500" />
                        IP Restrictions
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Restrict attendance access to secure corporate networks.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Whitelist New IP
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Whitelist Table */}
                <div className="col-span-1 lg:col-span-2 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-cloud dark:border-nebula-purple/50">
                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <Globe className="w-4 h-4 text-emerald-500" /> Whitelisted Networks
                        </h3>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-silver-mist font-bold">
                            <tr>
                                <th className="px-4 py-3">Network Name</th>
                                <th className="px-4 py-3">IP Address / CIDR</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Added On</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
                            {WHITELIST.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-bold text-ink-black dark:text-pearl">{row.name}</td>
                                    <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{row.ip}</td>
                                    <td className="px-4 py-3 text-slate-500">{row.type}</td>
                                    <td className="px-4 py-3 text-slate-500">{row.date}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="text-slate-400 hover:text-rose-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Blocked Log */}
                <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-cloud dark:border-nebula-purple/50 bg-rose-50 dark:bg-rose-900/10">
                        <h3 className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" /> Recent Blocked Attempts
                        </h3>
                    </div>
                    <div className="p-4 space-y-4 flex-1">
                        {BLOCKED_ATTEMPTS.map((attempt) => (
                            <div key={attempt.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5" />
                                <div>
                                    <div className="text-sm font-bold text-ink-black dark:text-pearl font-mono">{attempt.ip}</div>
                                    <div className="text-xs text-silver-mist mt-1 flex items-center gap-2">
                                        <span>{attempt.location}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <span>{attempt.time}</span>
                                    </div>
                                    <div className="text-xs font-bold text-rose-600 mt-1">{attempt.reason}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 border-t border-cloud dark:border-nebula-purple/20 text-center">
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View Full Security Log</button>
                    </div>
                </div>

            </div>
        </div>
    );
}
