"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    LayoutGrid,
    Search,
    Check,
    Star,
    Loader2,
} from 'lucide-react';

interface Integration {
    id: string;
    name: string;
    description?: string;
    category: string;
    provider?: string;
    icon?: string;
    logoUrl?: string;
    rating?: number;
    users?: string;
    installCount?: number;
    installed?: boolean;
    status?: string;
    connectionId?: string;
}

export default function AppDirectoryPage() {
    const [apps, setApps] = useState<Integration[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState('All Apps');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchApps = useCallback(async () => {
        try {
            const params = new URLSearchParams({ type: 'catalog' });
            if (activeCategory !== 'All Apps') {
                params.set('category', activeCategory);
            }
            if (searchQuery) {
                params.set('search', searchQuery);
            }

            const res = await fetch(`/api/integrations?${params.toString()}`);
            const result = await res.json();

            if (result.success && result.data) {
                const integrations = result.data.integrations || result.data || [];
                setApps(Array.isArray(integrations) ? integrations : []);
            } else {
                setApps([]);
            }
        } catch (err) {
            console.error('Failed to fetch apps:', err);
            setError('Failed to load app directory.');
        }
    }, [activeCategory, searchQuery]);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/integrations?type=categories');
            const result = await res.json();
            if (result.success && result.data) {
                const cats = Array.isArray(result.data)
                    ? result.data.map((c: any) => c.name || c)
                    : [];
                setCategories(['All Apps', ...cats]);
            }
        } catch {
            // Fallback categories
            setCategories(['All Apps', 'Communication', 'Payroll', 'Productivity', 'Recruiting', 'Security']);
        }
    }, []);

    useEffect(() => {
        Promise.all([fetchApps(), fetchCategories()])
            .finally(() => setLoading(false));
    }, [fetchApps, fetchCategories]);

    // Refetch when category or search changes (debounced search)
    useEffect(() => {
        if (!loading) {
            fetchApps();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCategory]);

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => fetchApps(), 300);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const handleConnect = async (app: Integration) => {
        setActionLoading(app.id);
        try {
            const res = await fetch('/api/integrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'connect',
                    tenantId: 'default',
                    integrationId: app.id,
                    configuration: {},
                    credentials: {},
                }),
            });
            const result = await res.json();
            if (result.success) {
                setApps(prev =>
                    prev.map(a =>
                        a.id === app.id ? { ...a, installed: true, connectionId: result.data?.id } : a
                    )
                );
            }
        } catch (err) {
            console.error('Connect failed:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDisconnect = async (app: Integration) => {
        if (!app.connectionId) return;
        setActionLoading(app.id);
        try {
            const res = await fetch('/api/integrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'disconnect',
                    tenantId: 'default',
                    connectionId: app.connectionId,
                }),
            });
            const result = await res.json();
            if (result.success) {
                setApps(prev =>
                    prev.map(a =>
                        a.id === app.id ? { ...a, installed: false, connectionId: undefined } : a
                    )
                );
            }
        } catch (err) {
            console.error('Disconnect failed:', err);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
                <div className="flex items-center gap-2 p-6">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    <span className="text-slate-500">Loading app directory...</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse">
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
                            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-4" />
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mt-auto" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
                    {error}
                    <button onClick={() => window.location.reload()} className="ml-4 underline text-sm">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <LayoutGrid className="w-6 h-6 text-indigo-500" />
                        App Directory
                    </h1>
                    <p className="text-slate-500 text-sm">Connect third-party tools and extend AuraOS capabilities.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search apps..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 shrink-0">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors
                            ${activeCategory === cat
                                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                                : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'}
                        `}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Apps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-full min-h-0 overflow-y-auto pb-20">
                {apps.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                        <LayoutGrid className="w-12 h-12 mb-3 text-slate-300" />
                        <p className="text-lg font-medium">No apps found</p>
                        <p className="text-sm mt-1">Try adjusting your search or category filter.</p>
                    </div>
                ) : (
                    apps.map((app) => {
                        const isInstalled = app.installed || app.status === 'connected';
                        const isActionLoading = actionLoading === app.id;

                        return (
                            <div key={app.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-lg transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center p-2">
                                        <span className="font-bold text-xl text-slate-500">{app.name?.[0] || '?'}</span>
                                    </div>
                                    {isInstalled && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded uppercase">
                                            <Check className="w-3 h-3" /> Installed
                                        </span>
                                    )}
                                </div>

                                <h3 className="font-bold text-lg mb-1">{app.name}</h3>
                                <div className="text-sm text-slate-500 mb-1">{app.category}</div>
                                {app.description && (
                                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{app.description}</p>
                                )}

                                <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
                                    {app.rating != null && (
                                        <span className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {app.rating}
                                        </span>
                                    )}
                                    {(app.users || app.installCount != null) && (
                                        <span>{app.users || `${app.installCount?.toLocaleString()} installs`}</span>
                                    )}
                                </div>

                                <button
                                    onClick={() => isInstalled ? handleDisconnect(app) : handleConnect(app)}
                                    disabled={isActionLoading}
                                    className={`w-full mt-auto py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
                                        ${isInstalled
                                            ? 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'}
                                        ${isActionLoading ? 'opacity-50' : ''}
                                    `}
                                >
                                    {isActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isInstalled ? 'Configure' : 'Connect'}
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
