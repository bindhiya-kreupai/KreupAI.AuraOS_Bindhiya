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
    BrainCircuit
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

// --- MOCK DATA ---

const SKILL_GAP_DATA = [
    { subject: 'React', A: 4, B: 5, fullMark: 5 },
    { subject: 'TypeScript', A: 3, B: 4, fullMark: 5 },
    { subject: 'Node.js', A: 3, B: 3, fullMark: 5 },
    { subject: 'System Design', A: 2, B: 4, fullMark: 5 },
    { subject: 'Leadership', A: 2, B: 3, fullMark: 5 },
    { subject: 'DevOps', A: 1, B: 3, fullMark: 5 },
];
// A: Employee (Actual), B: Role (Required)

const TEAM_HEATMAP = [
    { name: 'Alice', react: 5, node: 4, design: 3, lead: 2 },
    { name: 'Bob', react: 3, node: 4, design: 2, lead: 1 },
    { name: 'Charlie', react: 4, node: 3, design: 5, lead: 4 },
    { name: 'David', react: 2, node: 2, design: 1, lead: 1 },
    { name: 'Eve', react: 5, node: 5, design: 4, lead: 3 },
];

const RECOMMENDED_TRAINING = [
    {
        id: 1,
        title: 'Advanced System Architecture',
        provider: 'Udemy Business',
        duration: '12h 30m',
        gap: 'System Design',
        relevance: 95,
        type: 'Course'
    },
    {
        id: 2,
        title: 'DevOps for Frontend Engineers',
        provider: 'Internal L&D',
        duration: '4h Workshop',
        gap: 'DevOps',
        relevance: 88,
        type: 'Workshop'
    },
    {
        id: 3,
        title: 'Engineering Leadership 101',
        provider: 'Coursera',
        duration: '4 Weeks',
        gap: 'Leadership',
        relevance: 82,
        type: 'Program'
    }
];

export default function SkillsGapPage() {
    const [selectedMember, setSelectedMember] = useState('My Profile');

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
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SKILL_GAP_DATA}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                                <Radar
                                    name="Current Skill"
                                    dataKey="A"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fill="#6366f1"
                                    fillOpacity={0.3}
                                />
                                <Radar
                                    name="Required Level"
                                    dataKey="B"
                                    stroke="#ec4899"
                                    strokeWidth={2}
                                    fill="#ec4899"
                                    fillOpacity={0.1}
                                    strokeDasharray="4 4"
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Middle: Critical Gaps */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-rose-500" /> Critical Gaps (3)
                        </h3>
                        <div className="space-y-4">
                            {SKILL_GAP_DATA.filter(s => s.B - s.A >= 2).map((skill, idx) => (
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
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-lg border border-indigo-500/30 text-white">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <BrainCircuit className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase">AI Insight</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed">
                            "Focus on <strong className="text-amber-300">System Design</strong>. Improving this skill by 2 levels will increase your readiness for the <strong className="text-amber-300">Staff Engineer</strong> role by 40%."
                        </p>
                    </div>
                </div>

                {/* Right: Recommended Training */}
                <div className="lg:col-span-1 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col">
                    <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-500" /> Learning Path
                    </h3>

                    <div className="space-y-4 overflow-y-auto flex-1 pr-1">
                        {RECOMMENDED_TRAINING.map(course => (
                            <div key={course.id} className="p-4 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-slate-50/50 dark:bg-slate-900/20 hover:border-emerald-200 transition-colors group cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">
                                        {course.type}
                                    </span>
                                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                        {course.relevance}% Match
                                        <Zap className="w-3 h-3 fill-current" />
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm text-ink-black dark:text-pearl mb-1 group-hover:text-indigo-600 transition-colors">
                                    {course.title}
                                </h4>
                                <div className="text-xs text-silver-mist mb-3">
                                    By {course.provider} • {course.duration}
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-cloud dark:border-slate-800">
                                    <span className="text-[10px] text-slate-400 font-medium">Bridges: {course.gap}</span>
                                    <button className="p-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-indigo-600 transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
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
                        Based on last performance review cycle
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-silver-mist font-bold">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Employee</th>
                                <th className="px-4 py-3 text-center">React</th>
                                <th className="px-4 py-3 text-center">Node.js</th>
                                <th className="px-4 py-3 text-center">System Design</th>
                                <th className="px-4 py-3 text-center rounded-r-lg">Leadership</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cloud dark:divide-slate-800">
                            {TEAM_HEATMAP.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                    <td className="px-4 py-3 font-bold text-ink-black dark:text-pearl">{row.name}</td>
                                    {['react', 'node', 'design', 'lead'].map((key) => {
                                        // @ts-ignore
                                        const val = row[key];
                                        let bg = 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400';
                                        if (val >= 4) bg = 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400';
                                        else if (val === 3) bg = 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400';

                                        return (
                                            <td key={key} className="px-4 py-3 text-center">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${bg}`}>
                                                    {val}/5
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
