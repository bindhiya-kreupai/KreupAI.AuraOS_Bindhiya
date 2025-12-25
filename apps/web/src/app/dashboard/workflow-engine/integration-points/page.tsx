'use client';

import React, { useState, useEffect } from 'react';
import { Plug, Check, Power, RefreshCw, Key } from 'lucide-react';
import { IntegrationService } from '../services';

const APPS = [
    { id: 1, name: 'Slack', description: 'Send notifications to channels', status: 'Connected', icon: 'bg-indigo-500' },
    { id: 2, name: 'Google Sheets', description: 'Sync form responses', status: 'Connected', icon: 'bg-green-500' },
    { id: 3, name: 'Salesforce', description: 'Create CRM records', status: 'Disconnected', icon: 'bg-blue-500' },
    { id: 4, name: 'Jira', description: 'Create issues from tickets', status: 'Connected', icon: 'bg-blue-600' },
];

export default function IntegrationPointsPage() {
    const [apps, setApps] = useState<any[]>(APPS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            setLoading(true);
            const data = await IntegrationService.getIntegrations();
            if (data.length > 0) {
                setApps(data);
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Plug className="w-6 h-6 text-cyan-500" />
                        Integration Points
                    </h1>
                    <p className="text-slate-500 text-sm">Connect workflows with external tools and APIs.</p>
                </div>
                <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                    <Key className="w-4 h-4" /> Manage API Keys
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apps.map(app => (
                    <div key={app.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-[180px]">
                        <div className="flex justify-between items-start">
                            <div className={`w-12 h-12 rounded-xl ${app.icon} flex items-center justify-center text-white font-bold text-lg`}>
                                {app.name[0]}
                            </div>
                            <div className={`w-8 h-4 rounded-full p-0.5 ${app.status === 'Connected' ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'} flex items-center transition-colors cursor-pointer`}>
                                <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg">{app.name}</h3>
                            <p className="text-sm text-slate-500">{app.description}</p>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium pt-4 border-t border-slate-100 dark:border-slate-800">
                            {app.status === 'Connected' ? (
                                <span className="text-emerald-500 flex items-center gap-1"><Check className="w-3 h-3" /> Active</span>
                            ) : (
                                <span className="text-slate-400 flex items-center gap-1"><Power className="w-3 h-3" /> Inactive</span>
                            )}
                            {app.status === 'Connected' && (
                                <span className="ml-auto text-slate-400 flex items-center gap-1 cursor-pointer hover:text-cyan-500"><RefreshCw className="w-3 h-3" /> Sync</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
