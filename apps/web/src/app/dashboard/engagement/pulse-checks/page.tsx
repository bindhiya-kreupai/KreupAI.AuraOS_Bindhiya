"use client";

import React, { useState, useEffect } from 'react';
import {
    Heart,
    TrendingUp,
    MessageCircle,
    Send,
    Smile,
    Meh,
    Frown,
    Users,
    Zap,
    Thermometer
} from 'lucide-react';
import { SurveyService } from '../services';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { motion } from 'framer-motion';

// --- MOCK DATA ---

const SENTIMENT_TREND = [
    { date: 'Nov 01', score: 7.2 },
    { date: 'Nov 05', score: 7.5 },
    { date: 'Nov 10', score: 6.8 }, // Dip due to deadline?
    { date: 'Nov 15', score: 7.8 },
    { date: 'Nov 20', score: 8.1 },
    { date: 'Nov 25', score: 8.3 },
    { date: 'Nov 30', score: 8.5 },
];

const DEPT_MOODS = [
    { name: 'Product Design', score: 8.8, color: '#10b981' }, // Happy
    { name: 'Engineering', score: 7.2, color: '#6366f1' },    // Okay
    { name: 'Marketing', score: 8.1, color: '#10b981' },      // Happy
    { name: 'Sales', score: 6.5, color: '#f59e0b' },          // Stressed
    { name: 'Cust. Support', score: 5.4, color: '#ef4444' },  // Upset
];

const WORD_CLOUD = [
    { text: 'Collaborative', size: 'text-3xl', color: 'text-indigo-500' },
    { text: 'Burnout', size: 'text-xl', color: 'text-rose-400' },
    { text: 'Exciting', size: 'text-2xl', color: 'text-emerald-500' },
    { text: 'Meetings', size: 'text-lg', color: 'text-slate-400' },
    { text: 'Growth', size: 'text-2xl', color: 'text-amber-500' },
    { text: 'Supportive', size: 'text-xl', color: 'text-blue-500' },
    { text: 'Deadline', size: 'text-lg', color: 'text-rose-500' },
    { text: 'Flexible', size: 'text-2xl', color: 'text-teal-500' },
];

export default function PulseChecksPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMood, setCurrentMood] = useState(5);
    const [pulseSent, setPulseSent] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const surveys = await SurveyService.getSurveys();
            setData(surveys);
        } catch {
                    } finally {
            setLoading(false);
        }
    };

    const handleSendPulse = () => {
        setPulseSent(true);
        setTimeout(() => setPulseSent(false), 3000);
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
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

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Thermometer className="w-32 h-32" />
                    </div>
                    <div className="text-sm font-bold text-silver-mist uppercase mb-2">Overall Vibe</div>
                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                        7.8
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm mt-2">
                        <TrendingUp className="w-4 h-4" /> +0.6 vs Last Week
                    </div>
                </div>

                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative group overflow-hidden">
                    <div className="text-sm font-bold text-silver-mist uppercase mb-4">You feelin&apos; it?</div>
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
                            {currentMood < 4 ? '😫' : currentMood < 7 ? '😐' : '🤩'}
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
                        <div className="text-4xl font-black">84%</div>
                        <p className="text-xs opacity-70 mt-1">112/134 employees responded</p>
                    </div>
                    <div className="w-full bg-black/20 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-white/90 h-full rounded-full w-[84%]"></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sentiment Trend Chart */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h3 className="font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" /> 30-Day Morale Trend
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={SENTIMENT_TREND}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Function Breakdown */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h3 className="font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" /> Dept. Breakdown
                    </h3>
                    <div className="space-y-5">
                        {DEPT_MOODS.map((dept, idx) => (
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
                </div>
            </div>

            {/* Word Cloud / Feedback */}
            <div className="bg-white dark:bg-stellar-blue p-8 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-indigo-500" /> What everyone's saying
                    </h3>
                    <div className="text-xs text-silver-mist bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                        AI Summarized from 42 comments
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 min-h-[150px]">
                    {WORD_CLOUD.map((word, idx) => (
                        <motion.span
                            key={idx}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.05, type: 'spring' }}
                            className={`${word.size} ${word.color} font-black cursor-default hover:scale-110 transition-transform select-none opacity-80 hover:opacity-100`}
                        >
                            {word.text}
                        </motion.span>
                    ))}
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
