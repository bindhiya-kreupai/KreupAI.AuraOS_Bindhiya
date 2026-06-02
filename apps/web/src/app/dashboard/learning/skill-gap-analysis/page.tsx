"use client";

import React, { useState, useEffect } from 'react';
import {
    Radar,
    Target,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { SkillGapService } from '../services';

export default function SkillGapAnalysisPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await SkillGapService.getSkillGapAnalysis();
                setData(result);
            } catch (error: any) {
                console.error('Error:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Target className="w-6 h-6 text-indigo-500" />
                        Skill Gap Analysis
                    </h1>
                    <p className="text-slate-500 text-sm">Identify skill deficiencies and training needs.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Target className="w-12 h-12 mb-4 opacity-30" />
                    <p className="font-bold">No skill gap analyses found</p>
                    <p className="text-sm">Skill gap data will appear here once assessments are completed.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 lg:col-span-3">
                        <h3 className="font-bold text-lg mb-4">Competency Overview</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {data.slice(0, 4).map((item, i) => {
                                const skills = item.skills || [];
                                const avgGap = skills.length > 0
                                    ? Math.round(skills.reduce((s: number, sk: any) => s + (sk.gap || 0), 0) / skills.length)
                                    : 0;
                                const level = avgGap <= 1 ? 'High' : avgGap <= 2 ? 'Medium' : 'Low';
                                const color = level === 'High' ? 'bg-emerald-100 text-emerald-700' : level === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700';

                                return (
                                    <div key={item.id || i} className={`p-4 rounded-xl ${color} flex flex-col items-center justify-center text-center`}>
                                        <div className="font-bold text-sm mb-1">{item.employeeName || item.jobRoleTitle}</div>
                                        <div className="text-xs font-bold uppercase opacity-80">{level} Proficiency</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[300px] text-slate-400">
                        <Radar className="w-16 h-16 opacity-20 mb-4" />
                        <span className="font-bold">Skill Radar Chart Placeholder</span>
                    </div>

                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Targeted Interventions</h3>
                        <div className="space-y-4">
                            {data.map((gap, i) => (
                                <div key={gap.id || i} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div className="mt-1"><AlertCircle className="w-5 h-5 text-amber-500" /></div>
                                    <div>
                                        <h4 className="font-bold text-sm">{gap.employeeName || gap.jobRoleTitle}</h4>
                                        <div className="text-xs text-slate-500 mb-2">
                                            {(gap.skills || []).map((s: any) => s.skillName).join(', ') || 'Skills assessment pending'}
                                        </div>
                                        {gap.recommendedCourses && gap.recommendedCourses.length > 0 && (
                                            <div className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded inline-block">
                                                Recommended: {gap.recommendedCourses.join(', ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

