"use client";

import React, { useState } from 'react';
import {
    Key,
    Plus,
    Eye,
    Ban,
    Copy,
    Shield,
    Activity,
    Clock,
    AlertTriangle,
    CheckCircle2,
    BarChart3,
    Search
} from 'lucide-react';

// --- MOCK DATA ---

const STATS = [
    { label: 'Total Keys', value: '5', icon: Key, color: 'text-celestial-indigo' },
    { label: 'Active', value: '4', icon: CheckCircle2, color: 'text-aurora-green' },
    { label: 'Expired', value: '1', icon: AlertTriangle, color: 'text-amber-500' },
    { label: 'Requests Today', value: '2,340', icon: Activity, color: 'text-blue-500' },
];

const API_KEYS = [
    {
        id: 1,
        name: 'Production API',
        prefix: 'ak_prod_8x',
        scopes: ['read', 'write', 'admin'],
        created: '2025-01-15',
        lastUsed: '2 min ago',
        status: 'active',
        requests: 1280
    },
    {
        id: 2,
        name: 'Payroll Service',
        prefix: 'ak_pay_3m',
        scopes: ['read', 'payroll'],
        created: '2025-02-20',
        lastUsed: '1 hour ago',
        status: 'active',
        requests: 645
    },
    {
        id: 3,
        name: 'Mobile App',
        prefix: 'ak_mob_9k',
        scopes: ['read'],
        created: '2025-03-10',
        lastUsed: '5 min ago',
        status: 'active',
        requests: 312
    },
    {
        id: 4,
        name: 'Analytics Dashboard',
        prefix: 'ak_ana_2v',
        scopes: ['read', 'write'],
        created: '2025-04-05',
        lastUsed: '30 min ago',
        status: 'active',
        requests: 103
    },
    {
        id: 5,
        name: 'Legacy Integration',
        prefix: 'ak_leg_7p',
        scopes: ['read', 'write'],
        created: '2024-06-12',
        lastUsed: '90 days ago',
        status: 'expired',
        requests: 0
    },
];

function getScopeColor(scope: string) {
    switch (scope) {
        case 'admin': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
        case 'write': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
        case 'read': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
        case 'payroll': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
        default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
}

export default function ApiKeysPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    const filteredKeys = API_KEYS.filter(key =>
        key.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Key className="w-6 h-6 text-celestial-indigo" />
                        API Key Management
                    </h1>
                    <p className="text-silver-mist text-sm">Generate and manage API keys for service integrations.</p>
                </div>
                <button
                    onClick={() => setShowGenerateModal(!showGenerateModal)}
                    className="px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Generate New Key
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/30 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className={`p-2 rounded-lg bg-gray-50 dark:bg-deep-cosmos ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-ink-black dark:text-pearl">{stat.value}</h3>
                        <p className="text-xs text-silver-mist font-medium mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                <input
                    type="text"
                    placeholder="Search API keys..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-sm pl-9 pr-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
                />
            </div>

            {/* API Keys Table */}
            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-cloud dark:border-nebula-purple/30">
                                <th className="text-left py-3 px-4 font-semibold text-ink-black dark:text-pearl">Name</th>
                                <th className="text-left py-3 px-4 font-semibold text-ink-black dark:text-pearl">Key</th>
                                <th className="text-left py-3 px-4 font-semibold text-ink-black dark:text-pearl">Scopes</th>
                                <th className="text-left py-3 px-4 font-semibold text-ink-black dark:text-pearl">Created</th>
                                <th className="text-left py-3 px-4 font-semibold text-ink-black dark:text-pearl">Last Used</th>
                                <th className="text-left py-3 px-4 font-semibold text-ink-black dark:text-pearl">Status</th>
                                <th className="text-right py-3 px-4 font-semibold text-ink-black dark:text-pearl">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredKeys.map(key => (
                                <tr key={key.id} className="border-b border-cloud dark:border-nebula-purple/30 last:border-0 hover:bg-gray-50 dark:hover:bg-deep-cosmos/50 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-celestial-indigo" />
                                            <span className="font-medium text-ink-black dark:text-pearl">{key.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <code className="text-xs bg-gray-100 dark:bg-deep-cosmos px-2 py-0.5 rounded font-mono text-ink-black dark:text-pearl">
                                                {key.prefix}...
                                            </code>
                                            <button className="text-silver-mist hover:text-celestial-indigo transition-colors">
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex flex-wrap gap-1">
                                            {key.scopes.map(scope => (
                                                <span key={scope} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${getScopeColor(scope)}`}>
                                                    {scope}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-silver-mist text-xs">{key.created}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1 text-xs text-silver-mist">
                                            <Clock className="w-3 h-3" />
                                            {key.lastUsed}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${key.status === 'active'
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                            : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                                            }`}>
                                            {key.status === 'active' ? 'Active' : 'Expired'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-deep-cosmos text-silver-mist hover:text-celestial-indigo transition-colors" title="View Usage">
                                                <BarChart3 className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-deep-cosmos text-silver-mist hover:text-rose-500 transition-colors" title="Revoke">
                                                <Ban className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Generate Key Modal Placeholder */}
            {showGenerateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4">Generate New API Key</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-ink-black dark:text-pearl block mb-1">Key Name</label>
                                <input type="text" placeholder="e.g., My Service Key" className="w-full px-3 py-2 bg-gray-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-ink-black dark:text-pearl block mb-1">Scopes</label>
                                <div className="flex flex-wrap gap-2">
                                    {['read', 'write', 'admin', 'payroll'].map(scope => (
                                        <label key={scope} className="flex items-center gap-1.5 text-xs text-ink-black dark:text-pearl">
                                            <input type="checkbox" className="rounded border-cloud" />
                                            {scope}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setShowGenerateModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-deep-cosmos text-ink-black dark:text-pearl rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-nebula-purple/20 transition-colors">
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
                                Generate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
