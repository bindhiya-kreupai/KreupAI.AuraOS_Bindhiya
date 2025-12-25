"use client";

import React, { useState, useEffect } from 'react';
import {
    Activity,
    HeartPulse,
    BrainCircuit,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Users,
    Zap
} from 'lucide-react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Treemap,
    Cell
} from 'recharts';
import { orgHealthPredictor } from '@/lib/services/ai-automation-client';

const BURNOUT_DATA = [
    {
        name: 'Engineering',
        children: [
            { name: 'Frontend', size: 120, risk: 25 },
            { name: 'Backend', size: 150, risk: 45 }, // High Risk
            { name: 'DevOps', size: 40, risk: 65 }, // Critical
            { name: 'QA', size: 60, risk: 30 },
        ],
    },
    {
        name: 'Sales',
        children: [
            { name: 'Enterprise', size: 80, risk: 55 },
            { name: 'SMB', size: 100, risk: 40 },
        ],
    },
    {
        name: 'Product',
        children: [
            { name: 'Design', size: 30, risk: 15 },
            { name: 'PM', size: 40, risk: 35 },
        ],
    },
    {
        name: 'Marketing',
        children: [
            { name: 'Content', size: 25, risk: 10 },
            { name: 'Growth', size: 35, risk: 20 },
        ],
    },
];

const DRIVERS = [
    { name: 'Work-Life Balance', impact: 'Negative', score: -15, category: 'Culture' },
    { name: 'Manager Support', impact: 'Positive', score: +12, category: 'Leadership' },
    { name: 'Growth Opportunities', impact: 'Negative', score: -8, category: 'Career' },
    { name: 'Compensation', impact: 'Neutral', score: 0, category: 'Rewards' },
    { name: 'Team Collaboration', impact: 'Positive', score: +18, category: 'Culture' },
];

// --- COMPONENTS ---

// Custom Treemap Content
const CustomizedTreemapContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, risk } = props;

    // Color scale based on risk
    let fillColor = '#10b981'; // Green (Low Risk)
    if (risk > 30) fillColor = '#f59e0b'; // Amber (Medium)
    if (risk > 50) fillColor = '#ef4444'; // Red (High)

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: fillColor,
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {width > 50 && height > 30 && (
                <>
                    <text
                        x={x + width / 2}
                        y={y + height / 2 - 7}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={12}
                        fontWeight="bold"
                    >
                        {name}
                    </text>
                    <text
                        x={x + width / 2}
                        y={y + height / 2 + 7}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={10}
                        opacity={0.8}
                    >
                        Risk: {risk}%
                    </text>
                </>
            )}
        </g>
    );
};

