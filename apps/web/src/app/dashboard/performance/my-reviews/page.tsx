"use client";

import React, { useState, useEffect } from 'react';
import { PerformanceReviewService, GoalService } from '../core/services';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend
} from 'recharts';
import {
    CheckCircle2,
    Circle,
    Target,
    TrendingUp,
    MessageSquare,
    Award,
    Calendar,
    ChevronRight,
    Star,
    MoreHorizontal,
    Loader2
} from 'lucide-react';

const DEFAULT_COMPETENCY_DATA = [
    { subject: 'Leadership', A: 0, B: 0, fullMark: 150 },
    { subject: 'Technical', A: 0, B: 0, fullMark: 150 },
    { subject: 'Comm.', A: 0, B: 0, fullMark: 150 },
    { subject: 'Strategy', A: 0, B: 0, fullMark: 150 },
    { subject: 'Mentoring', A: 0, B: 0, fullMark: 150 },
    { subject: 'Innovation', A: 0, B: 0, fullMark: 150 },
];

const DEFAULT_TIMELINE = [
    { id: '1', label: 'Self Review', status: 'pending', date: '' },
    { id: '2', label: 'Manager Review', status: 'pending', date: '' },
    { id: '3', label: '1:1 Discussion', status: 'pending', date: '' },
    { id: '4', label: 'Sign-off', status: 'pending', date: '' },
];

export default function PerformanceReviewsPage() {
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<any[]>([]);
    const [goals, setGoals] = useState<any[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const [reviewData, goalData] = await Promise.all([
                    PerformanceReviewService.getReviews(),
                    GoalService.getGoals(),
                ]);
                setReviews(reviewData);
                setGoals(goalData);
            } catch (error) {
                console.error('Failed to load performance data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const activeReview = reviews.find(r => r.status !== 'completed') || reviews[0];
    const competencyData = activeReview?.competencies
        ? (activeReview.competencies as any[]).map((c: any) => ({
            subject: c.subject || c.name,
            A: c.selfScore || 0,
            B: c.managerScore || 0,
            fullMark: 150,
        }))
        : DEFAULT_COMPETENCY_DATA;

    const timelineSteps = activeReview
        ? [
            { id: '1', label: 'Self Review', status: activeReview.selfRating ? 'completed' : (activeReview.status === 'draft' ? 'current' : 'pending'), date: activeReview.startDate ? new Date(activeReview.startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : '' },
            { id: '2', label: 'Manager Review', status: activeReview.managerRating ? 'completed' : (activeReview.selfRating ? 'current' : 'pending'), date: '' },
            { id: '3', label: '1:1 Discussion', status: activeReview.status === 'completed' ? 'completed' : (activeReview.managerRating ? 'current' : 'pending'), date: '' },
            { id: '4', label: 'Sign-off', status: activeReview.status === 'completed' ? 'completed' : 'pending', date: activeReview.endDate ? new Date(activeReview.endDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : '' },
        ]
        : DEFAULT_TIMELINE;

    const displayGoals = goals.slice(0, 4).map(g => ({
        id: g.id,
        title: g.title,
        progress: g.progress || 0,
        status: g.status === 'completed' ? 'Completed' : g.progress < 30 ? 'At Risk' : 'On Track',
        dueDate: g.dueDate ? new Date(g.dueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : 'No date',
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-celestial-indigo" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Award className="w-6 h-6 text-celestial-indigo" />
                        My Performance
                    </h1>
                    <p className="text-silver-mist text-sm">
                        {activeReview?.cycle?.cycleName || 'No active review cycle'}
                    </p>
                </div>
                <button className="px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
                    Download Report
                </button>
            </div>

            {/* Review Cycle Timeline */}
            <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                <h3 className="font-bold text-ink-black dark:text-pearl mb-6">Current Cycle Progress</h3>
                <div className="relative flex justify-between">
                    {/* Line */}
                    <div className="absolute top-3 left-0 w-full h-0.5 bg-cloud dark:bg-nebula-purple/20 -z-10" />

                    {timelineSteps.map((step) => {
                        const isCompleted = step.status === 'completed';
                        const isCurrent = step.status === 'current';

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white dark:bg-stellar-blue ${isCompleted ? 'border-emerald-500 text-emerald-500' :
                                        isCurrent ? 'border-celestial-indigo text-celestial-indigo ring-4 ring-celestial-indigo/10' :
                                            'border-slate-300 dark:border-slate-600'
                                    }`}>
                                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 fill-current opacity-0" />}
                                </div>
                                <div className="text-center">
                                    <div className={`text-sm font-semibold ${isCurrent ? 'text-celestial-indigo' : 'text-ink-black dark:text-pearl'}`}>{step.label}</div>
                                    <div className="text-xs text-silver-mist">{step.date}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Radar Chart */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm h-96 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <Target className="w-5 h-5 text-quantum-rose" />
                            Competency Assessment
                        </h3>
                        <div className="flex gap-3 text-xs">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-celestial-indigo" /> Self</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-quantum-rose" /> Manager</div>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius="70%" data={competencyData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar name="Self" dataKey="B" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                                <Radar name="Manager" dataKey="A" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Goals */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm h-96 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            Goals & OKRs
                        </h3>
                        <button className="text-xs font-medium text-celestial-indigo hover:underline">View All</button>
                    </div>

                    {displayGoals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-silver-mist">
                            <Target className="w-10 h-10 mb-2 opacity-30" />
                            <p className="text-sm font-medium">No goals set yet</p>
                            <p className="text-xs">Create goals from the Goal Setting page</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {displayGoals.map(goal => (
                                <div key={goal.id}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="font-medium text-ink-black dark:text-pearl">{goal.title}</span>
                                        <span className={`text-xs font-bold ${goal.status === 'At Risk' ? 'text-red-500' :
                                                goal.status === 'Completed' ? 'text-emerald-500' : 'text-celestial-indigo'
                                            }`}>{goal.progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-cloud dark:bg-deep-cosmos rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${goal.status === 'At Risk' ? 'bg-red-500' :
                                                    goal.status === 'Completed' ? 'bg-emerald-500' : 'bg-celestial-indigo'
                                                }`}
                                            style={{ width: `${goal.progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] text-silver-mist">Due: {goal.dueDate}</span>
                                        <span className="text-[10px] text-silver-mist">{goal.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Feedback Wall */}
            <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                <h3 className="font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-500" />
                    Recent Feedback
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reviews.length > 0 && reviews[0]?.managerComments ? (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-deep-cosmos/50 border border-cloud dark:border-nebula-purple/20">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-celestial-indigo font-bold text-sm">
                                    M
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-ink-black dark:text-pearl">Manager</div>
                                    <div className="text-xs text-silver-mist">Review feedback</div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{reviews[0].managerComments}"</p>
                        </div>
                    ) : null}
                    <button className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-cloud dark:border-nebula-purple/30 hover:border-celestial-indigo/50 hover:bg-slate-50 dark:hover:bg-deep-cosmos/30 transition-colors text-silver-mist hover:text-celestial-indigo gap-2">
                        <div className="w-8 h-8 rounded-full bg-cloud dark:bg-deep-cosmos flex items-center justify-center">
                            <Star className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">Request Feedback</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

