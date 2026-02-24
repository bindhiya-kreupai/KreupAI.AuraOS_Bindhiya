"use client";

import React, { useState, useEffect } from 'react';
import { PieChart as IconPieChart, Loader2 } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TravelAnalyticsService } from '../services';

export default function TravelAnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const metrics = await TravelAnalyticsService.getMetrics();
            setData(metrics);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="ml-2 text-sm text-slate-500">Loading travel analytics...</span>
            </div>
        );
    }

    const deptSpend = data?.travelByDepartment?.length > 0
        ? data.travelByDepartment
        : [
            { name: 'Total Approved', amount: data?.approvedRequests || 0 },
            { name: 'Total Rejected', amount: data?.rejectedRequests || 0 },
            { name: 'Total Pending', amount: data?.pendingRequests || 0 },
        ];

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <IconPieChart className="w-8 h-8 text-indigo-500" />
                        Travel Analytics
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Cost analysis and spending trends.</p>
                </div>
            </div>

            {!data || data.totalRequests === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <IconPieChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-medium">No analytics data available</p>
                    <p className="text-sm mt-2">Travel data will appear here once claims are submitted.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Request Overview</h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptSpend} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis type="number" stroke="#94a3b8" />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={120} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                                <Bar dataKey="amount" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-6">
                        <p className="text-slate-500 text-sm">
                            Total Travel Spend: <span className="font-bold text-slate-900 dark:text-slate-100">${data?.totalTravelCost?.toLocaleString() || '0'}</span>
                            {' | '}Average: <span className="font-bold text-slate-900 dark:text-slate-100">${data?.averageTravelCost?.toLocaleString() || '0'}</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

