'use client';

import React, { useState, useEffect } from 'react';
import {
    BookOpen, GraduationCap, Award, Play,
    CheckCircle2, AlertCircle, BarChart3,
    ChevronRight, Plus, RefreshCw, Zap,
    Bot, Sparkles, Layers, Users,
    TrendingUp, Target, FileText, Settings2,
    Smartphone, Globe, Shield, Clock,
    Star, Video, Puzzle, Route
} from 'lucide-react';
import { cn } from '@aura/ui/src/lib/utils';

// ── Mock Data ──────────────────────────────────────────────────────────
const LMS_STATS = [
    { title: 'Active Courses', value: '128', icon: BookOpen, color: 'indigo' },
    { title: 'Enrolled Learners', value: '1.4K', icon: Users, color: 'emerald' },
    { title: 'Certifications', value: '342', icon: Award, color: 'amber' },
    { title: 'Completion Rate', value: '84%', icon: TrendingUp, color: 'violet' },
    { title: 'Mobile Sessions', value: '38%', icon: Smartphone, color: 'rose' },
];

const COURSES = [
    { name: 'UAE Labour Law Fundamentals', type: 'SCORM 2004', duration: '4h', enrolled: 120, completed: 95, rating: 4.8, status: 'Live' },
    { name: 'Leadership Excellence Program', type: 'xAPI (Tin Can)', duration: '12h', enrolled: 45, completed: 28, rating: 4.6, status: 'Live' },
    { name: 'Data Privacy & PDPL Compliance', type: 'SCORM 1.2', duration: '2h', enrolled: 450, completed: 380, rating: 4.5, status: 'Live' },
    { name: 'Advanced Excel for HR Analytics', type: 'Video + Quiz', duration: '6h', enrolled: 85, completed: 42, rating: 4.7, status: 'Live' },
    { name: 'Ramadan Workplace Guidelines', type: 'Micro-learning', duration: '30m', enrolled: 350, completed: 340, rating: 4.9, status: 'Seasonal' },
];

const LEARNING_PATHS = [
    { name: 'HR Business Partner Track', courses: 8, duration: '40h', enrolled: 34, progress: 62, level: 'Advanced' },
    { name: 'New Manager Onboarding', courses: 5, duration: '20h', enrolled: 18, progress: 78, level: 'Intermediate' },
    { name: 'MENA Compliance Specialist', courses: 6, duration: '30h', enrolled: 22, progress: 45, level: 'Expert' },
    { name: 'Technical Skills Bootcamp', courses: 10, duration: '60h', enrolled: 56, progress: 35, level: 'Beginner → Expert' },
];

const SKILL_ASSESSMENTS = [
    { skill: 'Project Management', org: 3.8, benchmark: 4.0, gap: -0.2, assessments: 120, trend: 'up' },
    { skill: 'Data Analysis', org: 3.5, benchmark: 4.2, gap: -0.7, assessments: 95, trend: 'down' },
    { skill: 'Communication', org: 4.2, benchmark: 4.0, gap: 0.2, assessments: 200, trend: 'up' },
    { skill: 'Leadership', org: 3.9, benchmark: 4.5, gap: -0.6, assessments: 45, trend: 'stable' },
    { skill: 'Technical Proficiency', org: 4.1, benchmark: 4.0, gap: 0.1, assessments: 180, trend: 'up' },
    { skill: 'Arabic Business Writing', org: 3.2, benchmark: 4.0, gap: -0.8, assessments: 65, trend: 'stable' },
];

const CERTIFICATIONS = [
    { name: 'SHRM-CP', holders: 12, expiring: 3, provider: 'SHRM', validity: '3 years' },
    { name: 'CIPD Level 5', holders: 8, expiring: 1, provider: 'CIPD', validity: '5 years' },
    { name: 'UAE Labour Law', holders: 45, expiring: 8, provider: 'Internal', validity: '1 year' },
    { name: 'ISO 27001 Awareness', holders: 120, expiring: 15, provider: 'BSI', validity: '2 years' },
    { name: 'First Aid & Safety', holders: 85, expiring: 22, provider: 'Red Cross', validity: '2 years' },
];

