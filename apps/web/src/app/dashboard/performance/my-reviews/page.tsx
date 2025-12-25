"use client";

import React, { useState, useEffect } from 'react';
import { PerformanceReviewService } from '../core/services';
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
    MoreHorizontal
} from 'lucide-react';

// --- MOCK DATA ---

const COMPETENCY_DATA = [
    { subject: 'Leadership', A: 120, B: 110, fullMark: 150 },
    { subject: 'Technical', A: 98, B: 130, fullMark: 150 },
    { subject: 'Comm.', A: 86, B: 130, fullMark: 150 },
    { subject: 'Strategy', A: 99, B: 100, fullMark: 150 },
    { subject: 'Mentoring', A: 85, B: 90, fullMark: 150 },
    { subject: 'Innovation', A: 65, B: 85, fullMark: 150 },
];

const GOALS = [
    { id: '1', title: 'Launch Mobile App v2.0', progress: 75, status: 'On Track', dueDate: 'Sep 30' },
    { id: '2', title: 'Reduce API Latency by 20%', progress: 40, status: 'At Risk', dueDate: 'Oct 15' },
    { id: '3', title: 'Hire 3 Senior Engineers', progress: 100, status: 'Completed', dueDate: 'Aug 01' },
    { id: '4', title: 'Complete Cloud Certification', progress: 10, status: 'On Track', dueDate: 'Dec 20' },
];

const FEEDBACK = [
    { id: '1', author: 'Sarah Chen', role: 'Product Manager', text: 'Exceptional work on the Q3 roadmap. Your strategic insights were invaluable.', date: '2 days ago' },
    { id: '2', author: 'Mike Ross', role: 'Engineering Lead', text: 'Great mentorship for the junior devs this sprint.', date: '1 week ago' },
];

const TIMELINE_STEPS = [
    { id: '1', label: 'Self Review', status: 'completed', date: 'Jul 01' },
    { id: '2', label: 'Manager Review', status: 'completed', date: 'Jul 10' },
    { id: '3', label: '1:1 Discussion', status: 'current', date: 'Due: Jul 15' },
    { id: '4', label: 'Sign-off', status: 'pending', date: 'Jul 20' },
];

export default function PerformanceReviewsPage() {
    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Award className="w-6 h-6 text-celestial-indigo" />
                        My Performance
                    </h1>
                    <p className="text-silver-mist text-sm">Review cycle: H2 2024 (July - Dec)</p>
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

                    {TIMELINE_STEPS.map((step, index) => {
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Radar Chart */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm h-96 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <Target className="w-5 h-5 text-quantum-rose" />
                            Competency Assessment
                        </h3>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-celestial-indigo" /> Self</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-quantum-rose" /> Manager</div>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius="70%" data={COMPETENCY_DATA}>
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

                    <div className="space-y-5">
                        {GOALS.map(goal => (
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
                </div>
            </div>

            {/* Feedback Wall */}
            <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                <h3 className="font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-500" />
                    Recent Feedback
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {FEEDBACK.map(f => (
                        <div key={f.id} className="p-4 rounded-xl bg-slate-50 dark:bg-deep-cosmos/50 border border-cloud dark:border-nebula-purple/20">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-celestial-indigo font-bold text-sm">
                                    {f.author.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-ink-black dark:text-pearl">{f.author}</div>
                                    <div className="text-xs text-silver-mist">{f.role}</div>
                                </div>
                                <div className="ml-auto text-[10px] text-silver-mist">{f.date}</div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{f.text}"</p>
                        </div>
                    ))}
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
