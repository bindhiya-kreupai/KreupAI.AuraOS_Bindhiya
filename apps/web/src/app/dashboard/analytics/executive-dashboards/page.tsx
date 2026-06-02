"use client";

import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    TrendingUp,
    Users,
    DollarSign,
    Globe,
    ArrowUpRight,
    ArrowDownRight,
    Briefcase,
    Loader2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar,
    PieChart, Pie, Cell
} from 'recharts';

export default function ExecutiveDashboardsPage() {
    const [loading, setLoading] = useState(true);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [turnoverRate, setTurnoverRate] = useState(0);
    const [totalPayroll, setTotalPayroll] = useState(0);
    const [avgSalary, setAvgSalary] = useState(0);
    const [deptBreakdown, setDeptBreakdown] = useState<{ department: string; count: number }[]>([]);
    const [trends, setTrends] = useState<{ month: string; count: number }[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [headcountRes, turnoverRes, compRes] = await Promise.all([
                fetch('/api/v1/analytics/headcount').then(r => r.json()).catch(() => null),
                fetch('/api/v1/analytics/turnover').then(r => r.json()).catch(() => null),
                fetch('/api/v1/analytics/compensation').then(r => r.json()).catch(() => null),
            ]);

            const hc = headcountRes?.data;
            const to = turnoverRes?.data;
            const comp = compRes?.data;

            if (hc) {
                setTotalEmployees(hc.total || 0);
                setDeptBreakdown(
                    (hc.byDepartment || []).map((d: any) => ({
                        department: d.department,
                        count: d.count,
                    }))
                );
                setTrends(hc.trends || []);
            }

            if (to) {
                setTurnoverRate(to.overall?.turnoverRate ?? 0);
            }

            if (comp) {
                setTotalPayroll(comp.summary?.totalPayroll ?? 0);
                setAvgSalary(comp.summary?.averageSalary ?? 0);
            }
        } catch (error: any) {
            console.error('Error loading executive data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const revenuePerEmployee = totalEmployees > 0 && totalPayroll > 0
        ? Math.round(totalPayroll / totalEmployees)
        : 0;

    const trendChartData = trends.map(t => ({
        month: t.month,
        value: t.count,
    }));

    const deptChartData = deptBreakdown.map(d => ({
        name: d.department,
        value: d.count,
        color: '#6366f1',
    }));

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20 bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <LayoutDashboard className="w-8 h-8 text-indigo-600" />
                        Executive Overview
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">High-level insights for strategic decision making.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <KPICard
                    title="Avg Salary"
                    value={avgSalary > 0 ? `$${(avgSalary / 1000).toFixed(0)}K` : '--'}
                    trend={totalPayroll > 0 ? `$${(totalPayroll / 1000000).toFixed(1)}M total` : ''}
                    trendUp={true}
                    icon={DollarSign}
                    color="text-emerald-500"
                />
                <KPICard
                    title="Total Workforce"
                    value={totalEmployees > 0 ? totalEmployees.toLocaleString() : '--'}
                    trend={`${deptBreakdown.length} departments`}
                    trendUp={true}
                    icon={Users}
                    color="text-blue-500"
                />
                <KPICard
                    title="Global Headcount"
                    value={totalEmployees > 0 ? totalEmployees.toLocaleString() : '--'}
                    trend={trends.length > 0 ? `${trends.length} months tracked` : ''}
                    trendUp={true}
                    icon={Globe}
                    color="text-indigo-500"
                />
                <KPICard
                    title="Attrition Rate"
                    value={turnoverRate > 0 ? `${turnoverRate}%` : '--'}
                    trend={turnoverRate > 15 ? 'High' : 'Manageable'}
                    trendUp={false}
                    icon={TrendingUp}
                    color="text-rose-500"
                    inverse={true}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" /> Headcount Trend
                    </h3>
                    <div className="h-80">
                        {trendChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendChartData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="month" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                                    <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-slate-400">No trend data available</div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" /> Dept Distribution
                    </h3>
                    {deptBreakdown.length > 0 ? (
                        <div className="space-y-3">
                            {deptBreakdown.map((d) => (
                                <div key={d.department} className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-slate-600 dark:text-slate-400">{d.department}</span>
                                    <span className="font-bold text-slate-900 dark:text-slate-100">{d.count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-48 text-sm text-slate-400">No data available</div>
                    )}
                </div>
            </div>

            {deptBreakdown.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-indigo-500" /> Department Headcount
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="department" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}

function KPICard({ title, value, trend, trendUp, icon: Icon, color, sub, inverse }: any) {
    const isPositive = inverse ? !trendUp : trendUp;
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 w-fit ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'}`}>
                        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trend}
                    </span>
                )}
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{value}</div>
            <div className="text-sm font-medium text-slate-500">{title}</div>
            {sub && <div className="text-xs font-bold text-indigo-500 mt-2">{sub}</div>}
        </div>
    );
}

