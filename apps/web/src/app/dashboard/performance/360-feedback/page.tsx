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
    Star
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

// --- MOCK DATA ---

const FEEDBACK_DATA = [
    { subject: 'Leadership', self: 4, peers: 4.5, manager: 4 },
    { subject: 'Communication', self: 5, peers: 4, manager: 4.5 },
    { subject: 'Technical', self: 3, peers: 4.5, manager: 5 },
    { subject: 'Collaboration', self: 5, peers: 5, manager: 4.5 },
    { subject: 'Innovation', self: 3.5, peers: 4, manager: 3.5 },
    { subject: 'Mentorship', self: 3, peers: 4, manager: 4 },
];

const NOMINATIONS = [
    { id: 1, name: 'Alice Johnson', role: 'Product Manager', status: 'Accepted', avatar: 'AJ' },
    { id: 2, name: 'Bob Smith', role: 'Senor Dev', status: 'Pending', avatar: 'BS' },
    { id: 3, name: 'Charlie Davis', role: 'QA Lead', status: 'Completed', avatar: 'CD' },
];

const COMMENTS = [
    {
        id: 1,
        text: "Great at breaking down complex technical concepts for the product team. Would love to see more proactive updates during sprint planning.",
        tag: "Communication",
        sentiment: "positive",
        date: "2 days ago"
    },
    {
        id: 2,
        text: "Always willing to help junior devs. A true technical mentor for the squad.",
        tag: "Mentorship",
        sentiment: "positive",
        date: "1 week ago"
    }
];

export default function ThreeSixtyFeedbackPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'nominations'>('overview');

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        360° Feedback
                    </h1>
                    <p className="text-silver-mist text-sm">Review cycle: Q4 2025 • Status: <span className="text-emerald-500 font-bold">Active</span></p>
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                    {/* Left: Radar Chart */}
                    <div className="lg:col-span-1 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-2 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-500" /> Competency Gap
                        </h3>
                        <p className="text-xs text-silver-mist mb-6">Self perception vs Peer/Manager reality.</p>

                        <div className="flex-1 min-h-[300px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={FEEDBACK_DATA}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Self"
                                        dataKey="self"
                                        stroke="#94a3b8"
                                        strokeWidth={2}
                                        fill="#94a3b8"
                                        fillOpacity={0.1}
                                    />
                                    <Radar
                                        name="Peers"
                                        dataKey="peers"
                                        stroke="#6366f1"
                                        strokeWidth={2}
                                        fill="#6366f1"
                                        fillOpacity={0.3}
                                    />
                                    <Radar
                                        name="Manager"
                                        dataKey="manager"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fill="#10b981"
                                        fillOpacity={0.1}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl">
                            <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 mb-2 flex items-center gap-2">
                                <Star className="w-4 h-4 fill-current" /> key Insight
                            </h4>
                            <p className="text-xs text-indigo-600 dark:text-indigo-300 leading-relaxed">
                                You rated yourself significantly lower on <strong>Technical Skills</strong> (3.0) than your manager did (5.0). Don't sell yourself short!
                            </p>
                        </div>
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
                            {COMMENTS.map(comment => (
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
                            ))}
                            {/* Hidden/Locked Feedback Mock */}
                            <div className="p-8 rounded-xl border border-dashed border-cloud dark:border-slate-800 flex flex-col items-center justify-center text-center opacity-70">
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
                                    <Users className="w-5 h-5 text-slate-400" />
                                </div>
                                <span className="text-sm font-bold text-slate-500">3 More anonymous responses</span>
                                <span className="text-xs text-slate-400">Available after review cycle closes</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Suggest Peers */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-indigo-500" /> Nominate Peers
                        </h3>
                        <p className="text-sm text-silver-mist mb-6">Select up to 5 colleagues who you&apos;ve worked closely with in the last 6 months.</p>

                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder="Search by name or role..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-bold"
                            />
                            <Users className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>

                        <div className="space-y-2">
                            <div className="p-3 border border-cloud dark:border-slate-800 rounded-xl hover:border-indigo-500 transition-colors cursor-pointer group flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold">
                                        JD
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-ink-black dark:text-pearl">John Doe</div>
                                        <div className="text-xs text-silver-mist">Backend Lead</div>
                                    </div>
                                </div>
                                <button className="p-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Current Nominations Status */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-500" /> Nomination Status
                        </h3>
                        <div className="space-y-4">
                            {NOMINATIONS.map(nom => (
                                <div key={nom.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-300">
                                            {nom.avatar}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-ink-black dark:text-pearl">{nom.name}</div>
                                            <div className="text-xs text-silver-mist">{nom.role}</div>
                                        </div>
                                    </div>

                                    {nom.status === 'Accepted' && (
                                        <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-1 rounded">Accepted</span>
                                    )}
                                    {nom.status === 'Pending' && (
                                        <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-1 rounded">Pending</span>
                                    )}
                                    {nom.status === 'Completed' && (
                                        <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 px-2 py-1 rounded">Feedback Submitted</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
