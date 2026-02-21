"use client";

import React, { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar,
} from 'recharts';
import {
    Activity,
    TrendingUp,
    Users,
    BrainCircuit,
    Sparkles,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from 'lucide-react';

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [highRisk, setHighRisk] = useState(0);
    const [mediumRisk, setMediumRisk] = useState(0);
    const [lowRisk, setLowRisk] = useState(0);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [turnoverRate, setTurnoverRate] = useState(0);
    const [monthlyTrend, setMonthlyTrend] = useState<{ month: string; separations: number }[]>([]);
    const [deptBreakdown, setDeptBreakdown] = useState<{ department: string; count: number }[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [predictiveRes, turnoverRes, headcountRes] = await Promise.all([
                fetch('/api/v1/analytics/predictive').then(r => r.json()).catch(() => null),
                fetch('/api/v1/analytics/turnover').then(r => r.json()).catch(() => null),
                fetch('/api/v1/analytics/headcount').then(r => r.json()).catch(() => null),
            ]);

            const predictive = predictiveRes?.data;
            const turnover = turnoverRes?.data;
            const headcount = headcountRes?.data;

            if (predictive?.attritionRisk) {
                setHighRisk(predictive.attritionRisk.highRisk?.count ?? 0);
                setMediumRisk(predictive.attritionRisk.mediumRisk?.count ?? 0);
                setLowRisk(predictive.attritionRisk.lowRisk?.count ?? 0);
            }

            if (turnover) {
                setTurnoverRate(turnover.overall?.turnoverRate ?? 0);
                setMonthlyTrend(
                    (turnover.monthlyTrend || []).map((m: any) => ({
                        month: m.month.split('-')[1] || m.month,
                        separations: m.separations,
                    }))
                );
            }

            if (headcount) {
                setTotalEmployees(headcount.total || 0);
                setDeptBreakdown(
                    (headcount.byDepartment || []).map((d: any) => ({
                        department: d.department,
                        count: d.count,
                    }))
                );
            }
        } catch (error) {
            console.error('Error loading predictive analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-celestial-indigo" />
            </div>
        );
    }

    const orgHealthData = [
        { name: 'Low Risk', value: lowRisk, color: '#10b981' },
        { name: 'Medium Risk', value: mediumRisk, color: '#f59e0b' },
        { name: 'High Risk', value: highRisk, color: '#ef4444' },
    ].filter(d => d.value > 0);

    const totalRisk = highRisk + mediumRisk + lowRisk;
    const healthScore = totalRisk > 0 ? Math.round((lowRisk / totalRisk) * 100) : 0;

    const attritionData = monthlyTrend.map(m => ({
        month: m.month,
        actual: m.separations,
    }));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <BrainCircuit className="w-6 h-6 text-celestial-indigo" />
                        AI & Automation Insights
                    </h1>
                    <p className="text-silver-mist text-sm">Real-time organizational health monitoring</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm font-medium hover:bg-cloud/50 transition-colors">
                        Export Report
                    </button>
                    <button className="px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Ask Aura AI
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Org Health Score"
                    value={totalRisk > 0 ? `${healthScore}%` : '--'}
                    trend={highRisk === 0 ? 'Healthy' : `${highRisk} at risk`}
                    trendUp={highRisk === 0}
                    icon={Activity}
                    color="text-emerald-500"
                />
                <KPICard
                    title="Turnover Rate"
                    value={turnoverRate > 0 ? `${turnoverRate}%` : '--'}
                    trend={turnoverRate > 15 ? 'High' : 'Manageable'}
                    trendUp={turnoverRate <= 15}
                    icon={TrendingUp}
                    color="text-amber-500"
                />
                <KPICard
                    title="Total Workforce"
                    value={totalEmployees > 0 ? totalEmployees.toLocaleString() : '--'}
                    sub={`${deptBreakdown.length} departments`}
                    icon={Users}
                    color="text-blue-500"
                />
                <KPICard
                    title="Risk Distribution"
                    value={totalRisk > 0 ? `${totalRisk}` : '--'}
                    trend={`H:${highRisk} M:${mediumRisk} L:${lowRisk}`}
                    trendUp={highRisk === 0}
                    icon={BrainCircuit}
                    color="text-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Monthly Attrition Trend" subtitle="Exits per month">
                    {attritionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={attritionData}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="actual" stroke="#8884d8" fillOpacity={1} fill="url(#colorActual)" name="Exits" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-sm text-silver-mist">No trend data available</div>
                    )}
                </ChartCard>

                <ChartCard title="Attrition Risk Breakdown" subtitle="Employee risk distribution">
                    {orgHealthData.length > 0 ? (
                        <div className="flex items-center justify-center h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={orgHealthData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {orgHealthData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-ink-black dark:fill-pearl font-bold text-2xl">
                                        {healthScore}%
                                    </text>
                                    <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-silver-mist text-xs">
                                        Healthy
                                    </text>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-sm text-silver-mist">No risk data available</div>
                    )}
                </ChartCard>

                <ChartCard title="Department Headcount" subtitle="Workforce distribution">
                    {deptBreakdown.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={deptBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="department" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Headcount" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-sm text-silver-mist">No department data available</div>
                    )}
                </ChartCard>

                <ChartCard title="Risk Insights" subtitle="Predictive attrition indicators">
                    <div className="space-y-4 py-4">
                        {highRisk > 0 && (
                            <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-xl">
                                <p className="text-sm font-bold text-rose-600">High Risk: {highRisk} employee{highRisk > 1 ? 's' : ''}</p>
                                <p className="text-xs text-slate-500 mt-1">Low performance + short tenure indicators</p>
                            </div>
                        )}
                        {mediumRisk > 0 && (
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                                <p className="text-sm font-bold text-amber-600">Medium Risk: {mediumRisk} employee{mediumRisk > 1 ? 's' : ''}</p>
                                <p className="text-xs text-slate-500 mt-1">Moderate risk indicators detected</p>
                            </div>
                        )}
                        {lowRisk > 0 && (
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                                <p className="text-sm font-bold text-emerald-600">Low Risk: {lowRisk} employee{lowRisk > 1 ? 's' : ''}</p>
                                <p className="text-xs text-slate-500 mt-1">Stable workforce segment</p>
                            </div>
                        )}
                        {highRisk === 0 && mediumRisk === 0 && lowRisk === 0 && (
                            <div className="text-center py-8">
                                <BrainCircuit className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-400">No predictive data available</p>
                            </div>
                        )}
                    </div>
                </ChartCard>
            </div>
        </div>
    );
}

function KPICard({ title, value, sub, trend, trendUp, icon: Icon, color }: any) {
    return (
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-lg bg-pearl dark:bg-deep-cosmos ${color} opacity-90`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${trendUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trend}
                    </span>
                )}
            </div>
            <div className="mt-2">
                <h3 className="text-2xl font-bold text-ink-black dark:text-pearl">{value}</h3>
                <p className="text-xs text-silver-mist font-medium mt-1">{title}</p>
                {sub && <p className="text-xs text-silver-mist mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function ChartCard({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle: string }) {
    return (
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-ink-black dark:text-pearl">{title}</h3>
                <p className="text-sm text-silver-mist">{subtitle}</p>
            </div>
            <div className="w-full">
                {children}
            </div>
        </div>
    );
}
