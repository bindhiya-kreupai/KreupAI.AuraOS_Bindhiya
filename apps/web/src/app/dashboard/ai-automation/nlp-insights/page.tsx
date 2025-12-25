"use client";

import React, { useState, useEffect } from 'react';
import {
    Languages,
    MessageSquareQuote,
    TrendingUp,
    Search,
    Filter,
    Smile,
    Frown,
    Meh
} from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ScatterChart,
    Scatter,
    ZAxis,
    Cell,
    LineChart,
    Line
} from 'recharts';
import { sentimentAnalysis } from '@/lib/services/ai-automation-client';

// --- MOCK DATA ---

const TOPIC_CLUSTERS = [
    { x: 10, y: 30, z: 200, name: 'Cafeteria Quality', sentiment: 'Negative', fill: '#ef4444' },
    { x: 50, y: 50, z: 400, name: 'Remote Policy', sentiment: 'Mixed', fill: '#f59e0b' },
    { x: 80, y: 20, z: 300, name: 'New Insurance', sentiment: 'Positive', fill: '#10b981' },
    { x: 30, y: 80, z: 150, name: 'Manager Feedback', sentiment: 'Negative', fill: '#ef4444' },
    { x: 70, y: 70, z: 250, name: 'Q4 Bonus', sentiment: 'Positive', fill: '#10b981' },
    { x: 90, y: 40, z: 100, name: 'IT Support', sentiment: 'Neutral', fill: '#64748b' },
];

const SENTIMENT_TREND = [
    { month: 'Week 1', positive: 65, negative: 15, neutral: 20 },
    { month: 'Week 2', positive: 62, negative: 18, neutral: 20 },
    { month: 'Week 3', positive: 58, negative: 25, neutral: 17 }, // Dip
    { month: 'Week 4', positive: 70, negative: 10, neutral: 20 }, // Recovery
];

const POSITIVE_WORDS = [
    { text: 'Supportive', size: 60, color: '#10b981' },
    { text: 'Flexible', size: 50, color: '#10b981' },
    { text: 'Growth', size: 45, color: '#34d399' },
    { text: 'Collaboration', size: 40, color: '#34d399' },
    { text: 'Benefits', size: 30, color: '#6ee7b7' },
];

const NEGATIVE_WORDS = [
    { text: 'Burnout', size: 55, color: '#ef4444' },
    { text: 'Micromanagement', size: 45, color: '#ef4444' },
    { text: 'Salary', size: 40, color: '#f87171' },
    { text: 'Tools', size: 35, color: '#f87171' },
    { text: 'Communication', size: 30, color: '#fca5a5' },
];

// --- COMPONENTS ---

export default function NLPInsightsPage() {
    const [sentimentData, setSentimentData] = useState<any>(null);
    const [trends, setTrends] = useState<any[]>(SENTIMENT_TREND);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSentiment();
    }, []);

    const fetchSentiment = async () => {
        try {
            const [sentimentResult, trendsResult] = await Promise.all([
                sentimentAnalysis.getSentiment(),
                sentimentAnalysis.getTrends(),
            ]);

            if (sentimentResult.success) {
                setSentimentData(sentimentResult.data);
            }
            if (trendsResult.success) {
                setTrends(trendsResult.data?.trends || SENTIMENT_TREND);
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Languages className="w-6 h-6 text-indigo-500" />
                        NLP Insights
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Sentiment analysis & topic modelling from employee feedback.</p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-silver-mist font-bold uppercase">Overall Sentiment</p>
                        <h3 className="text-3xl font-bold text-emerald-500">Positive</h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                        <Smile className="w-6 h-6 text-emerald-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-silver-mist font-bold uppercase">Sources Analyzed</p>
                        <h3 className="text-3xl font-bold text-ink-black dark:text-pearl">1,240</h3>
                        <p className="text-[10px] text-slate-500">Surveys, Emails, Slack</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
                        <MessageSquareQuote className="w-6 h-6 text-indigo-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-silver-mist font-bold uppercase">Emerging Themes</p>
                        <h3 className="text-3xl font-bold text-amber-500">3</h3>
                        <p className="text-[10px] text-slate-500">Requires Attention</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-amber-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Review Source & Trend */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4">Sentiment Trend (Last 30 Days)</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={SENTIMENT_TREND}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={3} />
                                <Line type="monotone" dataKey="neutral" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" />
                                <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Topic Clusters (Bubble/Scatter) */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4">Feedback Topic Clusters</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis type="number" dataKey="x" name="Frequency" unit="" hide />
                                <YAxis type="number" dataKey="y" name="Impact" unit="" hide />
                                <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Volume" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white p-2 border border-slate-200 shadow-lg rounded text-xs">
                                                    <p className="font-bold">{data.name}</p>
                                                    <p>Sentiment: {data.sentiment}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Scatter name="Topics" data={TOPIC_CLUSTERS} fill="#8884d8">
                                    {TOPIC_CLUSTERS.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 text-xs font-bold text-silver-mist mt-2">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full" /> Positive</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full" /> Mixed</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-500 rounded-full" /> Negative</span>
                    </div>
                </div>

                {/* 3. Word Clouds (Simulated with text sizing) */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative overflow-hidden">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4 text-emerald-600">Positive Keyword Cloud</h2>
                    <div className="flex flex-wrap items-center justify-center gap-4 h-[200px]">
                        {POSITIVE_WORDS.map((word, i) => (
                            <span
                                key={i}
                                style={{ fontSize: `${word.size * 0.6}px`, color: word.color, opacity: 0.8 }}
                                className="font-bold leading-none cursor-default hover:opacity-100 transition-opacity"
                            >
                                {word.text}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative overflow-hidden">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4 text-rose-600">Negative Keyword Cloud</h2>
                    <div className="flex flex-wrap items-center justify-center gap-4 h-[200px]">
                        {NEGATIVE_WORDS.map((word, i) => (
                            <span
                                key={i}
                                style={{ fontSize: `${word.size * 0.6}px`, color: word.color, opacity: 0.8 }}
                                className="font-bold leading-none cursor-default hover:opacity-100 transition-opacity"
                            >
                                {word.text}
                            </span>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
}
