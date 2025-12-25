"use client";

import React, { useState, useEffect } from 'react';
import {
    CalendarDays,
    Sun,
    Umbrella,
    Snowflake,
    AlertTriangle,
    Users
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis
} from 'recharts';
import { leaveForecasting } from '@/lib/services/ai-automation-client';

// --- MOCK DATA ---

const FORECAST_DATA = [
    { date: 'Oct 01', actual: 12, predicted: 14, capacity: 95 },
    { date: 'Oct 08', actual: 15, predicted: 16, capacity: 92 },
    { date: 'Oct 15', actual: 10, predicted: 12, capacity: 96 },
    { date: 'Oct 22', actual: 25, predicted: 18, capacity: 88 }, // Spike
    { date: 'Oct 29', actual: null, predicted: 35, capacity: 80 }, // Halloween/Diwali spike
    { date: 'Nov 05', actual: null, predicted: 15, capacity: 94 },
    { date: 'Nov 12', actual: null, predicted: 12, capacity: 95 },
    { date: 'Nov 19', actual: null, predicted: 45, capacity: 75 }, // Thanksgiving week
    { date: 'Nov 26', actual: null, predicted: 10, capacity: 98 },
    { date: 'Dec 03', actual: null, predicted: 15, capacity: 94 },
    { date: 'Dec 10', actual: null, predicted: 20, capacity: 90 },
    { date: 'Dec 17', actual: null, predicted: 60, capacity: 60 }, // Christmas start
    { date: 'Dec 24', actual: null, predicted: 85, capacity: 20 }, // Christmas peak
];

const SEASONAL_DATA = [
    { subject: 'Sick Leave', A: 120, B: 110, fullMark: 150 },
    { subject: 'Casual', A: 98, B: 130, fullMark: 150 },
    { subject: 'Vacation', A: 86, B: 130, fullMark: 150 },
    { subject: 'Maternity', A: 40, B: 40, fullMark: 150 }, // Constant
    { subject: 'Unpaid', A: 20, B: 25, fullMark: 150 },
    { subject: 'Wfh', A: 65, B: 85, fullMark: 150 },
];

const CRITICAL_DAYS = [
    { date: 'Dec 24, 2025', reason: 'High Vacation (Christmas)', shortage: '-15 Staff', status: 'Critical' },
    { date: 'Nov 20, 2025', reason: 'Conference + Sick Trend', shortage: '-5 Staff', status: 'Warning' },
    { date: 'Oct 29, 2025', reason: 'Regional Holiday Bridge', shortage: '-8 Staff', status: 'Warning' },
];

// --- COMPONENTS ---

export default function LeaveForecastingPage() {
    const [forecastData, setForecastData] = useState<any[]>(FORECAST_DATA);
    const [peakPeriods, setPeakPeriods] = useState<any[]>(CRITICAL_DAYS);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchForecast();
    }, []);

    const fetchForecast = async () => {
        try {
            const [forecastResult, peakResult, recommendationsResult] = await Promise.all([
                leaveForecasting.getForecast(),
                leaveForecasting.getPeakPeriods(),
                leaveForecasting.getRecommendations(),
            ]);

            if (forecastResult.success) {
                setForecastData(forecastResult.data?.forecast || FORECAST_DATA);
            }
            if (peakResult.success) {
                setPeakPeriods(peakResult.data?.peakPeriods || CRITICAL_DAYS);
            }
            if (recommendationsResult.success) {
                setRecommendations(recommendationsResult.data?.recommendations || []);
            }
        } catch (error) {
            console.error('Error fetching leave forecasting data:', error);
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
                        <CalendarDays className="w-6 h-6 text-indigo-500" />
                        Leave Forecasting
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Predict absenteeism and optimize workforce capacity.</p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Main Forecast Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" />
                        Absence Forecast (Next 90 Days)
                    </h2>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecastData}>
                                <defs>
                                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} label={{ value: '% Absent', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="actual" name="Historical Actual" stroke="#10b981" fillOpacity={1} fill="url(#colorActual)" strokeWidth={2} />
                                <Area type="monotone" dataKey="predicted" name="AI Forecast" stroke="#6366f1" fillOpacity={1} fill="url(#colorPredicted)" strokeWidth={2} strokeDasharray="5 5" />
                                <Area type="monotone" dataKey="capacity" name="Capacity Available" stroke="#f59e0b" fill="none" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Seasonal Radar */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4">Seasonal Pattern Analysis</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius={90} data={SEASONAL_DATA}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar name="Winter Pattern" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                <Radar name="Summer Pattern" dataKey="B" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex gap-2 justify-center">
                        <div className="flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                            <Snowflake className="w-4 h-4" /> Winter
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">
                            <Sun className="w-4 h-4" /> Summer
                        </div>
                    </div>
                </div>

            </div>

            {/* 3. Critical Shortage Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-rose-800 dark:text-rose-400 flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5" />
                        Predicted Staff Shortages
                    </h3>
                    <div className="space-y-3">
                        {peakPeriods.map((day, i) => (
                            <div key={i} className="bg-white dark:bg-black/20 p-3 rounded-lg flex items-center justify-between border border-rose-100 dark:border-rose-900/50">
                                <div>
                                    <div className="text-sm font-bold text-rose-900 dark:text-rose-300">{day.date}</div>
                                    <div className="text-xs text-rose-700 dark:text-rose-400/80">{day.reason}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-rose-600">{day.shortage}</div>
                                    <div className="text-[10px] bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-100 px-2 py-0.5 rounded-full inline-block">{day.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-400 flex items-center gap-2 mb-4">
                        <Umbrella className="w-5 h-5" />
                        Capacity Optimization
                    </h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-4">
                        AI recommends the following actions to mitigate predicted shortages:
                    </p>
                    <ul className="space-y-3">
                        <li className="flex gap-3 text-sm text-indigo-900 dark:text-indigo-200">
                            <div className="w-5 h-5 bg-indigo-200 dark:bg-indigo-700 rounded flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                            <span>Enable <strong>Overtime Bonus (1.5x)</strong> for Dec 20-24 to attract volunteers.</span>
                        </li>
                        <li className="flex gap-3 text-sm text-indigo-900 dark:text-indigo-200">
                            <div className="w-5 h-5 bg-indigo-200 dark:bg-indigo-700 rounded flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                            <span>Limit discretionary leave approval for <strong>Support Team</strong> during Nov 18-22.</span>
                        </li>
                        <li className="flex gap-3 text-sm text-indigo-900 dark:text-indigo-200">
                            <div className="w-5 h-5 bg-indigo-200 dark:bg-indigo-700 rounded flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                            <span>Activate <strong>On-Call Roster</strong> for Q4 peak days.</span>
                        </li>
                    </ul>
                    <button className="mt-6 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors">
                        Auto-Apply Recommendations
                    </button>
                </div>
            </div>

        </div>
    );
}
