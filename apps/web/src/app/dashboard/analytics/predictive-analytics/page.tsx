"use client";

import React from 'react';
import {
    PieChart, Pie, Cell,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar,
    AreaChart, Area
} from 'recharts';
import {
    Activity,
    TrendingUp,
    Users,
    AlertCircle,
    BrainCircuit,
    Sparkles,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

// --- MOCK DATA ---

const ORG_HEALTH_DATA = [
    { name: 'Healthy', value: 75, color: '#10b981' }, // emerald-500
    { name: 'At Risk', value: 15, color: '#f59e0b' }, // amber-500
    { name: 'Critical', value: 10, color: '#ef4444' }, // red-500
];

const ATTRITION_DATA = [
    { month: 'Jan', actual: 2.1, predicted: 2.0 },
    { month: 'Feb', actual: 2.3, predicted: 2.2 },
    { month: 'Mar', actual: 1.8, predicted: 2.4 },
    { month: 'Apr', actual: 2.5, predicted: 2.6 },
    { month: 'May', actual: 2.9, predicted: 2.8 },
    { month: 'Jun', actual: 3.1, predicted: 3.5 }, // AI predicting spike
];

const DEMOGRAPHICS_DATA = [
    { name: 'Eng', male: 40, female: 25, other: 5 },
    { name: 'Sales', male: 30, female: 35, other: 2 },
    { name: 'HR', male: 10, female: 40, other: 1 },
    { name: 'Prod', male: 20, female: 20, other: 3 },
];

const LEAVE_FORECAST_DATA = [
    { day: 'Mon', actual: 12, predicted: 10 },
    { day: 'Tue', actual: 15, predicted: 14 },
    { day: 'Wed', actual: 8, predicted: 9 },
    { day: 'Thu', actual: 10, predicted: 11 },
    { day: 'Fri', actual: 20, predicted: 18 }, // Weekend spike
];

// --- COMPONENTS ---

export default function AnalyticsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
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

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Org Health Score"
                    value="8.5/10"
                    trend="+0.4"
                    trendUp={true}
                    icon={Activity}
                    color="text-emerald-500"
                />
                <KPICard
                    title="Predicted Attrition"
                    value="3.2%"
                    trend="+0.5%"
                    trendUp={false} // Bad trend
                    icon={TrendingUp}
                    color="text-amber-500"
                />
                <KPICard
                    title="Sentiment Index"
                    value="Positive"
                    sub="72% Engaged"
                    icon={Users}
                    color="text-blue-500"
                />
                <KPICard
                    title="Automated Actions"
                    value="1,240"
                    trend="+15%"
                    trendUp={true}
                    icon={BrainCircuit}
                    color="text-purple-500"
                />
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Attrition Prediction */}
                <ChartCard title="Attrition Risk Forecast" subtitle="Actual vs AI Prediction (6 Months)">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={ATTRITION_DATA}>
                            <defs>
                                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
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
                            <Area type="monotone" dataKey="actual" stroke="#8884d8" fillOpacity={1} fill="url(#colorActual)" name="Actual %" />
                            <Area type="monotone" dataKey="predicted" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPredicted)" strokeDasharray="5 5" name="AI Predicted %" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* 2. Org Health Distribution */}
                <ChartCard title="Organizational Health Breakdown" subtitle="Employee Well-being Status">
                    <div className="flex items-center justify-center h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ORG_HEALTH_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {ORG_HEALTH_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                                {/* Center Text */}
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-ink-black dark:fill-pearl font-bold text-2xl">
                                    88%
                                </text>
                                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-silver-mist text-xs">
                                    Overall Score
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* 3. Workforce Demographics */}
                <ChartCard title="Diversity & Demographics" subtitle="Gender Distribution by Department">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={DEMOGRAPHICS_DATA}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                            />
                            <Legend />
                            <Bar dataKey="male" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} name="Male" />
                            <Bar dataKey="female" stackId="a" fill="#ec4899" radius={[0, 0, 0, 0]} name="Female" />
                            <Bar dataKey="other" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} name="Other" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* 4. Leave Trends */}
                <ChartCard title="Leave Spike Prediction" subtitle="Day-wise Absenteeism Forecast">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={LEAVE_FORECAST_DATA}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="actual" stroke="#f59e0b" strokeWidth={2} name="Actual" />
                            <Line type="step" dataKey="predicted" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" name="Predicted" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
}

// --- SUB COMPONENTS ---

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
