"use client";

import React, { useState, useEffect } from 'react';
import { CompetencyService } from '../core/services';
import {
    Target,
    Zap,
    BookOpen,
    Users,
    TrendingUp,
    AlertTriangle,
    ArrowUpRight,
    Search,
    Filter,
    ChevronRight,
    BrainCircuit,
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
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';

export default function SkillsGapPage() {
    const [selectedMember, setSelectedMember] = useState('My Profile');
    const [loading, setLoading] = useState(true);
    const [competencies, setCompetencies] = useState<any[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await CompetencyService.getCompetencies();
                setCompetencies(data);
            } catch (error) {
                console.error('Failed to load skills data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Build radar data from competencies
    const skillGapData = competencies.slice(0, 6).map(c => ({
        subject: c.name || c.code || 'Skill',
        A: 3, // Current skill (placeholder - would come from employee assessment)
        B: 4, // Required level (placeholder - would come from job competency map)
        fullMark: 5,
    }));

    // Default data if no competencies
    const displayData = skillGapData.length > 0 ? skillGapData : [
        { subject: 'No data', A: 0, B: 0, fullMark: 5 },
    ];

    const criticalGaps = displayData.filter(s => s.B - s.A >= 2);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Target className="w-6 h-6 text-rose-500" />
                        Skills Gap Analysis
                    </h1>
                    <p className="text-silver-mist text-sm">Identify competency voids and bridge them with targeted training.</p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 px-3 py-1.5 rounded-xl">
                    <Users className="w-4 h-4 text-slate-400" />
                    <select
                        className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                        value={selectedMember}
                        onChange={(e) => setSelectedMember(e.target.value)}
                    >
                        <option>My Profile</option>
                        <option>Team: Engineering</option>
                        <option>Team: Product</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Radar Chart */}
                <div className="lg:col-span-1 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col">
                    <h3 className="font-bold text-ink-black dark:text-pearl mb-2 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" /> Proficiency Radar
                    </h3>
                    <p className="text-xs text-silver-mist mb-6">Comparing your current skill levels vs role expectations.</p>

                    <div className="flex-1 min-h-[300px] w-full relative">
                        {competencies.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <Target className="w-10 h-10 mb-2 opacity-30" />
                                <p className="text-sm">No competency data available</p>
                                <p className="text-xs mt-1">Add competencies to see radar analysis</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={displayData}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                                    <Radar name="Current Skill" dataKey="A" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.3} />
                                    <Radar name="Required Level" dataKey="B" stroke="#ec4899" strokeWidth={2} fill="#ec4899" fillOpacity={0.1} strokeDasharray="4 4" />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Middle: Critical Gaps */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-rose-500" /> Critical Gaps ({criticalGaps.length})
                        </h3>
                        {criticalGaps.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4">No critical skill gaps detected</p>
                        ) : (
                            <div className="space-y-4">
                                {criticalGaps.map((skill, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm font-bold mb-1">
                                            <span>{skill.subject}</span>
                                            <span className="text-rose-500">-{skill.B - skill.A} Levels</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(skill.A / 5) * 100}%` }}></div>
                                            <div className="h-full bg-rose-200 dark:bg-rose-900/30 rounded-r-full border-l border-white dark:border-slate-800" style={{ width: `${((skill.B - skill.A) / 5) * 100}%` }}></div>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-silver-mist mt-1">
                                            <span>Current: {skill.A}/5</span>
                                            <span>Target: {skill.B}/5</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-lg border border-indigo-500/30 text-white">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <BrainCircuit className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase">AI Insight</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed">
                            {competencies.length > 0
                                ? `Analyzing ${competencies.length} competencies in your framework. Complete skill assessments to receive personalized recommendations.`
                                : 'Add competencies and complete assessments to receive AI-powered skill development recommendations.'}
                        </p>
                    </div>
                </div>

                {/* Right: Learning Path */}
                <div className="lg:col-span-1 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col">
                    <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-500" /> Learning Path
                    </h3>

                    <div className="flex flex-col items-center justify-center flex-1 py-8 text-slate-400">
                        <BookOpen className="w-10 h-10 mb-2 opacity-30" />
                        <p className="text-sm font-medium">No training recommendations yet</p>
                        <p className="text-xs mt-1 text-center">Complete skill assessments to get personalized learning paths</p>
                    </div>

                    <button className="w-full mt-4 py-2 border border-cloud dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        View Full Catalog
                    </button>
                </div>
            </div>

            {/* Bottom: Team Heatmap (Manager View) */}
            <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" /> Team Proficiency Matrix
                    </h3>
                    <div className="text-xs text-silver-mist italic">
                        Based on competency assessments
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Users className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm font-medium">No team proficiency data available</p>
                    <p className="text-xs mt-1">Team members need to complete skill assessments</p>
                </div>
            </div>
        </div>
    );
}
