"use client";

import React, { useState, useEffect } from 'react';
import {
    Heart,
    TrendingUp,
    MessageCircle,
    Send,
    Users,
    Zap,
    Thermometer,
    Loader2
} from 'lucide-react';
import { SurveyService, EngagementAnalyticsService } from '../services';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

export default function PulseChecksPage() {
    const [loading, setLoading] = useState(true);
    const [currentMood, setCurrentMood] = useState(5);
    const [pulseSent, setPulseSent] = useState(false);
    const [metrics, setMetrics] = useState<any>(null);
    const [sentimentData, setSentimentData] = useState<any[]>([]);
    const [deptData, setDeptData] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [analyticsResult] = await Promise.all([
                EngagementAnalyticsService.getMetrics().catch(() => null),
                SurveyService.getSurveys().catch(() => []),
            ]);
            if (analyticsResult) {
                const data = (analyticsResult as any)?.data || analyticsResult;
                setMetrics(data);
            }
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const handleSendPulse = () => {
        setPulseSent(true);
        setTimeout(() => setPulseSent(false), 3000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const overallScore = metrics?.overallEngagementScore || 0;
    const participationRate = metrics?.surveyParticipationRate || 0;

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Heart className="w-6 h-6 text-rose-500" />
                        Team Pulse
                    </h1>
                    <p className="text-silver-mist text-sm">Real-time insights into employee sentiment and organizational health.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSendPulse}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        {pulseSent ? <CheckCircleIcon /> : <Send className="w-4 h-4" />}
                        {pulseSent ? 'Pulse Sent!' : 'Launch Pulse Check'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Thermometer className="w-32 h-32" />
                    </div>
                    <div className="text-sm font-bold text-silver-mist uppercase mb-2">Overall Vibe</div>
                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                        {overallScore > 0 ? overallScore.toFixed(1) : '--'}
                    </div>
                    {overallScore > 0 && (
                        <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm mt-2">
                            <TrendingUp className="w-4 h-4" /> Active
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative group overflow-hidden">
                    <div className="text-sm font-bold text-silver-mist uppercase mb-4">You feelin' it?</div>
                    <div className="relative h-12 flex items-center px-2">
                        <div className="absolute w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                        <input
                            type="range"
                            min="0" max="10"
                            value={currentMood}
                            onChange={(e) => setCurrentMood(parseInt(e.target.value))}
                            className="w-full absolute z-20 opacity-0 cursor-pointer h-12"
                        />
                        <motion.div
                            className="absolute z-10 w-10 h-10 bg-white dark:bg-slate-700 rounded-full shadow-md border border-slate-200 dark:border-slate-600 flex items-center justify-center text-2xl"
                            style={{ left: `${currentMood * 10}%`, transform: 'translateX(-50%)' }}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.2 }}
                        >
                            {currentMood < 4 ? '\uD83D\uDE2B' : currentMood < 7 ? '\uD83D\uDE10' : '\uD83E\uDD29'}
                        </motion.div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                        <span>Burned Out</span>
                        <span>Solid</span>
                        <span>Unstoppable</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-6 rounded-2xl shadow-lg border border-indigo-500/30 text-white flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <Zap className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase">Participation Rate</span>
                        </div>
                        <div className="text-4xl font-black">{participationRate}%</div>
                        <p className="text-xs opacity-70 mt-1">Based on survey responses</p>
                    </div>
                    <div className="w-full bg-black/20 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-white/90 h-full rounded-full" style={{ width: `${participationRate}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h3 className="font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" /> 30-Day Morale Trend
                    </h3>
                    {sentimentData.length > 0 ? (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sentimentData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">
                            No trend data available yet. Data will populate as pulse checks are submitted.
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h3 className="font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" /> Dept. Breakdown
                    </h3>
                    {deptData.length > 0 ? (
                        <div className="space-y-5">
                            {deptData.map((dept: any, idx: number) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{dept.name}</span>
                                        <span className="text-sm font-bold" style={{ color: dept.color }}>{dept.score}/10</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${dept.score * 10}%` }}
                                            transition={{ duration: 1, delay: idx * 0.1 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: dept.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                            No department breakdown data available yet.
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-stellar-blue p-8 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-indigo-500" /> What everyone's saying
                    </h3>
                </div>
                <div className="flex items-center justify-center min-h-[100px] text-slate-400 text-sm">
                    Feedback summaries will appear here as more pulse checks are collected.
                </div>
            </div>
        </div>
    );
}

function CheckCircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    )
}
