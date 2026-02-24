"use client";

import React, { useState, useEffect } from 'react';
import {
    Activity,
    Heart,
    Footprints,
    Flame,
    Trophy,
    Calendar,
    ArrowRight,
    Smile,
    Meh,
    Frown,
    Sun,
    Moon,
    Play,
    Loader2
} from 'lucide-react';
import { WellnessAnalyticsService } from '../services';
import {
    RadialBarChart,
    RadialBar,
    Legend,
    ResponsiveContainer,
    Tooltip,
    PolarAngleAxis
} from 'recharts';

// --- MOCK DATA ---

const ACTIVITY_DATA = [
    { name: 'Move', value: 80, fill: '#f43f5e' }, // Red
    { name: 'Exercise', value: 65, fill: '#10b981' }, // Green
    { name: 'Stand', value: 90, fill: '#3b82f6' }, // Blue
];

const CHALLENGES = [
    { id: '1', title: 'Step Master', target: '10k Steps', daysLeft: 5, participants: 124, progress: 75, color: 'bg-rose-500' },
    { id: '2', title: 'Hydration Hero', target: '2L Water', daysLeft: 12, participants: 89, progress: 40, color: 'bg-cyan-500' },
    { id: '3', title: 'Zen Mind', target: '10m Meditation', daysLeft: 2, participants: 56, progress: 90, color: 'bg-violet-500' },
];

const WELLNESS_RESOURCES = [
    { id: '1', title: 'Morning Flow Yoga', duration: '15 min', instructor: 'Sarah J.', category: 'Movement', color: 'bg-amber-100 text-amber-600' },
    { id: '2', title: 'Deep Focus Music', duration: '45 min', instructor: 'Audio', category: 'Focus', color: 'bg-indigo-100 text-indigo-600' },
    { id: '3', title: 'Stress Relief Guide', duration: '5 min read', instructor: 'Dr. Ali', category: 'Mental Health', color: 'bg-emerald-100 text-emerald-600' },
];

