"use client";

import React, { useState, useEffect } from 'react';
import {
    DoorOpen,
    PieChart,
    MessageSquare,
    ThumbsDown,
    ThumbsUp,
    AlertCircle,
    ArrowRight,
    Users,
    Search,
    Filter,
    Briefcase,
    DollarSign,
    UserX,
    Loader2
} from 'lucide-react';
import {
    PieChart as RePieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import { ExitInterviewService } from '../services';
import { OffboardingAnalyticsService } from '../services';

interface InterviewRecord {
    id: string;
    employeeName: string;
    positionTitle?: string;
    departmentName?: string;
    conductedDate?: string | null;
    scheduledDate?: string;
    reason: string;
    overallSentiment: string;
    rehireEligible: boolean;
    openToRehire: boolean;
    notes?: string;
    exitType?: string;
    status: string;
}

const SENTIMENT_COLORS: Record<string, string> = {
    'Better Opportunity': '#6366f1',
    Compensation: '#10b981',
    Management: '#f59e0b',
    Personal: '#ec4899',
    Relocation: '#64748b',
    'Not specified': '#94a3b8',
};

const DEFAULT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#64748b', '#94a3b8', '#3b82f6', '#f43f5e'];

export default function ExitInterviewsPage() {
    const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [interviewData, metricsData] = await Promise.all([
                    ExitInterviewService.getExitInterviews(),
                    OffboardingAnalyticsService.getMetrics(),
                ]);

                const mapped: InterviewRecord[] = (interviewData || []).map((i: any) => ({
                    id: i.id,
                    employeeName: i.employeeName || 'Unknown',
                    positionTitle: i.positionTitle || '',
                    departmentName: i.departmentName || '',
                    conductedDate: i.conductedDate,
                    scheduledDate: i.scheduledDate,
                    reason: i.reason || 'Not specified',
                    overallSentiment: i.overallSentiment || 'neutral',
                    rehireEligible: i.rehireEligible ?? i.openToRehire ?? false,
                    openToRehire: i.openToRehire ?? false,
                    notes: i.notes || '',
                    exitType: i.exitType || '',
                    status: i.status || 'scheduled',
                }));

                setInterviews(mapped);
                setMetrics(metricsData);
            } catch (error: any) {
                console.error('Error fetching exit interviews:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading exit interviews...</p>
                </div>
            </div>
        );
    }

    // Build attrition reasons from interview data
    const reasonCounts: Record<string, number> = {};
    interviews.forEach((i) => {
        const reason = i.reason || 'Not specified';
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });
    const attritionReasons = Object.entries(reasonCounts).map(([name, value], idx) => ({
        name,
        value,
        color: SENTIMENT_COLORS[name] || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
    }));

    const totalExits = interviews.length;
    const completedInterviews = interviews.filter(i => i.status === 'completed').length;
    const rehireEligibleCount = interviews.filter(i => i.rehireEligible).length;
    const rehirePercentage = totalExits > 0 ? Math.round((rehireEligibleCount / totalExits) * 100) : 0;
    const avgTenure = metrics?.avgTenure || 0;

    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <DoorOpen className="w-6 h-6 text-rose-500" />
                        Exit Interviews
                    </h1>
                    <p className="text-silver-mist text-sm">Analyze attrition drivers and departure feedback.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-rose-500/20">
                        Download Report
                    </button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-silver-mist uppercase">Total Exits</div>
                        <UserX className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-3xl font-bold text-ink-black dark:text-pearl">{totalExits}</div>
                    <div className="text-xs text-slate-400 mt-1">All time</div>
                </div>

                <div className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-silver-mist uppercase">Avg Tenure</div>
                        <Briefcase className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="text-3xl font-bold text-ink-black dark:text-pearl">{avgTenure} <span className="text-base font-normal text-slate-400">yrs</span></div>
                    <div className="text-xs text-slate-400 mt-1">Average employee tenure</div>
                </div>

                <div className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-silver-mist uppercase">Interviews Done</div>
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-3xl font-bold text-ink-black dark:text-pearl">{completedInterviews}</div>
                    <div className="text-xs text-slate-400 mt-1">Completed interviews</div>
                </div>

                <div className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-silver-mist uppercase">Rehire Eligible</div>
                        <ThumbsUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-bold text-ink-black dark:text-pearl">{rehirePercentage}%</div>
                    <div className="text-xs text-emerald-500 mt-1 font-bold">Good terms</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Left: Attrition Chart */}
                <div className="lg:col-span-1 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col">
                    <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-indigo-500" /> Reasons for Leaving
                    </h3>
                    {attritionReasons.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-sm text-silver-mist">
                            No data available yet.
                        </div>
                    ) : (
                        <div className="flex-1 min-h-[250px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={attritionReasons}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {attritionReasons.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                                </RePieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                                <div className="text-2xl font-black text-ink-black dark:text-pearl">{totalExits}</div>
                                <div className="text-[10px] uppercase text-silver-mist font-bold">Total</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Recent Interviews */}
                <div className="lg:col-span-2 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-500" /> Recent Feedback
                        </h3>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search feedback..."
                                className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs"
                            />
                        </div>
                    </div>

                    {interviews.length === 0 ? (
                        <div className="py-12 text-center text-sm text-silver-mist">
                            No exit interviews found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {interviews.map((interview) => (
                                <div key={interview.id} className="p-4 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-slate-50/50 dark:bg-slate-900/20 hover:border-indigo-200 transition-colors group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                {interview.employeeName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-ink-black dark:text-pearl text-sm">{interview.employeeName}</div>
                                                <div className="text-xs text-silver-mist">
                                                    {interview.positionTitle && `${interview.positionTitle} `}
                                                    {interview.departmentName && `- ${interview.departmentName}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase
                                            ${interview.overallSentiment === 'positive' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                                interview.overallSentiment === 'negative' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                                                    'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                                            }`
                                        }>
                                            {interview.overallSentiment} Feedback
                                        </div>
                                    </div>

                                    <div className="pl-13 ml-13">
                                        {interview.notes && (
                                            <div className="relative bg-white dark:bg-slate-800 p-3 rounded-lg border border-cloud dark:border-slate-700">
                                                <div className="absolute -left-2 top-4 w-4 h-4 bg-white dark:bg-slate-800 border-l border-b border-cloud dark:border-slate-700 transform rotate-45"></div>
                                                <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">"{interview.notes}"</p>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 mt-3 text-[10px] text-silver-mist font-bold uppercase">
                                            <span className="flex items-center gap-1">
                                                <UserX className="w-3 h-3" /> Reason: {interview.reason}
                                            </span>
                                            <span className={`flex items-center gap-1 ${interview.rehireEligible ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {interview.rehireEligible ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
                                                Rehire: {interview.rehireEligible ? 'Yes' : 'No'}
                                            </span>
                                            <span className="ml-auto flex items-center gap-1 text-indigo-500 cursor-pointer hover:underline">
                                                Full Report <ArrowRight className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

