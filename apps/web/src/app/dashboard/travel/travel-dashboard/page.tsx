"use client";

import React, { useState, useEffect } from 'react';
import { Plane, Calendar, CreditCard, Clock, Plus, FileText, Globe, Loader2 } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TravelAnalyticsService } from '../services';
import { TravelRequestService } from '../services';

export default function TravelDashboardPage() {
    const [metrics, setMetrics] = useState<any>(null);
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [metricsData, requestsData] = await Promise.all([
                TravelAnalyticsService.getMetrics(),
                TravelRequestService.getRequests(),
            ]);
            setMetrics(metricsData);
            setTrips(Array.isArray(requestsData) ? requestsData : []);
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
                <span className="ml-2 text-sm text-slate-500">Loading travel dashboard...</span>
            </div>
        );
    }

    const spendData = [
        { month: 'Jan', amount: 0 },
        { month: 'Feb', amount: 0 },
        { month: 'Mar', amount: 0 },
        { month: 'Apr', amount: 0 },
        { month: 'May', amount: 0 },
        { month: 'Jun', amount: metrics?.totalTravelCost || 0 },
    ];

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <Plane className="w-8 h-8 text-indigo-500" />
                        Travel Dashboard
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Manage your trips, expenses, and approvals.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        <FileText className="w-5 h-5" /> File Expense
                    </button>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                        <Plus className="w-5 h-5" /> New Trip Request
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard title="Total Requests" value={String(metrics?.totalRequests || 0)} icon={Globe} color="text-indigo-500" bg="bg-indigo-50 dark:bg-indigo-500/10" />
                <StatCard title="Pending Approvals" value={String(metrics?.pendingRequests || 0)} icon={Clock} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-500/10" />
                <StatCard title="YTD Spend" value={`$${((metrics?.totalTravelCost || 0) / 1000).toFixed(1)}k`} icon={CreditCard} color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-500/10" />
                <StatCard title="Approved" value={String(metrics?.approvedRequests || 0)} icon={Calendar} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-500/10" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-500" /> Recent Trips
                    </h3>
                    {trips.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Plane className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No trips found</p>
                            <p className="text-sm mt-1">Create a new trip request to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {trips.map((trip: any) => (
                                <div key={trip.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                            <Plane className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-slate-100">{trip.destination || trip.title || 'Trip'}</div>
                                            <div className="text-sm text-slate-500">{new Date(trip.departureDate || trip.createdAt).toLocaleDateString()} {trip.purpose || ''}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="font-bold text-slate-700 dark:text-slate-300 text-right">
                                            ${trip.estimatedCost || trip.amount || 0}
                                            <div className={`text-xs ${trip.status === 'approved' ? 'text-emerald-500' : trip.status === 'pending' ? 'text-amber-500' : 'text-slate-400'}`}>{trip.status}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-500" /> Spend Trend
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={spendData}>
                                <defs>
                                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                                <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorSpend)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-4">
                        <div className="text-xs text-slate-500 font-bold uppercase">Total Spend</div>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${(metrics?.totalTravelCost || 0).toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className={`p-4 rounded-xl ${bg} ${color}`}>
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
                <div className="text-sm font-bold text-slate-500">{title}</div>
            </div>
        </div>
    );
}

