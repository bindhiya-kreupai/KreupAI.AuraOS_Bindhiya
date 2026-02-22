"use client";

import React, { useState, useEffect } from 'react';
import {
    Code,
    Key,
    Copy,
    Eye,
    EyeOff,
    Terminal,
    BookOpen,
    ShieldAlert
} from 'lucide-react';

interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    status: string;
    permissions: string[];
    createdAt: string;
    lastUsed: string | null;
    expiresAt: string | null;
    usageCount: number;
    rateLimit: { requests: number; window: string };
    createdBy: string;
    ipWhitelist: string[];
    revokedAt?: string;
    revokedBy?: string;
    revokeReason?: string;
}

interface ApiKeysMeta {
    total: number;
    active: number;
    revoked: number;
}

function formatLastUsed(dateStr: string | null): string {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffS = Math.floor(diffMs / 1000);
    if (diffS < 60) return 'Just now';
    const diffM = Math.floor(diffS / 60);
    if (diffM < 60) return `${diffM} min ago`;
    const diffH = Math.floor(diffM / 60);
    if (diffH < 24) return `${diffH} hour${diffH > 1 ? 's' : ''} ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD} day${diffD > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffD / 7)} week${Math.floor(diffD / 7) > 1 ? 's' : ''} ago`;
}

function formatScope(permissions: string[]): string {
    if (!permissions || permissions.length === 0) return 'No Access';
    const hasWrite = permissions.some(p => p.includes(':write') || p.includes(':create') || p.includes(':delete'));
    const allRead = permissions.every(p => p.includes(':read'));
    if (permissions.some(p => p.includes('analytics') || p.includes('reports'))) {
        if (allRead) return 'Read Only';
    }
    if (hasWrite && allRead) return 'Read/Write';
    if (hasWrite) return 'Read/Write';
    if (allRead) return 'Read Only';
    return 'Full Access';
}

export default function APIMarketplacePage() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [meta, setMeta] = useState<ApiKeysMeta>({ total: 0, active: 0, revoked: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/v1/admin/api-keys/')
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    setApiKeys(result.data);
                    if (result.meta) {
                        setMeta(result.meta);
                    }
                } else {
                    setError(result.error || 'Failed to load API keys');
                }
            })
            .catch(err => {
                console.error('Failed to fetch API keys:', err);
                setError('Failed to load API keys. Please try again.');
            })
            .finally(() => setLoading(false));
    }, []);

    // Compute usage quota from the data
    const totalUsage = apiKeys.reduce((sum, k) => sum + (k.usageCount || 0), 0);
    const activeKeys = apiKeys.filter(k => k.status === 'active');
    const maxMonthlyLimit = activeKeys.reduce((sum, k) => {
        const hourlyLimit = k.rateLimit?.requests || 1000;
        // Estimate monthly = hourly * 24 * 30
        return sum + hourlyLimit * 24 * 30;
    }, 0);
    const usagePercentage = maxMonthlyLimit > 0 ? Math.min(Math.round((totalUsage / maxMonthlyLimit) * 100), 100) : 0;

    if (loading) {
        return (
            <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
                <div className="animate-pulse">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 mb-6">
                        <div>
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-72" />
                        </div>
                        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-40" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-64" />
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-40" />
                            <div className="bg-slate-900 rounded-2xl p-6 h-40" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Code className="w-6 h-6 text-indigo-500" />
                            API Marketplace
                        </h1>
                    </div>
                </div>
                <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/30 text-center">
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-3 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Code className="w-6 h-6 text-indigo-500" />
                        API Marketplace
                    </h1>
                    <p className="text-slate-500 text-sm">Developer tools, API keys, and documentation.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Key className="w-4 h-4" /> Generate New Key
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* API Keys */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Key className="w-5 h-5 text-indigo-500" /> Active API Keys
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-4">
                        {activeKeys.length === 0 ? (
                            <div className="text-center py-12">
                                <Key className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-500">No active API keys found.</p>
                            </div>
                        ) : (
                            activeKeys.map((key) => (
                                <div key={key.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <div>
                                        <div className="font-bold text-slate-800 dark:text-slate-200">{key.name}</div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 flex items-center gap-1">
                                                {key.prefix} <Copy className="w-3 h-3 cursor-pointer hover:text-indigo-500" />
                                            </div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 rounded">
                                                {formatScope(key.permissions)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0 text-right">
                                        <div className="text-xs text-slate-500">Last used: <span className="font-bold text-slate-700 dark:text-slate-300">{formatLastUsed(key.lastUsed)}</span></div>
                                        <div className="text-xs text-slate-400 mt-0.5">Usage: {key.usageCount.toLocaleString()} requests</div>
                                        <div className="flex justify-end gap-3 mt-2">
                                            <button className="text-xs font-bold text-indigo-600 hover:underline">Roll Key</button>
                                            <button className="text-xs font-bold text-rose-600 hover:underline">Revoke</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Documentation & Usage */}
                <div className="space-y-4">
                    {/* Usage Limits */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-amber-500" /> Usage Quotas
                        </h3>
                        <div className="mb-4">
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-slate-500 uppercase">Total Requests</span>
                                <span className="text-slate-700 dark:text-slate-300">{totalUsage.toLocaleString()} total</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${usagePercentage}%` }}></div>
                            </div>
                        </div>
                        <div className="text-xs text-slate-500 space-y-1">
                            <p>Active keys: <span className="font-bold">{meta.active || activeKeys.length}</span></p>
                            <p>Revoked keys: <span className="font-bold">{meta.revoked || apiKeys.filter(k => k.status === 'revoked').length}</span></p>
                        </div>
                        {usagePercentage > 80 && (
                            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-xl">
                                <p className="text-xs text-amber-800 dark:text-amber-500">
                                    You are approaching your usage limits. Consider reviewing your API key rate limits.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Quick Docs */}
                    <div className="bg-slate-900 text-white rounded-2xl p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-emerald-400" /> Quick Start
                        </h3>
                        <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-slate-300 mb-4 overflow-x-auto">
                            curl -X GET https://api.auraos.io/v1/employees \<br />
                            -H &quot;Authorization: Bearer sk_live_...&quot;
                        </div>
                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                            <BookOpen className="w-4 h-4" /> View Full Documentation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

