"use client";

import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    PieChart,
    Loader2
} from 'lucide-react';
import { PolicyAnalyticsService } from '../services';

export default function ComplianceTrackingPage() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await PolicyAnalyticsService.get();
                setAnalytics(data);
            } catch {
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const overallCompliance = analytics?.overallCompliance || 0;
    const acknowledgementRate = analytics?.acknowledgementRate || 0;

    const complianceAreas = [
        { area: 'Policy Acknowledgement', score: `${acknowledgementRate}%`, status: acknowledgementRate >= 90 ? 'Excellent' : acknowledgementRate >= 70 ? 'Good' : 'Needs Attention', color: acknowledgementRate >= 90 ? 'bg-emerald-500' : acknowledgementRate >= 70 ? 'bg-teal-500' : 'bg-amber-500' },
        { area: 'Overall Compliance', score: `${overallCompliance}%`, status: overallCompliance >= 90 ? 'Excellent' : overallCompliance >= 70 ? 'Good' : 'Needs Attention', color: overallCompliance >= 90 ? 'bg-emerald-500' : overallCompliance >= 70 ? 'bg-teal-500' : 'bg-amber-500' },
        { area: 'Published Policies', score: `${analytics?.publishedPolicies || 0}`, status: 'Active', color: 'bg-indigo-500' },
        { area: 'Pending Approvals', score: `${analytics?.pendingApprovals || 0}`, status: analytics?.pendingApprovals > 0 ? 'Action Required' : 'Clear', color: analytics?.pendingApprovals > 0 ? 'bg-amber-500' : 'bg-emerald-500' },
    ];

    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-indigo-500" />
                        Compliance Tracking
                    </h1>
                    <p className="text-slate-500 text-sm">Regulatory compliance and risk adherence dashboard.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center min-h-[300px]">
                    <div className="text-center">
                        <PieChart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="font-bold text-slate-500">Overall Adherence</h3>
                        <p className="text-3xl font-bold mt-2 text-indigo-600">{overallCompliance}%</p>
                        <p className="text-sm text-slate-400 mt-2">Total Policies: {analytics?.totalPolicies || 0}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {complianceAreas.map((item, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <div className="font-bold text-sm mb-1">{item.area}</div>
                                    <div className="text-xs text-slate-500 font-bold">{item.status}</div>
                                </div>
                                <div className="text-2xl font-bold font-mono">{item.score}</div>
                            </div>
                            {item.score.includes('%') && (
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: item.score }}></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

