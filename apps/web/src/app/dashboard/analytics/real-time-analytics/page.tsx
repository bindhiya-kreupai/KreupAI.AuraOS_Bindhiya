"use client";

import React, { useState, useEffect } from 'react';
import {
    Activity,
    Users,
    AlertCircle,
    CheckCircle,
    Server,
    Wifi,
    Clock
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { RealtimeMetricsService } from '../services';

export default function RealTimeAnalyticsPage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeUsers, setActiveUsers] = useState(124);
    const [serverLoad, setServerLoad] = useState(45);
    const [dataPoints, setDataPoints] = useState<{ time: string; value: number }[]>([]);
    const [metrics, setMetrics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            const data = await RealtimeMetricsService.getMetrics();
            setMetrics(data);
        } catch (error) {
            console.error('Error fetching realtime metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    // Simulate "ticking" live data
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
            setActiveUsers(prev => Math.max(80, Math.min(200, prev + Math.floor(Math.random() * 11) - 5)));
            setServerLoad(prev => Math.max(20, Math.min(90, prev + Math.floor(Math.random() * 11) - 5)));

            setDataPoints(prev => {
                const now = new Date();
                const newPoint = {
                    time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
                    value: Math.floor(Math.random() * 100)
                };
                const newData = [...prev, newPoint];
                if (newData.length > 20) newData.shift(); // Keep last 20 points
                return newData;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-6 space-y-8 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <Activity className="w-8 h-8 text-rose-500 animate-pulse" />
                        Real-time Analytics
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Live monitoring of system health and workforce activity.</p>
                </div>
                <div className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xl flex items-center gap-2 shadow-lg">
                    <Clock className="w-5 h-5" />
                    {currentTime.toLocaleTimeString()}
                </div>
            </div>

            {/* Live Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <LiveMetricCard
                    title="Active Users"
                    value={activeUsers}
                    icon={Users}
                    color="text-blue-500"
                    trend={activeUsers > 150 ? '+ High' : 'Normal'}
                />
                <LiveMetricCard
                    title="Server Load"
                    value={`${serverLoad}%`}
                    icon={Server}
                    color={serverLoad > 80 ? 'text-rose-500' : 'text-emerald-500'}
                    trend="Stable"
                />
                <LiveMetricCard
                    title="System Status"
                    value="Operational"
                    icon={CheckCircle}
                    color="text-emerald-500"
                    sub="99.9% Uptime"
                />
                <LiveMetricCard
                    title="Network Latency"
                    value="24ms"
                    icon={Wifi}
                    color="text-indigo-500"
                    sub="Optimal"
                />
            </div>

            {/* Live Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-slate-400" /> Live Transaction Volume
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dataPoints}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="time" hide />
                                <YAxis domain={[0, 100]} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                                <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 text-rose-500 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> Recent Alerts (Live Stream)
                    </h3>
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-l-4 border-rose-500 animate-in slide-in-from-right duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-1" />
                                <div>
                                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">High API Latency Detected</div>
                                    <div className="text-xs text-slate-500">Detected at {new Date(Date.now() - i * 60000).toLocaleTimeString()} in Payroll Module.</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function LiveMetricCard({ title, value, icon: Icon, color, sub, trend }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-4 opacity-10 ${color}`}>
                <Icon className="w-24 h-24" />
            </div>
            <div className="relative z-10">
                <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit mb-4 ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">{value}</div>
                <div className="text-sm font-bold text-slate-500">{title}</div>
                {(sub || trend) && (
                    <div className="flex items-center gap-2 mt-4 text-xs font-bold">
                        {sub && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">{sub}</span>}
                        {trend && <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">{trend}</span>}
                    </div>
                )}
            </div>
        </div>
    );
}