const MOODS = [
    { value: 1, icon: Frown, label: 'Stressed', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { value: 2, icon: Meh, label: 'Okay', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { value: 3, icon: Smile, label: 'Good', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { value: 4, icon: Sun, label: 'Great', color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { value: 5, icon: Heart, label: 'Amazing', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
];

export default function WellnessDashboardPage() {
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await WellnessAnalyticsService.getMetrics();
                setMetrics(data as any);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Activity className="w-6 h-6 text-rose-500" />
                        Wellness Hub
                    </h1>
                    <p className="text-silver-mist text-sm">Track your health, join challenges, and stay balanced.</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg">
                    <Trophy className="w-4 h-4" />
                    <span>Rank: #42 in Step Challenge</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Mood Tracker */}
                <div className="lg:col-span-2 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h3 className="font-bold text-ink-black dark:text-pearl mb-4">How are you feeling today?</h3>
                    <div className="grid grid-cols-5 gap-2 md:gap-3">
                        {MOODS.map((mood) => (
                            <button
                                key={mood.value}
                                onClick={() => setSelectedMood(mood.value)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all border-2 ${selectedMood === mood.value
                                        ? `border-current ${mood.color} scale-105 shadow-md`
                                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 text-slate-400'
                                    }`}
                            >
                                <div className={`p-3 rounded-full ${selectedMood === mood.value ? mood.bg : ''}`}>
                                    <mood.icon className={`w-8 h-8 ${selectedMood === mood.value ? 'fill-current' : ''}`} />
                                </div>
                                <span className={`text-xs font-bold ${selectedMood === mood.value ? 'opacity-100' : 'opacity-0'}`}>
                                    {mood.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Activity Rings (Visual Placeholder using Recharts or custom SVG) */}
                <div className="lg:col-span-1 bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -ml-10 -mb-10" />

                    <h3 className="absolute top-6 left-6 font-bold flex items-center gap-2">
                        <Flame className="w-4 h-4 text-rose-500" />
                        Activity
                    </h3>

                    {/* Simple Custom SVG Rings for cleaner look than Recharts default */}
                    <div className="relative w-48 h-48">
                        {/* Ring 1: Move (Red) */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="50%" cy="50%" r="40%" fill="transparent" stroke="#334155" strokeWidth="12" />
                            <circle cx="50%" cy="50%" r="40%" fill="transparent" stroke="#f43f5e" strokeWidth="12" strokeDasharray="251" strokeDashoffset={251 * (1 - 0.8)} strokeLinecap="round" />
                        </svg>
                        {/* Ring 2: Exercise (Green) */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90 scale-75">
                            <circle cx="50%" cy="50%" r="40%" fill="transparent" stroke="#334155" strokeWidth="16" />
                            <circle cx="50%" cy="50%" r="40%" fill="transparent" stroke="#10b981" strokeWidth="16" strokeDasharray="200" strokeDashoffset={200 * (1 - 0.65)} strokeLinecap="round" />
                        </svg>
                        {/* Ring 3: Stand (Blue) */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90 scale-50">
                            <circle cx="50%" cy="50%" r="40%" fill="transparent" stroke="#334155" strokeWidth="24" />
                            <circle cx="50%" cy="50%" r="40%" fill="transparent" stroke="#3b82f6" strokeWidth="24" strokeDasharray="150" strokeDashoffset={150 * (1 - 0.9)} strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="grid grid-cols-3 gap-3 w-full mt-6 text-center">
                        <div>
                            <div className="text-xs text-slate-400">Move</div>
                            <div className="font-bold text-rose-500">400</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-400">Exercise</div>
                            <div className="font-bold text-emerald-500">30m</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-400">Stand</div>
                            <div className="font-bold text-blue-500">12h</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Active Challenges */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            Active Challenges
                        </h3>
                        <button className="text-xs font-bold text-celestial-indigo hover:underline">View All</button>
                    </div>

                    <div className="space-y-4">
                        {CHALLENGES.map(challenge => (
                            <div key={challenge.id} className="p-4 bg-slate-50 dark:bg-deep-cosmos/50 rounded-xl border border-cloud dark:border-nebula-purple/20">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-bold text-ink-black dark:text-pearl">{challenge.title}</div>
                                        <div className="text-xs text-silver-mist">Target: {challenge.target}</div>
                                    </div>
                                    <div className="text-xs font-medium px-2 py-1 bg-white dark:bg-slate-800 rounded text-slate-500 border border-slate-200 dark:border-slate-700">
                                        {challenge.daysLeft} days left
                                    </div>
                                </div>
                                <div className="relative pt-1">
                                    <div className="flex mb-2 items-center justify-between text-xs">
                                        <div className="text-emerald-500 font-bold">{challenge.progress}% Complete</div>
                                        <div className="text-silver-mist">{challenge.participants} joined</div>
                                    </div>
                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-200 dark:bg-slate-700">
                                        <div style={{ width: `${challenge.progress}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${challenge.color}`}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommended Resources */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <Heart className="w-5 h-5 text-emerald-500" />
                            For You
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {WELLNESS_RESOURCES.map(resource => (
                            <div key={resource.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 transition-colors rounded-xl cursor-pointer group">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${resource.color}`}>
                                    <Play className="w-5 h-5 fill-current" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-ink-black dark:text-pearl truncate">{resource.title}</div>
                                    <div className="flex items-center gap-2 text-xs text-silver-mist mt-1">
                                        <span>{resource.category}</span>
                                        <span className="w-1 h-1 rounded-full bg-silver-mist" />
                                        <span>{resource.duration}</span>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-celestial-indigo group-hover:border-celestial-indigo transition-colors">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        ))}

                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl mt-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-indigo-900 flex items-center justify-center text-indigo-600 shadow-sm">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Schedule a 1:1</div>
                                <div className="text-xs text-indigo-700 dark:text-indigo-300">Book time with a wellness coach</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

