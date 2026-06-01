"use client";

import React, { useState, useEffect } from 'react';
import {
    WifiOff,
    Database,
    RefreshCw,
    HardDrive,
    FileText,
    Users,
    ClipboardList,
    Image as ImageIcon,
    Settings2,
    Check
} from 'lucide-react';
import { OfflineModeService } from '../services';

export default function OfflineModePage() {
    const [config, setConfig] = useState<any>(null);
    const [syncStatus, setSyncStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [configData, syncData] = await Promise.all([
                OfflineModeService.getConfig(),
                OfflineModeService.getSyncStatus()
            ]);
            if (configData) setConfig(configData);
            if (syncData) setSyncStatus(syncData);
        } catch (error: any) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <WifiOff className="w-6 h-6 text-indigo-500" />
                        Offline Mode
                    </h1>
                    <p className="text-slate-500 text-sm">Configure data synchronization and offline access capabilities.</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Sync Service Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Module Configuration */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Database className="w-5 h-5 text-indigo-500" /> Offline Modules
                            </h2>
                            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Sync All Now</button>
                        </div>

                        <div className="space-y-3">
                            {[
                                { name: 'Employee Directory', icon: Users, size: '4.2 MB', lastSync: '10m ago', enabled: true },
                                { name: 'Leave Forms', icon: FileText, size: '1.5 MB', lastSync: '10m ago', enabled: true },
                                { name: 'Expense Categories', icon: ClipboardList, size: '0.8 MB', lastSync: '1h ago', enabled: true },
                                { name: 'Policy Documents', icon: FileText, size: '12.4 MB', lastSync: '2d ago', enabled: false },
                                { name: 'Image Cache', icon: ImageIcon, size: '45.2 MB', lastSync: '5m ago', enabled: true },
                            ].map((mod, i) => (
                                <div key={i} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${mod.enabled ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent opacity-75'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mod.enabled ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                            <mod.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-slate-100">{mod.name}</div>
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {mod.size}</span>
                                                <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> {mod.lastSync}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={mod.enabled} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2">Sync Conflict Resolution</h3>
                            <p className="text-indigo-100 text-sm mb-6 max-w-lg">
                                When conflicts occur between offline edits and server data, the system is configured to:
                            </p>
                            <div className="flex gap-3">
                                <button className="px-4 py-2 bg-white text-indigo-700 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2">
                                    <Check className="w-4 h-4" /> Server Wins
                                </button>
                                <button className="px-4 py-2 bg-indigo-700 text-indigo-200 hover:bg-indigo-800 rounded-lg text-sm font-medium transition-colors">
                                    Client Wins
                                </button>
                                <button className="px-4 py-2 bg-indigo-700 text-indigo-200 hover:bg-indigo-800 rounded-lg text-sm font-medium transition-colors">
                                    Manual Merge
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Settings */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                            <Settings2 className="w-4 h-4 text-slate-400" /> Global Sync Settings
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium">Sync Frequency</label>
                                    <span className="text-sm font-bold text-indigo-600">Autosync</span>
                                </div>
                                <input type="range" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" />
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>Manual</span>
                                    <span>Every 15m</span>
                                    <span>Real-time</span>
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center justify-between text-sm font-medium mb-3">
                                    <span>Sync on Wi-Fi Only</span>
                                    <input type="checkbox" className="form-checkbox text-indigo-600 rounded" defaultChecked />
                                </label>
                                <label className="flex items-center justify-between text-sm font-medium mb-3">
                                    <span>Background Sync</span>
                                    <input type="checkbox" className="form-checkbox text-indigo-600 rounded" defaultChecked />
                                </label>
                                <label className="flex items-center justify-between text-sm font-medium">
                                    <span>Notify on Sync Failure</span>
                                    <input type="checkbox" className="form-checkbox text-indigo-600 rounded" defaultChecked />
                                </label>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <label className="text-sm font-medium block mb-2">Max Cache Size</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="bg-amber-500 h-full w-[45%]"></div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">450MB / 1GB</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50 flex gap-3 text-amber-800 dark:text-amber-200 text-sm">
                        <WifiOff className="w-5 h-5 shrink-0" />
                        <p className="leading-relaxed">
                            Offline mode stores sensitive data locally. Ensure <span className="font-bold underline">Biometric Login</span> is enabled for maximum security.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

