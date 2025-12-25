"use client";

import React, { useState, useEffect } from 'react';
import {
    Crown,
    Users,
    TrendingUp,
    Lightbulb,
    Target,
    ArrowUpRight,
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    Calendar,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CourseService } from '../services';

// --- MOCK DATA ---

const SUCCESSION_PIPELINE = [
    {
        role: 'Chief Technology Officer',
        incumbent: 'David Chen',
        readiness: 85,
        successors: [
            { id: 1, name: 'Sarah Jenkins', title: 'VP Engineering', readiness: 'Ready Now', fit: 92, avatar: 'SJ' },
            { id: 2, name: 'Mike Ross', title: 'Dir of Architecture', readiness: 'Ready in 1-2 Yrs', fit: 78, avatar: 'MR' }
        ]
    },
    {
        role: 'VP of Product',
        incumbent: 'Jessica Wu',
        readiness: 60,
        successors: [
            { id: 3, name: 'Alice Thompson', title: 'Sr Product Lead', readiness: 'Ready in 1-2 Yrs', fit: 85, avatar: 'AT' }
        ]
    }
];

const MENTORS = [
    { id: 1, name: 'Dr. Robert Ford', role: 'Head of AI', expertise: ['AI Strategy', 'Leadership'], mentees: 2, capacity: 3, avatar: 'RF' },
    { id: 2, name: 'Elena Fisher', role: 'CMO', expertise: ['Brand Building', 'Public Speaking'], mentees: 3, capacity: 3, avatar: 'EF' },
    { id: 3, name: 'Nathan Drake', role: 'VP Operations', expertise: ['Process Optimization', 'Scale'], mentees: 1, capacity: 4, avatar: 'ND' }
];

const HIPOS = [
    { id: 1, name: 'Sarah Jenkins', role: 'VP Engineering', potential: 'High', performance: 'Exceeds', risk: 'Low' },
    { id: 2, name: 'Mike Ross', role: 'Dir of Arch', potential: 'High', performance: 'Meets', risk: 'Medium' },
    { id: 3, name: 'Alice Thompson', role: 'Sr PM', potential: 'Medium', performance: 'Exceeds', risk: 'Low' },
];

export default function LeadershipPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await CourseService.getCourses();
                setData(result);
            } catch (error) {
            console.error('Error:', error);
                                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Crown className="w-6 h-6 text-amber-500" />
                        Leadership Development
                    </h1>
                    <p className="text-silver-mist text-sm">Manage succession planning, mentorship programs, and high-potential talent.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20">
                        <Users className="w-4 h-4" /> Add Successor
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-y-auto lg:overflow-visible">
                {/* Left: Succession Pipeline */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Pipeline Cards */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-500" /> Succession Pipeline
                            </h3>
                            <button className="text-xs font-bold text-indigo-500 hover:underline">View All Roles</button>
                        </div>

                        <div className="space-y-6">
                            {SUCCESSION_PIPELINE.map((pos, idx) => (
                                <div key={idx} className="border border-cloud dark:border-slate-800 rounded-xl overflow-hidden">
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-cloud dark:border-slate-800 flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-ink-black dark:text-pearl">{pos.role}</div>
                                            <div className="text-xs text-silver-mist">Incumbent: {pos.incumbent}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold uppercase text-silver-mist">Plan Readiness</div>
                                            <div className={`font-bold ${pos.readiness >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{pos.readiness}%</div>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {pos.successors.map(succ => (
                                            <div key={succ.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">
                                                        {succ.avatar}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-ink-black dark:text-pearl group-hover:text-indigo-600 transition-colors">
                                                            {succ.name}
                                                        </div>
                                                        <div className="text-xs text-silver-mist">{succ.title}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs font-medium">
                                                    <span className={`px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 
                                                        ${succ.readiness === 'Ready Now' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'}
                                                    `}>
                                                        {succ.readiness}
                                                    </span>
                                                    <div className="text-right min-w-[60px]">
                                                        <span className="block font-bold text-indigo-500">{succ.fit}% Fit</span>
                                                    </div>
                                                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-opacity">
                                                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button className="w-full py-2 border border-dashed border-cloud dark:border-slate-700 rounded-lg text-xs font-bold text-slate-400 hover:text-indigo-500 hover:border-indigo-300 transition-colors flex items-center justify-center gap-2">
                                            <Users className="w-3 h-3" /> Add Candidate
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* HiPo Matrix (Simplified List View for now) */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <Target className="w-5 h-5 text-rose-500" /> High Potential (HiPo) Talent
                            </h3>
                            <div className="flex gap-2">
                                <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded">Top Talent</span>
                                <span className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded">Growth Star</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-silver-mist uppercase">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Employee</th>
                                        <th className="px-4 py-3">Potential</th>
                                        <th className="px-4 py-3">Performance</th>
                                        <th className="px-4 py-3 rounded-r-lg">Retention Risk</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-cloud dark:divide-slate-800">
                                    {HIPOS.map(emp => (
                                        <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                            <td className="px-4 py-3 font-bold text-ink-black dark:text-pearl">{emp.name} <span className="text-slate-400 font-normal text-xs">| {emp.role}</span></td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${emp.potential === 'High' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-slate-100 text-slate-500'}`}>
                                                    {emp.potential}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-bold">{emp.performance}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${emp.risk === 'Low' ? 'bg-emerald-500' : emp.risk === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                                                    <span className="text-xs">{emp.risk}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right: Mentorship Hub */}
                <div className="lg:col-span-1 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col">
                    <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" /> Mentorship Hub
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {MENTORS.map(mentor => (
                            <div key={mentor.id} className="p-4 rounded-xl border border-cloud dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 hover:border-amber-200 transition-colors group">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold">
                                        {mentor.avatar}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-ink-black dark:text-pearl">{mentor.name}</div>
                                        <div className="text-xs text-silver-mist">{mentor.role}</div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-3">
                                    {mentor.expertise.map(skill => (
                                        <span key={skill} className="text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-500 px-2 py-1 rounded border border-cloud dark:border-slate-700">
                                            {skill}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-cloud dark:border-slate-800">
                                    <span>Mentees: <strong className="text-ink-black dark:text-pearl">{mentor.mentees}/{mentor.capacity}</strong></span>
                                    <button className="text-amber-600 dark:text-amber-400 font-bold hover:underline">Request</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl text-white shadow-lg">
                        <div className="flex items-center gap-2 mb-2 font-bold">
                            <Briefcase className="w-4 h-4" />
                            <span>Executive Track</span>
                        </div>
                        <p className="text-xs opacity-90 mb-3 leading-relaxed">
                            Launch a new cohort for "Emerging Leaders" focusing on strategic thinking and P&L management.
                        </p>
                        <button className="w-full py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors">
                            Launch Program
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
