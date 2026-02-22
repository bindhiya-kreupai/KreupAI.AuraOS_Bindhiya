"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Radio,
    Plus,
    Activity,
    CheckCircle2,
    XCircle,
    RotateCw,
    Trash2,
    MoreVertical
} from 'lucide-react';

interface WebhookSubscription {
    id: string;
    url: string;
    events: string[];
    active: boolean;
    lastDeliveryAt: string | null;
    lastDeliveryStatus: 'success' | 'failed' | null;
    createdAt: string;
    retryCount: number;
}

interface DeliveryLog {
    id: string;
    webhookId: string;
    event: string;
    status: 'success' | 'failed' | 'pending' | 'retrying';
    timestamp: string;
    responseCode: number | null;
    responseTime: number;
    attemptNumber: number;
}

export default function WebhooksPage() {
    const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([]);
    const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/v1/webhooks/')
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    setWebhooks(result.data);
                    // Fetch logs for the first webhook if available
                    if (result.data.length > 0) {
                        fetchLogsForAll(result.data);
                    }
                } else {
                    setError(result.error?.message || 'Failed to load webhooks');
                }
            })
            .catch(err => {
                console.error('Failed to fetch webhooks:', err);
                setError('Failed to load webhooks. Please try again.');
            })
            .finally(() => setLoading(false));
    }, []);

    const fetchLogsForAll = useCallback(async (hooks: WebhookSubscription[]) => {
        setLogsLoading(true);
        try {
            const logPromises = hooks.slice(0, 5).map(hook =>
                fetch(`/api/v1/webhooks/${hook.id}/logs?limit=5`)
                    .then(r => r.json())
                    .then(result => (result.data || []) as DeliveryLog[])
                    .catch(() => [] as DeliveryLog[])
            );
            const allLogs = await Promise.all(logPromises);
            const merged = allLogs.flat().sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            ).slice(0, 10);
            setDeliveryLogs(merged);
        } catch (err) {
            console.error('Failed to fetch delivery logs:', err);
        } finally {
            setLogsLoading(false);
        }
    }, []);

    const refreshLogs = () => {
        if (webhooks.length > 0) {
            fetchLogsForAll(webhooks);
        }
    };

    function getWebhookHealthStatus(hook: WebhookSubscription): { label: string; healthy: boolean } {
        if (!hook.active) return { label: 'Inactive', healthy: false };
        if (hook.lastDeliveryStatus === 'failed') return { label: 'Failing', healthy: false };
        return { label: 'Healthy', healthy: true };
    }

    function formatTimeAgo(dateStr: string): string {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffS = Math.floor(diffMs / 1000);
        if (diffS < 60) return `${diffS}s ago`;
        const diffM = Math.floor(diffS / 60);
        if (diffM < 60) return `${diffM}m ago`;
        const diffH = Math.floor(diffM / 60);
        if (diffH < 24) return `${diffH}h ago`;
        const diffD = Math.floor(diffH / 24);
        return `${diffD}d ago`;
    }

    if (loading) {
        return (
            <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
                <div className="animate-pulse">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 mb-6">
                        <div>
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-2" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-80" />
                        </div>
                        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-36" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-64" />
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-64" />
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
                            <Radio className="w-6 h-6 text-indigo-500" />
                            Webhooks
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
                        <Radio className="w-6 h-6 text-indigo-500" />
                        Webhooks
                    </h1>
                    <p className="text-slate-500 text-sm">Subscribe to real-time events and configure delivery endpoints.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Plus className="w-4 h-4" /> Add Endpoint
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Endpoints List */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg">Active Subscriptions</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {webhooks.length === 0 ? (
                            <div className="p-8 text-center">
                                <Radio className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-500">No webhook endpoints configured.</p>
                            </div>
                        ) : (
                            webhooks.map((hook) => {
                                const health = getWebhookHealthStatus(hook);
                                return (
                                    <div key={hook.id} className="p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-mono text-sm font-bold text-indigo-600 truncate max-w-sm">{hook.url}</div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1
                                                    ${health.healthy ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}
                                                `}>
                                                    {health.healthy ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                    {health.label}
                                                </span>
                                                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            {hook.events.map(e => (
                                                <span key={e} className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] px-2 py-1 rounded border border-slate-200 dark:border-slate-700">{e}</span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-400">
                                            <span>Status: <span className={health.healthy ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>{health.label}</span></span>
                                            {hook.lastDeliveryAt && (
                                                <span>Last delivery: {formatTimeAgo(hook.lastDeliveryAt)}</span>
                                            )}
                                            <span>Retries: {hook.retryCount}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Delivery Logs */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" /> Recent Deliveries
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-3">
                        {logsLoading ? (
                            <div className="animate-pulse space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                                ))}
                            </div>
                        ) : deliveryLogs.length === 0 ? (
                            <div className="text-center py-8">
                                <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                <p className="text-sm text-slate-400">No delivery logs yet.</p>
                            </div>
                        ) : (
                            deliveryLogs.map((log) => (
                                <div key={log.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm">
                                    <div>
                                        <div className="font-mono text-xs font-bold text-slate-500">{log.event}</div>
                                        <div className="text-[10px] text-slate-400">{log.id} {log.timestamp ? `\u2022 ${formatTimeAgo(log.timestamp)}` : ''}</div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono
                                        ${log.responseCode && log.responseCode >= 200 && log.responseCode < 300 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}
                                    `}>
                                        {log.responseCode || log.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    <button
                        onClick={refreshLogs}
                        className="w-full mt-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
                    >
                        <RotateCw className="w-3 h-3" /> Refresh Logs
                    </button>
                </div>
            </div>
        </div>
    );
}

