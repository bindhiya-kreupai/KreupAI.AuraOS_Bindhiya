"use client";

import React, { useState, useEffect } from 'react';
import {
    ShieldAlert,
    Plus,
    Lock,
    Globe,
    AlertTriangle,
    Trash2
} from 'lucide-react';
import { IPRestrictionService } from '../services';

interface IPRule {
    id: number | string;
    name: string;
    ip: string;
    type: string;
    addedBy: string;
    date: string;
}

interface BlockedAttempt {
    id: number | string;
    ip: string;
    location: string;
    time: string;
    reason: string;
}

export default function IPRestrictionPage() {
    const [whitelist, setWhitelist] = useState<IPRule[]>([]);
    const [blockedAttempts, setBlockedAttempts] = useState<BlockedAttempt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIPRules();
    }, []);

    const fetchIPRules = async () => {
        try {
            setLoading(true);
            const result = await IPRestrictionService.getIPRules();
            if (result && result.length > 0) {
                setWhitelist(result as any);
            }
            const blockedResult = await IPRestrictionService.getBlockedAttempts();
            if (blockedResult && blockedResult.length > 0) {
                setBlockedAttempts(blockedResult as any);
            }
        } catch (error) {
            console.error('Error fetching IP rules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (ip: string) => {
        setLoading(true);
        try {
            const ruleToDelete = whitelist.find(rule => rule.ip === ip);
            if (ruleToDelete) {
                await IPRestrictionService.removeIPWhitelist(String(ruleToDelete.id));
                await fetchIPRules();
            }
        } catch (error) {
            console.error('Error removing IP:', error);
        } finally {
            setLoading(false);
        }
    };
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
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center">
                                        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                                    </td>
                                </tr>
                            ) : whitelist.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">No whitelisted IPs</td>
                                </tr>
                            ) : (
                            whitelist.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-bold text-ink-black dark:text-pearl">{row.name}</td>
                                    <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{row.ip}</td>
                                    <td className="px-4 py-3 text-slate-500">{row.type}</td>
                                    <td className="px-4 py-3 text-slate-500">{row.date}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleDelete(row.ip)}
                                            disabled={loading}
                                            className="text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-50">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )))}
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
                        {blockedAttempts.length === 0 ? (
                            <div className="text-center text-slate-400 py-4">No blocked attempts</div>
                        ) : (
                        blockedAttempts.map((attempt) => (
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
                        )))}
                    </div>
                    <div className="p-3 border-t border-cloud dark:border-nebula-purple/20 text-center">
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View Full Security Log</button>
                    </div>
                </div>

            </div>
        </div>
    );
}
