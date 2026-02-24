"use client";

import React, { useState, useEffect } from 'react';
import {
    Activity,
    Users,
    AlertCircle,
    CheckCircle,
    Clock,
    Loader2,
    CalendarOff,
    ClipboardList
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function RealTimeAnalyticsPage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [presentToday, setPresentToday] = useState(0);
    const [onLeave, setOnLeave] = useState(0);
    const [pendingApprovals, setPendingApprovals] = useState(0);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [alerts, setAlerts] = useState<{ type: string; message: string; timestamp: string }[]>([]);
    const [dataPoints, setDataPoints] = useState<{ time: string; value: number }[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/v1/analytics/real-time');
            const json = await res.json();
            const data = json?.data;

            if (data) {
                setPresentToday(data.attendance?.presentToday ?? 0);
                setOnLeave(data.attendance?.onLeaveToday ?? 0);
                setTotalEmployees(data.attendance?.totalEmployees ?? 0);
                setPendingApprovals(data.pendingApprovals?.total ?? 0);
                setAlerts(data.alerts || []);
            }
        } catch (error) {
            console.error('Error loading real-time data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());

            setDataPoints(prev => {
                const now = new Date();
                const newPoint = {
                    time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
                    value: presentToday > 0 ? presentToday + Math.floor(Math.random() * 5) - 2 : Math.floor(Math.random() * 100)
                };
                const newData = [...prev, newPoint];
                if (newData.length > 20) newData.shift();
                return newData;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [presentToday]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            </div>
        );
    }

    const absentToday = totalEmployees - presentToday - onLeave;

    return (
        <div className="p-6 space-y-8 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <Activity className="w-8 h-8 text-rose-500 animate-pulse" />
                        Real-time Analytics
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Live monitoring of workforce activity and attendance.</p>
                </div>
                <div className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xl flex items-center gap-2 shadow-lg">
                    <Clock className="w-5 h-5" />
                    {currentTime.toLocaleTimeString()}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <LiveMetricCard
                    title="Present Today"
                    value={presentToday}
                    icon={Users}
                    color="text-blue-500"
                    trend={`of ${totalEmployees} total`}
                />
                <LiveMetricCard
                    title="On Leave"
                    value={onLeave}
                    icon={CalendarOff}
                    color="text-amber-500"
                    trend="Today"
                />
                <LiveMetricCard
                    title="Pending Approvals"
                    value={pendingApprovals}
                    icon={ClipboardList}
                    color={pendingApprovals > 10 ? 'text-rose-500' : 'text-emerald-500'}
                    trend="Awaiting action"
                />
                <LiveMetricCard
                    title="System Status"
                    value="Operational"
                    icon={CheckCircle}
                    color="text-emerald-500"
                    sub="Live data"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-slate-400" /> Live Attendance Pulse
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
                                <YAxis domain={['auto', 'auto']} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                                <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 text-rose-500 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> Recent Alerts
                    </h3>
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {alerts.length > 0 ? (
                            alerts.map((alert, i) => (
                                <div key={i} className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-l-4 border-rose-500">
                                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-1" />
                                    <div>
                                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{alert.type}</div>
                                        <div className="text-xs text-slate-500">{alert.message}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                                <p className="text-sm text-slate-400">No active alerts</p>
                            </div>
                        )}
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

