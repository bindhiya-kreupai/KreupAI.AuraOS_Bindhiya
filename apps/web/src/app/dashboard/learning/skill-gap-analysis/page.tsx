"use client";

import React, { useState, useEffect } from 'react';
import {
    Radar,
    Target,
    TrendingUp,
    AlertCircle
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
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Target className="w-6 h-6 text-indigo-500" />
                        Skill Gap Analysis
                    </h1>
                    <p className="text-slate-500 text-sm">Identify skill deficiencies and training needs.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Organizational Overview */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 lg:col-span-3">
                    <h3 className="font-bold text-lg mb-4">Organizational Competency Heatmap</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { skill: 'Cloud Architecture', level: 'High', color: 'bg-emerald-100 text-emerald-700' },
                            { skill: 'Data Security', level: 'Medium', color: 'bg-amber-100 text-amber-700' },
                            { skill: 'AI/ML Basic', level: 'Low', color: 'bg-rose-100 text-rose-700' },
                            { skill: 'Agile Process', level: 'High', color: 'bg-emerald-100 text-emerald-700' },
                        ].map((item, i) => (
                            <div key={i} className={`p-4 rounded-xl ${item.color} flex flex-col items-center justify-center text-center`}>
                                <div className="font-bold text-sm mb-1">{item.skill}</div>
                                <div className="text-xs font-bold uppercase opacity-80">{item.level} Proficiency</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Radar Chart Placeholder */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[300px] text-slate-400">
                    <Radar className="w-16 h-16 opacity-20 mb-4" />
                    <span className="font-bold">Skill Radar Chart Placeholder</span>
                </div>

                {/* Team Recommendations */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-4">Targeted Interventions</h3>
                    <div className="space-y-4">
                        {[
                            { team: 'Frontend Engineering', gap: 'Accessibility Standards', plan: 'Assign "Web Accessibility WCAG 2.1" Course', urgency: 'High' },
                            { team: 'Sales Team', gap: 'Negotiation Advanced', plan: 'Schedule workshop with external vendor', urgency: 'Medium' },
                            { team: 'Customer Support', gap: 'Technical Troubleshooting', plan: 'Create internal KB articles and quiz', urgency: 'Low' },
                        ].map((gap, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="mt-1"><AlertCircle className={`w-5 h-5 ${gap.urgency === 'High' ? 'text-rose-500' : 'text-amber-500'}`} /></div>
                                <div>
                                    <h4 className="font-bold text-sm">{gap.team}</h4>
                                    <div className="text-xs text-slate-500 mb-2">Gap: <span className="font-bold text-slate-700 dark:text-slate-300">{gap.gap}</span></div>
                                    <div className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded inline-block">Plan: {gap.plan}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
