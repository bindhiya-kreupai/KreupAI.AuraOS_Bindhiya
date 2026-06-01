// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
"use client";

import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Users,
    DollarSign,
    Loader2
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
            const response = await BenefitAnalyticsService.getStats();
            const data = response?.data || response || null;
            setStats(data);
        } catch (error: any) {
            console.error('Error fetching analytics:', error);
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
        return `$${value.toLocaleString()}`;
    };

    const kpiCards = stats ? [
        {
            label: 'Total Benefit Cost',
            value: formatCurrency((stats.employeeContributions || 0) + (stats.employerContributions || 0)),
            trend: stats.costTrend === 'increasing' ? '+' : stats.costTrend === 'decreasing' ? '-' : '',
            icon: DollarSign,
            color: 'text-indigo-500',
        },
        {
            label: 'Enrollment Rate',
            value: `${stats.enrollmentRate || 0}%`,
            trend: stats.enrollmentTrend === 'increasing' ? '+' : '',
            icon: Users,
            color: 'text-emerald-500',
        },
        {
            label: 'Avg Premium Per Employee',
            value: stats.averagePremiumPerEmployee ? `$${Math.round(stats.averagePremiumPerEmployee)}/mo` : 'N/A',
            trend: '',
            icon: TrendingUp,
            color: 'text-rose-500',
        },
    ] : [];

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-indigo-500" />
                        Benefits Analytics
                    </h1>
                    <p className="text-slate-500 text-sm">Cost analysis and enrollment insights.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                </div>
            ) : !stats ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <BarChart3 className="w-12 h-12 text-slate-300 mb-4" />
                    <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">No Analytics Data Available</h3>
                    <p className="text-sm text-slate-500 max-w-sm mt-1">Analytics data will populate as benefit plans and enrollments are configured.</p>
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {kpiCards.map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color}`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    {stat.trend && (
                                        <span className="text-emerald-500 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                                            {stat.trend}
                                        </span>
                                    )}
                                </div>
                                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                                <div className="text-sm text-slate-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Stats Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            <p className="text-xs text-slate-500 uppercase font-medium">Total Enrollments</p>
                            <p className="text-2xl font-bold mt-1">{stats.totalEnrollments || 0}</p>
                            <p className="text-xs text-slate-400">Active: {stats.activeEnrollments || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            <p className="text-xs text-slate-500 uppercase font-medium">Total Claims</p>
                            <p className="text-2xl font-bold mt-1">{stats.totalClaims || 0}</p>
                            <p className="text-xs text-slate-400">Approved: {stats.approvedClaims || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            <p className="text-xs text-slate-500 uppercase font-medium">Claim Approval Rate</p>
                            <p className="text-2xl font-bold mt-1">{stats.claimApprovalRate || 0}%</p>
                            <p className="text-xs text-slate-400">Denied: {stats.deniedClaims || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            <p className="text-xs text-slate-500 uppercase font-medium">Total Dependents</p>
                            <p className="text-2xl font-bold mt-1">{stats.totalDependents || 0}</p>
                            <p className="text-xs text-slate-400">Avg: {stats.averageDependentsPerEmployee || 0}/employee</p>
                        </div>
                    </div>

                    {/* Charts Placeholder */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-20">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-[300px] flex flex-col">
                            <h3 className="font-bold text-lg mb-6">Cost Distribution</h3>
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-sm text-slate-500 mb-2">Employee Contributions</p>
                                    <p className="text-3xl font-bold text-indigo-600">{formatCurrency(stats.employeeContributions || 0)}</p>
                                    <p className="text-sm text-slate-500 mt-4 mb-2">Employer Contributions</p>
                                    <p className="text-3xl font-bold text-emerald-600">{formatCurrency(stats.employerContributions || 0)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-[300px] flex flex-col">
                            <h3 className="font-bold text-lg mb-6">Claims Summary</h3>
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-sm text-slate-500 mb-2">Total Claimed</p>
                                    <p className="text-3xl font-bold text-ink-black dark:text-pearl">{formatCurrency(stats.totalClaimAmount || 0)}</p>
                                    <p className="text-sm text-slate-500 mt-4 mb-2">Total Paid</p>
                                    <p className="text-3xl font-bold text-emerald-600">{formatCurrency(stats.totalPaidAmount || 0)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