export default function LearningCommandCenter() {
    const [activeTab, setActiveTab] = useState<'catalog' | 'paths' | 'skills' | 'certs'>('catalog');
    const [aiInsight, setAiInsight] = useState('');

    useEffect(() => {
        const insights = [
            'AI recommendation: 45 employees in Engineering lack "Cloud Architecture" skill — auto-enroll in AWS Fundamentals path.',
            'SCORM package "UAE Labour Law" has 99% completion. Schedule refresher by Q3 to maintain compliance.',
            'Mobile learning adoption up 24% this quarter. Top content: micro-learning modules under 15 minutes.',
            'Skill gap alert: "Arabic Business Writing" is 0.8 below benchmark. Recommend launching a targeted upskilling program.',
        ];
        setAiInsight(insights[Math.floor(Math.random() * insights.length)]);
    }, [activeTab]);

    const tabs = [
        { id: 'catalog', label: 'Course Catalog', icon: BookOpen },
        { id: 'paths', label: 'Learning Paths', icon: Route },
        { id: 'skills', label: 'Skill Assessment', icon: Target },
        { id: 'certs', label: 'Certifications', icon: Award },
    ];

    return (
        <div className="min-h-screen bg-ghost-white dark:bg-deep-space p-8 font-sans">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-violet-600 rounded-2xl shadow-lg shadow-violet-600/20">
                            <GraduationCap className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-ink-black dark:text-pearl tracking-tight uppercase italic">
                                Learning & Development
                            </h1>
                            <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">
                                SCORM/xAPI LMS • Skill Mapping • Certification Tracker • Mobile-First
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs font-bold text-ink-black dark:text-pearl hover:bg-slate-50 transition-all shadow-sm">
                        <Puzzle className="w-4 h-4" /> Import SCORM
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-violet-600/20 hover:bg-violet-700 active:scale-95 transition-all">
                        <Plus className="w-4 h-4" /> Create Course
                    </button>
                </div>
            </div>

            {/* AI Sentinel */}
            <div className="mb-8 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-[2rem] p-6 shadow-xl shadow-violet-600/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10"><Bot className="w-32 h-32" /></div>
                <div className="relative z-10 flex items-start gap-4">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><Sparkles className="w-5 h-5 text-white" /></div>
                    <div className="flex-1">
                        <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-1">Aura Learning Intelligence</h3>
                        <p className="text-sm text-white font-medium leading-relaxed">{aiInsight}</p>
                    </div>
                    <button className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/20 transition-all backdrop-blur-sm">Act Now</button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {LMS_STATS.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-8 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl p-1.5 shadow-sm w-fit">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                        className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all",
                            activeTab === tab.id ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}>
                        <tab.icon className="w-4 h-4" />{tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'catalog' && <CatalogTab />}
            {activeTab === 'paths' && <LearningPathsTab />}
            {activeTab === 'skills' && <SkillAssessmentTab />}
            {activeTab === 'certs' && <CertificationsTab />}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Course Catalog
// ═══════════════════════════════════════════════════════════════
function CatalogTab() {
    return (
        <div className="space-y-8">
            {/* SCORM/xAPI Engine */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/10 dark:to-violet-900/10 rounded-3xl p-8 border border-indigo-200/50 dark:border-indigo-800/20 mb-6">
                <div className="flex items-start gap-6">
                    <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                        <Puzzle className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-black text-ink-black dark:text-pearl uppercase tracking-tight mb-2">SCORM & xAPI Engine</h3>
                        <p className="text-xs text-silver-mist leading-relaxed mb-4 max-w-xl">
                            Full SCORM 1.2 / SCORM 2004 and xAPI (Tin Can) runtime. Auto-extracts metadata, tracks completion, bookmarks progress, and reports scores to Aura LRS. Supports offline mobile caching.
                        </p>
                        <div className="flex gap-4">
                            <div className="px-4 py-2 bg-white/80 dark:bg-slate-900/50 rounded-xl">
                                <p className="text-lg font-black text-ink-black dark:text-pearl">SCORM 2004</p>
                                <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">4th Edition</p>
                            </div>
                            <div className="px-4 py-2 bg-white/80 dark:bg-slate-900/50 rounded-xl">
                                <p className="text-lg font-black text-ink-black dark:text-pearl">xAPI 1.0.3</p>
                                <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">Tin Can</p>
                            </div>
                            <div className="px-4 py-2 bg-white/80 dark:bg-slate-900/50 rounded-xl">
                                <p className="text-lg font-black text-violet-600">cmi5</p>
                                <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">Supported</p>
                            </div>
                            <div className="px-4 py-2 bg-white/80 dark:bg-slate-900/50 rounded-xl">
                                <p className="text-lg font-black text-emerald-600">LRS</p>
                                <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">Built-In</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Table */}
            <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">Course Catalog</h2>
                    <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest">{COURSES.length} Courses</span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-cloud dark:border-nebula-purple/20">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900">
                                <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Course</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Format</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Duration</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Progress</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Rating</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cloud dark:divide-nebula-purple/10">
                            {COURSES.map((course, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer">
                                    <td className="px-6 py-5">
                                        <p className="font-bold text-sm text-ink-black dark:text-pearl group-hover:text-violet-600 transition-colors">{course.name}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={cn("text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                                            course.type.includes('SCORM') ? "bg-indigo-50 text-indigo-600" :
                                                course.type.includes('xAPI') ? "bg-violet-50 text-violet-600" :
                                                    "bg-slate-100 text-slate-500"
                                        )}>{course.type}</span>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-bold text-ink-black dark:text-pearl">{course.duration}</td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1.5 w-20 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(course.completed / course.enrolled) * 100}%` }} />
                                            </div>
                                            <span className="text-[10px] font-black text-silver-mist">{course.completed}/{course.enrolled}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                            <span className="text-sm font-black text-ink-black dark:text-pearl">{course.rating}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={cn("text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                                            course.status === 'Live' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                        )}>{course.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Learning */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: Smartphone, label: 'Mobile-First Delivery', desc: 'Responsive SCORM player, offline caching, push notifications for deadlines', color: 'rose' },
                        { icon: Video, label: 'Video Streaming', desc: 'Adaptive bitrate, chapter markers, in-video quizzes, subtitle support', color: 'indigo' },
                        { icon: Zap, label: 'Micro-Learning', desc: 'Bite-sized modules <15min, spaced repetition, gamified streaks', color: 'amber' },
                    ].map((item, i) => (
                        <div key={i} className="p-6 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-cloud dark:border-nebula-purple/10">
                            <div className={cn("inline-flex p-2.5 rounded-xl mb-3",
                                item.color === 'rose' ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600" :
                                    item.color === 'indigo' ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" :
                                        "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                            )}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <h4 className="font-black text-sm text-ink-black dark:text-pearl uppercase tracking-tight mb-1">{item.label}</h4>
                            <p className="text-xs text-silver-mist leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Learning Paths
// ═══════════════════════════════════════════════════════════════
function LearningPathsTab() {
    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <Route className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">Learning Paths</h2>
                            <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">Curated Journeys • Sequential Unlocking • Competency Mapping</p>
                        </div>
                        <button className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-600/20 active:scale-95 transition-all">+ Create Path</button>
                    </div>

                    <div className="space-y-4">
                        {LEARNING_PATHS.map((path, i) => (
                            <div key={i} className="p-6 bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border border-cloud dark:border-nebula-purple/10 hover:shadow-lg transition-all cursor-pointer group/path">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                                            <Route className="w-5 h-5 text-violet-600" />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm text-ink-black dark:text-pearl group-hover/path:text-violet-600 transition-colors">{path.name}</p>
                                            <p className="text-[10px] text-silver-mist font-bold uppercase tracking-widest">{path.courses} courses • {path.duration} • {path.enrolled} learners</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-black px-3 py-1 bg-violet-50 text-violet-600 rounded-full uppercase tracking-widest">{path.level}</span>
                                </div>
                                {/* Visual Path Progress */}
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: path.courses }).map((_, j) => (
                                        <React.Fragment key={j}>
                                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all",
                                                j < Math.floor(path.courses * (path.progress / 100))
                                                    ? "bg-violet-500 text-white border-violet-500"
                                                    : j === Math.floor(path.courses * (path.progress / 100))
                                                        ? "bg-violet-100 text-violet-600 border-violet-400 animate-pulse"
                                                        : "bg-slate-100 text-slate-400 border-slate-200"
                                            )}>
                                                {j < Math.floor(path.courses * (path.progress / 100)) ? '✓' : j + 1}
                                            </div>
                                            {j < path.courses - 1 && (
                                                <div className={cn("flex-1 h-0.5 rounded-full",
                                                    j < Math.floor(path.courses * (path.progress / 100)) ? "bg-violet-500" : "bg-slate-200"
                                                )} />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Skill Assessment
// ═══════════════════════════════════════════════════════════════
function SkillAssessmentTab() {
    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <Target className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">Skill Gap Analysis</h2>
                            <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">Org-Wide Assessment • Benchmark Comparison • AI Recommendations</p>
                        </div>
                        <button className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-600/20 active:scale-95 transition-all flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5" /> Run Assessment
                        </button>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-cloud dark:border-nebula-purple/20">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900">
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Skill</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Org Level</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Benchmark</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Gap</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Assessments</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-cloud dark:divide-nebula-purple/10">
                                {SKILL_ASSESSMENTS.map((skill, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                                        <td className="px-6 py-5 font-bold text-sm text-ink-black dark:text-pearl">{skill.skill}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-1.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(skill.org / 5) * 100}%` }} />
                                                </div>
                                                <span className="text-sm font-black text-ink-black dark:text-pearl">{skill.org}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-silver-mist">{skill.benchmark}</td>
                                        <td className="px-6 py-5">
                                            <span className={cn("text-sm font-black",
                                                skill.gap >= 0 ? "text-emerald-600" : skill.gap >= -0.5 ? "text-amber-600" : "text-rose-600"
                                            )}>{skill.gap > 0 ? '+' : ''}{skill.gap}</span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-ink-black dark:text-pearl">{skill.assessments}</td>
                                        <td className="px-6 py-5">
                                            <span className={cn("text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                                                skill.trend === 'up' ? "bg-emerald-50 text-emerald-600" :
                                                    skill.trend === 'down' ? "bg-rose-50 text-rose-600" :
                                                        "bg-slate-100 text-slate-500"
                                            )}>{skill.trend === 'up' ? '↑ Improving' : skill.trend === 'down' ? '↓ Declining' : '→ Stable'}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Certifications
// ═══════════════════════════════════════════════════════════════
function CertificationsTab() {
    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <Award className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">Certification Tracker</h2>
                            <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">Expiry Monitoring • Auto-Renewals • Compliance Linkage</p>
                        </div>
                        <button className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-600/20 active:scale-95 transition-all">+ Add Certification</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        <div className="p-5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-200/50 text-center">
                            <p className="text-3xl font-black text-emerald-600">342</p>
                            <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">Total Active</p>
                        </div>
                        <div className="p-5 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-200/50 text-center">
                            <p className="text-3xl font-black text-amber-600">49</p>
                            <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">Expiring < 90 Days</p>
                        </div>
                        <div className="p-5 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-200/50 text-center">
                            <p className="text-3xl font-black text-rose-600">8</p>
                            <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">Expired</p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-cloud dark:border-nebula-purple/20">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900">
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Certification</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Provider</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Holders</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Expiring Soon</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Validity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-cloud dark:divide-nebula-purple/10">
                                {CERTIFICATIONS.map((cert, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl"><Award className="w-4 h-4 text-amber-600" /></div>
                                                <span className="font-bold text-sm text-ink-black dark:text-pearl">{cert.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-silver-mist">{cert.provider}</td>
                                        <td className="px-6 py-5 text-sm font-black text-ink-black dark:text-pearl">{cert.holders}</td>
                                        <td className="px-6 py-5">
                                            <span className={cn("text-sm font-black",
                                                cert.expiring > 10 ? "text-rose-600" : cert.expiring > 0 ? "text-amber-600" : "text-emerald-600"
                                            )}>{cert.expiring}</span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-silver-mist">{cert.validity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Shared
// ═══════════════════════════════════════════════════════════════
function StatCard({ title, value, icon: Icon, color }: any) {
    const colorMap: Record<string, string> = {
        indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
        emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
        amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
        violet: "text-violet-600 bg-violet-50 dark:bg-violet-900/20",
        rose: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
    };
    return (
        <div className="bg-white dark:bg-stellar-blue rounded-3xl p-5 border border-cloud dark:border-nebula-purple/30 transition-all hover:shadow-xl group">
            <div className="flex items-center justify-between mb-3">
                <div className={cn("p-2.5 rounded-2xl", colorMap[color])}><Icon className="w-5 h-5" /></div>
            </div>
            <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest leading-none mb-1">{title}</p>
            <div className="text-2xl font-black text-ink-black dark:text-pearl group-hover:text-violet-600 transition-colors">{value}</div>
        </div>
    );
}
