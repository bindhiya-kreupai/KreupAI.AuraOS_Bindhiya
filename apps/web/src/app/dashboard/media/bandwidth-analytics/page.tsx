"use client";

import React, { useState } from 'react';
import {
    Activity,
    Server,
    Wifi,
    BarChart2
} from 'lucide-react';

export default function BandwidthAnalyticsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="w-6 h-6 text-indigo-500" />
                        Bandwidth Analytics
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor real-time network traffic and capacity.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Total Throughput</div>
                    <div className="text-4xl font-bold text-indigo-600">450 Gbps</div>
                    <div className="text-xs text-emerald-500 font-bold mt-1">↑ 12% vs avg</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Peak Usage</div>
                    <div className="text-4xl font-bold text-slate-800 dark:text-white">820 Gbps</div>
                    <div className="text-xs text-slate-400 mt-1">Recorded at 20:00</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">CDN Hit Ratio</div>
                    <div className="text-4xl font-bold text-emerald-600">98.5%</div>
                    <div className="text-xs text-emerald-500 font-bold mt-1">Optimal</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-4">Traffic by Region</h3>
                    <div className="space-y-4">
                        {[
                            { region: 'North America', traffic: '180 Gbps', percent: 40 },
                            { region: 'Europe', traffic: '135 Gbps', percent: 30 },
                            { region: 'Asia-Pacific', traffic: '90 Gbps', percent: 20 },
                            { region: 'Others', traffic: '45 Gbps', percent: 10 },
                        ].map((reg, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold">{reg.region}</span>
                                    <span className="text-slate-500">{reg.traffic} ({reg.percent}%)</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${reg.percent}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-4">Node Status</h3>
                    <div className="space-y-3">
                        {[
                            { node: 'US-East-1', status: 'Operational', latency: '12ms' },
                            { node: 'EU-West-2', status: 'Operational', latency: '24ms' },
                            { node: 'AP-South-1', status: 'Degraded', latency: '145ms' },
                            { node: 'SA-East-1', status: 'Operational', latency: '85ms' },
                        ].map((node, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <div className="font-bold text-sm">{node.node}</div>
                                    <div className={`text-xs font-bold ${node.status === 'Operational' ? 'text-emerald-500' : 'text-amber-500'
                                        }`}>{node.status}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-400">Latency</div>
                                    <div className="font-mono text-sm">{node.latency}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
