"use client";

import React, { useState, useEffect } from 'react';
import {
    Mic,
    MicOff,
    Activity,
    BarChart2,
    HelpCircle,
    Settings,
    Play
} from 'lucide-react';
import { VoiceCommandsService } from '../services';

export default function VoiceCommandsPage() {
    const [config, setConfig] = useState<any>(null);
    const [interactions, setInteractions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [configData, interactionsData] = await Promise.all([
                VoiceCommandsService.getConfig(),
                VoiceCommandsService.getAllInteractions()
            ]);
            if (configData) setConfig(configData);
            if (interactionsData.length > 0) setInteractions(interactionsData);
        } catch {
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Mic className="w-6 h-6 text-indigo-500" />
                        Voice Commands
                    </h1>
                    <p className="text-slate-500 text-sm">Configure voice assistant triggers and review usage logs.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Wake Word:</span>
                    <select className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>Hey Aura</option>
                        <option>OK Aura</option>
                        <option>Start Aura</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Command Usage Stats */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-2">94.2%</h2>
                                <p className="text-indigo-100/80 mb-6 font-medium">Recognition Accuracy</p>
                                <button className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-sm font-bold border border-white/30 transition-colors flex items-center gap-2">
                                    <Settings className="w-4 h-4" /> Improve Model
                                </button>
                            </div>

                            <div className="flex items-end gap-1 h-24">
                                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                                    <div key={i} className="w-4 bg-white/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                        </div>
                        {/* Background Decoration */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl"></div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Command Library</h3>
                        <div className="space-y-1">
                            {[
                                { cmd: 'Request Leave', phrase: '"Request leave for tomorrow"', usage: 'High', success: '98%' },
                                { cmd: 'Check Balance', phrase: '"What is my leave balance?"', usage: 'High', success: '96%' },
                                { cmd: 'Show Pay Slip', phrase: '"Show me my last payslip"', usage: 'Medium', success: '92%' },
                                { cmd: 'Call HR', phrase: '"Connect me to HR"', usage: 'Low', success: '85%' },
                                { cmd: 'Clock In', phrase: '"Clock in now"', usage: 'Very High', success: '99%' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Play className="w-4 h-4 fill-current" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-slate-100">{item.cmd}</div>
                                            <div className="text-sm text-slate-500 italic">{item.phrase}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8 text-sm">
                                        <div className="text-right">
                                            <div className="text-slate-400 text-xs">Usage</div>
                                            <div className="font-medium">{item.usage}</div>
                                        </div>
                                        <div className="text-right w-16">
                                            <div className="text-slate-400 text-xs">Success</div>
                                            <div className="font-bold text-emerald-600">{item.success}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Settings & Logs */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-500" /> Recent Interactions
                        </h3>
                        <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-6 pl-6 py-2">
                            {[
                                { q: 'Show my payslip', time: '2 mins ago', status: 'Success' },
                                { q: 'Apply for seek leave', time: '15 mins ago', status: 'Failed' },
                                { q: 'Who is John Doe?', time: '1 hour ago', status: 'Success' },
                                { q: 'Clock out', time: '2 hours ago', status: 'Success' },
                            ].map((log, i) => (
                                <div key={i} className="relative">
                                    <div className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${log.status === 'Success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">"{log.q}"</div>
                                    <div className="flex justify-between items-center mt-1">
                                        <div className="text-xs text-slate-400">{log.time}</div>
                                        <div className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${log.status === 'Success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'}`}>
                                            {log.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">View Full Logs</button>
                    </div>

                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                        <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" /> Tip
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Users can train Aura to recognize their unique voice patterns in the mobile app settings for better accuracy in noisy environments.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