export default function OrgHealthPredictorPage() {
    const [healthMetrics, setHealthMetrics] = useState<any>(null);
    const [predictions, setPredictions] = useState<any>(null);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [metricsResult, predictionsResult, recommendationsResult] = await Promise.all([
                orgHealthPredictor.getHealthMetrics(),
                orgHealthPredictor.getPredictions(),
                orgHealthPredictor.getRecommendations(),
            ]);

            if (metricsResult.success) {
                setHealthMetrics(metricsResult.data);
            }
            if (predictionsResult.success) {
                setPredictions(predictionsResult.data);
            }
            if (recommendationsResult.success) {
                setRecommendations(recommendationsResult.data?.recommendations || []);
            }
        } catch {
                    } finally {
            setLoading(false);
        }
    };

    const healthTrends = healthMetrics?.trends || [
        { month: 'Jan', score: 85, sentiment: 82, burnout: 15 },
        { month: 'Feb', score: 84, sentiment: 80, burnout: 18 },
        { month: 'Mar', score: 82, sentiment: 78, burnout: 22 },
        { month: 'Apr', score: 80, sentiment: 75, burnout: 25 },
        { month: 'May', score: 83, sentiment: 79, burnout: 20 },
        { month: 'Jun', score: 86, sentiment: 85, burnout: 14 },
        { month: 'Jul', score: 88, sentiment: 87, burnout: 12 },
    ];

    const drivers = recommendations.length > 0 ? recommendations : DRIVERS;

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <HeartPulse className="w-6 h-6 text-rose-500" />
                        Org Health Predictor
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Real-time organizational vitality analysis & risk forecasting.</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-800">
                    <Activity className="w-4 h-4" />
                    System Status: Healthy
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Health Score', value: '88/100', sub: '+2% vs last month', icon: HeartPulse, color: 'text-rose-500', bg: 'bg-rose-50' },
                    { label: 'Burnout Risk', value: '12%', sub: '-3% improvement', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Sentiment', value: 'Positive', sub: '87% approval rating', icon: BrainCircuit, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Attrition Risk', value: 'Low', sub: 'Predicted < 5%', icon: AlertTriangle, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${stat.bg} dark:bg-opacity-20`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-xs text-silver-mist font-medium uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-xl font-bold text-ink-black dark:text-pearl">{stat.value}</h3>
                            <p className={`text-xs ${stat.sub.includes('+') ? 'text-emerald-500' : stat.sub.includes('-') && stat.label === 'Burnout Risk' ? 'text-emerald-500' : 'text-slate-500'}`}>
                                {stat.sub}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Health Trends Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        12-Month Health Trend
                    </h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={healthTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="score" name="Overall Health" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="sentiment" name="Employee Sentiment" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                                <Line type="monotone" dataKey="burnout" name="Burnout Level" stroke="#f59e0b" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Key Drivers */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4">Key Health Drivers</h2>
                    <p className="text-xs text-silver-mist mb-6">Factors currently impacting organizational score positively or negatively.</p>

                    <div className="space-y-4">
                        {drivers.map((driver, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-1.5 h-8 rounded-full ${driver.impact === 'Positive' ? 'bg-emerald-500' : driver.impact === 'Negative' ? 'bg-rose-500' : 'bg-slate-300'}`} />
                                    <div>
                                        <h4 className="text-sm font-semibold text-ink-black dark:text-pearl group-hover:text-celestial-indigo transition-colors">{driver.name}</h4>
                                        <span className="text-[10px] uppercase font-bold text-silver-mist tracking-widest">{driver.category}</span>
                                    </div>
                                </div>
                                <div className={`text-sm font-bold ${driver.impact === 'Positive' ? 'text-emerald-600' : driver.impact === 'Negative' ? 'text-rose-600' : 'text-slate-500'}`}>
                                    {driver.score > 0 ? '+' : ''}{driver.score}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-cloud dark:border-nebula-purple/20">
                        <button className="w-full py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                            View All 24 Factors
                        </button>
                    </div>
                </div>

                {/* 3. Burnout Heatmap */}
                <div className="lg:col-span-3 bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                Departmental Burnout Heatmap
                            </h2>
                            <p className="text-xs text-silver-mist mt-1">Size = Employee Count, Color = Burnout Risk Level</p>
                        </div>
                        <div className="flex gap-4 text-xs font-bold text-silver-mist">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500" /> Low Risk</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-500" /> Medium Risk</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-500" /> High Risk</div>
                        </div>
                    </div>

                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <Treemap
                                data={BURNOUT_DATA}
                                dataKey="size"
                                aspectRatio={4 / 1}
                                stroke="#fff"
                                fill="#8884d8"
                                content={<CustomizedTreemapContent />}
                            >
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white dark:bg-stellar-blue p-3 rounded-lg shadow-xl border border-cloud dark:border-nebula-purple z-50 text-xs">
                                                    <p className="font-bold text-ink-black dark:text-pearl mb-1">{data.name}</p>
                                                    <p className="text-silver-mist">Employees: <span className="text-indigo-500 font-bold">{data.size}</span></p>
                                                    <p className="text-silver-mist">Burnout Risk: <span className={`font-bold ${data.risk > 50 ? &apos;text-rose-500' : 'text-emerald-500'}`}>{data.risk}%</span></p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </Treemap>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
