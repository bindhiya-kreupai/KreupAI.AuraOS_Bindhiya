"use client";

import React, { useState, useEffect } from 'react';
import {
    BarChart,
    PieChart,
    TrendingUp,
    Download,
    Loader2
} from 'lucide-react';
import { AnalyticsService, AgentManagementService } from '../services';
import type { Agent } from '../types';

export default function HelpdeskAnalyticsPage() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const now = new Date();
                const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
                const [analyticsData, agentsData] = await Promise.all([
                    AnalyticsService.getAnalytics(startDate, now.toISOString()),
                    AgentManagementService.getAllAgents(),
                ]);
                setAnalytics(analyticsData);
                setAgents(agentsData);
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

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart className="w-6 h-6 text-indigo-500" />
                        Analytics
                    </h1>
                    <p className="text-slate-500 text-sm">Deep dive into helpdesk performance metrics.</p>
                </div>
                <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center gap-2 text-sm font-bold">
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-80 flex flex-col items-center justify-center text-slate-400">
                    <PieChart className="w-16 h-16 opacity-20 mb-4" />
                    <span className="font-bold">Ticket Volume by Category</span>
                    <span className="text-sm mt-2">Total: {analytics?.ticketMetrics?.totalTickets || 0} tickets</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-80 flex flex-col items-center justify-center text-slate-400">
                    <TrendingUp className="w-16 h-16 opacity-20 mb-4" />
                    <span className="font-bold">Avg Resolution Time Trend</span>
                    <span className="text-sm mt-2">Avg: {analytics?.ticketMetrics?.averageResolutionTime || 0}min</span>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Agent Performance</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Agent Name</th>
                                <th className="px-6 py-4">Tickets Resolved</th>
                                <th className="px-6 py-4">Avg Resolution Time</th>
                                <th className="px-6 py-4">SLA Compliance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {agents.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No agent data available.</td>
                                </tr>
                            ) : (
                                agents.map((agent, i) => (
                                    <tr key={agent.agentId || i}>
                                        <td className="px-6 py-4 font-bold">{agent.employeeName}</td>
                                        <td className="px-6 py-4">{agent.performance?.ticketsResolved || 0}</td>
                                        <td className="px-6 py-4">{agent.performance?.averageResolutionTime || 0}min</td>
                                        <td className="px-6 py-4 font-bold text-emerald-600">{agent.performance?.slaComplianceRate || 0}%</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

