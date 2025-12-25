"use client";

import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Users,
    DollarSign
} from 'lucide-react';
import { BenefitAnalyticsService } from '../services';

export default function ReportingPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await BenefitAnalyticsService.getStats();
            setStats(data);
        } catch {
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-indigo-500" />
                        Benefits Analytics
                    </h1>
                    <p className="text-slate-500 text-sm">Cost analysis and enrollment insights.</p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold">
                        <option>Current Year (2025)</option>
                        <option>Last Year (2024)</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Benefit Cost', value: '$1.2M', trend: '+12%', icon: DollarSign, color: 'text-indigo-500' },
                    { label: 'Enrollment Rate', value: '94%', trend: '+2%', icon: Users, color: 'text-emerald-500' },
                    { label: 'Avg Cost Per Employee', value: '$850/mo', trend: '+5%', icon: TrendingUp, color: 'text-rose-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-emerald-500 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                                {stat.trend}
                            </span>
                        </div>
                        <div className="text-3xl font-bold mb-1">{stat.value}</div>
                        <div className="text-sm text-slate-500">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-[300px] flex flex-col">
                    <h3 className="font-bold text-lg mb-6">Cost Distribution by Plan</h3>
                    <div className="flex-1 flex items-end justify-between px-4 gap-4">
                        {[65, 40, 25, 15].map((h, i) => (
                            <div key={i} className="w-full bg-indigo-50 dark:bg-indigo-900/10 rounded-t-xl relative group">
                                <div
                                    style={{ height: `${h}%` }}
                                    className="absolute bottom-0 w-full bg-indigo-500 rounded-t-xl opacity-80 group-hover:opacity-100 transition-opacity"
                                ></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs font-bold text-slate-400 px-2">
                        <span>Health</span>
                        <span>Dental</span>
                        <span>Vision</span>
                        <span>Other</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-[300px] flex flex-col">
                    <h3 className="font-bold text-lg mb-6">Enrollment Trends</h3>
                    <div className="flex-1 border-l border-b border-slate-100 dark:border-slate-700 relative">
                        <svg className="absolute inset-0 w-full h-full overflow-visible">
                            <path
                                d="M0 150 C 50 140, 100 100, 150 80 S 250 120, 300 60 S 400 20, 500 10"
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="3"
                            />
                            <path
                                d="M0 150 C 50 140, 100 100, 150 80 S 250 120, 300 60 S 400 20, 500 10 V 200 H 0 Z"
                                fill="url(#gradient)"
                                opacity="0.1"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="transparent" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
