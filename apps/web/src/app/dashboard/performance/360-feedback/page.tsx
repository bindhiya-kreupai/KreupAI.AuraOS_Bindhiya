"use client";

import React, { useState, useEffect } from 'react';
import { PerformanceReviewService } from '../core/services';
import {
    Users,
    MessageSquare,
    Send,
    UserPlus,
    CheckCircle2,
    Clock,
    TrendingUp,
    ChevronDown,
    MoreHorizontal,
    ThumbsUp,
    AlertCircle,
    Star,
    Loader2
} from 'lucide-react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';

const DEFAULT_FEEDBACK_DATA = [
    { subject: 'Leadership', self: 0, peers: 0, manager: 0 },
    { subject: 'Communication', self: 0, peers: 0, manager: 0 },
    { subject: 'Technical', self: 0, peers: 0, manager: 0 },
    { subject: 'Collaboration', self: 0, peers: 0, manager: 0 },
    { subject: 'Innovation', self: 0, peers: 0, manager: 0 },
    { subject: 'Mentorship', self: 0, peers: 0, manager: 0 },
];

export default function ThreeSixtyFeedbackPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'nominations'>('overview');
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<any[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await PerformanceReviewService.getReviews();
                setReviews(data);
            } catch (error) {
                console.error('Failed to load 360 feedback data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const activeReview = reviews.find(r => r.reviewType === '360' || r.reviewType === 'annual') || reviews[0];

    const feedbackData = activeReview?.competencies
        ? (activeReview.competencies as any[]).map((c: any) => ({
            subject: c.subject || c.name || 'Unknown',
            self: c.selfScore || 0,
            peers: c.peerScore || 0,
            manager: c.managerScore || 0,
        }))
        : DEFAULT_FEEDBACK_DATA;

    const comments = activeReview?.managerComments
        ? [{ id: 1, text: activeReview.managerComments, tag: 'Manager Feedback', sentiment: 'positive', date: 'Recent' }]
        : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        360 Feedback
                    </h1>
                    <p className="text-silver-mist text-sm">
                        {activeReview?.cycle?.cycleName || 'Current Review Cycle'} {' '}
                        Status: <span className="text-emerald-500 font-bold">{activeReview?.status || 'No active review'}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white dark:bg-stellar-blue p-1 rounded-xl border border-cloud dark:border-nebula-purple/50">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'text-slate-500 hover:text-indigo-500'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('nominations')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'nominations' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'text-slate-500 hover:text-indigo-500'}`}
                        >
                            Nominations
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'overview' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                    {/* Left: Radar Chart */}
                    <div className="lg:col-span-1 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-2 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-500" /> Competency Gap
                        </h3>
                        <p className="text-xs text-silver-mist mb-6">Self perception vs Peer/Manager reality.</p>

                        <div className="flex-1 min-h-[300px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={feedbackData}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                                    <Radar name="Self" dataKey="self" stroke="#94a3b8" strokeWidth={2} fill="#94a3b8" fillOpacity={0.1} />
                                    <Radar name="Peers" dataKey="peers" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.3} />
                                    <Radar name="Manager" dataKey="manager" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.1} />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {reviews.length === 0 && (
                            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                                <p className="text-xs text-silver-mist leading-relaxed text-center">
                                    No 360 feedback data available yet. Complete your review cycle to see competency insights.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right: Feedback Stream */}
                    <div className="lg:col-span-2 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-emerald-500" /> Qualitative Feedback
                            </h3>
                            <button className="text-xs font-bold text-indigo-500 hover:underline">Download Report</button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            {comments.length === 0 ? (
                                <div className="p-8 rounded-xl border border-dashed border-cloud dark:border-slate-800 flex flex-col items-center justify-center text-center">
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
                                        <MessageSquare className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-500">No feedback responses yet</span>
                                    <span className="text-xs text-slate-400">Feedback will appear after review cycle completes</span>
                                </div>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="p-4 rounded-xl border border-cloud dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold uppercase bg-white dark:bg-slate-800 text-slate-500 px-2 py-1 rounded border border-cloud dark:border-slate-700">
                                                {comment.tag}
                                            </span>
                                            <div className="flex items-center gap-1 text-[10px] text-silver-mist">
                                                <Clock className="w-3 h-3" /> {comment.date}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 italic mb-3">"{comment.text}"</p>
                                        <div className="flex items-center gap-2">
                                            <ThumbsUp className="w-3 h-3 text-emerald-500" />
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Constructive</span>
                                        </div>
                                    </div>
                                ))
                            )}
                            {/* Locked Feedback */}
                            <div className="p-8 rounded-xl border border-dashed border-cloud dark:border-slate-800 flex flex-col items-center justify-center text-center opacity-70">
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
                                    <Users className="w-5 h-5 text-slate-400" />
                                </div>
                                <span className="text-sm font-bold text-slate-500">Anonymous responses</span>
                                <span className="text-xs text-slate-400">Available after review cycle closes</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {/* Suggest Peers */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-indigo-500" /> Nominate Peers
                        </h3>
                        <p className="text-sm text-silver-mist mb-6">Select up to 5 colleagues who you've worked closely with in the last 6 months.</p>

                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder="Search by name or role..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-bold"
                            />
                            <Users className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>

                        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                            <Users className="w-8 h-8 mb-2 opacity-30" />
                            <p className="text-sm">Search for colleagues to nominate</p>
                        </div>
                    </div>

                    {/* Current Nominations Status */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-500" /> Nomination Status
                        </h3>
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <CheckCircle2 className="w-8 h-8 mb-2 opacity-30" />
                            <p className="text-sm font-medium">No nominations yet</p>
                            <p className="text-xs mt-1">Nominate peers from the left panel</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

