"use client";

import React, { useState } from 'react';
import {
    Plug,
    Store,
    Webhook,
    FolderOpen,
    RefreshCw,
    Unplug,
    AlertCircle,
    CheckCircle2,
    Loader2,
    ExternalLink,
    Clock,
    Zap,
    Search
} from 'lucide-react';

// --- MOCK DATA ---

const STATS = [
    { label: 'Connected Integrations', value: '12', icon: Plug, color: 'text-celestial-indigo' },
    { label: 'Available', value: '45', icon: Store, color: 'text-aurora-green' },
    { label: 'Webhooks Active', value: '8', icon: Webhook, color: 'text-amber-500' },
    { label: 'Sync Errors', value: '2', icon: AlertCircle, color: 'text-rose-500' },
];

const INTEGRATIONS = [
    { name: 'Slack', provider: 'Slack Technologies', status: 'connected', lastSync: '2 min ago', category: 'Communication' },
    { name: 'Microsoft Teams', provider: 'Microsoft', status: 'connected', lastSync: '5 min ago', category: 'Communication' },
    { name: 'Google Calendar', provider: 'Google', status: 'connected', lastSync: '1 min ago', category: 'Productivity' },
    { name: 'Zoom', provider: 'Zoom Video', status: 'connected', lastSync: '10 min ago', category: 'Communication' },
    { name: 'DocuSign', provider: 'DocuSign Inc.', status: 'error', lastSync: 'Failed 1h ago', category: 'Documents' },
    { name: 'Jira', provider: 'Atlassian', status: 'syncing', lastSync: 'Syncing...', category: 'Project Management' },
    { name: 'Salesforce', provider: 'Salesforce Inc.', status: 'disconnected', lastSync: 'Never', category: 'CRM' },
    { name: 'SAP', provider: 'SAP SE', status: 'disconnected', lastSync: 'Never', category: 'ERP' },
];

const QUICK_ACTIONS = [
    { label: 'Browse Marketplace', icon: Store, href: '#' },
    { label: 'Create Webhook', icon: Webhook, href: '#' },
    { label: 'View Logs', icon: FolderOpen, href: '#' },
];

const SUB_PAGES = [
    { name: 'API Marketplace', description: 'Discover and connect third-party APIs', path: '/dashboard/integration-hub/api-marketplace' },
    { name: 'Webhook Manager', description: 'Configure and monitor webhook endpoints', path: '/dashboard/integration-hub/webhook-manager' },
    { name: 'App Directory', description: 'Browse available app integrations', path: '/dashboard/integration-hub/app-directory' },
];

function getStatusBadge(status: string) {
    switch (status) {
        case 'connected':
            return { label: 'Connected', className: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', icon: CheckCircle2 };
        case 'error':
            return { label: 'Error', className: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400', icon: AlertCircle };
        case 'syncing':
            return { label: 'Syncing', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', icon: Loader2 };
        default:
            return { label: 'Disconnected', className: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400', icon: Unplug };
    }
}

export default function IntegrationHubPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredIntegrations = INTEGRATIONS.filter(integration => {
        const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || integration.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Plug className="w-6 h-6 text-celestial-indigo" />
                        Integration Hub
                    </h1>
                    <p className="text-silver-mist text-sm">Manage API integrations, webhooks, and connect third-party applications.</p>
                </div>
                <div className="flex gap-2">
                    {QUICK_ACTIONS.map(action => (
                        <button key={action.label} className="px-3 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-deep-cosmos transition-colors flex items-center gap-2 text-ink-black dark:text-pearl">
                            <action.icon className="w-4 h-4 text-celestial-indigo" />
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                    <input
                        type="text"
                        placeholder="Search integrations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
                >
                    <option value="all">All Status</option>
                    <option value="connected">Connected</option>
                    <option value="error">Error</option>
                    <option value="syncing">Syncing</option>
                    <option value="disconnected">Disconnected</option>
                </select>
            </div>

            {/* Connected Integrations Grid */}
            <div>
                <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4">Integrations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {filteredIntegrations.map(integration => {
                        const badge = getStatusBadge(integration.status);
                        const BadgeIcon = badge.icon;
                        return (
                            <div key={integration.name} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/30 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-deep-cosmos flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-celestial-indigo" />
                                    </div>
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${badge.className}`}>
                                        <BadgeIcon className={`w-3 h-3 ${integration.status === 'syncing' ? 'animate-spin' : ''}`} />
                                        {badge.label}
                                    </span>
                                </div>
                                <h3 className="font-bold text-sm text-ink-black dark:text-pearl">{integration.name}</h3>
                                <p className="text-xs text-silver-mist mt-0.5">{integration.provider}</p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-silver-mist">
                                    <Clock className="w-3 h-3" />
                                    <span>{integration.lastSync}</span>
                                </div>
                                <div className="flex gap-2 mt-3 pt-3 border-t border-cloud dark:border-nebula-purple/30">
                                    {integration.status !== 'disconnected' && (
                                        <button className="flex-1 text-xs px-2 py-1.5 bg-gray-50 dark:bg-deep-cosmos rounded-md text-ink-black dark:text-pearl hover:bg-gray-100 dark:hover:bg-nebula-purple/20 transition-colors flex items-center justify-center gap-1">
                                            <RefreshCw className="w-3 h-3" /> Sync
                                        </button>
                                    )}
                                    <button className="flex-1 text-xs px-2 py-1.5 bg-gray-50 dark:bg-deep-cosmos rounded-md text-ink-black dark:text-pearl hover:bg-gray-100 dark:hover:bg-nebula-purple/20 transition-colors flex items-center justify-center gap-1">
                                        {integration.status === 'disconnected' ? (
                                            <><Plug className="w-3 h-3" /> Connect</>
                                        ) : (
                                            <><Unplug className="w-3 h-3" /> Disconnect</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Feature Links */}
            <div>
                <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4">Explore</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {SUB_PAGES.map(page => (
                        <a key={page.name} href={page.path} className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/30 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-ink-black dark:text-pearl group-hover:text-celestial-indigo transition-colors">{page.name}</h3>
                                <ExternalLink className="w-4 h-4 text-silver-mist group-hover:text-celestial-indigo transition-colors" />
                            </div>
                            <p className="text-sm text-silver-mist mt-1">{page.description}</p>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}

